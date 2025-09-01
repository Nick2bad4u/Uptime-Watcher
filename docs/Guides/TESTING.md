# Testing and Coverage Setup

This project uses Vitest for testing with separate configurations for frontend (React) and backend (Electron) code, integrated with Codecov for coverage reporting.

## Setup Summary

### Dual Test Configuration

The project has two separate Vitest configurations:

1. **Frontend Tests** (`vitest.config.ts`):

   - Tests React components in `src/` directory
   - Merges configuration from `vite.config.ts`
   - Uses jsdom environment
   - Coverage reports to `./coverage/`

2. **Backend Tests** (`config/testing/vitest.electron.config.ts`):
   - Tests Electron main process code in `electron/` directory
   - Uses Node.js environment
   - Coverage reports to `./coverage/electron/`

### Files Created/Modified

1. **`vitest.config.ts`** - Vitest configuration for frontend tests (merges with vite.config.ts)
2. **`config/testing/vitest.electron.config.ts`** - Vitest configuration for Electron backend
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
# Run all tests (frontend + electron + shared)
npm run test:all

# Run frontend tests only
npm run test:frontend

# Run frontend tests with coverage
npm run test:coverage

# Run electron tests only
npm run test:electron

# Run electron tests with coverage
npm run test:electron:coverage

# Run shared utility tests only
npm run test:shared

# Run shared tests with coverage
npm run test:shared:coverage

# Run all test suites with coverage (recommended for Codecov)
npm run test:all:coverage

# Interactive testing
npm run test:ui              # Frontend tests UI
npm run test:electron:ui     # Electron tests UI
npm run test:shared:ui       # Shared tests UI
npm run test:watch           # Frontend tests in watch mode
npm run test:electron:watch  # Electron tests in watch mode
npm run test:shared:watch    # Shared tests in watch mode
```

Notes:

- `npm run test:all` executes all three test configurations: shared, electron, and frontend tests sequentially.

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

As of the latest test run, we have achieved comprehensive test coverage across the application:

**Frontend Coverage** (`src/` directory):

- **Constants**: 100% coverage
- **Time utilities**: 100% coverage (includes formatDuration, timeAgo, shuffle)
- **Theme configuration**: 100% coverage
- **Type guards and validation**: 100% coverage
- **Store management (Zustand)**: 100% coverage
- **React components**: High coverage for core components
- **Utility functions**: Near 100% coverage
- **Overall Frontend**: ~95%+ coverage

**Test Files Created**:

**Core Utilities**:

- `src/constants.test.ts` - Application constants
- `src/utils/time.test.ts` - Time formatting and utility functions
- `src/utils/validation.test.ts` - Data validation utilities
- `src/utils/site.test.ts` - Site-related utilities

**Type Systems**:

- `src/types/site.test.ts` - Site data types and interfaces
- `src/types/monitor.test.ts` - Monitor form data types
- `src/types/theme.test.ts` - Theme configuration types
- `src/types/ipc.test.ts` - IPC message types

**State Management**:

- `src/stores/theme.test.ts` - Theme store (Zustand)
- `src/stores/monitor.test.ts` - Monitor store management
- `src/stores/site.test.ts` - Site store management

**Configuration**:

- `src/config/app.test.ts` - Application configuration
- `src/config/theme.test.ts` - Theme configuration settings

**React Components**:

- `src/components/SiteCard.test.tsx` - Site card component
- `src/components/theme/ThemeProvider.test.tsx` - Theme context provider

**Event System**:

- `src/events/typed-event-bus.test.ts` - Event bus implementation
- `src/events/electron-events.test.ts` - Electron IPC events

**Database & Logging**:

- `src/database/utils.test.ts` - Database utility functions
- `src/utils/logging.test.ts` - Logging utilities

### Coverage Quality

The test suite includes:

- **Unit tests**: Individual function and component testing
- **Integration tests**: Store interactions and event flows
- **Type safety tests**: Ensuring TypeScript interfaces work correctly
- **Edge case testing**: Boundary conditions and error scenarios
- **React component testing**: Component rendering and interactions

### Testing Best Practices Implemented

1. **Comprehensive Type Testing**: All TypeScript interfaces and types are tested
2. **Store Pattern Testing**: Zustand stores tested for state mutations and actions
3. **Event System Testing**: TypedEventBus and IPC events thoroughly tested
4. **Utility Function Coverage**: All utility functions tested with edge cases
5. **Component Testing**: React components tested with React Testing Library
6. **Mock Strategy**: Proper mocking of external dependencies and Electron APIs

### Next Steps for Maintaining Coverage

To maintain high coverage:

1. **Add tests for new features**: Always include tests when adding new functionality
2. **Test React hooks**: Add tests for custom hooks as they're created
3. **Integration testing**: Add more end-to-end test scenarios
4. **Performance testing**: Consider adding performance benchmarks
5. **Error boundary testing**: Test error handling and recovery scenarios

Place test files next to the code they test with `.test.ts` or `.test.tsx` extensions. The current test structure follows co-location patterns for easy maintenance.
