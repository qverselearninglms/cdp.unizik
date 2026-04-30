module.exports = {
    apps: [{
        name: process.env.APP_NAME || "cdp.unizik.qverselearning.org",
        script: "npm",
        script: 'node_modules/.bin/next',
        args: 'start',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            PORT: process.env.APP_PORT || 3800,
            NODE_ENV: "production"
            // other env vars will be loaded from .env.production or from PM2 environment
        }
    }]
};