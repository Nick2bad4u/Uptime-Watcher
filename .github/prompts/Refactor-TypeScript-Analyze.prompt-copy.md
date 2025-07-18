---
mode: "agent"
tools: ["All Tools"]
description: "Review frontend React code to determine if refactoring is necessary"
---

Scrutinize the frontend React codebase for the following signs that refactoring is needed:

- Component size: Are components too large or trying to do too much?
- Hook usage: Are custom and built-in hooks used effectively and cleanly?
- State management: Is state co-located, minimal, and managed with idiomatic React/Zustand patterns?
- TypeScript: Is the code fully typed, using generics and strict types? Any use of `any` or untyped props?
- Error handling: Are loading, error, and edge states handled everywhere they should be?
- Async flows: Are async effects and handlers properly managed and cleaned up?
- Styling: Is styling consistent, maintainable, and following project conventions (e.g., Tailwind)?
- Linting/style: Does everything comply with ESLint, Prettier, and Stylelint configs?
- Dead code/duplication: Any repeated logic, legacy, or unused code?
- Performance: Are memoization and re-renders managed with useMemo/useCallback? Any unnecessary renders?
- Testing: Are components and hooks covered with unit and integration tests (Vitest/@testing-library)? All states tested?
- Accessibility: Are components accessible and using semantic HTML/ARIA as needed?
- Documentation: Is everything documented (JSDoc, usage examples), and are prop types exported?

For each area, indicate:

- Does it require refactoring? (Yes/No)
- If yes, briefly summarize why and what should be improved.

Format output as a checklist with detailed comments for any “Yes” answers.

Include recommendations for how to proceed if refactoring is needed.
