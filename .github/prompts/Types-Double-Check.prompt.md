---
mode: "BeastMode"
tools: ['executePrompt', 'usages', 'testFailure', 'fetch', 'ms-vscode.vscode-websearchforcopilot/websearch', 'todos', 'edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/readFile', 'search/codebase', 'runCommands/runInTerminal', 'runCommands/getTerminalOutput', 'runTasks/runTask', 'runTasks/getTaskOutput', 'vscode-mcp/get_diagnostics', 'vscode-mcp/get_references', 'vscode-mcp/get_symbol_lsp_info', 'deepwiki/ask_question']

description: "Types Final comprehensive review"
---

- Perform a thorough review of all recent changes you made to identify any missed references to the types that were changed or added. Check for conflicting or duplicate interfaces, type errors, etc, and lint issues across the codebase. Also, look for additional opportunities to strengthen type safety while you do this.

- Now that this phase is complete, please think deeply aka super think / deep think and do the following:

- Trace all data paths to ensure data flow is proper. Do global searches for all types and interfaces you have created or modified to ensure they are used correctly across the codebase.

- Do global searches for all callers and things that use the type to ensure we dont have lingering references to the old types or interfaces.
