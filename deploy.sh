#!/bin/bash

# 🚀 Quick Deploy Script for GitHub Pages
# Run this script to build and push your widget updates

echo "🔨 Building widget..."
npm run build

echo "📦 Copying files to public directory..."
cp dist/swap-bridge-widget.css public/
cp dist/swap-bridge-widget.umd.js public/swap-bridge-widget.js

echo "📝 Staging changes..."
git add .

echo "💬 Enter commit message (or press Enter for default):"
read -r commit_message

if [ -z "$commit_message" ]; then
  commit_message="Update widget build $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "📋 Committing with message: $commit_message"
git commit -m "$commit_message"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done! Your widget will be deployed in 2-3 minutes."
echo "🌐 Check your GitHub repository's Actions tab for deployment status."
echo "📍 Your widget will be available at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.js"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/swap-bridge-widget.css"