# 📊 Uptime Watcher

<!-- markdownlint-disable -->

An Electron desktop application for monitoring website uptime status with real-time updates, response time tracking, and historical data visualization.

## Features

- ✅ **Real-time Monitoring**: Track multiple websites simultaneously
- 📈 **Response Time Tracking**: Monitor and display response times
- 📊 **Historical Data**: Visual history of uptime/downtime status
- 🔔 **Desktop Notifications**: Get alerted when sites go down or come back up
- 🌓 **Dark/Light Mode**: Switch between themes
- ⚙️ **Customizable Intervals**: Set check frequency from 30 seconds to 30 minutes
- 💾 **Persistent Storage**: All data saved locally with JSON database

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Desktop Framework**: Electron (main + renderer processes)
- **State Management**: Zustand (domain-specific stores)
- **Database**: SQLite with node-sqlite3-wasm
- **IPC Communication**: Type-safe Electron contextBridge
- **Event System**: Custom TypedEventBus with middleware
- **Testing**: Vitest (dual configuration for frontend + backend)
- **Build Tools**: Vite + TypeScript + Electron Builder

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Nick2bad4u/Uptime-Watcher.git
cd Uptime-Watcher
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run electron-dev
```

> **New Developer?** Check out our [Quick Start Guide](_media/DEVELOPER-QUICK-START.md) for a comprehensive setup guide.

### Building for Production

```bash
npm run build
npm run dist
```

## Usage

1. **Add a Website**: Enter the URL of the website you want to monitor
2. **Start Monitoring**: Click the "Start Monitoring" button
3. **View Status**: Watch real-time status updates with response times
4. **Configure Intervals**: Adjust how frequently sites are checked
5. **View History**: See visual history of uptime/downtime for each site

## Development

- `npm run dev` - Start Vite development server
- `npm run electron` - Start Electron in development mode
- `npm run electron-dev` - Start both Vite and Electron concurrently
- `npm run build` - Build for production
- `npm run dist` - Build and package the application

## Architecture

The application follows a sophisticated service-oriented architecture with:

- **Main Process (Electron)**: Service container with dependency injection
- **Renderer Process (React)**: Component-based UI with Zustand state management
- **IPC Communication**: Type-safe communication via contextBridge
- **Database Layer**: Repository pattern with SQLite and transaction safety
- **Event System**: TypedEventBus for cross-service communication
- **Monitoring System**: Enhanced monitoring with operation correlation and race condition prevention

### Key Features

- 🏗️ **Service-Oriented Architecture**: Modular, testable service design
- 🔒 **Type Safety**: Strict TypeScript with comprehensive interfaces
- 📊 **Enhanced Monitoring**: Race condition prevention and operation correlation
- 🗃️ **Repository Pattern**: Transactional database operations
- 🎯 **Event-Driven**: Reactive communication between services
- 📚 **Comprehensive Documentation**: ADRs, guides, and code templates

### Documentation

- 🤖 **[AI Context Guide](_media/AI-CONTEXT.md)** - Quick onboarding for AI assistants
- 🚀 **[Developer Quick Start](_media/DEVELOPER-QUICK-START.md)** - Get started in minutes
- 📚 **[Complete Documentation Index](_media/DOCUMENTATION-INDEX.md)** - All documentation organized by role and topic
- 🏗️ **[Architecture Documentation](_media/Architecture)** - ADRs, patterns, and templates
- 📖 **[API Reference](_media/API-DOCUMENTATION.md)** - IPC interfaces and communication patterns
- 🔧 **[Troubleshooting Guide](_media/TROUBLESHOOTING.md)** - Common issues and solutions
- 🛠️ **[Environment Setup](_media/ENVIRONMENT-SETUP.md)** - Complete development environment guide

![Repository Stats](https://raw.githubusercontent.com/nick2bad4u/Uptime-Watcher/metrics/metrics.repository.svg)
