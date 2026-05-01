module.exports = {
    apps: [{
        name: process.env.APP_NAME || 'cdp.unizik.qverselearning.org',
        script: 'node_modules/.bin/next',
        args: 'start',
        instances: 'max',
        exec_mode: 'cluster',
        // Next.js reads .env.production automatically when NODE_ENV=production.
        // PM2 only needs to set PORT and NODE_ENV here.
        env: {
            PORT: process.env.APP_PORT || 3800,
            NODE_ENV: 'production',
        },
    }],
};