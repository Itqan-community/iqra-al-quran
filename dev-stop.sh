#!/bin/bash

# Iqra Al-Quran Development Stop Script
# This script stops all development servers and cleans up processes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DEV-STOP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status "🛑 Stopping Iqra Al-Quran Development Environment"
print_status "================================================"

# Kill processes by port
print_status "Stopping backend server (port 8081)..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || print_warning "No process found on port 8081"

print_status "Stopping any remaining backend processes (port 5001)..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || print_warning "No process found on port 5001"

print_status "Stopping Expo development server (port 19000)..."
lsof -ti:19000 | xargs kill -9 2>/dev/null || print_warning "No process found on port 19000"

print_status "Stopping Expo tunnel (port 19001)..."
lsof -ti:19001 | xargs kill -9 2>/dev/null || print_warning "No process found on port 19001"

# Kill any remaining Python/Node processes related to the project
print_status "Cleaning up remaining processes..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true

print_success "✅ Development environment stopped"
print_status "🔄 You can restart with: ./dev-start.sh"
