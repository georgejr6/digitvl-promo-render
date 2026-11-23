#!/usr/bin/env python3
"""QA a rendered Short: 1080x1920, 30-45 s, audio at -14 LUFS (+-1), no black/blank frames, key frames saved. Exit 1 on failure."""
import json, re, subprocess, sys
from pathlib import Path

src = Path(sys.argv[1])
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(src)], capture_output=True, text=True).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
a = [s for s in pr["streams"] if s["codec_type"] == "audio"]
dur = float(pr["format"]["duration"])
lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr)
bad = []
for t in (0.2, 1.0, dur * 0.3, dur * 0.5, dur * 0.7, dur - 0.5):
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1", "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"YAVG=([0-9.]+)", r.stderr + r.stdout)
    if m and float(m.group(1)) < 6:
        bad.append(round(t, 1))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1", str(src.with_name(f"{src.stem}_f{int(t * 10):03d}.jpg"))])
rep = {"file": src.name, "size": f"{v['width']}x{v['height']}", "seconds": round(dur, 2), "audio": bool(a), "lufs": float(lufs[-1]) if lufs else None, "black_frames_at": bad}
rep["ok"] = (rep["size"] == "1080x1920" and 30 <= dur <= 45 and rep["audio"] and rep["lufs"] is not None and abs(rep["lufs"] + 14) <= 1.0 and not bad)
src.with_name(src.stem + "_qa.json").write_text(json.dumps(rep, indent=1))
print(json.dumps(rep))
sys.exit(0 if rep["ok"] else 1)
