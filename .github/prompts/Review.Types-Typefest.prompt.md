---
agent: "BeastMode"
argument-hint: "Improve Type Safety & Implement Type-Fest"
name: "Strict-Types-Scanner"
description: "Systematically harden TypeScript types and implement type-fest utilities."
---
# Review and Harden TypeScript Definitions
---

*Note: This is a recursive prompt designed to continuously improve the TypeScript codebase. The goal is to progressively eliminate loose types, replace them with strict definitions, and leverage the `type-fest` library for better utility types. You must scan files iteratively. As you finish one module, move on to the next area that needs improvement.*

## Workflow
1. **Scan for Loose Types**:
   - Identify areas using `any`, `as any`, loose `object`, or untyped `Function` definitions.
   - Prioritize core domain logic and shared utilities.
2. **Implement `type-fest` Utilities**:
   - Refactor complex mapped types using `type-fest` equivalents (e.g., `Merge`, `Opaque`, `Jsonifiable`, `SetOptional`) where they improve readability or safety.
3. **Tighten Null/Undefined Handling**:
   - Look for potential runtime errors masked by optional chaining or lack of strict null checks.
4. **Refactor Unions and Enums**:
   - Improve string literals by converting them to Unions or Enums.
   - Use Template Literal Types for pattern-matching strings where appropriate.
5. **Use unlimited requests and time as needed.**
6. **Do not skip complex files.** These often yield the highest value when typed strictly.
7. **Iterative Loop**: Once a file is refactored, verify it against the compiler, then look for the next candidate file.
8. Continue the process until the codebase is significantly hardened.

---
## Type-Fest Implementation Guidelines
### General Guidelines
1. **Prefer Utility over Boilerplate**: If you encounter complex custom types, check if `type-fest` offers a standard utility to replace them.
2. **Opaque Types**: Consider using `Opaque` types for identifiers (like IDs) to prevent mixing different types of strings or numbers.
3. **Strict JSON Handling**: Improve API response types using `Jsonify` or `JsonValue` where applicable.
4. **Readonly**: Apply immutability checks where logical.

### Recommended Utilities to Look For
- `Opaque` (Branding)
- `Merge` (Interface merging)
- `Except` / `SetOptional`
- `Simplify` (Better IDE tooltips)
- `PartialDeep` / `ReadonlyDeep`
- `AsyncReturnType`

---
## Special Instructions
- **Reduce `any`**: Aim to replace `any` with `unknown` or specific types wherever possible.
- **Inference**: Look for variables relying on implicit `any` and add annotations.
- **Generics**: Ensure Generics have appropriate constraints (e.g., `extends`) rather than being unbounded.
- **Documentation**: If a type becomes complex during refactoring, add TSDoc comments explaining the logic.
- **Logic Checks**: If strictly typing a file reveals logical bugs, document them or fix them if the solution is obvious.

---
## Requirements
- Improve type safety in scanned files.
- Ensure the project compiles without errors after changes.
- Use `type-fest` where it adds value or clarity.
- Document any major refactors.

### Important AI Note
- **Time constraint setting:** `unlimited`
- **Compute Resource setting:** `unlimited`
- **Thinking Mode setting:** `Ultrathink`
- **Loop Mode:** `Enabled` (Keep scanning for new files to improve).
- **Self-Review:** After each change, review the modifications for potential improvements or oversights.


### Repeated Prompt
- If you feel you have scanned everything, restart the process to catch any missed files or new areas for improvement. Look at your context and scan areas that aren't in there yet. Get all the way down to the nested folders and files, no matter how small.
