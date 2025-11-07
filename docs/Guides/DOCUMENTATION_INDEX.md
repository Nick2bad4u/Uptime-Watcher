# 📚 Documentation Index

> **Navigation Hub**: Complete guide to all Uptime Watcher documentation with quick links and descriptions.

## Quick links

### Getting started

- **[Developer Quick Start](./DEVELOPER_QUICK_START.md)** - Get up and running in minutes
- **[Environment Setup](./ENVIRONMENT_SETUP.md)** - Complete development environment configuration
- **[AI Context Guide](./AI_CONTEXT.md)** - Essential context for AI assistants

### Core documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - IPC interfaces and communication patterns
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Testing Guide](../Guides/TESTING.md)** - Testing setup and practices

## � Documentation structure

### Root level (`/docs/`)

Essential documentation for developers and contributors:

| Document                                               | Purpose                         | Audience                      |
| ------------------------------------------------------ | ------------------------------- | ----------------------------- |
| [AI_CONTEXT.md](./AI_CONTEXT.md)                       | Quick AI onboarding             | AI Assistants, New Developers |
| [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) | Fast developer setup            | New Contributors              |
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)         | Complete environment guide      | Developers                    |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)         | IPC and API reference           | Frontend/Backend Developers   |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)             | Debug and fix issues            | All Developers                |
| [TECHNOLOGY_EVOLUTION.md](./TECHNOLOGY_EVOLUTION.md)   | Migration history and rationale | Architects, Contributors      |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)     | This index document             | All Users                     |
| [ORGANIZATION_SUMMARY.md](./ORGANIZATION_SUMMARY.md)   | Documentation cleanup summary   | Maintainers                   |

### 🏗️ Architecture (`/docs/Architecture/`)

System design, patterns, and architectural decisions:

#### ADRs (Architecture Decision Records)

| Document                                                                                            | Decision                 | Status      |
| --------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| [ADR_001_REPOSITORY_PATTERN.md](../Architecture/ADRs/ADR_001_REPOSITORY_PATTERN.md)                 | Database access pattern  | ✅ Accepted |
| [ADR_002_EVENT_DRIVEN_ARCHITECTURE.md](../Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md)   | Event system design      | ✅ Accepted |
| [ADR_003_ERROR_HANDLING_STRATEGY.md](../Architecture/ADRs/ADR_003_ERROR_HANDLING_STRATEGY.md)       | Error handling approach  | ✅ Accepted |
| [ADR_004_FRONTEND_STATE_MANAGEMENT.md](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md)   | Zustand state management | ✅ Accepted |
| [ADR_005_IPC_COMMUNICATION_PROTOCOL.md](../Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md) | IPC communication design | ✅ Accepted |

#### Patterns & standards

| Document                                                                                | Purpose                  | Use When                      |
| --------------------------------------------------------------------------------------- | ------------------------ | ----------------------------- |
| [DEVELOPMENT_PATTERNS_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) | Coding patterns overview | Understanding system patterns |
| [TSDOC_STANDARDS.md](../Architecture/TSDOC_STANDARDS.md)                                | Documentation standards  | Writing code documentation    |

#### Templates

| Template                                                                         | Purpose                     | Use When                     |
| -------------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| [REPOSITORY_TEMPLATE.md](../Architecture/Templates/REPOSITORY_TEMPLATE.md)       | Database repository pattern | Adding new data repositories |
| [IPC_HANDLER_TEMPLATE.md](../Architecture/Templates/IPC_HANDLER_TEMPLATE.md)     | IPC communication pattern   | Adding new IPC endpoints     |
| [ZUSTAND_STORE_TEMPLATE.md](../Architecture/Templates/ZUSTAND_STORE_TEMPLATE.md) | Frontend state management   | Creating new Zustand stores  |

### 📖 Implementation Guides (`/docs/Guides/`)

Step-by-step implementation instructions:

| Guide                                                                              | Purpose                     | Complexity      |
| ---------------------------------------------------------------------------------- | --------------------------- | --------------- |
| [RENDERER_INTEGRATION_GUIDE.md](../Guides/RENDERER_INTEGRATION_GUIDE.md)           | Renderer/IPC integration    | 🟡 Intermediate |
| [NEW_MONITOR_TYPE_IMPLEMENTATION.md](../Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) | Adding monitor types        | 🟡 Intermediate |
| [UI_FEATURE_DEVELOPMENT_GUIDE.md](../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md)       | Frontend development        | 🟡 Intermediate |
| [TESTING.md](../Guides/TESTING.md)                                                 | Testing setup and practices | 🟢 Beginner     |

### 📝 Historical & Learning (`/docs/`)

Relevant historical context and lessons learned:

| Document                                                                                           | Purpose                     | Relevance                          |
| -------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------- |
| [TECHNOLOGY_EVOLUTION.md](./TECHNOLOGY_EVOLUTION.md)                                               | Complete migration history  | Understanding current architecture |
| [FALLBACK_SYSTEM_USAGE_ANALYSIS.md](../Guides/FALLBACK_SYSTEM_USAGE_ANALYSIS.md)                   | Migration completion status | Historical context                 |
| [MONITORING_RACE_CONDITION_SOLUTION_PLAN.md](../Guides/MONITORING_RACE_CONDITION_SOLUTION_PLAN.md) | Race condition prevention   | Architecture understanding         |

