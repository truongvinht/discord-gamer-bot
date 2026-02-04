# Deployment Guide

Complete deployment guide for Discord Gamer Bot using GitHub Actions CI/CD with PM2.

## Table of Contents

- [Configuration](#configuration)
- [Local Development](#local-development)
- [Server Setup (One-Time)](#server-setup-one-time)
- [GitHub Configuration](#github-configuration)
- [Deployment Workflow](#deployment-workflow)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Configuration

The bot uses environment variables loaded from a `.env` file. This approach keeps secrets secure and configuration simple.

### Required Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Required
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id

# Optional
GUILD_ID=your_test_guild_id
PREFIX=!
NODE_ENV=production
EVENT_FRIDAY_TIME=19:00
EVENT_SUNDAY_TIME=15:00
EVENT_DURATION=2
```

### Getting Discord Credentials

1. **BOT_TOKEN**:
   - Go to https://discord.com/developers/applications
   - Select your application
   - Navigate to "Bot" section
   - Click "Reset Token" and copy the token
   - ⚠️ **Never commit this token to git!**

2. **CLIENT_ID**:
   - Same Discord Developer Portal
   - Found under "General Information" → "Application ID"

3. **GUILD_ID** (Optional, for testing):
   - Enable Developer Mode in Discord Settings → Advanced
   - Right-click your server → Copy ID

## Local Development

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/truongvinht/discord-gamer-bot.git
   cd discord-gamer-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env and add your bot credentials
   ```

4. **Deploy slash commands:**
   ```bash
   npm run deploy
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

### Development Commands

```bash
# Local development
npm start              # Start the bot
npm run deploy         # Deploy slash commands globally
npm run deploy:guild   # Deploy to test guild (faster)

# Testing and quality
npm run lint           # Run ESLint
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Production PM2 management
npm run pm2:start      # Start bot with PM2
npm run pm2:reload     # Reload bot (zero-downtime)
npm run pm2:restart    # Restart bot
npm run pm2:stop       # Stop bot
npm run pm2:logs       # View bot logs
npm run pm2:status     # Check bot status
```

## Server Setup (One-Time)

This setup is performed once on your VPS/server.

### Prerequisites

- Ubuntu/Debian server with SSH access
- Root or sudo privileges
- Git installed

### Step 1: Install Node.js

```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Step 2: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 3: Setup Bot Directory

```bash
# Create directory (adjust path to match your deployment location)
mkdir -p /home/ubuntu/Documents/development
cd /home/ubuntu/Documents/development

# Clone repository
git clone https://github.com/truongvinht/discord-gamer-bot.git
cd discord-gamer-bot

# Install dependencies
npm ci --production
```

### Step 4: Create .env File

```bash
# Create .env file with your credentials
nano .env
```

Add your configuration:
```bash
BOT_TOKEN=your_actual_bot_token_here
CLIENT_ID=your_actual_client_id_here
PREFIX=!
NODE_ENV=production
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X)

⚠️ **Important**: This .env file stays on the server and is never modified by deployments.

### Step 5: Create Logs Directory

```bash
mkdir -p logs
```

### Step 6: Deploy Slash Commands

```bash
node helper/deploy-commands.js
```

### Step 7: Start Bot with PM2

```bash
# Start the bot
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed (run the command it gives you with sudo)

# Check bot status
pm2 status
pm2 logs discord-gamer-bot
```

### Step 8: Configure Firewall (Optional)

The bot only needs outbound connections to Discord. No inbound ports required.

```bash
# If using UFW
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

## GitHub Configuration

### Required GitHub Secrets

Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST` | Server hostname or IP address | `123.45.67.89` or `bot.example.com` |
| `SERVER_USER` | SSH username | `ubuntu` or `root` |

### Generating SSH Key for Deployment

On your **local machine**:

```bash
# Generate SSH key pair (without passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
# Press Enter twice (no passphrase)

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server

# Get private key content for GitHub Secret
cat ~/.ssh/github_deploy
# Copy the entire output (including BEGIN and END lines)
```

Add the private key content to GitHub Secrets as `SSH_PRIVATE_KEY`.

### Testing SSH Connection

```bash
# Test connection from local machine
ssh -i ~/.ssh/github_deploy user@your-server

# Test the deployment script
bash /opt/discord-gamer-bot/scripts/deploy.sh
```

## Deployment Workflow

### Automatic Deployment

The bot uses a **combined CI/CD workflow** (`.github/workflows/main.yml`) that:

**On every push/PR (all branches):**
- ✅ Runs tests (lint, test, coverage)
- ✅ Provides immediate feedback

**On push to `main` branch only:**
- ✅ Waits for tests to pass
- ✅ Deploys to production server via SSH
- ✅ Smart PM2 start/reload (auto-detects if bot is running)
- ✅ Verifies deployment with health check
- ✅ Displays PM2 logs for debugging

### Manual Deployment

**Via GitHub Actions (Recommended):**
1. Go to Actions tab in GitHub
2. Select "CI/CD" workflow
3. Click "Run workflow" → Select `main` branch → Run
4. Watch deployment progress in real-time

**Via SSH (Direct):**
```bash
ssh user@your-server
cd /opt/discord-gamer-bot

# Run deployment prep
bash scripts/deploy.sh

# Then manually restart PM2
npm run pm2:reload  # or pm2:restart
```

### Deployment Process

**Automated workflow performs:**

1. **Test Job** (runs on all branches)
   - Checkout code
   - Install dependencies
   - Run linter and tests

2. **Deploy Job** (only on main branch, after tests pass)
   - SSH to server
   - Pull latest code
   - Install dependencies
   - Deploy slash commands
   - Smart PM2 reload (or start if not running)
   - Show PM2 logs

3. **Verification Step**
   - Check PM2 process status
   - Verify bot is online
   - Exit with error if bot is not running

### Rollback Procedure

If a deployment causes issues:

```bash
# SSH to server
ssh user@your-server
cd /opt/discord-gamer-bot

# View git log
git log --oneline -10

# Rollback to previous version
git reset --hard <commit-hash>

# Reinstall dependencies
npm ci --production

# Restart bot
pm2 restart discord-gamer-bot
```

## Monitoring & Maintenance

### PM2 Commands

```bash
# View bot status
pm2 status

# View live logs
pm2 logs discord-gamer-bot

# View last 100 log lines
pm2 logs discord-gamer-bot --lines 100

# Monitor resources
pm2 monit

# Restart bot
pm2 restart discord-gamer-bot

# Reload bot (graceful restart)
pm2 reload discord-gamer-bot

# Stop bot
pm2 stop discord-gamer-bot

# Delete from PM2
pm2 delete discord-gamer-bot
```

### Log Files

Logs are stored in the `logs/` directory:
- `logs/error.log` - Error messages
- `logs/output.log` - Standard output

```bash
# View recent errors
tail -f /opt/discord-gamer-bot/logs/error.log

# View output logs
tail -f /opt/discord-gamer-bot/logs/output.log
```

### Server Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Update PM2
sudo npm install -g pm2@latest
pm2 update
```

## Troubleshooting

### Bot Won't Start

**Check PM2 status:**
```bash
pm2 status
pm2 logs discord-gamer-bot --lines 50
```

**Common issues:**

1. **Missing BOT_TOKEN:**
   - Verify `.env` file exists: `cat /opt/discord-gamer-bot/.env`
   - Check BOT_TOKEN is set correctly

2. **Module not found:**
   ```bash
   cd /opt/discord-gamer-bot
   npm ci --production
   pm2 restart discord-gamer-bot
   ```

3. **Permission errors:**
   ```bash
   sudo chown -R $USER:$USER /opt/discord-gamer-bot
   ```

### Deployment Fails

**Check GitHub Actions logs:**
- Go to repository → Actions → Select failed workflow
- Review error messages in deployment step

**Common issues:**

1. **SSH connection failed:**
   - Verify SSH key is correct in GitHub Secrets
   - Test SSH connection manually
   - Check server firewall allows SSH (port 22)

2. **Deploy script errors:**
   - SSH to server and run script manually:
     ```bash
     bash /opt/discord-gamer-bot/scripts/deploy.sh
     ```
   - Check for specific error messages

### Slash Commands Not Working

**Redeploy commands:**
```bash
cd /opt/discord-gamer-bot
node helper/deploy-commands.js
```

**Check Discord Developer Portal:**
- Verify bot is invited to server with proper permissions
- Confirm MESSAGE_CONTENT intent is enabled (if using prefix commands)

### Bot Disconnects Frequently

**Check PM2 logs:**
```bash
pm2 logs discord-gamer-bot --lines 100
```

**Common causes:**
- Invalid bot token
- Network connectivity issues
- Memory limit exceeded (check PM2 config)

**Increase memory limit in ecosystem.config.js:**
```javascript
max_memory_restart: '1G'  // Increase from 500M
```

### CI Tests Fail

**Run tests locally:**
```bash
npm test
npm run lint
```

**Fix linting errors:**
```bash
npm run lint -- --fix
```

## Additional Resources

- [Discord.js Guide](https://discordjs.guide/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Discord Developer Portal](https://discord.com/developers/applications)

## Support

For issues or questions:
- GitHub Issues: https://github.com/truongvinht/discord-gamer-bot/issues
- Discord.js Support: https://discord.gg/djs
