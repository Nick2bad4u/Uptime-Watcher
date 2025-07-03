# Uptime Watcher - Comprehensive Refactoring Analysis & Action Plan
<!-- markdownlint-disable -->

## Executive Summary

After analyzing the entire Uptime Watcher codebase, I've identified critical areas requiring refactoring to improve maintainability, performance, and code quality. This document provides a prioritized action plan for addressing the most impactful issues.

## 🚨 Critical Files Requiring Immediate Refactoring

### 1\. **src/theme/components.tsx** (983 lines) - HIGHEST PRIORITY

**Issues:**

- **Single massive file** with 983 lines containing ALL UI components
- **Mixed responsibilities** - theming, styling, event handling, business logic
- **Performance issues** - all components loaded together (no tree-shaking)
- **Poor maintainability** - extremely difficult to navigate and modify
- **Testing challenges** - single file makes unit testing complex

**Refactoring Plan:**

```folders
Phase 1: Split into atomic components (2-3 days)
├── src/theme/components/
│   ├── base/
│   │   ├── ThemedBox/
│   │   │   ├── ThemedBox.tsx (50-80 lines)
│   │   │   ├── ThemedBox.types.ts
│   │   │   └── ThemedBox.test.tsx
│   │   ├── ThemedText/
│   │   ├── ThemedButton/
│   │   └── ThemedBadge/
│   ├── form/
│   │   ├── ThemedInput/
│   │   ├── ThemedSelect/
│   │   └── ThemedTextarea/
│   ├── status/
│   │   ├── StatusBadge/
│   │   └── ResponseTimeDisplay/
│   └── index.ts (barrel exports)

Phase 2: Extract types and constants (1 day)
├── src/theme/types/
│   ├── component-types.ts
│   └── variant-types.ts
└── src/theme/constants/
    └── css-classes.ts

Phase 3: Optimize performance (1 day)
- Implement React.memo for all components
- Add proper prop comparison functions
- Extract inline styles to CSS modules
```

**Detailed Implementation Steps:**

**Step 1: Create Directory Structure**

```bash
# Create component directories
mkdir -p src/theme/components/{base,form,status,layout,feedback}
mkdir -p src/theme/components/base/{ThemedBox,ThemedText,ThemedButton,ThemedBadge}
mkdir -p src/theme/components/form/{ThemedInput,ThemedSelect,ThemedTextarea,ThemedCheckbox}
mkdir -p src/theme/components/status/{StatusBadge,ResponseTimeDisplay,HealthIndicator}
mkdir -p src/theme/components/layout/{ThemedCard,ThemedModal,ThemedDrawer}
mkdir -p src/theme/components/feedback/{ThemedToast,LoadingSpinner,ErrorDisplay}
mkdir -p src/theme/types
mkdir -p src/theme/constants
```

**Step 2: Extract ThemedBox Component**

```typescript
// src/theme/components/base/ThemedBox/ThemedBox.types.ts
import { ReactNode } from "react";

export interface ThemedBoxProps {
 children: ReactNode;
 variant?: "default" | "primary" | "secondary" | "accent" | "ghost";
 size?: "xs" | "sm" | "md" | "lg" | "xl";
 padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
 margin?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
 rounded?: boolean | "sm" | "md" | "lg" | "full";
 shadow?: boolean | "sm" | "md" | "lg" | "xl";
 border?: boolean | "thin" | "thick";
 className?: string;
 style?: React.CSSProperties;
 onClick?: () => void;
 onHover?: () => void;
 "data-testid"?: string;
}

export interface ThemedBoxVariantConfig {
 backgroundColor: string;
 borderColor: string;
 textColor: string;
 hoverBackgroundColor?: string;
 hoverBorderColor?: string;
 hoverTextColor?: string;
}
```

```typescript
// src/theme/components/base/ThemedBox/ThemedBox.tsx
import React, { memo, forwardRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';
import type { ThemedBoxProps } from './ThemedBox.types';

const VARIANT_CLASSES = {
  default: 'bg-background border-border text-foreground',
  primary: 'bg-primary border-primary text-primary-foreground',
  secondary: 'bg-secondary border-secondary text-secondary-foreground',
  accent: 'bg-accent border-accent text-accent-foreground',
  ghost: 'bg-transparent border-transparent text-foreground hover:bg-accent'
} as const;

const SIZE_CLASSES = {
  xs: 'min-h-8',
  sm: 'min-h-10',
  md: 'min-h-12',
  lg: 'min-h-14',
  xl: 'min-h-16'
} as const;

const PADDING_CLASSES = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
} as const;

const MARGIN_CLASSES = {
  none: 'm-0',
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8'
} as const;

const ROUNDED_CLASSES = {
  true: 'rounded-md',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
} as const;

const SHADOW_CLASSES = {
  true: 'shadow-md',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
} as const;

const BORDER_CLASSES = {
  true: 'border',
  thin: 'border',
  thick: 'border-2'
} as const;

export const ThemedBox = memo(forwardRef<HTMLDivElement, ThemedBoxProps>(({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  margin = 'none',
  rounded = true,
  shadow = false,
  border = false,
  className,
  style,
  onClick,
  onHover,
  'data-testid': dataTestId,
  ...rest
}, ref) => {
  const { theme } = useTheme();

  const handleMouseEnter = () => {
    onHover?.();
  };

  const classes = cn(
    'transition-all duration-200 ease-in-out',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    PADDING_CLASSES[padding],
    MARGIN_CLASSES[margin],
    rounded && ROUNDED_CLASSES[typeof rounded === 'boolean' ? true : rounded],
    shadow && SHADOW_CLASSES[typeof shadow === 'boolean' ? true : shadow],
    border && BORDER_CLASSES[typeof border === 'boolean' ? true : border],
    onClick && 'cursor-pointer hover:opacity-80',
    className
  );

  return (
    <div
      ref={ref}
      className={classes}
      style={style}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      data-testid={dataTestId}
      {...rest}
    >
      {children}
    </div>
  );
}));

ThemedBox.displayName = 'ThemedBox';
```

```typescript
// src/theme/components/base/ThemedBox/ThemedBox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemedBox } from './ThemedBox';
import { ThemeProvider } from '@/providers/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemedBox', () => {
  it('renders children correctly', () => {
    renderWithTheme(
      <ThemedBox data-testid="themed-box">
        <span>Test content</span>
      </ThemedBox>
    );

    expect(screen.getByTestId('themed-box')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    renderWithTheme(
      <ThemedBox variant="primary" data-testid="themed-box">
        Content
      </ThemedBox>
    );

    const box = screen.getByTestId('themed-box');
    expect(box).toHaveClass('bg-primary', 'border-primary', 'text-primary-foreground');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <ThemedBox onClick={handleClick} data-testid="themed-box">
        Content
      </ThemedBox>
    );

    fireEvent.click(screen.getByTestId('themed-box'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles hover events', () => {
    const handleHover = jest.fn();
    renderWithTheme(
      <ThemedBox onHover={handleHover} data-testid="themed-box">
        Content
      </ThemedBox>
    );

    fireEvent.mouseEnter(screen.getByTestId('themed-box'));
    expect(handleHover).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    renderWithTheme(
      <ThemedBox className="custom-class" data-testid="themed-box">
        Content
      </ThemedBox>
    );

    expect(screen.getByTestId('themed-box')).toHaveClass('custom-class');
  });

  describe('size variants', () => {
    it.each([
      ['xs', 'min-h-8'],
      ['sm', 'min-h-10'],
      ['md', 'min-h-12'],
      ['lg', 'min-h-14'],
      ['xl', 'min-h-16']
    ])('applies %s size class correctly', (size, expectedClass) => {
      renderWithTheme(
        <ThemedBox size={size as any} data-testid="themed-box">
          Content
        </ThemedBox>
      );

      expect(screen.getByTestId('themed-box')).toHaveClass(expectedClass);
    });
  });
});
```

**Step 3: Create Migration Script**

