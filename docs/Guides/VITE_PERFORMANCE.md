---
title: "Vite Performance Profiling and Optimization Guide"
summary: "Guide to profiling, warming, and optimizing Vite performance for the Uptime Watcher application."
created: "2025-09-22"
last_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:
   - "uptime-watcher"
   - "vite"
   - "performance"
   - "profiling"
   - "optimization"
---

# Vite Performance Profiling and Optimization Guide

This document outlines how to use the performance profiling scripts and warmup configuration for the Uptime Watcher application.

## 🔧 Available Scripts

### Development and Profiling Scripts

- **`npm run dev`** - Standard development server with warmup enabled
- **`npm run dev:warmup`** - Development server with transform debugging to verify warmup
- **`npm run profile`** - Runs Vite with CPU profiling enabled
- **`npm run profile:debug`** - Combines profiling with debug output
- **`npm run profile:transform`** - Shows detailed transform timing information
- **`npm run dev:profile`** - Development server with profiling enabled

## 📊 How to Use Profiling

### 1. Transform Performance Analysis

```bash
npm run profile:transform
```

Look for files taking >50ms to transform. Example output:

```text
vite:transform 62.95ms /src/components/BigComponent.tsx +1ms
vite:transform 102.54ms /src/utils/big-utils.ts +1ms
```

### 2. CPU Profiling

```bash
npm run profile
```

1. Visit your site in the browser
2. Press `p + enter` in terminal to record profile
3. A `.cpuprofile` file will be generated
4. Open with tools like:
   - [Speedscope](https://speedscope.app) (online)
   - Chrome DevTools Performance tab
   - VS Code flame graph extensions

### 3. Monitoring Warmup Effectiveness

```bash
npm run dev:warmup
```

Check that warmed files show as already cached on first request.

## 🚀 Warmup Configuration

The following files are pre-warmed for optimal performance in `vite.config.ts`:

### Core Application Entry Points

- `./src/App.tsx` - Main app component
- `./src/main.tsx` - Entry point

### State Management (Zustand stores)

- `./src/stores/sites/useSitesStore.ts` - Site data management
- `./src/stores/settings/useSettingsStore.ts` - App settings
- `./src/stores/ui/useUiStore.ts` - UI state
- `./src/stores/error/useErrorStore.ts` - Error handling

### Theme System

- `./src/theme/components/ThemeProvider.tsx` - Theme context
- `./src/theme/components/ThemedBox.tsx` - Common box component
- `./src/theme/components/ThemedButton.tsx` - Common button
- `./src/theme/components/ThemedText.tsx` - Common text
- `./src/theme/useTheme.ts` - Theme hook

### Chart Components (Chart.js - Heavy)

- `./src/components/SiteDetails/charts/ResponseTimeChart.tsx`
- `./src/components/SiteDetails/charts/UptimeChart.tsx`
- `./src/components/SiteDetails/charts/StatusChart.tsx`
- `./src/components/common/HistoryChart.tsx`

### Chart Utilities

- `./src/services/chartConfig.ts` - Chart.js configuration
- `./src/utils/chartUtils.ts` - Chart utility functions

### Frequently Used Components

- `./src/components/Dashboard/SiteList/SiteList.tsx` - Main dashboard
- `./src/components/Header/Header.tsx` - App header
- `./src/components/SiteDetails/SiteDetails.tsx` - Site details view

### Shared Infrastructure

- `./shared/types.ts` - Type definitions
- `./shared/utils/environment.ts` - Environment utilities

## 🎯 Performance Benefits

### Expected Improvements:

1. **Faster Initial Load** - Pre-warmed files ready immediately
2. **Reduced Request Waterfalls** - Critical imports cached
3. **Better Chart Performance** - Chart.js components pre-loaded
4. **Smoother Navigation** - Core components ready

### Monitoring Results:

Use `npm run dev:warmup` to verify files are being warmed up correctly.

## 🔍 Identifying Additional Warmup Candidates

### Finding Slow Files:

```bash
npm run profile:transform
```

Look for:

- Files taking >50ms to transform
- Frequently imported utilities
- Large component trees

### Finding Import Waterfalls:

```bash
npm run profile
# Navigate your app, then press p + enter
```

Look for sequential import chains in the CPU profile.

## ⚡ Current Performance Optimizations

### Vite Configuration Optimizations

#### Build Target and Minification

```typescript
// vite.config.ts
export default defineConfig({
 build: {
  target: "esnext", // Use latest JS features for smaller bundles
  minify: "esbuild", // Fast minification
  sourcemap: true, // Enable for debugging
 },
});
```

#### Code Splitting Strategy

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Framework chunks
        'react-vendor': ['react', 'react-dom'],
        'electron-vendor': ['electron'],

        // Chart.js (large library)
        'chart-vendor': ['chart.js', 'chartjs-adapter-date-fns'],

        // UI framework
        'ui-vendor': ['@headlessui/react', 'react-hot-toast'],

        // Utilities
        'utils-vendor': ['date-fns', 'lodash-es', 'zustand'],
      }
    }
  }
}
```

#### Watch Configuration

```typescript
server: {
  watch: {
    awaitWriteFinish: {
      pollInterval: 100,
      stabilityThreshold: 500,
    },
    useFsEvents: true, // Native file system events
  }
}
```

### Plugin Optimizations

#### React Fast Refresh

```typescript
plugins: [
 react({
  fastRefresh: true, // Enable React Fast Refresh
  jsxRuntime: "automatic", // Modern JSX runtime
 }),
];
```

#### CSS Modules Enhancement

```typescript
import { patchCssModules } from "vite-css-modules";

