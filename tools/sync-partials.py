#!/usr/bin/env python3
"""
sync-partials.py — keep the shared header/footer in sync across the site.

index.html is the single source of truth for the markup between:

    <!-- HEADER-START -->  ...  <!-- HEADER-END -->
    <!-- FOOTER-START -->  ...  <!-- FOOTER-END -->

Running this script copies those two regions from index.html into the same
marked regions of portfolio.html and pricing.html, inserting a one-line
"auto-synced" comment so those copies are not edited by hand.

Safe to run repeatedly (idempotent). If a marker is missing, duplicated, or
out of order in any of the three files, the script errors clearly on stderr
and writes nothing.

Usage:
    python3 tools/sync-partials.py            apply the sync
    python3 tools/sync-partials.py --check    report drift only, write nothing,
                                              exit non-zero if out of sync

Dependency-free: standard library only.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "index.html"
TARGETS = ("portfolio.html", "pricing.html")

# (start marker, end marker) for each region copied from SOURCE into TARGETS.
REGIONS = (
    ("<!-- HEADER-START -->", "<!-- HEADER-END -->"),
    ("<!-- FOOTER-START -->", "<!-- FOOTER-END -->"),
)

AUTO_SYNC_COMMENT = "<!-- AUTO-SYNCED FROM index.html — edit there, not here -->"


class SyncError(Exception):
    """A problem that means we must not write anything."""


def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise SyncError(f"{path.name}: file not found (looked in {path.parent})")


def marker_index(text: str, marker: str, file_name: str) -> int:
    count = text.count(marker)
    if count == 0:
        raise SyncError(f"{file_name}: required marker {marker!r} not found")
    if count > 1:
        raise SyncError(
            f"{file_name}: marker {marker!r} appears {count} times (expected exactly 1)"
        )
    return text.index(marker)


def inner_bounds(text: str, start_marker: str, end_marker: str, file_name: str) -> tuple[int, int]:
    """Character bounds of the text strictly between the two markers."""
    start = marker_index(text, start_marker, file_name) + len(start_marker)
    end = marker_index(text, end_marker, file_name)
    if end < start:
        raise SyncError(
            f"{file_name}: {end_marker!r} appears before {start_marker!r}"
        )
    return start, end


def canonical_regions(source_text: str) -> list[str]:
    """The inner text of each region as it appears in index.html."""
    regions = []
    for start_marker, end_marker in REGIONS:
        start, end = inner_bounds(source_text, start_marker, end_marker, SOURCE)
        regions.append(source_text[start:end])
    return regions


def apply_regions(target_text: str, source_regions: list[str], file_name: str) -> str:
    """Return target_text with each marked region replaced by the canonical one."""
    updated = target_text
    for (start_marker, end_marker), source_inner in zip(REGIONS, source_regions):
        start, end = inner_bounds(updated, start_marker, end_marker, file_name)
        # source_inner already starts and ends with a newline (it is the text
        # between the markers in index.html). Drop the auto-sync comment on its
        # own line directly under the START marker, then the canonical markup.
        new_inner = "\n" + AUTO_SYNC_COMMENT + source_inner
        updated = updated[:start] + new_inner + updated[end:]
    return updated


def run(check_only: bool) -> int:
    source_regions = canonical_regions(read(REPO_ROOT / SOURCE))

    planned: dict[Path, str] = {}
    drifted: list[str] = []

    for name in TARGETS:
        path = REPO_ROOT / name
        original = read(path)
        updated = apply_regions(original, source_regions, name)
        if updated != original:
            drifted.append(name)
            planned[path] = updated

    if check_only:
        if drifted:
            print("Header/footer out of sync in: " + ", ".join(drifted))
            print("Fix with: python3 tools/sync-partials.py")
            return 1
        print("Header/footer are in sync across all three pages.")
        return 0

    if not planned:
        print("Nothing to do — header/footer already in sync.")
        return 0

    for path, content in planned.items():
        path.write_text(content, encoding="utf-8")
        print(f"Synced header/footer into {path.name}")
    return 0


def main(argv: list[str]) -> int:
    args = argv[1:]
    check_only = "--check" in args
    unknown = [a for a in args if a != "--check"]
    if unknown:
        print(f"Unknown argument(s): {' '.join(unknown)}", file=sys.stderr)
        print(__doc__, file=sys.stderr)
        return 2

    try:
        return run(check_only)
    except SyncError as err:
        print(f"ERROR: {err}", file=sys.stderr)
        print(
            "No files were changed. Each of HEADER-START / HEADER-END / "
            "FOOTER-START / FOOTER-END must appear exactly once, in order, in "
            "index.html, portfolio.html and pricing.html.",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
