#!/usr/bin/env sh
# WAF++ PASS one-line installer
# https://waf2p.dev/wafpass-install/
#
# Usage:
#   curl -fsSL https://waf2p.dev/install.sh | sh
#   curl -fsSL https://waf2p.dev/install.sh | sh -s -- --venv
#   curl -fsSL https://waf2p.dev/install.sh | sh -s -- --dry-run

set -eu

# ── Defaults ───────────────────────────────────────────────────────────────────
WAFPASS_VERSION="${WAFPASS_VERSION:-}"
WAFPASS_HOME="${WAFPASS_HOME:-${HOME}/.wafpass}"
WAFPASS_VENV="${WAFPASS_VENV:-${WAFPASS_HOME}/venv}"
WAFPASS_DRY_RUN="${WAFPASS_DRY_RUN:-0}"
WAFPASS_ALLOW_SUDO="${WAFPASS_ALLOW_SUDO:-0}"
WAFPASS_SKIP_VENV="${WAFPASS_SKIP_VENV:-0}"
WAFPASS_CONTROLS_URL="${WAFPASS_CONTROLS_URL:-https://github.com/WAF2p/framework.git}"
WAFPASS_CONTROLS_BRANCH="${WAFPASS_CONTROLS_BRANCH:-main-en}"

# ── Argument parsing ───────────────────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --version)
      WAFPASS_VERSION="$2"
      shift 2
      ;;
    --venv)
      WAFPASS_SKIP_VENV=0
      shift
      ;;
    --no-venv)
      WAFPASS_SKIP_VENV=1
      shift
      ;;
    --dry-run)
      WAFPASS_DRY_RUN=1
      shift
      ;;
    --allow-sudo)
      WAFPASS_ALLOW_SUDO=1
      shift
      ;;
    -h|--help)
      cat <<'EOF'
WAF++ PASS installer

Usage: install.sh [OPTIONS]

Options:
  --version VERSION   Install a specific wafpass-core version.
  --venv              Install into ~/.wafpass/venv (default).
  --no-venv           Install into the current Python environment.
  --dry-run           Show the plan without changing anything.
  --allow-sudo        Allow the installer to use sudo if needed.
  -h, --help          Show this help message.

Environment variables:
  WAFPASS_VERSION     Same as --version.
  WAFPASS_HOME        Base directory for the demo project and controls.
  WAFPASS_SKIP_VENV   Same as --no-venv.
  WAFPASS_DRY_RUN     Same as --dry-run.
  WAFPASS_ALLOW_SUDO  Same as --allow-sudo.
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Run 'install.sh --help' for usage." >&2
      exit 2
      ;;
  esac
done

# ── Helpers ─────────────────────────────────────────────────────────────────────
log() {
  printf '[wafpass-install] %s\n' "$1"
}

run() {
  if [ "$WAFPASS_DRY_RUN" -eq 1 ]; then
    printf '[dry-run] %s\n' "$1"
    return 0
  fi
  printf '+ %s\n' "$1" >&2
  eval "$1"
}

error() {
  printf '[wafpass-install] error: %s\n' "$1" >&2
  exit 1
}

check_command() {
  command -v "$1" >/dev/null 2>&1
}

python_version_ok() {
  python_cmd="$1"
  version="$($python_cmd --version 2>&1 | head -n1 | cut -d' ' -f2)"
  major=$(printf '%s' "$version" | cut -d'.' -f1)
  minor=$(printf '%s' "$version" | cut -d'.' -f2)
  if [ "$major" -gt 3 ] || { [ "$major" -eq 3 ] && [ "$minor" -ge 11 ]; }; then
    return 0
  fi
  return 1
}

# ── Detect platform ───────────────────────────────────────────────────────────
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

# ── Sanity checks ─────────────────────────────────────────────────────────────
log "Detecting Python..."
PYTHON_CMD=""
for cmd in python3.12 python3.11 python3 python; do
  if check_command "$cmd" && python_version_ok "$cmd"; then
    PYTHON_CMD="$cmd"
    break
  fi
done

if [ -z "$PYTHON_CMD" ]; then
  error "Python 3.11 or newer is required. Please install it and try again.
See https://www.python.org/downloads/"
fi

log "Using Python: $PYTHON_CMD ($($PYTHON_CMD --version 2>&1))"

if ! check_command git; then
  error "git is required to download the WAF++ controls. Please install it and try again.
See https://git-scm.com/downloads"
fi

if ! "$PYTHON_CMD" -m pip --version >/dev/null 2>&1; then
  error "pip is not installed. Install pip and try again.
See https://pip.pypa.io/en/stable/installation/"
fi

