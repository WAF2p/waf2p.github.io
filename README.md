# Wombat Website

[![Build Status](https://github.com/WAF2p/waf2p.github.io/actions/workflows/jekyll-gh-pages.yml/badge.svg)](https://github.com/WAF2p/waf2p.github.io/actions/workflows/jekyll-gh-pages.yml)

Offizielle Website für das **Wombat**-Projekt - ein community-geführtes, cloud-agnostisches Framework für sichere und nachhaltige Cloud-Architekturen.

**Live-Site**: https://www.wombat-gov.dev/

---

## Architektur

Diese Website kombiniert **Jekyll** (Marketing-Seiten) mit **Antora** (Dokumentation):

```
Jekyll (Marketing Site)
  ├── Baut nach: _site/
  └── Konfiguration: _config.yml (keep_files: [docs])

Antora (Dokumentation)
  ├── Quelle: framework Repository (GitHub oder lokal)
  ├── Baut nach: _site/docs/
  └── Playbooks: antora-playbook.yml, antora-playbook-local.yml

Kombinierte Ausgabe: _site/
  ├── / (Jekyll-Inhalte: Homepage, Blog, Team)
  └── /docs/wafpp/1.1.0/ (Antora-Dokumentation)
```

---

## 📝 Für Inhalts-Beitragende

### Blog-Posts hinzufügen

1. **Erstelle eine neue Datei** in `_posts/` mit dem Format: `YYYY-MM-DD-titel.md`
2. **Füge YAML Front Matter hinzu**:
   ```yaml
   ---
   layout: post
   title: "Dein Titel"
   date: YYYY-MM-DD
   categories:
     - cloud
     - security
   author_staff_member: dein-name
   ---
   ```
3. **Schreibe den Inhalt** in Markdown unterhalb des Front Matter

### Team-Mitglieder hinzufügen

1. **Erstelle eine neue Datei** in `_staff_members/` (z.B. `max-mustermann.md`)
2. **Verwende das Template** aus `_staff_members/_defaults.md`
3. **Füge Profilbild hinzu** in `images/` und referenziere es im Front Matter

### Navigation aktualisieren

Bearbeite die Datei `_data/navigation.yml`:

```yaml
- name: Neuer Link
  link: /neue-seite/
  highlight: false
  new_window: false
```

### Vorschau

```bash
task jekyll:serve
# Öffne: http://localhost:4000/
```

### Weitere Informationen

Detaillierte technische Informationen findest du in der Datei `AGENTS.md` in diesem Repository.

---

## 🔧 Für Site-Entwickler

### Architektur-Übersicht

```
┌─────────────────────────────────────────────────────┐
│                 GitHub Pages Deploy                  │
│                   (_site/ Verzeichnis)               │
└─────────────────────────────────────────────────────┘
                            ▲
                            │
            ┌───────────────┴───────────────┐
            │                               │
┌───────────┴────────────┐    ┌────────────┴───────────┐
│   Jekyll Build         │    │   Antora Build         │
│   (Marketing Site)     │    │   (Dokumentation)      │
│                        │    │                        │
│   Input:               │    │   Input:               │
│   - _layouts/          │    │   - framework repo     │
│   - _includes/         │    │   - antora.yml         │
│   - _posts/            │    │   - modules/ROOT/      │
│   - _data/             │    │                        │
│   - _sass/             │    │   Output:              │
│   - css/, js/          │    │   _site/docs/          │
│                        │    │                        │
│   Output:              │    │   Config:              │
│   _site/ (preserves    │    │   antora-playbook.yml  │
│   docs/ subfolder)     │    │   (production)         │
│                        │    │   antora-playbook-     │
│   Config:              │    │   local.yml (dev)      │
│   _config.yml          │    │                        │
│   (keep_files: [docs]) │    │                        │
└────────────────────────┘    └────────────────────────┘
```

### Build-Reihenfolge

**Wichtig**: Jekyll muss **vor** Antora gebaut werden, damit:
1. Jekyll das `_site/`-Verzeichnis erstellt
2. Jekyll's `keep_files: [docs]` Konfiguration aktiv ist
3. Antora in das bestehende `_site/docs/`-Verzeichnis schreiben kann

### Technologie-Stack

| Komponente | Technologie | Version | Zweck |
|------------|-------------|---------|-------|
| Marketing Site | Jekyll | 4.3+ | Statische Seiten, Blog, Team |
| Dokumentation | Antora | 3.1.0 | Technische Dokumentation |
| Styling | SCSS | - | CSS-Präprozessor |
| Deployment | GitHub Actions | - | CI/CD Pipeline |
| Package Manager | npm | - | Node.js-Abhängigkeiten |
| Ruby Manager | Bundler | - | Ruby-Abhängigkeiten |
| Task Runner | Task (go-task) | - | Build-Automatisierung |

### Lokale Entwicklung

#### Voraussetzungen

- **Ruby 4.0+** (empfohlen: Homebrew Ruby auf macOS)
  ```bash
  brew install ruby
  ```
- **Node.js 20+**
  ```bash
  brew install node
  ```
- **Task** (go-task) für Build-Automatisierung
  ```bash
  brew install go-task
  ```

#### Repository-Struktur

Dieses Projekt geht von folgender Verzeichnisstruktur aus:

```
your-projects/
├── waf2p.github.io/    # Dieses Repository (Website)
└── framework/           # Framework-Repository (Dokumentationsquelle)
```

Klone beide Repositories als Geschwister-Verzeichnisse:

```bash
mkdir waf2p-development
cd waf2p-development
git clone https://github.com/WAF2p/waf2p.github.io.git
git clone https://github.com/WAF2p/framework.git
```

Falls du eine andere Struktur verwendest, setze die Umgebungsvariable `LOCAL_FRAMEWORK_PATH`:

```bash
export LOCAL_FRAMEWORK_PATH=/pfad/zu/deinem/framework
```

#### Installation

```bash
# Alle Abhängigkeiten installieren (Ruby + Node.js)
task deps:install

# Oder manuell:
bundle install
npm install
```

#### Entwicklungs-Commands

```bash
# Komplette Site bauen und servieren (Jekyll + Antora)
task site:build          # Baut alles
task site:serve          # Serviert auf http://localhost:8000/

# Nur Jekyll (Marketing-Seiten, ohne Dokumentation)
task jekyll:build        # Baut Jekyll
task jekyll:serve        # Serviert mit Live-Reload auf http://localhost:4000/

# Nur Dokumentation (Antora)
task docs:build:local    # Baut aus lokalem framework-Repository
task docs:build          # Baut aus GitHub (production-like)

# Aufräumen
task site:clean          # Entfernt alle Build-Artefakte

# Abhängigkeiten aktualisieren
task deps:update         # Aktualisiert Ruby + Node.js Dependencies
```

### Taskfile-Übersicht

Das `Taskfile.yml` definiert folgende Tasks:

| Task | Beschreibung |
|------|--------------|
| `deps:install` | Installiert Ruby + Node.js Dependencies |
| `deps:update` | Aktualisiert alle Dependencies |
| `jekyll:build` | Baut Jekyll-Site nach _site/ |
| `jekyll:serve` | Serviert Jekyll mit Live-Reload |
| `jekyll:clean` | Entfernt Jekyll-Cache |
| `docs:build` | Baut Antora-Docs aus GitHub |
| `docs:build:local` | Baut Antora-Docs aus lokalem Framework-Repo |
| `site:build` | Baut komplette Site (Jekyll + Antora) |
| `site:serve` | Serviert komplette Site (Port 8000) |
| `site:clean` | Entfernt alle Build-Artefakte |
| `validate:links` | Prüft auf defekte Links (benötigt html-proofer) |
| `validate:adoc` | Validiert AsciiDoc-Syntax im Framework-Repo |

#### Umgebungsvariablen

Die folgenden Umgebungsvariablen können zur Anpassung der Setup-Konfiguration verwendet werden:

- **LOCAL_FRAMEWORK_PATH**: Pfad zum lokalen Framework-Repository
  - Standard: `../framework` (relativ zum Website-Repository)
  - Beispiel: `export LOCAL_FRAMEWORK_PATH=/custom/path/to/framework`

### Jekyll-Konfiguration für Antora

In `_config.yml`:

```yaml
# Antora-Dateien von Jekyll-Verarbeitung ausschließen
exclude:
  - node_modules/
  - package.json
  - package-lock.json
  - antora-playbook.yml
  - antora-playbook-local.yml
  - Taskfile.yml

# Docs-Ordner bei Jekyll-Clean behalten
keep_files:
  - docs
```

**Wichtig**: `keep_files: [docs]` verhindert, dass Jekyll das von Antora generierte `docs/`-Verzeichnis löscht.

### Antora-Integration

#### Zwei Playbooks

1. **`antora-playbook.yml`** (Production):
   ```yaml
   content:
     sources:
       - url: https://github.com/WAF2p/framework.git
         branches: main
         start_path: .
   ```
   Klont Framework-Repository von GitHub (wie in Production).

2. **`antora-playbook-local.yml`** (Development):
   ```yaml
   content:
     sources:
       - url: ../framework  # Relativer Pfad zum lokalen Framework-Klon
         branches: HEAD
         start_path: .
   ```
   Liest aus lokalem Framework-Repository (schnellere Entwicklung).

#### Dependencies

In `package.json`:

```json
{
  "dependencies": {
    "@antora/cli": "^3.1.0",
    "@antora/site-generator": "^3.1.0"
  }
}
```

### GitHub Actions Workflow

Die Datei `.github/workflows/jekyll-gh-pages.yml` definiert den Deployment-Prozess:

**Build-Schritte**:
1. Checkout Repository
2. Setup Ruby (mit Bundler-Cache)
3. Setup Node.js 20
4. Install Ruby Dependencies (`bundle install`)
5. Install Node.js Dependencies (`npm install`)
6. **Build Jekyll** (`bundle exec jekyll build`)
7. **Build Antora** (`npx antora antora-playbook.yml`)
8. Verify Output (prüft ob `_site/docs/` existiert)
9. Upload Artifact
10. Deploy to GitHub Pages

**Wichtig**: Jekyll wird **vor** Antora gebaut (siehe Build-Reihenfolge oben).

### Ruby 4.0 Kompatibilität

**Problem**: jekyll-spaceship Plugin benötigt `ostruct`, das in Ruby 4.0+ nicht mehr standardmäßig verfügbar ist.

**Lösung**: In `Gemfile` hinzugefügt:

```ruby
gem 'ostruct'
```

**Hinweis**: Ruby muss korrekt in PATH konfiguriert sein (siehe Voraussetzungen oben).

### Troubleshooting

#### Problem: "Could not find gem 'ostruct'"

```bash
bundle add ostruct
bundle install
```

#### Problem: "Ruby version mismatch"

```bash
# Prüfe aktuelle Ruby-Version
ruby --version

# Nutze Homebrew Ruby
brew install ruby
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Problem: "Jekyll doesn't preserve docs/ folder"

Stelle sicher, dass `_config.yml` enthält:

```yaml
keep_files:
  - docs
```

#### Problem: "Antora build fails with 'content not found'"

Für lokale Entwicklung:
- Nutze `antora-playbook-local.yml`
- Passe den Pfad zum Framework-Repository an
- Prüfe ob Framework-Repository auf korrektem Branch ist

#### Problem: "Site serves but docs return 404"

```bash
# Überprüfe ob Antora-Output existiert
ls -la _site/docs/wafpp/1.1.0/

# Falls nicht, baue Antora neu
task docs:build:local
```

### Deployment-URLs

Nach erfolgreichem Deployment:

- **Homepage**: https://www.wombat-gov.dev/
- **Dokumentation**: https://www.wombat-gov.dev/docs/wafpp/1.1.0/
- **Blog**: https://www.wombat-gov.dev/blog/

### Entwickler-Guidelines

Detaillierte technische Standards, Code-Style und Best Practices findest du in:
- **`AGENTS.md`** in diesem Repository - Vollständige Entwickler-Guidelines

---

## 📁 Projektstruktur

```
waf2p.github.io/
├── _config.yml                    # Jekyll-Hauptkonfiguration
├── _data/                         # YAML-Datendateien
│   ├── navigation.yml             # Hauptnavigation
│   ├── footer.yml                 # Footer-Links
│   ├── conferences.yml            # Konferenzen
│   └── documentation.yml          # Dokumentations-Metadaten
├── _includes/                     # Wiederverwendbare HTML-Komponenten
│   ├── navigation.html
│   ├── footer.html
│   └── relative-src.html          # URL-Helper
├── _layouts/                      # Seitenlayouts
│   ├── default.html
│   ├── post.html
│   └── page.html
├── _plugins/                      # Custom Jekyll-Plugins (Ruby)
│   └── clean_url.rb
├── _posts/                        # Blog-Posts (Markdown)
├── _sass/                         # SCSS-Stylesheets
├── _staff_members/                # Team-Mitglieder-Profile
├── css/                           # CSS-Entry-Point
├── images/                        # Statische Bilder
├── js/                            # JavaScript-Dateien
├── Gemfile                        # Ruby-Dependencies
├── Gemfile.lock
├── package.json                   # Node.js-Dependencies (Antora)
├── package-lock.json
├── antora-playbook.yml            # Antora Production-Config
├── antora-playbook-local.yml      # Antora Local-Dev-Config
├── Taskfile.yml                   # Build-Automatisierung
├── AGENTS.md                      # Entwickler-Guidelines
├── README.md                      # Diese Datei
└── _site/                         # Build-Output (nicht versioniert)
    ├── index.html                 # Jekyll-generierte Homepage
    ├── blog/                      # Jekyll-generierter Blog
    └── docs/                      # Antora-generierte Dokumentation
        └── wafpp/
            └── 1.0/
```

---

## 🔗 Ressourcen

- **Jekyll-Dokumentation**: https://jekyllrb.com/docs/
- **Antora-Dokumentation**: https://docs.antora.org/
- **Framework-Repository**: https://github.com/WAF2p/framework
- **Live-Site**: https://www.wombat-gov.dev/
- **GitHub Actions**: https://github.com/WAF2p/waf2p.github.io/actions

---

## 🤝 Beitragen

Beiträge sind willkommen! Bitte:

1. Erstelle einen Feature-Branch
2. Mache deine Änderungen
3. Teste lokal mit `task site:build && task site:serve`
4. Erstelle einen Pull Request mit aussagekräftiger Beschreibung

Bei Fragen zur Architektur oder zum Build-Prozess siehe `AGENTS.md`.

---

**Wombat Community** | https://www.wombat-gov.dev/
