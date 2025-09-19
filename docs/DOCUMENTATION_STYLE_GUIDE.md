# Documentation Style Guide

This guide establishes consistent formatting and content standards for all Markdown documentation in the Uptime Watcher project.

## 📝 Formatting Standards

### Headers

- Use **sentence case** for headers (not title case)
- Include descriptive emoji prefix for main sections (optional but encouraged)
- Use proper heading hierarchy (H1 for title, H2 for main sections, etc.)

```markdown
# 📊 Main document title

## 🚀 Getting started

### Prerequisites

#### Installation steps
```

### Badges and Shields

- Group related badges logically
- Use consistent style (`flat` or `flat-square`)
- Align badges in center for README files
- Include alt text for accessibility

```markdown
<div align="center">

<a href="https://github.com/project/releases">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
</a>
<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</a>

</div>
```

### Tables

- Use proper table formatting with clear headers
- Align columns consistently
- Include descriptive content in cells

```markdown
| Feature    | Description                   | Status |
| ---------- | ----------------------------- | ------ |
| Monitoring | Real-time uptime tracking     | ✅     |
| Alerts     | Desktop notifications         | ✅     |
| Analytics  | Historical data visualization | 🚧     |
```

### Code Blocks

- Always specify language for syntax highlighting
- Use descriptive comments
- Include full file paths when relevant

````markdown
```typescript
// electron/services/monitoring/HttpMonitor.ts
export class HttpMonitor implements IMonitorService {
 async check(config: MonitorConfig): Promise<MonitorCheckResult> {
  // Implementation details...
 }
}
```
````

### Lists

- Use consistent bullet style (- for unordered, 1. for ordered)
- Add empty lines between complex list items
- Use proper indentation for nested items

```markdown
- **Feature name**: Brief description
  - Sub-feature or detail
  - Another detail

- **Another feature**: Description
  - Implementation note
  - Configuration option
```

### Emphasis and Formatting

- Use **bold** for important terms, features, or actions
- Use _italics_ for emphasis or technical terms
- Use `inline code` for file names, commands, and code snippets
- Use > blockquotes for important notes or warnings

```markdown
**Important**: Always use `npm install` before running the development server.

> ⚠️ **Warning**: This action cannot be undone.

The `package.json` file contains all _dependencies_ and **scripts**.
```

### Links

- Use descriptive link text (not "click here")
- Include relative paths for internal documentation
- Use absolute URLs for external resources

```markdown
See the [installation guide](./docs/INSTALLATION.md) for setup instructions.

Learn more about [TypeScript](https://www.typescriptlang.org/) documentation.
```

### Images and Assets

- Include descriptive alt text
- Use relative paths for project assets
- Center important images
- Include captions when helpful

```markdown
<div align="center">
  <img src="./assets/app-preview.png" alt="Uptime Watcher application interface showing dashboard with monitoring metrics">
  <p><em>Main dashboard interface with real-time monitoring data</em></p>
</div>
```

## 📋 Content Standards

### Document Structure

1. **Title** - Clear, descriptive H1 header
2. **Introduction** - Brief overview of the document purpose
3. **Table of Contents** - For longer documents (optional)
4. **Main Content** - Organized with logical section headers
5. **Examples** - Practical code samples and use cases
6. **Related Links** - References to other documentation

### Language Guidelines

- Use clear, concise language
- Write in present tense
- Use active voice when possible
- Avoid jargon unless necessary (define when used)
- Be consistent with technical terminology

### Code Documentation

- Include complete, working examples
- Add comments explaining complex logic
- Show both basic and advanced usage patterns
- Include error handling examples

### Technical Accuracy

- Keep version numbers current
- Update dependencies and requirements
- Test all code examples
- Verify links are working

## 🎯 Document Types

### README Files

```markdown
# 📊 Project Name

<div align="center">
<!-- Badges here -->
</div>

Brief description of what the project does.

## ✨ Features

- Key feature 1
- Key feature 2
- Key feature 3

## 🚀 Quick start

### Prerequisites

### Installation

### Usage

## 📖 Documentation

## 🤝 Contributing

## 📄 License
```

### API Documentation

````markdown
# API Reference

## Overview

Brief description of the API.

## Methods

### `methodName(parameter: Type): ReturnType`

Description of what the method does.

**Parameters:**

- `parameter` (Type): Description of parameter

**Returns:**

- Type: Description of return value

**Example:**

```typescript
// Usage example
const result = methodName(value);
```
````

**Throws:**

- `ErrorType`: When this error occurs

````

### Tutorial Documents

```markdown
# Tutorial Title

Learn how to accomplish a specific task.

## What you'll build

Brief description of the end result.

## Prerequisites

What the reader needs to know or have installed.

## Step 1: Initial setup

Detailed instructions...

## Step 2: Implementation

More instructions...

## Next steps

What to do after completing the tutorial.
````

### Architecture Decision Records (ADRs)

```markdown
# ADR-001: Decision Title

**Status:** Accepted | Proposed | Deprecated

**Date:** YYYY-MM-DD

## Context

Background information and problem statement.

## Decision

What was decided and why.

## Consequences

- **Positive:** Benefits of this decision
- **Negative:** Drawbacks or limitations
- **Neutral:** Other effects

## Implementation

How this decision is implemented in the codebase.
```

## 🔧 Tools and Validation

### Markdown Linting

Use markdownlint with these rules:

- MD013: Line length maximum 100 characters (configurable)
- MD033: Allow inline HTML for badges and layout
- MD041: Require H1 as first header

### Link Checking

- Verify all internal links work
- Check external links periodically
- Use relative paths for internal documentation

### Automated Checks

Include in CI pipeline:

- Markdown linting
- Link validation
- Spell checking
- Format consistency

## 📚 Examples

### Good Examples

✅ **Clear, descriptive headers:**

```markdown
## Setting up the development environment
```

✅ **Proper code block formatting:**

````markdown
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
````

✅ **Informative table:**

```markdown
| Monitor Type | Port | Protocol | Timeout |
| ------------ | ---- | -------- | ------- |
| HTTP         | 80   | TCP      | 30s     |
| HTTPS        | 443  | TCP      | 30s     |
```

### Poor Examples

❌ **Vague headers:**

```markdown
## Setup
```

❌ **Code without language:**

````markdown
```
npm install
```
````

❌ **Incomplete table:**

```markdown
| Type | Info      |
| ---- | --------- |
| HTTP | web stuff |
```

## 🎨 Visual Consistency

### Emoji Usage

Use emojis consistently for document sections:

- 📊 Analytics, dashboards, data
- 🚀 Getting started, quick start
- ✨ Features, new capabilities
- 🛠️ Tools, configuration, technical setup
- 📋 Lists, requirements, checklists
- 🎯 Goals, objectives, targets
- 🔧 Maintenance, fixes, troubleshooting
- 📖 Documentation, guides, references
- 🤝 Contributing, community
- 📄 Legal, licenses, policies

### Color Coding

Use consistent status indicators:

- ✅ Completed, working, available
- 🚧 In progress, under development
- ❌ Broken, deprecated, unavailable
- ⚠️ Warning, important note
- 💡 Tip, suggestion, best practice
- 🔍 Research, investigation needed

## 📊 Maintenance

### Regular Updates

- Review quarterly for accuracy
- Update version numbers with releases
- Refresh screenshots and examples
- Verify all links and references

### Version Control

- Use meaningful commit messages for documentation changes
- Tag documentation versions with releases
- Maintain changelog for major documentation updates

---

This style guide should be followed for all new documentation and existing documentation should be gradually updated to match these standards.
