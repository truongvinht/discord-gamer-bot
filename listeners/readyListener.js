// readyListener.js
// show log after bot launched
// ================

module.exports = {
    name: 'ready',
    once: true,
    execute: async (client) => {
        console.log('Started up!');
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Serving ${client.guilds.cache.size} guilds`);
    }
};
