# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready Discord bot for displaying game-related details and interacting with players. Built with native Discord.js v14 and deployed via automated CI/CD pipeline.

**Key Features:**
- Hybrid command system supporting both slash commands (/) and prefix commands (!)
- Auto Chess random picks (race, class, synergy)
- Pokémon Masters sync event tracking
- Native Discord.js v14 implementation (no framework dependencies)
- Automated CI/CD deployment with GitHub Actions
- PM2 process management for zero-downtime restarts
- Environment-based configuration with dotenv

**Tech Stack:**
- Discord.js v14.25.1
- Node.js 18.x (production) / 22.x (development)
- PM2 for process management
- GitHub Actions for CI/CD
- Jest for testing
- ESLint for code quality

## Development Commands

### Local Development
```bash
npm start                # Start the bot
npm run deploy           # Deploy slash commands globally
npm run deploy:guild     # Deploy to test guild (faster)
```

### Testing & Quality
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:staged      # Run tests on staged files (git hooks)
npm run lint             # Run ESLint
npm run lint -- --fix    # Auto-fix linting errors
```

### Production PM2 Management
```bash
npm run pm2:start        # Start bot with PM2
npm run pm2:reload       # Reload bot (zero-downtime)
npm run pm2:restart      # Restart bot
npm run pm2:stop         # Stop bot
npm run pm2:logs         # View bot logs
npm run pm2:status       # Check bot status
```

## Configuration

The bot uses **environment variables only** via dotenv. No JSON configuration files are loaded.

### Setup Configuration

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env and add your credentials:**
   ```bash
   # Required
   BOT_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_application_id

   # Optional
   GUILD_ID=your_test_guild_id_optional
   PREFIX=!
   NODE_ENV=development
   EVENT_FRIDAY_TIME=20:00
   EVENT_SUNDAY_TIME=20:00
   EVENT_DURATION=2
   ```

3. **Get your Discord credentials:**
   - **BOT_TOKEN**: https://discord.com/developers/applications → Your App → Bot → Reset Token
   - **CLIENT_ID**: Same portal → General Information → Application ID
   - **GUILD_ID**: Enable Developer Mode in Discord → Right-click server → Copy ID

**Important:**
- The `.env` file is gitignored and never committed
- `config/settings.json` is **no longer used** (legacy)
- All configuration must be in `.env` or environment variables

### Configuration Loader (`helper/envHandler.js`)

Simple environment variable reader with validation:
- Reads from `process.env` (loaded by dotenv)
- Validates `BOT_TOKEN` is present
- Provides clear error messages with setup instructions
- No file I/O, no fallbacks, just environment variables

## Architecture

### Command System (Native Discord.js v14)

Custom command handler with hybrid support:

**Slash Commands** (/) - Modern Discord API
- Registered via Discord REST API (`helper/deploy-commands.js`)
- Uses `SlashCommandBuilder` for definitions
- Responds via `interaction.reply()` and `interaction.followUp()`

**Prefix Commands** (!) - Legacy support
- Custom loader from `./commands/` directory
- Responds via `message.channel.send()`
- Supports command aliases

### Directory Structure

```
/commands/                    # Command definitions
  /pmmasters/                # Pokémon Masters commands
  /autochess/                # Dota Auto Chess commands
  generalHelp.js             # General help

/service/                    # Business logic
  /autochess/               # Auto Chess services & controllers
  /pmasters/                # Pokémon Masters services & controllers
  /events/                  # Event services
  /base/                    # Shared utilities
    colorManager.js         # Color codes singleton
    reactionHandler.js      # Message reactions

/listeners/                  # Discord event listeners
  readyListener.js          # Bot ready event
  reactionListener.js       # Reaction handling

/helper/                     # Utilities
  envHandler.js             # Environment variable config
  deploy-commands.js        # Slash command deployment
  dateExtension.js          # Date formatting

/.github/workflows/          # CI/CD pipelines
  main.yml                  # Combined CI/CD workflow

/scripts/                    # Deployment scripts
  deploy.sh                 # Server deployment script

/logs/                       # PM2 logs (gitignored)
  error.log                 # Error output
  output.log                # Standard output

