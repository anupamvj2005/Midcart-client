#!/bin/bash
set -e

echo "🚀 Starting SmartPharma..."
echo ""

# Check if .env files exist, copy examples if not
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "📋 Created backend/.env — please update with your credentials"
fi

# Terminal multiplexer approach using background processes
echo "Starting services..."
echo ""

# 1. MongoDB (assumes installed)
echo "📦 MongoDB: Make sure MongoDB is running on port 27017"
echo ""

# 2. Backend
echo "🟢 Starting Node.js backend on port 5000..."
cd backend && npm install --silent && node utils/seeder.js 2>/dev/null || true && npm run dev &
BACKEND_PID=$!
cd ..

# 3. ML API
echo "🤖 Starting Python ML API on port 8000..."
cd ml-api && pip install -r requirements.txt -q && python app.py &
ML_PID=$!
cd ..

# 4. Frontend
echo "⚛️  Starting React frontend on port 5173..."
cd frontend && npm install --silent && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "✅ SmartPharma is starting up!"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:5000"
echo "  ML API:    http://localhost:8000"
echo ""
echo "  Admin:     admin@smartpharma.com / Admin@123"
echo "  User:      user@smartpharma.com  / User@123"
echo "═══════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $ML_PID $FRONTEND_PID 2>/dev/null; echo 'All services stopped.'; exit" SIGINT SIGTERM
wait
