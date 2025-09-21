---
mode: "BeastMode"
tools: ['createFile', 'createDirectory', 'editFiles', 'search', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'context7', 'append_insight', 'describe_table', 'list_insights', 'list_tables', 'read_query', 'sequentialthinking', 'electron-mcp-server', 'execute_command', 'get_diagnostics', 'get_references', 'get_symbol_lsp_info', 'open_files', 'rename_symbol', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
model: Claude Sonnet 4 (copilot)
description: "Create comprehensive error handling and logging tests"
---

Generate error handling and logging tests for: ${input:moduleOrFeature}

Requirements:

- Test all error scenarios and edge cases
- Validate error propagation and handling
- Test logging functionality and levels
- Include error recovery and retry mechanisms
- Test user-facing error messages
- Validate error reporting and analytics
- Include error boundary testing
- Test graceful degradation scenarios

Error Categories:

- Network and connectivity errors
- Database operation failures
- File system access errors
- Validation and input errors
- Authentication and authorization errors
- Resource exhaustion errors
- External service failures
- Unexpected runtime errors

Testing Scenarios:

- Error creation and throwing
- Error catching and handling
- Error message formatting and i18n
- Error code assignment and consistency
- Stack trace preservation
- Error context and metadata
- User notification mechanisms
- Error recovery procedures

Logging Validation:

- Log level appropriateness
- Log message clarity and usefulness
- Structured logging format
- Performance impact of logging
- Log rotation and management
- Sensitive data filtering
- Log aggregation and analysis
- Debug information inclusion

Error Boundaries:

- React error boundary testing
- Process isolation in Electron
- Database transaction rollback
- Resource cleanup on errors
- UI state recovery
- Data integrity preservation
- Graceful service degradation

Recovery Mechanisms:

- Automatic retry logic
- Circuit breaker patterns
- Fallback functionality
- Cache utilization during errors
- Offline mode capabilities
- Data synchronization recovery
- Service health monitoring

User Experience:

- Error message clarity and actionability
- Loading state management during errors
- Progress indication during recovery
- User feedback collection
- Help and support integration
- Error reporting workflows

Monitoring Integration:

- Error rate tracking
- Performance impact measurement
- Error categorization and trends
- Alert threshold configuration
- Notification system integration
- Debugging information collection

Security Considerations:

- Sensitive information exposure
- Error message sanitization
- Stack trace filtering
- Log access control
- Error reporting privacy
- Security event logging
