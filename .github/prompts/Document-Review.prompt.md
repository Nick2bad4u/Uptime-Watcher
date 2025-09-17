---
mode: "BeastMode"
tools: ['createFile', 'createDirectory', 'editFiles', 'search', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'context7', 'append_insight', 'describe_table', 'list_insights', 'list_tables', 'read_query', 'sequentialthinking', 'electron-mcp-server', 'execute_command', 'get_diagnostics', 'get_references', 'get_symbol_lsp_info', 'open_files', 'rename_symbol', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Review and Update Coding Documentation"
---

# Review and Update Coding Documentation

Ground truth: code, tests, commit history, and CLI/help output. Audit all docs for accuracy and completeness. Fix inaccuracies, add missing steps/examples, update API/CLI refs, and remove stale/duplicate content. Preserve structure and style; make minimal, precise edits.

# Special Instructions

- No speculation; mark unknowns as TODO with owner.
- Keep examples runnable and aligned with current main.
- Maintain repo terminology, formatting, and voice.
- Do not stop until all discrepancies are fixed or documented with a clear resolution plan.

Requirements:

- Docs reflect actual behavior; no broken links or outdated versions.
- Include a concise changelog with rationale per file.
- Edits must maintain or improve clarity and quality.

If Attachments are present:

- Treat as authoritative context; reconcile with code and incorporate as needed.
