# Testing and Coverage Setup

This project uses Vitest for testing and V8 for coverage collection, integrated with Codecov for coverage reporting.

## Setup Summary

### Files Created/Modified

1. **`vite.config.ts`** - Vitest configuration with coverage settings
2. **`src/test/setup.ts`** - Test setup file for React components
3. **`.github/workflows/codecov.yml`** - GitHub Actions workflow for Codecov
4. **Test files**:
   - `src/constants.test.ts` - Tests for application constants
   - `src/utils/time.test.ts` - Tests for time utility functions

### Coverage Configuration

- **Provider**: V8 (fast and accurate)
- **Reporters**: text, json, lcov (for Codecov)
- **Environment**: jsdom (for React component testing)
- **Excludes**: Electron main process, build artifacts, configuration files

### Commands

```bash
# Run tests
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Coverage Reports

Coverage reports are generated in the `./coverage` directory:

- `lcov.info` - For Codecov integration
- `coverage-final.json` - JSON coverage data
- `lcov-report/` - HTML coverage report

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
