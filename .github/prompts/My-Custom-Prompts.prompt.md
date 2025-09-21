---
mode: "BeastMode"
tools: ['createFile', 'createDirectory', 'editFiles', 'search', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'context7', 'append_insight', 'describe_table', 'list_insights', 'list_tables', 'read_query', 'sequentialthinking', 'electron-mcp-server', 'execute_command', 'get_diagnostics', 'get_references', 'get_symbol_lsp_info', 'open_files', 'rename_symbol', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
model: Claude Sonnet 4 (copilot)
description: "Generate accessibility tests and WCAG compliance checks"
---

# Comprehensive Code Cleanup and Review Instructions

## 1. Dead Code Elimination and Source Code Review

Perform a comprehensive, full project scan for dead code. Conduct a thorough line-by-line source code review of every single file, following all data paths. Take sufficient time to complete this task properly - examine one file at a time methodically.

During the review, identify and address:

- Dead/unused code
- Logical Inconsistencies'
- Bugs or potential issues
- Small improvements (not large refactors)
- Style inconsistencies
- Code quality issues

Document all findings and changes made during this process.

## 2. Import/Export Consistency Review

Review all files in the project to analyze imports and exports. Determine if we need:

1. Barrel export files for better organization
2. Consistent usage of existing barrel export files for importing

Requirements:

- Check every single file without exception
- Ensure all imports across the entire frontend and backend use appropriate barrel imports
- Conduct a deep review of ALL items in the project that contain the word "import"
- Maintain logical consistency across the entire project

Fix any inconsistencies found and ensure proper barrel export usage throughout the codebase.

## 3. Review all Coverage and Test Files

Use the commands "npm run test:coverage" and "npm run test:electron:coverage" and create testing for all files that do not have 100% branch coverage.
Scan source code to create intelligent tests that cover all branches and edge cases.
Ensure that all tests are comprehensive and cover all edge cases.
You can use as many requests and time as needed to achieve this goal.
You cannot skip any files, even if they are small or seem trivial.
You cannot stop until all files have 100% branch coverage.
You cannot stop even if it takes a long time to complete.
You should update the Memory MCP with all important information and insights gained during this process.

Requirements:

- Review coverage reports
- 100% branch coverage for all files
- Create tests for all files without 100% branch coverage until all files are covered 100%

---

# Low Confidence AI Claims Review Prompt

New claims to review, these are low confidence claims that need to be reviewed to ensure that they are:

1. Real and not false positives
2. Make sense with our project
3. If they are valid issues, proceed to implement the proper fixes according to project standards.

## Instructions

- Review each claim listed below.
- For each claim, determine if it is a real issue or a false positive.
- Assess whether the claim is relevant and makes sense in the context of our project.
- If they are valid issues, proceed to implement the proper fixes according to project standards.
- Trace all data paths before making changes to ensure we don't break anything.
- Backwards compatibility is not necessary as we are in a development phase - feel free to make breaking changes, as long as you update the entire data path properly. Never write backwards compatibility code.

Proceed to review all new low confidence claims using the outline above:
