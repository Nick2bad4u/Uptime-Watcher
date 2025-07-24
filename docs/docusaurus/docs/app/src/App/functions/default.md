# Function: default()

> **default**(): `Element`

Defined in: [src/App.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/App.tsx#L62)

**`Beta`**

Main application component that serves as the root of the Uptime Watcher app.

## Returns

`Element`

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
