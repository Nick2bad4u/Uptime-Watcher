# 📊 Uptime Watcher

<div align="center"><a href="https://github.com/Nick2bad4u/Uptime-Watcher/releases">
  <img src="https://img.shields.io/badge/version-15.0.0-blue.svg" alt="Version">
</a>
<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-Unlicense-green.svg" alt="License">
</a>
<a href="https://www.electronjs.org/">
  <img src="https://img.shields.io/badge/Electron-v37.3.1-47848F?logo=electron" alt="Electron">
</a>
<a href="https://reactjs.org/">
  <img src="https://img.shields.io/badge/React-v19.1.1-61DAFB?logo=react" alt="React">
</a>
<a href="https://www.typescriptlang.org/">
  <img src="https://img.shields.io/badge/TypeScript-v5.9+-3178C6?logo=typescript" alt="TypeScript">
</a>

<a href="https://github.com/Nick2bad4u/Uptime-Watcher/actions">
  <img src="https://img.shields.io/github/actions/workflow/status/Nick2bad4u/Uptime-Watcher/Build.yml?branch=main&amp;logo=github" alt="Build Status">
</a>
<a href="https://sonarcloud.io/summary/new_code?id=Nick2bad4u_Uptime-Watcher">
  <img src="https://img.shields.io/sonar/quality_gate/Nick2bad4u_Uptime-Watcher?server=https%3A%2F%2Fsonarcloud.io" alt="Quality Gate">
</a>
<a href="https://codecov.io/gh/Nick2bad4u/Uptime-Watcher">
  <img src="https://img.shields.io/codecov/c/github/Nick2bad4u/Uptime-Watcher?logo=codecov" alt="Coverage">
</a>
<a href="https://github.com/Nick2bad4u/Uptime-Watcher/releases">
  <img src="https://img.shields.io/github/downloads/Nick2bad4u/Uptime-Watcher/total?logo=github" alt="Downloads">
</a>

<a href="https://github.com/Nick2bad4u/Uptime-Watcher">
  <img src="https://visitor-badge.laobi.icu/badge?page_id=Nick2bad4u.Uptime-Watcher&amp;left_color=gray&amp;right_color=blue" alt="Visitor Count">
</a>
<a href="https://github.com/Nick2bad4u/Uptime-Watcher/stargazers">
  <img src="https://img.shields.io/github/stars/Nick2bad4u/Uptime-Watcher?style=social" alt="GitHub Stars">
</a>
<a href="https://github.com/Nick2bad4u/Uptime-Watcher/network/members">
  <img src="https://img.shields.io/github/forks/Nick2bad4u/Uptime-Watcher?style=social" alt="GitHub Forks">
</a>

<strong>A Electron desktop application for uptime monitoring</strong>
<em>Track multiple services simultaneously with real-time updates, response time analytics, and historical data visualization</em>

<!-- Application screenshots will be added here once available -->
</div>

## <img src="./assets/UptimeWatcherMascot.png" alt="Uptime Watcher Mascot">

## What is Uptime Watcher?

Uptime Watcher is a desktop application built with modern web technologies that provides **monitoring capabilities** for websites, APIs, servers, and network services. Unlike most monitoring tools, there's **no cloud dependency** or command-line interface required. You can monitor everything with ease from a GUI.

## ✨ Key features

<div align="center">

| 🌐 <strong>Multi-Protocol Monitoring</strong> | 📊 <strong>Real-Time Analytics</strong> | 🔔 <strong>Smart Notifications</strong> |
| --------------------------------------------- | --------------------------------------- | --------------------------------------- |
| HTTP/HTTPS websites &amp; APIs                | Live status updates                     | Desktop alerts for outages              |
| TCP port connectivity                         | Response time tracking                  | Sound notifications                     |
| ICMP ping monitoring                          | Historical data visualization           | Custom alert thresholds                 |
| DNS record validation                         | Performance metrics                     | Status change detection                 |

</div>

## Core capabilities

