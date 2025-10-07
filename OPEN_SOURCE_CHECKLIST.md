# Open Source Release Checklist ✅

This document tracks the changes made to prepare Iqra Al-Quran for open source release.

## Completed Tasks ✅

### 1. License
- ✅ Added MIT LICENSE file
- ✅ Added license badge to README

### 2. Security & Configuration
- ✅ Removed hardcoded production URL from `frontend/src/config/api.ts`
- ✅ Updated to require `VITE_API_BASE_URL` environment variable
- ✅ Updated `mobile/src/services/api.js` to require `API_BASE_URL` environment variable
- ✅ Added `mobile/env.example` for mobile app configuration
- ✅ All sensitive configuration now uses environment variables
- ✅ No credentials or API keys found in codebase

### 3. Repository Cleanup
- ✅ Deleted `backend/app_backup.py`
- ✅ Deleted `backend/app_original.py`
- ✅ Deleted `backend/app_optimized.py`
- ✅ Deleted `backend/app_faster_whisper.py`
- ✅ Deleted `backend/requirements_backup.txt`

### 4. Git Configuration
- ✅ Updated `.gitignore` to exclude:
  - Virtual environments (`venv/`)
  - Node modules
  - Environment files
  - Build outputs
  - Model files
  - Temporary/backup files

### 5. Community Files
- ✅ Created `CONTRIBUTING.md` - Contribution guidelines
- ✅ Created `CODE_OF_CONDUCT.md` - Community standards
- ✅ Created `SECURITY.md` - Security policy

### 6. Documentation
- ✅ Updated README with:
  - Open source badge
  - Clear setup instructions for all components
  - Prerequisites section
  - Contributing section
  - License information
  - Acknowledgments
  - Updated project structure

## Important: Manual Steps Required ⚠️

Before making the repository public, you **MUST** complete these steps:

### 1. Remove `venv/` from Git History
The `backend/venv/` directory is currently tracked by Git. Remove it:

```bash
# Remove venv from Git tracking
git rm -r --cached backend/venv/

# Commit the change
git add .gitignore
git commit -m "Remove venv from version control"
```

### 2. Update GitHub Repository Settings
Once you make the repository public, update:

- Repository description
- Topics/tags (e.g., `quran`, `ai`, `speech-recognition`, `python`, `react`)
- Social preview image (optional)

### 3. Update README Links
Replace `YOUR_USERNAME` in README.md with your actual GitHub username:
- Line with: `https://github.com/YOUR_USERNAME/iqra-al-quran/issues`

### 4. Configure Environment Variables
Before deploying or running locally, ensure:

**Backend** (`backend/.env`):
```
FLASK_SECRET=your_strong_secret_key_here
PORT=5001
MODEL_NAME=tarteel-ai/whisper-base-ar-quran
```

**Frontend** (`frontend/.env.local`):
```
VITE_API_BASE_URL=http://localhost:5001
```

**Mobile** (`mobile/.env`) - Future:
```
API_BASE_URL=http://YOUR_LOCAL_IP:5001
```

### 5. Test Everything
Before making public:
1. Clone the repo in a fresh directory
2. Follow the setup instructions in README
3. Verify backend starts correctly
4. Verify frontend starts and connects to backend
5. Test a recitation check
6. Ensure no errors related to missing configuration

## Post-Release Recommendations

### 1. GitHub Repository Setup
- Enable GitHub Actions for CI/CD (optional)
- Set up issue templates
- Configure branch protection for `main`
- Add repository topics

### 2. Documentation
- Consider adding a demo video or GIF
- Add screenshots to README
- Create a CHANGELOG.md for version tracking

### 3. Community Engagement
- Star the repositories you've credited (tarteel-ai, check-telawa)
- Share on relevant platforms (Reddit, Twitter, etc.)
- Consider adding to Awesome Lists

### 4. Deployment
- Deploy a demo instance (Railway, Vercel, etc.)
- Add the demo link to README
- Monitor usage and costs

## Notes

- All environment variables are documented in `.env.example` files
- No sensitive data remains in the codebase
- Project follows open source best practices
- Community files are tailored to the project's purpose

## Security Reminder

- Never commit `.env` files
- Rotate any secrets that may have been exposed
- Use strong, unique values for `FLASK_SECRET` in production
- Implement rate limiting in production deployment

---

**Your repository is now ready for open source release! 🎉**

Delete this checklist file once you've completed the manual steps.
