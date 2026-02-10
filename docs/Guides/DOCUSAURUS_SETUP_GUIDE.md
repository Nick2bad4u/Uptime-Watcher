---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Docusaurus Documentation Setup Guide"
summary: "Setup and architecture of the Docusaurus + TypeDoc documentation site for Uptime Watcher."
created: "2025-08-22"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "docusaurus"
 - "typedoc"
 - "documentation"
 - "github-pages"
---

# Docusaurus Documentation Setup Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration Files](#configuration-files)
4. [Project Documents Integration](#project-documents-integration)
5. [Build Process](#build-process)
6. [Key Features](#key-features)
7. [Customization](#customization)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Scripts Reference](#scripts-reference)
11. [🎯 Quick Reference](#-quick-reference)

## Overview

This project uses **Docusaurus v3** with **TypeDoc** integration to generate comprehensive documentation from TypeScript source code and standalone markdown files. The setup provides a unified documentation experience that includes:

- **API Documentation**: Auto-generated from TypeScript code using TypeDoc
- **Project Documents**: Architecture guides, development docs, and package documentation
- **Integrated Search**: Full-text search across all documentation
- **Modern UI**: Responsive design with dark mode support

## Architecture

```text
docs/
├── docusaurus/              # Docusaurus site configuration
│   ├── docs/               # Generated documentation output
│   ├── src/                # Custom pages and components
│   ├── static/             # Static assets
│   ├── docusaurus.config.ts # Main Docusaurus configuration
│   ├── sidebars.ts         # Sidebar configuration
│   ├── typedoc.config.json # Standard TypeDoc configuration
│   ├── typedoc.local.config.json # Local development configuration
│   └── tsconfig.typedoc.json # TypeScript configuration for TypeDoc
├── Architecture/           # Architecture documentation
├── Guides/                # Development guides
├── Packages/              # Package-specific documentation
└── TSDoc/                # TSDoc specification and examples
```

## Configuration Files

### 1. Docusaurus Configuration (`docusaurus.config.ts`)

The main configuration file that sets up:

- **Site metadata**: Title, tagline, URL, and organization details
- **Deployment settings**: GitHub Pages deployment configuration
- **Theme configuration**: Navbar, footer, and color scheme
- **Plugin configuration**: Currently using standalone TypeDoc
- **Markdown processing**: MDX support with preprocessors

Key settings:

```typescript
export default {
 title: "Uptime Watcher",
 url: "https://nick2bad4u.github.io",
 baseUrl: "/Uptime-Watcher/",
 organizationName: "Nick2bad4u",
 projectName: "Uptime-Watcher",
 // ... other configuration
};
```

### 2. Sidebar Configuration (`sidebars.ts`)

Defines the navigation structure with TypeDoc integration:

```typescript
// Import the TypeDoc-generated sidebar
const typedocSidebar = require('./docs/typedoc-sidebar.cjs');

const sidebars: SidebarsConfig = {
  unifiedSidebar: [
    // Project documents (from TypeDoc projectDocuments)
    ...typedocSidebar.items,
    // API documentation sections
    { type: 'category', label: 'Frontend (React App)', ... },
    { type: 'category', label: 'Backend (Electron Main)', ... },
    { type: 'category', label: 'Shared Code', ... }
  ],
};
```

### 3. TypeDoc Configuration

Two configuration files provide flexibility:

#### `typedoc.config.json` (Standard)

- Uses relative paths for cross-platform compatibility
- Configured for CI/CD environments
- Standard output directory: `docs`

#### `typedoc.local.config.json` (Development)

- Uses absolute paths for local development
- Optimized for Windows development environment
- Direct output to Docusaurus docs directory

Key TypeDoc settings:

```json
{
 "entryPointStrategy": "expand",
 "entryPoints": [
  "../../src/**/*.{ts,tsx}",
  "../../electron/**/*.{ts,tsx}",
  "../../shared/**/*.{ts,tsx}"
 ],
 "plugin": [
  "typedoc-plugin-remark",
  "typedoc-plugin-missing-exports",
  "typedoc-plugin-replace-text",
  "typedoc-plugin-markdown",
  "typedoc-plugin-mdn-links",
  "typedoc-plugin-dt-links",
  "typedoc-plugin-external-package-links",
  "typedoc-plugin-rename-defaults",
  "typedoc-plugin-coverage",
  "typedoc-docusaurus-theme"
 ],
 "projectDocuments": [
  "../../docs/Architecture/**/*.md",
  "../../docs/Guides/**/*.md",
  "../../docs/TSDoc/**/*.md",
  "../../docs/*.md"
 ]
}
```

### 4. TypeScript Configuration (`tsconfig.typedoc.json`)

Specialized TypeScript configuration for documentation generation:

- **Target**: ESNext for modern JavaScript features
- **Module resolution**: Bundler strategy for modern imports
- **Path mapping**: Aliases for `@shared/*`, `@electron/*`, `@app/*`
- **Includes**: All TypeScript/JavaScript files in src, electron, shared
- **Excludes**: Test files, build outputs, and development artifacts

## Project Documents Integration

The `projectDocuments` feature in TypeDoc allows including standalone markdown files alongside API documentation. These documents are:

1. **Automatically discovered** from configured glob patterns
2. **Processed by TypeDoc** with full markdown support
3. **Integrated into sidebar** via the generated `typedoc-sidebar.cjs`
4. **Cross-linked** with API documentation using TypeDoc's link resolution

### Document Categories

- **Architecture/**: ADRs, patterns, templates, and architectural decisions
- **Guides/**: Development guides, testing methodology, and feature guides
- **Packages/**: Third-party package documentation and examples
- **TSDoc/**: TypeScript documentation standards and examples
- **Root level**: High-level project documentation

## Build Process

### 1. Development Workflow

```bash
# Start Docusaurus development server
npm run docusaurus:start

# Start with local configuration (optimized for Windows development)
npm run docusaurus:start:local

# Generate TypeDoc documentation only
npm run docs:typedoc

# Generate with local configuration
npm run docs:typedoc:local

# Build static site (includes TypeDoc generation and ESLint inspector)
npm run docs:build

# Build with local configuration
npm run docs:build:local

# Serve built documentation locally
npm run docusaurus:serve

# Preview basic docs output
npm run docs:preview
```

### 2. Documentation Download Scripts

The project includes scripts to download external documentation for better offline development:

```bash
# Download all external documentation
npm run docs:download:all

# Individual package documentation
npm run docs:download:react
npm run docs:download:electron
npm run docs:download:chartjs
npm run docs:download:zustand
npm run docs:download:axios
npm run docs:download:zod
npm run docs:download:validator
npm run docs:download:sqlite3
npm run docs:download:sqlite3-wasm
npm run docs:download:nodeping
npm run docs:download:tsdoc
```

### 3. Generation Steps

1. **TypeDoc Generation**:
   - Parses TypeScript source files from `src/`, `electron/`, and `shared/`
   - Processes project documents from markdown files in `docs/` hierarchy
   - Generates unified documentation in `docs/docusaurus/docs/` directory
   - Creates `typedoc-sidebar.cjs` with navigation structure

2. **ESLint Inspector Build**:
   - Generates interactive ESLint configuration inspector
   - Outputs to `docs/docusaurus/static/eslint-inspector/`
   - Accessible via `/eslint-inspector/` route in documentation

3. **Docusaurus Build**:
   - Imports TypeDoc-generated content and ESLint inspector
   - Applies Docusaurus theme and navigation
   - Generates static HTML with search indexing
   - Optimizes assets for deployment

### 4. Deployment

The documentation is deployed to GitHub Pages via:

- **Base URL**: `/Uptime-Watcher/`
- **Organization**: `Nick2bad4u`
- **Repository**: `Uptime-Watcher`
- **Branch**: `gh-pages`

#### Deployment commands

```bash
# Deploy to GitHub Pages
npm run docs:deploy

# Deploy with local configuration
npm run docs:deploy:local
```

## Key Features

### 1. Unified Navigation

The sidebar integrates:

- Project documentation (from markdown files)
- API documentation (from TypeScript source)
- Cross-references between different documentation types

### 2. Advanced Search

Powered by Docusaurus search with:

- Full-text search across all documentation
- Category-specific search boosts
- Document type filtering

### 3. Enhanced Linking

- **Internal links**: Automatic resolution between documents
- **API links**: TypeDoc's `{@link}` tags for API references
- **External links**: Configured mappings for third-party documentation

### 4. Content Processing

- **Text replacement**: Automatic formatting of TODO/FIXME comments
- **Code examples**: Syntax highlighting with multiple language support
- **Media handling**: Automatic copying and linking of images/assets

## Customization

### Adding New Document Categories

1. Create new directory under `docs/`
2. Add glob pattern to `projectDocuments` in TypeDoc configuration
3. Documents will automatically appear in generated sidebar

### Modifying Sidebar Structure

The sidebar structure is controlled by:

1. **TypeDoc generation**: Creates base navigation from projectDocuments
2. **Sidebar configuration**: Adds custom categories and ordering
3. **Category options**: Collapse/expand behavior and labeling

### Theme Customization

Customize appearance via:

- `src/css/custom.css`: Global style overrides
- Theme configuration in `docusaurus.config.ts`
- Custom React components in `src/components/`

## Best Practices

### 1. Documentation Organization

- **Group related documents** in appropriate directories
- **Use consistent naming** conventions for files and headings
- **Include frontmatter** in markdown files for better organization

### 2. Cross-Referencing

- **Use TypeDoc links** (`{@link ClassName}`) for API references
- **Use relative links** for document-to-document references
- **Test link resolution** during build process

### 3. Content Guidelines

- **Write clear headings** for automatic table of contents generation
- **Include code examples** with proper syntax highlighting
- **Use consistent terminology** across all documentation

## Troubleshooting

### Common Issues

1. **Missing sidebar items**:
   - Check TypeDoc `projectDocuments` configuration in `typedoc.config.json`
   - Verify markdown file paths and glob patterns
   - Run `npm run docs:typedoc` to regenerate sidebar

2. **Broken links**:
   - Use broken link checker: `npm run docusaurus:broken-links`
   - Verify relative paths and TypeDoc link syntax
   - Check cross-references between project documents and API docs

3. **Build failures**:
   - Review TypeScript configuration in `tsconfig.typedoc.json`
   - Check exclude patterns for test files and build outputs
   - Verify all dependencies are installed in `docs/docusaurus/`

4. **Search not working**:
   - Ensure proper indexing configuration in Docusaurus
   - Check search plugin configuration
   - Verify content is being generated correctly

5. **Local vs CI differences**:
   - Use `npm run docs:typedoc:local` for Windows development
   - Use `npm run docs:typedoc` for CI/CD environments
   - Check path differences between configurations

### Debug Commands

```bash
# Validate TypeDoc configuration
cd docs/docusaurus && npx typedoc --help

# Check TypeScript compilation for docs
npm run type-check:all

# Validate Docusaurus configuration and check for broken links
npm run docusaurus:broken-links

# Build with verbose output
npm run docs:build -- --verbose

# Clear TypeDoc and Docusaurus caches
npm run docs:clean
cd docs/docusaurus && npm run clear

# Test local development setup
npm run docs:typedoc:local
npm run docusaurus:start:local
```

### Configuration Validation

```bash
# Test TypeDoc configuration
cd docs/docusaurus
npx typedoc --options typedoc.config.json --dry-run

# Test local TypeDoc configuration
npx typedoc --options typedoc.local.config.json --dry-run

# Validate Docusaurus config
npx docusaurus validate

# Check for duplicate routes
npx docusaurus check
```

## Scripts Reference

Available npm scripts for documentation:

### Core Documentation Scripts

- `docs:typedoc` - Generate TypeDoc documentation (standard config)
- `docs:typedoc:local` - Generate TypeDoc with local config (Windows optimized)
- `docs:build` - Build complete documentation site (TypeDoc + ESLint inspector + Docusaurus)
- `docs:build:local` - Build with local configuration
- `docs:preview` - Preview basic docs output using serve
- `docs:clean` - Remove generated documentation files

### Docusaurus Development Scripts

- `docusaurus:start` - Start Docusaurus development server
- `docusaurus:start:local` - Start with local configuration
- `docusaurus:serve` - Serve built documentation locally
- `docusaurus:serve:local` - Serve with local configuration
- `docusaurus:broken-links` - Check for broken links in documentation

### Deployment Scripts

- `docs:deploy` - Deploy to GitHub Pages
- `docs:deploy:local` - Deploy with local configuration

### External Documentation Downloads

- `docs:download:all` - Download all external package documentation
- `docs:download:react` - Download React documentation
- `docs:download:electron` - Download Electron documentation
- `docs:download:chartjs` - Download Chart.js documentation
- `docs:download:zustand` - Download Zustand documentation
- `docs:download:axios` - Download Axios documentation
- `docs:download:zod` - Download Zod documentation
- `docs:download:validator` - Download Validator.js documentation
- `docs:download:sqlite3` - Download node-sqlite3 documentation
- `docs:download:sqlite3-wasm` - Download node-sqlite3-wasm documentation
- `docs:download:nodeping` - Download NodePing API documentation
- `docs:download:tsdoc` - Download TSDoc tag specifications

### Build Enhancement Scripts

- `build:eslint-inspector` - Build ESLint configuration inspector
- `build:eslint-inspector:local` - Build ESLint inspector with local paths

## 🎯 Quick Reference

### Development Workflow

```bash
# Start local development (recommended for Windows)
npm run docs:typedoc:local
npm run docusaurus:start:local

# Build and test locally
npm run docs:build:local
npm run docusaurus:serve:local

# Check for issues
npm run docusaurus:broken-links
npm run type-check:all
```

### Production Deployment

```bash
# Full production build and deploy
npm run docs:download:all  # Optional: update external docs
npm run docs:deploy
```

### Key Files

- `docs/docusaurus/typedoc.config.json` - Standard TypeDoc configuration
- `docs/docusaurus/typedoc.local.config.json` - Local development configuration
- `docs/docusaurus/docusaurus.config.ts` - Main Docusaurus configuration
- `docs/docusaurus/sidebars.ts` - Sidebar navigation configuration
- `docs/docusaurus/tsconfig.typedoc.json` - TypeScript config for TypeDoc
- `scripts/download-*-docs.mjs` - External documentation download scripts

---

This setup provides a comprehensive documentation solution that grows with the project while maintaining consistency and discoverability across all documentation types.
