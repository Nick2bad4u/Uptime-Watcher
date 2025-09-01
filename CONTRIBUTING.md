# Contributing to Uptime Watcher

Thank you for considering contributing to Uptime Watcher! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/Uptime-Watcher.git
   cd Uptime-Watcher
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Environment**

   ```bash
   npm run electron-dev
   ```

4. **Verify Setup**
   - The application should launch successfully
   - Check that hot reloading works by making a small change

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code is auto-formatted with Prettier
- **Tailwind CSS**: Use Tailwind classes for styling

### Git Workflow

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Keep commits small and focused
   - Write clear commit messages
   - Follow conventional commit format when possible

3. **Test Your Changes**

   ```bash
   npm run build
   npm run test  # if tests exist
   ```

4. **Submit a Pull Request**
   - Use the provided PR template
   - Include screenshots for UI changes
   - Reference any related issues

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
type(scope): brief description

Detailed explanation if needed

Fixes #123
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧩 Project Structure

```text
├── electron/          # Electron main process code
├── src/              # React frontend code
├── docs/             # Documentation
├── public/           # Static assets
├── scripts/          # Build and utility scripts
└── release/          # Build outputs
```

### Key Files

- `electron/main.ts` - Electron main process entry point
- `src/App.tsx` - React application root
- `src/store.ts` - Zustand state management
- `docs/` - Complete documentation system

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template and include:

- **Environment**: OS, Node.js version, app version
- **Steps to Reproduce**: Clear, step-by-step instructions
- **Expected Behavior**: What should have happened
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable

### Feature Requests

Use the feature request template and include:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: Detailed description of the feature
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Any other relevant information

## 📝 Documentation

### Writing Documentation

- Use clear, concise language
- Include code examples where appropriate
- Follow the existing documentation structure
- Ensure all links work correctly

### Documentation Structure

- **API Docs**: In `docs/api/` - auto-generated from JSDoc
- **Guides**: In `docs/guides/` - user and developer guides
- **Component Docs**: In `docs/component-docs/` - React component documentation

### Updating Documentation

- Update relevant docs when changing functionality
- Ensure markdown passes linting (use markdownlint)

## 🔧 Development Tasks

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run electron         # Start Electron
npm run electron-dev     # Start both concurrently

# Building
npm run build           # Build for production
npm run dist            # Build and package app

# Code Quality
npm run lint            # Run ESLint
npm run format          # Run Prettier
```

### Testing

Currently, the project primarily relies on manual testing. When adding new features:

1. Test in both development and production builds
2. Test on multiple platforms (Windows, macOS, Linux) if possible
3. Verify all monitoring functions work correctly
4. Check that data persistence works

## 🎯 Areas for Contribution

### High Priority

- **Testing**: Add unit and integration tests
- **Error Handling**: Improve error messages and recovery
- **Performance**: Optimize monitoring and UI performance
- **Accessibility**: Improve keyboard navigation and screen reader support

### Features

- **Export/Import**: Configuration backup and restore
- **Advanced Notifications**: Customizable notification rules
- **Monitoring Presets**: Common monitoring configurations
- **Dashboard Improvements**: Enhanced data visualization

### Documentation

- **Video Tutorials**: Screen recordings of key features
- **Migration Guides**: Upgrade instructions between versions
- **Integration Examples**: Examples of using the monitoring API

## 🌟 Recognition

Contributors are recognized in:

- Release notes for significant contributions
- GitHub contributors section
- Special thanks in documentation

## 📞 Getting Help

- **Documentation**: Check the [docs](README.md) first
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create an issue for bugs or feature requests
- **Chat**: Join our development discussions (if applicable)

## 📄 License

By contributing to Uptime Watcher, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Uptime Watcher! 🎉
