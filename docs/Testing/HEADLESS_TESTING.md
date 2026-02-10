---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Headless Electron Testing"
summary: "Explains how Uptime Watcher simulates headless Electron testing via environment flags and window visibility controls, and how Playwright integrates with this mode."
created: "2025-11-21"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "testing"
 - "electron"
 - "playwright"
 - "uptime-watcher"
---

# Headless Electron Testing

This document explains how headless mode works for Electron testing in this project.

## Overview

Unlike regular browsers, Electron doesn't support true "headless" mode. However, we've implemented a workaround that prevents windows from showing during testing, effectively simulating headless behavior.

## How It Works

### 1. Environment Variable Control

The Electron app checks for headless mode using these environment variables (in order of precedence):

- `HEADLESS=true` - Explicit headless mode
- `CI=true` - Automatically enables headless in CI environments
- `--headless` command line argument
- `--test-headless` command line argument

### 2. Window Show Prevention

When headless mode is detected, the `WindowService` skips calling `window.show()` in the `ready-to-show` event handler. The window is still created and functional (for testing DOM interactions), but remains hidden.

### 3. Automatic Configuration

Playwright tests automatically enable headless mode via:

- **Global Setup**: Sets `HEADLESS=true` environment variable
- **Electron Helper**: Passes `HEADLESS=true` to launched Electron processes
- **Configuration**: Documents the headless behavior in playwright.config.ts

## Usage

### Running Tests Headless (Default)

```bash
npx playwright test
```

All Playwright tests run in headless mode by default.

### Running Tests with Visible Windows (Debug)

To see windows during testing (useful for debugging):

```bash
HEADLESS=false npx playwright test
# or
npx playwright test --headed  # For browser portions only
```

### Manual Electron Launch (Headless)

```bash
cross-env HEADLESS=true npm run electron-dev
# or (run Vite separately, then launch Electron headless)
npm run dev
npm run electron -- --headless
```

### CI Environment

In CI environments, headless mode is automatically enabled when `CI=true` is set.

## Benefits

1. **Faster Execution**: No window rendering overhead
2. **CI Compatibility**: Works in headless CI environments without Xvfb on Linux
3. **Reliable Testing**: Prevents window focus issues and race conditions
4. **Resource Efficiency**: Lower memory and CPU usage during tests

## Implementation Details

### WindowService Changes

```typescript
private readonly handleReadyToShow = (): void => {
    logger.info("[WindowService] Main window ready to show");

    // Check for headless mode (for testing environments)
    const isHeadless = process.env["HEADLESS"] === "true" ||
                      process.env["CI"] === "true" ||
                      process.argv.includes("--headless") ||
                      process.argv.includes("--test-headless");

    if (isHeadless) {
        logger.info("[WindowService] Running in headless mode - window will not be shown");
        return;
    }

    this.mainWindow?.show();
};
```

### Playwright Configuration

The `playwright.config.ts` includes documentation explaining that the `headless` setting affects browser tests but NOT Electron tests, since Electron headless is controlled at the application level.

## Platform Support

- **Windows**: Works natively
- **macOS**: Works natively
- **Linux**: Works natively (no Xvfb required with this implementation)

## Related Resources

- [Playwright Electron Documentation](https://playwright.dev/docs/api/class-electron)
- [GitHub Issue: Headless Electron](https://github.com/microsoft/playwright/issues/13288)
- [Electron Testing on Headless CI](https://electronjs.org/docs/latest/tutorial/testing-on-headless-ci)
