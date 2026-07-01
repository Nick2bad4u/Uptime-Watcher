---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Guides Documentation"
summary: "Overview of the docs/Guides directory, its structure, and how to navigate and contribute to Uptime Watcher guides."
created: "2025-09-18"
last_reviewed: "2026-01-31"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "guides"
 - "documentation"
 - "index"
---

# Guides documentation

This directory contains comprehensive guides for developers, contributors, and users of the Uptime Watcher application.

## 📁 Directory structure

```text
docs/Guides/
├── ADR_IMPLEMENTATION_PUNCHLIST.md         # Consolidated ADR follow-ups / proposed work
├── README.md                              # This file
├── API_DOCUMENTATION.md                   # IPC interfaces and communication patterns
├── CLOUD_SYNC_DROPBOX_SETUP.md             # Dropbox OAuth + setup guide (no backend)
├── CLOUD_SYNC_GOOGLE_DRIVE_SETUP.md        # Google Drive provider setup guide
├── CLOUD_PROVIDER_IMPLEMENTATION_GUIDE.md  # Developer guide for adding providers
├── DEVELOPER_QUICK_START.md               # Fast developer setup guide
├── DOCUMENTATION_INDEX.md                 # Complete documentation navigation hub
├── DOCUSAURUS_SETUP_GUIDE.md              # Documentation site setup
├── DEPENDENCY_INSTALL_DEBT.md              # Forced npm install blockers and exit criteria
├── ENVIRONMENT_SETUP.md                   # Complete environment configuration
├── TEST_SUITE_MAINTENANCE.md              # Test naming, overlap inventory, and cleanup guidance
├── TESTING.md                             # Testing setup and practices
├── TROUBLESHOOTING.md                     # Common issues and solutions
├── TECHNOLOGY_EVOLUTION.md                # Migration history and rationale
├── UI_FEATURE_DEVELOPMENT_GUIDE.md        # Frontend development patterns
├── ZUSTAND_STORE_PATTERN_GUIDE.md         # State management patterns
├── TYPE_FEST_PATTERNS.md                  # TypeScript utility patterns
├── TESTING_METHODOLOGY_REACT_COMPONENTS.md # React component testing
├── VITE_PERFORMANCE.md                    # Build optimization guide
├── NEW_MONITOR_TYPE_IMPLEMENTATION.md     # Adding new monitor types
├── ORGANIZATION_SUMMARY.md                # Documentation cleanup summary
└── LINT_GUARDRAILS_AND_CUSTOM_RULES.md    # Custom lint rules + AI guardrails
```

## 🚀 Getting started

For new developers, start with these essential guides:

1. **[Developer quick start](./DEVELOPER_QUICK_START.md)** - Get up and running in minutes
2. **[Environment setup](./ENVIRONMENT_SETUP.md)** - Complete development environment

## 📖 Core documentation

### Development guides

| Guide                                                            | Description                                 | Audience                    |
| ---------------------------------------------------------------- | ------------------------------------------- | --------------------------- |
| [API documentation](./API_DOCUMENTATION.md)                      | IPC interfaces and communication patterns   | Frontend/Backend developers |
| [UI feature development](./UI_FEATURE_DEVELOPMENT_GUIDE.md)      | Frontend development patterns and practices | Frontend developers         |
| [Zustand store patterns](./ZUSTAND_STORE_PATTERN_GUIDE.md)       | State management implementation guide       | Frontend developers         |
| [Testing methodology](./TESTING_METHODOLOGY_REACT_COMPONENTS.md) | React component testing strategies          | All developers              |
| [Test suite maintenance](./TEST_SUITE_MAINTENANCE.md)            | Test naming and overlap cleanup guidance    | Maintainers                 |
| [Type-fest patterns](./TYPE_FEST_PATTERNS.md)                    | TypeScript utility type usage               | All developers              |

### Setup and configuration

| Guide                                                    | Description                                    | Audience         |
| -------------------------------------------------------- | ---------------------------------------------- | ---------------- |
| [Environment setup](./ENVIRONMENT_SETUP.md)              | Complete development environment configuration | New contributors |
| [Dependency install debt](./DEPENDENCY_INSTALL_DEBT.md)  | Forced npm install blockers and exit criteria  | Maintainers      |
| [Lint guardrails](./LINT_GUARDRAILS_AND_CUSTOM_RULES.md) | Custom ESLint rules and docs/test checks       | Maintainers      |
| [Docusaurus setup](./DOCUSAURUS_SETUP_GUIDE.md)          | Documentation site configuration               | Maintainers      |
| [Vite performance](./VITE_PERFORMANCE.md)                | Build optimization and performance tuning      | Build engineers  |

### Troubleshooting and support

| Guide                                             | Description                                   | Audience                 |
| ------------------------------------------------- | --------------------------------------------- | ------------------------ |
| [Troubleshooting](./TROUBLESHOOTING.md)           | Common issues and step-by-step solutions      | All developers           |
| [Technology evolution](./TECHNOLOGY_EVOLUTION.md) | Migration history and architectural decisions | Architects, contributors |

### Advanced topics

| Guide                                                              | Description                                | Audience           |
| ------------------------------------------------------------------ | ------------------------------------------ | ------------------ |
| [New monitor implementation](./NEW_MONITOR_TYPE_IMPLEMENTATION.md) | Adding new monitoring capabilities         | Feature developers |
| [Tools and commands guide](./TOOLS_AND_COMMANDS_GUIDE.md)          | Practical reference for tools and commands | All developers     |

## 🗂️ Navigation

- **[Documentation index](./DOCUMENTATION_INDEX.md)** - Complete navigation hub for all documentation
- **[Architecture documentation](../Architecture/README.md)** - System design and ADRs
- **[Testing documentation](../Testing/README.md)** - Testing guides and best practices
- **[TSDoc documentation](../TSDoc/README.md)** - Code documentation standards

## 📝 Contributing

When adding new guides:

1. Follow the [documentation style guide](./DOCUMENTATION_STYLE_GUIDE.md)
2. Update this README to include your new guide
3. Add appropriate cross-references in [DOCUMENTATION\_INDEX.md](./DOCUMENTATION_INDEX.md)
4. Ensure your guide includes clear examples and practical guidance
