# 🎭 Playwright Testing Guide for Uptime-Watcher

## 📖 Overview

This guide covers Playwright test configuration, common issues, and best practices specific to the Uptime-Watcher Electron application.

## 🚀 Quick Start

### Running Tests

```bash
# Run all Playwright tests
npx playwright test

# Run tests in headed mode (see windows)
npx playwright test --headed

# Run specific test file
npx playwright test app-launch.debug.playwright.test.ts

# Run tests with reporter
npx playwright test --reporter=list

# Open test UI
npx playwright test --ui
```

### Test Structure

Tests are organized by type with specific naming patterns:

```text
- **/main-process.*.playwright.test.ts - Main process tests
- **/renderer-process.*.playwright.test.ts - Renderer process tests
- **/app-launch.*.playwright.test.ts - App launch and initialization tests
- **/ui-*.playwright.test.ts - UI component tests
- **/e2e-*.e2e.playwright.test.ts - End-to-end workflow tests
```

## 🔧 Configuration

### Project Structure

```text
playwright/
├── fixtures/
│   ├── electron-helpers.ts      # Electron launch utilities
│   ├── global-setup.ts          # Global test setup
│   └── global-teardown.ts       # Global test cleanup
├── tests/                       # Test files
├── utils/
│   └── ui-helpers.ts            # UI testing utilities
└── tsconfig.json               # TypeScript config for tests
```

### Test Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `playwright/tsconfig.json` - TypeScript settings for tests
- `playwright/fixtures/global-setup.ts` - Pre-test environment setup
- `playwright/fixtures/global-teardown.ts` - Post-test cleanup

## ⚠️ Critical Issues & Solutions

### 🔴 Issue: Electron Launch Method

**Problem:** Tests fail with timeout errors or blank windows when using incorrect Electron launch arguments.

**Symptoms:**

- Tests timeout waiting for `firstWindow()`
- Blank/empty Electron windows
- `waitForAppInitialization` failures
- Dev tools show `file://` URLs instead of `http://localhost:5173`

**Root Cause:** Using absolute path to `main.js` instead of project root directory.

#### ❌ Incorrect Approach (Causes Issues)

```typescript
// DON'T DO THIS - causes blank windows and timeouts
export async function launchElectronApp() {
 return await electron.launch({
  args: [
   path.join(__dirname, "../../dist/main.js"), // ❌ Absolute path
   // ...
  ],
  env: {
   NODE_ENV: "test", // ❌ Wrong environment
   // ...
  },
 });
}
```

#### ✅ Correct Approach (Follows Electron Standards)

```typescript
// DO THIS - follows Electron + Playwright best practices
export async function launchElectronApp() {
 return await electron.launch({
  args: [
   ".", // ✅ Project root - lets Electron read package.json
   // ...
  ],
  env: {
   ...process.env,
   // ✅ Don't override NODE_ENV - inherit from environment
   // ...
  },
  timeout: 30000, // ✅ Add timeout
 });
}
```

**Why This Works:**

1. `args: ["."]` launches from project root directory
2. Electron reads `package.json` to find `"main": "dist/main.js"`
3. Preserves proper working directory context
4. Allows correct relative path resolution
5. Maintains environment inheritance for dev/prod detection

**Reference:** This follows the same pattern as our working `scripts/codegen.mjs` script.

### 🔴 Issue: Test Discovery

**Problem:** Tests not found with "No tests found" error.

**Solution:** Ensure test files match the naming patterns defined in `playwright.config.ts`:

```typescript
// Test file naming must match these patterns:
testMatch: "**/main-process.*.playwright.test.ts"; // Main process
testMatch: "**/renderer-process.*.playwright.test.ts"; // Renderer
testMatch: "**/app-launch.*.playwright.test.ts"; // App launch
testMatch: "**/ui-*.playwright.test.ts"; // UI tests
testMatch: "**/e2e-*.e2e.playwright.test.ts"; // E2E tests
```

### 🔴 Issue: Environment Detection

**Problem:** App behaves differently in test vs normal mode.

**Solution:** The app uses `isDev()` function that checks:

1. `NODE_ENV === "development"`
2. `!app.isPackaged`

