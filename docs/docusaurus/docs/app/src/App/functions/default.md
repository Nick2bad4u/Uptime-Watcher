# Function: default()

> **default**(): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/App.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/App.tsx#L62)

**`Beta`**

Main application component that serves as the root of the Uptime Watcher app.

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

The main App component JSX

## Remarks

This is the primary entry point component that orchestrates the entire application
including state management, theming, error handling, and real-time updates.

The component API may change as we refine the architecture.

## See

 - [useTheme](../../theme/useTheme/functions/useTheme.md) for theme management
 - [useSitesStore](../../stores/sites/useSitesStore/variables/useSitesStore.md) for site state management

## Example

```tsx
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="app-container">
          <Header />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```
