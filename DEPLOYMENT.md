# AvoRinks Deployment Guide

## Free Hosting Options

### 1. Railway (Recommended)
**Free Tier:** 500 hours/month, automatic scaling

**Steps:**
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create new project → Deploy from GitHub repo
4. Railway will automatically detect Node.js and deploy
5. Your app will get a URL like: `https://avorinks-production.up.railway.app`

**Configuration:** Uses `railway.json` and `Procfile` (already included)

### 2. Render
**Free Tier:** Automatic sleep after 15 minutes, wakes on request

**Steps:**
1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`

**Configuration:** Uses `render.yaml` (already included)

### 3. Vercel (Alternative)
**Free Tier:** Great for serverless deployments

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts to deploy

## Ping Bot Setup

### Option 1: UptimeRobot (External - Recommended)
1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: Your deployed app's health endpoint (`/health`)
   - Interval: 5 minutes
3. UptimeRobot will ping your app every 5 minutes to keep it awake

### Option 2: Self-hosted Ping Bot
Use the included `ping-bot.js`:

```bash
# Set your deployed app URL
export PING_URL="https://your-app-url.com/health"
export PING_INTERVAL=300000  # 5 minutes in milliseconds

# Run the ping bot
node ping-bot.js
```

**For continuous running:**
- Deploy the ping bot to a separate free service
- Or run it locally on your computer
- Or use a GitHub Action (runs for free)

## GitHub Action Ping Bot
Create `.github/workflows/ping-bot.yml`:

```yaml
name: Keep AvoRinks Alive
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping AvoRinks
        run: |
          curl -f https://your-deployed-url.com/health || exit 1
```

## Post-Deployment Checklist

✓ App responds at deployed URL
✓ WebSocket connections work
✓ Health endpoint returns 200
✓ Ping service is monitoring the app
✓ Custom domain configured (optional)

## Troubleshooting

**WebSocket not connecting:**
- Ensure your hosting service supports WebSockets
- Check that port binding uses `process.env.PORT`

**App goes to sleep:**
- Set up UptimeRobot or similar ping service
- Some services require payment for always-on hosting

**Health check failing:**
- Verify `/health` endpoint returns JSON with status 200
- Check server logs for errors

Your AvoRinks chatroom should now be deployed and accessible 24/7!