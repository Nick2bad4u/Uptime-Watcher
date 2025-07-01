---
mode: "agent"
tools: ["All Tools"]
description: "Generate custom React hook with comprehensive testing"
---

Create a custom React hook for: ${input:hookPurpose}

Requirements:

- TypeScript implementation with proper types
- Use react-hook-form patterns where applicable
- Include comprehensive error handling
- Support loading and error states
- Include cleanup and memory leak prevention
- Add JSDoc comments with usage examples
- Create comprehensive unit tests
- Follow project hook conventions

Hook Structure:
- Return object with clear property names
- Include loading, error, and data states
- Provide methods for actions (refresh, reset, etc.)
- Handle async operations properly
- Include proper dependency arrays
- Use useCallback and useMemo for optimization

Features to Include:
- Input validation and sanitization
- Error boundary integration
- Retry mechanisms for failed operations
- Debouncing for frequent operations
- Caching for expensive computations
- Cleanup on component unmount
- TypeScript generics for reusability

Testing Requirements:
- Test hook in isolation using @testing-library/react-hooks
- Test all return values and their updates
- Test error scenarios and recovery
- Test cleanup and memory management
- Mock external dependencies
- Test with different prop combinations
- Include performance testing
- Test concurrent usage scenarios

Integration:
- Work with existing Zustand store
- Compatible with project's Electron IPC
- Follow theme and styling patterns
- Use project's error handling conventions
- Support project's logging system

Documentation:
- Include usage examples in JSDoc
- Document all parameters and return values
- Explain error handling approach
- Provide integration examples
- Document performance considerations

File Structure:
- Place in appropriate hooks directory
- Include index.ts export
- Create accompanying test file
- Add to project's hook documentation
