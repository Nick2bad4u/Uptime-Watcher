---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Create custom hook with Zustand integration"
---

Generate use${input:hookName} hook:

Requirements:

- Uses Zustand store: `use${input:storeName}Store`
- Memoizes derived state with `useMemo`
- Handles async operations via `useEffect`
- Returns tuple: `[state, actions]`
- Includes cleanup logic
- Type-safe with store interface
- Storybook interaction test

Pattern:

```typescript
export function useCustomHook() {
 const { data, fetch } = useStore();
 const [loading, setLoading] = useState(false);

 useEffect(() => {
  const controller = new AbortController();
  fetch(controller.signal);
  return () => controller.abort();
 }, [fetch]);

 return { data, loading };
}
```
