---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Generate React component tests with React Testing Library"
---

Create comprehensive React component tests for: ${input:componentName}

Requirements:

- Use Vitest + React Testing Library
- Test component rendering and behavior
- Include accessibility testing
- Mock all external dependencies and hooks
- Test user interactions (clicks, form inputs, etc.)
- Test conditional rendering and state changes
- Include snapshot testing for UI consistency
- Test error boundaries and error states
- Verify prop handling and validation
- Test keyboard navigation and focus management

Testing Patterns:

- Use screen queries (getByRole, getByLabelText, etc.)
- Test user behavior, not implementation details
- Use userEvent for realistic user interactions
- Test component integration with custom hooks
- Mock Zustand store interactions
- Test theme and styling variations

Focus Areas:

- Component mounting and unmounting
- Props validation and default values
- State management and updates
- Event handling (onClick, onChange, onSubmit)
- Form validation and submission
- Loading states and async operations
- Error display and recovery
- Responsive behavior
- Accessibility compliance (ARIA labels, roles)

Mock Strategy:

- Mock custom hooks (useSite, useSiteActions, etc.)
- Mock Electron IPC calls
- Mock router navigation
- Create realistic component props
- Mock external API calls
- Use MSW for API mocking if needed

Accessibility Testing:

- Test keyboard navigation
- Verify ARIA attributes
- Test screen reader compatibility
- Check color contrast and visual indicators
- Test focus management

Follow project conventions:

- Use existing test setup from src/test/
- Import testing utilities from project setup
- Match component file structure
- Include proper TypeScript types
