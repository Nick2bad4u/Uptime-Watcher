# Contributing to Uptime Watcher

Thank you for considering contributing to Uptime Watcher! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22.0+ (recommended)
- **npm** 11.5.2+ (included with Node.js)
- **Git** (latest version)

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
   npm run dev
   ```

4. **Verify Setup**
   - The application should launch successfully
   - Check that hot reloading works by making a small change

## 📋 Development Guidelines

### Code Quality Standards

- **TypeScript**: Strict TypeScript with comprehensive type safety
- **ESLint**: 50+ plugins configured for comprehensive code checking
- **Testing**: >90% test coverage requirement with multiple test types
- **Documentation**: TSDoc comments required for all public APIs

### Development Scripts

| Script                   | Purpose      | Description                                    |
| ------------------------ | ------------ | ---------------------------------------------- |
| `npm run dev`            | Development  | Start Vite dev server for frontend development |
| `npm run start`          | Full App     | Launch complete application (dev + electron)   |
| `npm run build`          | Production   | Build application for production               |
| `npm run test`           | Testing      | Run all test suites (unit, integration, E2E)   |
| `npm run lint`           | Code Quality | Check code formatting and style                |
| `npm run lint:fix`       | Code Quality | Automatically fix linting issues               |
| `npm run type-check:all` | Type Safety  | Verify TypeScript types across all modules     |

### Architecture Standards

- **State Management**: Zustand stores with domain separation
- **Database**: Repository pattern with transaction safety
- **IPC**: Secure contextBridge communication only
- **Testing**: Vitest + Stryker + Playwright + fast-check coverage

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

| Category         | Script                   | Description                              |
| ---------------- | ------------------------ | ---------------------------------------- |
| **Development**  | `npm run dev`            | Start Vite dev server                    |
|                  | `npm run start`          | Launch complete application              |
|                  | `npm run start-both`     | Start dev server + electron concurrently |
| **Building**     | `npm run build`          | Build for production                     |
|                  | `npm run clean`          | Clean all build artifacts                |
| **Code Quality** | `npm run lint`           | Run ESLint checks                        |
|                  | `npm run lint:fix`       | Fix ESLint issues automatically          |
|                  | `npm run format`         | Format code with Prettier                |
|                  | `npm run type-check:all` | TypeScript type checking                 |
| **Testing**      | `npm run test`           | Run all test suites                      |
|                  | `npm run test:coverage`  | Generate coverage reports                |
|                  | `npm run test:electron`  | Run Electron-specific tests              |

### Testing Requirements

- **Unit Tests**: Required for all business logic components
- **Integration Tests**: Required for IPC and database operations
- **E2E Tests**: Required for critical user workflows using Playwright
- **Property Tests**: Use fast-check for complex algorithmic functions
- **Mutation Testing**: Stryker configuration validates test quality
- **Coverage**: Maintain >90% coverage across all modules

## � Priority Contribution Areas

### High Impact Opportunities

- **Enhanced Monitoring**: Advanced notification rules and alerting systems
- **Data Visualization**: Improved dashboard analytics and trending
- **Configuration Management**: Import/export of monitoring configurations
- **Performance Optimization**: Monitoring efficiency and UI responsiveness
- **Accessibility**: Enhanced keyboard navigation and screen reader support

### Technical Improvements

- **Additional Test Coverage**: Expand edge case testing
- **Error Recovery**: Enhanced error handling and user feedback
- **Internationalization**: Multi-language support infrastructure
- **Advanced Analytics**: Historical data analysis and reporting
- **Plugin Architecture**: Extensible monitoring modules

### Documentation Enhancements

- **Tutorial Content**: Step-by-step usage guides with screenshots
- **API Documentation**: Comprehensive API reference materials
- **Migration Guides**: Version upgrade and data migration instructions
- **Integration Examples**: Sample configurations and use cases

## �🌟 Recognition

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
