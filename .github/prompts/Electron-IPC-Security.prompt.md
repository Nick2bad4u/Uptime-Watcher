---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Review Electron IPC code for security issues"
---

Review the Electron IPC code:

- Ensure all IPC handlers validate incoming data
- Avoid exposing sensitive APIs to the renderer
- Suggest use of contextBridge or secure preload scripts
- Recommend best practices for Electron app security

---