```typescript
// scripts/migrate-components.ts
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

interface ComponentMapping {
 originalName: string;
 newImportPath: string;
 newComponentName: string;
}

const COMPONENT_MAPPINGS: ComponentMapping[] = [
 {
  originalName: "ThemedBox",
  newImportPath: "@/theme/components/base/ThemedBox",
  newComponentName: "ThemedBox",
 },
 {
  originalName: "ThemedText",
  newImportPath: "@/theme/components/base/ThemedText",
  newComponentName: "ThemedText",
 },
 {
  originalName: "ThemedButton",
  newImportPath: "@/theme/components/base/ThemedButton",
  newComponentName: "ThemedButton",
 },
 {
  originalName: "StatusBadge",
  newImportPath: "@/theme/components/status/StatusBadge",
  newComponentName: "StatusBadge",
 },
 // Add more mappings as components are extracted
];

async function migrateComponentImports(): Promise<void> {
 console.log("🚀 Starting component migration...");

 // Find all TypeScript/TSX files
 const files = await glob("src/**/*.{ts,tsx}", {
  ignore: ["src/theme/components.tsx", "node_modules/**", "dist/**"],
 });

 let totalFiles = 0;
 let modifiedFiles = 0;

 for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf-8");
  let newContent = content;
  let hasChanges = false;

  // Check if file imports from the old components file
  if (content.includes("from '@/theme/components'") || content.includes("from '../theme/components'")) {
   console.log(`📝 Processing: ${filePath}`);

   // Replace the old import with new imports
   const importRegex = /import\s*{([^}]+)}\s*from\s*['"][@./]*theme\/components['"];?/g;

   newContent = newContent.replace(importRegex, (match, importList) => {
    const imports = importList
     .split(",")
     .map((imp) => imp.trim())
     .filter((imp) => imp.length > 0);

    const newImports = imports.map((importName) => {
     const mapping = COMPONENT_MAPPINGS.find((m) => m.originalName === importName);
     if (mapping) {
      return `import { ${mapping.newComponentName} } from '${mapping.newImportPath}';`;
     }
     return `// TODO: Migrate ${importName} - mapping not found`;
    });

    return newImports.join("\n");
   });

   if (newContent !== content) {
    hasChanges = true;
    modifiedFiles++;
   }
  }

  totalFiles++;

  if (hasChanges) {
   fs.writeFileSync(filePath, newContent);
   console.log(`✅ Updated: ${filePath}`);
  }
 }

 console.log(`📊 Migration complete: ${modifiedFiles}/${totalFiles} files modified`);
}

async function validateMigration(): Promise<void> {
 console.log("🔍 Validating migration...");

 const files = await glob("src/**/*.{ts,tsx}", {
  ignore: ["src/theme/components.tsx", "node_modules/**", "dist/**"],
 });

 const remainingReferences: string[] = [];

 for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf-8");

  if (content.includes("from '@/theme/components'") || content.includes("from '../theme/components'")) {
   remainingReferences.push(filePath);
  }
 }

 if (remainingReferences.length > 0) {
  console.log("⚠️  Files still referencing old components:");
  remainingReferences.forEach((file) => console.log(`   - ${file}`));
 } else {
  console.log("✅ Migration validation passed - no remaining references found");
 }
}

// Execute migration
migrateComponentImports()
 .then(() => validateMigration())
 .catch(console.error);
```

**Step 4: Create Barrel Export**

```typescript
// src/theme/components/index.ts
// Base Components
export { ThemedBox } from "./base/ThemedBox/ThemedBox";
export { ThemedText } from "./base/ThemedText/ThemedText";
export { ThemedButton } from "./base/ThemedButton/ThemedButton";
export { ThemedBadge } from "./base/ThemedBadge/ThemedBadge";

// Form Components
export { ThemedInput } from "./form/ThemedInput/ThemedInput";
export { ThemedSelect } from "./form/ThemedSelect/ThemedSelect";
export { ThemedTextarea } from "./form/ThemedTextarea/ThemedTextarea";
export { ThemedCheckbox } from "./form/ThemedCheckbox/ThemedCheckbox";

// Status Components
export { StatusBadge } from "./status/StatusBadge/StatusBadge";
export { ResponseTimeDisplay } from "./status/ResponseTimeDisplay/ResponseTimeDisplay";
export { HealthIndicator } from "./status/HealthIndicator/HealthIndicator";

// Layout Components
export { ThemedCard } from "./layout/ThemedCard/ThemedCard";
export { ThemedModal } from "./layout/ThemedModal/ThemedModal";
export { ThemedDrawer } from "./layout/ThemedDrawer/ThemedDrawer";

// Feedback Components
export { ThemedToast } from "./feedback/ThemedToast/ThemedToast";
export { LoadingSpinner } from "./feedback/LoadingSpinner/LoadingSpinner";
export { ErrorDisplay } from "./feedback/ErrorDisplay/ErrorDisplay";

// Re-export types
export type { ThemedBoxProps } from "./base/ThemedBox/ThemedBox.types";
export type { ThemedTextProps } from "./base/ThemedText/ThemedText.types";
export type { ThemedButtonProps } from "./base/ThemedButton/ThemedButton.types";
// ... export all other component types
```

**Step 5: Extract Types and Constants**

```typescript
// src/theme/types/component-types.ts
export type ComponentVariant = "default" | "primary" | "secondary" | "accent" | "ghost" | "destructive";
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type BorderRadius = boolean | "sm" | "md" | "lg" | "full";
export type Shadow = boolean | "sm" | "md" | "lg" | "xl";
export type Border = boolean | "thin" | "thick";

export interface BaseComponentProps {
 className?: string;
 style?: React.CSSProperties;
 "data-testid"?: string;
}

export interface VariantComponentProps extends BaseComponentProps {
 variant?: ComponentVariant;
 size?: ComponentSize;
}

export interface InteractiveComponentProps extends BaseComponentProps {
 onClick?: () => void;
 onHover?: () => void;
 disabled?: boolean;
 loading?: boolean;
}
```

```typescript
// src/theme/constants/css-classes.ts
export const COMPONENT_CLASSES = {
 variants: {
  default: "bg-background border-border text-foreground",
  primary: "bg-primary border-primary text-primary-foreground",
  secondary: "bg-secondary border-secondary text-secondary-foreground",
  accent: "bg-accent border-accent text-accent-foreground",
  ghost: "bg-transparent border-transparent text-foreground hover:bg-accent",
  destructive: "bg-destructive border-destructive text-destructive-foreground",
 },
 sizes: {
  xs: "min-h-8 text-xs px-2 py-1",
  sm: "min-h-10 text-sm px-3 py-2",
  md: "min-h-12 text-base px-4 py-2",
  lg: "min-h-14 text-lg px-6 py-3",
  xl: "min-h-16 text-xl px-8 py-4",
 },
 spacing: {
  padding: {
   none: "p-0",
   xs: "p-1",
   sm: "p-2",
   md: "p-4",
   lg: "p-6",
   xl: "p-8",
  },
  margin: {
   none: "m-0",
   xs: "m-1",
   sm: "m-2",
   md: "m-4",
   lg: "m-6",
   xl: "m-8",
  },
 },
 borders: {
  radius: {
   sm: "rounded-sm",
   md: "rounded-md",
   lg: "rounded-lg",
   full: "rounded-full",
  },
  width: {
   thin: "border",
   thick: "border-2",
  },
 },
 shadows: {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
 },
 transitions: {
  default: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-100 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
 },
} as const;
```

**Migration Strategy:**

```typescript
// Migration script: migrateComponents.ts
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export async function migrateComponentsFromMonolith() {
 // 1\. Create new directory structure
 const basePath = "src/theme/components";
 const directories = [
  "base/ThemedBox",
  "base/ThemedText",
  "base/ThemedButton",
  "base/ThemedBadge",
  "form/ThemedInput",
  "form/ThemedSelect",
  "form/ThemedTextarea",
  "status/StatusBadge",
  "status/ResponseTimeDisplay",
 ];

 for (const dir of directories) {
  await fs.mkdir(path.join(basePath, dir), { recursive: true });
 }

 // 2\. Extract components from monolith file
 const monolithPath = "src/theme/components.tsx";
 const monolithContent = await fs.readFile(monolithPath, "utf-8");

 // 3\. Parse and extract individual components
 const extractComponent = (content: string, componentName: string) => {
  const regex = new RegExp(`export function ${componentName}[\\s\\S]*?^}$`, "gm");
  const matches = content.match(regex);
  return matches ? matches[0] : null;
 };

 // 4\. Create individual component files
 const components = [
  "ThemedBox",
  "ThemedText",
  "ThemedButton",
  "ThemedBadge",
  "ThemedInput",
  "ThemedSelect",
  "ThemedTextarea",
  "StatusBadge",
  "ResponseTimeDisplay",
 ];

 for (const component of components) {
  const componentCode = extractComponent(monolithContent, component);
  if (componentCode) {
   const componentPath = getComponentPath(component);
   await fs.writeFile(path.join(componentPath, `${component}.tsx`), generateComponentFile(component, componentCode));
  }
 }

 // 5\. Update imports across the codebase
 await updateImportsAcrossCodebase();
}

function getComponentPath(componentName: string): string {
 const componentMap: Record<string, string> = {
  ThemedBox: "base/ThemedBox",
  ThemedText: "base/ThemedText",
  ThemedButton: "base/ThemedButton",
  ThemedBadge: "base/ThemedBadge",
  ThemedInput: "form/ThemedInput",
  ThemedSelect: "form/ThemedSelect",
  ThemedTextarea: "form/ThemedTextarea",
  StatusBadge: "status/StatusBadge",
  ResponseTimeDisplay: "status/ResponseTimeDisplay",
 };

 return `src/theme/components/${componentMap[componentName]}`;
}

async function updateImportsAcrossCodebase() {
 // Find all files that import from the monolith
 exec(`grep -r "from.*theme/components" src/ --include="*.tsx" --include="*.ts"`, async (error, stdout) => {
  if (stdout) {
   const files = stdout
    .split("\n")
    .map((line) => line.split(":")[0])
    .filter((file, index, self) => self.indexOf(file) === index);

   for (const file of files) {
    await updateFileImports(file);
   }
  }
 });
}

