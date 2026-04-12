## Repository Copilot Baseline

- Follow the detailed repository guidance in `.github/instructions/copilot-instructions.md` and any more specific instruction files under `.github/instructions/` that match the file you are editing.
- Prefer root-cause fixes over suppressions.
- Keep the repository lint-clean, type-safe, and test-clean after changes.
- Use shared types and validation from `@shared/*` instead of duplicating contracts.
- Treat `src/` as renderer-only, `electron/` as main-process-only, and `shared/` as environment-agnostic contracts and utilities.
