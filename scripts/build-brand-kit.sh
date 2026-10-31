#!/usr/bin/env bash
# Build downloads/wombat-brand-kit.zip from the generated brand assets.
# Run from the repository root:  sh scripts/build-brand-kit.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/wombat-brand-kit/mascot" "$STAGE/wombat-brand-kit/full" "$STAGE/wombat-brand-kit/pillars" "$STAGE/wombat-brand-kit/og"

cp "$ROOT"/images/brand/mascot/*.svg "$STAGE/wombat-brand-kit/mascot/"
cp "$ROOT"/images/brand/mascot/full/*.png "$STAGE/wombat-brand-kit/full/"
cp "$ROOT"/images/brand/pillars/*.svg "$STAGE/wombat-brand-kit/pillars/"
cp "$ROOT"/images/og/brand.png \
   "$ROOT"/images/og/wombat-room.png \
   "$ROOT"/images/og/pillars/security.png \
   "$ROOT"/images/og/pillars/sovereign.png \
   "$ROOT"/images/og/pillars/agentic.png \
   "$STAGE/wombat-brand-kit/og/"
cp "$ROOT/scripts/brand-kit-README.txt" "$STAGE/wombat-brand-kit/README.txt"

mkdir -p "$ROOT/downloads"
rm -f "$ROOT/downloads/wombat-brand-kit.zip"
(cd "$STAGE" && zip -rq "$ROOT/downloads/wombat-brand-kit.zip" wombat-brand-kit)
echo "wrote downloads/wombat-brand-kit.zip"
