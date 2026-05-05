#!/bin/bash
# Deployment Verification Script for NumSense
# This script verifies the application can start and services are healthy

set -e

echo "🚀 Starting NumSense Deployment Verification..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
echo "✅ Docker and Docker Compose are installed"
echo ""

# Create environment file if missing
echo "🔧 Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with Google OAuth credentials:"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - JWT_SECRET (can use: openssl rand -base64 32)"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Creating from template..."
    cp frontend/.env.example frontend/.env
fi
echo "✅ Environment files configured"
echo ""

# Start services
echo "🐳 Starting Docker Compose services..."
docker-compose up -d
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check database
echo ""
echo "🗄️  Checking database connection..."
if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database connection failed"
    docker-compose logs db
    exit 1
fi

# Check backend
echo ""
echo "🔧 Checking backend API..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
    curl -s http://localhost:3001/health | jq '.'
else
    echo "❌ Backend API is not responding"
    docker-compose logs backend
    exit 1
fi

# Check frontend
echo ""
echo "🌐 Checking frontend..."
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is responding"
else
    echo "⚠️  Frontend is still starting (this is normal, retry in a few seconds)"
fi

echo ""
echo "✅ Deployment verification complete!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Database: postgresql://postgres:password@localhost:5432/numsense"
echo ""
echo "🛑 To stop services: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
