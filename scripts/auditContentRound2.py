#!/usr/bin/env python3
"""Legacy round-2 content audit script.

This is the legacy round-2 audit script.
It has known false-positive issues (over-counts pricing references in didactic examples,
mis-attributes lessons across prefix variants like creator-/business-/productivity-).
The production freshness checker is at scripts/checkContentFreshness.ts
(will be added in a future PR).

Purpose: historical reproducibility for prior round-2 audits, not production enforcement.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


BUCKET_DESCRIPTIONS = {
    "A": "tool names in prose",
    "B": "specific model versions",
    "C": "capability claims",
    "D": "pricing references",
    "E": "date references",
    "F": "placeholder tokens",
    "G": "other",
}

PATTERNS = {
    "A": re.compile(r"\b(chatgpt|claude|gemini|copilot|midjourney|dall[\s-]?e|perplexity|notion ai)\b", re.I),
    "B": re.compile(r"\b(gpt[-\s]?\d(?:\.\d+)?|gpt[-\w]*turbo|claude\s*\d(?:\.\d+)?|gemini\s*(?:1\.5|2\.0|pro|flash)|llama\s*\d+)\b", re.I),
    "C": re.compile(r"\b(always|never|guarantee[sd]?|perfect(?:ly)?|100%|hallucinat(?:e|es|ion\b))\b", re.I),
    "D": re.compile(r"\b(\$\s?\d+(?:\.\d+)?|usd|per month|/month|subscription|pricing|plan[s]?)\b", re.I),
    "E": re.compile(r"\b(20\d{2}|19\d{2}|today|tomorrow|yesterday|last year|next year|q[1-4])\b", re.I),
    "F": re.compile(r"(\{\{[^}]+\}\}|\[[A-Z_]{2,}\]|<[^>]+>|TODO|TBD)", re.I),
}


@dataclass
class Finding:
    bucket: str
    path: str
    line_number: int
    excerpt: str


def classify_line(line: str) -> str:
    for bucket in ["A", "B", "C", "D", "E", "F"]:
        if PATTERNS[bucket].search(line):
            return bucket
    return "G"


def iter_text_files(root: Path, include: Iterable[str]) -> Iterable[Path]:
    for rel in include:
        p = root / rel
        if p.is_file():
            yield p
            continue

        if p.is_dir():
            for child in p.rglob("*"):
                if child.is_file() and child.suffix.lower() in {".ts", ".tsx", ".js", ".jsx", ".md", ".json", ".txt"}:
                    yield child


def audit_files(paths: Iterable[Path], base: Path) -> Tuple[Dict[str, int], List[Finding]]:
    totals: Dict[str, int] = defaultdict(int)
    findings: List[Finding] = []

    for path in paths:
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except UnicodeDecodeError:
            continue

        for i, line in enumerate(lines, start=1):
            if not line.strip():
                continue
            bucket = classify_line(line)
            totals[bucket] += 1
            if bucket != "G":
                findings.append(
                    Finding(
                        bucket=bucket,
                        path=str(path.relative_to(base)),
                        line_number=i,
                        excerpt=line.strip()[:200],
                    )
                )

    for k in BUCKET_DESCRIPTIONS:
        totals.setdefault(k, 0)
    return dict(totals), findings


def main() -> None:
    parser = argparse.ArgumentParser(description="Legacy round-2 content auditor")
    parser.add_argument("paths", nargs="*", default=["src/data/lessonContent.ts"], help="Files or directories to scan")
    parser.add_argument("--json", action="store_true", help="Emit JSON output")
    args = parser.parse_args()

    root = Path.cwd()
    files = list(iter_text_files(root, args.paths))
    totals, findings = audit_files(files, root)

    result = {
        "bucketDescriptions": BUCKET_DESCRIPTIONS,
        "totals": totals,
        "flagged": [f.__dict__ for f in findings],
        "scannedFiles": [str(p.relative_to(root)) for p in files],
    }

    if args.json:
        print(json.dumps(result, indent=2))
        return

    print("Legacy Round-2 Audit Summary")
    for key in ["A", "B", "C", "D", "E", "F", "G"]:
        print(f"{key} ({BUCKET_DESCRIPTIONS[key]}): {totals[key]}")
    print(f"Flagged lines (A-F): {len(findings)}")


if __name__ == "__main__":
    main()
