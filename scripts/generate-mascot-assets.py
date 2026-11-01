#!/usr/bin/env python3
"""Generate the vector Wombat mascot set.

Run from the repository root:
    python3 scripts/generate-mascot-assets.py

Outputs six expression SVGs plus a circular avatar into
images/brand/mascot/. The art is deliberately flat and hand-built so it
scales cleanly for stickers, docs callouts, avatars and print.
"""

import os

OUT = "images/brand/mascot"

FUR = "#8b5a3c"
FUR_INNER = "#c98e6b"
MUZZLE = "#d7a582"
OUTLINE = "#3a2a22"
FACE = "#2a1b14"
HAT = "#ffcf63"
HAT_BRIM = "#f5b93f"
GREEN = "#2ed573"
BLUE = "#7fe7ff"
PURPLE = "#7c3aed"
GOLD = "#ffcf63"
AMBER = "#ffb870"

EXP = {
    "idle": """
    <g>
      <circle cx="94" cy="126" r="7.5" fill="{face}"/>
      <circle cx="146" cy="126" r="7.5" fill="{face}"/>
      <circle cx="96.5" cy="123" r="2.4" fill="#ffffff"/>
      <circle cx="148.5" cy="123" r="2.4" fill="#ffffff"/>
      <path d="M103 170 Q120 184 137 170" fill="none" stroke="{face}" stroke-width="4"/>
    </g>
    """,
    "digging": """
    <g>
      <path d="M80 112 L102 120" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M160 112 L138 120" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M85 130 Q94 123 103 130" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M137 130 Q146 123 155 130" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M102 168 Q120 187 138 168 Z" fill="{face}"/>
      <path d="M112 177 Q120 183 128 177 Q120 172 112 177" fill="#d77a7a"/>
      <g stroke="none">
        <circle cx="56" cy="188" r="4" fill="#a9744f"/>
        <circle cx="184" cy="190" r="5" fill="#a9744f"/>
        <circle cx="46" cy="152" r="3" fill="{gold}"/>
        <circle cx="198" cy="156" r="4" fill="{gold}"/>
        <circle cx="72" cy="208" r="3" fill="#a9744f"/>
      </g>
    </g>
    """,
    "alert": """
    <g>
      <path d="M82 110 Q94 102 106 110" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M134 110 Q146 102 158 110" fill="none" stroke="{face}" stroke-width="4"/>
      <circle cx="94" cy="128" r="9" fill="{face}"/>
      <circle cx="146" cy="128" r="9" fill="{face}"/>
      <circle cx="97" cy="124" r="2.6" fill="#ffffff"/>
      <circle cx="149" cy="124" r="2.6" fill="#ffffff"/>
      <ellipse cx="120" cy="175" rx="8" ry="10" fill="{face}"/>
      <path d="M204 106 Q213 120 204 127 Q195 120 204 106 Z" fill="{blue}"/>
    </g>
    """,
    "celebrate": """
    <g>
      <path d="M84 126 Q94 114 104 126" fill="none" stroke="{face}" stroke-width="4.5"/>
      <path d="M136 126 Q146 114 156 126" fill="none" stroke="{face}" stroke-width="4.5"/>
      <path d="M99 165 Q120 189 141 165 Z" fill="{face}"/>
      <path d="M111 176 Q120 183 129 176 Q120 171 111 176" fill="#d77a7a"/>
      <g stroke="none">
        <rect x="40" y="52" width="10" height="10" rx="2" fill="{gold}" transform="rotate(-18 45 57)"/>
        <rect x="190" y="46" width="9" height="9" rx="2" fill="{purple}" transform="rotate(22 194 50)"/>
        <rect x="28" y="146" width="8" height="8" rx="2" fill="{blue}" transform="rotate(-12 32 150)"/>
        <rect x="204" y="158" width="9" height="9" rx="2" fill="{green}" transform="rotate(30 208 162)"/>
        <circle cx="58" cy="196" r="4.5" fill="{gold}"/>
        <circle cx="184" cy="204" r="4" fill="{purple}"/>
        <circle cx="208" cy="104" r="3.5" fill="{green}"/>
      </g>
    </g>
    """,
    "thinking": """
    <g>
      <path d="M82 108 Q94 100 106 108" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M136 116 L158 116" fill="none" stroke="{face}" stroke-width="4"/>
      <circle cx="94" cy="126" r="7.5" fill="{face}"/>
      <circle cx="95.5" cy="122.5" r="2.4" fill="#ffffff"/>
      <path d="M137 132 Q146 126 155 132" fill="none" stroke="{face}" stroke-width="4"/>
      <path d="M106 172 Q120 166 134 172" fill="none" stroke="{face}" stroke-width="4"/>
      <g>
        <circle cx="205" cy="176" r="11" fill="{gold}" stroke="{outline}" stroke-width="3"/>
        <rect x="201" y="187" width="8" height="6" rx="2" fill="{hat_brim}" stroke="{outline}" stroke-width="3"/>
        <path d="M205 157 v-6 M220 164 l4-4 M190 164 l-4-4 M219 188 l5 3 M191 188 l-5 3" fill="none" stroke="{gold}" stroke-width="3"/>
      </g>
    </g>
    """,
    "sleepy": """
    <g>
      <path d="M84 126 Q94 136 104 126" fill="none" stroke="{face}" stroke-width="4.5"/>
      <path d="M136 126 Q146 136 156 126" fill="none" stroke="{face}" stroke-width="4.5"/>
      <path d="M110 172 Q120 178 130 172" fill="none" stroke="{face}" stroke-width="4"/>
      <g fill="none" stroke="{green}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M190 62 h14 l-14 12 h14"/>
        <path d="M208 36 h10 l-10 9 h10"/>
      </g>
    </g>
    """,
}