For tests to work properly:

- Don't override `NODE_ENV` in test environment
- Let environment inherit from current shell
- Run tests with `NODE_ENV=development` if needed

## 🧪 Common Test Patterns

### Basic Electron App Launch

```typescript
import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization } from "../utils/ui-helpers";

test("basic app functionality", async () => {
 const electronApp = await launchElectronApp();
 const page = await electronApp.firstWindow();

 try {
  // Wait for app to fully initialize
  await waitForAppInitialization(page);

  // Your test logic here
  const title = await page.title();
  expect(title).toBe("Uptime Watcher");
 } finally {
  await electronApp.close();
 }
});
```

### UI Component Testing

```typescript
test("modal interactions", async () => {
 const electronApp = await launchElectronApp();
 const page = await electronApp.firstWindow();

 try {
  await waitForAppInitialization(page);

  // Find and click button
  const addSiteButton = page.getByRole("button", { name: "Add new site" });
  await addSiteButton.click();

  // Verify modal appears
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
 } finally {
  await electronApp.close();
 }
});
```

### Debug Helpers

```typescript
// Take screenshots for debugging
await page.screenshot({
 path: "debug-screenshot.png",
 fullPage: true,
});

// Log all buttons for debugging
const buttons = await page.getByRole("button").all();
for (let i = 0; i < buttons.length; i++) {
 const text = await buttons[i].textContent();
 const ariaLabel = await buttons[i].getAttribute("aria-label");
 console.log(`Button ${i}: "${text}" (${ariaLabel})`);
}
```

## 🎯 Best Practices

### 1. **Always Use Proper Launch Method**

- Use `args: ["."]` not absolute paths to `main.js`
- Include timeout for reliability
- Don't override `NODE_ENV` unless necessary

### 2. **Test Isolation**

- Each test should launch its own Electron instance
- Always close apps in `finally` blocks
- Use unique test data to avoid conflicts

### 3. **Wait Strategies**

- Use `waitForAppInitialization()` for app readiness
- Use appropriate timeouts for different operations
- Wait for specific elements before interacting

### 4. **Error Handling**

- Wrap tests in try/finally blocks
- Take screenshots on failures for debugging
- Log relevant state for troubleshooting

### 5. **Performance**

- Use `fullyParallel: false` for Electron tests
- Limit workers for stability
- Avoid running too many Electron instances simultaneously

## 🔍 Troubleshooting

### Test Timeouts

1. Check if app is actually launching:

   ```typescript
   console.log("App launched successfully");
   const windows = electronApp.windows();
   console.log("Window count:", windows.length);
   ```

2. Verify environment setup:

   ```bash
   # Check NODE_ENV
   echo $NODE_ENV  # Should be 'development' for dev mode

   # Verify build exists
   ls dist/main.js

   # Check if dev server is running
   curl http://localhost:5173
   ```

3. Take screenshots to see what's rendered:
   ```typescript
   await page.screenshot({ path: "debug.png", fullPage: true });
   ```

### Blank Windows

Usually caused by:

- Incorrect launch arguments (use `args: ["."]`)
- Wrong environment detection
- Missing dev server
- Build issues

### Element Not Found

1. Wait for app initialization first
2. Check element selectors and roles
3. Verify element is actually rendered
4. Use debug helpers to inspect DOM

## 📚 Additional Resources

- [Playwright Electron Documentation](https://playwright.dev/docs/api/class-electronapplication)
- [Project Codegen Guide](./PLAYWRIGHT_CODEGEN_GUIDE.md)
- [Electron Testing Best Practices](https://www.electronjs.org/docs/latest/tutorial/automated-testing)

## 🚨 Emergency Fixes

If tests suddenly stop working:

1. **Check Electron launch method** - ensure using `args: ["."]`
2. **Verify NODE_ENV** - should inherit from environment
3. **Confirm build exists** - run `npm run build`
4. **Test manually** - try `node scripts/codegen.mjs --electron`
5. **Check dev server** - ensure it starts when needed

This issue was documented after resolving massive test failures (202/206 failing) caused by incorrect Electron launch configuration.
