---
mode: "agent"
tools: ['All Tools']
description: "Generate accessibility tests and WCAG compliance checks"
---

Create accessibility tests for: ${input:componentOrFeature}

Requirements:

- Test WCAG 2.1 AA compliance
- Use @testing-library/jest-dom and axe-core
- Include keyboard navigation testing
- Test screen reader compatibility
- Verify color contrast and visual indicators
- Test focus management and tab order
- Include ARIA label and role validation
- Test with assistive technology simulation

Accessibility Standards:

- WCAG 2.1 Level AA compliance
- Section 508 compliance
- Keyboard accessibility (all functionality)
- Screen reader compatibility
- Color contrast requirements (4.5:1 for normal text)
- Focus indicators and management
- Semantic HTML structure
- Alternative text for images

Testing Categories:

- Keyboard navigation and shortcuts
- Screen reader announcements
- Focus management and tab order
- Color contrast and visual design
- Form accessibility and validation
- Modal and dialog accessibility
- Table and data grid accessibility
- Interactive element accessibility

Automated Testing:

- axe-core integration for automated checks
- Color contrast ratio validation
- ARIA attribute verification
- Semantic structure validation
- Keyboard accessibility testing
- Focus trap testing
- Live region functionality

Manual Testing Scenarios:

- Navigate using only keyboard
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Verify with high contrast mode
- Test with zoom levels up to 200%
- Check with reduced motion preferences
- Validate color-only information
- Test form error announcements

Focus Management:

- Tab order logical and intuitive
- Focus visible indicators
- Focus trapping in modals
- Skip links for navigation
- Focus restoration after dialogs
- Programmatic focus management

ARIA Implementation:

- Proper role assignments
- Descriptive labels and descriptions
- Live region updates
- State announcements (expanded, selected)
- Landmark navigation
- Headings hierarchy

Testing Tools Integration:

- jest-axe for automated testing
- Testing Library accessibility queries
- Color contrast analyzers
- Keyboard navigation validators
- Screen reader testing utilities

Reporting:

- Accessibility violation reports
- Compliance status tracking
- Remediation recommendations
- User impact assessments
- Testing coverage metrics
