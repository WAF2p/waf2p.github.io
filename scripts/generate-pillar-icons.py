#!/usr/bin/env python3
"""Generate the eight Wombat pillar icons.

Run from the repository root:
    python3 scripts/generate-pillar-icons.py

All icons share a 24×24 grid, 1.75 stroke, round caps and
`currentColor`, so they work as inline SVGs, via CSS mask, or as
plain <img> (they render in the surrounding text color).
"""

import os

OUT = "images/brand/pillars"

ICONS = {
    "security": {
        "title": "Security",
        "body": """
    <path d="M12 3 4.5 6v6c0 4.6 3.2 7.6 7.5 9 4.3-1.4 7.5-4.4 7.5-9V6L12 3Z"/>
    <path d="m8.7 11.9 2.3 2.3 4.4-4.6"/>
""",
    },
    "cost-optimization": {
        "title": "Cost Optimization",
        "body": """
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M12 7.2v8"/>
    <path d="m8.8 12.3 3.2 3 3.2-3"/>
""",
    },
    "performance-efficiency": {
        "title": "Performance Efficiency",
        "body": """
    <path d="M4.5 18a7.5 7.5 0 1 1 15 0"/>
    <path d="m12 14 4.4-4.4"/>
    <circle cx="12" cy="14" r="1.6"/>
""",
    },
    "reliability": {
        "title": "Reliability",
        "body": """
    <path d="M3 12h3.8l2.1-5 3.6 10 2.4-5H21"/>
""",
    },
    "operational-excellence": {
        "title": "Operational Excellence",
        "body": """
    <rect x="3" y="4.5" width="18" height="15" rx="3"/>
    <path d="m7 9.5 3 2.5-3 2.5"/>
    <path d="M12.5 15.5H17"/>
""",
    },
    "sustainability": {
        "title": "Sustainability",
        "body": """
    <path d="M21 3C12 3 4 7 4 14a6 6 0 0 0 6 6c7 0 11-8 11-17Z"/>
    <path d="M4 21c2.6-6.2 7-10.4 13-13"/>
""",
    },
    "sovereign": {
        "title": "Sovereign",
        "body": """
    <circle cx="8" cy="12" r="4"/>
    <path d="M12 12h9"/>
    <path d="M17 12v3"/>
    <path d="M20 12v2"/>
""",
    },
    "agentic": {
        "title": "Agentic",
        "body": """
    <path d="M11.5 3.5 13.2 9l5.5 1.7-5.5 1.7L11.5 18l-1.7-5.6L4.3 10.7 9.8 9l1.7-5.5Z"/>
    <path d="m18.4 15.4.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/>
""",
    },
}


def icon(slug, data):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-labelledby="title">
  <title id="title">Wombat pillar — {data['title']}</title>
{data['body']}</svg>
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    for slug, data in ICONS.items():
        path = os.path.join(OUT, f"{slug}.svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(icon(slug, data))
        print("wrote", path)


if __name__ == "__main__":
    main()
