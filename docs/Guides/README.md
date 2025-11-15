# Guides documentation

This directory contains comprehensive guides for developers, contributors, and users of the Uptime Watcher application.

## 📁 Directory structure

```text
docs/Guides/
├── README.md                              # This file
├── AI_CONTEXT.md                          # Essential context for AI assistants
├── API_DOCUMENTATION.md                   # IPC interfaces and communication patterns
├── DEVELOPER_QUICK_START.md               # Fast developer setup guide
├── DOCUMENTATION_INDEX.md                 # Complete documentation navigation hub
├── DOCUSAURUS_SETUP_GUIDE.md              # Documentation site setup
├── ENVIRONMENT_SETUP.md                   # Complete environment configuration
├── TESTING.md                             # Testing setup and practices
├── TROUBLESHOOTING.md                     # Common issues and solutions
├── TECHNOLOGY_EVOLUTION.md                # Migration history and rationale
├── UI_FEATURE_DEVELOPMENT_GUIDE.md        # Frontend development patterns
├── ZUSTAND_STORE_PATTERN_GUIDE.md         # State management patterns
├── TYPE_FEST_PATTERNS.md                  # TypeScript utility patterns
├── TESTING_METHODOLOGY_REACT_COMPONENTS.md # React component testing
├── VITE_PERFORMANCE.md                    # Build optimization guide
├── FALLBACK_SYSTEM_USAGE_ANALYSIS.md      # System reliability patterns
├── MONITORING_RACE_CONDITION_SOLUTION_PLAN.md # Concurrency handling
├── NEW_MONITOR_TYPE_IMPLEMENTATION.md     # Adding new monitor types
├── LOGGER_MIGRATION_COMPLETE_REPORT.md    # Logging system migration
└── ORGANIZATION-SUMMARY.md                # Documentation cleanup summary
```

## 🚀 Getting started

For new developers, start with these essential guides:

1. **[Developer quick start](./DEVELOPER_QUICK_START.md)** - Get up and running in minutes
2. **[Environment setup](./ENVIRONMENT_SETUP.md)** - Complete development environment
3. **[AI context guide](./AI_CONTEXT.md)** - Essential context for AI assistants

## 📖 Core documentation

### Development guides

| Guide | Description | Audience |
| --- | --- | --- |
| [API documentation](./API_DOCUMENTATION.md) | IPC interfaces and communication patterns | Frontend/Backend developers |
| [UI feature development](./UI_FEATURE_DEVELOPMENT_GUIDE.md) | Frontend development patterns and practices | Frontend developers |
| [Zustand store patterns](./ZUSTAND_STORE_PATTERN_GUIDE.md) | State management implementation guide | Frontend developers |
| [Testing methodology](./TESTING_METHODOLOGY_REACT_COMPONENTS.md) | React component testing strategies | All developers |
| [Type-fest patterns](./TYPE_FEST_PATTERNS.md) | TypeScript utility type usage | All developers |

### Setup and configuration

| Guide | Description | Audience |
| --- | --- | --- |
| [Environment setup](./ENVIRONMENT_SETUP.md) | Complete development environment configuration | New contributors |
| [Docusaurus setup](./DOCUSAURUS_SETUP_GUIDE.md) | Documentation site configuration | Maintainers |
| [Vite performance](./VITE_PERFORMANCE.md) | Build optimization and performance tuning | Build engineers |

### Troubleshooting and support

| Guide | Description | Audience |
| --- | --- | --- |
| [Troubleshooting](./TROUBLESHOOTING.md) | Common issues and step-by-step solutions | All developers |
| [Technology evolution](./TECHNOLOGY_EVOLUTION.md) | Migration history and architectural decisions | Architects, contributors |

### Advanced topics

| Guide | Description | Audience |
| --- | --- | --- |
| [Fallback system analysis](./FALLBACK_SYSTEM_USAGE_ANALYSIS.md) | System reliability and resilience patterns | Backend developers |
| [Race condition solutions](./MONITORING_RACE_CONDITION_SOLUTION_PLAN.md) | Concurrency handling in monitoring system | Backend developers |
| [New monitor implementation](./NEW_MONITOR_TYPE_IMPLEMENTATION.md) | Adding new monitoring capabilities | Feature developers |
| [Logger migration report](./LOGGER_MIGRATION_COMPLETE_REPORT.md) | Logging system architecture changes | System architects |

## 🗂️ Navigation

- **[Documentation index](./DOCUMENTATION_INDEX.md)** - Complete navigation hub for all documentation
- **[Architecture documentation](../Architecture/README.md)** - System design and ADRs
- **[Testing documentation](../Testing/README.md)** - Testing guides and best practices
- **[TSDoc documentation](../TSDoc/README.md)** - Code documentation standards

## 📝 Contributing

When adding new guides:

1. Follow the [documentation style guide](../../electron/documentation-style-guide.md)
2. Update this README to include your new guide
3. Add appropriate cross-references in [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)
4. Ensure your guide includes clear examples and practical guidance
