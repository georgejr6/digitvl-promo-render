#!/usr/bin/env python3
"""Voice + timing for one promo episode (runs on GitHub Actions; needs ELEVENLABS_API_KEY).
Voice = the owner-approved "Mwosa 2026 Studio Narrator" recipe used by every DIGITVL Short (digitvl-engine/digitvl_engine/voice.py):
per-sentence ElevenLabs takes with previous/next context, cut to the spoken words using ElevenLabs' own character alignment
(so we know every word time exactly, no whisper), padded, then the light master (pitch 0.98, de-nasal EQ, light comp, -16 LUFS).
Usage: python tools/vo.py dvs01      -> public/dvs01/voice.mp3 + public/dvs01/timing.json
Raw takes are cached in cache/<ep>/ (re-running with unchanged text spends no credits)."""
import base64, hashlib, json, os, re, subprocess, sys, wave
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
VOICE_ID = "yNyuTGcqoxsMSZ8aSAz7"  # Mwosa 2026 Studio Narrator (owner-approved final voice)
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.65, "similarity_boost": 0.8, "style": 0.05, "use_speaker_boost": True, "speed": 0.9}
LEAD, PAD, PAD_TURN, FPS = 0.12, 0.34, 0.5, 30
MASTER = ("rubberband=pitch=0.98:formant=preserved,bass=g=2.5:f=130,equalizer=f=900:t=q:w=1:g=-2,equalizer=f=1400:t=q:w=1:g=-2,"
          "acompressor=threshold=-21dB:ratio=2:attack=20:release=250:makeup=1,loudnorm=I=-16:TP=-1.5:LRA=11")
TURN = re.compile(r"^(But|Here's|Now|Then|Stop|Nothing|You stay|You do)\b")


def spoken(text):
    """On-screen DIGITVL is pronounced 'Digital'; URLs are read out ('stores dot Digital dot com')."""
    t = re.sub(r"(?i)digitvl", "Digital", text)
    prev = None
    while prev != t:
        prev = t
        t = re.sub(r"(\w)\.(\w)", r"\1 dot \2", t)
    return t


def eleven(text, prev, nxt):
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    if prev: body["previous_text"] = prev
    if nxt: body["next_text"] = nxt
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps?output_format=mp3_44100_192",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def words_from_alignment(sp, al):
    ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    assert "".join(ch) == sp, ("alignment text mismatch", sp, "".join(ch))
    out, i = [], 0
    for m in re.finditer(r"\S+", sp):
        out.append((m.group(0), st[m.start()], en[m.end() - 1]))
    return out


def main(ep):
    src = json.loads((ROOT / "episodes" / f"{ep}.json").read_text(encoding="utf-8"))
    cache = ROOT / "cache" / ep
    cache.mkdir(parents=True, exist_ok=True)
    out = ROOT / "public" / ep
    out.mkdir(parents=True, exist_ok=True)
    sents = [s["text"] for s in src["sentences"]]
    sp = [spoken(s) for s in sents]
    parts, timing, t, chars = [], [], LEAD, 0
    for i, s in enumerate(sp):
        key = hashlib.sha1(json.dumps([s, sp[i - 1] if i else "", sp[i + 1] if i + 1 < len(sp) else "", VOICE_ID, SETTINGS], sort_keys=True).encode()).hexdigest()[:16]
        cj = cache / f"{i:02d}_{key}.json"
        if not cj.exists():
            cj.write_text(json.dumps(eleven(s, sp[i - 1] if i else "", sp[i + 1] if i + 1 < len(sp) else "")))
            chars += len(s)
        d = json.loads(cj.read_text())
        mp3 = cache / f"{i:02d}_{key}.mp3"
        mp3.write_bytes(base64.b64decode(d["audio_base64"]))
        w = words_from_alignment(s, d["alignment"])
        a, b = max(0.0, w[0][1] - 0.04), w[-1][2] + 0.10
        wav = cache / f"{i:02d}.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-af",
                        f"atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04:.3f}:d=0.04",
                        "-ac", "1", "-ar", "44100", str(wav)], check=True)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
        # authored tokens -> spoken tokens (a URL like stores.digitvl.com is ONE caption word, several spoken words)
        toks, k, cw = sents[i].split(), 0, []
        for tk in toks:
            n = len(spoken(tk).split())
            seg = w[k:k + n]; k += n
            cw.append([tk, round(t + seg[0][1] - a, 3), round(t + seg[-1][2] - a, 3)])
        timing.append({"text": sents[i], "scene": src["sentences"][i]["scene"], "start": round(t, 3), "end": round(t + dur, 3), "words": cw})
        parts.append((wav, dur))
        pad = PAD_TURN if i + 1 < len(sp) and TURN.match(sents[i + 1]) else PAD
        t += dur + (pad if i + 1 < len(sp) else 0.0)
        parts.append((None, pad if i + 1 < len(sp) else 0.0))
    joined = cache / "joined.wav"
    with wave.open(str(joined), "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(44100)
        o.writeframes(b"\x00\x00" * int(44100 * LEAD))
        for wav, dur in parts:
            if wav is None:
                o.writeframes(b"\x00\x00" * int(44100 * dur))
            else:
                with wave.open(str(wav), "rb") as r:
                    o.writeframes(r.readframes(r.getnframes()))
    mp3_out = out / "voice.mp3"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(joined), "-af", MASTER, "-ar", "44100", "-b:a", "192k", str(mp3_out)], check=True)
    real = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3_out)], capture_output=True, text=True).stdout)
    voice_end = timing[-1]["end"]
    hold = float(src.get("hold", 3.0))
    total = int(round((voice_end + hold) * FPS))
    doc = {**{k: v for k, v in src.items() if k != "sentences"}, "fps": FPS, "voice": f"{ep}/voice.mp3", "voiceEnd": voice_end, "mp3Seconds": round(real, 3),
           "totalFrames": total, "sentences": timing, "creditsSpent": chars}
    (out / "timing.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{ep}: voice {voice_end:.1f}s (mp3 {real:.1f}s), total {total / FPS:.1f}s, words {sum(len(x['words']) for x in timing)}, credits {chars}")


if __name__ == "__main__":
    main(sys.argv[1])
