#!/bin/bash

# Setup script for git hooks
# Run this once after cloning the repository to enable documentation checks

set -e

echo "🔧 Setting up git hooks..."

# Make the pre-commit hook executable
chmod +x scripts/hooks/pre-commit

# Create symlink in .git/hooks (or copy if symlink fails)
if [ -d .git/hooks ]; then
  if ln -sf ../../scripts/hooks/pre-commit .git/hooks/pre-commit 2>/dev/null; then
    echo "✓ Pre-commit hook installed (symlink)"
  else
    cp scripts/hooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✓ Pre-commit hook installed (copy)"
  fi
else
  echo "⚠️  .git/hooks directory not found. Are you in the project root?"
  exit 1
fi

# Make check-docs script executable
chmod +x scripts/check-docs.mjs

echo "✓ Documentation checker ready"
echo ""
echo "📝 The pre-commit hook will now check documentation before each commit."
echo "   To bypass: git commit --no-verify"
echo ""