- **🎯 Multi-Service Monitoring**: Supports HTTP/HTTPS, TCP ports, ICMP ping, and DNS monitoring
- **⚡ Real-Time Updates**: Live status changes with sub-second responsiveness
- **📈 Performance Analytics**: Response time tracking with trend analysis
- **📜 Historical Data**: Comprehensive uptime history with SQLite storage
- **⚙️ Flexible Configuration**: Customizable check intervals from 30 seconds to 30 minutes
- **💾 Data Persistence**: Local SQLite database with backup/restore functionality

## Monitor types

| Type           | Purpose                   | Features                                                                              |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| **HTTP/HTTPS** | Website & API monitoring  | Status codes, redirects, custom headers, SSL validation                               |
| **TCP Port**   | Port connectivity testing | Socket connection validation, timeout handling                                        |
| **ICMP Ping**  | Network reachability      | Packet loss monitoring, latency measurement                                           |
| **DNS**        | DNS resolution monitoring | Support for A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, PTR, NAPTR, SOA, TLSA, ANY records |

## 🛠️ Technology stack

<div align="center">

### <strong>Frontend Architecture</strong>

<a href="https://reactjs.org/">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&amp;logoColor=white" alt="React">
</a>
<a href="https://www.typescriptlang.org/">
  <img src="https://img.shields.io/badge/TypeScript-5.9+-3178C6?logo=typescript&amp;logoColor=white" alt="TypeScript">
</a>
<a href="https://tailwindcss.com/">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&amp;logoColor=white" alt="Tailwind CSS">
</a>
<a href="https://vitejs.dev/">
  <img src="https://img.shields.io/badge/Vite-5.4+-646CFF?logo=vite&amp;logoColor=white" alt="Vite">
</a>

### <strong>Desktop Framework</strong>

<a href="https://www.electronjs.org/">
  <img src="https://img.shields.io/badge/Electron-37.3.1-47848F?logo=electron&amp;logoColor=white" alt="Electron">
</a>
<a href="https://nodejs.org/">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&amp;logoColor=white" alt="Node.js">
</a>

### <strong>State &amp; Data Management</strong>

<a href="https://github.com/pmndrs/zustand">
  <img src="https://img.shields.io/badge/Zustand-State_Management-FF6B6B" alt="Zustand">
</a>
<a href="https://sqlite.org/">
  <img src="https://img.shields.io/badge/SQLite-node--sqlite3--wasm-003B57?logo=sqlite&amp;logoColor=white" alt="SQLite">
</a>

### <strong>Development &amp; Quality</strong>

<a href="https://vitest.dev/">
  <img src="https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&amp;logoColor=white" alt="Vitest">
</a>
<a href="https://eslint.org/">
  <img src="https://img.shields.io/badge/ESLint-Code_Quality-4B32C3?logo=eslint&amp;logoColor=white" alt="ESLint">
</a>
<a href="https://prettier.io/">
  <img src="https://img.shields.io/badge/Prettier-Code_Formatting-F7B93E?logo=prettier&amp;logoColor=white" alt="Prettier">
</a></div>

## 🚀 Quick start

### **Installation**

#### **Option 1: Download release (Recommended)**

```bash
# Download the latest release from GitHub
# Available for Windows, macOS, and Linux
```

