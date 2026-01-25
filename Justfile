# Justfile for personal website build automation

# Default recipe - show available commands
default:
    @just --list

# Install all dependencies (Rust and Tailwind CSS CLI)
install:
    @echo "Installing dependencies..."
    @echo "Checking Rust installation..."
    @rustc --version || (echo "Rust not found. Install from https://rustup.rs/" && exit 1)
    @cargo --version
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
    
    # Build initially
    echo "Initial build..."
    cargo run --release
    
    # Start simple HTTP server in background
    echo "Starting HTTP server on http://localhost:8000"
    (cd dist && python3 -m http.server 8000 > /dev/null 2>&1) &
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
    
    # Use cargo-watch if available, otherwise use a simple loop
    if command -v cargo-watch &> /dev/null; then
        cargo-watch -x 'run --release' -w src -w templates -w styles.css -w posts -w references -w public
    else
        echo "Note: Install cargo-watch for better file watching: cargo install cargo-watch"
        echo "Using basic file watching..."
        
        LAST_MODIFIED=0
        while true; do
            # Check if any relevant files have changed
            CURRENT=$(find src templates styles.css posts references public -type f -newer dist 2>/dev/null | wc -l)
            if [ "$CURRENT" -gt 0 ]; then
                echo "Changes detected, rebuilding..."
                cargo run --release
                echo "✓ Rebuild complete"
            fi
            sleep 2
        done
    fi

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