TITLES = {
    "idle": "idle",
    "digging": "digging",
    "alert": "alert",
    "celebrate": "celebrate",
    "thinking": "thinking",
    "sleepy": "sleepy",
}


def mascot(expression, title):
    body = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-labelledby="title">
  <title id="title">Wombat mascot — {title}</title>
  <g stroke="{OUTLINE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="104" r="21" fill="{FUR}"/>
    <circle cx="190" cy="104" r="21" fill="{FUR}"/>
    <circle cx="50" cy="104" r="10" fill="{FUR_INNER}" stroke="none"/>
    <circle cx="190" cy="104" r="10" fill="{FUR_INNER}" stroke="none"/>
    <ellipse cx="120" cy="130" rx="84" ry="78" fill="{FUR}"/>
    <ellipse cx="120" cy="158" rx="43" ry="30" fill="{MUZZLE}" stroke="none"/>
    <path d="M53 90 C53 45 187 45 187 90 Z" fill="{HAT}"/>
    <rect x="32" y="84" width="176" height="18" rx="9" fill="{HAT_BRIM}"/>
    <path d="M104 64 l7 17 9-12 9 12 7-17" fill="none" stroke="{FUR}" stroke-width="5"/>
    <ellipse cx="120" cy="147" rx="11" ry="8" fill="{OUTLINE}" stroke="none"/>
  </g>
  {EXP[expression]}
</svg>
"""
    return body.format(face=FACE, gold=GOLD, blue=BLUE, green=GREEN,
                        purple=PURPLE, outline=OUTLINE, hat_brim=HAT_BRIM)


def avatar():
    inner = mascot("idle", "avatar")
    # Strip the outer <svg> wrapper and place the art on a dark circle.
    start = inner.index(">") + 1
    end = inner.rindex("</svg>")
    art = inner[start:end]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-labelledby="title">
  <title id="title">Wombat mascot avatar</title>
  <circle cx="120" cy="120" r="116" fill="#0b1220"/>
  <g transform="translate(14.4 14.4) scale(0.88)">
    {art}
  </g>
</svg>
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    for expression, title in TITLES.items():
        path = os.path.join(OUT, f"wombat-{expression}.svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(mascot(expression, title))
        print("wrote", path)
    with open(os.path.join(OUT, "wombat-avatar.svg"), "w", encoding="utf-8") as fh:
        fh.write(avatar())
    print("wrote", os.path.join(OUT, "wombat-avatar.svg"))


if __name__ == "__main__":
    main()
