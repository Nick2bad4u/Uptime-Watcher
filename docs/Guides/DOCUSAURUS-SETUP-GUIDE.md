# Docusaurus Documentation Setup Guide

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
  "../../docs/Packages/**/*.md",
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
npm run docs:dev

# Generate TypeDoc documentation
npm run docs:typedoc

# Build static site
npm run docs:build
```

### 2. Generation Steps

1. **TypeDoc Generation**:
   - Parses TypeScript source files
   - Processes project documents from markdown files
   - Generates unified documentation in `docs/` directory
   - Creates `typedoc-sidebar.cjs` with navigation structure

2. **Docusaurus Build**:
   - Imports TypeDoc-generated content
   - Applies Docusaurus theme and navigation
   - Generates static HTML with search indexing
   - Optimizes assets for deployment

### 3. Deployment

The documentation is deployed to GitHub Pages via:

- **Base URL**: `/Uptime-Watcher/`
- **Organization**: `Nick2bad4u`
- **Repository**: `Uptime-Watcher`
- **Branch**: `gh-pages`

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

1. **Missing sidebar items**: Check TypeDoc projectDocuments configuration
2. **Broken links**: Verify relative paths and TypeDoc link syntax
3. **Build failures**: Review TypeScript configuration and exclude patterns
4. **Search not working**: Ensure proper indexing and search configuration

### Debug Commands

```bash
# Validate TypeDoc configuration
npx typedoc --help

# Check TypeScript compilation
npm run type-check:all

# Validate Docusaurus configuration
npm run docs:build --verbose

# Clear caches
npm run docs:clear
```

## Scripts Reference

Available npm scripts for documentation:

- `docs:dev` - Start development server
- `docs:build` - Build static documentation
- `docs:serve` - Serve built documentation locally
- `docs:typedoc` - Generate TypeDoc documentation only
- `docs:clear` - Clear Docusaurus build cache
- `docs:preview` - Preview built documentation

---

This setup provides a comprehensive documentation solution that grows with the project while maintaining consistency and discoverability across all documentation types.
