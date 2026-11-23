#!/usr/bin/env python3
"""Design preview only: fake word timings (0.38 s/word) so Remotion stills can be checked without spending voice credits."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
for ep in sys.argv[1:]:
    src = json.loads((ROOT / "episodes" / f"{ep}.json").read_text(encoding="utf-8"))
    t, sents = 0.12, []
    for s in src["sentences"]:
        ws = []
        st = t
        for w in s["text"].split():
            ws.append([w, round(t, 3), round(t + 0.34, 3)]); t += 0.38
        sents.append({"text": s["text"], "scene": s["scene"], "start": round(st, 3), "end": round(t, 3), "words": ws}); t += 0.25
    end = sents[-1]["end"]
    out = ROOT / "public" / ep
    out.mkdir(parents=True, exist_ok=True)
    doc = {**{k: v for k, v in src.items() if k != "sentences"}, "fps": 30, "voice": "fake/voice.mp3", "voiceEnd": end, "totalFrames": int((end + 2.4) * 30), "sentences": sents}
    (out / "timing.json").write_text(json.dumps(doc), encoding="utf-8")
    print(ep, doc["totalFrames"] / 30)
