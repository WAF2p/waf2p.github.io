# WAF++ Website - Quick Start Setup

This guide will help you set up the WAF++ website development environment on your local machine.

## Prerequisites

Ensure you have the following installed:

- **Ruby 4.0+** (for Jekyll)
- **Node.js 20+** (for Antora)
- **Task** (go-task for build automation)
- **Git** (for version control)

### Installing Prerequisites

**macOS (using Homebrew):**
```bash
brew install ruby node go-task
```

**Linux (Ubuntu/Debian):**
```bash
# Ruby
sudo apt-get install ruby-full

# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Task
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

**Windows:**
```powershell
# Using Chocolatey
choco install ruby nodejs-lts golang-task

# Or using Scoop
scoop install ruby nodejs-lts task
```

## Repository Setup

### Standard Setup (Recommended)

Clone both repositories as sibling directories:

```bash
# Create a parent directory for both repos
mkdir waf2p-development
cd waf2p-development

# Clone the website repository
git clone https://github.com/WAF2p/waf2p.github.io.git

# Clone the framework repository (documentation source)
git clone https://github.com/WAF2p/framework.git

# Your directory structure should now look like:
# waf2p-development/
# ├── waf2p.github.io/    # Website repository
# └── framework/           # Framework repository
```

### Custom Setup

If you prefer a different directory structure, set the `LOCAL_FRAMEWORK_PATH` environment variable:

```bash
# Set for current session
export LOCAL_FRAMEWORK_PATH=/your/custom/path/to/framework

# Or add to your shell configuration (~/.bashrc, ~/.zshrc, etc.)
echo 'export LOCAL_FRAMEWORK_PATH=/your/custom/path/to/framework' >> ~/.zshrc
source ~/.zshrc
```

## Installation

Navigate to the website repository and install dependencies:

```bash
cd waf2p.github.io
task deps:install
```

This will install:
- Ruby gems (Jekyll and plugins)
- Node.js packages (Antora)

## Development Workflow

### Build and Serve Complete Site

Build both Jekyll (marketing pages) and Antora (documentation), then serve locally:

```bash
task site:serve
```

Access the site at:
- **Marketing pages**: http://localhost:8000/
- **Documentation**: http://localhost:8000/docs/wafpp/1.0/

### Jekyll Only (Marketing Pages)

For faster iteration on marketing pages:

```bash
task jekyll:serve
```

Includes live reload - changes are reflected immediately.

### Documentation Only

Build and serve just the documentation:

```bash
task docs:serve
```

### Common Commands

```bash
# Show all available tasks
task --list

# Clean build artifacts
task site:clean

# Update dependencies
task deps:update

# Build without serving
task site:build
```

## Project Structure

```
waf2p.github.io/
├── _config.yml           # Jekyll configuration
├── _data/                # YAML data files
├── _includes/            # Reusable HTML components
├── _layouts/             # Page layouts
├── _posts/               # Blog posts
├── _sass/                # SCSS stylesheets
├── Taskfile.yml          # Build automation
├── antora-playbook.yml   # Antora production config
└── antora-playbook-local.yml  # Antora local dev config
```

## Troubleshooting

### "bundle: command not found"

Ensure Ruby's bin directory is in your PATH:

```bash
# macOS (Homebrew)
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# Linux
export PATH="$HOME/.local/share/gem/ruby/bin:$PATH"
```

### "Framework repository not found"

Ensure the framework repository is cloned in the correct location:
- Default: `../framework` (sibling directory)
- Custom: Set `LOCAL_FRAMEWORK_PATH` environment variable

### Port Already in Use

If port 8000 or 4000 is already in use:

```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port for Jekyll
bundle exec jekyll serve --port 4001
```

### Jekyll Build Errors

Clear the cache and rebuild:

```bash
task site:clean
task site:build
```

## Next Steps

- Read the full **[README.md](README.md)** for detailed documentation
- Review **[AGENTS.md](AGENTS.md)** for agentic coding assistant guidelines
- Check the **[WAF++ Framework documentation](https://waf2p.dev/docs/wafpp/1.0/)**
- Join the WAF++ community discussions

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/WAF2p/waf2p.github.io/issues)
- **Documentation**: [Full README](README.md)
- **Community**: Visit [waf2p.dev](https://waf2p.dev)

---

**Happy coding!**
