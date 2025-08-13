---
mode: "agent"
tools: ['All Tools']
description: "Generate Zustand store tests and state management validation"
---

Create comprehensive Zustand store tests for: ${input:storeName}

Requirements:

- Test store initialization and default state
- Validate state mutations and updates
- Test action creators and side effects
- Include persistence testing
- Test computed values and selectors
- Validate subscription and listening
- Include concurrent update testing
- Test error handling in store operations

Store Testing Areas:

- Initial state validation
- Action dispatch and state updates
- Selector function accuracy
- State persistence and hydration
- Subscription and unsubscription
- Middleware functionality
- Immer integration testing
- DevTools integration

State Management Testing:

- Synchronous state updates
- Asynchronous action handling
- State normalization and structure
- Derived state calculations
- State reset and cleanup
- Optimistic updates
- Rollback mechanisms
- State versioning

Action Testing:

- Action creator functionality
- Payload validation and transformation
- Side effect execution
- Error handling in actions
- Action composition and chaining
- Conditional action execution
- Action middleware processing

Persistence Testing:

- Local storage integration
- State rehydration on app start
- Partial state persistence
- Migration between versions
- Storage quota handling
- Encryption/decryption if applicable
- Cross-tab synchronization

Performance Testing:

- Large state update performance
- Selector memoization efficiency
- Subscription performance impact
- Memory usage optimization
- Update batching effectiveness
- Re-render prevention

Integration Testing:

- React component integration
- Hook usage patterns
- Context provider testing
- Multiple store coordination
- External API integration
- Real-time data synchronization

Mock Strategy:

- Mock external dependencies
- Simulate API responses
- Mock persistence layer
- Create realistic state scenarios
- Mock network conditions
- Simulate error conditions

Concurrency Testing:

- Simultaneous updates from multiple sources
- Race condition prevention
- Queue management for actions
- Lock mechanisms testing
- State consistency verification
- Conflict resolution testing
