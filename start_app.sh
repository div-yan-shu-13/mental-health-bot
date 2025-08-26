#!/bin/bash

# Mental Health Bot Startup Script
# This script starts both the backend and frontend services

echo "🚀 Starting Mental Health Bot Application..."
echo "=========================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check if ports are available
echo "Checking port availability..."
if ! check_port 5000; then
    echo "Please stop the service using port 5000 or change the backend port"
    exit 1
fi

if ! check_port 3000; then
    echo "Please stop the service using port 3000 or change the frontend port"
    exit 1
fi

# Start backend
echo "Starting backend server..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting Flask backend on port 5000..."
python app.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend is running successfully"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "Starting frontend server..."
cd ../frontend

echo "Installing dependencies..."
npm install

echo "Starting React frontend on port 3000..."
npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 10

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running successfully"
else
    echo "❌ Frontend failed to start"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Application is running successfully!"
echo "====================================="
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
