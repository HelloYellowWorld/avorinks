#!/bin/bash

echo "🚀 AvoRinks Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial AvoRinks deployment"
fi

echo ""
echo "📋 Available deployment options:"
echo "1. Railway (Recommended - 500 hours free)"
echo "2. Render (Free with auto-sleep)"
echo "3. Vercel (Simple deployment)"
echo "4. Setup GitHub Actions ping bot"
echo ""

read -p "Choose deployment option (1-4): " choice

case $choice in
    1)
        echo "🚄 Deploying to Railway..."
        echo "1. Go to https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. New Project → Deploy from GitHub repo"
        echo "4. Select this repository"
        echo "5. Railway will auto-deploy using railway.json"
        echo ""
        echo "Your AvoRinks will be available at: https://avorinks-production.up.railway.app"
        ;;
    2)
        echo "🎨 Deploying to Render..."
        echo "1. Go to https://render.com"
        echo "2. New → Web Service"
        echo "3. Connect GitHub repository"
        echo "4. Use these settings:"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "   - Health Check Path: /health"
        echo ""
        echo "Your AvoRinks will be available at: https://avorinks.onrender.com"
        ;;
    3)
        echo "⚡ Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            echo "Vercel CLI found, deploying..."
            vercel --prod
        else
            echo "Installing Vercel CLI..."
            npm install -g vercel
            echo "Run 'vercel --prod' to deploy"
        fi
        ;;
    4)
        echo "🤖 Setting up GitHub Actions ping bot..."
        echo "1. Push this repository to GitHub"
        echo "2. Go to your GitHub repository"
        echo "3. Update .github/workflows/keep-alive.yml with your deployed URL"
        echo "4. GitHub Actions will ping your app every 5 minutes"
        echo ""
        echo "The workflow is already configured!"
        ;;
    *)
        echo "Invalid option. Please run the script again."
        ;;
esac

echo ""
echo "📝 Don't forget to:"
echo "✓ Set up UptimeRobot at https://uptimerobot.com for external pinging"
echo "✓ Update the GitHub Action with your deployed URL"
echo "✓ Test your deployment with multiple users"
echo ""
echo "🎉 AvoRinks deployment setup complete!"