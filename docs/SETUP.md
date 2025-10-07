# Iqra Al-Quran Setup Guide

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- FFmpeg (for audio processing)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables:
```bash
export FLASK_SECRET="your_secret_key"
export PORT=5000
```

5. Run the server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo development server:
```bash
npm start
```

4. Use Expo Go app on your phone to scan the QR code

### API Configuration

In `mobile/src/services/api.js`, update the API_BASE_URL:
- For local development: `http://localhost:5000`
- For production: Your Railway/cloud deployment URL

## Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `FLASK_SECRET`: A secure secret key
   - `PORT`: Will be set automatically by Railway

3. Deploy the backend service

### Mobile App Distribution

#### Development
- Use Expo Go for testing
- Share via QR code with team members

#### Production
- Build with EAS Build: `eas build`
- Submit to app stores: `eas submit`

## Testing

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Mobile App Testing
1. Start backend server
2. Start Expo development server
3. Test audio recording and file upload features
4. Verify API connectivity

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Install FFmpeg for your system
   - Ensure it's in your PATH

2. **CUDA/GPU issues**
   - Install appropriate PyTorch version for your system
   - Or use CPU-only version for development

3. **Audio permissions on mobile**
   - Ensure audio recording permissions are granted
   - Check device audio settings

4. **Network connectivity**
   - Check firewall settings
   - Verify API endpoints are accessible

### Model Download
The Whisper model will be downloaded automatically on first run. This may take several minutes depending on your internet connection.

## Development Notes

- Backend uses Flask with CORS enabled for mobile app communication
- Mobile app uses Expo for cross-platform development
- Audio processing uses Whisper model specifically trained for Quranic Arabic
- No auto-commits are made to maintain version control
