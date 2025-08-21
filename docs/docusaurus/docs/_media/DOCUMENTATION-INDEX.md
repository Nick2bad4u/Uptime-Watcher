# 📚 Documentation Index

> **Navigation Hub**: Complete guide to all Uptime Watcher documentation with quick links and descriptions.

## 🎯 Quick Links

### 🚀 Getting Started

- **[Developer Quick Start](./DEVELOPER-QUICK-START.md)** - Get up and running in minutes
- **[Environment Setup](./ENVIRONMENT-SETUP.md)** - Complete development environment configuration
- **[AI Context Guide](./AI-CONTEXT.md)** - Essential context for AI assistants

### 📖 Core Documentation

- **[API Documentation](./API-DOCUMENTATION.md)** - IPC interfaces and communication patterns
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Testing Guide](./Guides/TESTING.md)** - Testing setup and practices

## 🗂️ Documentation Structure

### 📁 Root Level (`/docs/`)

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

| Document                                                                                           | Decision                 | Status      |
| -------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| [ADR-001-Repository-Pattern.md](./Architecture/ADRs/ADR-001-Repository-Pattern.md)                 | Database access pattern  | ✅ Accepted |
| [ADR-002-Event-Driven-Architecture.md](./Architecture/ADRs/ADR-002-Event-Driven-Architecture.md)   | Event system design      | ✅ Accepted |
| [ADR-003-Error-Handling-Strategy.md](./Architecture/ADRs/ADR-003-Error-Handling-Strategy.md)       | Error handling approach  | ✅ Accepted |
| [ADR-004-Frontend-State-Management.md](./Architecture/ADRs/ADR-004-Frontend-State-Management.md)   | Zustand state management | ✅ Accepted |
| [ADR-005-IPC-Communication-Protocol.md](./Architecture/ADRs/ADR-005-IPC-Communication-Protocol.md) | IPC communication design | ✅ Accepted |

#### Patterns & Standards

| Document                                                                               | Purpose                  | Use When                      |
| -------------------------------------------------------------------------------------- | ------------------------ | ----------------------------- |
| [Development-Patterns-Guide.md](./Architecture/Patterns/Development-Patterns-Guide.md) | Coding patterns overview | Understanding system patterns |
| [TSDoc-Standards.md](./Architecture/TSDoc-Standards.md)                                | Documentation standards  | Writing code documentation    |

#### Templates

| Template                                                                        | Purpose                     | Use When                     |
| ------------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| [Repository-Template.md](./Architecture/Templates/Repository-Template.md)       | Database repository pattern | Adding new data repositories |
| [IPC-Handler-Template.md](./Architecture/Templates/IPC-Handler-Template.md)     | IPC communication pattern   | Adding new IPC endpoints     |
| [Zustand-Store-Template.md](./Architecture/Templates/Zustand-Store-Template.md) | Frontend state management   | Creating new Zustand stores  |

### 📖 Implementation Guides (`/docs/Guides/`)

Step-by-step implementation instructions:

| Guide                                                                             | Purpose                     | Complexity      |
| --------------------------------------------------------------------------------- | --------------------------- | --------------- |
| [NEW_MONITOR_TYPE_IMPLEMENTATION.md](./Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) | Adding monitor types        | 🟡 Intermediate |
| [UI-Feature-Development-Guide.md](./Guides/UI-Feature-Development-Guide.md)       | Frontend development        | 🟡 Intermediate |
| [TESTING.md](./Guides/TESTING.md)                                                 | Testing setup and practices | 🟢 Beginner     |

### 📝 Historical & Learning (`/docs/`)

Relevant historical context and lessons learned:

| Document                                                                                          | Purpose                     | Relevance                          |
| ------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------- |
| [TECHNOLOGY-EVOLUTION.md](./TECHNOLOGY-EVOLUTION.md)                                              | Complete migration history  | Understanding current architecture |
| [Fallback-System-Usage-Analysis.md](./Guides/Fallback-System-Usage-Analysis.md)                   | Migration completion status | Historical context                 |
| [Monitoring-Race-Condition-Solution-Plan.md](./Guides/Monitoring-Race-Condition-Solution-Plan.md) | Race condition prevention   | Architecture understanding         |

### 📁 Archive (`/docs/Archive/`)

Historical documentation and analysis materials:

| Directory                                                            | Contents                        | Purpose                         |
| -------------------------------------------------------------------- | ------------------------------- | ------------------------------- |
| [Archive/](./Archive/)                                               | Historical analysis and reviews | Reference and learning material |
| [Archive/Historical-Analysis/](./Archive/Historical-Analysis/)       | Analysis documents and planning | Understanding project evolution |
| [Archive/Implementation-Records/](./Archive/Implementation-Records/) | Completed implementations       | Learning from past work         |
| [Archive/Type-Safety-Migration/](./Archive/Type-Safety-Migration/)   | Type safety migration docs      | Migration process reference     |

## 🎯 Documentation by Role

### 🤖 AI Assistants

**Start Here**: [AI-CONTEXT.md](./AI-CONTEXT.md)

- Complete project overview and patterns
- Common development tasks
- Architecture constraints and guidelines

**Follow Up**:

- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Interface reference
- [Architecture/ADRs/](./Architecture/ADRs/) - Design decisions
- [Architecture/Templates/](./Architecture/Templates/) - Code templates

### 👨‍💻 New Developers

**Start Here**: [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md)

- Fast setup and orientation
- Common development tasks
- Essential patterns

**Next Steps**:

