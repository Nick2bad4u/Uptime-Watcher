---
name: "MJS-Guidelines"
description: "Guidance for writing modern, consistent JavaScript in .mjs modules."
applyTo: "**/*.mjs"
---

# JavaScript Modules (.mjs)

These guidelines focus ESM-first JavaScript using `.mjs` files. These aren't hard rules, but rather recommendations to improve consistency, readability, and maintainability across projects using modern MJS JavaScript.

## Module Style

### Imports and Exports

-   Use **ES modules exclusively** (`import` / `export`), no `require` / `module.exports`.
-   Prefer **named exports** for libraries and utilities:
-   Default exports only when there is a single primary concept.

### Syntax

-   Always use `const` when variables are not reassigned, `let` otherwise; avoid `var`.
-   Prefer **arrow functions** for short callbacks and inline functions; use `function` declarations for named, reusable logic.
-   Use template literals (`` `...${value}...` ``) instead of string concatenation.
-   Prefer destructuring for objects and arrays when it improves clarity.
-   Always strict mode types. Prefer JSDoc type annotations.

### Async and Promises

-   Use `async` / `await` for asynchronous workflows.
-   Handle errors explicitly with `try`/`catch` or by returning structured error results.
-   Keep async side effects (I/O, network, filesystem) close to the boundary of your module; keep pure logic separate.

### Types and Documentation

-   Prefer JSDoc type annotations or `.d.ts` files for `.mjs` modules.
-   Document public functions and exports with concise JSDoc comments explaining purpose and parameters.
