#!/usr/bin/env python3
"""Rebuild the conceptual motion clips in public/motion from the still images
in public/images, using FFmpeg for a slow, silent Ken Burns–style pan/zoom.

Usage:
    python3 scripts/create-motion-studies.py

Requires an `ffmpeg` binary on PATH. Each clip is an 8 second, silent,
1280x720 H.264 MP4 built from a single still image.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "public" / "images"
MOTION_DIR = ROOT / "public" / "motion"

DURATION_SECONDS = 8
FPS = 30
WIDTH, HEIGHT = 1280, 720

# source still -> (output clip, zoom direction: "in" | "out")
CLIPS: list[tuple[str, str, str]] = [
    ("vision-narrative-fragments.webp", "vision-narrative-fragments.mp4", "in"),
    ("vision-product-motion.webp", "vision-product-motion.mp4", "out"),
    ("vision-abstract-studies.webp", "vision-abstract-studies.mp4", "in"),
    ("vision-brand-films.webp", "vision-brand-films.mp4", "out"),
]


def build_zoompan_filter(direction: str) -> str:
    total_frames = DURATION_SECONDS * FPS
    if direction == "in":
        zoom_expr = f"min(zoom+0.0007,1.15)"
    else:
        zoom_expr = f"if(eq(on,0),1.15,max(zoom-0.0007,1.0))"
    return (
        f"scale=3200:-1,"
        f"zoompan=z='{zoom_expr}':d={total_frames}:s={WIDTH}x{HEIGHT}:fps={FPS}"
    )


def main() -> int:
    if shutil.which("ffmpeg") is None:
        print("ffmpeg not found on PATH.", file=sys.stderr)
        return 1

    MOTION_DIR.mkdir(parents=True, exist_ok=True)

    for source_name, output_name, direction in CLIPS:
        source = IMAGES_DIR / source_name
        if not source.exists():
            print(f"skip: {source} not found", file=sys.stderr)
            continue

        output = MOTION_DIR / output_name
        vf = build_zoompan_filter(direction)
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", str(source),
            "-t", str(DURATION_SECONDS),
            "-vf", vf,
            "-an",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(output),
        ]
        print("rendering", output.name)
        subprocess.run(cmd, check=True, capture_output=True)

    print(f"done — {len(CLIPS)} clip(s) written to {MOTION_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
