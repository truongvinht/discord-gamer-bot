// PM2 ecosystem configuration
// See: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
    apps: [{
        name: 'discord-gamer-bot',
        script: './app.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        time: true
    }]
};
