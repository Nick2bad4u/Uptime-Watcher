# 🛠️ Environment Setup Guide

> **Complete Setup**: Comprehensive guide for setting up the perfect development environment for Uptime Watcher.

## 📋 Prerequisites

### Required Software

- **Node.js**: 18+ LTS (recommended: 18.17.0 or later)
- **npm**: 9+ (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended IDE (with extensions)

### Operating System Support

- ✅ **Windows**: 10+ (tested on Windows 11)
- ✅ **macOS**: 11+ (Big Sur and later)
- ✅ **Linux**: Ubuntu 20.04+ (or equivalent)

## 🔧 Development Environment

### 1. Node.js Setup

#### Installation

```bash
# Using Node Version Manager (recommended)
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Windows (using Chocolatey)
choco install nodejs --version=18.17.0

# Or download directly from nodejs.org
```

#### Verification

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 2. VS Code Configuration

#### Required Extensions

```bash
# Install via command line
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-jest
code --install-extension ms-playwright.playwright
```

Or install from VS Code Extensions marketplace:

- **TypeScript and JavaScript**: Latest TypeScript features
- **Tailwind CSS IntelliSense**: Autocomplete for CSS classes
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Jest**: Testing support
- **Playwright**: E2E testing (if used)

#### Recommended Extensions

```bash
# Additional useful extensions
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode.vscode-markdown
code --install-extension ms-vscode.vscode-css
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-git-graph
```

#### VS Code Settings

Create `.vscode/settings.json` in your workspace:

```json
{
 "editor.codeActionsOnSave": {
  "source.fixAll.eslint": true,
  "source.organizeImports": true
 },
 "editor.formatOnSave": true,
 "eslint.validate": [
  "javascript",
  "typescript",
  "javascriptreact",
  "typescriptreact"
 ],
 "files.associations": {
  "*.css": "tailwindcss"
 },
 "tailwindCSS.includeLanguages": {
  "typescript": "javascript",
  "typescriptreact": "javascript"
 },
 "typescript.preferences.importModuleSpecifier": "relative",
 "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

#### Launch Configuration

Debugging configuration (`.vscode/launch.json`):

```json
{
 "configurations": [
  {
   "name": "Debug Electron Main",
   "type": "node",
   "request": "launch",
   "program": "${workspaceFolder}/dist-electron/main.js",
   "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
   "runtimeArgs": ["--remote-debugging-port=9229"],
   "console": "integratedTerminal"
  },
  {
   "name": "Debug Electron Renderer",
   "type": "chrome",
   "request": "launch",
   "url": "http://localhost:5173",
   "webRoot": "${workspaceFolder}/src"
  }
 ],
 "version": "0.2.0"
}
```

### 3. Git Configuration

#### Global Settings

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
```

#### Project-Specific Hooks

The project uses Husky for Git hooks:

```bash
# Hooks are automatically installed via npm install
# But you can manually install if needed
npx husky install
```

## 🚀 Project Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Nick2bad4u/Uptime-Watcher.git
cd Uptime-Watcher

# Install dependencies
npm install

# Verify installation
npm run check-types
npm run lint
npm test
```

### 2. Environment Variables

Create `.env` file in project root (if needed):

```bash
# Development settings
NODE_ENV=development
ELECTRON_ENABLE_LOGGING=true
VITE_APP_VERSION=$npm_package_version

# Database settings (optional)
DATABASE_PATH=./data/uptime-watcher.db

# Notification settings (optional)
NOTIFICATIONS_ENABLED=true
```

### 3. Database Setup

The SQLite database is automatically initialized:

```bash
# Copy WASM files (should happen automatically)
npm run postbuild

# Verify database setup
npm run electron-dev
```

### 4. Verify Setup

```bash
# Type checking
npm run check-types

# Linting
npm run lint

# Testing
npm test

# Build verification
npm run build

# Start development
npm run electron-dev
```

## 🔍 Development Tools

### Terminal Setup

#### Windows (PowerShell/Command Prompt)

```powershell
# Enable developer mode
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Windows Terminal (recommended)
winget install Microsoft.WindowsTerminal
```

#### macOS (Terminal/iTerm2)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install useful tools
brew install tree
brew install jq
```

#### Linux (Bash/Zsh)

```bash
# Install useful tools
sudo apt update
sudo apt install tree jq curl wget
```

### Useful Global Tools

```bash
# Install globally useful development tools
npm install -g @commitlint/cli
npm install -g eslint
npm install -g prettier
npm install -g typescript
npm install -g ts-node
npm install -g nodemon
```

## ⚙️ IDE-Specific Setup

### VS Code Workspace

Create `.vscode/uptime-watcher.code-workspace`:

```json
{
 "extensions": {
  "recommendations": [
   "ms-vscode.vscode-typescript-next",
   "bradlc.vscode-tailwindcss",
   "ms-vscode.vscode-eslint",
   "esbenp.prettier-vscode"
  ]
 },
 "folders": [
  {
   "path": "."
  }
 ],
 "settings": {
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "files.exclude": {
   "**/node_modules": true,
   "**/dist": true,
   "**/dist-electron": true,
   "**/.git": true,
   "**/.DS_Store": true,
   "**/coverage": true
  }
 }
}
```

### WebStorm/IntelliJ Setup

1. **Install Node.js plugin**
2. **Configure TypeScript**: Settings → Languages → TypeScript → use project TypeScript
3. **Configure ESLint**: Settings → Languages → JavaScript → Code Quality Tools → ESLint
4. **Configure Prettier**: Settings → Languages → JavaScript → Prettier

## 🧪 Testing Environment

### Test Database

The test environment uses an in-memory SQLite database:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:electron  # Backend tests
npm run test:frontend  # Frontend tests
```

### Coverage Reports

```bash
# Generate coverage reports
npm run test:coverage

# View coverage reports
open coverage/index.html          # macOS
start coverage/index.html         # Windows
xdg-open coverage/index.html      # Linux
```

## 🔒 Security Setup

### Code Scanning

The project includes multiple security tools:

```bash
# Run security scans
npm run lint:security
npm run lint:secrets
npm run lint:vulnerability
```

### Dependencies

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

## 🐳 Optional: Docker Setup

For consistent development environments:

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 5173 9229

CMD ["npm", "run", "electron-dev"]
```

```yaml
# docker-compose.dev.yml
version: "3.8"
services:
 uptime-watcher:
  build:
   context: .
   dockerfile: Dockerfile.dev
  volumes:
   - .:/app
   - /app/node_modules
  ports:
   - "5173:5173"
   - "9229:9229"
  environment:
   - NODE_ENV=development
```

## 🚀 Performance Optimization

### Development Performance

```bash
# Enable TypeScript project references for faster builds
npm run build:references

# Use incremental TypeScript compilation
tsc --incremental

# Optimize VS Code for large projects
code --max-memory=8192
```

### Build Performance

```bash
# Parallel builds
npm run build:parallel

# Use faster disk I/O (if available)
npm config set cache-folder ./npm-cache
```

## 📱 Platform-Specific Setup

### Windows

```powershell
# Enable developer features
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Install build tools (if needed for native modules)
npm install --global windows-build-tools
```

### macOS

```bash
# Install Xcode command line tools
xcode-select --install

# Install Homebrew packages
brew install git node
```

### Linux

```bash
# Install build essentials
sudo apt update
sudo apt install build-essential git curl

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## ✅ Verification Checklist

### Environment Verification

- [ ] Node.js 18+ installed and active
- [ ] npm 9+ available
- [ ] Git configured with user details
- [ ] VS Code with recommended extensions
- [ ] Project cloned and dependencies installed

### Development Verification

- [ ] `npm run electron-dev` starts successfully
- [ ] Hot reload works for both frontend and backend
- [ ] TypeScript compilation works without errors
- [ ] Linting passes without errors
- [ ] Tests run successfully
- [ ] Build process completes successfully

### Tool Verification

- [ ] ESLint integration working in IDE
- [ ] Prettier formatting on save
- [ ] TypeScript IntelliSense working
- [ ] Debugging configuration functional
- [ ] Git hooks executing properly

---

🎉 **You're all set!** Your development environment is now ready for productive Uptime Watcher development. Check out the [Developer Quick Start Guide](./DEVELOPER-QUICK-START.md) for next steps.
