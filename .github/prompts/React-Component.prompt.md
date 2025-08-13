---
mode: "agent"
tools: ['All Tools']
description: "Create a React component with TypeScript"
---

Generate ${input:componentName}.tsx component:

Requirements:

- TypeScript interface for props
- Functional component with React.FC
- useState/useEffect hooks as needed
- Styled with CSS modules (import styles from './${input:componentName}.module.css')
- PropTypes with `npm run types` check
- Storybook story in same directory (${input:componentName}.stories.tsx)
- Unit test boilerplate using Vitest + React Testing Library

Include:

1. Default export component
2. Named export for Storybook
3. JSDoc comment with usage example
