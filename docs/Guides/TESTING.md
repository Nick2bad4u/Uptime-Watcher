# Testing and Coverage Setup

This project uses Vitest for testing with separate configurations for frontend (React) and backend (Electron) code, integrated with Codecov for coverage reporting.

## Setup Summary

### Dual Test Configuration

The project has two separate Vitest configurations:

1. **Frontend Tests** (`vite.config.ts`):
   - Tests React components in `src/` directory
   - Uses jsdom environment
   - Coverage reports to `./coverage/`

2. **Backend Tests** (`vitest.electron.config.ts`):
   - Tests Electron main process code in `electron/` directory
   - Uses Node.js environment
   - Coverage reports to `./coverage/electron/`

### Files Created/Modified

1. **`vite.config.ts`** - Vitest configuration for frontend with coverage settings
2. **`vitest.electron.config.ts`** - Vitest configuration for Electron backend
3. **`codecov.yml`** - Codecov configuration for multi-flag reporting
4. **`src/test/setup.ts`** - Test setup file for React components
5. **`electron/test/setup.ts`** - Test setup file for Electron tests
6. **`.github/workflows/codecov.yml`** - GitHub Actions workflow for dual coverage upload
7. **Test files**:
   - `src/constants.test.ts` - Tests for application constants
   - `src/utils/time.test.ts` - Tests for time utility functions

### Coverage Configuration

- **Provider**: V8 (fast and accurate)
- **Reporters**: text, json, lcov, html (for Codecov and local viewing)
- **Environments**:
  - jsdom (for React component testing)
  - node (for Electron backend testing)
- **Codecov Flags**:
  - `frontend` - for React/src code coverage
  - `electron` - for Electron/backend code coverage
- **Excludes**: Electron main process, build artifacts, configuration files

### Commands

```bash
# Run frontend tests only
npm run test

# Run frontend tests with coverage
npm run test:coverage

# Run electron tests only
npm run test:electron

# Run electron tests with coverage
npm run test:electron:coverage

# Run both frontend and electron tests
npm run test:all

# Run both test suites with coverage (recommended for Codecov)
npm run test:all:coverage
npm run test:codecov

# Interactive testing
npm run test:ui                    # Frontend tests UI
npm run test:electron:ui           # Electron tests UI
npm run test:watch                 # Frontend tests in watch mode
npm run test:electron:watch        # Electron tests in watch mode
```

### Coverage Reports

Coverage reports are generated in separate directories:

**Frontend Coverage** (`./coverage/`):

- `lcov.info` - For Codecov integration (frontend flag)
- `coverage-final.json` - JSON coverage data
- `index.html` - HTML coverage report

**Electron Coverage** (`./coverage/electron/`):

- `lcov.info` - For Codecov integration (electron flag)
- `coverage-final.json` - JSON coverage data
- `index.html` - HTML coverage report

### Codecov Integration

The project uses Codecov flags to separate frontend and backend coverage:

- **frontend** flag: Covers `src/` directory (React components, utilities)
- **electron** flag: Covers `electron/` directory (main process, services)

Both reports are automatically merged by Codecov to provide a complete picture of your application's test coverage.

### GitHub Actions

The workflow runs on:

- Push to main/master branches
- Pull requests to main/master branches

The workflow:

1. Installs dependencies
2. Runs tests with coverage
3. Uploads coverage to Codecov

### Current Coverage

- **Constants**: 100% coverage
- **Time utilities**: ~61% coverage (partial)
- **Overall**: Low coverage as we're just starting (this is expected)

### Next Steps

To improve coverage, add more test files for:

- React components
- Custom hooks
- Store/state management
- Other utility functions

Place test files next to the code they test with `.test.ts` or `.test.tsx` extensions.
