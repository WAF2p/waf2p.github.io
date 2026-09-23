# WAF++ PASS installer for Windows (PowerShell)
# https://waf2p.dev/wafpass-install/
#
# Usage:
#   irm https://waf2p.dev/install.ps1 | iex
#   irm https://waf2p.dev/install.ps1 | iex -Version 1.1.2

#Requires -Version 5.1

param(
    [string]$Version = "",
    [switch]$Venv,
    [switch]$NoVenv,
    [switch]$DryRun,
    [switch]$AllowSudo,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# ── Defaults ───────────────────────────────────────────────────────────────────
$WafpassHome = Join-Path $env:USERPROFILE ".wafpass"
$WafpassVenv = Join-Path $WafpassHome "venv"
$WafpassControlsUrl = if ($env:WAFPASS_CONTROLS_URL) { $env:WAFPASS_CONTROLS_URL } else { "https://github.com/WAF2p/framework.git" }
$WafpassControlsBranch = if ($env:WAFPASS_CONTROLS_BRANCH) { $env:WAFPASS_CONTROLS_BRANCH } else { "main-en" }

function Write-Log {
    param([string]$Message)
    Write-Host "[wafpass-install] $Message"
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Host "[wafpass-install] error: $Message" -ForegroundColor Red
}

function Invoke-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [switch]$DryRun
    )
    if ($DryRun) {
        Write-Host "[dry-run] $Command"
        return
    }
    Write-Host "+ $Command" -ForegroundColor DarkGray
    Invoke-Expression $Command | ForEach-Object { Write-Host $_ }
}

function Test-PythonVersion {
    param([string]$Command)
    try {
        $verString = & $Command --version 2>$null
        if ($verString -match "Python (\d+)\.(\d+)") {
            $major = [int]$matches[1]
            $minor = [int]$matches[2]
            return ($major -gt 3 -or ($major -eq 3 -and $minor -ge 11))
        }
    }
    catch {
        return $false
    }
    return $false
}

# ── Help ───────────────────────────────────────────────────────────────────────
if ($Help) {
    @"
WAF++ PASS installer (Windows)

Usage: install.ps1 [OPTIONS]

Options:
  -Version VERSION   Install a specific wafpass-core version.
  -Venv              Install into %USERPROFILE%\.wafpass\venv (default).
  -NoVenv            Install into the current Python environment.
  -DryRun            Show the plan without changing anything.
  -AllowSudo         Allow admin elevation if needed (no-op on Windows).
  -Help              Show this help message.

Environment variables:
  $env:WAFPASS_VERSION      Same as -Version.
  $env:WAFPASS_HOME         Base directory for the demo project and controls.
  $env:WAFPASS_SKIP_VENV    Same as -NoVenv.
  $env:WAFPASS_DRY_RUN      Same as -DryRun.
  $env:WAFPASS_CONTROLS_URL    URL of the controls repository.
  $env:WAFPASS_CONTROLS_BRANCH  Branch of the controls repository.
"@ | Write-Host
    exit 0
}

# ── Resolve switches / env vars ──────────────────────────────────────────────
if ($env:WAFPASS_VERSION) { $Version = $env:WAFPASS_VERSION }
if ($env:WAFPASS_HOME) { $WafpassHome = $env:WAFPASS_HOME }
if ($env:WAFPASS_VENV) { $WafpassVenv = $env:WAFPASS_VENV }
if ($env:WAFPASS_DRY_RUN -eq "1") { $DryRun = $true }
if ($env:WAFPASS_SKIP_VENV -eq "1") { $NoVenv = $true }

$UseVenv = (-not $NoVenv)
if ($Venv) { $UseVenv = $true }

# ── Detect Python ────────────────────────────────────────────────────────────
Write-Log "Detecting Python..."
$PythonCmd = $null
foreach ($cmd in @("python3.12", "python3.11", "python3", "python")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        if (Test-PythonVersion -Command $cmd) {
            $PythonCmd = $cmd
            break
        }
    }
}

if (-not $PythonCmd) {
    Write-ErrorLog "Python 3.11 or newer is required. Please install it from https://www.python.org/downloads/"
    exit 1
}

$ver = & $PythonCmd --version 2>$null
Write-Log "Using Python: $PythonCmd ($ver)"

# ── Detect git ─────────────────────────────────────────────────────────────────
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-ErrorLog "git is required to download the WAF++ controls. Please install it from https://git-scm.com/downloads"
    exit 1
}

# ── Detect pip ─────────────────────────────────────────────────────────────────
try {
    & $PythonCmd -m pip --version | Out-Null
}
catch {
    Write-ErrorLog "pip is not installed. Install pip and try again."
    exit 1
}

