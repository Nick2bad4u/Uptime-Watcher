# TSDoc documentation standards

This directory contains comprehensive TypeScript documentation standards, tag references, and guidelines for code documentation in the Uptime Watcher application.

## 📁 Directory structure

```text
docs/TSDoc/
├── README.md                              # This file
├── tsdoc-home.md                          # TSDoc home and overview
├── tsdoc-intro-approach.md                # Introduction to TSDoc approach
├── tsdoc-intro-using-tsdoc.md             # Getting started with TSDoc
├── tsdoc-spec-overview.md                 # TSDoc specification overview
├── tsdoc-spec-standardization-groups.md   # Standardization groups and governance
├── tsdoc-spec-tag-kinds.md                # Tag classification and usage
├── tsdoc-base-tags.md                     # Base tag reference
├── tsdoc-package-eslint-plugin-tsdoc.md   # ESLint plugin integration
├── tsdoc-package-tsdoc.md                 # Core TSDoc package
├── tsdoc-package-tsdoc-config.md          # Configuration options
├── tsdoc-download-log.md                  # Documentation download log
├── TSDoc-Hashes.json                      # Content verification hashes
└── Tag documentation files               # Individual tag references
    ├── tsdoc-tag-alpha.md
    ├── tsdoc-tag-beta.md
    ├── tsdoc-tag-decorator.md
    ├── tsdoc-tag-default-value.md
    ├── tsdoc-tag-deprecated.md
    ├── tsdoc-tag-event-property.md
    ├── tsdoc-tag-example.md
    ├── tsdoc-tag-experimental.md
    ├── tsdoc-tag-inheritdoc.md
    ├── tsdoc-tag-internal.md
    ├── tsdoc-tag-label.md
    ├── tsdoc-tag-link.md
    ├── tsdoc-tag-override.md
    ├── tsdoc-tag-package-documentation.md
    ├── tsdoc-tag-param.md
    ├── tsdoc-tag-private-remarks.md
    ├── tsdoc-tag-public.md
    ├── tsdoc-tag-readonly.md
    ├── tsdoc-tag-remarks.md
    ├── tsdoc-tag-returns.md
    ├── tsdoc-tag-sealed.md
    ├── tsdoc-tag-see.md
    ├── tsdoc-tag-throws.md
    ├── tsdoc-tag-type-param.md
    └── tsdoc-tag-virtual.md
```

## 📚 TSDoc overview

TSDoc is a markup language for documenting TypeScript code with structured comments. It provides:

- **Standardized syntax** for code documentation
- **Rich markup** for parameters, return values, examples
- **Tool integration** with IDEs, linters, and documentation generators
- **Type-aware documentation** that works with TypeScript

## 🚀 Getting started

For developers new to TSDoc:

1. **[TSDoc home](./tsdoc-home.md)** - Overview and introduction
2. **[Using TSDoc](./TSDoc-Intro-UsingTsdoc.md)** - Practical usage guide
3. **[Base tags reference](./tsdoc-base-tags.md)** - Essential tags for documentation

## 📖 Documentation standards

### Core concepts

| Document | Description | Purpose |
|----------|-------------|---------|
| [TSDoc home](./tsdoc-home.md) | Overview of TSDoc system | Understanding TSDoc fundamentals |
| [TSDoc approach](./tsdoc-intro-approach.md) | Documentation philosophy and approach | Establishing documentation standards |
| [Using TSDoc](./TSDoc-Intro-UsingTsdoc.md) | Practical implementation guide | Day-to-day documentation practices |

### Specification and standards

| Document | Description | Purpose |
|----------|-------------|---------|
| [Specification overview](./tsdoc-spec-overview.md) | TSDoc specification details | Understanding formal standards |
| [Standardization groups](./TSDoc-Spec-StandardizationGroups.md) | Governance and standardization | Standards compliance |
| [Tag kinds](./TSDoc-Spec-TagKinds.md) | Tag classification system | Proper tag usage |

### Package integration

| Document | Description | Purpose |
|----------|-------------|---------|
| [Core TSDoc package](./tsdoc-package-tsdoc.md) | Main TSDoc package documentation | Core functionality |
| [ESLint plugin](./TSDoc-Package-EslintPluginTsdoc.md) | ESLint integration for TSDoc | Automated linting |
| [Configuration](./TSDoc-Package-TsdocConfig.md) | TSDoc configuration options | Project setup |

