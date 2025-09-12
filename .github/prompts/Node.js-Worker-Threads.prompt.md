---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Create Node.js worker threads for CPU-intensive tasks"
---

Create Node.js worker implementation for: ${input:workerTask}

Requirements:

- TypeScript implementation with proper typing
- Worker thread lifecycle management
- Message passing with type safety
- Error handling and recovery
- Resource management and cleanup
- Performance monitoring
- Graceful shutdown procedures
- Thread pool management

Worker Architecture:

- Main thread coordinator
- Worker thread implementation
- Message protocol definition
- Data serialization handling
- Error propagation system
- Resource sharing strategies
- Load balancing algorithms

Type Safety:

- Message type definitions
- Worker input/output types
- Error type standardization
- Shared type interfaces
- Type-safe message passing
- Runtime type validation
- Generic worker patterns

Task Management:

- Task queue implementation
- Priority-based scheduling
- Concurrent task execution
- Task cancellation support
- Progress reporting
- Result aggregation
- Timeout handling

Performance Optimization:

- CPU utilization monitoring
- Memory usage tracking
- Thread pool sizing
- Task batching strategies
- Resource preallocation
- Garbage collection optimization
- Performance metrics collection

Error Handling:

- Worker error isolation
- Error recovery mechanisms
- Resource cleanup on failure
- Graceful degradation
- Error reporting and logging
- Debug information collection
- Fallback strategies

Communication Protocol:

- Structured message format
- Request/response patterns
- Event-driven communication
- Binary data handling
- Streaming data support
- Compression for large payloads
- Message queuing

Resource Management:

- Memory allocation limits
- CPU usage monitoring
- Thread lifecycle management
- Resource pooling
- Cleanup procedures
- Leak detection
- Performance profiling

Integration:

- Electron main process integration
- Database operation coordination
- File system task handling
- Network operation optimization
- Background processing
- Service layer integration

Use Cases:

- Large dataset processing
- Image/file manipulation
- Cryptographic operations
- Data analysis and computation
- Background monitoring tasks
- Report generation
- Data transformation