# ── Prepare virtual environment (unless --no-venv) ────────────────────────────
if [ "$WAFPASS_SKIP_VENV" -eq 0 ]; then
  log "Creating isolated environment at $WAFPASS_VENV..."
  if [ "$WAFPASS_DRY_RUN" -eq 1 ]; then
    log "Would create venv: $WAFPASS_VENV"
  else
    # Remove an existing broken venv if necessary.
    if [ -d "$WAFPASS_VENV" ] && [ ! -x "$WAFPASS_VENV/bin/python" ]; then
      rm -rf "$WAFPASS_VENV"
    fi
    "$PYTHON_CMD" -m venv "$WAFPASS_VENV" || error "Failed to create virtual environment."
  fi
  PYTHON_CMD="$WAFPASS_VENV/bin/python"
  PIP_CMD="$PYTHON_CMD -m pip"
else
  PIP_CMD="$PYTHON_CMD -m pip"
fi

# ── Install / upgrade wafpass-core ────────────────────────────────────────────
log "Installing wafpass-core..."
version_arg=""
if [ -n "$WAFPASS_VERSION" ]; then
  version_arg="==$WAFPASS_VERSION"
fi

if [ "$WAFPASS_SKIP_VENV" -eq 1 ] && [ "$WAFPASS_ALLOW_SUDO" -ne 1 ]; then
  # When installing into the system interpreter, default to --user.
  run "$PIP_CMD install --user --upgrade \"wafpass-core${version_arg}\""
else
  run "$PIP_CMD install --upgrade \"wafpass-core${version_arg}\""
fi

# ── Download WAF++ controls ───────────────────────────────────────────────────
CONTROLS_DIR="$WAFPASS_HOME/controls"
DEMO_DIR="$WAFPASS_HOME/demo"
CONTROLS_TMP="$WAFPASS_HOME/.controls-tmp"

log "Downloading WAF++ controls..."
if [ "$WAFPASS_DRY_RUN" -eq 1 ]; then
  log "Would clone $WAFPASS_CONTROLS_URL (branch $WAFPASS_CONTROLS_BRANCH) into $CONTROLS_TMP"
  log "Would copy controls to $CONTROLS_DIR"
else
  rm -rf "$CONTROLS_TMP"
  mkdir -p "$CONTROLS_TMP"
  git clone --depth 1 --branch "$WAFPASS_CONTROLS_BRANCH" "$WAFPASS_CONTROLS_URL" "$CONTROLS_TMP" \
    >/dev/null 2>&1 || error "Failed to clone WAF++ controls from $WAFPASS_CONTROLS_URL"

  if [ ! -d "$CONTROLS_TMP/modules/controls/controls" ]; then
    error "Controls repository layout is unexpected; could not find modules/controls/controls"
  fi

  rm -rf "$CONTROLS_DIR"
  mkdir -p "$CONTROLS_DIR"
  cp -r "$CONTROLS_TMP/modules/controls/controls/"* "$CONTROLS_DIR/"
  rm -rf "$CONTROLS_TMP"
fi

# ── Create sample Terraform project ──────────────────────────────────────────
log "Creating sample Terraform project at $DEMO_DIR..."
if [ "$WAFPASS_DRY_RUN" -eq 1 ]; then
  log "Would create $DEMO_DIR/main.tf"
else
  rm -rf "$DEMO_DIR"
  mkdir -p "$DEMO_DIR"
  cat >"$DEMO_DIR/main.tf" <<'EOF'
provider "aws" {
  region = "eu-central-1"
}

resource "aws_s3_bucket" "public" {
  bucket = "wafpp-first-check-demo"
}

resource "aws_s3_bucket_public_access_block" "public" {
  bucket                  = aws_s3_bucket.public.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
EOF
fi

# ── Run first scan ────────────────────────────────────────────────────────────
log "Running your first WAFPass scan..."
if [ "$WAFPASS_DRY_RUN" -eq 1 ]; then
  log "Would run: cd $DEMO_DIR && $PYTHON_CMD -m wafpass check . --output json | jq '.summary'"
else
  if check_command jq; then
    run "cd \"$DEMO_DIR\" && $PYTHON_CMD -m wafpass check . --output json | jq '.summary'"
  else
    log "jq not found; printing raw JSON output."
    run "cd \"$DEMO_DIR\" && $PYTHON_CMD -m wafpass check . --output json"
  fi
fi

# ── Final status ──────────────────────────────────────────────────────────────
log "Installation complete."
log "Controls:   $CONTROLS_DIR"
log "Demo files: $DEMO_DIR"
if [ "$WAFPASS_SKIP_VENV" -eq 0 ]; then
  log "To run WAFPass again, use: $PYTHON_CMD -m wafpass check $DEMO_DIR"
  log "Or activate the environment: source $WAFPASS_VENV/bin/activate"
else
  log "To run WAFPass again, use: $PYTHON_CMD -m wafpass check $DEMO_DIR"
fi
