---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Playwright Codegen Setup Guide for Uptime-Watcher"
summary: "End-to-end instructions for using Playwright codegen with Uptime Watcher, including Electron launch patterns, template adaptation, and workflow examples."
created: "2025-11-21"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
 - "testing"
 - "playwright"
 - "codegen"
 - "uptime-watcher"
---

# 🎭 **Playwright Codegen Setup Guide for Uptime-Watcher**

## Table of Contents

1. [� **Quick Start with Helper Script**](#-quick-start-with-helper-script)
2. [📋 **Manual Setup**](#-manual-setup)
3. [🚀 **Step-by-Step Setup for Uptime-Watcher**](#-step-by-step-setup-for-uptime-watcher)
4. [🛠 **Codegen Best Practices for Your Project**](#-codegen-best-practices-for-your-project)
5. [📝 **Advanced Codegen Techniques**](#-advanced-codegen-techniques)
6. [🎯 **Workflow for Creating Tests**](#-workflow-for-creating-tests)
7. [🧪 **Testing Different Scenarios**](#-testing-different-scenarios)
8. [🔧 **Troubleshooting Codegen**](#-troubleshooting-codegen)
9. [📚 **Next Steps**](#-next-steps)
10. [🎉 **Example Generated Test (Adapted)**](#-example-generated-test-adapted)
11. [📚 **Related Documentation**](#-related-documentation)

## � **Quick Start with Helper Script**

We've included a helper script to make codegen easier:

```bash
# Using development server (recommended)
node scripts/codegen.mjs

# With custom viewport
node scripts/codegen.mjs --viewport=1920x1080

# Save to specific file
node scripts/codegen.mjs --output=my-test.ts

# Show help
node scripts/codegen.mjs --help
```

Helper Script:

- ✅ Starts the development server
- ✅ Handles proper codegen command setup
- ✅ Provides clear next steps
- ✅ Works with both dev server and Electron modes

## 📋 **Manual Setup**

### **1. Basic Codegen Command**

```bash
# Generate tests for web apps
npx playwright codegen

# Generate tests for specific URL
npx playwright codegen https://example.com

# Generate tests with specific browser
npx playwright codegen --browser=chromium
```

### **2. Electron App Codegen (Your Use Case)**

Since Uptime-Watcher is an Electron app, you need to use a special approach:

```bash
# First, build your Electron app
npm run build

# Then use codegen with Electron
npx playwright codegen --target=electron path/to/your/electron/app
```

## 🚀 **Step-by-Step Setup for Uptime-Watcher**

### **Step 1: Prepare Your App**

```bash
# Build the Electron app first
npm run build

# Verify the build exists
ls dist/
```

### **Step 2: Start Codegen with Electron**

```bash
# Option A: Direct Electron codegen (if supported)
npx playwright codegen --browser=electron ./dist/main.js

# Option B: Use development server approach
npm run dev &  # Start dev server in background
npx playwright codegen http://localhost:5173  # Use the dev server URL
```

### **Step 3: Alternative - Manual Test Creation**

If direct Electron codegen doesn't work perfectly, create tests manually with this pattern:

```typescript
/**
 * Generated test template for Uptime-Watcher
 */
import { test, expect, _electron as electron } from "@playwright/test";
import * as path from "node:path";

test.describe("My Generated Tests", () => {
 test("my generated test", async () => {
  // Launch Electron app
  const electronApp = await electron.launch({
   args: [path.join(__dirname, "../../dist/main.js")],
   env: {
    ...process.env,
    NODE_ENV: "test",
   },
  });

  // Get the main window
  const window = await electronApp.firstWindow();
  await window.waitForLoadState("domcontentloaded");

  // Wait for React app to initialize
  await expect(window.getByRole("#root")).toBeVisible({ timeout: 15000 });
  await expect(window.getByRole("#root")).not.toBeEmpty({ timeout: 10000 });

  // === YOUR GENERATED INTERACTIONS GO HERE ===
  // Example:
  // await window.click("button");
  // await window.fill("input", "value");
  // await expect(window.getByRole("text=Something")).toBeVisible();

  // Close the app
  await electronApp.close();
 });
});
```

## 🛠 **Codegen Best Practices for Your Project**

### **1. Test File Naming Convention**

Based on your project structure, name your generated tests:

```text
playwright/tests/
├── my-feature.ui.playwright.test.ts        # For UI component tests
├── app-launch.my-feature.playwright.test.ts # For E2E tests
├── main-process.my-feature.playwright.test.ts # For main process tests
└── renderer-process.my-feature.playwright.test.ts # For renderer tests
```

### **2. Project-Specific Configuration**

Add these to your generated tests to match your project patterns:

```typescript
test.describe(
 "My Feature Tests",
 {
  tag: [
   "@ui",
   "@my-feature",
   "@generated",
  ],
  annotation: {
   type: "category",
   description: "Generated tests for my feature",
  },
 },
 () => {
  // Your tests here
 }
);
```

### **3. Common Selectors for Your App**

When using codegen, these are the key selectors that work in your app:

```typescript
// Main containers
".app-container";
".main-container";
".header-title-accent";

// Buttons
"button"; // Generic buttons
'button:has-text("Add")'; // Add site button
'button[aria-label="Settings"]'; // Settings button
'button[aria-label="Toggle theme"]'; // Theme toggle

// Forms
"input[type='url']"; // URL inputs
"input[placeholder*='name']"; // Name inputs
"form"; // Form containers

// Status indicators
".status-up";
".status-down";
".status-pending";
".themed-status-indicator";
```

## 📝 **Advanced Codegen Techniques**

### **1. Generate Tests with Custom Viewport**

```bash
npx playwright codegen --viewport-size=1280,720 http://localhost:5173
```

### **2. Generate Tests with Device Emulation**

```bash
npx playwright codegen --device="Desktop Chrome" http://localhost:5173
```

### **3. Generate Tests with Specific Output**

```bash
# Save generated test to specific file
npx playwright codegen --target=javascript --output=my-test.js http://localhost:5173

# Generate TypeScript (default)
npx playwright codegen --target=typescript --output=my-test.ts http://localhost:5173
```

## 🎯 **Workflow for Creating Tests**

### **Complete Workflow:**

1. **Start your app in development mode:**

   ```bash
   npm run dev
   ```

2. **Open codegen:**

   ```bash
   npx playwright codegen http://localhost:5173
   ```

3. **Record your interactions** in the Playwright Inspector

4. **Copy the generated code**

5. **Adapt it to your Electron test pattern:**

   ```typescript
   // Replace browser.newPage() with Electron launch pattern
   const electronApp = await electron.launch({
    args: [path.join(__dirname, "../../dist/main.js")],
    env: { ...process.env, NODE_ENV: "test" },
   });
   const window = await electronApp.firstWindow();
   ```

6. **Add proper test metadata** (tags, annotations)

7. **Add to appropriate test file** based on naming convention

8. **Run and verify:**
   ```bash
   npx playwright test your-new-test.ts
   ```

## 🧪 **Testing Different Scenarios**

### **UI Component Testing:**

```bash
# Start app and navigate to specific component
npm run dev
npx playwright codegen http://localhost:5173
# Record interactions with specific UI components
```

### **E2E Workflow Testing:**

```bash
# Record complete user workflows
npx playwright codegen http://localhost:5173
# Record: Add site → Monitor → View results → Settings
```

### **Error State Testing:**

```bash
# Record error scenarios
npx playwright codegen http://localhost:5173
# Record: Invalid inputs → Error messages → Recovery
```

## 🔧 **Troubleshooting Codegen**

### **Common Issues:**

1. **Electron app not launching in codegen:**
   - Use development server instead: `npm run dev` + `npx playwright codegen http://localhost:5173`

2. **Generated selectors not working:**
   - Check the actual DOM structure in your app
   - Use the selectors that work in your existing tests

3. **TypeScript errors in generated code:**
   - Make sure to adapt the generated code to your Electron test pattern
   - Use proper imports and types

### **Debug Generated Tests:**

```bash
# Run with debug mode
npx playwright test --debug your-test.ts

# Run with UI mode
npx playwright test --ui your-test.ts
```

## 📚 **Next Steps**

After generating tests:

1. **Organize** them into appropriate test files
2. **Add proper metadata** (tags, annotations)
3. **Add them to CI/CD** pipeline
4. **Review and refactor** for maintainability
5. **Add accessibility checks** where needed

## 🎉 **Example Generated Test (Adapted)**

Here's what a completed generated test might look like:

```typescript
import { test, expect, _electron as electron } from "@playwright/test";
import * as path from "node:path";

test.describe(
 "Add Site Workflow - Generated",
 {
  tag: [
   "@e2e",
   "@generated",
   "@add-site",
  ],
  annotation: {
   type: "workflow",
   description: "Generated test for adding a new site",
  },
 },
 () => {
  test("should add a new site successfully", async () => {
   const electronApp = await electron.launch({
    args: [path.join(__dirname, "../../dist/main.js")],
    env: { ...process.env, NODE_ENV: "test" },
   });

   const window = await electronApp.firstWindow();
   await window.waitForLoadState("domcontentloaded");
   await expect(window.getByRole("#root")).toBeVisible({ timeout: 15000 });

   // Generated interactions (adapted from codegen)
   await window.click('button[aria-label="Add new site"]');
   await window.fill('input[type="url"]', "https://example.com");
   await window.fill('input[placeholder*="name"]', "Example Site");
   await window.click('button[type="submit"]');

   // Verify result
   await expect(window.getByRole('text="Example Site"')).toBeVisible();

   await electronApp.close();
  });
 }
);
```

This gives you a complete setup for using Playwright codegen with your Uptime-Watcher Electron application! 🎭✨

## 📚 **Related Documentation**

- [Complete Playwright Testing Guide](./PLAYWRIGHT_TESTING_GUIDE.md) - Comprehensive testing setup, troubleshooting, and best practices
