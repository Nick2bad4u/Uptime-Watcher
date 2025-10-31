# Contributing to Uptime Watcher

Thank you for considering contributing to Uptime Watcher! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

* __Node.js__ 24.8+ (required)
* __npm__ 11.5.2+ (included with Node.js)
* __Git__ (latest version)

### Development Setup

1. __Fork and Clone__

   ```bash
   git clone https://github.com/your-username/Uptime-Watcher.git
   cd Uptime-Watcher
   ```

2. __Install Dependencies__

   ```bash
   npm install
   ```

3. __Start Development Environment__

   ```bash
   npm run electron-dev
   ```

4. __Verify Setup__
   * The application window should launch successfully (Vite + Electron)
   * Check that hot reloading works by making a small change in `src/`

## 📋 Development Guidelines

### Code Quality Standards

* __TypeScript__: Strict TypeScript with comprehensive type safety
* __ESLint__: 50+ plugins configured for comprehensive code checking
* __Testing__: >90% test coverage requirement with multiple test types
* __Documentation__: TSDoc comments required for all public APIs

### Development Scripts

| Script                   | Purpose      | Description                                    |
| ------------------------ | ------------ | ---------------------------------------------- |
| `npm run dev`            | Development  | Start Vite dev server for frontend development |
| `npm run electron-dev`   | Full App     | Launch complete application (Vite + Electron)  |
| `npm run electron`       | Electron     | Launch Electron shell (requires Vite running)  |
| `npm run build`          | Production   | Build application for production               |
| `npm run test`           | Testing      | Run all test suites (unit, integration, E2E)   |
| `npm run lint`           | Code Quality | Check code formatting and style                |
| `npm run lint:fix`       | Code Quality | Automatically fix linting issues               |
| `npm run type-check:all` | Type Safety  | Verify TypeScript types across all modules     |

### Architecture Standards

* __State Management__: Zustand stores with domain separation
* __Database__: Repository pattern with transaction safety
* __IPC__: Secure contextBridge communication only
* __Testing__: Vitest + Stryker + Playwright + fast-check coverage

### Git Workflow

#### Contribution lifecycle

```mermaid
flowchart LR
    classDef idea fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985;
    classDef work fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef review fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef merge fill:#fae8ff,stroke:#a855f7,stroke-width:2px,color:#6b21a8;

    Idea(["Idea or Bug Report"]):::idea
    Issue{"Issue Created?"}:::review
    Assign["Self-assign or Discuss"]:::idea
    Branch["Create Feature Branch"]:::work
    Implement["Implement & Write Tests"]:::work
    Verify["Run lint / type / test suites"]:::work
    PR["Open Pull Request"]:::review
    Review{"Code Review"}:::review
    Merge["Merge via PR Template"]:::merge
    Celebrate(["Document & Release"]):::merge

    Idea --> Issue
    Issue -- yes --> Assign --> Branch --> Implement --> Verify --> PR --> Review
    Issue -- no --> Idea
    Review -- Changes requested --> Implement
    Review -- Approved --> Merge --> Celebrate
```

1. __Create a Feature Branch__

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. __Make Your Changes__
   * Keep commits small and focused
   * Write clear commit messages
   * Follow conventional commit format when possible

3. __Test Your Changes__

   ```bash
   npm run build
   npm run test  # if tests exist
   ```

4. __Submit a Pull Request__
   * Use the provided PR template
   * Include screenshots for UI changes
   * Reference any related issues

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
type(scope): brief description

Detailed explanation if needed

