# ESLint Rule Organizer Scripts

This directory contains scripts for organizing and maintaining ESLint configuration files.

## sort-eslint-rules.mjs / sort-eslint-rules.ts

Sorts ESLint rules by plugin prefix within each files section to improve readability and maintainability of the ESLint configuration file.

### Features

✅ **Plugin Grouping**: Groups rules by plugin prefix (e.g., `@typescript-eslint/`, `react/`, etc.)  
✅ **Alphabetical Sorting**: Sorts rules alphabetically within each plugin group  
✅ **Structure Preservation**: Preserves all configuration sections and their structure  
✅ **Section Comments**: Adds helpful section comments for better navigation  
✅ **Format Maintenance**: Maintains original formatting and comments where possible

### Usage

#### Via npm script (recommended):

```bash
npm run sort-eslint-rules
```

#### Direct execution:

```bash
# JavaScript version
node scripts/sort-eslint-rules.mjs

# TypeScript version (if tsx is available)
npx tsx scripts/sort-eslint-rules.ts
```

### Help

```bash
node scripts/sort-eslint-rules.mjs --help
npx tsx scripts/sort-eslint-rules.ts --help
```

### What it does

The script will:

1. 📖 Read the `eslint.config.mjs` file
2. ⚙️ Process each configuration section with rules
3. 📝 Group rules by plugin (React, TypeScript, Unicorn, etc.)
4. 🔄 Sort rules alphabetically within each group
5. 💬 Add clear section comments for each plugin group
6. 💾 Write the organized configuration back to the file

### Example transformation

**Before:**

```javascript
rules: {
    "unicorn/prefer-module": "error",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
    "unicorn/prevent-abbreviations": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/function-component-definition": ["error", { namedComponents: "arrow-function" }],
}
```

**After:**

```javascript
rules: {
    // TypeScript
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",

    // React
    "react/function-component-definition": ["error", { namedComponents: "arrow-function" }],
    "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],

    // Unicorn
    "unicorn/prefer-module": "error",
    "unicorn/prevent-abbreviations": "off",
}
```

### Safety

⚠️ **Important**: The script modifies `eslint.config.mjs` in place. Make sure your changes are committed to version control before running the script.

The script includes error handling and will warn you if it cannot process a section, leaving it unchanged rather than breaking your configuration.

### Supported Plugins

The script recognizes and properly groups rules from 30+ ESLint plugins including:

- Core ESLint rules
- TypeScript (`@typescript-eslint`)
- React (`react`, `react-hooks`, `jsx-a11y`)
- Import management (`import-x`)
- Code quality (`unicorn`, `sonarjs`, `perfectionist`)
- Security (`security`, `no-unsanitized`)
- Testing (`vitest`, `testing-library`)
- And many more...

### Development

The scripts are available in both JavaScript and TypeScript versions:

- `sort-eslint-rules.mjs` - Standalone JavaScript version
- `sort-eslint-rules.ts` - TypeScript version with better type safety

Both scripts provide the same functionality and can be used interchangeably.
