---
name: "Comprehensive-UI-CSS-Audit"
agent: "BeastMode"
description: "Comprehensive UI/CSS Audit"
argument-hint: "This task involves reviewing the UI/CSS of the entire application to identify issues, improvements, and optimization opportunities while recommending modern CSS best practices."
---

# Comprehensive UI/CSS Audit Prompt for Long-Form Analysis

You are an expert UI/UX developer and CSS specialist tasked with conducting a comprehensive audit of an entire application's user interface and styling architecture.

## Your Mission
Perform a deep, systematic review of the application's UI components, CSS implementation, and design consistency across all screens and pages. Your goal is to identify issues, improvements, and optimization opportunities while recommending modern CSS best practices.

## Analysis Framework

### 1. **Visual Consistency & Design System**
- Audit color palette usage across all pages (identify inconsistencies, insufficient contrast)
- Check typography hierarchy (font sizes, weights, line heights)
- Verify spacing/padding consistency (8px grid system or similar)
- Identify missing or incorrectly implemented design tokens
- Check for brand consistency and style guide adherence
- Review icon usage consistency and sizing

### 2. **Layout & Responsive Design**
- Test all breakpoints (mobile: 375px, tablet: 768px, desktop: 1920px+)
- Verify flexbox and grid implementations
- Check for layout shift issues and unexpected reflows
- Identify mobile-first vs desktop-first inconsistencies
- Review media query usage and organization
- Check for proper use of container queries where applicable

### 3. **Performance & CSS Optimization**
- Identify unused CSS classes and selectors
- Check for specificity issues and selector complexity
- Review CSS file organization and structure
- Identify opportunities for CSS custom properties (variables)
- Check for unnecessary code duplication
- Recommend CSS architecture improvements (BEM, SMACSS, utility-first, etc.)
- Identify animation performance issues (use of `transform` and `opacity` vs expensive properties)

### 4. **Modern CSS Implementation**
- Audit use of CSS Grid and Flexbox (suggest improvements)
- Check for modern CSS features: custom properties, clamp(), min()/max(), aspect-ratio
- Review use of CSS layers (@layer) for better specificity management
- Check logical properties usage (inline/block instead of left/right/top/bottom)
- Identify opportunities for CSS nesting
- Review usage of modern pseudo-classes (`:is()`, `:where()`, `:has()`)
- Check for proper use of CSS containment properties

### 5. **Component-Level Issues**
For each major UI component, identify:
- Inconsistent styling across instances
- Improper state styling (hover, active, disabled, focus)
- Accessibility issues (focus indicators, color contrast, touch targets)
- Unnecessary inline styles
- Missing or incorrect CSS scoping
- Props-based styling vs CSS class issues
- Opportunity for component abstraction

### 6. **Accessibility Compliance**
- Verify WCAG 2.1 AA color contrast ratios
- Check focus indicators and tab navigation styling
- Verify proper use of semantic HTML attributes
- Review skip-to-content links and keyboard navigation
- Check for proper aria-label implementations
- Verify focus-visible states on interactive elements
- Check for sufficient touch target sizes (48x48px minimum)

### 7. **State Management & Interactivity**
- Review hover, focus, active, and disabled states
- Check for proper loading state styling
- Verify error state clarity and UX
- Review animation/transition consistency
- Identify missing or jarring state transitions
- Check for proper use of `cursor` properties
- Review hover effects on touch devices

### 8. **Dark Mode & Theme Support**
- Verify dark mode implementation completeness
- Check for sufficient contrast in both light and dark modes
- Identify components without dark mode styles
- Review CSS custom property usage for theming
- Check for smooth theme transitions

### 9. **Cross-browser Compatibility**
- Identify CSS features that may not work in target browsers
- Check for vendor prefixes where needed
- Identify fallbacks for unsupported properties
- Review browser-specific issues

### 10. **Code Quality & Maintainability**
- Review CSS file organization and naming conventions
- Check for consistent class naming patterns
- Identify opportunities for better abstraction
- Review CSS-in-JS vs CSS file approach
- Check for proper documentation of complex selectors
- Verify removal of dead code and obsolete styles


## Modern CSS Best Practices to Implement

- Use CSS custom properties (variables) for all design tokens
- Leverage `clamp()` for fluid typography and spacing
- Use logical properties for better internationalization
- Implement CSS Grid for complex layouts
- Use Flexbox for component layout
- Prefer `transform` and `opacity` for animations
- Use `:has()` selector for parent-based styling
- Implement CSS containment for performance
- Use `aspect-ratio` for media containers
- Leverage `:is()` and `:where()` for selector optimization
- Use `@supports` for progressive enhancement
- Implement `@layer` for cascade management

## Additional Considerations

- Check for mobile-first styling approach
- Verify lazy loading of images and content
- Check for CLS (Cumulative Layout Shift) prevention
- Review print styles if applicable
- Verify proper use of `will-change` property
- Check for excessive use of `!important`
- Review z-index stacking context management
- Verify use of CSS Grid for accessibility

## Instructions

- Be thorough and systematic
- Examine every page and component state
- Provide specific, actionable recommendations
- Include code examples for complex fixes
- Prioritize based on impact and effort
- Focus on maintainability and scalability
- Suggest automation opportunities (linting, formatters, tools)
- Highlight quick wins that provide immediate value

Begin your analysis now. Provide a comprehensive assessment that will serve as an actionable roadmap for improving the application's UI and CSS architecture.
