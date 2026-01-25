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

### Build Steps

```bash
# Install all dependencies (Rust tools + Tailwind CSS CLI)
just install

# Build the site
just build

# Development mode with auto-reload
just dev
```

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
```

## Content Management

### Blog Posts

Blog posts are Markdown files in the `../posts` directory with frontmatter:

```markdown
---
title: "Post Title"
date: "2024-01-01T00:00:00.000000+00:00"
tags:
    - Python
    - Backend development
excerpt: Short description of the post
thumbnail: /posts/images/post-slug/thumbnail.svg
---

Post content here...
```
