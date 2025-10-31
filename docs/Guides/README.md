# Guides documentation

This directory contains comprehensive guides for developers, contributors, and users of the Uptime Watcher application.

## 📁 Directory structure

```text
docs/Guides/
├── README.md                              # This file
├── AI-CONTEXT.md                          # Essential context for AI assistants
├── API-DOCUMENTATION.md                   # IPC interfaces and communication patterns
├── DEVELOPER-QUICK-START.md               # Fast developer setup guide
├── DOCUMENTATION-INDEX.md                 # Complete documentation navigation hub
├── DOCUSAURUS-SETUP-GUIDE.md             # Documentation site setup
├── ENVIRONMENT-SETUP.md                   # Complete environment configuration
├── TESTING.md                             # Testing setup and practices
├── TROUBLESHOOTING.md                     # Common issues and solutions
├── TECHNOLOGY-EVOLUTION.md                # Migration history and rationale
├── UI-Feature-Development-Guide.md        # Frontend development patterns
├── Zustand-Store-Pattern-Guide.md         # State management patterns
├── type-fest-patterns.md                  # TypeScript utility patterns
├── testing-methodology-react-components.md # React component testing
├── VITE-PERFORMANCE.md                    # Build optimization guide
├── Fallback-System-Usage-Analysis.md      # System reliability patterns
├── Monitoring-Race-Condition-Solution-Plan.md # Concurrency handling
├── NEW_MONITOR_TYPE_IMPLEMENTATION.md     # Adding new monitor types
├── LOGGER_MIGRATION_COMPLETE_REPORT.md    # Logging system migration
└── ORGANIZATION-SUMMARY.md                # Documentation cleanup summary
```

## 🚀 Getting started

For new developers, start with these essential guides:

1. __[Developer quick start](./DEVELOPER-QUICK-START.md)__ - Get up and running in minutes
2. __[Environment setup](./ENVIRONMENT-SETUP.md)__ - Complete development environment
3. __[AI context guide](./AI-CONTEXT.md)__ - Essential context for AI assistants

## 📖 Core documentation

### Development guides

| Guide                                                            | Description                                 | Audience                    |
| ---------------------------------------------------------------- | ------------------------------------------- | --------------------------- |
| [API documentation](./API-DOCUMENTATION.md)                      | IPC interfaces and communication patterns   | Frontend/Backend developers |
| [UI feature development](./UI-Feature-Development-Guide.md)      | Frontend development patterns and practices | Frontend developers         |
| [Zustand store patterns](./Zustand-Store-Pattern-Guide.md)       | State management implementation guide       | Frontend developers         |
| [Testing methodology](./testing-methodology-react-components.md) | React component testing strategies          | All developers              |
| [Type-fest patterns](./type-fest-patterns.md)                    | TypeScript utility type usage               | All developers              |

### Setup and configuration

| Guide                                           | Description                                    | Audience         |
| ----------------------------------------------- | ---------------------------------------------- | ---------------- |
| [Environment setup](./ENVIRONMENT-SETUP.md)     | Complete development environment configuration | New contributors |
| [Docusaurus setup](./DOCUSAURUS-SETUP-GUIDE.md) | Documentation site configuration               | Maintainers      |
| [Vite performance](./VITE-PERFORMANCE.md)       | Build optimization and performance tuning      | Build engineers  |

### Troubleshooting and support

| Guide                                             | Description                                   | Audience                 |
| ------------------------------------------------- | --------------------------------------------- | ------------------------ |
| [Troubleshooting](./TROUBLESHOOTING.md)           | Common issues and step-by-step solutions      | All developers           |
| [Technology evolution](./TECHNOLOGY-EVOLUTION.md) | Migration history and architectural decisions | Architects, contributors |

### Advanced topics

| Guide                                                                    | Description                                | Audience           |
| ------------------------------------------------------------------------ | ------------------------------------------ | ------------------ |
| [Fallback system analysis](./Fallback-System-Usage-Analysis.md)          | System reliability and resilience patterns | Backend developers |
| [Race condition solutions](./Monitoring-Race-Condition-Solution-Plan.md) | Concurrency handling in monitoring system  | Backend developers |
| [New monitor implementation](./NEW_MONITOR_TYPE_IMPLEMENTATION.md)       | Adding new monitoring capabilities         | Feature developers |
| [Logger migration report](./LOGGER_MIGRATION_COMPLETE_REPORT.md)         | Logging system architecture changes        | System architects  |

## 🗂️ Navigation

* __[Documentation index](./DOCUMENTATION-INDEX.md)__ - Complete navigation hub for all documentation
* __[Architecture documentation](../Architecture/README.md)__ - System design and ADRs
* __[Testing documentation](../Testing/README.md)__ - Testing guides and best practices
* __[TSDoc documentation](../TSDoc/README.md)__ - Code documentation standards

## 📝 Contributing

When adding new guides:

1. Follow the [documentation style guide](../../electron/documentation-style-guide.md)
2. Update this README to include your new guide
3. Add appropriate cross-references in [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)
4. Ensure your guide includes clear examples and practical guidance