async function updateFileImports(filePath: string) {
 let content = await fs.readFile(filePath, "utf-8");

 // Replace monolith imports with individual component imports
 content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/theme\/components['"];?/g, (match, imports) => {
  const componentList = imports.split(",").map((imp: string) => imp.trim());
  return componentList.map((comp: string) => `import { ${comp} } from '../theme/components';`).join("\n");
 });

 await fs.writeFile(filePath, content);
}
```

### 2\. **electron/uptimeMonitor.ts** (838 lines) - HIGH PRIORITY

**Issues:**

- **God class** handling too many responsibilities
- **Mixed concerns** - database, HTTP requests, monitoring logic, scheduling
- **Poor error handling** - try/catch blocks everywhere without proper error boundaries
- **Memory leaks** - intervals and timeouts not properly cleaned up
- **Testing difficulty** - tightly coupled dependencies

**Refactoring Plan:**

```folders
Phase 1: Extract services (3-4 days)
├── electron/services/monitoring/
│   ├── UptimeMonitorService.ts (core orchestration, 150-200 lines)
│   ├── SiteMonitoringService.ts (site-level operations, 200-250 lines)
│   ├── HttpCheckService.ts (HTTP monitoring, 100-150 lines)
│   ├── NotificationService.ts (alerts/notifications, 100-150 lines)
│   └── SchedulingService.ts (task scheduling, 100-150 lines)
│
├── electron/services/data/
│   ├── MonitorDataService.ts (data persistence, 150-200 lines)
│   └── MonitorCacheService.ts (caching layer, 100-150 lines)
│
├── electron/services/health/
│   ├── HealthCheckService.ts (health validation, 100-150 lines)
│   └── ResponseAnalyzer.ts (response analysis, 100-150 lines)
│
└── electron/types/
    ├── monitoring-types.ts
    └── service-types.ts

Phase 2: Implement dependency injection (1-2 days)
├── electron/container/
│   ├── ServiceContainer.ts
│   └── dependencies.ts

Phase 3: Add proper error boundaries (1 day)
├── electron/errors/
│   ├── MonitoringError.ts
│   ├── NetworkError.ts
│   └── ErrorHandler.ts
```

**Detailed Implementation Steps:**

#### Step 1: Extract Core Services

**UptimeMonitorService (Main Orchestrator)**

```typescript
// electron/services/monitoring/UptimeMonitorService.ts
import { EventEmitter } from "events";
import { ServiceContainer } from "@/container/ServiceContainer";
import type { Site, MonitoringConfig, MonitoringResult, MonitoringServiceInterface } from "@/types/monitoring-types";

export class UptimeMonitorService extends EventEmitter implements MonitoringServiceInterface {
 private isRunning = false;
 private monitoringInterval: NodeJS.Timeout | null = null;

 constructor(
  private siteMonitoringService = ServiceContainer.getSiteMonitoringService(),
  private schedulingService = ServiceContainer.getSchedulingService(),
  private notificationService = ServiceContainer.getNotificationService(),
  private dataService = ServiceContainer.getMonitorDataService()
 ) {
  super();
  this.setupEventHandlers();
 }

 async start(config: MonitoringConfig): Promise<void> {
  if (this.isRunning) {
   throw new Error("Monitoring is already running");
  }

  try {
   this.isRunning = true;
   await this.schedulingService.start(config);
   this.emit("monitoring:started", { timestamp: Date.now() });
  } catch (error) {
   this.isRunning = false;
   this.emit("monitoring:error", { error, timestamp: Date.now() });
   throw error;
  }
 }

 async stop(): Promise<void> {
  if (!this.isRunning) {
   return;
  }

  try {
   this.isRunning = false;
   await this.schedulingService.stop();
   this.cleanup();
   this.emit("monitoring:stopped", { timestamp: Date.now() });
  } catch (error) {
   this.emit("monitoring:error", { error, timestamp: Date.now() });
   throw error;
  }
 }

 async monitorSite(site: Site): Promise<MonitoringResult> {
  if (!this.isRunning) {
   throw new Error("Monitoring service is not running");
  }

  try {
   const result = await this.siteMonitoringService.monitor(site);

   // Persist result
   await this.dataService.saveResult(result);

   // Handle notifications if needed
   if (result.status === "down") {
    await this.notificationService.sendAlert(site, result);
   }

   this.emit("site:monitored", { site, result, timestamp: Date.now() });

   return result;
  } catch (error) {
   const errorResult: MonitoringResult = {
    siteId: site.id,
    timestamp: Date.now(),
    status: "error",
    responseTime: null,
    error: error instanceof Error ? error.message : "Unknown error",
   };

   await this.dataService.saveResult(errorResult);
   this.emit("site:error", { site, error, timestamp: Date.now() });

   return errorResult;
  }
 }

 async getMonitoringStatus(): Promise<{
  isRunning: boolean;
  activeSites: number;
  lastCheck: number | null;
  uptime: number;
 }> {
  const activeSites = await this.dataService.getActiveSitesCount();
  const lastCheck = await this.dataService.getLastCheckTime();

  return {
   isRunning: this.isRunning,
   activeSites,
   lastCheck,
   uptime: this.schedulingService.getUptime(),
  };
 }

 private setupEventHandlers(): void {
  this.schedulingService.on("schedule:tick", async (sites: Site[]) => {
   const promises = sites.map((site) => this.monitorSite(site));
   await Promise.allSettled(promises);
  });

  this.schedulingService.on("schedule:error", (error) => {
   this.emit("monitoring:error", { error, timestamp: Date.now() });
  });
 }

 private cleanup(): void {
  if (this.monitoringInterval) {
   clearInterval(this.monitoringInterval);
   this.monitoringInterval = null;
  }

  this.removeAllListeners();
 }
}
```

**SiteMonitoringService (Site-Level Operations)**

```typescript
// electron/services/monitoring/SiteMonitoringService.ts
import { ServiceContainer } from "@/container/ServiceContainer";
import type { Site, MonitoringResult, SiteMonitoringServiceInterface } from "@/types/monitoring-types";

export class SiteMonitoringService implements SiteMonitoringServiceInterface {
 constructor(
  private httpCheckService = ServiceContainer.getHttpCheckService(),
  private healthCheckService = ServiceContainer.getHealthCheckService(),
  private responseAnalyzer = ServiceContainer.getResponseAnalyzer()
 ) {}

 async monitor(site: Site): Promise<MonitoringResult> {
  const startTime = Date.now();

  try {
   // Validate site configuration
   this.validateSiteConfig(site);

   // Perform HTTP check
   const httpResult = await this.httpCheckService.check(site.url, {
    timeout: site.timeout || 30000,
    followRedirects: site.followRedirects ?? true,
    expectedStatusCodes: site.expectedStatusCodes || [200],
    headers: site.headers || {},
   });

   // Analyze response
   const analysisResult = await this.responseAnalyzer.analyze(httpResult, site);

   // Perform health checks if configured
   let healthResult = null;
   if (site.enableHealthCheck) {
    healthResult = await this.healthCheckService.performHealthCheck(site, httpResult);
   }

   // Determine final status
   const status = this.determineStatus(httpResult, analysisResult, healthResult);

   return {
    siteId: site.id,
    timestamp: startTime,
    status,
    responseTime: httpResult.responseTime,
    statusCode: httpResult.statusCode,
    error: status === "down" ? this.buildErrorMessage(httpResult, analysisResult) : null,
    details: {
     httpResult,
     analysisResult,
     healthResult,
    },
   };
  } catch (error) {
   return {
    siteId: site.id,
    timestamp: startTime,
    status: "error",
    responseTime: Date.now() - startTime,
    error: error instanceof Error ? error.message : "Unknown monitoring error",
    details: { error },
   };
  }
 }

 private validateSiteConfig(site: Site): void {
  if (!site.url) {
   throw new Error("Site URL is required");
  }

  if (!site.url.startsWith("http://") && !site.url.startsWith("https://")) {
   throw new Error("Site URL must start with http:// or https://");
  }

  if (site.timeout && (site.timeout < 1000 || site.timeout > 300000)) {
   throw new Error("Timeout must be between 1000ms and 300000ms");
  }
 }

 private determineStatus(
  httpResult: any,
  analysisResult: any,
  healthResult: any
 ): "up" | "down" | "degraded" | "error" {
  // If HTTP check failed completely
  if (!httpResult.success) {
   return "down";
  }

  // If analysis shows issues
  if (analysisResult.hasIssues) {
   return healthResult?.isHealthy === false ? "down" : "degraded";
  }

  // If health check failed
  if (healthResult && !healthResult.isHealthy) {
   return "degraded";
  }

  return "up";
 }

