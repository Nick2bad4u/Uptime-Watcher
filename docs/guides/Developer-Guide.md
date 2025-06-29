<!-- markdownlint-disable -->

# 🚀 Uptime Watcher - Developer Guide

> **Navigation:** [📖 Docs Home](../README) » [📘 Guides](../README.md#guides) » **Developer Guide**

## 🚀 Getting Started

### ⚡ Quick Start (5 minutes)

```bash
# 1. Clone and setup
git clone https://github.com/your-username/uptime-watcher.git
cd uptime-watcher
npm install

# 2. Download dependencies
npm run download-sqlite3-wasm

# 3. Start development
npm run dev        # Terminal 1: Frontend
npm run dev:electron   # Terminal 2: Electron app
```

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Git** for version control
- **TypeScript** knowledge (the project is fully TypeScript)

### Installation

1. **Clone the repository:**

  ```bash
  git clone https://github.com/your-username/uptime-watcher.git
  cd uptime-watcher
  ```

2. **Install dependencies:**

  ```bash
  npm install
  ```

3. **Download SQLite WASM:**

  ```bash
  npm run download-sqlite3-wasm
  ```

4. **Start development server:**

  ```bash
  npm run dev
  ```

--------------------------------------------------------------------------------

## 🏗️ Project Structure

```text
uptime-watcher/
├── electron/                    # Backend (Electron main process)
│   ├── services/               # Modular service architecture
│   │   ├── application/        # App coordination services
│   │   ├── database/          # Data persistence layer
│   │   ├── monitoring/        # Site monitoring logic
│   │   ├── ipc/              # Inter-process communication
│   │   ├── window/           # Window management
│   │   ├── notifications/    # User notifications
│   │   └── updater/         # Auto-update functionality
│   ├── main.ts              # Electron entry point
│   ├── preload.ts           # IPC bridge
│   └── utils/               # Shared utilities
├── src/                     # Frontend (React renderer process)
│   ├── components/          # React components
│   │   ├── AddSiteForm/     # Site creation interface
│   │   ├── Dashboard/       # Main dashboard view
│   │   ├── SiteDetails/     # Site detail modal
│   │   ├── Header/          # App header
│   │   ├── Settings/        # Settings interface
│   │   └── common/          # Shared components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Frontend services
│   ├── theme/               # Theme system
│   ├── utils/               # Frontend utilities
│   ├── store.ts             # Zustand state management
│   ├── types.ts             # TypeScript definitions
│   └── constants.ts         # App constants
├── docs/                    # Documentation
├── public/                  # Static assets
├── release/                 # Build artifacts
└── scripts/                 # Build and utility scripts
```

--------------------------------------------------------------------------------

## 🛠️ Development Workflow

### Available Scripts

```bash
# Development
npm run dev                  # Start Vite dev server
npm run dev:electron        # Start Electron in development mode

# Building
npm run build               # Build for production
npm run build:electron      # Build Electron main process
npm run dist               # Create distributable packages

# Utilities
npm run download-sqlite3-wasm  # Download SQLite WASM files
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript compiler
```

### Development Mode

1. **Start the renderer process:**

  ```bash
  npm run dev
  ```

2. **In another terminal, start Electron:**

  ```bash
  npm run dev:electron
  ```

The app will hot-reload when you make changes to the frontend code.

--------------------------------------------------------------------------------

## 🎯 Architecture Overview

### Backend Architecture

The backend follows a **service-oriented architecture**:

- **Services:** Focused business logic modules
- **Repositories:** Data access abstraction layer
- **Factory Pattern:** Extensible monitor creation
- **IPC Layer:** Communication with frontend

### Frontend Architecture

The frontend uses **React with hooks**:

- **Zustand:** Lightweight state management
- **Custom Hooks:** Reusable logic abstraction
- **Component Composition:** Modular UI components
- **Theme System:** Consistent styling across themes

### Data Flow

```text
User Action → Frontend Component → Store Action → IPC → Backend Service → Database
                                                                              ↓
Frontend Component ← Store Update ← IPC Response ← Service Response ← Database Result
```

--------------------------------------------------------------------------------

## 🔧 Development Patterns

### Backend Service Pattern

```typescript
// Example service structure
export class SiteRepository {
  constructor(private db: DatabaseService) {}

  async createSite(site: CreateSiteRequest): Promise<Site> {
    // Implementation
  }

  async updateSite(id: string, updates: UpdateSiteRequest): Promise<Site> {
    // Implementation
  }
}
```

### Frontend Component Pattern

```typescript
// Example component structure
export const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  const { state, action } = useStore();
  const { theme } = useTheme();

  return (
    <ThemedBox>
      {/* Component content */}
    </ThemedBox>
  );
};
```

### Custom Hook Pattern

```typescript
// Example custom hook
export const useMyFeature = () => {
  const [localState, setLocalState] = useState();
  const { globalState, globalAction } = useStore();

  const derivedValue = useMemo(() => {
    // Computation
  }, [dependencies]);

  return {
    localState,
    derivedValue,
    actions: {
      localAction: setLocalState,
      globalAction
    }
  };
};
```

--------------------------------------------------------------------------------

## 🎨 Styling Guidelines

### Theme System

The app uses a comprehensive theme system:

```typescript
// Using theme in components
const { theme, isDark, toggleTheme } = useTheme();

// Theme-aware styling
const styles = {
  background: theme.colors.background,
  text: theme.colors.text,
  border: theme.colors.border
};
```

### Themed Components

Always use themed components for consistency:

```typescript
import { ThemedBox, ThemedText, ThemedButton } from '../theme/components';

// ✅ Good
<ThemedBox>
  <ThemedText>Content</ThemedText>
  <ThemedButton onClick={handler}>Action</ThemedButton>
</ThemedBox>

// ❌ Avoid
<div className="custom-styling">
  <span>Content</span>
  <button onClick={handler}>Action</button>
</div>
```

--------------------------------------------------------------------------------

## 🧪 Testing

### Testing Structure

```text
__tests__/
├── components/          # Component tests
├── services/           # Service layer tests
├── utils/             # Utility function tests
└── integration/       # Integration tests
```

### Testing Patterns

```typescript
// Component testing
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

// Service testing
import { SiteRepository } from './SiteRepository';

test('creates site successfully', async () => {
  const repo = new SiteRepository(mockDb);
  const result = await repo.createSite(mockSite);
  expect(result).toMatchObject(expectedSite);
});
```

--------------------------------------------------------------------------------

## 📝 Code Standards

### TypeScript

- **Strict Mode:** Always enabled
- **Explicit Types:** Avoid `any`, use proper types
- **Interface First:** Define interfaces before implementation
- **Generic Types:** Use generics for reusable code

```typescript
// ✅ Good
interface CreateSiteRequest {
  url: string;
  name?: string;
  monitorType: MonitorType;
}

async function createSite(request: CreateSiteRequest): Promise<Site> {
  // Implementation
}

// ❌ Avoid
async function createSite(request: any): Promise<any> {
  // Implementation
}
```

### React Components

- **Functional Components:** Use hooks instead of classes
- **Props Interface:** Always define prop interfaces
- **Memo for Performance:** Use React.memo for expensive components
- **Error Boundaries:** Wrap components that might fail

```typescript
// ✅ Good
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = React.memo(({ title, onAction }) => {
  // Implementation
});

// ❌ Avoid
export const MyComponent = ({ title, onAction }) => {
  // Implementation
};
```

--------------------------------------------------------------------------------

## 🔍 Debugging

### Frontend Debugging

- **React DevTools:** Use browser extension for component inspection
- **Zustand DevTools:** Monitor state changes in real-time
- **Console Logging:** Use structured logging with log levels

### Backend Debugging

- **Electron DevTools:** Access main process debugging
- **Database Inspector:** SQLite browser tools
- **IPC Monitoring:** Log IPC communication for debugging

### Common Issues

1. **IPC Communication Errors:**

- Check preload script is loaded
- Verify IPC channel names match
- Ensure proper error handling

2. **Database Issues:**

- Check SQLite WASM is downloaded
- Verify database file permissions
- Monitor SQL query logs

3. **Theme Issues:**

- Ensure components use themed variants
- Check theme context is provided
- Verify CSS custom properties

--------------------------------------------------------------------------------

## 🚀 Building & Deployment

### Build Process

1. **Frontend Build:**

  ```bash
  npm run build
  ```

2. **Backend Build:**

  ```bash
  npm run build:electron
  ```

3. **Create Distribution:**

  ```bash
  npm run dist
  ```

### Distribution Files

- **Windows:** `.exe` installer and portable versions
- **macOS:** `.dmg` and `.app` bundle
- **Linux:** `.AppImage`, `.deb`, and `.rpm` packages

--------------------------------------------------------------------------------

## 📚 Additional Resources

### Documentation

- **[📚 API Reference](../api/README):** Complete API documentation for all modules
- **[🏗️ Architecture Guide](../architecture/Project-Architecture-Guide.copilotmd):** System design and architecture patterns
- **[🧩 Component Docs](../component-docs/Dashboard):** UI component documentation
- **[📖 User Guides](../README.md#guides):** Additional development guides

### External Resources

- **Electron Documentation:** <https://electronjs.org/docs>
- **React Documentation:** <https://reactjs.org/docs>
- **Zustand Guide:** <https://github.com/pmndrs/zustand>
- **TypeScript Handbook:** <https://typescriptlang.org/docs>

--------------------------------------------------------------------------------

## 🤝 Contributing

### Getting Help

- **GitHub Issues:** Report bugs and request features
- **Discussions:** Ask questions and share ideas
- **Documentation:** Check existing docs before asking

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with tests
4. **Update** documentation if needed
5. **Submit** a pull request

### Code Review Checklist

- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Code follows project conventions
- [ ] Documentation is updated
- [ ] Performance impact considered

--------------------------------------------------------------------------------

## 📞 Support

For development questions or issues:

1. **Check Documentation:** Review relevant docs first
2. **Search Issues:** Look for existing GitHub issues
3. **Create Issue:** Open a new issue with details
4. **Ask Community:** Use GitHub discussions for general questions

--------------------------------------------------------------------------------

_Happy coding! 🎉_

## See Also

- [📚 API Reference](../api/README) - Complete module documentation
- [🏗️ Architecture Guide](../architecture/Project-Architecture-Guide.copilotmd) - System design patterns
- [🧩 Component Documentation](../component-docs/README) - UI component guides
- [🔧 Troubleshooting Guide](Troubleshooting) - Common issues and solutions
- [🎨 Theme Usage Guide](Theme-Usage) - Theming and styling
- [✅ Validation Guide](Validator) - Input validation patterns

---

> **Related:** [📖 Documentation Home](../README) | [📘 All Guides](../README.md#guides)
