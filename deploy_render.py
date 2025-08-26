#!/usr/bin/env python3
"""
Render Deployment Helper Script
This script helps configure your app for deployment on Render
"""

import os
import json
import subprocess
import sys

def create_render_yaml():
    """Create render.yaml for infrastructure as code"""
    render_config = {
        "services": [
            {
                "type": "web",
                "name": "mental-health-bot-backend",
                "env": "python",
                "plan": "free",
                "buildCommand": "pip install -r requirements.txt",
                "startCommand": "gunicorn app:app",
                "envVars": [
                    {"key": "PYTHON_VERSION", "value": "3.12"},
                    {"key": "SECRET_KEY", "generateValue": True},
                    {"key": "GROQ_API_KEY", "sync": False},
                    {"key": "DATABASE_URI", "fromDatabase": {"name": "mental-health-db", "property": "connectionString"}}
                ]
            },
            {
                "type": "web",
                "name": "mental-health-bot-frontend",
                "env": "static",
                "plan": "free",
                "buildCommand": "npm install && npm run build",
                "staticPublishPath": "./build"
            }
        ],
        "databases": [
            {
                "name": "mental-health-db",
                "databaseName": "mentalhealth",
                "user": "mentalhealth_user",
                "plan": "free"
            }
        ]
    }
    
    with open('render.yaml', 'w') as f:
        json.dump(render_config, f, indent=2)
    
    print("✅ Created render.yaml")

def create_procfile():
    """Create Procfile for Render"""
    procfile_content = "web: gunicorn app:app"
    
    with open('backend/Procfile', 'w') as f:
        f.write(procfile_content)
    
    print("✅ Created backend/Procfile")

def update_requirements():
    """Add gunicorn to requirements.txt"""
    requirements_file = "backend/requirements.txt"
    
    if not os.path.exists(requirements_file):
        print("❌ requirements.txt not found")
        return
    
    with open(requirements_file, 'r') as f:
        requirements = f.read()
    
    if 'gunicorn' not in requirements:
        with open(requirements_file, 'a') as f:
            f.write('\ngunicorn==20.1.0\n')
        print("✅ Added gunicorn to requirements.txt")
    else:
        print("✅ gunicorn already in requirements.txt")

def create_env_template():
    """Create environment variables template"""
    env_template = """# Environment Variables for Production
# Copy this to your Render environment variables

# Database (will be auto-filled by Render)
DATABASE_URI=postgresql://user:pass@host:port/database

# Security
SECRET_KEY=your-secret-key-here

# API Keys
GROQ_API_KEY=your-groq-api-key-here

# CORS (update with your frontend URL)
CORS_ORIGINS=https://your-frontend-app.onrender.com
"""
    
    with open('backend/.env.template', 'w') as f:
        f.write(env_template)
    
    print("✅ Created backend/.env.template")

def update_app_for_production():
    """Update app.py for production deployment"""
    app_file = "backend/app.py"
    
    if not os.path.exists(app_file):
        print("❌ app.py not found")
        return
    
    # Read current app.py
    with open(app_file, 'r') as f:
        content = f.read()
    
    # Update CORS configuration for production
    if 'CORS_ORIGINS' in content:
        print("✅ CORS already configured for production")
        return
    
    # Add production CORS configuration
    cors_config = '''
    # Production CORS configuration
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, resources={r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})'''
    
    # Replace the existing CORS configuration
    old_cors = '''    # Configure CORS - Allow credentials for session cookies
    CORS(app, resources={r"/api/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True  # Important for cookies
    }})'''
    
    if old_cors in content:
        content = content.replace(old_cors, cors_config)
        
        with open(app_file, 'w') as f:
            f.write(content)
        
        print("✅ Updated app.py for production deployment")
    else:
        print("❌ Could not find CORS configuration to update")

def create_deployment_guide():
    """Create a deployment guide"""
    guide = """# 🚀 Render Deployment Guide

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
"""
    
    with open('RENDER_DEPLOYMENT.md', 'w') as f:
        f.write(guide)
    
    print("✅ Created RENDER_DEPLOYMENT.md")

def main():
    """Run all deployment preparations"""
    print("🚀 Preparing for Render Deployment...")
    print("=" * 50)
    
    # Create necessary files
    create_render_yaml()
    create_procfile()
    update_requirements()
    create_env_template()
    update_app_for_production()
    create_deployment_guide()
    
    print("=" * 50)
    print("🎉 Deployment preparation complete!")
    print("📚 Read RENDER_DEPLOYMENT.md for deployment steps")
    print("🌐 Deploy at: https://render.com")

if __name__ == "__main__":
    main()
