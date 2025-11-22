---
name: "YAML-Guidelines"
description: "Instructions for writing clear, robust YAML, aligned with modern tooling and linters."
applyTo: "**/*.{yml,yaml}"
---

# YAML

Practical guidelines for authoring YAML that works well with modern tools like Grype, yamllint, and CI/CD systems. The goals are:

1. **Be predictable.** YAML is flexible; these rules make parsing and tooling behavior consistent.
2. **Be readable.** Prefer structure and clarity over clever tricks.

These aren't hard rules, but rather recommendations to improve consistency, readability, and maintainability across projects using YAML.

## Style

-   **DO** use spaces, not tabs. Configure editors to insert spaces for indentation.
-   **DO** use **consistent indentation**, typically:
    -   2 spaces for general YAML where brevity matters, or
    -   4 spaces when aligning with stricter yamllint configs or deeply nested configs.
-   **PREFER** one space after `:` in mappings (`key: value`).
-   **DO** keep related keys grouped and separated from other sections with blank lines.
-   **PREFER** keeping lines ≤ 120–200 characters to keep diffs readable.
-   **DON'T** rely on implicit document starts if your repo prefers explicit ones. When needed, use `---` at the top of a document.

---

## Structure

-   **DO** favor simple maps and lists over deeply nested structures. If nesting goes beyond 3–4 levels, **CONSIDER** refactoring.
-   **DO** use sequences (`- item`) for ordered lists of similar things (paths, rules, patterns).
-   **DO** keep key naming consistent within a repository (e.g., `snake_case` or `kebab-case`).
-   **AVOID** keys with spaces or special characters; they often require quoting and make tooling brittle.
-   **DO** use anchors (`&name`) and aliases (`*name`) to avoid duplication when:
    -   Multiple sections share the same list of paths, rules, or options.
    -   A complex mapping is reused across environments.
-   **DON'T** overuse anchors for trivial values; they should **reduce** cognitive load, not increase it.

---

## Values

-   **DO** quote strings that might be misinterpreted as booleans, numbers, or null. Examples:
    -   `"yes"`, `"no"`, `"on"`, `"off"`, `"null"`, `"01"`.
-   **PREFER** single quotes (`'value'`) for plain strings, double quotes (`"value"`) when you need escapes like `\n`.
-   **DO** use canonical booleans: `true` and `false`.
-   **DO** represent null explicitly as `null` or `~` when you mean “no value”.
-   **PREFER** unquoted numeric values for real numbers and integers, unless leading zeros or special formats are required.
-   **PREFER** block scalars for multi-line content:
    -   Use `|` (literal) for scripts, code blocks, or text where newlines matter.
    -   Use `>` (folded) for prose where newlines should be treated like spaces.
-   **AVOID** leaving values completely empty in mappings unless your linter and tools explicitly support that pattern.

---

## Tooling

-   **DO** declare `$schema` comments or keys where supported to enable editor validation (e.g. `yaml-language-server`).
-   **DO** keep ignore lists (like paths excluded from scanning or linting) as YAML sequences of glob patterns, one per line.
-   **PREFER** centralizing YAML linting rules (e.g. in `.yamllint.yml`) and writing new files to comply with them.
-   **CONSIDER** adding comments for non-obvious values (e.g., timeouts, risk thresholds, feature flags).
-   **DON'T** rely on tool-specific quirks that contradict standard YAML; prefer portable patterns that work across parsers and CI environments.
-   **Tooling alignment**: Run `npm run lint:yaml` to validate YAML files against the repository’s yamllint configuration before submitting changes.
