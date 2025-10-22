---
agent: "BeastMode"
tools: ['edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/readFile', 'search/codebase', 'runCommands/getTerminalOutput', 'runCommands/terminalLastCommand', 'runCommands/runInTerminal', 'runTasks/runTask', 'runTasks/getTaskOutput', 'Tavily-Remote-MCP/tavily_extract', 'Tavily-Remote-MCP/tavily_search', 'electron-mcp-server/get_electron_window_info', 'electron-mcp-server/send_command_to_electron', 'electron-mcp-server/take_screenshot', 'vscode-mcp/get_diagnostics', 'vscode-mcp/get_references', 'vscode-mcp/get_symbol_lsp_info', 'vscode-mcp/rename_symbol', 'runSubagent', 'usages', 'problems', 'changes', 'testFailure', 'fetch', 'ms-vscode.vscode-websearchforcopilot/websearch', 'todos', 'runTests']

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
