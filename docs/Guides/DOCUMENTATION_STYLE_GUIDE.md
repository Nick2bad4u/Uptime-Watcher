---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Documentation Style Guide"
summary: "Style and formatting standards for all Markdown documentation in the Uptime Watcher project."
created: "2025-09-18"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "documentation"
  - "style-guide"
  - "markdown"
topics:
  - "documentation"
---
# Documentation Style Guide

## Table of Contents

1. [Front matter schema](#front-matter-schema)
2. [� File Naming Conventions](#-file-naming-conventions)
3. [�📝 Formatting Standards](#-formatting-standards)
4. [📋 Content Standards](#-content-standards)
5. [🎯 Document Types](#-document-types)
6. [🔧 Tools and Validation](#-tools-and-validation)
7. [📚 Examples](#-examples)
8. [🎨 Visual Consistency](#-visual-consistency)
9. [📊 Maintenance](#-maintenance)

## Front matter schema

All first-class documentation pages (files under `docs/Guides/` and `docs/Architecture/**`) use a lightweight, internal-only front-matter format validated by `config/schemas/doc-frontmatter.schema.json`. This is **not** tied to any static site generator; it exists purely for search, tooling, and AI context.

### Required fields

Each file should start with:

```yaml
---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Human-friendly document title"
summary: "One-line description used in indexes and search."
created: "YYYY-MM-DD"        # usually taken from `git log --diff-filter=A`
last_reviewed: "YYYY-MM-DD"  # last date the content was reviewed/updated
category: "guide"            # coarse type; currently always "guide" for Guides
author: "GitHub username or name"
tags:
    - "keyword-one"
    - "keyword-two"
---
```

Notes:

- **\$schema**: Always points to `../../config/schemas/doc-frontmatter.schema.json` for files directly under `docs/Guides/` and `docs/Architecture/`. For files in subdirectories (for example, `docs/Architecture/ADRs/*`), adjust the relative path accordingly (for example, `../../../config/schemas/doc-frontmatter.schema.json`).

- **title**: Matches the main H1 where practical but does not need to include emojis or decorative prefixes.

- **summary**: Single sentence, kept short enough to show in an index or hover tooltip.

- **created**: The original introduction date of the document. We typically derive this from git:

  ```powershell
  git log --diff-filter=A --follow --date=short --format="%ad" -- docs/Guides/FILE.md | Select-Object -Last 1
  ```

- **last\_reviewed**: The last date someone confirmed the content is still accurate. This should change whenever you make a meaningful content update, not for trivial whitespace edits.

- **category**: For now, this is simply `"guide"` for all files under `docs/Guides/` and `docs/Architecture/**`. If we introduce other doc types later (for example, `"adr"`, `"reference"`), this can be extended.

- **author**: Use a consistent handle (for example, `"Nick2bad4u"`). Multiple authors are fine but uncommon.

- **tags**: Small set of focused keywords. Prefer 3–7 tags that reflect technology (for example, `"vitest"`, `"ipc"`, `"zustand"`) or domain (for example, `"monitoring"`, `"events"`).

### Deprecated / removed fields

Older versions of the docs used additional fields like:

- `ai_note`
- `description`
- `keywords`
- `misc.doc_category`
- `misc.source`

These have been removed in favor of the simpler schema above:

- `summary` replaces `description` as the canonical short description.
- `tags` replaces both `keywords` and `misc.doc_category`.
- `ai_note` and `misc.source` are no longer used.

When editing existing docs, do not reintroduce these fields.

### Optional fields for future use

We may introduce additional optional metadata fields over time. If you use them, keep names and shapes consistent:

```yaml
status: "active"        # or "draft" | "deprecated"
topics:
    - "monitoring"       # higher-level areas than tags
    - "architecture"
audience:
    - "frontend"         # "backend" | "full-stack" | "ai-assistant" etc.
```

These are not required today but give us room to express intent (for example, marking a doc as deprecated, or indicating it is primarily for backend engineers).

## � File Naming Conventions

### File naming standards

All documentation files should follow consistent naming patterns:

**Root-level files**: Use UPPERCASE for important project files

- `README.md` - Project overview and getting started
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history and changes
- `SECURITY.md` - Security policies and reporting
- `LICENSE` - Project license

**Documentation files**: Use lowercase kebab-case for all other documentation

- `documentation-style-guide.md` (this file)
- `API_DOCUMENTATION.md`
- `DEVELOPER_QUICK_START.md`
- `testing-methodology-react-components.md`

**Subdirectory files**: Use lowercase kebab-case throughout

- `docs/TSDoc/tsdoc-home.md`
- `docs/Testing/playwright-testing-guide.md`
- `docs/Guides/ENVIRONMENT_SETUP.md`
- `.github/prompts/generate-test-coverage.prompt.md`

### Examples

✅ **Good examples:**

```text
README.md
docs/DEVELOPER_QUICK_START.md
docs/TSDoc/tsdoc-tag-param.md
docs/Testing/fast-check-fuzzing-coverage.md
.github/prompts/performance-tests.prompt.md
```

❌ **Poor examples:**

```text
Read_Me.md
docs/DeveloperQuickStart.md
docs/TSDoc/TSDoc_Tag_Param.md
docs/Testing/FAST_CHECK_FUZZING_COVERAGE.md
.github/prompts/Performance_Tests.Prompt.md
```

### Multi-word handling

- Separate words with hyphens (kebab-case)
- Keep acronyms together when they form a single concept
- Break up long compound words for readability

✅ **Good multi-word examples:**

```text
playwright-testing-guide.md
fast-check-fuzzing-coverage.md
tsdoc-package-eslint-plugin-tsdoc.md
circuit-breaker-implementation-plan.md
```

## �📝 Formatting Standards

### Headers

- Use **sentence case** for headers (not title case)
- Include descriptive emoji prefix for main sections (optional but encouraged)
- Use proper heading hierarchy (H1 for title, H2 for main sections, etc.)

#### Header example

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

#### Badge example

```markdown
<div align="center">

<a href="https://github.com/project/releases">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
</a>

</div>

| Feature    | Description                     | Status |
| ---------- | ------------------------------- | ------ |
| Monitoring | Real-time uptime tracking       | ✅     |
| Alerts     | Desktop notifications           | ✅     |
| Analytics  | Historical data visualization   | 🚧     |
```

### Code Blocks

- Always specify language for syntax highlighting
- Use descriptive comments
- Include full file paths when relevant

#### Code block example

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

#### List example

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

#### Emphasis example

```markdown
**Important**: Always use `npm install` before running the development server.

> ⚠️ **Warning**: This action cannot be undone.

The `package.json` file contains all _dependencies_ and **scripts**.
```

### Links

- Use descriptive link text (not "click here")
- Include relative paths for internal documentation
- Use absolute URLs for external resources

#### Link example

```markdown
See the [environment setup guide](./ENVIRONMENT_SETUP.md) for setup instructions.

Learn more about [TypeScript](https://www.typescriptlang.org/) documentation.
```

### Images and Assets

- Include descriptive alt text
- Use relative paths for project assets
- Center important images
- Include captions when helpful

#### Image example

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

Use the following template when documenting low-level APIs:

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

**Throws:**

- `ErrorType`: When this error occurs
````

````text

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
| --- | --- | --- | --- |
| HTTP | 80 | TCP | 30s |
| HTTPS | 443 | TCP | 30s |
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
| Type | Info |
| --- | --- |
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