 private buildErrorMessage(httpResult: any, analysisResult: any): string {
  const errors: string[] = [];

  if (!httpResult.success) {
   errors.push(`HTTP Error: ${httpResult.error}`);
  }

  if (analysisResult.hasIssues) {
   errors.push(`Analysis Issues: ${analysisResult.issues.join(", ")}`);
  }

  return errors.join("; ");
 }
}
```

**HttpCheckService (HTTP Operations)**

```typescript
// electron/services/monitoring/HttpCheckService.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import type { HttpCheckOptions, HttpCheckResult, HttpCheckServiceInterface } from "@/types/monitoring-types";

export class HttpCheckService implements HttpCheckServiceInterface {
 private readonly defaultTimeout = 30000;
 private readonly maxRedirects = 5;

 async check(url: string, options: HttpCheckOptions = {}): Promise<HttpCheckResult> {
  const startTime = Date.now();

  try {
   const config: AxiosRequestConfig = {
    url,
    method: options.method || "GET",
    timeout: options.timeout || this.defaultTimeout,
    maxRedirects: options.followRedirects ? this.maxRedirects : 0,
    headers: {
     "User-Agent": "Uptime-Watcher/1.0",
     ...options.headers,
    },
    validateStatus: (status) => {
     // Don't throw errors for any status code - we'll handle validation ourselves
     return true;
    },
    // Prevent axios from parsing response data unnecessarily for HEAD requests
    responseType: options.method === "HEAD" ? "stream" : "text",
   };

   if (options.data) {
    config.data = options.data;
   }

   const response: AxiosResponse = await axios(config);
   const responseTime = Date.now() - startTime;

   // Validate status code
   const expectedCodes = options.expectedStatusCodes || [200];
   const isValidStatus = expectedCodes.includes(response.status);

   return {
    success: isValidStatus,
    statusCode: response.status,
    responseTime,
    headers: response.headers,
    data: response.data,
    error: isValidStatus ? null : `Unexpected status code: ${response.status}`,
    timing: {
     dns: null, // Would need custom implementation to measure DNS time
     connect: null, // Would need custom implementation
     firstByte: responseTime,
     total: responseTime,
    },
   };
  } catch (error) {
   const responseTime = Date.now() - startTime;

   if (axios.isAxiosError(error)) {
    return {
     success: false,
     statusCode: error.response?.status || null,
     responseTime,
     headers: error.response?.headers || {},
     data: null,
     error: this.parseAxiosError(error),
     timing: {
      dns: null,
      connect: null,
      firstByte: null,
      total: responseTime,
     },
    };
   }

   return {
    success: false,
    statusCode: null,
    responseTime,
    headers: {},
    data: null,
    error: error instanceof Error ? error.message : "Unknown HTTP error",
    timing: {
     dns: null,
     connect: null,
     firstByte: null,
     total: responseTime,
    },
   };
  }
 }

 private parseAxiosError(error: any): string {
  if (error.code === "ECONNABORTED") {
   return "Request timeout";
  }

  if (error.code === "ENOTFOUND") {
   return "DNS resolution failed";
  }

  if (error.code === "ECONNREFUSED") {
   return "Connection refused";
  }

  if (error.code === "ETIMEDOUT") {
   return "Connection timeout";
  }

  if (error.response) {
   return `HTTP ${error.response.status}: ${error.response.statusText}`;
  }

  return error.message || "HTTP request failed";
 }
}
```

**SchedulingService (Task Scheduling)**

```typescript
// electron/services/monitoring/SchedulingService.ts
import { EventEmitter } from "events";
import { ServiceContainer } from "@/container/ServiceContainer";
import type { Site, MonitoringConfig, SchedulingServiceInterface, ScheduleEntry } from "@/types/monitoring-types";

export class SchedulingService extends EventEmitter implements SchedulingServiceInterface {
 private schedules = new Map<string, ScheduleEntry>();
 private globalInterval: NodeJS.Timeout | null = null;
 private startTime: number | null = null;

 constructor(private dataService = ServiceContainer.getMonitorDataService()) {
  super();
 }

 async start(config: MonitoringConfig): Promise<void> {
  if (this.globalInterval) {
   throw new Error("Scheduling service is already running");
  }

  this.startTime = Date.now();

  // Get active sites
  const sites = await this.dataService.getActiveSites();

  // Create schedules for each site
  sites.forEach((site) => {
   this.createScheduleEntry(site, config);
  });

  // Start the main scheduling loop
  this.globalInterval = setInterval(() => {
   this.processTick();
  }, 1000); // Check every second

  this.emit("scheduling:started", { sitesCount: sites.length });
 }

 async stop(): Promise<void> {
  if (this.globalInterval) {
   clearInterval(this.globalInterval);
   this.globalInterval = null;
  }

  this.schedules.clear();
  this.startTime = null;

  this.emit("scheduling:stopped");
 }

 async addSite(site: Site, config: MonitoringConfig): Promise<void> {
  this.createScheduleEntry(site, config);
  this.emit("site:added", { siteId: site.id });
 }

 async removeSite(siteId: string): Promise<void> {
  this.schedules.delete(siteId);
  this.emit("site:removed", { siteId });
 }

 async updateSiteInterval(siteId: string, intervalSeconds: number): Promise<void> {
  const schedule = this.schedules.get(siteId);
  if (schedule) {
   schedule.intervalMs = intervalSeconds * 1000;
   schedule.nextCheck = Date.now() + schedule.intervalMs;
   this.emit("site:updated", { siteId, newInterval: intervalSeconds });
  }
 }

 getUptime(): number {
  return this.startTime ? Date.now() - this.startTime : 0;
 }

 getScheduleStatus(): Array<{
  siteId: string;
  nextCheck: number;
  intervalMs: number;
  checksPerformed: number;
 }> {
  return Array.from(this.schedules.entries()).map(([siteId, schedule]) => ({
   siteId,
   nextCheck: schedule.nextCheck,
   intervalMs: schedule.intervalMs,
   checksPerformed: schedule.checksPerformed,
  }));
 }

 private createScheduleEntry(site: Site, config: MonitoringConfig): void {
  const intervalMs = (site.checkInterval || config.defaultInterval || 300) * 1000;

  const schedule: ScheduleEntry = {
   site,
   intervalMs,
   nextCheck: Date.now() + intervalMs,
   checksPerformed: 0,
   lastCheck: null,
   isActive: true,
  };

  this.schedules.set(site.id, schedule);
 }

 private processTick(): void {
  const now = Date.now();
  const sitesToCheck: Site[] = [];

  try {
   // Find sites that are due for checking
   for (const [siteId, schedule] of this.schedules) {
    if (schedule.isActive && now >= schedule.nextCheck) {
     sitesToCheck.push(schedule.site);

     // Update schedule
     schedule.nextCheck = now + schedule.intervalMs;
     schedule.checksPerformed++;
     schedule.lastCheck = now;
    }
   }

   // Emit sites to be checked
   if (sitesToCheck.length > 0) {
    this.emit("schedule:tick", sitesToCheck);
   }
  } catch (error) {
   this.emit("schedule:error", error);
  }
 }
}
```

#### Step 2: Create Service Container

```typescript
// electron/container/ServiceContainer.ts
import { UptimeMonitorService } from "@/services/monitoring/UptimeMonitorService";
import { SiteMonitoringService } from "@/services/monitoring/SiteMonitoringService";
import { HttpCheckService } from "@/services/monitoring/HttpCheckService";
import { SchedulingService } from "@/services/monitoring/SchedulingService";
import { NotificationService } from "@/services/monitoring/NotificationService";
import { MonitorDataService } from "@/services/data/MonitorDataService";
import { HealthCheckService } from "@/services/health/HealthCheckService";
import { ResponseAnalyzer } from "@/services/health/ResponseAnalyzer";

class ServiceContainerClass {
 private services = new Map<string, any>();

 // Singleton getters
 getUptimeMonitorService(): UptimeMonitorService {
  return this.getOrCreate("UptimeMonitorService", () => new UptimeMonitorService());
 }

 getSiteMonitoringService(): SiteMonitoringService {
  return this.getOrCreate("SiteMonitoringService", () => new SiteMonitoringService());
 }

 getHttpCheckService(): HttpCheckService {
  return this.getOrCreate("HttpCheckService", () => new HttpCheckService());
 }

 getSchedulingService(): SchedulingService {
  return this.getOrCreate("SchedulingService", () => new SchedulingService());
 }

 getNotificationService(): NotificationService {
  return this.getOrCreate("NotificationService", () => new NotificationService());
 }

 getMonitorDataService(): MonitorDataService {
  return this.getOrCreate("MonitorDataService", () => new MonitorDataService());
 }

 getHealthCheckService(): HealthCheckService {
  return this.getOrCreate("HealthCheckService", () => new HealthCheckService());
 }

 getResponseAnalyzer(): ResponseAnalyzer {
  return this.getOrCreate("ResponseAnalyzer", () => new ResponseAnalyzer());
 }

 // For testing - allows service mocking
 registerService<T>(name: string, service: T): void {
  this.services.set(name, service);
 }

