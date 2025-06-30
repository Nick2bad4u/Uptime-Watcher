# Vite Configuration and MCP Integration

This document provides detailed information about the Vite configuration for the Uptime Watcher Electron application, including the Model Context Protocol (MCP) integration.

## Overview

The Uptime Watcher project uses Vite as the build tool for both the React frontend (renderer process) and Electron main/preload processes. The configuration includes MCP server integration for enhanced development capabilities.

## Configuration Details

### Root Directory

```text
C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/Uptime-Watcher
```

### Build Configuration

- **Base Path**: `./` (ensures relative asset paths for Electron)
- **Output Directory**: `dist` (frontend), `dist-electron` (Electron processes)
- **Target**: `esnext` (modern JavaScript output optimized for Electron)
- **Source Maps**: Enabled for debugging
- **Code Splitting**: Disabled (`manualChunks: undefined`) to avoid issues with Electron

### Resolve Configuration

#### File Extensions

The following file extensions are supported:

- `.mjs` - ES modules
- `.js` - JavaScript
- `.mts` - TypeScript modules
- `.ts` - TypeScript
- `.jsx` - React JSX
- `.tsx` - TypeScript JSX
- `.json` - JSON imports

#### Module Resolution

- **External Conditions**: `node`
- **Dedupe Packages**: `react`, `react-dom` (prevents duplicate React instances)
- **Main Fields**: `browser`, `module`, `jsnext:main`, `jsnext`
- **Conditions**: `module`, `browser`, `development|production`

#### Path Aliases

- **`@`** → `src/` directory for clean imports

  ```typescript
  import { Component } from '@/components/Component';
  ```

### Active Plugins

#### Core Vite Plugins

- **`vite:optimized-deps`** - Dependency pre-bundling and optimization
- **`vite:watch-package-data`** - Watches package.json changes
- **`vite:pre-alias`** & **`alias`** - Path aliasing support
- **`vite:css`**, **`vite:css-post`**, **`vite:css-analysis`** - CSS processing pipeline
- **`vite:esbuild`** - TypeScript/JSX compilation via esbuild
- **`vite:json`** - JSON file imports
- **`vite:wasm-helper`** & **`vite:wasm-fallback`** - WebAssembly support (for SQLite WASM)
- **`vite:worker`** - Web Workers support
- **`vite:asset`** - Static asset handling

#### Framework & Build Plugins

- **`vite:react-babel`** & **`vite:react-refresh`** - React support with Fast Refresh
- **`vite:modulepreload-polyfill`** - Module preloading for better performance
- **`vite:html-inline-proxy`** - HTML processing and proxying

#### Custom Plugins

- **`vite-plugin-mcp`** ✅ - Model Context Protocol server integration
- **`vite-plugin-electron`** - Electron main/preload process building
- **`vite-plugin-static-copy:serve`** - Static file copying (SQLite WASM files)

#### Development Tools

- **`vite:define`** - Environment variable definitions
- **`vite:client-inject`** - Development client injection
- **`vite:import-analysis`** - Import analysis and transformation
- **`vite:dynamic-import-vars`** & **`vite:import-glob`** - Dynamic import support

### Server Configuration

