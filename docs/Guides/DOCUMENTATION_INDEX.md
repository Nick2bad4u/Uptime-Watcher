# 📚 Documentation Index

> __Navigation Hub__: Complete guide to all Uptime Watcher documentation with quick links and descriptions.

## Quick links

### Getting started

* __[Developer Quick Start](./DEVELOPER-QUICK-START.md)__ - Get up and running in minutes
* __[Environment Setup](./ENVIRONMENT-SETUP.md)__ - Complete development environment configuration
* __[AI Context Guide](./AI-CONTEXT.md)__ - Essential context for AI assistants

### Core documentation

* __[API Documentation](./API-DOCUMENTATION.md)__ - IPC interfaces and communication patterns
* __[Troubleshooting Guide](./TROUBLESHOOTING.md)__ - Common issues and solutions
* __[Testing Guide](../Guides/TESTING.md)__ - Testing setup and practices

## � Documentation structure

### Root level (`/docs/`)

Essential documentation for developers and contributors:

| Document                                               | Purpose                         | Audience                      |
| ------------------------------------------------------ | ------------------------------- | ----------------------------- |
| [AI-CONTEXT.md](./AI-CONTEXT.md)                       | Quick AI onboarding             | AI Assistants, New Developers |
| [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md) | Fast developer setup            | New Contributors              |
| [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)         | Complete environment guide      | Developers                    |
| [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)         | IPC and API reference           | Frontend/Backend Developers   |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)             | Debug and fix issues            | All Developers                |
| [TECHNOLOGY-EVOLUTION.md](./TECHNOLOGY-EVOLUTION.md)   | Migration history and rationale | Architects, Contributors      |
| [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)     | This index document             | All Users                     |
| [ORGANIZATION-SUMMARY.md](./ORGANIZATION-SUMMARY.md)   | Documentation cleanup summary   | Maintainers                   |

### 🏗️ Architecture (`/docs/Architecture/`)

System design, patterns, and architectural decisions:

#### ADRs (Architecture Decision Records)

| Document                                                                                            | Decision                 | Status     |
| --------------------------------------------------------------------------------------------------- | ------------------------ | ---------- |
| [ADR-001-Repository-Pattern.md](../Architecture/ADRs/ADR-001-Repository-Pattern.md)                 | Database access pattern  | ✅ Accepted |
| [ADR-002-Event-Driven-Architecture.md](../Architecture/ADRs/ADR-002-Event-Driven-Architecture.md)   | Event system design      | ✅ Accepted |
| [ADR-003-Error-Handling-Strategy.md](../Architecture/ADRs/ADR-003-Error-Handling-Strategy.md)       | Error handling approach  | ✅ Accepted |
| [ADR-004-Frontend-State-Management.md](../Architecture/ADRs/ADR-004-Frontend-State-Management.md)   | Zustand state management | ✅ Accepted |
| [ADR-005-IPC-Communication-Protocol.md](../Architecture/ADRs/ADR-005-IPC-Communication-Protocol.md) | IPC communication design | ✅ Accepted |

#### Patterns & standards

| Document                                                                                | Purpose                  | Use When                      |
| --------------------------------------------------------------------------------------- | ------------------------ | ----------------------------- |
| [Development-Patterns-Guide.md](../Architecture/Patterns/Development-Patterns-Guide.md) | Coding patterns overview | Understanding system patterns |
| [tsdoc-standards.md](../Architecture/tsdoc-standards.md)                                | Documentation standards  | Writing code documentation    |

#### Templates

| Template                                                                         | Purpose                     | Use When                     |
| -------------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| [Repository-Template.md](../Architecture/Templates/Repository-Template.md)       | Database repository pattern | Adding new data repositories |
| [IPC-Handler-Template.md](../Architecture/Templates/IPC-Handler-Template.md)     | IPC communication pattern   | Adding new IPC endpoints     |
| [Zustand-Store-Template.md](../Architecture/Templates/Zustand-Store-Template.md) | Frontend state management   | Creating new Zustand stores  |