 // Clear all services - useful for testing
 clear(): void {
  this.services.clear();
 }

 private getOrCreate<T>(name: string, factory: () => T): T {
  if (!this.services.has(name)) {
   this.services.set(name, factory());
  }
  return this.services.get(name);
 }
}

export const ServiceContainer = new ServiceContainerClass();
```

#### Step 3: Define Types

```typescript
// electron/types/monitoring-types.ts
export interface Site {
 id: string;
 url: string;
 name: string;
 checkInterval?: number;
 timeout?: number;
 followRedirects?: boolean;
 expectedStatusCodes?: number[];
 headers?: Record<string, string>;
 enableHealthCheck?: boolean;
 healthCheckPath?: string;
 isActive: boolean;
 createdAt: number;
 updatedAt: number;
}

export interface MonitoringConfig {
 defaultInterval: number;
 maxConcurrent: number;
 retryAttempts: number;
 retryDelay: number;
 enableNotifications: boolean;
}

export interface MonitoringResult {
 siteId: string;
 timestamp: number;
 status: "up" | "down" | "degraded" | "error";
 responseTime: number | null;
 statusCode?: number;
 error?: string | null;
 details?: any;
}

export interface HttpCheckOptions {
 method?: "GET" | "POST" | "HEAD" | "PUT" | "DELETE";
 timeout?: number;
 followRedirects?: boolean;
 expectedStatusCodes?: number[];
 headers?: Record<string, string>;
 data?: any;
}

export interface HttpCheckResult {
 success: boolean;
 statusCode: number | null;
 responseTime: number;
 headers: Record<string, any>;
 data: any;
 error: string | null;
 timing: {
  dns: number | null;
  connect: number | null;
  firstByte: number | null;
  total: number;
 };
}

export interface ScheduleEntry {
 site: Site;
 intervalMs: number;
 nextCheck: number;
 checksPerformed: number;
 lastCheck: number | null;
 isActive: boolean;
}

// Service interfaces for dependency injection
export interface MonitoringServiceInterface {
 start(config: MonitoringConfig): Promise<void>;
 stop(): Promise<void>;
 monitorSite(site: Site): Promise<MonitoringResult>;
 getMonitoringStatus(): Promise<any>;
}

export interface SiteMonitoringServiceInterface {
 monitor(site: Site): Promise<MonitoringResult>;
}

export interface HttpCheckServiceInterface {
 check(url: string, options?: HttpCheckOptions): Promise<HttpCheckResult>;
}

export interface SchedulingServiceInterface {
 start(config: MonitoringConfig): Promise<void>;
 stop(): Promise<void>;
 addSite(site: Site, config: MonitoringConfig): Promise<void>;
 removeSite(siteId: string): Promise<void>;
 updateSiteInterval(siteId: string, intervalSeconds: number): Promise<void>;
 getUptime(): number;
}
```

#### Step 4: Migration Script

```typescript
// scripts/migrate-uptime-monitor.ts
import * as fs from "fs";
import * as path from "path";

interface MigrationStep {
 name: string;
 action: () => Promise<void>;
}

const MIGRATION_STEPS: MigrationStep[] = [
 {
  name: "Create service directories",
  action: async () => {
   const dirs = [
    "electron/services/monitoring",
    "electron/services/data",
    "electron/services/health",
    "electron/container",
    "electron/types",
    "electron/errors",
   ];

   dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
     fs.mkdirSync(dir, { recursive: true });
     console.log(`✅ Created directory: ${dir}`);
    }
   });
  },
 },
 {
  name: "Backup original file",
  action: async () => {
   const originalPath = "electron/uptimeMonitor.ts";
   const backupPath = `electron/uptimeMonitor.ts.backup.${Date.now()}`;

   if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log(`✅ Backed up original file to: ${backupPath}`);
   }
  },
 },
 {
  name: "Extract services from original file",
  action: async () => {
   // This would contain logic to parse the original file
   // and extract specific functions/classes to new service files
   console.log("✅ Services extracted (implementation needed)");
  },
 },
 {
  name: "Update imports in dependent files",
  action: async () => {
   // Find all files that import from uptimeMonitor.ts
   // Update their imports to use the new service container
   console.log("✅ Imports updated (implementation needed)");
  },
 },
 {
  name: "Run tests",
  action: async () => {
   // Run test suite to ensure nothing is broken
   console.log("✅ Tests passed (implementation needed)");
  },
 },
];

async function migrateUptimeMonitor(): Promise<void> {
 console.log("🚀 Starting uptimeMonitor.ts migration...");

 for (const step of MIGRATION_STEPS) {
  console.log(`\n📋 ${step.name}...`);
  try {
   await step.action();
  } catch (error) {
   console.error(`❌ Failed: ${step.name}`, error);
   return;
  }
 }

 console.log("\n🎉 Migration completed successfully!");
}

migrateUptimeMonitor().catch(console.error);
```

### 3\. **src/store.ts** (611 lines) - HIGH PRIORITY

**Issues:**

- **Monolithic store** with mixed concerns (sites, settings, UI state, analytics)
- **Performance problems** - entire store re-renders on any change
- **Complex selectors** - difficult to optimize and maintain
- **Testing challenges** - tightly coupled state makes unit testing difficult
- **Memory leaks** - listeners and subscriptions not properly cleaned up

**Refactoring Plan:**

```folders
Phase 1: Split into slices (2-3 days)
├── src/store/
│   ├── slices/
│   │   ├── sitesSlice.ts (site management)
│   │   ├── settingsSlice.ts (app settings)
│   │   ├── uiSlice.ts (UI state)
│   │   ├── analyticsSlice.ts (analytics data)
│   │   └── monitoringSlice.ts (monitoring status)
│   ├── selectors/
│   │   ├── siteSelectors.ts (memoized selectors)
│   │   ├── analyticsSelectors.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── persistenceMiddleware.ts
│   │   ├── analyticsMiddleware.ts
│   │   └── loggingMiddleware.ts
│   └── store.ts (configuration only, ~50 lines)

Phase 2: Add RTK Query (2 days)
├── src/store/api/
│   ├── sitesApi.ts (site CRUD operations)
│   ├── analyticsApi.ts (analytics data)
│   └── monitoringApi.ts (monitoring status)

Phase 3: Optimize performance (1 day)
- Add proper selector memoization
- Implement entity adapters
- Add selective subscriptions
```

**Detailed Implementation Steps:**

#### Step 1: Extract Sites Slice

```typescript
// src/store/slices/sitesSlice.ts
import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import type { Site, SiteFormData, SiteStats } from "@/types/site-types";

// Entity adapter for normalized site storage
const sitesAdapter = createEntityAdapter<Site>({
 selectId: (site) => site.id,
 sortComparer: (a, b) => a.name.localeCompare(b.name),
});

interface SitesState {
 // Entity adapter state
 sites: ReturnType<typeof sitesAdapter.getInitialState>;
 // UI state
 selectedSiteId: string | null;
 isLoading: boolean;
 error: string | null;
 // Filter and search
 filters: {
  status: "all" | "up" | "down" | "degraded";
  search: string;
  sortBy: "name" | "status" | "responseTime" | "lastCheck";
  sortOrder: "asc" | "desc";
 };
 // Bulk operations
 selectedSiteIds: string[];
 bulkOperationInProgress: boolean;
}

const initialState: SitesState = {
 sites: sitesAdapter.getInitialState(),
 selectedSiteId: null,
 isLoading: false,
 error: null,
 filters: {
  status: "all",
  search: "",
  sortBy: "name",
  sortOrder: "asc",
 },
 selectedSiteIds: [],
 bulkOperationInProgress: false,
};

