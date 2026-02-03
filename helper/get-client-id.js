// get-client-id.js
// Extract client ID from bot token
// ================

const c = require('./envHandler');

const token = c.botToken();
if (!token) {
    console.error('❌ Error: BOT_TOKEN not found in settings.json');
    process.exit(1);
}

// Extract client ID from token (first part before first dot)
const clientId = Buffer.from(token.split('.')[0], 'base64').toString();

console.log('\n📋 Your Bot Information:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Client ID: ${clientId}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n🔗 OAuth2 Invite Link:');
console.log(`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=277025508416&scope=bot%20applications.commands`);
console.log('\n💡 Use this link to invite your bot with the correct permissions!\n');