plugins: [
 patchCssModules(), // Enhanced CSS modules support
];
```

#### Bundle Analysis

```typescript
// Development bundle analysis
import { analyzer } from "vite-bundle-analyzer";

plugins: [
 analyzer({
  analyzerMode: "server",
  openAnalyzer: false,
 }),
];
```

### Performance Monitoring

#### Bundle Size Visualization

```bash
npm run build
npm run analyze:bundle
```

#### Transform Debugging

```bash
npm run dev:warmup
```

Watch console for warmup effectiveness and transform times.

## 🎯 Performance Best Practices

### Component Optimization

1. **Use React.memo for expensive components**:

   ```tsx
   const SiteCard = React.memo(({ site }: { site: Site }) => {
    return <div>...</div>;
   });
   ```

2. **Lazy load heavy components**:

   ```tsx
   const ChartComponent = lazy(() => import("./ChartComponent"));
   ```

3. **Minimize prop drilling with Zustand stores**:
   ```tsx
   // Instead of passing props through multiple levels
   const { sites, updateSite } = useSitesStore();
   ```

### Import Optimization

1. **Use barrel exports sparingly**:

   ```typescript
   // Prefer direct imports
   import { Button } from "./components/Button";

   // Over barrel imports
   import { Button } from "./components";
   ```

2. **Import only what you need**:

   ```typescript
   // Good
   import { format } from "date-fns";

   // Avoid
   import * as dateFns from "date-fns";
   ```

3. **Use dynamic imports for large libraries**:
   ```typescript
   const chartJs = await import("chart.js");
   ```

### Build Optimization

1. **Monitor bundle size regularly**:

   ```bash
   npm run analyze:bundle
   ```

2. **Use profiling to identify bottlenecks**:

   ```bash
   npm run profile:transform
   npm run dev:profile
   ```

3. **Keep dependencies up to date**:
   ```bash
   npm run dep:check
   npm run dep:update
   ```

## 📚 Related Resources

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Development environment configuration
- [Testing Guide](./TESTING.md) - Test configuration and performance
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Performance debugging
- [Type-Fest Patterns](./TYPE_FEST_PATTERNS.md) - TypeScript optimization patterns

## 🎯 Quick Reference

### Performance Commands

```bash
# Development with warm-up
npm run dev:warmup

# Profile transforms
npm run profile:transform

# Profile runtime
npm run dev:profile

# Build analysis
npm run build && npm run analyze:bundle

# Check bundle sizes
npm run build -- --reporter verbose
```

### Key Files

- `vite.config.ts` - Vite configuration and optimizations
- `package.json` - Performance-related scripts
- `tsconfig.json` - TypeScript compilation settings
- `src/main.tsx` - Application entry point with warmup
- `electron/main.ts` - Electron main process optimizations

## 📝 Notes

- **Don't over-warmup**: Only warm frequently used files to avoid startup overhead
- **Monitor bundle size**: Warmup doesn't change bundle size, just loading timing
- **Profile regularly**: Re-profile after major changes to identify new bottlenecks
- **Use --open**: Consider adding `server.open` for automatic warmup on startup

## 🚨 Troubleshooting

### Profile files not generating?

- Ensure you press `p + enter` in the terminal running Vite
- Check current directory for `.cpuprofile` files

### Transform times seem wrong?

- Times are estimates due to async operations
- Look for relative patterns, not absolute numbers
- Use multiple runs for consistency

### Warmup not working?

- Check file paths are correct relative to project root
- Verify files exist and are valid TypeScript/JavaScript
- Monitor console for warmup-related errors
