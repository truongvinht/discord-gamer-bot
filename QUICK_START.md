# Quick Start Guide - Discord Bot v14

## 🚀 Fast Setup (5 minutes)

### 1. Configure Bot Token
Edit `config/settings.json` and add your Discord bot token:
```json
{
  "token": "your_discord_bot_token_here",
  "prefix": "!",
  "roles": [],
  "author": "C4CW",
  "version": "1.6.1"
}
```

**Note:** `config/settings.json` is gitignored to protect your token from being committed.

### 2. Discord Portal Setup
**CRITICAL - Bot won't work without this:**

1. Go to https://discord.com/developers/applications
2. Select your bot
3. Go to "Bot" section
4. Enable **MESSAGE CONTENT INTENT** under "Privileged Gateway Intents"
5. Save

### 3. Deploy Slash Commands (New!)

**ONE TIME SETUP** - Register slash commands with Discord:
```bash
npm run deploy
```

### 4. Install & Run
```bash
npm install  # If not already done
npm start
```

## ✅ Verify Everything Works

### Console should show:
```
Loading commands...
Loaded command: help
Loaded command: autochessHelp
Loaded command: acrace
Loaded command: acclass
Loaded command: acany
Loaded command: pmhelp
Loaded command: pmsyncevent
Loading events...
Loaded event: ready
Loaded event: messageReactionAdd
Login Done!
Started up!
Logged in as YourBot#1234
```

### Test in Discord:

**Slash Commands (New!):**
1. Type `/help` - Native Discord command with autocomplete
2. Type `/achelp` - Shows Auto Chess commands
3. Type `/acrace` - Get random race pick

**Prefix Commands (Legacy - Still Supported):**
1. Type `!help` - Should show general commands
2. Type `!achelp` - Should show Auto Chess commands
3. React with 🗑 to any bot message - Message should delete

## 📋 All Available Commands

### Slash Commands (Recommended)
| Command | Description |
|---------|-------------|
| `/help` | General help |
| `/achelp` | Auto Chess help |
| `/acrace` | Random race pick |
| `/acclass` | Random class pick |
| `/acany` | Random synergy pick |
| `/pmhelp` | Pokemon Masters help |
| `/pmevent` | Current sync events |

### Prefix Commands (Legacy)
| Command | Aliases | Description |
|---------|---------|-------------|
| `!help` | `!h`, `!hilfe` | General help |
| `!achelp` | `!ahelp` | Auto Chess help |
| `!acrace NAME` | `!arace`, `!autochessrace` | Random race pick |
| `!acclass NAME` | `!aclass`, `!autochessclass` | Random class pick |
| `!acany NAME` | `!aany`, `!autochessany` | Random synergy pick |
| `!pmhelp` | `!pmHelp`, `!pokemonmastershelp` | Pokemon Masters help |
| `!pmsyncevent` | `!pmevent` | Current sync events |

**💡 Tip:** Slash commands provide better UX with autocomplete and built-in help!

## 🔧 Troubleshooting

### Bot doesn't respond to commands
- ✅ Check MESSAGE CONTENT intent is enabled in Discord portal
- ✅ Verify token in `config/settings.json` is correct
- ✅ Check console for errors

### Commands load but don't work
- ✅ Bot needs proper permissions in Discord server
- ✅ Check the bot has "Send Messages" permission
- ✅ Verify command prefix is `!` (configurable in settings.json)

### Tests fail
```bash
npm test           # Run tests
npm run lint       # Check code style
```

## 📚 More Information

**Slash Commands:**
- See `SLASH_COMMANDS.md` for complete slash command guide
- How to add new commands
- Troubleshooting
- Architecture details

**Migration Details:**
- See `MIGRATION_SUMMARY.md` for:
  - Complete technical changes
  - API differences between v12 and v14
  - Testing checklist
  - Rollback instructions

## 🆘 Need Help?

1. Check console logs for errors
2. Verify `config/settings.json` has valid token
3. Confirm MESSAGE CONTENT intent is enabled
4. Run `npm test` to check service layer
5. Check `MIGRATION_SUMMARY.md` for detailed info
