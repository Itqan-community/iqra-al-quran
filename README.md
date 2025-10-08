# Iqra Al-Quran - Quranic Recitation Checker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive open-source platform for checking Quranic recitation accuracy using AI-powered speech recognition.

## ⭐ About

Iqra Al-Quran helps users learn and improve their Quranic recitation through AI technology. Using a specialized Whisper model trained on Quranic audio, this application provides real-time feedback on recitation accuracy with word-by-word analysis.

https://iqra.itqan.dev/

## 🚀 Quick Start

### One-Command Development Setup

```bash
./dev-start.sh
```

This will automatically:
- ✅ Check prerequisites (Python, Node.js, FFmpeg)
- ✅ Set up Python virtual environment
- ✅ Install all dependencies
- ✅ Start backend API server on port 5000
- ✅ Start mobile development server with Expo
- ✅ Run health checks and display QR code

### Stop Development Servers

```bash
./dev-stop.sh
```

## Project Structure

```
iqra-al-quran/
├── backend/              # Flask API server with AI model
├── frontend/             # React web application (primary)
│   ├── src/              # React source code
│   ├── ios/              # Capacitor iOS build (native app wrapper)
│   └── android/          # Capacitor Android build (native app wrapper)
├── mobile/               # React Native app (future development)
├── docs/                 # Documentation
├── dev-start.sh          # Development startup script
├── dev-stop.sh           # Development cleanup script
├── LICENSE               # MIT License
├── CONTRIBUTING.md       # Contribution guidelines
├── CODE_OF_CONDUCT.md    # Community standards
└── SECURITY.md           # Security policy
```

## ✨ Features

- **Quranic Recitation Analysis**: AI-powered speech recognition specifically trained for Quran
- **Multi-Language Support**: Full English/Arabic interface with RTL support
- **Visual Error Feedback**: Color-coded word-by-word analysis
- **Web Application**: Modern React frontend with responsive design
- **Mobile-Ready**: 
  - Capacitor setup for iOS/Android builds (convert web app to native)
  - React Native version planned for future
- **Cloud-agnostic Deployment**: Ready for Railway, Vercel, or any cloud platform
- **Open Source**: MIT licensed for community collaboration

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- FFmpeg (for audio processing)

## ⚙️ Manual Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp env.example .env
# Edit .env and set FLASK_SECRET and other variables

python app.py
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment variables
cp env.example .env.local
# Edit .env.local and set VITE_API_BASE_URL

npm run dev
```

### Mobile Apps

#### Option 1: Capacitor (iOS/Android from Web)
The frontend includes Capacitor configuration to build native iOS and Android apps:

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# iOS (requires macOS and Xcode)
npx cap open ios

# Android (requires Android Studio)
npx cap open android
```

#### Option 2: React Native (Future)
A standalone React Native implementation is planned:

```bash
cd mobile
npm install

# Configure environment variables
cp env.example .env
# Edit .env and set API_BASE_URL

npm start
```

**Note:** The Capacitor approach (frontend/ios, frontend/android) converts the web app to native apps. The React Native approach (mobile/) will be a separate native implementation.

## 🛠 Technology Stack

- **Backend**: Python Flask, Transformers (Whisper), PyTorch
- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Mobile**: 
  - Capacitor (iOS/Android builds from web app)
  - React Native with Expo (future native implementation)
- **AI Model**: [tarteel-ai/whisper-base-ar-quran](https://huggingface.co/tarteel-ai/whisper-base-ar-quran)
- **Deployment**: Railway-ready configuration (cloud-agnostic)

## API Endpoints

- `GET /api/health?lang=en|ar` - Health check with language support
- `GET /api/surahs` - Get Juz 30 surahs
- `GET /api/all_surahs` - Get all surahs  
- `POST /api/check` - Check recitation accuracy with multi-language feedback

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

- Report bugs and suggest features via [Issues](https://github.com/Itqan-community/iqra-al-quran/issues)
- Submit pull requests for improvements
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Review our [Security Policy](SECURITY.md) for security concerns

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Testing the Setup

**Backend:**
1. Navigate to `http://localhost:5001/api/health`
2. Should return `{"status": "ok"}`

**Frontend:**
1. Open `http://localhost:5173` (or the port shown by Vite)
2. Test audio recording and API connectivity

**Mobile** (when available):
1. Run `./dev-start.sh`
2. Open Expo Go app on your phone
3. Scan the QR code displayed in terminal

### Troubleshooting

- **FFmpeg not found**: Install FFmpeg for your system
- **Port conflicts**: Use `./dev-stop.sh` to clean up ports
- **Audio permissions**: Grant microphone access on mobile device
- **Model download**: First run downloads AI model (may take time)

## 🏗 Architecture

- **Backend**: RESTful API with Automatic Speech Recognition (ASR) processing
- **Frontend**: React SPA with audio recording capabilities
- **Mobile**: Cross-platform app with audio recording (future)
- **Cloud-agnostic**: Environment-based configuration for any deployment platform

## 🙏 Acknowledgments

This project was inspired by [check-telawa](https://github.com/engsaleh/check-telawa/) by engsaleh.

Special thanks to:
- [Tarteel.ai](https://tarteel.ai/) for the Whisper Quran model
- The open-source community for the amazing tools and libraries

---

**Ready to enhance Quranic learning with AI! 🤲**

*Made with ❤️ for the Muslim community*
