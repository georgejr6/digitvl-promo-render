#!/usr/bin/env python3
"""Queue rendered promo Shorts on the DIGITVL YouTube channel via the Novam Studio scheduler: private upload + publishAt (never immediate).
Uses the engine's post.py (duplicate guard + poll). Usage: python tools/publish.py --engine <digitvl-engine dir> dvs01=2026-11-23T17:00:00Z ...
Writes published.json. Description = promise line + UTM link + 3 hashtags + music credit (CC BY attribution) + Mixkit credit."""
import argparse, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--engine", required=True)
ap.add_argument("--video-dir", default=str(ROOT / "out"))
ap.add_argument("slots", nargs="+")
a = ap.parse_args()
sys.path.insert(0, a.engine); sys.path.insert(0, str(Path(a.engine) / "cloud"))
import post as P  # noqa: E402

email, pw = P.creds()
tok = P.call("POST", "/api/auth/login", body={"email": email, "password": pw})["token"]
brands = P.call("GET", "/api/brands", tok); brands = brands.get("brands", brands)
brand = next(b for b in brands if b["name"].strip().upper() == "DIGITVL")
out_f = ROOT / "published.json"
done = json.loads(out_f.read_text()) if out_f.exists() else {}
for item in a.slots:
    ep, slot = item.split("=")
    if ep in done:
        print(ep, "already queued", done[ep]["postId"]); continue
    e = json.loads((ROOT / "episodes" / f"{ep}.json").read_text(encoding="utf-8"))
    camp = "dvs-" + ep[3:]
    link = f"https://stores.digitvl.com?utm_source=youtube&utm_medium=short&utm_campaign={camp}"
    tags = " ".join(e["hashtags"]) + " #Shorts"
    desc = (f"{e['desc']}\n\nBuild your store: {link}\n\n{tags}\n\n{e['musicCredit']}\nMusic: Mixkit (Mixkit Stock Music Free License).\n"
            "Store shown is an example brand; product visuals are mockups.")
    title = (e["title"][:90] + " #Shorts")[:100]
    r = P.schedule_video(tok, brand, Path(a.video_dir) / f"{ep}.mp4", title, desc, slot)
    print(ep, slot, r["postId"], r["status"], r.get("ytId"), r.get("error") or "", flush=True)
    if r["status"] in ("PUBLISHED", "POSTING", "SCHEDULED"):
        done[ep] = {"postId": r["postId"], "publishAt": slot, "ytId": r.get("ytId"), "title": title, "campaign": camp}
        out_f.write_text(json.dumps(done, indent=1))
