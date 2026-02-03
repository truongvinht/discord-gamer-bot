# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discord bot for displaying game-related details and interacting with players. Built with Discord.js v12 and Discord-Akairo framework. The bot provides commands for multiple games including Pokémon Masters and Dota Auto Chess.

## Development Commands

### Running the Bot
```bash
npm start                # Start the bot
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:staged      # Run tests on staged files (for git hooks)
```

### Code Quality
```bash
npm run lint             # Run ESLint on entire project
```

### Linting Rules
- Uses ESLint with Standard config
- Custom rules: 4-space indentation, semicolons required
- Configuration in `.eslintrc.json`

## Architecture

### Framework Structure (Discord-Akairo)

The bot uses Discord-Akairo's command framework with three main handler types:

1. **CommandHandler** (`./commands/`) - Handles all bot commands
   - Auto-loads all command files from subdirectories
   - Commands extend `Command` class with aliases support
   - Commands delegate logic to controllers/services

2. **InhibitorHandler** (`./inhibitors/`) - Command execution guards
   - Example: `preventDmInhibitor.js` blocks commands in DMs

3. **ListenerHandler** (`./listeners/`) - Event listeners
   - `readyListener.js` - Bot ready event
   - `reactionListener.js` - Message reaction handling

### Directory Structure

```
/commands/           # Command definitions (thin wrappers)
  /pmmasters/       # Pokémon Masters commands
  /autochess/       # Dota Auto Chess commands
  generalHelp.js    # General help command

/service/           # Business logic layer
  /autochess/       # Auto Chess services
  /pmasters/        # Pokémon Masters services
  /base/            # Shared utilities
    colorManager.js # Singleton for color codes

/helper/           # Shared utilities
  envHandler.js    # Configuration and environment variable management
  dateExtension.js # Date formatting utilities

/config/           # Configuration files
  settings.json    # Bot configuration (gitignored)

/template/         # Template files
  example_settings.json  # Configuration template
```

### Configuration System (`helper/envHandler.js`)

Hierarchical configuration loading:
1. Attempts to load `config/settings.json`
2. Falls back to `template/example_settings.json`
3. Overrides with environment variables (for Heroku deployment)

Required configuration keys:
- `token` / `BOT_TOKEN` - Discord bot token
- `prefix` / `PREFIX` - Command prefix (default: `!`)
- `po_user` / `PO_USER` - Pushover user key
- `po_token` / `PO_TOKEN` - Pushover API token

### Service Layer Pattern

Commands are thin wrappers that delegate to controller/service layers:

**Command** → **Controller/Service** → **External API** (if applicable)

- Commands in `/commands/` extend Discord-Akairo's `Command` class
- They delegate business logic to service files in `/service/`
- Services handle Discord message formatting, data processing, and external API calls
- This separation keeps commands lightweight and makes business logic testable

### Key Patterns

#### Image Generation
Uses `node-html-to-image` with Puppeteer for dynamic content:
- Services generate HTML templates
- Controllers convert to Discord attachments
- Puppeteer args include `--no-sandbox` for Heroku compatibility

#### Async Message Chains
Controllers use recursive async patterns for batched messages:
```javascript
function sendMultipleMessages(message, dataList) {
    if (dataList.length > 0) {
        const data = dataList.shift();
        message.channel.send(embed).then(msg => {
            sendMultipleMessages(msg, dataList); // Recursive call
        });
    }
}
```

#### Discord Embed Formatting
- Use `Discord.MessageEmbed()` for rich messages
- Set color with `colorManager` singleton from `/service/base/colorManager.js`
- Add reactions with `msg.react('emoji')`
- Handle typing indicators: `startTyping()` / `stopTyping()`

### Testing

- Jest test environment configured for Node.js
- Test files located alongside source files: `*.test.js`
- Example: `service/autochess/autochessService.test.js`
- Coverage ignores `node_modules`

### External Dependencies

Key dependencies:
- `discord-akairo` ^8.1.0 - Command framework
- `discord.js` ^12.5.3 - Discord API client
- `node-html-to-image` ^3.1.0 - Dynamic image generation
- `puppeteer-cluster` ^0.22.0 - Puppeteer pooling
- `pushover-notifications` ^1.2.2 - Push notifications

## Development Notes

### Adding New Commands

1. Create command file in appropriate `/commands/` subdirectory
2. Extend `Command` class from `discord-akairo`
3. Define aliases in constructor
4. Delegate business logic to controller/service layer
5. Command files are auto-loaded by CommandHandler

### Heroku Deployment

- `Procfile` defines process: `worker: node app.js`
- Environment variables override `settings.json` config
- Puppeteer requires `--no-sandbox` flag in production
- Node.js 14.x engine specified in `package.json`
