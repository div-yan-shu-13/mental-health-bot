#!/usr/bin/env python3
"""
Railway Deployment Helper Script
Alternative to Render with $5 monthly credit
"""

import os
import json

def create_railway_json():
    """Create railway.json for Railway deployment"""
    railway_config = {
        "$schema": "https://railway.app/railway.schema.json",
        "build": {
            "builder": "NIXPACKS"
        },
        "deploy": {
            "startCommand": "gunicorn app:app",
            "healthcheckPath": "/api/health",
            "healthcheckTimeout": 300,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 10
        }
    }
    
    with open('backend/railway.json', 'w') as f:
        json.dump(railway_config, f, indent=2)
    
    print("✅ Created backend/railway.json")

def create_railway_guide():
    """Create Railway deployment guide"""
    guide = """# 🚂 Railway Deployment Guide

## Prerequisites
1. GitHub account with your code
2. Railway account (free at railway.app)
3. $5 monthly credit (free tier)

## Step 1: Prepare Your Code
1. Push all changes to GitHub
2. Ensure gunicorn is in requirements.txt
3. Ensure your app has a health check endpoint

## Step 2: Deploy Backend
1. Go to railway.app and sign up
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Python and deploy

## Step 3: Set Environment Variables
In your Railway project dashboard:
- SECRET_KEY: (generate a random string)
- GROQ_API_KEY: (your Groq API key)
- DATABASE_URI: (Railway will provide PostgreSQL)

## Step 4: Deploy Frontend
1. Create a new project for frontend
2. Choose "Deploy from GitHub repo"
3. Set build command: `npm install && npm run build`
4. Set output directory: `build`

## Step 5: Update Frontend API URL
Update frontend/src/services/api.js:
```javascript
const API_URL = 'https://your-backend-app.railway.app/api';
```

## Step 6: Test Deployment
1. Test backend: https://your-backend-app.railway.app/api/health
2. Test frontend: https://your-frontend-app.railway.app

## Railway Advantages
- Fast deployments
- Good performance
- Built-in monitoring
- Easy scaling
- $5 free credit monthly

## Troubleshooting
- Check Railway logs in dashboard
- Ensure environment variables are set
- Verify health check endpoint works
- Check build logs for errors
"""
    
    with open('RAILWAY_DEPLOYMENT.md', 'w') as f:
        f.write(guide)
    
    print("✅ Created RAILWAY_DEPLOYMENT.md")

def create_vercel_guide():
    """Create Vercel deployment guide for frontend"""
    guide = """# ⚡ Vercel + Render Deployment Guide

## Why This Combination?
- **Vercel**: Best-in-class React hosting
- **Render**: Great Python backend hosting
- **Both**: Generous free tiers

## Step 1: Deploy Backend on Render
Follow the Render deployment guide first.

## Step 2: Deploy Frontend on Vercel
1. Go to vercel.com and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect React
5. Set build command: `npm run build`
6. Set output directory: `build`

## Step 3: Update API URL
Update frontend/src/services/api.js:
```javascript
const API_URL = 'https://your-backend-app.onrender.com/api';
```

## Step 4: Deploy
Click "Deploy" and wait for build to complete.

## Vercel Advantages
- Instant deployments
- Global CDN
- Automatic HTTPS
- Custom domains
- Great performance
- Zero configuration

## URLs You'll Get
- Backend: https://your-app.onrender.com
- Frontend: https://your-app.vercel.app

## Troubleshooting
- Check Vercel build logs
- Ensure API URL is correct
- Verify CORS is configured
- Test API endpoints
"""
    
    with open('VERCEL_DEPLOYMENT.md', 'w') as f:
        f.write(guide)
    
    print("✅ Created VERCEL_DEPLOYMENT.md")

def main():
    """Run Railway deployment preparation"""
    print("🚂 Preparing for Railway Deployment...")
    print("=" * 50)
    
    # Create necessary files
    create_railway_json()
    create_railway_guide()
    create_vercel_guide()
    
    print("=" * 50)
    print("🎉 Railway deployment preparation complete!")
    print("📚 Read RAILWAY_DEPLOYMENT.md for Railway steps")
    print("📚 Read VERCEL_DEPLOYMENT.md for Vercel frontend")
    print("🌐 Deploy at: https://railway.app")

if __name__ == "__main__":
    main()
