# 🎭 __Using the Codegen Template with Recorded Tests__

## __🚀 Quick Start (Recommended)__

Use the built-in helper scripts that automatically apply your `codegen-template.mjs` transforms:

```bash
# 🌐 Web/Development Server Recording
npm run playwright:codegen              # Auto-starts dev server + records
npm run playwright:codegen-chrome       # Chrome-specific recording

# 📱 Electron App Recording
npm run playwright:record               # Full Electron recording with inspector
npm run playwright:codegen-electron     # Alternative Electron recording
```

## __🔧 Manual Workflow__

### __Step 1: Record Your Test__

```bash
# Start development server (if not using Electron)
npm run dev

# Record your test actions
npx playwright codegen http://localhost:5173 --output=my-new-test.spec.ts
```

### __Step 2: Apply Template Transformations__

```bash
# Transform the recorded test with your template
npm run playwright:transform my-new-test.spec.ts
```

This automatically converts:

* ❌ `page.getByRole("button")` → ✅ `page.getByRole("button")`
* ❌ `page.getByRole("[data-testid=submit]")` → ✅ `page.getByTestId("submit")`
* ❌ `test("Click button")` → ✅ `test("should click button")`
* ❌ Raw test structure → ✅ Proper `describe` blocks

## __🎯 What Your Template Does__

Your `codegen-template.mjs` automatically transforms generated code for:

### __🔍 Semantic Locators__

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

### __📝 Better Test Structure__

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

### __🛡️ Lint Compliance__

* Removes problematic `networkidle` usage
* Adds proper TypeScript imports
* Adds TODO comments for problematic selectors
* Follows project coding standards

## __💡 Advanced Usage__

### __Transform Multiple Files__

```bash
# Transform all recorded tests in a directory
for file in playwright/recorded-tests/*.spec.ts; do
    npm run playwright:transform "$file"
done
```

### __Custom Output Location__

```bash
npm run playwright:transform input-test.spec.ts output-test.spec.ts
```

### __Integration with Your Development Workflow__

1. __Record tests__ using the helper scripts
2. __Review generated code__ - it's already optimized!
3. __Add custom assertions__ as needed
4. __Run tests__ with `npm run playwright`

## __� Screenshot Best Practices__

### __Use Screenshot Helpers__

```typescript
import { takeScreenshot, debugScreenshot } from "../helpers/screenshot";

// Automatic path and naming
await takeScreenshot(page, "login-form");
await debugScreenshot(window, "after-modal-open");
```

### __Manual Screenshots (if needed)__

Always use proper paths for screenshots:

````typescript
Always use proper paths for screenshots:

```typescript
// ✅ Good - saves to playwright test-results directory
await page.screenshot({ path: "playwright/test-results/screenshots/my-screenshot.png" });

// ❌ Bad - saves to project root
await page.screenshot({ path: "my-screenshot.png" });
````

## __�🚨 Troubleshooting__

### __If transforms aren't applied automatically:__

Check that `playwright/codegen-template.mjs` exists and the `scripts/codegen.mjs` can load it.

### __If Electron recording doesn't work:__

```bash
# Ensure app is built first
npm run build

# Use inspector mode for full recording capabilities
npm run playwright:record
```

### __If you need to debug generated tests:__

```bash
# Run tests in debug mode
npm run playwright:debug
```

## __📖 Example Workflow__

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