# ── Prepare virtual environment ────────────────────────────────────────────────
if ($UseVenv) {
    Write-Log "Creating isolated environment at $WafpassVenv..."
    if (-not $DryRun) {
        if (Test-Path $WafpassVenv) {
            $pythonInVenv = Join-Path $WafpassVenv "Scripts\python.exe"
            if (-not (Test-Path $pythonInVenv)) {
                Remove-Item -Recurse -Force $WafpassVenv
            }
        }
        & $PythonCmd -m venv $WafpassVenv | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "Failed to create virtual environment."
            exit 1
        }
    }
    else {
        Write-Log "Would create venv: $WafpassVenv"
    }
    $PythonCmd = Join-Path $WafpassVenv "Scripts\python.exe"
}

# ── Install / upgrade wafpass-core ─────────────────────────────────────────────
$versionArg = ""
if ($Version) {
    $versionArg = "==$Version"
}

Write-Log "Installing wafpass-core..."
$pipInstall = "& `"$PythonCmd`" -m pip install --upgrade `"wafpass-core$versionArg`""
if (-not $UseVenv) {
    $pipInstall = "& `"$PythonCmd`" -m pip install --user --upgrade `"wafpass-core$versionArg`""
}
Invoke-Command -Command $pipInstall -DryRun:$DryRun

# ── Download WAF++ controls ────────────────────────────────────────────────────
$ControlsDir = Join-Path $WafpassHome "controls"
$DemoDir = Join-Path $WafpassHome "demo"
$ControlsTmp = Join-Path $WafpassHome ".controls-tmp"

Write-Log "Downloading WAF++ controls..."
if ($DryRun) {
    Write-Log "Would clone $WafpassControlsUrl (branch $WafpassControlsBranch) into $ControlsTmp"
    Write-Log "Would copy controls to $ControlsDir"
}
else {
    if (Test-Path $ControlsTmp) {
        Remove-Item -Recurse -Force $ControlsTmp
    }

    git clone --depth 1 --branch $WafpassControlsBranch $WafpassControlsUrl $ControlsTmp 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorLog "Failed to clone WAF++ controls from $WafpassControlsUrl"
        exit 1
    }

    $controlsSource = Join-Path $ControlsTmp "modules\controls\controls"
    if (-not (Test-Path $controlsSource)) {
        Write-ErrorLog "Controls repository layout is unexpected; could not find modules/controls/controls"
        exit 1
    }

    if (Test-Path $ControlsDir) {
        Remove-Item -Recurse -Force $ControlsDir
    }
    New-Item -ItemType Directory -Force -Path $ControlsDir | Out-Null
    Copy-Item -Path "$controlsSource\*" -Destination $ControlsDir -Recurse -Force

    Remove-Item -Recurse -Force $ControlsTmp
}

# ── Create sample Terraform project ────────────────────────────────────────────
Write-Log "Creating sample Terraform project at $DemoDir..."
if ($DryRun) {
    Write-Log "Would create $DemoDir\main.tf"
}
else {
    if (Test-Path $DemoDir) {
        Remove-Item -Recurse -Force $DemoDir
    }
    New-Item -ItemType Directory -Force -Path $DemoDir | Out-Null
    @'
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
'@ | Set-Content -Path (Join-Path $DemoDir "main.tf") -Encoding UTF8
}

# ── Run first scan ─────────────────────────────────────────────────────────────
Write-Log "Running your first WAFPass scan..."
$checkCommand = "& `"$PythonCmd`" -m wafpass check `"$DemoDir`" --output json"
if ($DryRun) {
    Write-Log "Would run: $checkCommand | jq '.summary'"
}
else {
    if (Get-Command jq -ErrorAction SilentlyContinue) {
        Invoke-Command -Command "$checkCommand | jq '.summary'" -DryRun:$DryRun
    }
    else {
        Write-Log "jq not found; printing raw JSON output."
        Invoke-Command -Command $checkCommand -DryRun:$DryRun
    }
}

# ── Final status ──────────────────────────────────────────────────────────────
Write-Log "Installation complete."
Write-Log "Controls:   $ControlsDir"
Write-Log "Demo files: $DemoDir"
if ($UseVenv) {
    Write-Log "To run WAFPass again, use: & `"$PythonCmd`" -m wafpass check `"$DemoDir`""
    Write-Log "Or activate the environment: & `"$WafpassVenv\Scripts\Activate.ps1`""
}
else {
    Write-Log "To run WAFPass again, use: & `"$PythonCmd`" -m wafpass check `"$DemoDir`""
}
