// app.js
// main class
// ================

//import
const c = require("./helper/envHandler");

const { AkairoClient, CommandHandler } = require('discord-akairo');

class MyClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '123992700587343872', // or ['123992700587343872', '86890631690977280']
        }, {
            disableEveryone: true
        });

        this.commandHandler = new CommandHandler(this, {
            // Options for the command handler goes here.
            prefix: c.prefix(),
            directory: './commands/'
        });
        this.commandHandler.loadAll();
    }
}


const client = new MyClient();
client.login(c.botToken()).then(() => {
    console.log('Started up!');
});