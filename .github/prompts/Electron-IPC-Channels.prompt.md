---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Create type-safe Electron IPC channels with validation"
---

Create Electron IPC channel system for: ${input:channelPurpose}

Requirements:

- Full TypeScript type safety for IPC communication
- Input validation using Zod schemas
- Proper error handling and propagation
- Security context validation
- Performance optimization for large payloads
- Event-driven architecture support
- Documentation and usage examples

Type Safety Implementation:

- Shared type definitions between main and renderer
- Request/response type pairs
- Event payload type definitions
- Error type standardization
- Generic IPC handler types
- Type inference for channel methods

Channel Structure:

- Channel registration and initialization
- Handler function type safety
- Async operation support
- Progress reporting capabilities
- Cancellation token support
- Timeout handling
- Retry mechanisms

Validation Layer:

- Zod schema validation for all inputs
- Custom validation rules
- Sanitization of user inputs
- Type coercion and transformation
- Error message standardization
- Validation performance optimization

Security Measures:

- Context isolation enforcement
- Privilege level validation
- Input sanitization
- Rate limiting for channels
- Audit logging for sensitive operations
- Secure data transmission

Performance Optimization:

- Large payload streaming
- Data compression for transfers
- Connection pooling
- Batched operations
- Background processing
- Memory management

Error Handling:

- Structured error responses
- Error code standardization
- Stack trace preservation
- Debug information collection
- User-friendly error messages
- Recovery procedures

Event System:

- Type-safe event emission
- Subscription management
- Event filtering and routing
- Performance monitoring
- Memory leak prevention
- Cleanup procedures

Documentation:

- Channel API documentation
- Usage examples and patterns
- Type definition exports
- Error handling guides
- Performance best practices
- Security considerations

Integration:

- Service layer integration
- Database operation coordination
- File system access patterns
- Network request handling
- Configuration management
- Logging system integration
