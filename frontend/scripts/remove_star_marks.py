#!/usr/bin/env python3
"""Remove the fixed lower-right sparkle from every SecureHome hero frame."""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import tempfile


MEDIA_DIR = Path(__file__).resolve().parents[1] / "public" / "media"
TARGETS = (
    MEDIA_DIR / "securehome-intro.mp4",
    MEDIA_DIR / "securehome-tail-loop.mp4",
    MEDIA_DIR / "securehome-poster.jpg",
)

# Measured against the original 1280 x 720 media. The box includes a soft
# margin so FFmpeg's interpolation can rebuild the smooth backdrop cleanly.
BASE_SIZE = (1280, 720)
STAR_BOX = (1122, 558, 78, 78)


def dimensions(path: Path) -> tuple[int, int]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    stream = json.loads(result.stdout)["streams"][0]
    return int(stream["width"]), int(stream["height"])


def scaled_box(width: int, height: int) -> tuple[int, int, int, int]:
    base_width, base_height = BASE_SIZE
    x, y, box_width, box_height = STAR_BOX
    return (
        round(x * width / base_width),
        round(y * height / base_height),
        round(box_width * width / base_width),
        round(box_height * height / base_height),
    )


def clean(path: Path) -> None:
    width, height = dimensions(path)
    x, y, box_width, box_height = scaled_box(width, height)
    suffix = path.suffix.lower()

    with tempfile.NamedTemporaryFile(
        prefix=f"{path.stem}-clean-", suffix=suffix, dir=path.parent, delete=False
    ) as temporary:
        output = Path(temporary.name)

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(path),
        "-vf",
        f"delogo=x={x}:y={y}:w={box_width}:h={box_height}:show=0",
    ]

    if suffix in {".mp4", ".mov", ".m4v"}:
        command += ["-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart"]
    else:
        command += ["-frames:v", "1", "-q:v", "2"]

    try:
        subprocess.run(command + [str(output)], check=True)
        os.replace(output, path)
    finally:
        output.unlink(missing_ok=True)

    print(f"cleaned {path.relative_to(MEDIA_DIR.parent.parent)} ({width}x{height})")


def main() -> None:
    missing = [path for path in TARGETS if not path.exists()]
    if missing:
        raise SystemExit("Missing hero media: " + ", ".join(str(path) for path in missing))

    for target in TARGETS:
        clean(target)


if __name__ == "__main__":
    main()
