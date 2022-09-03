// app.js
// main class
// ================

// import
const c = require('./helper/envHandler');

const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');

class MyClient extends AkairoClient {
    constructor () {
        super({
            ownerID: '123992700587343872' // or ['123992700587343872', '86890631690977280']
        }, {
            disableEveryone: true
        });
        this.queue = new Map();
        this.dispatcher = null;
        this.defaultVolume = 1.0;

        this.commandHandler = new CommandHandler(this, {
            // Options for the command handler goes here.
            prefix: c.prefix(),
            directory: './commands/'
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './inhibitors/'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './listeners/'
        });

        this.commandHandler.loadAll();
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.inhibitorHandler.loadAll();
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.loadAll();
    }
}

const client = new MyClient();
client.login(c.botToken()).then(() => {
    console.log('Login Done!');
});

// additional scheduler for the bot
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const controller = require('./service/tgtg/tgtgController');
const scheduler = new ToadScheduler();

const task = new Task('simple task', () => {
    console.log('Trigger TGTG');
    controller.checkTgtg();
});

const job1 = new SimpleIntervalJob(
    { seconds: 60, runImmediately: true },
    task,
    'id_1'
);

// create and start jobs
scheduler.addSimpleIntervalJob(job1);
