---
name: "JSON-Guidelines"
description: "Instructions for writing clear, consistent JSON for configs and code."
applyTo: "**/*.json"
---

# JSON

Guidelines for writing JSON that is easy to read, safe to parse, and works well with modern tools (linters, secret scanners, CI). The main goals are:

1. **Be strict.** JSON is less forgiving than YAML—small mistakes break parsers. Use a predictable structure.
2. **Be intentional.** Every field should have a clear purpose; avoid accidental secrets, noisy data, or ambiguous shapes.

These aren't hard rules, but rather recommendations to improve consistency, readability, and maintainability across projects using JSON.

## Style

-   **DO** use spaces, not tabs (typically 2 or 4 spaces; be consistent within a repo).
-   **DO** use double quotes for all keys and string values, per the JSON spec.
-   **DO** keep one top-level object per file unless a tool explicitly requires arrays.
-   **DON'T** add trailing commas; JSON does not allow them.
-   **PREFER** a consistent key order within objects (e.g., metadata first: `$schema`, `name`, `version`, then config).
-   **PREFER** keeping lines reasonably short (≤ 120–160 chars) while still keeping small objects on one line when they’re simple.
-   **CONSIDER** pretty-printing with stable indentation for files committed to version control; reserve minified JSON only for build artifacts.

---

## Structure

-   **DO** choose clear, stable shapes for configuration:
    -   Top-level config keys like `"ignore"`, `"rules"`, `"options"`, `"patterns"`, `"settings"`.
    -   Arrays for lists of rules, patterns, or file globs.
-   **DO** use arrays of objects for rule sets instead of deeply nested ad-hoc structures.
-   **PREFER** naming keys in `camelCase` or `snake_case` consistently across the project.
-   **AVOID** mixing unrelated concerns in a single file; separate tools (e.g., linter vs. app settings) into dedicated configs.
-   **DO** reuse patterns for repeated structures (e.g., rule objects with `id`, `severity`, `options`) to make files predictable.
-   **CONSIDER** using `$schema` at the root when supported, to enable editor validation and autocomplete.

---

## Values

-   **DO** use the correct primitive types:
    -   Strings for identifiers, file paths, and messages.
    -   Booleans for feature flags and toggles.
    -   Numbers for counts, timeouts, and thresholds.
-   **PREFER** small, focused option objects over large free-form strings.
-   **DO** keep regex patterns and complex strings properly escaped (especially backslashes in JSON).
-   **AVOID** `null` unless the consuming tool expects it; prefer omitting fields or using explicit booleans/empty arrays.
-   **PREFER** explicit empty arrays (`[]`) or objects (`{}`) over omitting keys when configuring “no items” behavior (e.g., `"allows": []`).

---

## Security & Tooling

-   **DO** keep ignore lists and path filters as arrays of glob patterns for clarity and easy extension.
-   **DO** separate real secrets from examples; use clearly fake or placeholder values for examples:
    -   e.g., `"ghp_example"`, `"xoxb-123"`, `"sk-proj-123"`.
-   **DON'T** commit real API keys, tokens, or private keys in JSON configs. If needed, reference environment variables or external secret stores instead.
-   **PREFER** centralizing secret-scanning rules (like Secretlint) in a single JSON config with:
    -   A top-level `"ignore"` list.
    -   A `"rules"` array containing rule `id`s, optional `severity`, and `options`.
-   **CONSIDER** adding `$schema` for tools like markdownlint, eslint, or other JSON-based configs to improve editor support.
-   **AVOID** tool-specific hacks that break standard JSON; keep configs valid JSON so they can be processed by generic tooling (formatters, linters, CI scripts).
