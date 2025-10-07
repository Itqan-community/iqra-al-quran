#!/bin/bash

# Iqra Al-Quran Development Startup Script
# This script starts the backend Flask server and mobile Expo development server

set -e  # Exit on any error

# Kill any existing processes first
echo "🧹 Cleaning up existing processes..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "expo\|npm.*start" 2>/dev/null || true
lsof -ti:5001,8081,19000,19001,19002 | xargs kill -9 2>/dev/null || true
sleep 2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DEV-START]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "Shutting down development servers..."
    
    # Kill backend process
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend server stopped"
    fi
    
    # Kill mobile process
    if [ ! -z "$MOBILE_PID" ]; then
        kill $MOBILE_PID 2>/dev/null || true
        print_status "Mobile development server stopped"
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:5001,8081,19000,19001,19002 | xargs kill -9 2>/dev/null || true
    pkill -f "python.*app.py" 2>/dev/null || true
    pkill -f "expo\|npm.*start" 2>/dev/null || true
    
    print_success "✅ All development servers stopped"
    exit 0
}

# Set up cleanup trap
trap cleanup SIGINT SIGTERM EXIT

print_status "🚀 Starting Iqra Al-Quran Development Environment"
print_status "=============================================="

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check for FFmpeg (required for audio processing)
if ! command_exists ffmpeg; then
    print_warning "FFmpeg is not installed. Audio processing may not work properly."
    print_warning "Install FFmpeg: https://ffmpeg.org/download.html"
fi

print_success "Prerequisites check completed"

# Start Backend Server
print_status "📡 Setting up backend server..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
print_status "Installing Python dependencies..."
if ! pip install --quiet --upgrade pip; then
    print_error "Failed to upgrade pip"
    exit 1
fi

if ! pip install --quiet -r requirements.txt; then
    print_error "Failed to install Python dependencies"
    exit 1
fi
print_success "Python dependencies installed"

# Set environment variables
export FLASK_SECRET="dev_secret_key_change_in_production"
export PORT="5001"

print_status "Starting Flask backend server on port 5001..."

# Start backend in background
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_success "✅ Backend server started (PID: $BACKEND_PID)"
    
    # Test backend health
    if command_exists curl; then
        if curl -s http://localhost:5001/api/health >/dev/null 2>&1; then
            print_success "✅ Backend health check passed"
        else
            print_warning "Backend health check failed - server may still be starting"
        fi
    fi
else
    print_error "❌ Failed to start backend server"
    exit 1
fi

# Navigate back to project root
#cd ..

# Start Mobile App
# print_status "📱 Setting up mobile development server..."

# cd mobile

# # Check if node_modules exists
# if [ ! -d "node_modules" ]; then
#     print_status "Installing Node.js dependencies..."
#     if ! npm install; then
#         print_error "Failed to install Node.js dependencies"
#         kill $BACKEND_PID 2>/dev/null || true
#         exit 1
#     fi
#     print_success "Node.js dependencies installed"
# else
#     print_status "Node.js dependencies already installed"
# fi

# print_status "Starting Expo development server..."

# Start mobile app in background
# npm start &
# MOBILE_PID=$!

# Wait a moment for mobile server to start
# sleep 2

# if kill -0 $MOBILE_PID 2>/dev/null; then
#     print_success "✅ Mobile development server started (PID: $MOBILE_PID)"
# else
#     print_error "❌ Failed to start mobile development server"
#     kill $BACKEND_PID 2>/dev/null || true
#     exit 1
# fi

# Navigate back to project root
cd ..

print_status "=============================================="
print_success "🎉 Development environment is ready!"
print_status "=============================================="
echo ""
print_status "📡 Backend API: http://localhost:5001"
print_status "📱 Mobile App: Use Expo Go app to scan QR code"
print_status "🔍 Health Check: http://localhost:5001/api/health"
echo ""
print_status "📋 Available endpoints:"
print_status "  • GET  /api/health - Health check"
print_status "  • GET  /api/surahs - Get Juz 30 surahs"
print_status "  • GET  /api/all_surahs - Get all surahs"
print_status "  • POST /check - Check recitation"
echo ""
print_warning "📝 To stop servers: Press Ctrl+C"
print_warning "📝 To restart: Run ./dev-start.sh again"
echo ""

# Keep script running and monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend server stopped unexpectedly"
        break
    fi
    
    if ! kill -0 $MOBILE_PID 2>/dev/null; then
        print_error "Mobile development server stopped unexpectedly"
        break
    fi
    
    sleep 5
done

# This will trigger the cleanup function
exit 1
