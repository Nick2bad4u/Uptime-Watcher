---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Playwright Codegen Template Usage"
summary: "How to use the custom Playwright codegen template and helper scripts to transform recorded tests into lint-compliant suites for Uptime Watcher."
created: "2025-11-21"
last_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:
  - "testing"
  - "playwright"
  - "codegen"
  - "uptime-watcher"
---
# 🎭 **Using the Codegen Template with Recorded Tests**

## **🚀 Quick Start (Recommended)**

Use the built-in helper scripts that automatically apply your `codegen-template.mjs` transforms:

```bash
# 🌐 Web/Development Server Recording
npm run playwright:codegen              # Auto-starts dev server + records
npm run playwright:codegen-chrome       # Chrome-specific recording

# 📱 Electron App Recording
npm run playwright:record               # Full Electron recording with inspector
npm run playwright:codegen-electron     # Alternative Electron recording
```

## **🔧 Manual Workflow**

### **Step 1: Record Your Test**

```bash
# Start development server (if not using Electron)
npm run dev

# Record your test actions
npx playwright codegen http://localhost:5173 --output=my-new-test.spec.ts
```

### **Step 2: Apply Template Transformations**

```bash
# Transform the recorded test with your template
npm run playwright:transform my-new-test.spec.ts
```

This automatically converts:

- ❌ `page.getByRole("button")` → ✅ `page.getByRole("button")`
- ❌ `page.getByRole("[data-testid=submit]")` → ✅ `page.getByTestId("submit")`
- ❌ `test("Click button")` → ✅ `test("should click button")`
- ❌ Raw test structure → ✅ Proper `describe` blocks

## **🎯 What Your Template Does**

Your `codegen-template.mjs` automatically transforms generated code for:

### **🔍 Semantic Locators**

```typescript
// Before (raw CSS selectors)
page.getByRole("button");
page.getByRole("input[type=text]");
page.getByRole("[data-testid=login-form]");

// After (semantic locators)
page.getByRole("button");
page.getByRole("textbox");
page.getByTestId("login-form");
```

### **📝 Better Test Structure**

```typescript
// Before (basic structure)
test("Login test", async ({ page }) => {
 // test code
});

// After (proper describe blocks)
test.describe("Login functionality", () => {
 test("should login successfully", async ({ page }) => {
  // test code
 });
});
```

### **🛡️ Lint Compliance**

- Removes problematic `networkidle` usage
- Adds proper TypeScript imports
- Adds TODO comments for problematic selectors
- Follows project coding standards

## **💡 Advanced Usage**

### **Transform Multiple Files**

```bash
# Transform all recorded tests in a directory
for file in playwright/recorded-tests/*.spec.ts; do
    npm run playwright:transform "$file"
done
```

### **Custom Output Location**

```bash
npm run playwright:transform input-test.spec.ts output-test.spec.ts
```

### **Integration with Your Development Workflow**

1. **Record tests** using the helper scripts
2. **Review generated code** - it's already optimized!
3. **Add custom assertions** as needed
4. **Run tests** with `npm run playwright`

## **� Screenshot Best Practices**

### **Use Screenshot Helpers**

```typescript
import { takeScreenshot, debugScreenshot } from "../helpers/screenshot";

// Automatic path and naming
await takeScreenshot(page, "login-form");
await debugScreenshot(window, "after-modal-open");
```

### **Manual Screenshots (if needed)**

Always use proper paths for screenshots:

````typescript



Always use proper paths for screenshots:```typescript
// ✅ Good - saves to playwright test-results directory
await page.screenshot({ path: "playwright/test-results/screenshots/my-screenshot.png" });

// ❌ Bad - saves to project root
await page.screenshot({ path: "my-screenshot.png" });
````

## **�🚨 Troubleshooting**

### **If transforms aren't applied automatically:**

Check that `playwright/codegen-template.mjs` exists and the `scripts/codegen.mjs` can load it.

### **If Electron recording doesn't work:**

```bash
# Ensure app is built first
npm run build

# Use inspector mode for full recording capabilities
npm run playwright:record
```

### **If you need to debug generated tests:**

```bash
# Run tests in debug mode
npm run playwright:debug
```

## **📖 Example Workflow**

```bash
# 1. Start recording session
npm run playwright:codegen

# 2. Perform your test actions in the browser
#    (click buttons, fill forms, navigate, etc.)

# 3. Copy generated code from codegen tool
#    (it's already transformed with your template!)

# 4. Save to test file
# playwright/tests/my-feature.spec.ts

# 5. Run your test
npm run playwright
```

Your template ensures the generated code follows best practices automatically! 🎉