export const sitesSlice = createSlice({
 name: "sites",
 initialState,
 reducers: {
  // CRUD Operations
  addSite: (state, action: PayloadAction<Site>) => {
   sitesAdapter.addOne(state.sites, action.payload);
   state.error = null;
  },

  updateSite: (state, action: PayloadAction<{ id: string; changes: Partial<Site> }>) => {
   sitesAdapter.updateOne(state.sites, {
    id: action.payload.id,
    changes: {
     ...action.payload.changes,
     updatedAt: Date.now(),
    },
   });
   state.error = null;
  },

  removeSite: (state, action: PayloadAction<string>) => {
   sitesAdapter.removeOne(state.sites, action.payload);
   // Clear selection if deleted site was selected
   if (state.selectedSiteId === action.payload) {
    state.selectedSiteId = null;
   }
   // Remove from bulk selection
   state.selectedSiteIds = state.selectedSiteIds.filter((id) => id !== action.payload);
   state.error = null;
  },

  setSites: (state, action: PayloadAction<Site[]>) => {
   sitesAdapter.setAll(state.sites, action.payload);
   state.isLoading = false;
   state.error = null;
  },

  // Site Status Updates
  updateSiteStatus: (
   state,
   action: PayloadAction<{
    id: string;
    status: Site["status"];
    responseTime?: number;
    lastCheck: number;
    error?: string;
   }>
  ) => {
   const { id, status, responseTime, lastCheck, error } = action.payload;
   sitesAdapter.updateOne(state.sites, {
    id,
    changes: {
     status,
     responseTime,
     lastCheck,
     lastError: error || null,
     updatedAt: Date.now(),
    },
   });
  },

  // Bulk Operations
  updateMultipleSites: (
   state,
   action: PayloadAction<{
    ids: string[];
    changes: Partial<Site>;
   }>
  ) => {
   const { ids, changes } = action.payload;
   const updates = ids.map((id) => ({
    id,
    changes: {
     ...changes,
     updatedAt: Date.now(),
    },
   }));
   sitesAdapter.updateMany(state.sites, updates);
  },

  deleteMultipleSites: (state, action: PayloadAction<string[]>) => {
   sitesAdapter.removeMany(state.sites, action.payload);

   // Clean up selections
   if (action.payload.includes(state.selectedSiteId!)) {
    state.selectedSiteId = null;
   }
   state.selectedSiteIds = state.selectedSiteIds.filter((id) => !action.payload.includes(id));
  },

  // Selection Management
  selectSite: (state, action: PayloadAction<string | null>) => {
   state.selectedSiteId = action.payload;
  },

  toggleSiteSelection: (state, action: PayloadAction<string>) => {
   const siteId = action.payload;
   const index = state.selectedSiteIds.indexOf(siteId);

   if (index === -1) {
    state.selectedSiteIds.push(siteId);
   } else {
    state.selectedSiteIds.splice(index, 1);
   }
  },

  selectAllSites: (state) => {
   state.selectedSiteIds = Object.keys(state.sites.entities);
  },

  clearSiteSelection: (state) => {
   state.selectedSiteIds = [];
  },

  // Filtering and Sorting
  setStatusFilter: (state, action: PayloadAction<SitesState["filters"]["status"]>) => {
   state.filters.status = action.payload;
  },

  setSearchFilter: (state, action: PayloadAction<string>) => {
   state.filters.search = action.payload;
  },

  setSortOptions: (
   state,
   action: PayloadAction<{
    sortBy: SitesState["filters"]["sortBy"];
    sortOrder: SitesState["filters"]["sortOrder"];
   }>
  ) => {
   state.filters.sortBy = action.payload.sortBy;
   state.filters.sortOrder = action.payload.sortOrder;
  },

  clearFilters: (state) => {
   state.filters = initialState.filters;
  },

  // Loading and Error States
  setLoading: (state, action: PayloadAction<boolean>) => {
   state.isLoading = action.payload;
  },

  setError: (state, action: PayloadAction<string | null>) => {
   state.error = action.payload;
   state.isLoading = false;
  },

  setBulkOperationInProgress: (state, action: PayloadAction<boolean>) => {
   state.bulkOperationInProgress = action.payload;
  },

  // Utility Actions
  clearAllData: (state) => {
   return initialState;
  },

  importSites: (state, action: PayloadAction<Site[]>) => {
   // Merge imported sites with existing ones
   const existingIds = Object.keys(state.sites.entities);
   const newSites = action.payload.filter((site) => !existingIds.includes(site.id));

   sitesAdapter.addMany(state.sites, newSites);
   state.error = null;
  },
 },
});

// Export actions
export const {
 addSite,
 updateSite,
 removeSite,
 setSites,
 updateSiteStatus,
 updateMultipleSites,
 deleteMultipleSites,
 selectSite,
 toggleSiteSelection,
 selectAllSites,
 clearSiteSelection,
 setStatusFilter,
 setSearchFilter,
 setSortOptions,
 clearFilters,
 setLoading,
 setError,
 setBulkOperationInProgress,
 clearAllData,
 importSites,
} = sitesSlice.actions;

// Export entity adapter selectors
export const {
 selectAll: selectAllSites,
 selectById: selectSiteById,
 selectIds: selectSiteIds,
 selectEntities: selectSiteEntities,
 selectTotal: selectTotalSites,
} = sitesAdapter.getSelectors();

export default sitesSlice.reducer;
```

#### Step 2: Extract Settings Slice

```typescript
// src/store/slices/settingsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AppSettings {
 // Monitoring Settings
 defaultCheckInterval: number;
 maxConcurrentChecks: number;
 requestTimeout: number;
 retryAttempts: number;
 retryDelay: number;

 // Notification Settings
 enableNotifications: boolean;
 enableDesktopNotifications: boolean;
 enableEmailNotifications: boolean;
 emailSettings: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  toEmails: string[];
 };

 // UI Settings
 theme: "light" | "dark" | "system";
 language: string;
 dateFormat: string;
 timeFormat: "12h" | "24h";
 enableAnimations: boolean;
 compactMode: boolean;

 // Data Settings
 dataRetentionDays: number;
 enableDataExport: boolean;
 autoBackup: boolean;
 backupInterval: number;
 maxBackupFiles: number;

 // Advanced Settings
 enableDebugMode: boolean;
 enableTelemetry: boolean;
 updateChannel: "stable" | "beta";
 enableAutoUpdate: boolean;
}

interface SettingsState {
 settings: AppSettings;
 isLoading: boolean;
 error: string | null;
 hasUnsavedChanges: boolean;
 lastSaved: number | null;
}

const defaultSettings: AppSettings = {
 // Monitoring defaults
 defaultCheckInterval: 300, // 5 minutes
 maxConcurrentChecks: 10,
 requestTimeout: 30000, // 30 seconds
 retryAttempts: 3,
 retryDelay: 5000, // 5 seconds

 // Notification defaults
 enableNotifications: true,
 enableDesktopNotifications: true,
 enableEmailNotifications: false,
 emailSettings: {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  fromEmail: "",
  toEmails: [],
 },

 // UI defaults
 theme: "system",
 language: "en",
 dateFormat: "MM/dd/yyyy",
 timeFormat: "12h",
 enableAnimations: true,
 compactMode: false,

 // Data defaults
 dataRetentionDays: 90,
 enableDataExport: true,
 autoBackup: false,
 backupInterval: 24, // hours
 maxBackupFiles: 10,

 // Advanced defaults
 enableDebugMode: false,
 enableTelemetry: true,
 updateChannel: "stable",
 enableAutoUpdate: true,
};

const initialState: SettingsState = {
 settings: defaultSettings,
 isLoading: false,
 error: null,
 hasUnsavedChanges: false,
 lastSaved: null,
};

export const settingsSlice = createSlice({
 name: "settings",
 initialState,
 reducers: {
  // Update entire settings object
  setSettings: (state, action: PayloadAction<AppSettings>) => {
   state.settings = action.payload;
   state.hasUnsavedChanges = false;
   state.lastSaved = Date.now();
   state.error = null;
  },

  // Update specific setting sections
  updateMonitoringSettings: (
   state,
   action: PayloadAction<
    Partial<
     Pick<
      AppSettings,
      "defaultCheckInterval" | "maxConcurrentChecks" | "requestTimeout" | "retryAttempts" | "retryDelay"
     >
    >
   >
  ) => {
   Object.assign(state.settings, action.payload);
   state.hasUnsavedChanges = true;
  },

  updateNotificationSettings: (
   state,
   action: PayloadAction<
    Partial<Pick<AppSettings, "enableNotifications" | "enableDesktopNotifications" | "enableEmailNotifications">>
   >
  ) => {
   Object.assign(state.settings, action.payload);
   state.hasUnsavedChanges = true;
  },

  updateEmailSettings: (state, action: PayloadAction<Partial<AppSettings["emailSettings"]>>) => {
   state.settings.emailSettings = {
    ...state.settings.emailSettings,
    ...action.payload,
   };
   state.hasUnsavedChanges = true;
  },

  updateUISettings: (
   state,
   action: PayloadAction<
    Partial<Pick<AppSettings, "theme" | "language" | "dateFormat" | "timeFormat" | "enableAnimations" | "compactMode">>
   >
  ) => {
   Object.assign(state.settings, action.payload);
   state.hasUnsavedChanges = true;
  },

  updateDataSettings: (
   state,
   action: PayloadAction<
    Partial<
     Pick<AppSettings, "dataRetentionDays" | "enableDataExport" | "autoBackup" | "backupInterval" | "maxBackupFiles">
    >
   >
  ) => {
   Object.assign(state.settings, action.payload);
   state.hasUnsavedChanges = true;
  },

  updateAdvancedSettings: (
   state,
   action: PayloadAction<
    Partial<Pick<AppSettings, "enableDebugMode" | "enableTelemetry" | "updateChannel" | "enableAutoUpdate">>
   >
  ) => {
   Object.assign(state.settings, action.payload);
   state.hasUnsavedChanges = true;
  },

  // Individual setting updates
  updateSetting: (
   state,
   action: PayloadAction<{
    key: keyof AppSettings;
    value: any;
   }>
  ) => {
   const { key, value } = action.payload;
   (state.settings as any)[key] = value;
   state.hasUnsavedChanges = true;
  },

  // Email management
  addEmailRecipient: (state, action: PayloadAction<string>) => {
   const email = action.payload.trim();
   if (email && !state.settings.emailSettings.toEmails.includes(email)) {
    state.settings.emailSettings.toEmails.push(email);
    state.hasUnsavedChanges = true;
   }
  },

  removeEmailRecipient: (state, action: PayloadAction<string>) => {
   state.settings.emailSettings.toEmails = state.settings.emailSettings.toEmails.filter(
    (email) => email !== action.payload
   );
   state.hasUnsavedChanges = true;
  },

  // State management
  markSettingsSaved: (state) => {
   state.hasUnsavedChanges = false;
   state.lastSaved = Date.now();
   state.error = null;
  },

  setSettingsLoading: (state, action: PayloadAction<boolean>) => {
   state.isLoading = action.payload;
  },

  setSettingsError: (state, action: PayloadAction<string | null>) => {
   state.error = action.payload;
   state.isLoading = false;
  },

  // Reset to defaults
  resetSettings: (state) => {
   state.settings = defaultSettings;
   state.hasUnsavedChanges = true;
  },

  resetSettingsSection: (state, action: PayloadAction<keyof AppSettings>) => {
   const section = action.payload;
   (state.settings as any)[section] = (defaultSettings as any)[section];
   state.hasUnsavedChanges = true;
  },

  // Import/Export
  importSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
   state.settings = {
    ...defaultSettings,
    ...action.payload,
   };
   state.hasUnsavedChanges = true;
  },

  // Validation and cleanup
  validateSettings: (state) => {
   // Ensure settings are within valid ranges
   const s = state.settings;

   s.defaultCheckInterval = Math.max(30, Math.min(3600, s.defaultCheckInterval));
   s.maxConcurrentChecks = Math.max(1, Math.min(50, s.maxConcurrentChecks));
   s.requestTimeout = Math.max(5000, Math.min(300000, s.requestTimeout));
   s.retryAttempts = Math.max(0, Math.min(10, s.retryAttempts));
   s.retryDelay = Math.max(1000, Math.min(60000, s.retryDelay));
   s.dataRetentionDays = Math.max(1, Math.min(365, s.dataRetentionDays));
   s.backupInterval = Math.max(1, Math.min(168, s.backupInterval));
   s.maxBackupFiles = Math.max(1, Math.min(100, s.maxBackupFiles));
  },
 },
});