**👉 [Download Latest Release](https://github.com/Nick2bad4u/Uptime-Watcher/releases/latest)**

#### **Option 2: Build from source**

```bash
# Clone the repository
git clone https://github.com/Nick2bad4u/Uptime-Watcher.git
cd Uptime-Watcher

# Install dependencies
npm install

# Start development environment
npm run electron-dev
```

## Screenshots & demo

<div align="center">

_Application screenshots and demo videos will be added in future releases._

**Key interface components:**

- 📊 **Main Dashboard**: Real-time monitoring overview with service status
- ⚙️ **Monitor Configuration**: Easy setup for HTTP, TCP, DNS, and ping monitoring
- 📈 **Historical Analytics**: Response time graphs and uptime statistics
- 🔔 **Notification System**: Customizable desktop alerts for status changes

</div>

---

## 👨‍💻 Development

### **Development setup**

```bash
# Start Vite dev server only
npm run dev

# Start Electron only (requires Vite to be running)
npm run electron

# Start both Vite and Electron concurrently (recommended)
npm run electron-dev

# Build for production
npm run build

# Package the application
npm run dist
```

### **Development prerequisites**

<div align="center">

| Requirement              | Version                         | Download                                    |
| ------------------------ | ------------------------------- | ------------------------------------------- |
| <strong>Node.js</strong> | 22.0+ (recommended)             | <a href="https://nodejs.org/">Download</a>  |
| <strong>npm</strong>     | 11.5.2+ (included with Node.js) | <a href="https://www.npmjs.com/">Docs</a>   |
| <strong>Git</strong>     | Latest version                  | <a href="https://git-scm.com/">Download</a> |

&gt; <strong>💡 Tip</strong>: Check out the <a href="./docs/Guides/DEVELOPER-QUICK-START.md">Developer Quick Start Guide</a> for detailed setup instructions and architecture overview.

</div>

### Monitoring recommendations

For practical guidance on configuring monitors and writing tests, see our comprehensive testing documentation:

- [Testing Documentation](./docs/Testing/) - Includes fuzzing coverage, Playwright guides, and testing best practices

### Fuzzing and property-based tests

For running and tuning our fast-check based fuzzing suites, see:

- Fast-Check Fuzzing Coverage Guide → <a href="./docs/Testing/FAST-CHECK-FUZZING-COVERAGE.md">docs/Testing/FAST-CHECK-FUZZING-COVERAGE.md</a>

### End-to-end testing with Playwright

For comprehensive testing with Playwright, including setup, configuration, and troubleshooting common issues:

- Playwright Testing Guide → <a href="./docs/Testing/PLAYWRIGHT_TESTING_GUIDE.md">docs/Testing/PLAYWRIGHT_TESTING_GUIDE.md</a>

## Architectural principles

The application follows a **service-oriented architecture** with clear separation of concerns:

### System architecture overview

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'fontFamily': 'Inter, system-ui, sans-serif', 'primaryColor': '#0f172a', 'primaryTextColor': '#f8fafc', 'primaryBorderColor': '#38bdf8', 'lineColor': '#0ea5e9', 'tertiaryColor': '#f1f5f9', 'clusterBkg': '#0f172a', 'clusterBorder': '#1e293b' }, 'flowchart': { 'curve': 'basis', 'htmlLabels': true } }}%%
flowchart LR
    classDef persona fill:#fffbeb,stroke:#f97316,color:#9a3412,font-weight:bold;
    classDef main fill:#fdf2f8,stroke:#db2777,color:#831843;
    classDef renderer fill:#ecfeff,stroke:#0ea5e9,color:#0f172a;
    classDef data fill:#ecfdf5,stroke:#10b981,color:#064e3b;
    classDef service fill:#ede9fe,stroke:#7c3aed,color:#312e81;
    classDef infra fill:#fef3c7,stroke:#f59e0b,color:#92400e;
    linkStyle default stroke-width:2px;

    User((👩‍💻 Operator)):::persona
    subgraph Renderer['Renderer · React + Zustand']
        direction TB
        UI['React UI Components']
        Store['Zustand Domain Stores']
        Telemetry['UX Telemetry Hooks']
    end
    subgraph Main['Electron Main Process']
        direction TB
        Services['Monitoring Orchestrator']
        IPC['Typed IPC Gateway']
        Scheduler['Task Scheduler']
        EventBus['TypedEventBus']
    end
    subgraph Persistence['Local Persistence & Cache']
        direction TB
        SQLite[(SQLite Database)]
        Cache[(In-Memory Cache)]
        Backups['Backup Service']
    end
    subgraph Integrations['Infrastructure & Services']
        direction TB
        Monitors['Protocol Workers
HTTP/TCP/DNS/Ping']
        Alerts['Notification Engine']
    end

    User -->|Configures| UI
    UI --> Store
    Store -->|Requests| IPC
    IPC --> Services
    Services --> EventBus
    Services --> Scheduler
    Scheduler --> Monitors
    Monitors --> Services
    Services -->|Status Events| IPC
    IPC --> Store
    Store --> Telemetry --> EventBus
    Services --> SQLite
    SQLite --> Cache
    Cache --> Services
    SQLite --> Backups
    EventBus --> Alerts
    Alerts --> User

    class Services,IPC,Scheduler,EventBus,Monitors,Alerts service;
    class SQLite,Cache,Backups data;
    class UI,Store,Telemetry renderer;
    class Integrations infra;

    click Services 'docs/Architecture/README.md' 'Open architecture documentation'
    click Store 'docs/Architecture/ADRs/ADR-004-Frontend-State-Management.md' 'Read ADR-004'
    click IPC 'docs/Architecture/ADRs/ADR-005-IPC-Communication-Protocol.md' 'Read IPC protocol'
    click EventBus 'docs/Architecture/ADRs/ADR-002-Event-Driven-Architecture.md' 'Read event-driven architecture'
    click SQLite 'docs/Architecture/ADRs/ADR-001-Repository-Pattern.md' 'Review repository pattern'
```



### **🔧 Core components**

- **🖥️ Main Process (Electron)**: Service container with dependency injection
- **🎨 Renderer Process (React)**: Component-based UI with Zustand state management
- **🔗 IPC Communication**: Type-safe communication via contextBridge
- **🗃️ Database Layer**: Repository pattern with SQLite and transaction safety
- **📡 Event System**: TypedEventBus for cross-service communication
- **📊 Monitoring System**: Enhanced monitoring with operation correlation

### **🎯 Key design features**

- **🏗️ Service-Oriented Architecture**: Modular, testable service design
- **🔒 Type Safety**: Strict TypeScript with comprehensive interfaces
- **📊 Enhanced Monitoring**: Race condition prevention and operation correlation
- **🗃️ Repository Pattern**: Transactional database operations
- **🎯 Event-Driven**: Reactive communication between services

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **🎯 Ways to contribute**

- 🐛 **Bug Reports**: Found an issue? [Open an issue](https://github.com/Nick2bad4u/Uptime-Watcher/issues/new)
- 💡 **Feature Requests**: Have an idea? [Start a discussion](https://github.com/Nick2bad4u/Uptime-Watcher/issues/new)
- 🔧 **Code Contributions**: Submit pull requests with improvements
- 📚 **Documentation**: Help improve our docs and guides
- 🧪 **Testing**: Help test new features and report issues

### **📋 Development guidelines**

1. **Fork the Repository** and create a feature branch
2. **Follow Code Standards** (TypeScript, ESLint, Prettier)
3. **Write Tests** for new functionality
4. **Update Documentation** for any user-facing changes
5. **Submit a Pull Request** with a clear description

---

## 📄 License

<div align="center"><a href="LICENSE">
  <img src="https://img.shields.io/badge/license-Unlicense-green.svg" alt="License">
</a>

<strong>This project is released under the <a href="LICENSE">Unlicense</a> - Public Domain</strong>

<em>You are free to use, modify, and distribute this software for any purpose, commercial or non-commercial, without any restrictions. Credit is appreciated but not required.</em></div>

---

## Get help

[![GitHub Issues](https://img.shields.io/badge/Issues-GitHub-blue?logo=github)](https://github.com/Nick2bad4u/Uptime-Watcher/issues) [![Documentation](https://img.shields.io/badge/Docs-Available-brightgreen)](./docs/)

---

<img src="./assets/UptimeWatcherMascotServer.png" alt="Uptime Watcher Mascot Server">

<div align="center"><strong>Made with ❤️ by <a href="https://github.com/Nick2bad4u">Nick2bad4u</a></strong>

<em>Last updated: September 2025 • Version 15.0.0</em></div>
