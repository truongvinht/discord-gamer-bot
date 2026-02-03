![Node.js CI](https://github.com/truongvinht/discord-gamer-bot/workflows/Node.js%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/truongvinht/discord-gamer-bot/badge.svg?branch=master)](https://coveralls.io/github/truongvinht/discord-gamer-bot?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Discord Gamer Bot

Discord bot for displaying game-related details and interacting with players. Built with native Discord.js v14 featuring hybrid command support (Slash + Prefix commands).

## Features

- 🎮 **Multi-Game Support**: Auto Chess, Pokémon Masters
- ⚡ **Hybrid Commands**: Slash commands (`/`) and prefix commands (`!`)
- 🚀 **Discord.js v14**: Native implementation with modern Discord API
- 📦 **Easy Deployment**: Automated deployment scripts for global and guild-specific commands
- 🧪 **Testing**: Jest test suite with coverage reporting

## Supported Games

### Auto Chess (Dota Auto Chess)
- `/acrace` - Random race pick for players
- `/acclass` - Random class pick for players
- `/acany` - Random synergy (race/class) pick for players
- `/achelp` - Show Auto Chess commands

### Pokémon Masters
- `/pmevent` - Display current sync pair events
- `/pmhelp` - Show Pokémon Masters commands

## Requirements

- Node.js 18.x or higher
- Discord Bot Token
- Discord Application with proper intents enabled:
  - ✅ Message Content Intent (for prefix commands)
  - ✅ Bot scope with `applications.commands`

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/truongvinht/discord-gamer-bot.git
cd discord-gamer-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

Copy the example settings and add your bot token:

```bash
cp template/example_settings.json config/settings.json
```

Edit `config/settings.json`:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "prefix": "!"
}
```

Or use environment variables:
- `BOT_TOKEN` - Your Discord bot token
- `PREFIX` - Command prefix (default: `!`)

### 4. Deploy Slash Commands

**For immediate activation (guild-specific):**
```bash
npm run deploy:guild YOUR_GUILD_ID
```

**For all servers (takes up to 1 hour):**
```bash
npm run deploy
```

### 5. Start Bot

```bash
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the bot |
| `npm run deploy` | Deploy slash commands globally (1 hour activation) |
| `npm run deploy:guild <GUILD_ID>` | Deploy slash commands to specific server (instant) |
| `npm run cleanup` | Delete all registered slash commands |
| `npm run cleanup -- list` | List all registered commands |
| `npm run cleanup -- <name>` | Delete specific command by name |
| `npm run invite` | Generate bot invite link with proper permissions |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Run ESLint |

## Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to "Bot" section and create bot
4. Copy bot token to `config/settings.json`

### 2. Enable Required Intents

In Discord Developer Portal → Bot:
- ✅ **Message Content Intent** (required for prefix commands)

### 3. Invite Bot to Server

Generate invite link:
```bash
npm run invite
```

Or manually construct:
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=277025508416&scope=bot%20applications.commands
```

**Required Permissions:**
- Send Messages
- Embed Links
- Add Reactions
- Read Message History
- Use Slash Commands

## Usage

### Slash Commands (Modern)
```
/acclass            - Random Auto Chess class
/acclass players:Name1 Name2  - Multiple players
```

### Prefix Commands (Legacy)
```
!acclass           - Random Auto Chess class
!acclass Name1 Name2  - Multiple players
```

## Development

### Project Structure

```
/commands/          - Command definitions (hybrid slash + prefix)
  /autochess/      - Auto Chess commands
  /pmmasters/      - Pokémon Masters commands
/service/          - Business logic layer
  /autochess/      - Auto Chess services & controllers
  /pmasters/       - Pokémon Masters services & controllers
  /base/           - Shared utilities
/listeners/        - Event listeners (ready, reactions)
/helper/           - Shared helper functions
/config/           - Configuration files
/template/         - Configuration templates
```

### Adding New Commands

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines including:
- Command structure and patterns
- Hybrid command implementation
- Discord.js v14 best practices
- Testing guidelines

### Code Quality

- **Linting**: ESLint with Standard config
- **Testing**: Jest with coverage reporting
- **Indentation**: 4 spaces
- **Semicolons**: Required

```bash
npm run lint           # Check code quality
npm test              # Run test suite
npm run test:coverage # Generate coverage
```

## Troubleshooting

### "Unknown Integration" Error
- Bot was invited without `applications.commands` scope
- **Solution**: Re-invite bot using invite link from `npm run invite`

### "Application didn't respond" Timeout
- Slash commands must respond within 3 seconds
- **Fixed**: Async/await chain properly implemented in v1.5.0

### Prefix Commands Not Working
- Message Content Intent not enabled
- **Solution**: Enable in Discord Developer Portal → Bot → Privileged Gateway Intents

### Slash Commands Not Appearing
- Global commands take up to 1 hour to activate
- **Solution**: Use `npm run deploy:guild <GUILD_ID>` for instant activation

## Migration from v12

The bot has been fully migrated from Discord.js v12 + Akairo to Discord.js v14 with native implementation. Key changes:

- ❌ Removed: Discord Akairo framework
- ❌ Removed: Yuanshen (Genshin Impact) commands
- ❌ Removed: TGTG (Too Good To Go) integration
- ❌ Removed: Heroku deployment support
- ✅ Added: Native Discord.js v14 slash commands
- ✅ Added: Hybrid command system (slash + prefix)
- ✅ Added: Modern deployment utilities
- ✅ Updated: All imports to Discord.js v14 API

## Contributing

See [QUICK_START.md](QUICK_START.md) for quick development setup.

## License

MIT License (MIT)

Copyright (c) 2025 Truong Vinh Tran

See [LICENSE](LICENSE) file for details.

## Links

- [Repository](https://github.com/truongvinht/discord-gamer-bot)
- [Issues](https://github.com/truongvinht/discord-gamer-bot/issues)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
