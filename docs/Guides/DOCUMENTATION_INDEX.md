---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Documentation Index"
summary: "Navigation hub and master index for all Uptime Watcher documentation, organized by topic and audience."
created: "2025-08-05"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "documentation"
  - "index"
  - "navigation"
---
# 📚 Documentation Index

## Table of Contents

1. [Quick links](#quick-links)
2. [� Documentation structure](#-documentation-structure)
3. [🎯 Documentation by Role](#-documentation-by-role)
4. [🔍 Documentation by Topic](#-documentation-by-topic)
5. [📋 Documentation Maintenance](#-documentation-maintenance)
6. [🎯 Recommended Reading Paths](#-recommended-reading-paths)

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

| Document                                                 | Purpose                         | Audience                      |
| -------------------------------------------------------- | ------------------------------- | ----------------------------- |
| [AI\_CONTEXT.md](./AI_CONTEXT.md)                        | Quick AI onboarding             | AI Assistants, New Developers |
| [DEVELOPER\_QUICK\_START.md](./DEVELOPER_QUICK_START.md) | Fast developer setup            | New Contributors              |
| [ENVIRONMENT\_SETUP.md](./ENVIRONMENT_SETUP.md)          | Complete environment guide      | Developers                    |
| [API\_DOCUMENTATION.md](./API_DOCUMENTATION.md)          | IPC and API reference           | Frontend/Backend Developers   |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)               | Debug and fix issues            | All Developers                |
| [TECHNOLOGY\_EVOLUTION.md](./TECHNOLOGY_EVOLUTION.md)    | Migration history and rationale | Architects, Contributors      |
| [DOCUMENTATION\_INDEX.md](./DOCUMENTATION_INDEX.md)      | This index document             | All Users                     |
| [ORGANIZATION\_SUMMARY.md](./ORGANIZATION_SUMMARY.md)    | Documentation cleanup summary   | Maintainers                   |

### 🏗️ Architecture (`/docs/Architecture/`)

System design, patterns, and architectural decisions:

#### ADRs (Architecture Decision Records)

| Document                                                                                                | Decision                 | Status     |
| ------------------------------------------------------------------------------------------------------- | ------------------------ | ---------- |
| [ADR\_001\_REPOSITORY\_PATTERN.md](../Architecture/ADRs/ADR_001_REPOSITORY_PATTERN.md)                  | Database access pattern  | ✅ Accepted |
| [ADR\_002\_EVENT\_DRIVEN\_ARCHITECTURE.md](../Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md)   | Event system design      | ✅ Accepted |
| [ADR\_003\_ERROR\_HANDLING\_STRATEGY.md](../Architecture/ADRs/ADR_003_ERROR_HANDLING_STRATEGY.md)       | Error handling approach  | ✅ Accepted |
| [ADR\_004\_FRONTEND\_STATE\_MANAGEMENT.md](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md)   | Zustand state management | ✅ Accepted |
| [ADR\_005\_IPC\_COMMUNICATION\_PROTOCOL.md](../Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md) | IPC communication design | ✅ Accepted |

#### Patterns & standards

| Document                                                                                  | Purpose                  | Use When                      |
| ----------------------------------------------------------------------------------------- | ------------------------ | ----------------------------- |
| [DEVELOPMENT\_PATTERNS\_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) | Coding patterns overview | Understanding system patterns |
| [TSDOC\_STANDARDS.md](../Architecture/TSDOC_STANDARDS.md)                                 | Documentation standards  | Writing code documentation    |

#### Templates

| Template                                                                           | Purpose                     | Use When                     |
| ---------------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| [REPOSITORY\_TEMPLATE.md](../Architecture/Templates/REPOSITORY_TEMPLATE.md)        | Database repository pattern | Adding new data repositories |
| [IPC\_HANDLER\_TEMPLATE.md](../Architecture/Templates/IPC_HANDLER_TEMPLATE.md)     | IPC communication pattern   | Adding new IPC endpoints     |
| [ZUSTAND\_STORE\_TEMPLATE.md](../Architecture/Templates/ZUSTAND_STORE_TEMPLATE.md) | Frontend state management   | Creating new Zustand stores  |

### 📖 Implementation Guides (`/docs/Guides/`)

Step-by-step implementation instructions:

| Guide                                                                                 | Purpose                     | Complexity      |
| ------------------------------------------------------------------------------------- | --------------------------- | --------------- |
| [RENDERER\_INTEGRATION\_GUIDE.md](../Guides/RENDERER_INTEGRATION_GUIDE.md)            | Renderer/IPC integration    | 🟡 Intermediate |
| [NEW\_MONITOR\_TYPE\_IMPLEMENTATION.md](../Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) | Adding monitor types        | 🟡 Intermediate |
| [UI\_FEATURE\_DEVELOPMENT\_GUIDE.md](../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md)       | Frontend development        | 🟡 Intermediate |
| [TESTING.md](../Guides/TESTING.md)                                                    | Testing setup and practices | 🟢 Beginner     |

### 📝 Historical & Learning (`/docs/`)

Relevant historical context and lessons learned:

| Document                                                                                               | Purpose                     | Relevance                          |
| ------------------------------------------------------------------------------------------------------ | --------------------------- | ---------------------------------- |
| [TECHNOLOGY\_EVOLUTION.md](./TECHNOLOGY_EVOLUTION.md)                                                  | Complete migration history  | Understanding current architecture |
| [FALLBACK\_SYSTEM\_USAGE\_ANALYSIS.md](../Guides/FALLBACK_SYSTEM_USAGE_ANALYSIS.md)                    | Migration completion status | Historical context                 |
| [MONITORING\_RACE\_CONDITION\_SOLUTION\_PLAN.md](../Guides/MONITORING_RACE_CONDITION_SOLUTION_PLAN.md) | Race condition prevention   | Architecture understanding         |

## 🎯 Documentation by Role

### 🤖 AI Assistants

**Start Here**: [AI\_CONTEXT.md](./AI_CONTEXT.md)

- Complete project overview and patterns
- Common development tasks
- Architecture constraints and guidelines

**Follow Up**:

- [API\_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Interface reference
- [Architecture/ADRs/](../Architecture/ADRs/) - Design decisions
- [Architecture/Templates/](../Architecture/Templates/) - Code templates

### 👨‍💻 New Developers

**Start Here**: [DEVELOPER\_QUICK\_START.md](./DEVELOPER_QUICK_START.md)

- Fast setup and orientation
- Common development tasks
- Essential patterns

**Next Steps**:

- [ENVIRONMENT\_SETUP.md](./ENVIRONMENT_SETUP.md) - Complete environment
- [Architecture/Patterns/DEVELOPMENT\_PATTERNS\_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - Coding patterns
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When things go wrong

### 🏗️ Backend Developers

**Focus Areas**:

- [ADR\_001\_REPOSITORY\_PATTERN.md](../Architecture/ADRs/ADR_001_REPOSITORY_PATTERN.md) - Database patterns
- [ADR\_002\_EVENT\_DRIVEN\_ARCHITECTURE.md](../Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md) - Event system
- [REPOSITORY\_TEMPLATE.md](../Architecture/Templates/REPOSITORY_TEMPLATE.md) - Repository implementation
- [IPC\_HANDLER\_TEMPLATE.md](../Architecture/Templates/IPC_HANDLER_TEMPLATE.md) - IPC communication

### 🎨 Frontend Developers

**Focus Areas**:

- [ADR\_004\_FRONTEND\_STATE\_MANAGEMENT.md](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md) - State management
- [UI\_FEATURE\_DEVELOPMENT\_GUIDE.md](../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md) - Component development
- [ZUSTAND\_STORE\_TEMPLATE.md](../Architecture/Templates/ZUSTAND_STORE_TEMPLATE.md) - Store creation
- [API\_DOCUMENTATION.md](./API_DOCUMENTATION.md) - IPC interfaces

### 🧪 QA/Testing

**Focus Areas**:

- [TESTING.md](../Guides/TESTING.md) - Testing setup and practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [ENVIRONMENT\_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration

### 📐 Architects/Tech Leads

**Focus Areas**:

- [Architecture/ADRs/](../Architecture/ADRs/) - All architectural decisions
- [Architecture/Patterns/DEVELOPMENT\_PATTERNS\_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - System patterns
- Historical documents for evolution understanding

## 🔍 Documentation by Topic

### 🗃️ Database & Persistence

- [ADR\_001\_REPOSITORY\_PATTERN.md](../Architecture/ADRs/ADR_001_REPOSITORY_PATTERN.md) - Repository pattern design
- [REPOSITORY\_TEMPLATE.md](../Architecture/Templates/REPOSITORY_TEMPLATE.md) - Implementation template
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#database-issues) - Database troubleshooting

### 🔗 Communication & Events

- [ADR\_002\_EVENT\_DRIVEN\_ARCHITECTURE.md](../Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md) - Event system
- [ADR\_005\_IPC\_COMMUNICATION\_PROTOCOL.md](../Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md) - IPC design
- [API\_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Communication interfaces
- [RENDERER\_INTEGRATION\_GUIDE.md](../Guides/RENDERER_INTEGRATION_GUIDE.md) - Renderer IPC integration
- [IPC\_HANDLER\_TEMPLATE.md](../Architecture/Templates/IPC_HANDLER_TEMPLATE.md) - IPC implementation

### 🎨 Frontend & UI

- [ADR\_004\_FRONTEND\_STATE\_MANAGEMENT.md](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md) - State management
- [UI\_FEATURE\_DEVELOPMENT\_GUIDE.md](../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md) - UI development
- [ZUSTAND\_STORE\_TEMPLATE.md](../Architecture/Templates/ZUSTAND_STORE_TEMPLATE.md) - Store patterns

### 🔍 Monitoring & Performance

- [NEW\_MONITOR\_TYPE\_IMPLEMENTATION.md](../Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md) - Monitor types
- [MONITORING\_RACE\_CONDITION\_SOLUTION\_PLAN.md](../Guides/MONITORING_RACE_CONDITION_SOLUTION_PLAN.md) - Race condition prevention
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Performance tips

### ⚠️ Error Handling & Debugging

- [ADR\_003\_ERROR\_HANDLING\_STRATEGY.md](../Architecture/ADRs/ADR_003_ERROR_HANDLING_STRATEGY.md) - Error strategy
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide
- [ENVIRONMENT\_SETUP.md](../Guides/ENVIRONMENT_SETUP.md) - Debug tools

## 📋 Documentation Maintenance

### 📝 Contributing to Documentation

1. **Follow TSDoc Standards**: Use [TSDOC\_STANDARDS.md](../Architecture/TSDOC_STANDARDS.md)
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

1. [AI\_CONTEXT.md](./AI_CONTEXT.md) - Project overview
2. [DEVELOPER\_QUICK\_START.md](./DEVELOPER_QUICK_START.md) - Setup
3. [ENVIRONMENT\_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment
4. [Architecture/ADRs/](../Architecture/ADRs/) - Design decisions
5. [API\_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Interfaces

### ⚡ Quick Start (Experienced Developer)

1. [AI\_CONTEXT.md](./AI_CONTEXT.md) - Architecture overview
2. [DEVELOPER\_QUICK\_START.md](./DEVELOPER_QUICK_START.md) - Setup
3. [Architecture/Patterns/DEVELOPMENT\_PATTERNS\_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - Patterns

### 🐛 Debugging Focus

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Issues and solutions
2. [ENVIRONMENT\_SETUP.md](./ENVIRONMENT_SETUP.md) - Debug tools
3. [API\_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Error patterns

### 🏗️ Architecture Deep Dive

1. [Architecture/ADRs/](../Architecture/ADRs/) - All decisions
2. Historical documents for evolution context
3. [Architecture/Patterns/DEVELOPMENT\_PATTERNS\_GUIDE.md](../Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md) - Implementation patterns

---

💡 **Navigation Tip**: Use Ctrl+F (Cmd+F on Mac) to quickly find specific topics or use the GitHub search functionality for cross-document searches.