### 📖 Implementation Guides (`/docs/Guides/`)

Step-by-step implementation instructions:

| Guide                                                                                 | Purpose                     | Complexity      |
| ------------------------------------------------------------------------------------- | --------------------------- | --------------- |
| [Renderer-Integration-Guide.md](../Guides/RENDERER_INTEGRATION_GUIDE.md)              | Renderer/IPC integration    | 🟡 Intermediate |
| [NEW\_MONITOR\_TYPE\_IMPLEMENTATION.md](../Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) | Adding monitor types        | 🟡 Intermediate |
| [UI-Feature-Development-Guide.md](../Guides/UI-Feature-Development-Guide.md)          | Frontend development        | 🟡 Intermediate |
| [TESTING.md](../Guides/TESTING.md)                                                    | Testing setup and practices | 🟢 Beginner     |

### 📝 Historical & Learning (`/docs/`)

Relevant historical context and lessons learned:

| Document                                                                                           | Purpose                     | Relevance                          |
| -------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------- |
| [TECHNOLOGY-EVOLUTION.md](./TECHNOLOGY-EVOLUTION.md)                                               | Complete migration history  | Understanding current architecture |
| [Fallback-System-Usage-Analysis.md](../Guides/Fallback-System-Usage-Analysis.md)                   | Migration completion status | Historical context                 |
| [Monitoring-Race-Condition-Solution-Plan.md](../Guides/Monitoring-Race-Condition-Solution-Plan.md) | Race condition prevention   | Architecture understanding         |

## 🎯 Documentation by Role

### 🤖 AI Assistants

__Start Here__: [AI-CONTEXT.md](./AI-CONTEXT.md)

* Complete project overview and patterns
* Common development tasks
* Architecture constraints and guidelines

__Follow Up__:

* [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Interface reference
* [Architecture/ADRs/](../Architecture/ADRs/) - Design decisions
* [Architecture/Templates/](../Architecture/Templates/) - Code templates

### 👨‍💻 New Developers

__Start Here__: [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md)

* Fast setup and orientation
* Common development tasks
* Essential patterns

__Next Steps__:

* [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Complete environment
* [Architecture/Patterns/Development-Patterns-Guide.md](../Architecture/Patterns/Development-Patterns-Guide.md) - Coding patterns
* [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When things go wrong

### 🏗️ Backend Developers

__Focus Areas__:

* [ADR-001-Repository-Pattern.md](../Architecture/ADRs/ADR-001-Repository-Pattern.md) - Database patterns
* [ADR-002-Event-Driven-Architecture.md](../Architecture/ADRs/ADR-002-Event-Driven-Architecture.md) - Event system
* [Repository-Template.md](../Architecture/Templates/Repository-Template.md) - Repository implementation
* [IPC-Handler-Template.md](../Architecture/Templates/IPC-Handler-Template.md) - IPC communication

### 🎨 Frontend Developers

__Focus Areas__:

* [ADR-004-Frontend-State-Management.md](../Architecture/ADRs/ADR-004-Frontend-State-Management.md) - State management
* [UI-Feature-Development-Guide.md](../Guides/UI-Feature-Development-Guide.md) - Component development
* [Zustand-Store-Template.md](../Architecture/Templates/Zustand-Store-Template.md) - Store creation
* [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - IPC interfaces

### 🧪 QA/Testing

__Focus Areas__:

* [TESTING.md](../Guides/TESTING.md) - Testing setup and practices
* [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
* [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Environment configuration

### 📐 Architects/Tech Leads

__Focus Areas__:

* [Architecture/ADRs/](../Architecture/ADRs/) - All architectural decisions
* [Architecture/Patterns/Development-Patterns-Guide.md](../Architecture/Patterns/Development-Patterns-Guide.md) - System patterns
* Historical documents for evolution understanding

## 🔍 Documentation by Topic

### 🗃️ Database & Persistence

* [ADR-001-Repository-Pattern.md](../Architecture/ADRs/ADR-001-Repository-Pattern.md) - Repository pattern design
* [Repository-Template.md](../Architecture/Templates/Repository-Template.md) - Implementation template
* [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#database-issues) - Database troubleshooting

### 🔗 Communication & Events

* [ADR-002-Event-Driven-Architecture.md](../Architecture/ADRs/ADR-002-Event-Driven-Architecture.md) - Event system
* [ADR-005-IPC-Communication-Protocol.md](../Architecture/ADRs/ADR-005-IPC-Communication-Protocol.md) - IPC design
* [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Communication interfaces
* [RENDERER\_INTEGRATION\_GUIDE.md](../Guides/RENDERER_INTEGRATION_GUIDE.md) - Renderer IPC integration
* [IPC-Handler-Template.md](../Architecture/Templates/IPC-Handler-Template.md) - IPC implementation

### 🎨 Frontend & UI

* [ADR-004-Frontend-State-Management.md](../Architecture/ADRs/ADR-004-Frontend-State-Management.md) - State management
* [UI-Feature-Development-Guide.md](../Guides/UI-Feature-Development-Guide.md) - UI development
* [Zustand-Store-Template.md](../Architecture/Templates/Zustand-Store-Template.md) - Store patterns

### 🔍 Monitoring & Performance

* [NEW\_MONITOR\_TYPE\_IMPLEMENTATION.md](../Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) - Monitor types
* [Monitoring-Race-Condition-Solution-Plan.md](../Guides/Monitoring-Race-Condition-Solution-Plan.md) - Race condition prevention
* [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Performance tips

### ⚠️ Error Handling & Debugging

* [ADR-003-Error-Handling-Strategy.md](../Architecture/ADRs/ADR-003-Error-Handling-Strategy.md) - Error strategy
* [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide
* [ENVIRONMENT-SETUP.md](../Guides/ENVIRONMENT-SETUP.md) - Debug tools

## 📋 Documentation Maintenance

### 📝 Contributing to Documentation

1. __Follow TSDoc Standards__: Use [tsdoc-standards.md](../Architecture/tsdoc-standards.md)
2. __Update Index__: Add new documents to this index
3. __Cross-Reference__: Link related documents
4. __Keep Current__: Update outdated information

### 🔄 Documentation Review Process

* __Quarterly__: Review all ADRs for relevance
* __Monthly__: Update troubleshooting with new issues
* __Per Release__: Update API documentation
* __As Needed__: Update guides when patterns change

### 📊 Documentation Metrics

Track documentation health:

* Link validity (automated via GitHub Actions)
* Documentation coverage per feature
* Outdated documentation identification
* User feedback on documentation quality

## 🎯 Recommended Reading Paths

### 📚 Complete Onboarding (New Team Member)

1. [AI-CONTEXT.md](./AI-CONTEXT.md) - Project overview
2. [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md) - Setup
3. [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Environment
4. [Architecture/ADRs/](../Architecture/ADRs/) - Design decisions
5. [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Interfaces

### ⚡ Quick Start (Experienced Developer)

1. [AI-CONTEXT.md](./AI-CONTEXT.md) - Architecture overview
2. [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md) - Setup
3. [Architecture/Patterns/Development-Patterns-Guide.md](../Architecture/Patterns/Development-Patterns-Guide.md) - Patterns

### 🐛 Debugging Focus

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Issues and solutions
2. [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Debug tools
3. [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Error patterns

### 🏗️ Architecture Deep Dive

1. [Architecture/ADRs/](../Architecture/ADRs/) - All decisions
2. Historical documents for evolution context
3. [Architecture/Patterns/Development-Patterns-Guide.md](../Architecture/Patterns/Development-Patterns-Guide.md) - Implementation patterns

***

💡 __Navigation Tip__: Use Ctrl+F (Cmd+F on Mac) to quickly find specific topics or use the GitHub search functionality for cross-document searches.
