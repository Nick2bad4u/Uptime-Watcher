---
mode: "agent"
tools: ['All Tools']
description: "Generate end-to-end tests using Playwright"
---

Create E2E tests for: ${input:featureName}

Requirements:

- Use Playwright testing framework
- Test complete user workflows
- Include cross-browser testing (Chromium, Firefox, WebKit)
- Test both Electron app and web version
- Include visual regression testing
- Test responsive design breakpoints
- Handle async operations and loading states
- Test error scenarios and recovery
- Include performance testing
- Test data persistence across sessions

User Workflows to Test:

- Site creation and management
- Monitor configuration and monitoring
- Dashboard navigation and interactions
- Settings configuration and persistence
- Data import/export functionality
- Notification handling
- Real-time updates and status changes
- Search and filtering operations

Focus Areas:

- Page load and navigation
- Form interactions and validation
- Modal dialogs and overlays
- Data table operations
- Chart and graph interactions
- File upload/download
- Keyboard shortcuts
- Context menus and tooltips

Test Structure:

- Group tests by user journey
- Use Page Object Model pattern
- Include setup and cleanup procedures
- Test authentication if applicable
- Handle test data isolation
- Include retry logic for flaky tests
- Test offline/network error scenarios

Performance Testing:

- Page load times
- Large dataset handling
- Memory usage monitoring
- Real-time update performance
- Chart rendering performance

Visual Testing:

- Screenshot comparisons
- Layout consistency
- Theme switching
- Responsive breakpoints
- Dark/light mode variations

Environment Setup:

- Test against built Electron app
- Include database seeding
- Mock external services
- Handle different OS environments
- Test with various window sizes