Fixes #123
```

__Types:__

* `feat`: New feature
* `fix`: Bug fix
* `docs`: Documentation changes
* `style`: Code style changes (formatting, etc.)
* `refactor`: Code refactoring
* `test`: Adding or updating tests
* `chore`: Maintenance tasks

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

* `electron/main.ts` - Electron main process entry point
* `src/App.tsx` - React application root
* `src/store.ts` - Zustand state management
* `docs/` - Complete documentation system

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template and include:

* __Environment__: OS, Node.js version, app version
* __Steps to Reproduce__: Clear, step-by-step instructions
* __Expected Behavior__: What should have happened
* __Actual Behavior__: What actually happened
* __Screenshots__: If applicable

### Feature Requests

Use the feature request template and include:

* __Problem Statement__: What problem does this solve?
* __Proposed Solution__: Detailed description of the feature
* __Alternatives__: Other solutions you've considered
* __Additional Context__: Any other relevant information

## 📝 Documentation

### Writing Documentation

* Use clear, concise language
* Include code examples where appropriate
* Follow the existing documentation structure
* Ensure all links work correctly

### Documentation Structure

* __API Docs__: In `docs/api/` - auto-generated from JSDoc
* __Guides__: In `docs/guides/` - user and developer guides
* __Component Docs__: In `docs/component-docs/` - React component documentation

### Updating Documentation

* Update relevant docs when changing functionality
* Ensure markdown passes linting (use markdownlint)
* Run `npm run docs:check-links` to verify Architecture and Docusaurus routes

## 🔧 Development Tasks

### Available Scripts

| Category          | Script                     | Description                                                       |
| ----------------- | -------------------------- | ----------------------------------------------------------------- |
| __Development__   | `npm run dev`              | Start Vite dev server                                             |
|                   | `npm run electron`         | Launch Electron shell (requires Vite dev server)                  |
|                   | `npm run electron-dev`     | Start dev server + Electron concurrently                          |
|                   | `npm run start-both`       | Alias for `electron-dev`                                          |
| __Building__      | `npm run build`            | Build for production                                              |
|                   | `npm run clean`            | Clean all build artifacts                                         |
| __Code Quality__  | `npm run lint`             | Run ESLint checks                                                 |
|                   | `npm run lint:fix`         | Fix ESLint issues automatically                                   |
|                   | `npm run format`           | Format code with Prettier                                         |
|                   | `npm run type-check:all`   | TypeScript type checking                                          |
| __Documentation__ | `npm run docs:check-links` | Validate internal documentation links (Architecture & Docusaurus) |
| __Testing__       | `npm run test`             | Run all test suites                                               |
|                   | `npm run test:coverage`    | Generate coverage reports                                         |
|                   | `npm run test:electron`    | Run Electron-specific tests                                       |

### Testing Requirements

* __Unit Tests__: Required for all business logic components
* __Integration Tests__: Required for IPC and database operations
* __E2E Tests__: Required for critical user workflows using Playwright
* __Property Tests__: Use fast-check for complex algorithmic functions
* __Mutation Testing__: Stryker configuration validates test quality
* __Coverage__: Maintain >90% coverage across all modules

### Validation Layers

* Follow the layered validation contract when adding features. Shape validation belongs in preload/IPC schemas, business rules in managers, and persistence checks in repositories.
* Emit structured `ApplicationError` instances when validation fails so renderer error handling stays consistent.
* Review the [Validation Strategy](docs/Guides/validation-strategy.md) guide before introducing new input flows or modifying existing schemas.

## � Priority Contribution Areas

### High Impact Opportunities

* __Enhanced Monitoring__: Advanced notification rules and alerting systems
* __Data Visualization__: Improved dashboard analytics and trending
* __Configuration Management__: Import/export of monitoring configurations
* __Performance Optimization__: Monitoring efficiency and UI responsiveness
* __Accessibility__: Enhanced keyboard navigation and screen reader support

### Technical Improvements

* __Additional Test Coverage__: Expand edge case testing
* __Error Recovery__: Enhanced error handling and user feedback
* __Internationalization__: Multi-language support infrastructure
* __Advanced Analytics__: Historical data analysis and reporting
* __Plugin Architecture__: Extensible monitoring modules

### Documentation Enhancements

* __Tutorial Content__: Step-by-step usage guides with screenshots
* __API Documentation__: Comprehensive API reference materials
* __Migration Guides__: Version upgrade and data migration instructions
* __Integration Examples__: Sample configurations and use cases

## �🌟 Recognition

Contributors are recognized in:

* Release notes for significant contributions
* GitHub contributors section
* Special thanks in documentation

## 📞 Getting Help

* __Documentation__: Check the [docs](README.md) first
* __Discussions__: Use GitHub Discussions for questions
* __Issues__: Create an issue for bugs or feature requests
* __Chat__: Join our development discussions (if applicable)

## 📄 License

By contributing to Uptime Watcher, you agree that your contributions will be licensed under the MIT License.

***

Thank you for contributing to Uptime Watcher! 🎉
