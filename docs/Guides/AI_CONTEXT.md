---

schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "AI Context Guide"
summary: "Central reference for AI assistants working with the Uptime-Watcher codebase, including context regeneration steps and key docs."
created: "2025-08-05"
last\_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:

- "uptime-watcher"
- "ai-assistant"
- "context"
- "documentation"

---

# AI Context Guide

> Centralized reference for AI assistants collaborating on the Uptime Watcher codebase. Use this page to understand the project setup, regenerate the latest context bundle, and locate related documentation quickly.

## 🎯 Goals

- Explain how the repository structures AI-facing documentation and configuration.
- Provide repeatable steps for refreshing context artifacts (for example `context7.json`).
- Highlight the most important resources every assistant should read before making changes.

## ⚙️ Regenerating the Context Bundle

The repository ships with a curated context export in `context7.json`. Regenerate it whenever docs, IPC contracts, or architectural decisions change:

```bash
npm run context
```

This command updates the context bundle under the project root so assistants always operate with current information.

## 📚 Required Reading

Make sure to review these documents before tackling new tasks:

1. [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md) – Master list of every guide and reference.
2. [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) – IPC surface area and renderer/main expectations.
3. [`TECHNOLOGY_EVOLUTION.md`](./TECHNOLOGY_EVOLUTION.md) – Architectural migrations and rationale.
4. [`TSDOC_STANDARDS.md`](../Architecture/TSDOC_STANDARDS.md) – How to document new code.

## ✅ Daily Workflow Checklist

- [ ] Confirm the active branch and sync with `origin/main` if needed.
- [ ] Run `npm install` after dependency changes.
- [ ] Execute `npm run lint:all:fix` and `npm run type-check:all` before sending patches.
- [ ] Update documentation (including this guide) whenever you modify public APIs or architectural patterns.

## 🤖 Assistant Best Practices

- Prefer typed APIs exported from `@shared` rather than duplicating definitions.
- Keep renderer/preload communication aligned with the contracts declared in `shared/types/preload.ts`.
- When unsure about architectural intent, consult the ADRs in `docs/Architecture/ADRs/` before implementing changes.
- Log important decisions in the appropriate ADR or create a new one if the decision shifts architecture.

## 📌 Reporting Gaps

If you notice missing or outdated information:

1. File an issue or add a TODO entry describing what needs to be updated.
2. Create or refresh the relevant documentation file.
3. Regenerate the context bundle so downstream assistants receive the latest guidance.

Maintaining this guide—and the linked resources—keeps every assistant aligned with project goals and reduces onboarding friction.
