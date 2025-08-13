# Vite Performance Profiling and Optimization Guide

This document outlines how to use the newly added performance profiling scripts and warmup configuration for the Uptime Watcher application.

## 🔧 New Scripts Available

### Debug & Profiling Scripts

- **`npm run debug:transform`** - Shows transform times for each file (identifies slow transformations)
- **`npm run debug:vite`** - General Vite debug output
- **`npm run profile`** - Runs Vite with CPU profiling enabled
- **`npm run profile:debug`** - Combines profiling with debug output
- **`npm run profile:transform`** - Shows detailed transform timing information
- **`npm run dev:profile`** - Development server with profiling enabled
- **`npm run dev:warmup`** - Development server with transform debugging to verify warmup

## 📊 How to Use Profiling

### 1. Transform Performance Analysis
```bash
npm run debug:transform
```
Look for files taking >50ms to transform. Example output:
```text
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
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

The following files are pre-warmed for optimal performance:

### Core Application
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

### Key Components
- `./src/components/Dashboard/SiteList/SiteList.tsx` - Main dashboard
- `./src/components/Header/Header.tsx` - App header
- `./src/components/SiteDetails/SiteDetails.tsx` - Site details view

### Shared Infrastructure
- `./shared/types/index.ts` - Type definitions
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
npm run debug:transform
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
