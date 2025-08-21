---
mode: "agent"
tools: ['Best Tools']
description: "Fix All TypeDoc Documentation Errors and Warnings"
---

# Review All TypeDoc Documentation Errors and Warnings

Systematically fix every TypeDoc documentation error and warning in the codebase.
Do not ignore or suppress any TypeDoc warnings unless explicitly instructed.
If you encounter a warning that cannot be reasonably satisfied, document the reason in a separate file and propose a solution or configuration change for future review.

# Special Instructions

- Focus on resolving the root cause of each documentation error or warning.
- If a rule is too strict or causes legitimate development friction, document the case and suggest a configuration update, but do not disable the rule without approval.
- If you discover a legitimate bug or code smell while fixing documentation errors, document it in a separate file and make the appropriate changes to the codebase to fix it. You must be 100% sure that the bug is legitimate and not a false positive.
- If you encounter code that is difficult to document due to architectural or legacy reasons, document the challenges and suggest improvements for future refactoring.
- !!!!!!! You must not stop until all TypeDoc documentation errors and warnings are resolved or documented with a clear plan for resolution!!!!!!!
- Do not skip any files, even if they are small or seem trivial.

Requirements:

- Zero TypeDoc documentation errors or warnings in the codebase after completion.
- All code changes must maintain or improve code quality and readability.
- Do not introduce hacks or workarounds to bypass documentation rules.
- DO NOT USE SCRIPTS. DO ALL YOUR WORK MANUALLY:
- I REPEAT, ONLY NON-SCRIPT WORK IS ALLOWED.

If Attachments are present:

- They are specific documentation errors or problematic code regions that require attention.
