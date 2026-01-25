# Personal Website - Static Site Generator

This repository contains my personal website generated using a Rust-based static site generator.

## Overview

The website is now built using:
- **Rust** for static site generation (using minijinja templates and markdown-rs for parsing)
- **Tailwind CSS v4** standalone CLI for styling (no Node.js runtime needed)
- **Markdown** for blog posts and references content

## Building the Site

### Prerequisites

- Rust (1.70+)
- curl (for downloading Tailwind CSS CLI)

### Initial Setup

1. **Download Tailwind CSS CLI:**
   ```bash
   # For Linux x64
   curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64 -o tailwindcss
   chmod +x tailwindcss
   
   # For macOS ARM
   # curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64 -o tailwindcss
   # chmod +x tailwindcss
   
   # For macOS x64
   # curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64 -o tailwindcss
   # chmod +x tailwindcss
   ```

### Build Steps

2. **Generate CSS:**
   ```bash
   ./tailwindcss -i styles.css -o dist/styles.css --minify
   ```

3. **Build the static site generator:**
   ```bash
   cargo build --release
   ```

4. **Generate the static website:**
   ```bash
   cargo run --release
   ```

## Project Structure

```
.
├── Cargo.toml              # Rust dependencies
├── src/
│   └── main.rs             # Static site generator code
├── templates/              # Minijinja HTML templates
│   ├── base.html          # Base layout
│   ├── index.html         # Home page
│   ├── blog.html          # Blog listing
│   ├── post.html          # Individual blog post
│   ├── references.html    # References listing
│   ├── reference_detail.html # Individual reference
│   └── terms.html         # Terms page
├── posts/                  # Blog posts (Markdown)
├── references/             # References (Markdown)
├── styles.css              # Tailwind CSS source
├── tailwind.config.js      # Tailwind configuration
├── dist/                   # Generated site (git-ignored)
└── website/                # Old Next.js site (can be removed)
```

## Content Management

### Blog Posts

Blog posts are Markdown files in the `/posts` directory with frontmatter:

```markdown
---
title: 'Post Title'
date: '2024-01-01T00:00:00.000000+00:00'
tags:
  - Python
  - Backend development
excerpt: Short description of the post
thumbnail: /posts/images/post-slug/thumbnail.svg
---

Post content here...
```

### References

References are Markdown files in the `/references` directory with frontmatter:

```markdown
---
title: 'Project Title'
client: 'Client Name'
year: 2024
technologies:
  - Python
  - FastAPI
excerpt: Short description
thumbnail: /references/images/project-slug/thumbnail.jpg
---

Project details here...
```

## Deployment

The generated site in `/dist` is a static website that can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## Development

To make changes:

1. Edit templates in `/templates`
2. Edit styles in `styles.css`
3. Modify the generator logic in `src/main.rs`
4. Run `cargo run` to regenerate the site
5. Preview `dist/index.html` in a browser

## Migration from Next.js

This new system replaces the previous Next.js-based setup with a simpler, faster Rust-based generator that:
- ✅ Requires no Node.js runtime
- ✅ Generates identical HTML output
- ✅ Uses the same styling (Tailwind CSS)
- ✅ Keeps all blog posts and references in Markdown
- ✅ Builds significantly faster
- ✅ Produces pure static HTML with no JavaScript framework overhead