## 🎯 Documentation by Role

### 🤖 AI Assistants

**Start Here**: [AI_CONTEXT.md](./AI_CONTEXT.md)

- Complete project overview and patterns
- Common development tasks
- Architecture constraints and guidelines

**Follow Up**:

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Interface reference
- [Architecture/ADRs/](../Architecture/ADRs/) - Design decisions
- [Architecture/Templates/](../Architecture/Templates/) - Code templates

### 👨‍💻 New Developers

**Start Here**: [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md)

- Fast setup and orientation
- Common development tasks
- Essential patterns

**Next Steps**:

- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Complete environment
- [Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - Coding patterns
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When things go wrong

### 🏗️ Backend Developers

**Focus Areas**:

- [ADR_001_REPOSITORY_PATTERN.md](../Architecture/ADRs/ADR_001_REPOSITORY_PATTERN.md) - Database patterns
- [ADR_002_EVENT_DRIVEN_ARCHITECTURE.md](../Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md) - Event system
- [REPOSITORY_TEMPLATE.md](../Architecture/Templates/REPOSITORY_TEMPLATE.md) - Repository implementation
- [IPC_HANDLER_TEMPLATE.md](../Architecture/Templates/IPC_HANDLER_TEMPLATE.md) - IPC communication

### 🎨 Frontend Developers

**Focus Areas**:

- [ADR_004_FRONTEND_STATE_MANAGEMENT.md](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md) - State management
- [UI_FEATURE_DEVELOPMENT_GUIDE.md](../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md) - Component development
- [ZUSTAND_STORE_TEMPLATE.md](../Architecture/Templates/ZUSTAND_STORE_TEMPLATE.md) - Store creation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - IPC interfaces

### 🧪 QA/Testing

**Focus Areas**:

- [TESTING.md](../Guides/TESTING.md) - Testing setup and practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration

### 📐 Architects/Tech Leads

**Focus Areas**:

- [Architecture/ADRs/](../Architecture/ADRs/) - All architectural decisions
- [Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - System patterns
- Historical documents for evolution understanding

## 🔍 Documentation by Topic

### 🗃️ Database & Persistence

- [ADR_001_REPOSITORY_PATTERN.md](../Architecture/ADRs/ADR_001_REPOSITORY_PATTERN.md) - Repository pattern design
- [REPOSITORY_TEMPLATE.md](../Architecture/Templates/REPOSITORY_TEMPLATE.md) - Implementation template
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#database-issues) - Database troubleshooting

### 🔗 Communication & Events

- [ADR_002_EVENT_DRIVEN_ARCHITECTURE.md](../Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md) - Event system
- [ADR_005_IPC_COMMUNICATION_PROTOCOL.md](../Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md) - IPC design
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Communication interfaces
- [RENDERER_INTEGRATION_GUIDE.md](../Guides/RENDERER_INTEGRATION_GUIDE.md) - Renderer IPC integration
- [IPC_HANDLER_TEMPLATE.md](../Architecture/Templates/IPC_HANDLER_TEMPLATE.md) - IPC implementation

### 🎨 Frontend & UI

- [ADR_004_FRONTEND_STATE_MANAGEMENT.md](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md) - State management
- [UI_FEATURE_DEVELOPMENT_GUIDE.md](../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md) - UI development
- [ZUSTAND_STORE_TEMPLATE.md](../Architecture/Templates/ZUSTAND_STORE_TEMPLATE.md) - Store patterns

### 🔍 Monitoring & Performance

- [NEW_MONITOR_TYPE_IMPLEMENTATION.md](../Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) - Monitor types
- [MONITORING_RACE_CONDITION_SOLUTION_PLAN.md](../Guides/MONITORING_RACE_CONDITION_SOLUTION_PLAN.md) - Race condition prevention
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Performance tips

### ⚠️ Error Handling & Debugging

- [ADR_003_ERROR_HANDLING_STRATEGY.md](../Architecture/ADRs/ADR_003_ERROR_HANDLING_STRATEGY.md) - Error strategy
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide
- [ENVIRONMENT_SETUP.md](../Guides/ENVIRONMENT_SETUP.md) - Debug tools

## 📋 Documentation Maintenance

### 📝 Contributing to Documentation

1. **Follow TSDoc Standards**: Use [TSDOC_STANDARDS.md](../Architecture/TSDOC_STANDARDS.md)
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

1. [AI_CONTEXT.md](./AI_CONTEXT.md) - Project overview
2. [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) - Setup
3. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment
4. [Architecture/ADRs/](../Architecture/ADRs/) - Design decisions
5. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Interfaces

### ⚡ Quick Start (Experienced Developer)

1. [AI_CONTEXT.md](./AI_CONTEXT.md) - Architecture overview
2. [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) - Setup
3. [Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - Patterns

### 🐛 Debugging Focus

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Issues and solutions
2. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Debug tools
3. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Error patterns

### 🏗️ Architecture Deep Dive

1. [Architecture/ADRs/](../Architecture/ADRs/) - All decisions
2. Historical documents for evolution context
3. [Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - Implementation patterns

---

💡 **Navigation Tip**: Use Ctrl+F (Cmd+F on Mac) to quickly find specific topics or use the GitHub search functionality for cross-document searches.
