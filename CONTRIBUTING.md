# Contributing to Iqra Al-Quran

Thank you for your interest in contributing to Iqra Al-Quran! This project aims to help people learn and improve their Quranic recitation using AI technology.

## How to Contribute

### Reporting Issues

- Check if the issue already exists before creating a new one
- Use clear and descriptive titles
- Provide detailed steps to reproduce bugs
- Include system information (OS, browser, Python/Node versions)

### Suggesting Features

- Open an issue with the "enhancement" label
- Clearly describe the feature and its benefits
- Explain how it aligns with the project's goals

### Code Contributions

1. **Fork the repository** and create your branch from `main`
2. **Set up your development environment**:
   ```bash
   ./dev-start.sh
   ```
3. **Make your changes**:
   - Write clear, commented code
   - Follow existing code style
   - Test your changes thoroughly
4. **Commit your changes**:
   - Use clear commit messages
   - Reference issue numbers if applicable
5. **Submit a pull request**:
   - Describe your changes clearly
   - Link related issues
   - Ensure all tests pass

## Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- FFmpeg

### Quick Start
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/iqra-al-quran.git
cd iqra-al-quran

# Start development servers
./dev-start.sh
```

### Environment Variables
- Copy `backend/env.example` to `backend/.env` and configure
- Copy `frontend/env.example` to `frontend/.env.local` and configure
- See setup documentation for details

## Project Structure

- `backend/` - Flask API with AI model integration
- `frontend/` - React web application (primary focus)
- `mobile/` - React Native mobile app (future development)
- `docs/` - Documentation

## Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript/TypeScript**: Use ESLint configuration
- **Comments**: Write clear comments for complex logic
- **Naming**: Use descriptive variable and function names

## Testing

- Test backend endpoints manually or with tools like Postman
- Test frontend in multiple browsers
- Verify mobile compatibility if changing mobile code
- Test with different Quranic verses and ayahs

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Add comments to explain complex logic
- Be responsive to review feedback

## Community

- Be respectful and constructive
- Help others when possible
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## Questions?

Open an issue with the "question" label or reach out to maintainers.

---

**May your contributions be beneficial! جزاك الله خيراً**
