#!/bin/bash
# Simplified deployment script for Discord Gamer Bot
# PM2 orchestration is now handled by GitHub Actions workflow
# This script focuses on code updates and dependency management

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Navigate to bot directory
cd /opt/discord-gamer-bot || exit 1

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci --production

echo "🔄 Deploying slash commands..."
node helper/deploy-commands.js

echo "✅ Deployment preparation complete!"
echo "Note: PM2 start/reload is handled by the GitHub Actions workflow"
