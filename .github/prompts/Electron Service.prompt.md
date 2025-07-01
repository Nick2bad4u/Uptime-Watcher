---
mode: "agent"
tools: ["All Tools"]
description: "Create Electron main process service with TypeScript"
---

Create Electron main process service: ${input:serviceName}

Requirements:

- TypeScript implementation with strict typing
- Follow Electron security best practices
- Include proper IPC channel definitions
- Implement singleton pattern where appropriate
- Add comprehensive error handling and logging
- Include proper resource cleanup
- Support graceful shutdown procedures
- Add service lifecycle management

Service Structure:
- Class-based service with clear interface
- Dependency injection for testability
- Event-driven architecture
- Proper async/await patterns
- Resource pooling for expensive operations
- Configuration management
- Health check capabilities

IPC Integration:
- Type-safe IPC channel definitions
- Input validation and sanitization
- Response type safety
- Error propagation to renderer
- Progress reporting for long operations
- Event subscription management
- Security context validation

Error Handling:
- Structured error types and codes
- Proper error logging and reporting
- Graceful degradation strategies
- Resource cleanup on errors
- User-friendly error messages
- Debug information collection
- Recovery mechanisms

Performance Considerations:
- Memory management and cleanup
- CPU-intensive operation handling
- Database connection pooling
- Caching strategies
- Background task management
- Resource monitoring
- Performance metrics collection

Security Implementation:
- Input validation and sanitization
- Context isolation compliance
- Privilege escalation prevention
- Secure file system access
- Network request validation
- Sensitive data handling
- Audit logging

Integration Points:
- Database service integration
- File system service coordination
- Network service communication
- Logging service integration
- Configuration service usage
- Event system participation

File Structure:
- Place in appropriate services directory
- Include comprehensive interface definition
- Add unit tests and integration tests
- Include service documentation
- Export through service index
