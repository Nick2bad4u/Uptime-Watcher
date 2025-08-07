# ESLint Configuration Guide for Uptime-Watcher

## Overview

This document provides guidance on using ESLint configuration analysis tools in the Uptime-Watcher TypeScript/Electron project.

## Current Status: eslint-find-rules

### Issue
The `eslint-find-rules` tool (v5.0.0) is currently incompatible with ESLint 9.x due to:
- Deprecated `useEslintrc` option usage
- Incomplete flat config format support
- Legacy configuration API dependencies

### Previous Script (Deprecated)
```json
"eslint-find-option-rules": "eslint-find-rules --option --flatConfig"
```

**Status**: ❌ Non-functional with current ESLint version

## Recommended Alternatives

### 1. Built-in ESLint Configuration Analysis

#### Check Configuration for Main Process
```bash
npm run eslint:config-check
```
This saves the complete ESLint configuration for `electron/main.ts` to `/tmp/eslint-config-main.json`

#### Interactive Configuration Inspector
```bash
npm run eslint:config-inspect
```
Opens the ESLint configuration inspector (when available)

#### Manual Configuration Check
```bash
# For main process (TypeScript)
npx eslint --print-config electron/main.ts

# For renderer process (TypeScript + React)
npx eslint --print-config src/main.tsx

# For shared utilities
npx eslint --print-config shared/types.ts
```

### 2. Manual Rule Auditing

Review the `eslint.config.mjs` file and cross-reference with:
- [ESLint Built-in Rules](https://eslint.org/docs/latest/rules/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [React ESLint Plugin Rules](https://github.com/jsx-eslint/eslint-plugin-react#list-of-supported-rules)

### 3. Configuration Validation

```bash
# Test ESLint configuration
npx eslint --debug electron/main.ts 2>&1 | head -20

# Validate configuration syntax
node -e "console.log('Config valid')" --require ./eslint.config.mjs
```

## Best Practices for TypeScript/Electron Projects

### Target Source Files, Not Compiled Output

✅ **Correct**: Point linting tools at TypeScript source files
```bash
npx eslint --print-config electron/main.ts
```

❌ **Incorrect**: Point at compiled JavaScript
```bash
npx eslint --print-config dist-electron/electron/main.js
```

**Reason**: 
- ESLint configuration is designed for source files
- TypeScript-specific rules require source analysis
- Compiled output lacks type information
- Source maps and debugging work better with source files

### Project Structure Considerations

The Uptime-Watcher project has distinct areas with different linting needs:

1. **Electron Main Process** (`electron/`): Node.js environment, no DOM
2. **Electron Renderer** (`src/`): Browser environment, React, DOM APIs
3. **Shared Code** (`shared/`): Isomorphic TypeScript utilities
4. **Configuration Files**: Various formats (TS, JS, JSON, YAML)

Each area may benefit from different ESLint rule configurations.

## Monitoring and Future Updates

### Watch for eslint-find-rules Updates
```bash
npm info eslint-find-rules
```

### Alternative Tools to Consider
- `@eslint/config-inspector` (official when available)
- Custom scripts for rule coverage analysis
- CI/CD integration for configuration validation

## Common Use Cases

### Finding Missing TypeScript Rules
1. Review [typescript-eslint recommended rules](https://typescript-eslint.io/rules/)
2. Compare against current configuration in `eslint.config.mjs`
3. Test new rules with specific files:
   ```bash
   npx eslint --rule '{"@typescript-eslint/prefer-nullish-coalescing": "warn"}' electron/main.ts
   ```

### Identifying Unused Rules
1. Generate current config: `npm run eslint:config-check`
2. Review the JSON output for active rules
3. Cross-reference with ESLint documentation

### Testing Configuration Changes
```bash
# Test specific rule changes
npx eslint --rule '{"no-console": "error"}' electron/main.ts

# Test configuration file changes
npx eslint --config ./test-eslint.config.mjs electron/main.ts
```

## Migration Path

When `eslint-find-rules` becomes compatible with ESLint 9:

1. **Update the package**: `npm update eslint-find-rules`
2. **Test compatibility**: `npx eslint-find-rules --help`
3. **Update scripts** in `package.json`:
   ```json
   "eslint-find-option-rules": "eslint-find-rules electron/main.ts --include deprecated"
   ```
4. **Update this documentation**

## Troubleshooting

### Configuration Not Loading
```bash
npx eslint --debug electron/main.ts
```

### Rule Conflicts
```bash
npx eslint --print-config electron/main.ts | jq '.rules'
```

### Performance Issues
```bash
npx eslint --stats electron/main.ts
```

## Contributing

When modifying ESLint configuration:
1. Test changes with `npm run lint`
2. Verify configuration: `npm run eslint:config-check`
3. Update this documentation if needed
4. Run full test suite: `npm test`