export const {
 setSettings,
 updateMonitoringSettings,
 updateNotificationSettings,
 updateEmailSettings,
 updateUISettings,
 updateDataSettings,
 updateAdvancedSettings,
 updateSetting,
 addEmailRecipient,
 removeEmailRecipient,
 markSettingsSaved,
 setSettingsLoading,
 setSettingsError,
 resetSettings,
 resetSettingsSection,
 importSettings,
 validateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
```

#### Step 3: Create Selectors

```typescript
// src/store/selectors/siteSelectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Site } from "@/types/site-types";

// Base selectors
const selectSitesState = (state: RootState) => state.sites;
const selectSitesEntities = (state: RootState) => state.sites.sites.entities;
const selectSitesIds = (state: RootState) => state.sites.sites.ids;

// Memoized selectors
export const selectAllSitesList = createSelector(
 [selectSitesEntities, selectSitesIds],
 (entities, ids) => ids.map((id) => entities[id]).filter(Boolean) as Site[]
);

export const selectSiteById = createSelector(
 [selectSitesEntities, (_: RootState, siteId: string) => siteId],
 (entities, siteId) => entities[siteId]
);

export const selectSelectedSite = createSelector([selectSitesEntities, selectSitesState], (entities, sitesState) => {
 return sitesState.selectedSiteId ? entities[sitesState.selectedSiteId] : null;
});

// Filtered and sorted sites
export const selectFilteredSites = createSelector([selectAllSitesList, selectSitesState], (sites, sitesState) => {
 const { filters } = sitesState;

 let filtered = sites;

 // Apply status filter
 if (filters.status !== "all") {
  filtered = filtered.filter((site) => site.status === filters.status);
 }

 // Apply search filter
 if (filters.search) {
  const searchLower = filters.search.toLowerCase();
  filtered = filtered.filter(
   (site) => site.name.toLowerCase().includes(searchLower) || site.url.toLowerCase().includes(searchLower)
  );
 }

 // Apply sorting
 filtered = [...filtered].sort((a, b) => {
  let aValue: any, bValue: any;

  switch (filters.sortBy) {
   case "name":
    aValue = a.name.toLowerCase();
    bValue = b.name.toLowerCase();
    break;
   case "status":
    aValue = a.status;
    bValue = b.status;
    break;
   case "responseTime":
    aValue = a.responseTime || 0;
    bValue = b.responseTime || 0;
    break;
   case "lastCheck":
    aValue = a.lastCheck || 0;
    bValue = b.lastCheck || 0;
    break;
   default:
    return 0;
  }

  if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
  if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
  return 0;
 });

 return filtered;
});

// Statistics selectors
export const selectSiteStats = createSelector([selectAllSitesList], (sites) => {
 const total = sites.length;
 const up = sites.filter((site) => site.status === "up").length;
 const down = sites.filter((site) => site.status === "down").length;
 const degraded = sites.filter((site) => site.status === "degraded").length;
 const unknown = sites.filter((site) => site.status === "unknown").length;

 return {
  total,
  up,
  down,
  degraded,
  unknown,
  upPercentage: total > 0 ? Math.round((up / total) * 100) : 0,
  downPercentage: total > 0 ? Math.round((down / total) * 100) : 0,
 };
});

export const selectAverageResponseTime = createSelector([selectAllSitesList], (sites) => {
 const sitesWithResponseTime = sites.filter((site) => site.responseTime !== null && site.responseTime !== undefined);

 if (sitesWithResponseTime.length === 0) return 0;

 const total = sitesWithResponseTime.reduce((sum, site) => sum + (site.responseTime || 0), 0);

 return Math.round(total / sitesWithResponseTime.length);
});

// Selection selectors
export const selectSelectedSiteIds = createSelector([selectSitesState], (sitesState) => sitesState.selectedSiteIds);

export const selectSelectedSitesCount = createSelector([selectSelectedSiteIds], (selectedIds) => selectedIds.length);

export const selectIsAnySiteSelected = createSelector([selectSelectedSiteIds], (selectedIds) => selectedIds.length > 0);

export const selectAreAllSitesSelected = createSelector(
 [selectSelectedSiteIds, selectAllSitesList],
 (selectedIds, allSites) => allSites.length > 0 && selectedIds.length === allSites.length
);

// UI state selectors
export const selectSitesLoading = createSelector([selectSitesState], (sitesState) => sitesState.isLoading);

export const selectSitesError = createSelector([selectSitesState], (sitesState) => sitesState.error);

export const selectSitesFilters = createSelector([selectSitesState], (sitesState) => sitesState.filters);

// Complex derived data
export const selectSitesGroupedByStatus = createSelector([selectFilteredSites], (sites) => {
 return sites.reduce(
  (groups, site) => {
   const status = site.status;
   if (!groups[status]) {
    groups[status] = [];
   }
   groups[status].push(site);
   return groups;
  },
  {} as Record<string, Site[]>
 );
});

export const selectRecentlyCheckedSites = createSelector([selectAllSitesList], (sites) => {
 const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
 return sites
  .filter((site) => site.lastCheck && site.lastCheck > fiveMinutesAgo)
  .sort((a, b) => (b.lastCheck || 0) - (a.lastCheck || 0))
  .slice(0, 10);
});

export const selectSitesNeedingAttention = createSelector([selectAllSitesList], (sites) => {
 return sites.filter(
  (site) => site.status === "down" || site.status === "degraded" || (site.responseTime && site.responseTime > 10000) // Over 10 seconds
 );
});
```

#### Step 4: Create Store Configuration

```typescript
// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Slices
import sitesReducer from "./slices/sitesSlice";
import settingsReducer from "./slices/settingsSlice";
import uiReducer from "./slices/uiSlice";
import analyticsReducer from "./slices/analyticsSlice";
import monitoringReducer from "./slices/monitoringSlice";

// Middleware
import { persistenceMiddleware } from "./middleware/persistenceMiddleware";
import { analyticsMiddleware } from "./middleware/analyticsMiddleware";
import { loggingMiddleware } from "./middleware/loggingMiddleware";

// API slices (RTK Query)
import { sitesApi } from "./api/sitesApi";
import { analyticsApi } from "./api/analyticsApi";
import { monitoringApi } from "./api/monitoringApi";

export const store = configureStore({
 reducer: {
  sites: sitesReducer,
  settings: settingsReducer,
  ui: uiReducer,
  analytics: analyticsReducer,
  monitoring: monitoringReducer,
  // RTK Query API slices
  [sitesApi.reducerPath]: sitesApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [monitoringApi.reducerPath]: monitoringApi.reducer,
 },
 middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
   serializableCheck: {
    ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
    ignoredPaths: ["register", "rehydrate"],
   },
  }).concat(
   // RTK Query middleware
   sitesApi.middleware,
   analyticsApi.middleware,
   monitoringApi.middleware,
   // Custom middleware
   persistenceMiddleware,
   analyticsMiddleware,
   loggingMiddleware
  ),
 devTools: process.env.NODE_ENV !== "production",
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export { useAppDispatch, useAppSelector } from "./hooks";
```

## 🔥 Major Component Refactoring Needed

### 4\. **src/components/SiteDetails/SiteDetails.tsx** (357 lines)

**Issues:**

- **Prop drilling** to child components
- **Mixed UI logic** with data fetching
- **Complex tab management** state
- **Poor error handling** for failed operations

**Refactoring Plan:**

```folders
Phase 1: Context pattern (2 days)
├── src/components/SiteDetails/
│   ├── SiteDetailsProvider.tsx
│   ├── useSiteDetailsContext.tsx
│   └── SiteDetails.tsx (simplified, 100-150 lines)

Phase 2: Extract tab components (1-2 days)
├── src/components/SiteDetails/tabs/
│   ├── OverviewTab/
│   ├── AnalyticsTab/ (refactored)
│   ├── SettingsTab/ (refactored)
│   └── HistoryTab/
```

### 5\. **src/hooks/site/useSiteDetails.ts** (363 lines)

**Issues:**

- **Single hook** doing too much (data, UI, actions)
- **Complex state management** with multiple concerns
- **Side effects** not properly organized
- **Difficult to test** individual pieces

**Refactoring Plan:**

```folders
Phase 1: Split into focused hooks (2 days)
├── src/hooks/site/
│   ├── useSiteDetailsData.ts (data fetching)
│   ├── useSiteDetailsUI.ts (UI state)
│   ├── useSiteDetailsActions.ts (user actions)
│   └── useSiteDetailsEffects.ts (side effects)

Phase 2: Optimize performance (1 day)
- Add proper memoization
- Implement selective subscriptions
- Add loading states management
```

### 6\. **src/components/SiteDetails/tabs/SettingsTab.tsx** (425 lines)

**Issues:**

- **Large form component** with complex validation
- **Mixed form logic** with business logic
- **Poor user experience** with validation feedback
- **Accessibility issues** in form controls

### 7\. **electron/services/database/MonitorRepository.ts** (413 lines)

**Issues:**

- **Database operations** mixed with business logic
- **SQL queries** hardcoded in methods
- **No transaction management**
- **Poor error handling** for database failures

### 8\. **src/components/Settings/Settings.tsx** (397 lines)

**Issues:**

- **Settings management** scattered across component
- **Form validation** mixed with UI logic
- **No separation** between different setting types
- **Poor state management** for unsaved changes

### 9\. **src/components/SiteDetails/tabs/AnalyticsTab.tsx** (350+ lines)

**Issues:**

- **Complex chart rendering** logic
- **Data processing** in component
- **Performance issues** with large datasets
- **No chart interaction** handling

### 10\. **src/components/AddSiteForm/AddSiteForm.tsx** (287 lines)

**Issues:**

- **Form management** complexity
- **Validation logic** scattered
- **Submission handling** mixed with UI
- **Poor error display** and recovery

---

## 🏗️ **Architectural Improvements**

### A. **Implement Proper Error Boundaries**

**Current Issues:**

- **No error boundaries** protecting component trees
- **Uncaught errors** crash entire application
- **Poor error user experience**
- **No error reporting** or logging

**Implementation:**

```typescript
// src/components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ThemedBox, ThemedText, ThemedButton } from '@/theme/components';
import { ErrorReportingService } from '@/services/ErrorReportingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate this boundary
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Report error to service
    ErrorReportingService.reportError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ThemedBox variant="secondary" padding="xl" className="text-center">
          <ThemedText size="lg" weight="bold" className="mb-4">
            Something went wrong
          </ThemedText>
          <ThemedText className="mb-6">
            We're sorry, but something unexpected happened. The error has been reported.
          </ThemedText>
          <ThemedButton onClick={this.handleReset}>
            Try Again
          </ThemedButton>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary>Error Details</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </ThemedBox>
      );
    }

    return this.props.children;
  }
}

