---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Investigate Removal of Eslint-Disable comments and Warnings"
---

# Review All ESLint disable comments and Warnings

Your task is to investigate the necessity of each ESLint disable comment and remove any that are no longer needed or can be removed using another method or change.

If needed: Run the command "npm run lint" to check for current ESLint errors and warnings.
You can try to auto fix some issues with "npm run lint:fix", but be prepared to manually resolve any remaining issues.

# Special Instructions

- Focus on resolving the root cause of each lint error or warning.
- If a rule is too strict or causes legitimate development friction, document the case and suggest a configuration update, but do not disable the rule without approval.
- If you discover a legitimate bug or code smell while fixing lint errors, document it in a separate file and make the appropriate changes to the codebase to fix it. You must be 100% sure that the bug is legitimate and not a false positive.
- If you encounter code that is difficult to lint due to architectural or legacy reasons, document the challenges and suggest improvements for future refactoring.
- !!!!!!! You must not stop until all ESLint errors and warnings are resolved or documented with a clear plan for resolution!!!!!!!
- Do not skip any files, even if they are small or seem trivial.

Requirements:

- Zero ESLint errors or warnings in the codebase after completion.
- All code changes must maintain or improve code quality and readability.
- Do not introduce hacks or workarounds to bypass linting rules.

If Attachments are present:

- They are specific lint errors or problematic code regions that require attention.
