---
name: "ReactJS-Guidelines"
description: "ReactJS development standards and best practices"
applyTo: "**/*.jsx, **/*.tsx"
---

# ReactJS Development Instructions

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at [react.dev](https://react.dev). Refer to the official docs for deep dives into specific concepts.

Type-Fest is available in this project and should be used where it improves type safety and expressiveness for React components and related logic.

---

## Project Context

- Latest React version (React 19+).
- TypeScript-first React codebase (`.tsx` preferred).
- Follow React's official style guide and best practices.
- Implement proper component composition and reusability patterns.
- Leverage React's built-in types (`React.FC`, `ComponentProps`, `ReactNode`, `JSX.Element`) for type safety.

---

## Component Design

- Follow **single responsibility principle**:
  - Each component should do one coherent thing.
- Use descriptive and consistent naming conventions:
  - Components must be **PascalCase**.
  - Props/interfaces must clearly describe their role and, for new code in this repo, should use the `Properties` suffix (e.g., `AddSiteFormProperties`, `GalaxyBackgroundProperties`) in line with `COMPONENT_PROPS_STANDARDS.md`.
- Prefer **props typed via interfaces or type aliases**:

  ```ts
  type ButtonProps = {
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  };
  ```

- Design components to be **testable and reusable**:
  - Avoid hidden global state or singletons inside components.
  - Avoid tightly coupling components to specific data sources or side effects.

- Prefer **composition over configuration**:
  - Use `children` and composition instead of large prop bags:

    ```tsx
    <Card>
      <Card.Header>Title</Card.Header>
      <Card.Body>Content</Card.Body>
    </Card>
    ```

- Avoid deep prop drilling:
  - If state must be shared across distant components, use `Zustand` or `Context` with custom hooks.
- Integrate with the platform through the existing service layer:
  - Renderer code should call `src/services/*` modules (for example `EventsService`, `SettingsService`, `StateSyncService`) instead of touching IPC channels directly.
  - Import contracts from `@shared/*` so renderer types stay aligned with Electron domain models; avoid duplicating literals or enums locally.

---

## TypeScript, React, and Type-Fest

### General Typing Practices

- Type components with explicit props types; avoid `any` and overly broad `React.FC` where it hides problems.
- Use `ComponentProps<typeof SomeComponent>` to re-use prop types for wrappers and HOCs instead of duplicating types.
- Type event handlers precisely:

  ```ts
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    // ...
  };
  ```

- Model component states with discriminated unions when there are distinct modes (loading, error, success, empty, etc.).

### Using Type-Fest in React Code

Use Type-Fest to improve type safety in common React patterns:

- Import helpers from `"type-fest"` in React modules when they clarify intent:

  ```ts
  import type { Merge, SetOptional, SetRequired, JsonValue } from "type-fest";
  ```

- **Prop composition and overrides**:
  - Use `Merge<A, B>` when extending or customizing base component props to avoid conflicting keys:

    ```ts
    import type { Merge } from "type-fest";

    type BaseButtonProps = {
      variant: "primary" | "secondary";
      size: "sm" | "md" | "lg";
    };

    type IconButtonProps = Merge<
      BaseButtonProps,
      {
        // override size defaulting and require icon
        size?: "sm" | "md";
        icon: React.ReactNode;
        children?: never;
      }
    >;
    ```

- **Optional/required props adjustments**:
  - Use `SetOptional` and `SetRequired` when building higher-level components on top of lower-level ones:

    ```ts
    import type { SetOptional } from "type-fest";

    type TextFieldBaseProps = {
      id: string;
      label: string;
      error?: string;
      helperText?: string;
    };

    // In forms, `id` can be generated automatically, so it becomes optional:
    type TextFieldProps = SetOptional<TextFieldBaseProps, "id">;
    ```

- **React configuration objects and JSON**:
  - Use `JsonValue` / `JsonObject` for props that accept arbitrary JSON data:

    ```ts
    import type { JsonValue } from "type-fest";

    type JsonViewerProps = {
      value: JsonValue;
    };
    ```

- **Simplifying complex derived props**:
  - Use `Simplify<T>` on complex generic compositions to improve IntelliSense and readability of inferred props:

    ```ts
    import type { Simplify } from "type-fest";

    type RawUserCardProps = {
      id: string;
      name: string;
      tags?: string[];
    } & {
      onClick?: () => void;
    };

    type UserCardProps = Simplify<RawUserCardProps>;
    ```

- **Branded identifiers in UI**:
  - Use `Opaque` to distinguish ids in React props and prevent mixing multiple ID types:

    ```ts
    import type { Opaque } from "type-fest";

    type UserId = Opaque<string, "UserId">;

    type UserAvatarProps = {
      userId: UserId;
    };
    ```

Keep Type-Fest usage focused on **prop types, state types, and API contracts** that directly affect React behavior. Avoid unnecessary type-level complexity in simple components.

---

## State Management

- Use `useState` for simple, local state:

  ```tsx
  const [open, setOpen] = useState(false);
  ```

- Use `useReducer` for complex or multi-field state updates:

  ```ts
  type State = { loading: boolean; error?: string; data?: Data };
  type Action =
    | { type: "start" }
    | { type: "success"; payload: Data }
    | { type: "error"; error: string };

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "start":
        return { loading: true };
      case "success":
        return { loading: false, data: action.payload };
      case "error":
        return { loading: false, error: action.error };
    }
  }
  ```

- Use `useContext` for cross-tree shared concerns like theme or localization; avoid overusing context for frequently-changing or large data.
- Use **Zustand** for complex global state when needed:
  - Keep stores modular.
  - Avoid monolithic global stores.
  - Type Zustand stores precisely and expose hooks such as `useUserStore`.

---

## Hooks and Effects

- Follow the **Rules of Hooks** strictly:
  - Only call hooks at the top level of React function components or custom hooks.
  - Do not call hooks in loops, conditionals, or nested functions.

- `useEffect`:
  - Specify correct dependencies; avoid disabling ESLint rules to bypass dependency warnings.
  - Include cleanup functions for event listeners, timers, subscriptions:

    ```tsx
    useEffect(() => {
      const id = setInterval(doSomething, 1000);
      return () => clearInterval(id);
    }, [doSomething]);
    ```

- Use `useMemo` and `useCallback`:
  - Only when necessary to avoid expensive recomputations or to stabilize references passed to deeply nested children.
  - Do not overuse; measure before optimizing.

- Create **custom hooks** for reusable stateful logic:
  - Prefix with `use` (e.g., `useUser`, `useDebouncedValue`, `useWindowSize`).
  - Hide implementation details (e.g., Zustand selectors) inside custom hooks.

- Use `useRef`:
  - For DOM references via `ref`.
  - For storing mutable values that persist across renders without triggering rerenders.

---

## Performance Optimization

- Use `React.memo` to memoize components that:
  - Receive stable props and are re-rendered frequently due to parent updates.
  - Avoid wrapping everything with `React.memo`; it has a cost.

- Implement **code splitting**:
  - Use `React.lazy` and `Suspense` for on-demand loading:

    ```tsx
    const SettingsPage = React.lazy(() => import("./SettingsPage"));

    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
    ```

- Optimize bundle size:
  - Prefer tree-shakeable libraries.
  - Avoid unnecessary re-exports that pull large subtrees of dependencies.

- For large lists:
  - Implement virtualization (e.g., `react-window`, `react-virtualized`).
  - Avoid rendering thousands of DOM nodes at once.

- Handle async and data fetching:
  - Model loading, error, and success states explicitly.
  - Handle race conditions and cancellation (e.g., `AbortController`, checking stale flags).
  - Use optimistic updates where appropriate and roll back on failure.

- Handle offline and network errors gracefully:
  - Show user-friendly error messages.
  - Consider caching results for repeat operations.

---

## Testing & Reliability

- Design components for testability:
  - Avoid side effects in render.
  - Move side-effectful logic into hooks or separate modules.
- Prefer **React Testing Library** style tests:
  - Test behavior and observable output, not implementation details.
  - Query via role, label, and text rather than class names.
- When typing test utilities:
  - Use `ComponentProps<typeof Component>` or Type-Fest helpers like `SetOptional` for partial props in factories.
  - Keep factories and fixtures properly typed to avoid `any` leaks.

---

## Accessibility and UX

- Use semantic HTML elements and ARIA attributes where needed.
- Ensure interactive components have keyboard support and proper focus management.
- Provide clear loading and error indicators.
- Favor predictable and consistent behavior across the app.

---

By following these guidelines, React components and hooks will be **well-typed**, **easy to maintain**, and **performant** within a modern TypeScript 5.9+ and React 19+ codebase, with Type-Fest providing additional type-level safety where it adds the most value.