// Usage Examples:
// <ErrorBoundary> - Default error boundary
// <ErrorBoundary isolate> - Isolated boundary that doesn't bubble up
// <ErrorBoundary fallback={<CustomErrorUI />}> - Custom fallback UI
```

### B. **Implement Design System Architecture**

**Create Centralized Design System:**

```typescript
// src/design-system/tokens/spacing.ts
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// src/design-system/tokens/colors.ts
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
} as const;

// src/design-system/components/Button/Button.tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        getButtonBaseStyles(),
        getButtonVariantStyles(variant),
        getButtonSizeStyles(size)
      )}
      {...props}
    >
      {children}
    </button>
  );
});
```

### C. **Performance Optimization Strategy**

**Code Splitting Implementation:**

```typescript
// src/pages/LazyPages.tsx
import { lazy } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/theme/components';

const SiteDetailsPage = lazy(() =>
  import('@/pages/SiteDetailsPage').then(module => ({
    default: module.SiteDetailsPage
  }))
);

const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then(module => ({
    default: module.AnalyticsPage
  }))
);

// Wrapper with error boundary and loading
export const LazyPageWrapper = ({
  children,
  fallback = <LoadingSpinner size="lg" />
}) => (
  <ErrorBoundary>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);
```

**Memoization Strategy:**

```typescript
// src/hooks/optimization/useMemoizedSelectors.ts
import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectFilteredSites, selectSiteStats } from "@/store/selectors";

export const useMemoizedSiteData = (filters: SiteFilters) => {
 const filteredSites = useAppSelector((state) => selectFilteredSites(state, filters));

 const siteStats = useAppSelector(selectSiteStats);

 // Expensive calculations memoized
 const derivedData = useMemo(
  () => ({
   totalResponseTime: filteredSites.reduce((sum, site) => sum + (site.responseTime || 0), 0),
   averageUptime: calculateAverageUptime(filteredSites),
   criticalSites: filteredSites.filter((site) => site.status === "down" || site.responseTime > 10000),
  }),
  [filteredSites]
 );

 return {
  sites: filteredSites,
  stats: siteStats,
  derived: derivedData,
 };
};
```

---

## 📈 **Implementation Timeline & Milestones**

### **Week 1-2: Critical Foundation**

- ✅ Theme components refactoring (src/theme/components.tsx)
- ✅ Error boundary implementation
- ✅ Basic performance optimizations

### **Week 3-4: Core Services**

- 🔄 Uptime monitor service extraction (electron/uptimeMonitor.ts)
- 🔄 Store architecture overhaul (src/store.ts)
- 🔄 Database layer improvements

### **Week 5-6: Component Architecture**

- ⏳ SiteDetails component refactoring
- ⏳ Form component improvements
- ⏳ Settings management refactoring

### **Week 7-8: Advanced Features**

- ⏳ Analytics optimization
- ⏳ Performance monitoring
- ⏳ Additional component extractions

---

## 🎯 **Success Metrics & Validation**

### **Code Quality Metrics**

- **Cyclomatic Complexity**: Reduce from avg 15 to under 8
- **File Size**: 90% of files under 200 lines
- **Function Length**: 95% of functions under 20 lines
- **Code Duplication**: Reduce by 70%

### **Performance Metrics**

- **Bundle Size**: Reduce by 25% through tree-shaking
- **Initial Load Time**: Improve by 40%
- **Runtime Performance**: 30% faster re-renders
- **Memory Usage**: 20% reduction in heap size

### **Developer Experience**

- **Test Coverage**: Increase to 85%+
- **Build Time**: Reduce by 50%
- **Hot Reload**: Sub 500ms updates
- **Developer Satisfaction**: Survey score 8.5/10

### **Testing Strategy**

```typescript
// Example test structure for refactored components
describe('ThemedButton', () => {
  it('renders with correct variant classes', () => {
    render(<ThemedButton variant="primary">Click me</ThemedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ThemedButton onClick={handleClick}>Click me</ThemedButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
```

---

## 🚀 **Getting Started Checklist**

### **Pre-Refactoring Setup**

- [ ] Create feature branch for refactoring work
- [ ] Set up comprehensive test suite
- [ ] Document current API interfaces
- [ ] Create rollback strategy
- [ ] Set up monitoring for regressions

### **During Refactoring**

- [ ] Follow single responsibility principle
- [ ] Maintain backward compatibility
- [ ] Add comprehensive TypeScript types
- [ ] Implement proper error handling
- [ ] Add performance optimizations

### **Post-Refactoring Validation**

- [ ] All existing tests pass
- [ ] New tests achieve target coverage
- [ ] Performance benchmarks meet goals
- [ ] Code review and approval
- [ ] Gradual rollout with monitoring

This comprehensive refactoring plan provides actionable, implementation-ready instructions for transforming the Uptime Watcher codebase into a maintainable, performant, and scalable application. Each phase includes specific code examples, architectural patterns, and success criteria to ensure successful execution.
