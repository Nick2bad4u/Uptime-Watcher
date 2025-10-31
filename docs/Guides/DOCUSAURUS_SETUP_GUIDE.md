# Docusaurus Documentation Setup Guide

## Overview

This project uses __Docusaurus v3__ with __TypeDoc__ integration to generate comprehensive documentation from TypeScript source code and standalone markdown files. The setup provides a unified documentation experience that includes:

* __API Documentation__: Auto-generated from TypeScript code using TypeDoc
* __Project Documents__: Architecture guides, development docs, and package documentation
* __Integrated Search__: Full-text search across all documentation
* __Modern UI__: Responsive design with dark mode support

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

* __Site metadata__: Title, tagline, URL, and organization details
* __Deployment settings__: GitHub Pages deployment configuration
* __Theme configuration__: Navbar, footer, and color scheme
* __Plugin configuration__: Currently using standalone TypeDoc
* __Markdown processing__: MDX support with preprocessors

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

* Uses relative paths for cross-platform compatibility
* Configured for CI/CD environments
* Standard output directory: `docs`

#### `typedoc.local.config.json` (Development)

* Uses absolute paths for local development
* Optimized for Windows development environment
* Direct output to Docusaurus docs directory

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
  "../../docs/Packages/**/*.md",
  "../../docs/TSDoc/**/*.md",
  "../../docs/*.md"
 ]
}
```

### 4. TypeScript Configuration (`tsconfig.typedoc.json`)

Specialized TypeScript configuration for documentation generation:

* __Target__: ESNext for modern JavaScript features
* __Module resolution__: Bundler strategy for modern imports
* __Path mapping__: Aliases for `@shared/*`, `@electron/*`, `@app/*`
* __Includes__: All TypeScript/JavaScript files in src, electron, shared
* __Excludes__: Test files, build outputs, and development artifacts

## Project Documents Integration

The `projectDocuments` feature in TypeDoc allows including standalone markdown files alongside API documentation. These documents are:

1. __Automatically discovered__ from configured glob patterns
2. __Processed by TypeDoc__ with full markdown support
3. __Integrated into sidebar__ via the generated `typedoc-sidebar.cjs`
4. __Cross-linked__ with API documentation using TypeDoc's link resolution

### Document Categories

* __Architecture/__: ADRs, patterns, templates, and architectural decisions
* __Guides/__: Development guides, testing methodology, and feature guides
* __Packages/__: Third-party package documentation and examples
* __TSDoc/__: TypeScript documentation standards and examples
* __Root level__: High-level project documentation

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

1. __TypeDoc Generation__:
   * Parses TypeScript source files from `src/`, `electron/`, and `shared/`
   * Processes project documents from markdown files in `docs/` hierarchy
   * Generates unified documentation in `docs/docusaurus/docs/` directory
   * Creates `typedoc-sidebar.cjs` with navigation structure

2. __ESLint Inspector Build__:
   * Generates interactive ESLint configuration inspector
   * Outputs to `docs/docusaurus/static/eslint-inspector/`
   * Accessible via `/eslint-inspector/` route in documentation

3. __Docusaurus Build__:
   * Imports TypeDoc-generated content and ESLint inspector
   * Applies Docusaurus theme and navigation
   * Generates static HTML with search indexing
   * Optimizes assets for deployment

### 4. Deployment

The documentation is deployed to GitHub Pages via:

* __Base URL__: `/Uptime-Watcher/`
* __Organization__: `Nick2bad4u`
* __Repository__: `Uptime-Watcher`
* __Branch__: `gh-pages`

```bash
# Deploy to GitHub Pages
npm run docs:deploy

# Deploy with local configuration
npm run docs:deploy:local
```

## Key Features

### 1. Unified Navigation

The sidebar integrates:

* Project documentation (from markdown files)
* API documentation (from TypeScript source)
* Cross-references between different documentation types

### 2. Advanced Search

Powered by Docusaurus search with:

* Full-text search across all documentation
* Category-specific search boosts
* Document type filtering

### 3. Enhanced Linking

* __Internal links__: Automatic resolution between documents
* __API links__: TypeDoc's `{@link}` tags for API references
* __External links__: Configured mappings for third-party documentation

### 4. Content Processing

* __Text replacement__: Automatic formatting of TODO/FIXME comments
* __Code examples__: Syntax highlighting with multiple language support
* __Media handling__: Automatic copying and linking of images/assets

## Customization

### Adding New Document Categories

1. Create new directory under `docs/`
2. Add glob pattern to `projectDocuments` in TypeDoc configuration
3. Documents will automatically appear in generated sidebar

### Modifying Sidebar Structure

The sidebar structure is controlled by:

1. __TypeDoc generation__: Creates base navigation from projectDocuments
2. __Sidebar configuration__: Adds custom categories and ordering
3. __Category options__: Collapse/expand behavior and labeling

### Theme Customization

Customize appearance via:

* `src/css/custom.css`: Global style overrides
* Theme configuration in `docusaurus.config.ts`
* Custom React components in `src/components/`

## Best Practices

### 1. Documentation Organization

* __Group related documents__ in appropriate directories
* __Use consistent naming__ conventions for files and headings
* __Include frontmatter__ in markdown files for better organization

### 2. Cross-Referencing

* __Use TypeDoc links__ (`{@link ClassName}`) for API references
* __Use relative links__ for document-to-document references
* __Test link resolution__ during build process

### 3. Content Guidelines

* __Write clear headings__ for automatic table of contents generation
* __Include code examples__ with proper syntax highlighting
* __Use consistent terminology__ across all documentation

## Troubleshooting

### Common Issues

1. __Missing sidebar items__:
   * Check TypeDoc `projectDocuments` configuration in `typedoc.config.json`
   * Verify markdown file paths and glob patterns
   * Run `npm run docs:typedoc` to regenerate sidebar

2. __Broken links__:
   * Use broken link checker: `npm run docusaurus:broken-links`
   * Verify relative paths and TypeDoc link syntax
   * Check cross-references between project documents and API docs

3. __Build failures__:
   * Review TypeScript configuration in `tsconfig.typedoc.json`
   * Check exclude patterns for test files and build outputs
   * Verify all dependencies are installed in `docs/docusaurus/`

4. __Search not working__:
   * Ensure proper indexing configuration in Docusaurus
   * Check search plugin configuration
   * Verify content is being generated correctly

5. __Local vs CI differences__:
   * Use `npm run docs:typedoc:local` for Windows development
   * Use `npm run docs:typedoc` for CI/CD environments
   * Check path differences between configurations

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

* `docs:typedoc` - Generate TypeDoc documentation (standard config)
* `docs:typedoc:local` - Generate TypeDoc with local config (Windows optimized)
* `docs:build` - Build complete documentation site (TypeDoc + ESLint inspector + Docusaurus)
* `docs:build:local` - Build with local configuration
* `docs:preview` - Preview basic docs output using serve
* `docs:clean` - Remove generated documentation files

### Docusaurus Development Scripts

* `docusaurus:start` - Start Docusaurus development server
* `docusaurus:start:local` - Start with local configuration
* `docusaurus:serve` - Serve built documentation locally
* `docusaurus:serve:local` - Serve with local configuration
* `docusaurus:broken-links` - Check for broken links in documentation

### Deployment Scripts

* `docs:deploy` - Deploy to GitHub Pages
* `docs:deploy:local` - Deploy with local configuration

### External Documentation Downloads

* `docs:download:all` - Download all external package documentation
* `docs:download:react` - Download React documentation
* `docs:download:electron` - Download Electron documentation
* `docs:download:chartjs` - Download Chart.js documentation
* `docs:download:zustand` - Download Zustand documentation
* `docs:download:axios` - Download Axios documentation
* `docs:download:zod` - Download Zod documentation
* `docs:download:validator` - Download Validator.js documentation
* `docs:download:sqlite3` - Download node-sqlite3 documentation
* `docs:download:sqlite3-wasm` - Download node-sqlite3-wasm documentation
* `docs:download:nodeping` - Download NodePing API documentation
* `docs:download:tsdoc` - Download TSDoc tag specifications

### Build Enhancement Scripts

* `build:eslint-inspector` - Build ESLint configuration inspector
* `build:eslint-inspector:local` - Build ESLint inspector with local paths

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

* `docs/docusaurus/typedoc.config.json` - Standard TypeDoc configuration
* `docs/docusaurus/typedoc.local.config.json` - Local development configuration
* `docs/docusaurus/docusaurus.config.ts` - Main Docusaurus configuration
* `docs/docusaurus/sidebars.ts` - Sidebar navigation configuration
* `docs/docusaurus/tsconfig.typedoc.json` - TypeScript config for TypeDoc
* `scripts/download-*-docs.mjs` - External documentation download scripts

***

This setup provides a comprehensive documentation solution that grows with the project while maintaining consistency and discoverability across all documentation types.