- [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Complete environment
- [Architecture/Patterns/Development-Patterns-Guide.md](./Architecture/Patterns/Development-Patterns-Guide.md) - Coding patterns
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When things go wrong

### 🏗️ Backend Developers

**Focus Areas**:

- [ADR-001-Repository-Pattern.md](./Architecture/ADRs/ADR-001-Repository-Pattern.md) - Database patterns
- [ADR-002-Event-Driven-Architecture.md](./Architecture/ADRs/ADR-002-Event-Driven-Architecture.md) - Event system
- [Repository-Template.md](./Architecture/Templates/Repository-Template.md) - Repository implementation
- [IPC-Handler-Template.md](./Architecture/Templates/IPC-Handler-Template.md) - IPC communication

### 🎨 Frontend Developers

**Focus Areas**:

- [ADR-004-Frontend-State-Management.md](./Architecture/ADRs/ADR-004-Frontend-State-Management.md) - State management
- [UI-Feature-Development-Guide.md](./Guides/UI-Feature-Development-Guide.md) - Component development
- [Zustand-Store-Template.md](./Architecture/Templates/Zustand-Store-Template.md) - Store creation
- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - IPC interfaces

### 🧪 QA/Testing

**Focus Areas**:

- [TESTING.md](./Guides/TESTING.md) - Testing setup and practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Environment configuration

### 📐 Architects/Tech Leads

**Focus Areas**:

- [Architecture/ADRs/](./Architecture/ADRs/) - All architectural decisions
- [Architecture/Patterns/Development-Patterns-Guide.md](./Architecture/Patterns/Development-Patterns-Guide.md) - System patterns
- Historical documents for evolution understanding

## 🔍 Documentation by Topic

### 🗃️ Database & Persistence

- [ADR-001-Repository-Pattern.md](./Architecture/ADRs/ADR-001-Repository-Pattern.md) - Repository pattern design
- [Repository-Template.md](./Architecture/Templates/Repository-Template.md) - Implementation template
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#database-issues) - Database troubleshooting

### 🔗 Communication & Events

- [ADR-002-Event-Driven-Architecture.md](./Architecture/ADRs/ADR-002-Event-Driven-Architecture.md) - Event system
- [ADR-005-IPC-Communication-Protocol.md](./Architecture/ADRs/ADR-005-IPC-Communication-Protocol.md) - IPC design
- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Communication interfaces
- [IPC-Handler-Template.md](./Architecture/Templates/IPC-Handler-Template.md) - IPC implementation

### 🎨 Frontend & UI

- [ADR-004-Frontend-State-Management.md](./Architecture/ADRs/ADR-004-Frontend-State-Management.md) - State management
- [UI-Feature-Development-Guide.md](./Guides/UI-Feature-Development-Guide.md) - UI development
- [Zustand-Store-Template.md](./Architecture/Templates/Zustand-Store-Template.md) - Store patterns

### 🔍 Monitoring & Performance

- [NEW_MONITOR_TYPE_IMPLEMENTATION.md](./Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) - Monitor types
- [Monitoring-Race-Condition-Solution-Plan.md](./Guides/Monitoring-Race-Condition-Solution-Plan.md) - Race condition prevention
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#performance-optimization) - Performance tips

### ⚠️ Error Handling & Debugging

- [ADR-003-Error-Handling-Strategy.md](./Architecture/ADRs/ADR-003-Error-Handling-Strategy.md) - Error strategy
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide
- [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md#development-tools) - Debug tools

## 📋 Documentation Maintenance

### 📝 Contributing to Documentation

1. **Follow TSDoc Standards**: Use [TSDoc-Standards.md](./Architecture/TSDoc-Standards.md)
2. **Update Index**: Add new documents to this index
3. **Cross-Reference**: Link related documents
4. **Keep Current**: Update outdated information

### 🔄 Documentation Review Process

- **Quarterly**: Review all ADRs for relevance
- **Monthly**: Update troubleshooting with new issues
- **Per Release**: Update API documentation
- **As Needed**: Update guides when patterns change

### 📊 Documentation Metrics

Track documentation health:

- Link validity (automated via GitHub Actions)
- Documentation coverage per feature
- Outdated documentation identification
- User feedback on documentation quality

## 🎯 Recommended Reading Paths

### 📚 Complete Onboarding (New Team Member)

1. [AI-CONTEXT.md](./AI-CONTEXT.md) - Project overview
2. [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md) - Setup
3. [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Environment
4. [Architecture/ADRs/](./Architecture/ADRs/) - Design decisions
5. [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Interfaces

### ⚡ Quick Start (Experienced Developer)

1. [AI-CONTEXT.md](./AI-CONTEXT.md) - Architecture overview
2. [DEVELOPER-QUICK-START.md](./DEVELOPER-QUICK-START.md) - Setup
3. [Architecture/Patterns/Development-Patterns-Guide.md](./Architecture/Patterns/Development-Patterns-Guide.md) - Patterns

### 🐛 Debugging Focus

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Issues and solutions
2. [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md#development-tools) - Debug tools
3. [API-DOCUMENTATION.md](./API-DOCUMENTATION.md#error-handling) - Error patterns

### 🏗️ Architecture Deep Dive

1. [Architecture/ADRs/](./Architecture/ADRs/) - All decisions
2. Historical documents for evolution context
3. [Architecture/Patterns/Development-Patterns-Guide.md](./Architecture/Patterns/Development-Patterns-Guide.md) - Implementation patterns

---

💡 **Navigation Tip**: Use Ctrl+F (Cmd+F on Mac) to quickly find specific topics or use the GitHub search functionality for cross-document searches.
