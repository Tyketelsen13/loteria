#!/bin/bash

# Lotería Game - Vercel Deployment Fix Script
# Date: July 24, 2025
# Issue: API routes returning 404 on Vercel

echo "🔧 Deploying Lotería Game with API Route Fixes..."

# 1. Install git if not available
echo "Step 1: Ensure git is installed"
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git for Windows from: https://git-scm.com/download/win"
    echo "Then run this script again."
    exit 1
fi

# 2. Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# 3. Add all files
echo "📁 Adding all project files..."
git add .

# 4. Commit changes
echo "💾 Committing changes..."
git commit -m "Fix API routes deployment - Remove standalone output, simplify vercel.json

- Remove output: 'standalone' from next.config.ts (causes API route issues on Vercel)
- Simplify vercel.json configuration
- Add test-page endpoint for debugging
- Update MongoDB connection optimizations

This should fix the 404 errors on /api/test-vercel-mongo and other API routes."

# 5. Push to GitHub (you'll need to set up the remote)
echo "🚀 Ready to push to GitHub..."
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "3. Run: git push -u origin main"
echo "4. Connect the GitHub repo to Vercel"
echo ""
echo "🎯 The API route fixes are now ready for deployment!"