ecosystem.config.js          # PM2 configuration
.env                         # Environment variables (gitignored)
.env.example                 # Configuration template
package-lock.json            # Locked dependencies (committed)
```

### Service Layer Pattern

Commands delegate to controller/service layers:

**Command** → **Controller** → **Service** → **External API**

- Commands in `/commands/` use `module.exports` pattern
- Define `data` (SlashCommandBuilder) and `execute()` function
- Universal `execute()` handles both Message and Interaction
- Controllers format Discord messages and handle business logic
- Services process data and call external APIs
- Separation enables testing and maintainability

### Key Implementation Patterns

#### Hybrid Command Structure
```javascript
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/[domain]/[domain]Controller');

module.exports = {
    // Prefix command config
    name: 'commandName',
    aliases: ['alias1', 'alias2'],
    description: 'Command description',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),

    // Universal execute function
    execute: async (source, args, client) => {
        // source can be Message or Interaction
        return controller.method(source);
    }
};
```

#### Interaction Detection
```javascript
if (source.commandName) {
    // Slash command (Interaction)
    return source.reply({ embeds: [embed] });
} else {
    // Prefix command (Message)
    return source.channel.send({ embeds: [embed] });
}
```

#### Discord Embed Formatting (v14)
```javascript
const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
    .setTitle('Title')
    .setAuthor({ name: 'Author Name' })
    .setDescription('Description')
    .addFields(
        { name: 'Field 1', value: 'Value 1', inline: false },
        { name: 'Field 2', value: 'Value 2', inline: true }
    )
    .setThumbnail('https://url-to-image.png')
    .setFooter({ text: 'Footer text' });
```

**Key Changes from v12:**
- `MessageEmbed` → `EmbedBuilder`
- `setAuthor(string)` → `setAuthor({ name: string })`
- `addField()` → `addFields([...])`
- `setFooter(string)` → `setFooter({ text: string })`
- `send(embed)` → `send({ embeds: [embed] })`

### Client Configuration

**Gateway Intents (Required):**
```javascript
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // PRIVILEGED
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: [Partials.Message, Partials.Reaction]
});
```

**Critical:** MESSAGE_CONTENT intent must be enabled in Discord Developer Portal:
1. Go to https://discord.com/developers/applications
2. Select your bot → Bot section
3. Enable "MESSAGE CONTENT INTENT" under Privileged Gateway Intents

### Dependencies

**Production:**
- `discord.js` ^14.25.1 - Discord API client
- `dotenv` ^17.2.3 - Environment variable loader
- `node-html-to-image` ^3.1.0 - Dynamic image generation
- `puppeteer-cluster` ^0.22.0 - Puppeteer pooling
- `node-fetch` ^2.6.1 - HTTP client
- `request` ^2.88.2 - Legacy HTTP client (deprecated)

**Development:**
- `eslint` ^7.x - Code linting (Standard config)
- `jest` ^26.6.3 - Testing framework
- `jsdoc` ^3.6.x - Documentation generator

**Note:** 24 known vulnerabilities exist (mostly dev dependencies). These require breaking changes (jest 26→30, jsdoc 3→4) and are tracked for gradual updates.

## CI/CD & Deployment

### Automated Pipeline

**Single workflow** (`.github/workflows/main.yml`) handles everything:

**Test Job** (runs on all branches):
- Checkout code
- Install dependencies
- Run ESLint linter
- Run Jest tests
- Generate coverage report

**Deploy Job** (only on `main` branch, after tests pass):
- SSH to production server
- Pull latest code
- Install production dependencies
- Deploy slash commands
- Smart PM2 reload (auto-detects start vs reload)
- Verify deployment with health check
- Display PM2 logs

**Trigger Options:**
- Automatic: Push to `main` branch
- Manual: GitHub Actions → CI/CD workflow → Run workflow

### GitHub Secrets Required

Configure in repository Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access |
| `SERVER_HOST` | Server IP address or hostname |
| `SERVER_USER` | SSH username (e.g., ubuntu, root) |

**Note:** Bot token is stored in `.env` on server, not in GitHub Secrets.

### Deployment Flow

```
Push to main
    ↓
GitHub Actions Triggered
    ↓
Run Tests (lint + test)
    ↓
Tests Pass? → Deploy Job Starts
    ↓
SSH to Server
    ↓
Git Pull + npm ci
    ↓
Deploy Slash Commands
    ↓
Smart PM2 Reload
    ↓
