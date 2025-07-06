---
layout: default
title: Uptime Watcher Documentation
description: Comprehensive documentation for Uptime Watcher - A cross-platform desktop application for monitoring website uptime and server availability
---

Welcome to the comprehensive documentation for **Uptime Watcher** - a powerful, cross-platform desktop application built with Electron and React for monitoring website uptime and server availability.

## 🚀 Quick Start

### For Users

- **[Download & Installation](https://github.com/Nick2bad4u/Uptime-Watcher/releases)** - Get started with Uptime Watcher

## 🛠 What is Uptime Watcher?

Uptime Watcher is a feature-rich desktop application that helps you monitor the availability and performance of your websites, servers, and network services. Built with modern web technologies, it provides:

### ✨ Key Features

- **HTTP/HTTPS Monitoring** - Website uptime and response time tracking
- **Port Monitoring** - TCP port availability checking
- **Real-time Alerts** - Desktop notifications for status changes
- **Historical Data** - SQLite database with performance history
- **Cross-platform** - Windows, macOS, and Linux support
- **Dark/Light Themes** - Customizable user interface

### 🏗 Technology Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Electron Main Process + Node.js
- **Database:** SQLite with better-sqlite3
- **State Management:** Zustand
- **Build System:** Vite + Electron Builder
- **Testing Framework:** Vitest
- **CI/CD:** GitHub Actions for automated testing and deployment

## 🎯 Getting Started

### For Contributors

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Run development server**: `npm run dev`
4. **Review the [AI Context Instructions](AI_CONTEXT_INSTRUCTIONS.md)** for development guidelines
5. **Check [Codecov Components Guide](CODECOV_COMPONENTS_GUIDE.md)** for testing coverage requirements

### Coverage Components

The project uses Codecov Components to track coverage across different architectural areas:

- **Frontend Components** (UI, State, Services, Hooks, Utils)
- **Backend Components** (Services, Managers, Orchestrator, Utils)
- **Domain-Specific Components** (Database, Monitoring, IPC, Site Management)
- **Cross-Cutting Components** (Error Handling, Types, Constants)

See the [Codecov Components Quick Reference](CODECOV_COMPONENTS_QUICK_REFERENCE.md) for detailed coverage targets and component descriptions.

## 🔧 Development

### Code Quality

- **TypeScript** - Full type safety with strict configuration
- **ESLint + Prettier** - Code formatting and linting
- **Vitest** - Unit and integration testing
- **Codecov** - Coverage tracking with component-level analysis
- **GitHub Actions** - Automated CI/CD pipeline

### Architecture Highlights

- **Domain-Driven Design** - Clear separation of concerns
- **Event-Driven Architecture** - Real-time updates via IPC
- **Secure IPC Communication** - Context isolation and input validation
- **Comprehensive Error Handling** - Graceful degradation and user feedback
- **Performance Optimized** - Efficient state management and rendering

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](../CONTRIBUTING.md) for details on how to get started.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
