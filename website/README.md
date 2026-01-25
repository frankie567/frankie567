# Personal Website - Static Site Generator

This directory contains the Rust-based static site generator for my personal website.

## Overview

The website is built using:
- **Rust** for static site generation (using minijinja templates and markdown-rs for parsing)
- **Tailwind CSS v4** standalone CLI for styling (no Node.js runtime needed)
- **Markdown** for blog posts content

## Building the Site

### Prerequisites

- **Rust 1.85.0 or later** (required for Rust edition 2024)
  - Install or update: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Update existing: `rustup update`
- **Just** (command runner, optional but recommended): `cargo install just`
- **curl** (for downloading Tailwind CSS CLI)

### Initial Setup

1. **Download Tailwind CSS v4 CLI:**
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

#### Option 1: Using Justfile (Recommended)

If you have `just` installed:

```bash
# Install all dependencies (Rust tools + Tailwind CSS CLI)
just install

# Build the site
just build

# Development mode with auto-reload
just dev
```

#### Option 2: Manual Steps

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

   This will:
   - Parse all blog posts from `../posts`
   - Generate HTML files in `/dist`
   - Copy static assets (images, logos, etc.)
   - Generate an Atom feed
   - Automatically build CSS if Tailwind binary exists

## Project Structure

```
website/
├── Cargo.toml              # Rust dependencies
├── src/
│   └── main.rs             # Static site generator code
├── templates/              # Minijinja HTML templates
│   ├── base.html          # Base layout
│   ├── index.html         # Home page
│   ├── blog.html          # Blog listing
│   ├── post.html          # Individual blog post
│   └── terms.html         # Terms page
├── styles.css              # Tailwind CSS source
├── dist/                   # Generated site (git-ignored)
└── README.md              # This file

../posts/                   # Blog posts (Markdown)
../images/                  # Images and assets
../logo/                    # Logo files
```

## Content Management

### Blog Posts

Blog posts are Markdown files in the `../posts` directory with frontmatter:

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
- ✅ Uses the same styling (Tailwind CSS v4)
- ✅ Keeps all blog posts in Markdown
- ✅ Builds significantly faster (<1 second)
- ✅ Produces pure static HTML with no JavaScript framework overhead
- ✅ Uses native Rust syntax highlighting (syntect)
