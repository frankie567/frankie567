# Justfile for personal website build automation

# Default recipe - show available commands
default:
    @just --list

# Install all dependencies (Rust tools and Tailwind CSS CLI)
install:
    @echo "Installing dependencies..."
    @echo "Checking Rust installation..."
    @rustc --version || (echo "Rust not found. Install from https://rustup.rs/" && exit 1)
    @cargo --version
    @echo "Verifying Rust version (requires 1.85.0 or later for edition 2024)..."
    @rustc --version | grep -qE "1\.(8[5-9]|9[0-9]|[0-9]{3,})\." || \
        (echo "Error: Rust 1.85.0 or later required. Current version:" && rustc --version && \
         echo "Update with: rustup update" && exit 1)
    @echo "Installing Rust dev tools..."
    @cargo install cargo-watch simple-http-server
    @echo "Downloading Tailwind CSS v4 CLI..."
    @if [ ! -f tailwindcss ]; then \
        if [ "$(uname -s)" = "Darwin" ]; then \
            if [ "$(uname -m)" = "arm64" ]; then \
                curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64 -o tailwindcss; \
            else \
                curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64 -o tailwindcss; \
            fi \
        else \
            curl -sL https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64 -o tailwindcss; \
        fi && \
        chmod +x tailwindcss; \
    else \
        echo "Tailwind CSS CLI already installed"; \
    fi
    @echo "Building Rust dependencies..."
    @cargo build --release
    @echo "✓ Installation complete!"

# Build the static website
build:
    @echo "Building static website..."
    @cargo run --release
    @echo "✓ Build complete! Output in dist/"

# Development mode with file watching and local server
dev:
    @echo "Starting development server..."
    @echo "This will watch for changes and rebuild automatically"
    @just _dev-parallel

# Internal: Run dev server and watcher in parallel
_dev-parallel:
    #!/usr/bin/env bash
    set -euo pipefail
    
    # Check that required tools are installed
    if ! command -v cargo-watch &> /dev/null; then
        echo "Error: cargo-watch not found. Run 'just install' first."
        exit 1
    fi
    
    if ! command -v simple-http-server &> /dev/null; then
        echo "Error: simple-http-server not found. Run 'just install' first."
        exit 1
    fi
    
    # Build initially
    echo "Initial build..."
    cargo run --release
    
    # Start Rust HTTP server in background
    echo "Starting HTTP server on http://localhost:8000"
    (cd dist && simple-http-server -p 8000 -i > /dev/null 2>&1) &
    SERVER_PID=$!
    
    # Cleanup function
    cleanup() {
        echo ""
        echo "Shutting down..."
        kill $SERVER_PID 2>/dev/null || true
        exit 0
    }
    trap cleanup INT TERM
    
    echo "Watching for changes (press Ctrl+C to stop)..."
    echo "Open http://localhost:8000 in your browser"
    echo ""
    
    # Use cargo-watch to watch for file changes
    cargo-watch -x 'run --release' -w src -w templates -w styles.css -w posts -w references -w public

# Clean build artifacts
clean:
    @echo "Cleaning build artifacts..."
    @cargo clean
    @rm -rf dist
    @echo "✓ Clean complete!"

# Run tests (if any)
test:
    @cargo test

# Format Rust code
fmt:
    @cargo fmt

# Check Rust code without building
check:
    @cargo check
