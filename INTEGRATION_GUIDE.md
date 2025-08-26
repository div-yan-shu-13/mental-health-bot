# Backend-Frontend Integration Guide

## Overview
This guide explains how the mental health bot backend (Flask) and frontend (React) are integrated and how to run them together.

## Architecture

### Backend (Flask)
- **Port**: 5000
- **Framework**: Flask with Flask-SQLAlchemy, Flask-Login, Flask-CORS
- **Database**: SQLite (configurable via DATABASE_URI)
- **Authentication**: Session-based with Flask-Login
- **CORS**: Configured to allow requests from `http://localhost:3000`

### Frontend (React)
- **Port**: 3000
- **Framework**: React 19 with React Router
- **HTTP Client**: Axios with credentials support
- **State Management**: React hooks (useState, useEffect)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Mood Tracking
- `POST /api/mood` - Add mood entry
- `GET /api/mood` - Get user's mood history
- `GET /api/mood/insights` - Get mood insights and analytics

### Chatbot
- `POST /api/chatbot/chat` - Send message to AI chatbot

### Self-Care
- `GET /api/self_care_tips` - Get self-care tips

## Integration Points

### 1. CORS Configuration
The backend is configured to accept requests from the frontend:
```python
CORS(app, resources={r"/api/*": {
    "origins": "http://localhost:3000",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True  # Important for cookies
}})
```

### 2. Session Management
- Frontend sends `withCredentials: true` in Axios requests
- Backend sets session cookies for authentication
- Protected routes check for valid session

### 3. API Service Layer
Frontend uses a centralized API service (`src/services/api.js`) that:
- Configures Axios with base URL and credentials
- Provides service functions for each API endpoint
- Handles authentication state

## Running the Application

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables
Create `backend/.env` file:
```env
SECRET_KEY="your-secret-key"
GROQ_API_KEY="your-groq-api-key"
DATABASE_URI="sqlite:///app.db"
```

### Start Backend
```bash
cd backend
source venv/bin/activate
python app.py
```
Backend will run on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
```

### Start Frontend
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## Testing the Integration

### 1. Health Check
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass"}'
```

### 3. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -c cookies.txt
```

### 4. Protected Endpoint Test
```bash
curl -X GET http://localhost:5000/api/self_care_tips -b cookies.txt
```

## Frontend-Backend Communication Flow

1. **User Registration/Login**: Frontend sends credentials to backend
2. **Session Creation**: Backend creates session and returns user data
3. **Cookie Storage**: Browser stores session cookie automatically
4. **Authenticated Requests**: Frontend includes cookies in subsequent requests
5. **Route Protection**: Backend validates session before allowing access

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running and CORS is properly configured
2. **Session Issues**: Check that `withCredentials: true` is set in frontend
3. **Database Errors**: Verify DATABASE_URI in .env file
4. **Port Conflicts**: Ensure ports 3000 and 5000 are available

### Debug Mode
Backend runs in debug mode by default. Check console for detailed error messages.

## Security Features

- Password hashing with Werkzeug
- Session-based authentication
- CORS protection
- Input validation
- SQL injection protection via SQLAlchemy

## Next Steps

- Add environment-specific configurations
- Implement production deployment
- Add logging and monitoring
- Set up automated testing
- Configure HTTPS for production
