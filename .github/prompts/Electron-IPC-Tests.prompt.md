---
mode: "agent"
tools: ['Best Tools']
description: "Generate comprehensive API tests for Electron IPC"
---

Create API tests for Electron IPC channels: ${input:ipcChannelName}

Requirements:

- Test all IPC communication channels
- Mock Electron main and renderer processes
- Test message serialization and deserialization
- Include error handling and timeout scenarios
- Test concurrent IPC operations
- Validate data integrity across process boundaries
- Include security testing for IPC vulnerabilities
- Test performance under load

IPC Testing Areas:

- Channel registration and initialization
- Message sending and receiving
- Data type preservation across processes
- Error propagation and handling
- Async operation completion
- Event subscription and unsubscription
- IPC security and validation
- Resource cleanup and disposal

Test Scenarios:

- Successful message exchange
- Invalid message formats
- Missing or malformed data
- Network timeout simulations
- Process crash recovery
- Large data payload handling
- Concurrent request handling
- Memory leak prevention

Security Testing:

- Input validation and sanitization
- Privilege escalation prevention
- Data injection attack prevention
- Unauthorized channel access
- Message tampering detection
- Process isolation verification

Mock Strategy:

- Mock ipcMain and ipcRenderer
- Simulate process boundaries
- Create realistic message delays
- Mock system resources
- Simulate error conditions
- Test with various data types

Performance Testing:

- Message throughput measurement
- Latency under various loads
- Memory usage monitoring
- CPU utilization tracking
- Large dataset transfer performance
- Concurrent operation efficiency

Data Validation:

- Type preservation testing
- Complex object serialization
- Binary data handling
- Unicode character support
- Date and time handling
- Error object transmission

Integration Testing:

- End-to-end workflow testing
- Database operation integration
- File system operation testing
- Network request coordination
- UI update synchronization
- Real-time data streaming

Error Handling:

- Network disconnection scenarios
- Process termination handling
- Invalid data format handling
- Timeout and retry mechanisms
- Graceful degradation testing
- Error recovery procedures
