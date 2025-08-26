# Mental Health Bot - Backend-Frontend Integration

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
./start_app.sh
```
This script will automatically:
- Check port availability
- Start the backend (Flask) on port 5000
- Start the frontend (React) on port 3000
- Verify both services are running

### Option 2: Manual Startup

#### Start Backend
```bash
cd backend
source venv/bin/activate
python app.py
```

#### Start Frontend (in new terminal)
```bash
cd frontend
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🧪 Test Integration

Run the integration test to verify everything is working:
```bash
python3 test_integration.py
```

## 📱 Features

- **User Authentication**: Register, login, logout
- **Mood Tracking**: Log daily moods with notes
- **Mood Insights**: Analytics and patterns
- **AI Chatbot**: Mental health support conversations
- **Self-Care Tips**: Curated wellness suggestions

## 🔧 Troubleshooting

### Port Already in Use
- Backend port 5000: Check for other Flask apps
- Frontend port 3000: Check for other React apps

### CORS Issues
- Ensure backend is running before frontend
- Check that CORS is properly configured

### Database Issues
- Verify `.env` file has correct `DATABASE_URI`
- Check that virtual environment is activated

## 📚 Documentation

- **Full Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **API Endpoints**: See integration guide for complete list
- **Architecture**: Flask backend + React frontend with session auth

## 🛑 Stopping Services

- **Automated**: Press `Ctrl+C` in the startup script
- **Manual**: Kill processes on ports 5000 and 3000

## 🔒 Security Features

- Password hashing with Werkzeug
- Session-based authentication
- CORS protection
- Input validation
- SQL injection protection