Verify + Show Logs
    ↓
✅ Deployment Complete
```

### Production Setup

See **`DEPLOYMENT.md`** for complete guide. Quick steps:

1. **Provision server** (VPS with SSH)
2. **Install Node.js 18 and PM2**
3. **Clone repository** to production path
4. **Create `.env` file** with BOT_TOKEN and CLIENT_ID
5. **Start with PM2**: `npm run pm2:start`
6. **Configure GitHub Secrets**
7. **Push to main** → automatic deployment

### Monitoring

```bash
# Check bot status
pm2 status discord-gamer-bot
pm2 info discord-gamer-bot

# View logs
pm2 logs discord-gamer-bot
pm2 logs discord-gamer-bot --lines 100

# Monitor resources
pm2 monit

# Manage process
npm run pm2:reload    # Zero-downtime restart
npm run pm2:restart   # Full restart
npm run pm2:stop      # Stop bot
```

## Development Workflow

### Adding New Commands

1. **Create command file** in `/commands/[domain]/`
2. **Use hybrid command pattern:**
   - `name`, `aliases`, `description` for prefix commands
   - `data` with SlashCommandBuilder for slash commands
   - Universal `execute(source, args, client)` function
3. **Delegate to controller/service** for business logic
4. **Test locally** with `npm start`
5. **Deploy slash commands**: `npm run deploy`
6. **Commit and push** to `main` → auto-deployment

### Deploying Slash Commands

After adding or modifying commands:

```bash
# Local testing (test guild)
npm run deploy:guild

# Production (global)
npm run deploy
```

Commands register with Discord API immediately but may take up to 1 hour to propagate globally.

### Testing Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Auto-fix linting errors
npm run lint -- --fix

# Watch mode for development
npm run test:watch
```

### Local Bot Startup

```bash
# Ensure .env exists
cp .env.example .env
# Edit .env with your credentials

# Start bot
npm start
```

**Expected output:**
```
✓ Configuration loaded from environment variables
Loading commands...
Loaded command: help
Loaded command: autochessHelp
...
Loading events...
Loaded event: ready
Loaded event: messageReactionAdd
Login Done!
Started up!
Logged in as YourBot#1234
Serving X guilds
```

**Error if BOT_TOKEN missing:**
```
❌ Error: BOT_TOKEN environment variable is required

📝 Setup instructions:
  1. Copy .env.example to .env
  2. Edit .env and add your Discord bot token
  3. Run: npm start

💡 Get your bot token from:
   https://discord.com/developers/applications

📖 See DEPLOYMENT.md for detailed configuration guide
```

## Common Issues

### "Used disallowed intents" error
**Fix:** Enable MESSAGE_CONTENT intent in Discord Developer Portal

### Slash commands timeout
**Fix:**
- First response MUST use `interaction.reply()`
- Subsequent responses use `interaction.followUp()`
- Respond within 3 seconds

### Prefix commands not working
**Fix:**
- Verify bot has proper channel permissions
- Check PREFIX in `.env` matches usage
- Ensure bot token is valid

### PM2 bot won't start
**Fix:**
```bash
# Check logs
pm2 logs discord-gamer-bot

# Common issues:
# - Missing .env file
# - Invalid BOT_TOKEN
# - Missing dependencies (run npm ci --production)
```

### CI/CD deployment fails
**Fix:**
- Verify GitHub Secrets are configured
- Check SSH key has correct permissions
- Ensure server path matches workflow
- Review GitHub Actions logs for specific errors

## Code Quality Standards

### ESLint Configuration
- Standard config base
- 4-space indentation required
- Semicolons required
- Configuration in `.eslintrc.json`
- Auto-fix available: `npm run lint -- --fix`

### Testing Standards
- Jest for unit tests
- Test files alongside source: `*.test.js`
- Coverage tracking enabled
- Minimum coverage: Not enforced but encouraged

### Git Workflow
- Main branch: `main` (protected)
- All changes via pull requests recommended
- CI must pass before merge
- Auto-deployment on merge to `main`

## Additional Resources

- **Discord.js Guide**: https://discordjs.guide/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Deployment Guide**: See `DEPLOYMENT.md` in this repository
- **GitHub Actions**: https://docs.github.com/en/actions
- **Discord Developer Portal**: https://discord.com/developers/applications
