# Security Policy

## Reporting Security Vulnerabilities

We take the security of Iqra Al-Quran seriously. If you discover a security vulnerability, please help us by reporting it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead:
1. Open a private security advisory on GitHub, or
2. Email the maintainers directly with details

### What to Include

When reporting a vulnerability, please include:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

## Supported Versions

Currently, we provide security updates for:
- The latest release on the `main` branch
- Critical fixes may be backported to recent releases

## Security Best Practices for Deployment

### Environment Variables
- **Never** commit `.env` files or expose API keys
- Use strong, unique values for `FLASK_SECRET`
- Rotate secrets regularly in production

### Backend Security
- Keep Python dependencies updated
- Use HTTPS in production
- Set appropriate CORS policies
- Implement rate limiting for API endpoints
- Validate all user inputs

### Frontend Security
- Keep Node.js dependencies updated
- Use environment variables for configuration
- Sanitize user inputs
- Implement Content Security Policy (CSP)

### Infrastructure
- Use secure hosting with SSL/TLS
- Keep systems patched and updated
- Monitor logs for suspicious activity
- Implement proper authentication for production APIs

## Known Security Considerations

### Audio File Processing
- Audio files are processed server-side
- Implement file size limits to prevent DoS
- Validate file types before processing
- Consider implementing request rate limiting

### AI Model
- The Whisper model runs on the backend
- Ensure adequate resources to prevent service degradation
- Monitor for unusual usage patterns

## Disclosure Policy

- We aim to acknowledge reports within 48 hours
- We will provide updates on the fix progress
- Once fixed, we will publicly disclose the vulnerability with credit to the reporter (if desired)

## Questions?

For non-security questions, please use GitHub Issues. For security concerns, follow the reporting process above.

---

**Thank you for helping keep Iqra Al-Quran secure! 🔒**
