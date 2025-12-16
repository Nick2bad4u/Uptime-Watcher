# TSDoc documentation standards

This directory contains comprehensive TypeScript documentation standards, tag references, and guidelines for code documentation in the Uptime Watcher application.

## 📁 Directory structure

```text
docs/TSDoc/
├── README.md                              # This file
├── TSDoc-Home.md                          # TSDoc home and overview
├── TSDoc-Intro-Approach.md                # Introduction to TSDoc approach
├── TSDoc-Intro-UsingTsdoc.md              # Getting started with TSDoc
├── TSDoc-Spec-Overview.md                 # TSDoc specification overview
├── TSDoc-Spec-StandardizationGroups.md    # Standardization groups and governance
├── TSDoc-Spec-TagKinds.md                 # Tag classification and usage
├── TSDoc-Base-Tags.md                     # Base tag reference
├── TSDoc-Package-EslintPluginTsdoc.md     # ESLint plugin integration
├── TSDoc-Package-Tsdoc.md                 # Core TSDoc package
├── TSDoc-Package-TsdocConfig.md           # Configuration options
├── TSDoc-Download-Log.md                  # Documentation download log
├── TSDoc-Hashes.json                      # Content verification hashes
└── Tag documentation files               # Individual tag references
    ├── TSDoc-Tag-Alpha.md
    ├── TSDoc-Tag-Beta.md
    ├── TSDoc-Tag-Decorator.md
    ├── TSDoc-Tag-defaultValue.md
    ├── TSDoc-Tag-Deprecated.md
    ├── TSDoc-Tag-Eventproperty.md
    ├── TSDoc-Tag-Example.md
    ├── TSDoc-Tag-Experimental.md
    ├── TSDoc-Tag-Inheritdoc.md
    ├── TSDoc-Tag-Internal.md
    ├── TSDoc-Tag-Label.md
    ├── TSDoc-Tag-Link.md
    ├── TSDoc-Tag-Override.md
    ├── TSDoc-Tag-Packagedocumentation.md
    ├── TSDoc-Tag-Param.md
    ├── TSDoc-Tag-Privateremarks.md
    ├── TSDoc-Tag-Public.md
    ├── TSDoc-Tag-Readonly.md
    ├── TSDoc-Tag-Remarks.md
    ├── TSDoc-Tag-Returns.md
    ├── TSDoc-Tag-Sealed.md
    ├── TSDoc-Tag-See.md
    ├── TSDoc-Tag-Throws.md
    ├── TSDoc-Tag-Typeparam.md
    └── TSDoc-Tag-Virtual.md
```

## 📚 TSDoc overview

TSDoc is a markup language for documenting TypeScript code with structured comments. It provides:

- **Standardized syntax** for code documentation
- **Rich markup** for parameters, return values, examples
- **Tool integration** with IDEs, linters, and documentation generators
- **Type-aware documentation** that works with TypeScript

## 🚀 Getting started

For developers new to TSDoc:

1. **[TSDoc home](./TSDoc-Home.md)** - Overview and introduction
2. **[Using TSDoc](./TSDoc-Intro-UsingTsdoc.md)** - Practical usage guide
3. **[Base tags reference](./TSDoc-Base-Tags.md)** - Essential tags for documentation

## 📖 Documentation standards

### Core concepts

| Document | Description | Purpose |
| --- | --- | --- |
| [TSDoc home](./TSDoc-Home.md) | Overview of TSDoc system | Understanding TSDoc fundamentals |
| [TSDoc approach](./TSDoc-Intro-Approach.md) | Documentation philosophy and approach | Establishing documentation standards |
| [Using TSDoc](./TSDoc-Intro-UsingTsdoc.md) | Practical implementation guide | Day-to-day documentation practices |

### Specification and standards

| Document | Description | Purpose |
| --- | --- | --- |
| [Specification overview](./TSDoc-Spec-Overview.md) | TSDoc specification details | Understanding formal standards |
| [Standardization groups](./TSDoc-Spec-StandardizationGroups.md) | Governance and standardization | Standards compliance |
| [Tag kinds](./TSDoc-Spec-TagKinds.md) | Tag classification system | Proper tag usage |

### Package integration

| Document | Description | Purpose |
| --- | --- | --- |
| [Core TSDoc package](./TSDoc-Package-Tsdoc.md) | Main TSDoc package documentation | Core functionality |
| [ESLint plugin](./TSDoc-Package-EslintPluginTsdoc.md) | ESLint integration for TSDoc | Automated linting |
| [Configuration](./TSDoc-Package-TsdocConfig.md) | TSDoc configuration options | Project setup |

## 🏷️ Tag reference

### Essential tags

| Tag | Purpose | Usage |
| --- | --- | --- |
| [`@param`](./TSDoc-Tag-Param.md) | Document function parameters | Required for all parameters |
| [`@returns`](./TSDoc-Tag-Returns.md) | Document return values | Required for functions with return values |
| [`@example`](./TSDoc-Tag-Example.md) | Provide usage examples | Recommended for public APIs |
| [`@remarks`](./TSDoc-Tag-Remarks.md) | Additional implementation details | Detailed explanations |
| [`@throws`](./TSDoc-Tag-Throws.md) | Document thrown exceptions | Error conditions |

### Lifecycle and visibility tags

| Tag | Purpose | Usage |
| --- | --- | --- |
| [`@public`](./TSDoc-Tag-Public.md) | Mark as public API | Public interfaces |
| [`@internal`](./TSDoc-Tag-Internal.md) | Mark as internal implementation | Internal code |
| [`@alpha`](./TSDoc-Tag-Alpha.md) | Mark as alpha/experimental | Early development |
| [`@beta`](./TSDoc-Tag-Beta.md) | Mark as beta/preview | Pre-release features |
| [`@deprecated`](./TSDoc-Tag-Deprecated.md) | Mark as deprecated | Deprecated code |

### Advanced tags

| Tag | Purpose | Usage |
| --- | --- | --- |
| [`@inheritdoc`](./TSDoc-Tag-Inheritdoc.md) | Inherit documentation from parent | Interface implementations |
| [`@override`](./TSDoc-Tag-Override.md) | Mark method overrides | Class inheritance |
| [`@virtual`](./TSDoc-Tag-Virtual.md) | Mark as overridable | Base class methods |
| [`@sealed`](./TSDoc-Tag-Sealed.md) | Mark as non-overridable | Final implementations |
| [`@readonly`](./TSDoc-Tag-Readonly.md) | Mark as read-only | Immutable properties |

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
- **[Documentation style guide](../Guides/DOCUMENTATION_STYLE_GUIDE.md)** - Markdown documentation standards

## 📝 Contributing

When working with TSDoc documentation:

1. Follow the established [documentation style guide](../Guides/DOCUMENTATION_STYLE_GUIDE.md)
2. Use appropriate TSDoc tags for all public APIs
3. Provide comprehensive examples for complex functionality
4. Ensure all links and references are valid
5. Update documentation when making code changes
6. Run ESLint to validate TSDoc syntax

## 🔄 Maintenance

The TSDoc documentation in this directory is sourced from the official TSDoc project and maintained for reference. When updating:

1. Check the [download log](./TSDoc-Download-Log.md) for version information
2. Verify content hashes in [TSDoc-Hashes.json](./TSDoc-Hashes.json)
3. Update any project-specific customizations
4. Test documentation generation tools after updates