## 🏷️ Tag reference

### Essential tags

| Tag | Purpose | Usage |
|-----|---------|-------|
| [`@param`](./tsdoc-tag-param.md) | Document function parameters | Required for all parameters |
| [`@returns`](./tsdoc-tag-returns.md) | Document return values | Required for functions with return values |
| [`@example`](./tsdoc-tag-example.md) | Provide usage examples | Recommended for public APIs |
| [`@remarks`](./tsdoc-tag-remarks.md) | Additional implementation details | Detailed explanations |
| [`@throws`](./tsdoc-tag-throws.md) | Document thrown exceptions | Error conditions |

### Lifecycle and visibility tags

| Tag | Purpose | Usage |
|-----|---------|-------|
| [`@public`](./tsdoc-tag-public.md) | Mark as public API | Public interfaces |
| [`@internal`](./tsdoc-tag-internal.md) | Mark as internal implementation | Internal code |
| [`@alpha`](./tsdoc-tag-alpha.md) | Mark as alpha/experimental | Early development |
| [`@beta`](./tsdoc-tag-beta.md) | Mark as beta/preview | Pre-release features |
| [`@deprecated`](./tsdoc-tag-deprecated.md) | Mark as deprecated | Deprecated code |

### Advanced tags

| Tag | Purpose | Usage |
|-----|---------|-------|
| [`@inheritdoc`](./tsdoc-tag-inheritdoc.md) | Inherit documentation from parent | Interface implementations |
| [`@override`](./tsdoc-tag-override.md) | Mark method overrides | Class inheritance |
| [`@virtual`](./tsdoc-tag-virtual.md) | Mark as overridable | Base class methods |
| [`@sealed`](./tsdoc-tag-sealed.md) | Mark as non-overridable | Final implementations |
| [`@readonly`](./tsdoc-tag-readonly.md) | Mark as read-only | Immutable properties |

## 🔧 Configuration

TSDoc configuration in the Uptime Watcher project:

- **ESLint integration** - Automatic TSDoc syntax checking
- **Type checking** - Verification of documented types
- **Example validation** - Ensuring code examples compile
- **Link validation** - Checking internal references

## 💡 Best practices

### Documentation standards

1. **Document all public APIs** - Every public function, class, and interface
2. **Provide examples** - Show practical usage for complex APIs
3. **Describe parameters thoroughly** - Include types, constraints, and examples
4. **Document exceptions** - List all possible thrown errors
5. **Keep documentation current** - Update docs when code changes

### Writing guidelines

1. **Use clear, concise language** - Avoid jargon and complexity
2. **Write in present tense** - Describe what the code does
3. **Be specific about behavior** - Include edge cases and constraints
4. **Cross-reference related APIs** - Use `@see` tags for related functionality
5. **Provide context** - Explain why, not just what

### Code examples

1. **Include realistic examples** - Use actual use cases
2. **Show complete workflows** - Include setup and teardown
3. **Demonstrate error handling** - Show how to handle failures
4. **Keep examples focused** - One concept per example
5. **Verify examples compile** - Ensure all examples are valid TypeScript

## 🗂️ Navigation

- **[Architecture documentation](../Architecture/README.md)** - System design and patterns
- **[Guides documentation](../Guides/README.md)** - Development guides and tutorials
- **[Testing documentation](../Testing/README.md)** - Testing guides and best practices
- **[Documentation style guide](../DOCUMENTATION_STYLE_GUIDE.md)** - Markdown documentation standards

## 📝 Contributing

When working with TSDoc documentation:

1. Follow the established [documentation style guide](../DOCUMENTATION_STYLE_GUIDE.md)
2. Use appropriate TSDoc tags for all public APIs
3. Provide comprehensive examples for complex functionality
4. Ensure all links and references are valid
5. Update documentation when making code changes
6. Run ESLint to validate TSDoc syntax

## 🔄 Maintenance

The TSDoc documentation in this directory is sourced from the official TSDoc project and maintained for reference. When updating:

1. Check the [download log](./tsdoc-download-log.md) for version information
2. Verify content hashes in [TSDoc-Hashes.json](./TSDoc-Hashes.json)
3. Update any project-specific customizations
4. Test documentation generation tools after updates
