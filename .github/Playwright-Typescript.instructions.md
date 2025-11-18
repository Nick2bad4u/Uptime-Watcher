---
name: "Playwright-Test-Generation-Instructions"
description: "Playwright test writing guidelines and best practices for generating reliable and maintainable tests using TypeScript."
applyTo: "**/*.playwright.ts"
---

## Playwright Test Writing Guidelines

### Code Quality Standards

-   **Locators**: Prioritize user-facing, role-based locators (`getByRole`, `getByLabel`, `getByText`, etc.) for resilience and accessibility. Use `test.step()` to group interactions and improve test readability and reporting.
-   **Assertions**: Use auto-retrying web-first assertions. These assertions start with the `await` keyword (e.g., `await expect(locator).toHaveText()`). Avoid `expect(locator).toBeVisible()` unless specifically testing for visibility changes.
-   **Timeouts**: Rely on Playwright's built-in auto-waiting mechanisms. Avoid hard-coded waits or increased default timeouts.
-   **Clarity**: Use descriptive test and step titles that clearly state the intent. Add comments only to explain complex logic or non-obvious interactions.

### Test Structure

-   **Imports**: Start with `import { expect, test } from '@playwright/test';`.
-   **Organization**: Group related tests for a feature under a `test.describe()` block.
-   **Hooks**: Use `beforeEach` for setup actions common to all tests in a `describe` block (e.g., navigating to a page).
-   **Titles**: Follow a clear naming convention, such as `Feature - Specific action or scenario`.

### File Organization

-   **Location**: Store all test files in the `tests/` directory.
-   **Naming**: Use the convention `<feature-or-page>.spec.ts` (e.g., `login.spec.ts`, `search.spec.ts`).
-   **Scope**: Aim for one test file per major application feature or page.

### Assertion Best Practices

-   **UI Structure**: Use `toMatchAriaSnapshot` to verify the accessibility tree structure of a component. This provides a comprehensive and accessible snapshot.
-   **Element Counts**: Use `toHaveCount` to assert the number of elements found by a locator.
-   **Text Content**: Use `toHaveText` for exact text matches and `toContainText` for partial matches.
-   **Navigation**: Use `toHaveURL` to verify the page URL after an action.

## Example Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Movie Search Feature", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application before each test
        await page.goto("https://debs-obrien.github.io/playwright-movies-app");
    });

    test("Search for a movie by title", async ({ page }) => {
        await test.step("Activate and perform search", async () => {
            await page.getByRole("search").click();
            const searchInput = page.getByRole("textbox", {
                name: "Search Input",
            });
            await searchInput.fill("Garfield");
            await searchInput.press("Enter");
        });

        await test.step("Verify search results", async () => {
            // Verify the accessibility tree of the search results
            await expect(page.getByRole("main")).toMatchAriaSnapshot(`
        - main:
          - heading "Garfield" [level=1]
          - heading "search results" [level=2]
          - list "movies":
            - listitem "movie":
              - link "poster of The Garfield Movie The Garfield Movie rating":
                - /url: /playwright-movies-app/movie?id=tt5779228&page=1
                - img "poster of The Garfield Movie"
                - heading "The Garfield Movie" [level=2]
      `);
        });
    });
});
```

## Electron Special Instructions

-   **Setup** Ensure Electron is properly configured in your Playwright environment.
-   **Setup** Electron requires some additional setup, you can use the following documents to help you if you are setting up for the first time.
    -   [Playwright Electron Documentation](https://playwright.dev/docs/api/class-electron)
    -   [More Playwright Information](https://playwright.dev/docs/api/class-electronapplication)
    -   [Electron Playwright Setup](https://www.electronjs.org/docs/latest/tutorial/automated-testing#using-playwright)
-   **Misc** When writing tests for Electron applications, ensure you are interacting with the correct windows and contexts. Use `electronApp` to manage application instances and windows.
-   **Note** Electron applications may have different behaviors compared to standard web applications, so ensure your tests account for these differences.
