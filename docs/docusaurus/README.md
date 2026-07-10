# 📚 Uptime Watcher Documentation Site

[![Docusaurus badge.](https://img.shields.io/badge/Docusaurus-3.0+-green?logo=docusaurus&logoColor=white)](https://docusaurus.io/)
[![Node.js badge.](https://img.shields.io/badge/Node.js-24.18.0_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Deployment badge.](https://img.shields.io/badge/Deployment-GitHub_Pages-blue?logo=github&logoColor=white)](https://nick2bad4u.github.io/Uptime-Watcher/)

## 📖 Official documentation website for Uptime Watcher

Built with Docusaurus, the modern static website generator for technical
documentation.

## 🎯 About This Site

This is the **backup documentation repository** for the Uptime Watcher project.
The documentation is automatically generated from the main repository and
deployed to GitHub Pages at:

**🌐 Live site:**
[nick2bad4u.github.io/Uptime-Watcher](https://nick2bad4u.github.io/Uptime-Watcher/)

### 📂 Repository Structure

This documentation site is part of the main Uptime Watcher project and serves as:

- **📚 User Documentation**: Installation guides, feature documentation, and tutorials
- **🔧 Developer Documentation**: Architecture guides, API references, and
  contribution guidelines
- **📊 Project Resources**: Changelogs, release notes, and project roadmaps
- **🔄 Backup Repository**: Redundant storage for critical documentation assets

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 24.18.0 LTS (recommended; >=24.8.0 required)
- **npm**: 11.16.0 (declared by `packageManager`)
- **Git**: Latest version

### Development Setup

```bash
# Navigate to the docusaurus directory
cd docs/docusaurus

# Install dependencies
npm install

# Start local development server
npm start
```

The development server will start at `http://localhost:3000` with hot reload enabled.

## 🛠️ Available Commands

### Development

```bash
# Start development server with hot reload
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve

# Clear cache and build artifacts
npm run clear
```

### Deployment

```bash
# Deploy to GitHub Pages (SSH)
USE_SSH=true npm run deploy

# Deploy to GitHub Pages (HTTPS)
GIT_USER=<Your GitHub username> npm run deploy
```

### Quality & Maintenance

```bash
# Type checking
npm run typecheck

# Lint documentation files
npm run lint

# Format code
npm run format

# Check formatting/linting without writing changes
npm run format:check
```

## 📁 Site Architecture

```folder
docs/docusaurus/
├── blog/                   # Blog posts and announcements
├── docs/                   # Main documentation content
│   ├── guides/            # User guides and tutorials
│   ├── api/               # API documentation
│   ├── architecture/      # Technical architecture docs
│   └── testing/          # Testing documentation
├── src/                   # Custom React components
│   ├── components/        # Reusable UI components
│   ├── css/              # Global styles
│   └── pages/            # Custom pages
├── static/               # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts           # Navigation sidebars
└── package.json          # Dependencies and scripts
```

## 🎨 Customization

### Theming

The site uses a custom theme based on Docusaurus's default theme with:

- **🎯 Brand Colors**: Matching Uptime Watcher's visual identity
- **📱 Responsive Design**: Optimized for all device sizes
- **🌙 Dark Mode**: Full dark mode support
- **⚡ Performance**: Optimized build with code splitting

### Content Management

Documentation is organized using:

- **📄 Markdown Files**: All content written in MDX (Markdown + JSX)
- **🗂️ Frontmatter**: Metadata for SEO and navigation
- **🔗 Auto-Generated**: Sidebars and navigation from folder structure
- **🏷️ Tagging System**: Content categorization and search

## 🔧 Configuration

Key configuration files:

- **`docusaurus.config.ts`**: Main site configuration, plugins, and theme
  settings
- **`sidebars.ts`**: Navigation structure and sidebar configuration
- **`package.json`**: Dependencies, scripts, and project metadata
- **`tsconfig.json`**: TypeScript configuration for type safety

## 📦 Build Process

The site build process:

1. **📝 Content Processing**: Markdown files are processed and converted to
   React components
2. **⚡ Bundling**: Webpack bundles all assets with optimization
3. **🗂️ Static Generation**: Pre-rendered HTML for fast loading
4. **🚀 Deployment**: Automated deployment to GitHub Pages via GitHub Actions

### Build Artifacts

```folder
build/                     # Production build output
├── index.html            # Homepage
├── docs/                 # Documentation pages
├── blog/                 # Blog pages
├── assets/               # Optimized assets
└── sitemap.xml          # SEO sitemap
```

## 🚀 Deployment

### Automated Deployment

The site automatically deploys to GitHub Pages when:

- Changes are pushed to the `main` branch
- Documentation files are updated
- GitHub Actions workflow completes successfully

### Manual Deployment

For manual deployments:

```bash
# Using SSH (recommended for contributors)
USE_SSH=true npm run deploy

# Using HTTPS (requires GitHub token)
GIT_USER=<username> GITHUB_TOKEN=<token> npm run deploy
```

## 📊 Features

### Built-in Features

- **🔍 Search**: Full-text search across all documentation
- **📱 Mobile Responsive**: Optimized mobile experience
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📦 PWA**: Installable app experience + offline mode (via `@docusaurus/plugin-pwa`)
- **🔗 Cross-References**: Internal linking between docs
- **📈 Analytics**: Built-in analytics tracking
- **🏷️ Versioning**: Documentation versioning support

### Custom Features

- **📊 Interactive Demos**: Embedded interactive examples
- **🎯 Code Highlighting**: Syntax highlighting for multiple languages
- **📋 Copy-to-Clipboard**: One-click code copying
- **🔄 Live Updates**: Real-time content updates

## 🤝 Contributing

### Content Contributions

To contribute to the documentation:

1. **📝 Edit Content**: Modify markdown files in `docs/` or `blog/`
2. **🧪 Test Locally**: Run `npm start` to preview changes
3. **✅ Verify Build**: Run `npm run build` to ensure no errors
4. **📤 Submit PR**: Create a pull request with your changes

### Technical Contributions

For technical improvements:

1. **🔧 Component Development**: Create reusable React components in
   `src/components/`
2. **🎨 Styling**: Update global styles in `src/css/`
3. **⚙️ Configuration**: Modify site configuration in `docusaurus.config.ts`
4. **🧪 Testing**: Add tests for new functionality

## 🆘 Troubleshooting

### Common Issues

#### PWA / Service Worker Issues

```bash
# Enable verbose PWA debug logs during build
set DOCUSAURUS_PWA_DEBUG=true
npm run build
```

#### Build Failures

```bash
# Clear cache and rebuild
npm run clear
npm install
npm run build
```

#### Deployment Issues

```bash
# Verify GitHub permissions
# Check GitHub Pages settings
# Review GitHub Actions logs
```

#### Local Development Issues

```bash
# Check Node.js version (24.18.0 LTS recommended; >=24.8.0 required)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

Need help with the documentation site?

- **📖 [Docusaurus Documentation](https://docusaurus.io/docs)**
- **🐛 [Report Issues](https://github.com/Nick2bad4u/Uptime-Watcher/issues)**
- **💬 [GitHub Discussions](https://github.com/Nick2bad4u/Uptime-Watcher/discussions)**
- **📧 [Contact Maintainer](https://github.com/Nick2bad4u)**

---

## 📄 License

This documentation site is part of the Uptime Watcher project and is released
under the [Unlicense](../../README.md#-license) - Public Domain.

---

### 📚 Documentation powered by [Docusaurus](https://docusaurus.io/)

Last updated: November 2025
