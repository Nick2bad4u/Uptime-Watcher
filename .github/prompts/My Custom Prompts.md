---
mode: "agent"
tools: ["All Tools"]
description: "Generate accessibility tests and WCAG compliance checks"
---

# Comprehensive Code Cleanup and Review Instructions

## 1. Dead Code Elimination and Source Code Review

Perform a comprehensive, full project scan for dead code. Conduct a thorough line-by-line source code review of every single file, following all data paths. Take sufficient time to complete this task properly - examine one file at a time methodically.

During the review, identify and address:
- Dead/unused code
- Bugs or potential issues
- Small improvements (not large refactors)
- Style inconsistencies
- Code quality issues

Document all findings and changes made during this process.

After completing the review, update the copilot-instructions document with all insights gained. Keep the document concise while providing maximum future context to aid in coding decisions. The instructions can use AI-friendly language and don't need to be human-readable.

## 2. Import/Export Consistency Review

Review all files in the project to analyze imports and exports. Determine if we need:
1. Barrel export files for better organization
2. Consistent usage of existing barrel export files for importing

Requirements:
- Check every single file without exception
- Ensure all imports across the entire frontend and backend use appropriate barrel imports
- Conduct a deep review of ALL items in the project that contain the word "import"
- Maintain logical consistency across the entire project

After completing the frontend and backend review, recursively examine the entire electron folder for the same import/export patterns.

Fix any inconsistencies found and ensure proper barrel export usage throughout the codebase.
