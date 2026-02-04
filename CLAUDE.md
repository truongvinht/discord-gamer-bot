# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discord bot for displaying game-related details and interacting with players. Built with native Discord.js v14. The bot provides commands for multiple games including Pokémon Masters and Dota Auto Chess.

**Key Features:**
- Hybrid command system supporting both slash commands (/) and prefix commands (!)
- Auto Chess random picks (race, class, synergy)
- Pokémon Masters sync event tracking
- Native Discord.js v14 implementation (no framework dependencies)

## Development Commands

### Running the Bot
```bash
npm start                # Start the bot
npm run deploy          # Deploy slash commands to Discord API
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

## Configuration

The bot uses environment variables loaded from a `.env` file.

### Setup Configuration

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env and add your credentials:**
   ```bash
   BOT_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_application_id
   GUILD_ID=your_test_guild_id_optional
   PREFIX=!
   NODE_ENV=development
   EVENT_FRIDAY_TIME=20:00
   EVENT_SUNDAY_TIME=20:00
   EVENT_DURATION=2
   ```

3. **Get your Discord credentials:**
   - BOT_TOKEN: https://discord.com/developers/applications → Your App → Bot → Reset Token
   - CLIENT_ID: Same portal → General Information → Application ID

**Note:** The `.env` file is gitignored and never committed to version control.

## Deployment

The bot includes automated CI/CD deployment via GitHub Actions.

### CI/CD Workflow

**Combined CI/CD Pipeline** (`.github/workflows/main.yml`):
- **Test Job**: Runs on all pushes/PRs (lint, test, coverage)
- **Deploy Job**: Runs only on `main` branch after tests pass
- **Smart Deployment**: Auto-detects PM2 start vs reload
- **Verification**: Health checks and status validation
- **Manual Trigger**: Supports workflow_dispatch for manual deploys

### Server Setup

See `DEPLOYMENT.md` for complete server setup guide. Quick overview:

1. **Install Node.js 18+ and PM2:**
   ```bash
   sudo apt install nodejs npm
   npm install -g pm2
   ```

2. **Clone repository:**
   ```bash
   git clone <repo> /opt/discord-gamer-bot
   cd /opt/discord-gamer-bot
   npm ci --production
   ```

3. **Create .env file:**
   ```bash
   nano .env
   # Add BOT_TOKEN, CLIENT_ID, etc.
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### GitHub Secrets Required

Configure these in GitHub repository settings (Settings → Secrets):
- `SSH_PRIVATE_KEY` - Private SSH key for server access
- `SERVER_HOST` - Server IP or hostname
- `SERVER_USER` - SSH username

### Deployment Process

Every push to `main`:
1. Runs CI checks (lint, test)
2. SSH to server
3. Pulls latest code
4. Installs dependencies
5. Deploys slash commands
6. Reloads bot with PM2

### Manual Deployment

Deploy manually via SSH:
```bash
ssh user@server
cd /opt/discord-gamer-bot
bash scripts/deploy.sh
```

### Monitoring

```bash
pm2 status                    # View bot status
pm2 logs discord-gamer-bot   # View live logs
pm2 monit                     # Resource monitoring
```

For detailed deployment instructions, troubleshooting, and maintenance, see **`DEPLOYMENT.md`**.

### Linting Rules
- Uses ESLint with Standard config
- Custom rules: 4-space indentation, semicolons required
- Configuration in `.eslintrc.json`

## Architecture

### Command System (Native Discord.js v14)

The bot uses a custom command handler with hybrid support for both command types:

**Slash Commands** (/) - Modern Discord API
- Registered via Discord REST API using `deploy-commands.js`
- Uses `SlashCommandBuilder` for command definitions
- Responds via `interaction.reply()` and `interaction.followUp()`

**Prefix Commands** (!) - Legacy support
- Custom command loader from `./commands/` directory
- Responds via `message.channel.send()`
- Supports command aliases

### Directory Structure

```
/commands/           # Command definitions (module.exports pattern)
  /pmmasters/       # Pokémon Masters commands
  /autochess/       # Dota Auto Chess commands
  generalHelp.js    # General help command

/service/           # Business logic layer
  /autochess/       # Auto Chess services & controllers
  /pmasters/        # Pokémon Masters services & controllers
  /base/            # Shared utilities
    colorManager.js       # Singleton for color codes
    reactionHandler.js    # Message reaction handling

/listeners/         # Event listeners
  readyListener.js       # Bot ready event
  reactionListener.js    # Message reaction handling

/helper/           # Shared utilities
  envHandler.js    # Configuration management
  dateExtension.js # Date formatting utilities

/config/           # Configuration files
  settings.json    # Bot configuration (gitignored)

/template/         # Template files
  example_settings.json  # Configuration template

/deploy-commands.js  # Slash command deployment script
```

### Configuration System (`helper/envHandler.js`)

Hierarchical configuration loading:
1. Attempts to load `config/settings.json`
2. Falls back to `template/example_settings.json`
3. Supports environment variable overrides

Required configuration keys:
- `token` / `BOT_TOKEN` - Discord bot token
- `prefix` / `PREFIX` - Command prefix (default: `!`)

**Setup:**
1. Copy `template/example_settings.json` to `config/settings.json`
2. Add your Discord bot token
3. Optionally customize prefix and other settings

### Service Layer Pattern

Commands are thin wrappers that delegate to controller/service layers:

**Command** → **Controller** → **Service** → **External API** (if applicable)

- Commands in `/commands/` use module.exports pattern
- They define both `data` (SlashCommandBuilder) and `execute()` function
- Universal `execute()` handles both Message and Interaction objects
- Controllers handle Discord message formatting and business logic
- Services handle data processing and external API calls
- This separation keeps commands lightweight and makes business logic testable

### Key Patterns

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
Controllers detect command type using `source.commandName`:
```javascript
if (source.commandName) {
    // Slash command (Interaction)
    return source.reply({ embeds: [embed] });
} else {
    // Prefix command (Message)
    return source.channel.send({ embeds: [embed] });
}
```

#### Multiple Message Responses
For slash commands sending multiple messages:
```javascript
function sendMultipleMessages(source, dataList, isSlashCommand, hasReplied) {
    if (dataList.length > 0) {
        const data = dataList.shift();
        const embed = createEmbed(data);

        if (isSlashCommand) {
            if (!hasReplied) {
                // First message MUST use reply()
                source.reply({ embeds: [embed] }).then(() => {
                    sendMultipleMessages(source, dataList, isSlashCommand, true);
                });
            } else {
                // Subsequent messages use followUp()
                source.followUp({ embeds: [embed] }).then(() => {
                    sendMultipleMessages(source, dataList, isSlashCommand, true);
                });
            }
        } else {
            // Prefix command uses channel.send()
            source.channel.send({ embeds: [embed] }).then(() => {
                sendMultipleMessages(source, dataList, false, false);
            });
        }
    }
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

#### Image Generation
Uses `node-html-to-image` with Puppeteer for dynamic content:
- Services generate HTML templates
- Controllers convert to Discord attachments
- Puppeteer args include `--no-sandbox` for production environments

### Client Configuration

**Gateway Intents (Required):**
```javascript
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // PRIVILEGED
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Reaction]
});
```

**Important:** MESSAGE_CONTENT intent must be enabled in Discord Developer Portal:
1. Go to https://discord.com/developers/applications
2. Select your bot
3. Navigate to "Bot" section
4. Enable "MESSAGE CONTENT INTENT" under Privileged Gateway Intents

### Testing

- Jest test environment configured for Node.js
- Test files located alongside source files: `*.test.js`
- Example: `service/autochess/autochessService.test.js`
- Coverage ignores `node_modules`

### External Dependencies

Key dependencies:
- `discord.js` ^14.25.1 - Discord API client
- `node-html-to-image` ^3.1.0 - Dynamic image generation
- `puppeteer-cluster` ^0.22.0 - Puppeteer pooling
- `node-fetch` ^2.6.1 - HTTP client for external APIs
- `request` ^2.88.2 - Legacy HTTP client

## Development Notes

### Adding New Commands

1. Create command file in appropriate `/commands/` subdirectory
2. Use module.exports pattern with `name`, `aliases`, `data`, `execute`
3. Add SlashCommandBuilder configuration in `data` property
4. Implement universal `execute()` function that handles both Message and Interaction
5. Delegate business logic to controller/service layer
6. Run `npm run deploy` to register slash command with Discord API
7. Command files are auto-loaded by custom loader in `app.js`

### Slash Command Deployment

After adding or modifying slash commands:
```bash
npm run deploy
```

This registers commands globally with Discord API. Changes take effect immediately.

### Bot Startup

Ensure `.env` file exists with your bot token:
```bash
npm start
```

Expected console output:
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

If BOT_TOKEN is missing, you'll see:
```
❌ Error: BOT_TOKEN environment variable is required

📝 Setup instructions:
  1. Copy .env.example to .env
  2. Edit .env and add your Discord bot token
  3. Run: npm start
```

### Common Issues

**"Used disallowed intents" error:**
- Enable MESSAGE_CONTENT intent in Discord Developer Portal

**Slash commands timeout:**
- Ensure first response uses `interaction.reply()`
- Subsequent responses use `interaction.followUp()`
- Respond within 3 seconds

**Prefix commands not working:**
- Check bot has proper channel permissions
- Verify prefix in settings.json matches usage
- Check bot token is valid
