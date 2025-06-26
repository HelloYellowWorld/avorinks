// Simple ping bot to keep AvoRinks running 24/7
const https = require('https');
const http = require('http');

class PingBot {
    constructor(url, interval = 5 * 60 * 1000) { // Default 5 minutes
        this.url = url;
        this.interval = interval;
        this.isRunning = false;
        this.pingCount = 0;
    }

    start() {
        if (this.isRunning) {
            console.log('Ping bot is already running');
            return;
        }

        this.isRunning = true;
        console.log(`Starting ping bot for ${this.url}`);
        console.log(`Ping interval: ${this.interval / 1000} seconds`);
        
        // First ping immediately
        this.ping();
        
        // Set up recurring pings
        this.intervalId = setInterval(() => {
            this.ping();
        }, this.interval);
    }

    stop() {
        if (!this.isRunning) {
            console.log('Ping bot is not running');
            return;
        }

        this.isRunning = false;
        clearInterval(this.intervalId);
        console.log('Ping bot stopped');
    }

    ping() {
        const startTime = Date.now();
        const protocol = this.url.startsWith('https') ? https : http;
        
        const req = protocol.get(this.url, (res) => {
            const responseTime = Date.now() - startTime;
            this.pingCount++;
            
            console.log(`[${new Date().toISOString()}] Ping #${this.pingCount}: ${res.statusCode} - ${responseTime}ms`);
            
            if (res.statusCode === 200) {
                console.log('✓ AvoRinks is running healthy');
            } else {
                console.log(`⚠ Unexpected status code: ${res.statusCode}`);
            }
        });

        req.on('error', (error) => {
            this.pingCount++;
            console.log(`[${new Date().toISOString()}] Ping #${this.pingCount} failed:`, error.message);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            console.log(`[${new Date().toISOString()}] Ping timeout`);
        });
    }

    getStats() {
        return {
            isRunning: this.isRunning,
            pingCount: this.pingCount,
            url: this.url,
            interval: this.interval
        };
    }
}

// Configuration
const TARGET_URL = process.env.PING_URL || 'http://localhost:5000/health';
const PING_INTERVAL = process.env.PING_INTERVAL || 5 * 60 * 1000; // 5 minutes

// Create and start ping bot
const pingBot = new PingBot(TARGET_URL, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, stopping ping bot...');
    pingBot.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, stopping ping bot...');
    pingBot.stop();
    process.exit(0);
});

// Start the ping bot
pingBot.start();

// Log stats every hour
setInterval(() => {
    const stats = pingBot.getStats();
    console.log('Ping Bot Stats:', stats);
}, 60 * 60 * 1000);

module.exports = PingBot;