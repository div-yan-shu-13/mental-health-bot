# 🚀 Render Deployment Guide

## Prerequisites
1. GitHub account with your code
2. Render account (free at render.com)

## Step 1: Prepare Your Code
1. Push all changes to GitHub
2. Ensure your backend has a Procfile
3. Ensure gunicorn is in requirements.txt

## Step 2: Deploy Backend
1. Go to render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: mental-health-bot-backend
   - Environment: Python
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app
   - Plan: Free

## Step 3: Set Environment Variables
In your backend service, add:
- SECRET_KEY: (generate a random string)
- GROQ_API_KEY: (your Groq API key)
- CORS_ORIGINS: (your frontend URL)

## Step 4: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - Name: mental-health-bot-frontend
   - Build Command: npm install && npm run build
   - Publish Directory: build
   - Plan: Free

## Step 5: Update Frontend API URL
Update frontend/src/services/api.js:
```javascript
const API_URL = 'https://your-backend-app.onrender.com/api';
```

## Step 6: Test Deployment
1. Test backend: https://your-backend-app.onrender.com/api/health
2. Test frontend: https://your-frontend-app.onrender.com

## Troubleshooting
- Check Render logs for errors
- Ensure all environment variables are set
- Verify CORS origins are correct
