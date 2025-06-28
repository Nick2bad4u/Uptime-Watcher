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

- **Frontend**: React + TypeScript + Tailwind CSS
- **Desktop Framework**: Electron
- **State Management**: Zustand
- **Database**: LowDB (JSON file-based)
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
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

The application follows a clean separation between:

- **Main Process**: Handles app lifecycle, uptime monitoring, and notifications
- **Renderer Process**: React-based UI with real-time updates
- **IPC Communication**: Secure communication between main and renderer processes
- **Database Layer**: SQLite-based storage for persistence

For detailed architecture information, see the [comprehensive documentation](docs/README.md).

## Documentation

Complete documentation is available in the `docs/` folder:

### 📚 Core Documentation

- **[📚 Documentation Index](docs/README.md)** - Complete documentation navigation
- **[🚀 Developer Guide](docs/guides/Developer-Guide.md)** - Setup and development workflow
- **[🏗️ Architecture Guide](docs/architecture/Project-Architecture-Guide.copilotmd)** - Complete system architecture

### 📖 API Reference

- **[📖 API Reference](docs/api/README.md)** - Comprehensive API documentation
  - [Store API](docs/api/store-api.md) - State management interfaces
  - [IPC API](docs/api/ipc-api.md) - Electron communication
  - [Types API](docs/api/types-api.md) - TypeScript definitions
  - [Theme API](docs/api/theme-api.md) - Theming system
  - [Hook APIs](docs/api/hook-apis.md) - React hooks
  - [Database API](docs/api/database-api.md) - Data persistence
  - [Utilities API](docs/api/utilities-api.md) - Helper functions

### 📘 User Guides

- **[❓ FAQ](docs/guides/FAQ.md)** - Frequently asked questions
- **[🔧 Troubleshooting Guide](docs/guides/Troubleshooting.md)** - Common issues and solutions
- **[⚡ Performance Guide](docs/guides/Performance-Guide.md)** - Optimization strategies
- **[🛡️ Security Guide](docs/guides/Security-Guide.md)** - Security considerations

### 🧩 Component Documentation

- **[🧩 Component Docs](docs/component-docs/README.md)** - UI component documentation
- **[Dashboard](docs/component-docs/Dashboard.md)** - Main dashboard component
- **[Site Details](docs/component-docs/SiteDetails.md)** - Site detail modal system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
Uptime-Watcher Electron App