- **Port**: `5173`
- **Strict Port**: `true` (fails if port is unavailable)
- **Auto-open**: `false` (doesn't open browser since this is an Electron app)

### Environment Support

- **Client Environment** - For the renderer process (React frontend)
- **SSR Environment** - Server-side rendering capabilities

## MCP Integration

### What is MCP?

Model Context Protocol (MCP) is a standardized protocol that enables AI assistants to securely access external data sources and tools. In this project, MCP provides:

- **Database Access** - Query and inspect SQLite databases
- **File System Operations** - Read, write, and manipulate files
- **GitHub Integration** - Repository operations and API access
- **Memory Management** - Persistent context and knowledge graphs

### MCP Plugin Configuration

The `vite-plugin-mcp` is configured with default settings:

```typescript
ViteMcp()
```

This enables the MCP server at:

```text
http://localhost:5173/__mcp/sse
```

**Note**: The MCP server is automatically started when the Vite dev server runs. The configuration is read from `.vscode/mcp.json`.

### MCP Configuration File

The MCP server configuration is managed in `.vscode/mcp.json`. To avoid connection errors when the dev server isn't running:

**Active Configuration** (when developing with MCP tools):

```json
{
  "servers": {
    "vite": {
      "type": "sse",
      "url": "http://localhost:5173/__mcp/sse"
    }
  }
}
```

**Inactive Configuration** (when not using MCP tools):

```json
{
  "servers": {}
}
```

> **Important**: JSON files don't support comments. Always use valid JSON syntax in `mcp.json`.

### Available MCP Servers

The following MCP servers are configured in `.vscode/settings.json`:

1. **GitHub Server** (`@modelcontextprotocol/server-github`)
   - Repository operations
   - Issue and PR management
   - Code search and analysis

2. **Memory Server** (`@modelcontextprotocol/server-memory`)
   - Knowledge graph management
   - Persistent context storage

3. **Everything Server** (`@modelcontextprotocol/server-everything`)
   - Comprehensive tool collection
   - Multiple service integrations

4. **Database Server** (`@executeautomation/database-server`)
   - SQLite database operations
   - Schema inspection and queries

### Using MCP Tools

MCP tools can be accessed through VS Code Copilot using the `#` prefix:

```text
#mcp_vite_get-vite-config         - Get Vite configuration
#mcp_github_list_issues           - List GitHub issues
#mcp_memory_create_entities       - Create knowledge entities
#mcp_uptime-watche_read_query     - Query SQLite database
```

## Development Workflow

### Starting the Development Server

Use the VS Code task or terminal command:

```powershell
# Via VS Code task
# Ctrl+Shift+P → "Tasks: Run Task" → "Start Vite Dev Server"

# Via terminal
npm run dev
```

### Building the Application

```powershell
# Build frontend and Electron processes
npm run build

# Build only Electron main process (development)
npm run build:electron
```

### MCP Server Status

To verify MCP integration is working:

1. Ensure Vite dev server is running
2. Check that `vite-plugin-mcp` appears in the active plugins list
3. Test MCP tools through VS Code Copilot

## Troubleshooting

### Common Issues

#### MCP Server Not Available

**Error**: `fetch failed` when using MCP tools

**Solution**:

1. Ensure Vite dev server is running (`npm run dev`)
2. Verify port 5173 is not blocked
3. Check that `ViteMcp()` is included in the plugins array

#### JSON Parsing Error in MCP Configuration

**Error**: `SyntaxError: Expected property name or '}' in JSON at position X`

**Cause**: Invalid JSON syntax in `.vscode/mcp.json` (usually comments or trailing commas)

**Solution**:

1. Ensure `.vscode/mcp.json` contains valid JSON (no comments allowed)
2. Use empty servers object when not using MCP: `{"servers": {}}`
3. Check for trailing commas or missing quotes in JSON

#### Disabling MCP Temporarily

To completely disable MCP and avoid connection errors:

1. Set empty servers in `.vscode/mcp.json`: `{"servers": {}}`
2. Or temporarily remove `ViteMcp()` from `vite.config.ts` plugins array

#### TypeScript Compilation Errors

**Solution**:

- Ensure all TypeScript files use supported extensions (`.ts`, `.tsx`)
- Check that path aliases are correctly configured
- Verify `tsconfig.json` is compatible with Vite settings

#### WebAssembly Loading Issues

**Solution**:

- Confirm `node-sqlite3-wasm.wasm` is copied to `dist-electron/`
- Check `vite-plugin-static-copy` configuration
- Verify WASM file permissions

### Plugin Conflicts

If you experience plugin conflicts:

1. Check plugin order in the `plugins` array
2. Ensure compatible versions of React and Vite plugins
3. Review plugin-specific documentation for known issues

## Security Considerations

### Environment Variables

- Use `.env.example` for templates
- Never commit actual `.env` files
- Configure GitHub tokens as environment variables:

  ```powershell
  $env:GITHUB_TOKEN="your_token_here"
  ```

### MCP Server Security

- MCP servers run locally during development
- External connections are limited to configured services
- Review MCP server permissions before deployment

## Related Files

- **Configuration**: `vite.config.ts`
- **TypeScript Config**: `tsconfig.json`
- **Package Dependencies**: `package.json`
- **VS Code Settings**: `.vscode/settings.json`
- **Environment Template**: `.env.example`
- **Build Output**: `dist/`, `dist-electron/`

## References

- [Vite Documentation](https://vitejs.dev/)
- [vite-plugin-electron](https://github.com/electron-vite/vite-plugin-electron)
- [vite-plugin-mcp](https://github.com/antfu/vite-plugin-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Electron Documentation](https://www.electronjs.org/docs)

---

*Last updated: June 28, 2025*
*Project: Uptime Watcher v1.3.0*
