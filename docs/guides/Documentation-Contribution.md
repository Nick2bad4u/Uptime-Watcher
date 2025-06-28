# 📖 Documentation Contribution Guide

> **Navigation:** [📖 Docs Home](../README.md) » [📘 Guides](../README.md#guides) » **Documentation Contribution**

Guidelines for contributing to and maintaining the Uptime Watcher documentation.

## 📝 Writing Guidelines

### Style Guide

- **Use clear, concise language** - Write for developers of varying experience levels
- **Include practical examples** - Show real code snippets and usage patterns
- **Add context** - Explain why something works, not just how
- **Use consistent terminology** - Maintain a glossary of terms
- **Structure with headings** - Use proper markdown hierarchy (H1 > H2 > H3)

### Formatting Standards

#### Code Blocks

Always specify language for syntax highlighting:

```typescript
// ✅ Good
export interface Site {
 identifier: string;
 name?: string;
}
```

#### Links

Use descriptive link text:

```markdown
<!-- ✅ Good -->

See the [Theme API documentation](../api/theme-api.md) for details.

<!-- ❌ Avoid -->

See [here](../api/theme-api.md) for details.
```

#### Navigation Breadcrumbs

Include breadcrumbs at the top of every page:

```markdown
> **Navigation:** [📖 Docs Home](../README.md) » [📘 Guides](../README.md#guides) » **Page Title**
```

#### Cross-References

Include "See Also" sections at the end:

```markdown
## See Also

- [Related Doc 1](link1.md) - Brief description
- [Related Doc 2](link2.md) - Brief description

---

> **Related:** [📖 Documentation Home](../README.md) | [📘 All Guides](../README.md#guides)
```

## 📁 File Organization

### Directory Structure

```text
docs/
├── README.md                    # Main documentation index
├── api/                         # API reference documentation
│   ├── README.md               # API index
│   └── *.md                    # Specific API docs
├── guides/                     # Development guides
│   ├── Developer-Guide.md      # Main developer guide
│   ├── Troubleshooting.md      # Common issues
│   └── *.md                    # Other guides
├── architecture/               # System design docs
├── component-docs/             # UI component docs
│   ├── README.md              # Component index
│   └── *.md                   # Component-specific docs
├── migration-summaries/        # Migration documentation
├── optimization-summaries/     # Performance docs
├── health-reports/            # Code quality reports
└── refactoring/               # Refactoring documentation
```

### Naming Conventions

- **Use kebab-case**: `developer-guide.md`, `theme-usage.md`
- **Be descriptive**: Include the document type when relevant
- **Use consistent suffixes**: `-guide.md`, `-api.md`, `-reference.md`

## 🔄 Maintenance Workflow

### When to Update Documentation

- **New features added** - Document APIs, components, or workflows
- **Breaking changes** - Update affected documentation immediately
- **Bug fixes** - Update troubleshooting guides if relevant
- **Architecture changes** - Update design and architecture docs

### Documentation Review Process

1. **Technical accuracy** - Verify all code examples work
2. **Link validation** - Ensure all internal links are correct
3. **Markdown linting** - Run markdown linter to check formatting
4. **Cross-referencing** - Update related documents when needed

### Tools and Automation

#### Markdown Linting

Use markdownlint to maintain consistency:

```bash
# Install globally
npm install -g markdownlint-cli

# Lint documentation
markdownlint docs/**/*.md
```

#### Link Checking

Validate internal links work on GitHub:

```bash
# Check for broken links
find docs -name "*.md" -exec grep -l "\]\(" {} \;
```

## 📚 Content Guidelines

### API Documentation

Include these sections for each API:

- **Overview** - What the API does and when to use it
- **Interface/Types** - TypeScript definitions
- **Methods/Properties** - Detailed parameter and return information
- **Examples** - Practical usage examples
- **Error Handling** - Common errors and solutions
- **See Also** - Related APIs and documentation

### Component Documentation

Include these sections for components:

- **Purpose** - What the component does
- **Props Interface** - TypeScript prop definitions
- **Usage Examples** - Code examples showing implementation
- **Styling** - Theme integration and customization
- **Accessibility** - ARIA attributes and keyboard support
- **Testing** - How to test the component

### Guide Documentation

Structure guides with:

- **Overview** - What the guide covers
- **Prerequisites** - Required knowledge or setup
- **Step-by-step instructions** - Clear, actionable steps
- **Code examples** - Working code snippets
- **Troubleshooting** - Common issues and solutions
- **Further reading** - Related documentation

## ✅ Quality Checklist

Before submitting documentation:

- [ ] **Content is accurate** - All code examples work
- [ ] **Links are valid** - Internal links resolve correctly
- [ ] **Formatting is consistent** - Follows style guidelines
- [ ] **Navigation is included** - Breadcrumbs and cross-references
- [ ] **Examples are practical** - Shows real-world usage
- [ ] **Language is clear** - Accessible to target audience
- [ ] **Structure is logical** - Information flows well

## 📈 Documentation Metrics

Track documentation health:

- **Coverage** - All APIs and components documented
- **Freshness** - Last updated dates are recent
- **Link health** - No broken internal links
- **User feedback** - Issues and suggestions from developers

## See Also

- [🚀 Developer Guide](Developer-Guide.md) - Development setup and workflow
- [📚 API Reference](../api/README.md) - Complete API documentation
- [🧩 Component Docs](../component-docs/README.md) - UI component documentation

---

> **Related:** [📖 Documentation Home](../README.md) | [📘 All Guides](../README.md#guides)
