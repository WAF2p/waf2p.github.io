# AGENTS.md - WAF++ Jekyll Site

This file provides guidelines for agentic coding assistants working on the WAF++ website codebase.

## Project Overview

**Type**: Static website built with Jekyll  
**Purpose**: WAF++ community-driven, cloud-agnostic framework documentation and website  
**Deployment**: GitHub Pages via GitHub Actions  
**URL**: https://waf2p.dev/

## Build, Test & Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Serve locally with live reload (default: http://localhost:4000)
bundle exec jekyll serve

# Serve with drafts included
bundle exec jekyll serve --drafts

# Build site for production
bundle exec jekyll build

# Build with verbose output for debugging
bundle exec jekyll build --verbose
```

### Testing
```bash
# Check for broken links (requires html-proofer gem)
bundle exec htmlproofer ./_site --disable-external

# Validate YAML data files
ruby -e "require 'yaml'; YAML.load_file('_data/navigation.yml')"

# Test a specific Ruby plugin
ruby _plugins/clean_url.rb
```

### Deployment
- **Automatic**: Push to `main` branch triggers GitHub Actions workflow
- **Workflow**: `.github/workflows/jekyll-gh-pages.yml`
- **Manual**: Run workflow from Actions tab in GitHub

## Project Structure

```
├── _config.yml           # Jekyll configuration
├── _data/                # YAML data files (navigation, conferences, etc.)
├── _includes/            # Reusable HTML components
├── _layouts/             # Page layouts (default, docs, post, etc.)
├── _plugins/             # Custom Jekyll plugins (Ruby)
├── _posts/               # Blog posts (Markdown with YAML front matter)
├── _sass/                # SCSS stylesheets
├── _staff_members/       # Team member profiles
├── css/                  # Main CSS entry point
├── images/               # Static images
├── js/                   # JavaScript files
└── Gemfile               # Ruby dependencies
```

## Code Style Guidelines

### File Naming Conventions

**Posts**: `YYYY-MM-DD-title-with-hyphens.md`  
**Data files**: `lowercase_with_underscores.yml`  
**Layouts**: `lowercase_with_underscores.html`  
**SCSS partials**: `_partial-name.scss`  
**Ruby plugins**: `snake_case.rb`

### YAML Front Matter

All content files must include YAML front matter:

```yaml
---
layout: post                    # Required: layout name
title: "Your Title Here"        # Required: page title
date: YYYY-MM-DD               # Required for posts
categories:                     # Optional: for posts
  - cloud
  - security
author_staff_member: name       # Optional: links to _staff_members
---
```

### HTML/Liquid Templates

**Indentation**: 4 spaces (not tabs)  
**Liquid tags**: Use spacing for readability: `{% if condition %}` not `{%if condition%}`  
**Include files**: Reference with `{% include file.html %}`  
**Relative URLs**: Always use `{% include relative-src.html src=link %}` for internal links

**Example**:
```liquid
{% for link in site.data.navigation %}
    {% assign class = "" %}
    {% if link.highlight %}
        {% assign class = class | append: " highlight" %}
    {% endif %}
    <li class="{{ class }}">
        <a href="{% include relative-src.html src=link.link %}">
            {{ link.name }}
        </a>
    </li>
{% endfor %}
```

### Ruby Plugin Guidelines

**Module naming**: Use `Jekyll::` namespace  
**Filter registration**: Always register with `Liquid::Template.register_filter`  
**Method naming**: Use `snake_case`  
**Input handling**: Convert to string with `.to_s` before processing

**Example**:
```ruby
module Jekyll
  module CleanUrl
    def clean_url(input)
      input.to_s.gsub(/\s+/, '')
    end
  end
end

Liquid::Template.register_filter(Jekyll::CleanUrl)
```

### SCSS/CSS Conventions

**Variables**: Prefix with `$`, use kebab-case: `$brand-color`, `$secondary-brand-color`  
**Breakpoints**: Defined in `_sass/variables.scss` - use existing breakpoints  
**File organization**: One concern per file (navigation.scss, footer.scss, etc.)  
**Nesting**: Maximum 3 levels deep  
**Colors**: Use variables from `variables.scss`, not hardcoded hex values

**Example**:
```scss
.main-nav {
    background-color: $brand-color;
    
    @media #{$desktop} {
        display: flex;
    }
}
```

### JavaScript Guidelines

**Style**: ES5 compatible for broader browser support  
**Event listeners**: Use `addEventListener`, not inline handlers  
**DOM ready**: Wrap in `DOMContentLoaded` event  
**Variable naming**: camelCase for variables, PascalCase for constructors

**Example**:
```javascript
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
    }
});
```

## Content Guidelines

### Blog Posts

- Store in `_posts/` directory
- Use Markdown format
- Include proper front matter with date, title, categories
- Link to author via `author_staff_member` field
- Reference `_posts/_defaults.md` for template

### Data Files

- Store structured data in `_data/` as YAML
- Use consistent key naming (lowercase, underscores)
- Validate YAML syntax before committing
- Common data files: `navigation.yml`, `footer.yml`, `conferences.yml`, `documentation.yml`

### Images

- Store in `images/` directory
- Use descriptive filenames: `waf++7p2.png`, `governance.jpg`
- Optimize images before committing (compress, appropriate size)
- Reference with `{{ site.baseurl }}/images/filename.png`

## Git Workflow

**Branch**: Work on `main` branch (single-branch workflow)  
**Commits**: Use descriptive messages in German or English  
**Pull Requests**: Review before merging (if team workflow)  
**CI/CD**: Automatic deployment on push to main

## Common Tasks

### Adding a New Blog Post

1. Create file: `_posts/YYYY-MM-DD-title.md`
2. Add front matter with layout, title, date, categories
3. Write content in Markdown
4. Commit and push to trigger build

### Adding a Navigation Item

1. Edit `_data/navigation.yml`
2. Add entry with `name`, `link`, optional `highlight` and `new_window`
3. Validate YAML syntax
4. Deploy

### Creating a New Page

1. Create `.html` file in root or subdirectory
2. Add YAML front matter with `layout: page`
3. Content can be HTML or Markdown
4. Link from navigation or other pages

### Adding a Team Member

1. Create file in `_staff_members/name.md`
2. Use front matter from `_staff_members/_defaults.md`
3. Include image reference and bio
4. Member appears automatically on relevant pages

## Important Notes

- **No Node.js**: This is a pure Ruby/Jekyll project
- **No package.json**: Dependencies managed via Bundler (Gemfile)
- **Jekyll Spaceship**: Enabled for Mermaid diagrams, PlantUML, math expressions
- **SEO**: jekyll-seo-tag plugin handles meta tags automatically
- **Sitemap**: Auto-generated by jekyll-sitemap plugin
- **Feed**: RSS feed auto-generated at `/feed.xml`

## Troubleshooting

**Build fails**: Check `_config.yml` syntax and plugin compatibility  
**Styles not updating**: Clear Jekyll cache with `bundle exec jekyll clean`  
**Links broken**: Verify use of `relative-src.html` include  
**YAML errors**: Validate with `ruby -e "require 'yaml'; YAML.load_file('file.yml')"`

---

**Last Updated**: 2026-01-31  
**Maintained By**: WAF++ Community
