---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Using This Documentation"
summary: "Explains how to navigate the architecture knowledge base and select the most relevant ADRs, patterns, and templates for your work."
created: "2025-10-05"
last_reviewed: "2025-11-16"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "documentation"
  - "onboarding"
---
# Using This Documentation

This guide describes how to navigate the architecture knowledge base effectively and locate the material relevant to your work.

## Audience Checklist

- **New contributors** should begin with the Architecture Decision Records (ADRs) to understand current constraints, then continue with the Development Patterns Guide for implementation expectations.
- **Feature owners** should review the ADRs that apply to their domain and validate that the referenced templates and patterns still apply before starting work.
- **Reviewers** should cross-check the relevant ADR compliance sections and pattern guides to confirm that submitted changes align with the layered architecture.

## Suggested Reading Path

1. **ADRs** – capture the authoritative decisions that inform code structure.
2. **Patterns** – show the practical application of each decision with rich examples.
3. **Templates** – provide copy-ready scaffolding when introducing new primitives.
4. **TSDoc Standards** – ensure new code remains well documented and searchable.

## Maintaining Alignment

- Synchronize changes between ADRs, patterns, and templates when a new architectural rule is introduced.
- Log deviations from the documented approach in the relevant ADR if temporary exceptions are necessary.
- Submit documentation updates alongside code changes to prevent drift between reference material and implementation.

## Current Implementation Audit (2025-11-04)

- Verified navigation paths to ADRs, patterns, templates, and standards match the updated directory structure documented in `docs/Architecture/README.md`.
- Checked reviewer touchpoints (ADR compliance sections, pattern guides) for accuracy after the November 2025 documentation sweep.
- Confirmed tooling references (`docs:check-links`, architecture quarterly reviews) are still tracked in `package.json` and `TODO.md` workflows.
