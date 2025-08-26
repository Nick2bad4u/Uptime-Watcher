# TypeScript to .mts Migration Script

## Overview

This script automates the conversion of TypeScript files from `.ts` to `.mts` extension while updating all import statements to use `.mjs` extensions for local files.

## Features

✅ **Safe file renaming**: `.ts` → `.mts`
✅ **Smart import updating**: Local imports get `.mjs` extension
✅ **Preserves npm packages**: React, Node.js built-ins, etc. remain unchanged
✅ **Multiple import syntaxes**: Handles `import`, `import type`, dynamic imports, and `export from`
✅ **Backup creation**: Automatic backup of original files
✅ **Dry run mode**: Preview changes before applying
✅ **Path alias support**: Works with `@shared/`, `@electron/`, `@app/` aliases

## Files

- **`scripts/migrate-to-mts-simple.mjs`** - Main migration script (robust, tested)
- **`test/sample-file.ts`** - Test file with various import patterns

## Usage

### Basic Migration
```bash
node scripts/migrate-to-mts-simple.mjs path/to/file.ts
```

### Preview Changes (Dry Run)
```bash
node scripts/migrate-to-mts-simple.mjs path/to/file.ts --dry-run
```

### Skip Backup Creation
```bash
node scripts/migrate-to-mts-simple.mjs path/to/file.ts --no-backup
```

### Help
```bash
node scripts/migrate-to-mts-simple.mjs --help
```

## What It Changes

### ✅ Local Imports (Updated)
- `'./service'` → `'./service.mjs'`
- `'../types/config.ts'` → `'../types/config.mjs'`
- `'@shared/utils'` → `'@shared/utils.mjs'`
- `'@electron/main'` → `'@electron/main.mjs'`

### ❌ External Imports (Unchanged)
- `'react'` → `'react'` *(npm package)*
- `'node:fs'` → `'node:fs'` *(Node.js built-in)*
- `'lodash'` → `'lodash'` *(npm package)*

### Supported Import Syntaxes
```typescript
// Standard imports
import { Service } from './service';           → './service.mjs'
import type { Config } from '../types';       → '../types.mjs'

// Dynamic imports
const module = await import('./helper');      → './helper.mjs'

// Export from
export { Type } from './types';               → './types.mjs'
export * from '../base';                     → '../base.mjs'

// Different quote styles
import { helper } from "./utils";             → "./utils.mjs"
import config from `./config`;               → `./config.mjs`
```

## Example Migration

**Before (`sample.ts`):**
```typescript
import { DatabaseService } from './database/DatabaseService';
import type { SiteConfig } from '../types/site';
import { logger } from '@shared/utils/logger';
import React from 'react';

const helper = await import('./utils/helper');
export { Type } from './types/common';
```

**After (`sample.mts`):**
```typescript
import { DatabaseService } from './database/DatabaseService.mjs';
import type { SiteConfig } from '../types/site.mjs';
import { logger } from '@shared/utils/logger.mjs';
import React from 'react';

const helper = await import('./utils/helper.mjs');
export { Type } from './types/common.mjs';
```

## Safety Features

- **Automatic backups**: Original files saved as `.backup`
- **Dry run mode**: Preview all changes before applying
- **Path validation**: Only processes `.ts` and `.tsx` files
- **Smart detection**: Distinguishes local vs npm imports
- **Error handling**: Clear error messages and recovery

## Batch Migration Example

To migrate multiple files:
```bash
# Create a simple batch script
for file in electron/*.ts; do
    node scripts/migrate-to-mts-simple.mjs "$file"
done
```

## Next Steps After Migration

1. **Update TypeScript config** to handle `.mts` files:
   ```json
   {
     "compilerOptions": {
       "allowImportingTsExtensions": true,
       "noEmit": false
     },
     "include": ["**/*.mts", "**/*.ts"]
   }
   ```

2. **Update build scripts** to output `.mjs`:
   ```json
   {
     "scripts": {
       "build": "tsc --outExt .mjs"
     }
   }
   ```

3. **Update package.json** main entry:
   ```json
   {
     "main": "dist-electron/electron/main.mjs",
     "type": "module"
   }
   ```

## Testing

The script has been thoroughly tested with:
- ✅ Various import syntaxes
- ✅ Different quote styles
- ✅ Path aliases
- ✅ npm vs local import detection
- ✅ File renaming and backup creation
- ✅ Edge cases and error handling

## Troubleshooting

**File not found**: Ensure the file path is correct and the file exists
**Permission denied**: Check file permissions and ensure the file isn't open in an editor
**No changes made**: File may already use `.mjs` imports or only contain npm imports

## Why This Script?

This script solves the publint warnings about ESM files being interpreted as CJS by:
1. Using `.mts` extension for source files (explicit ESM)
2. Updating imports to use `.mjs` for compiled output
3. Maintaining compatibility with your existing architecture

The script is robust, tested, and ready for production use! 🚀
