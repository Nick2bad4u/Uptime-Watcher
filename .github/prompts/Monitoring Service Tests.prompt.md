---
mode: "agent"
tools: ["All Tools"]
description: "Generate monitoring service tests for uptime checking"
---

Create comprehensive tests for monitoring service: ${input:monitorType}

Requirements:

- Test HTTP/HTTPS monitoring functionality
- Include port monitoring and TCP checks
- Test SSL certificate validation
- Include response time measurement accuracy
- Test monitoring scheduling and intervals
- Validate status detection logic
- Include network timeout and retry testing
- Test concurrent monitoring operations

Monitor Type Testing:
- HTTP/HTTPS endpoint monitoring
- Port accessibility checking
- SSL certificate validation
- DNS resolution testing
- API endpoint functionality
- Custom header and authentication
- Response content validation
- Performance metric collection

Functionality Testing:
- Status determination logic (up/down/degraded)
- Response time measurement accuracy
- Timeout handling and configuration
- Retry mechanisms and backoff strategies
- Error classification and reporting
- Historical data collection
- Alert threshold evaluation
- Notification trigger conditions

Network Simulation:
- Various network conditions (slow, intermittent)
- DNS resolution failures
- SSL certificate errors
- Connection timeouts
- HTTP error status codes
- Malformed responses
- Large response payloads
- Network latency variations

Performance Testing:
- Concurrent monitoring accuracy
- Memory usage under load
- CPU utilization monitoring
- Database write performance
- Real-time update efficiency
- Large-scale monitoring capabilities
- Resource cleanup verification

Data Validation:
- Monitoring result accuracy
- Historical data integrity
- Status change detection
- Performance metric validation
- Error message clarity
- Timestamp accuracy
- Data persistence verification

Integration Testing:
- Database integration for history storage
- Notification system integration
- UI real-time update testing
- Configuration management
- Scheduling service integration
- Error reporting integration

Mock Services:
- HTTP server mocking for various responses
- Network condition simulation
- SSL certificate scenarios
- DNS resolution mocking
- Timeout and delay simulation
- Error response generation
