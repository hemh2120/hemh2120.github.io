#!/usr/bin/env python3
"""Fetch Google Scholar citation metrics into citations.json.

Leaves the existing file untouched when the counts have not changed, so the
daily workflow does not create an empty commit.
"""

import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCHOLAR_ID = "rWjNtFEAAAAJ"
OUT = Path(__file__).resolve().parents[1] / "citations.json"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"


def fetch_profile():
    request = urllib.request.Request(
        URL,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "replace")


def parse_metrics(html):
    cells = re.findall(r'class="gsc_rsb_std">(\d[\d,]*)', html)
    if len(cells) < 6:
        raise SystemExit(
            "Google Scholar did not return citation stats. "
            "The previous citations.json was left unchanged."
        )
    citations, _recent_citations, h_index, _recent_h, i10_index, _recent_i10 = (
        int(value.replace(",", "")) for value in cells[:6]
    )
    return citations, h_index, i10_index


def main():
    citations, h_index, i10_index = parse_metrics(fetch_profile())
    if OUT.exists():
        try:
            previous = json.loads(OUT.read_text())
        except json.JSONDecodeError:
            previous = {}
        if (
            previous.get("citations"),
            previous.get("h_index"),
            previous.get("i10_index"),
        ) == (citations, h_index, i10_index):
            print("Citation counts unchanged.")
            return

    payload = {
        "scholar_id": SCHOLAR_ID,
        "citations": citations,
        "h_index": h_index,
        "i10_index": i10_index,
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
