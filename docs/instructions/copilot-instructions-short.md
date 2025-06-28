# Uptime Watcher: State & Theme Integration Guide (Short Version)

## State Management (Zustand)

- **Centralized store** in `src/store.ts` with persistence for `sites`, `settings`, `checkInterval`, `darkMode`, `totalUptime`, `totalDowntime`.
- **State access:** Always use `useStore()` and store actions (e.g., `addSite`, `setError`, `setLoading`).
- **Error handling:** Use `setError`, `clearError`, and `setLoading` in all async ops. Always clear errors before new actions.
- **No direct mutation:** Never mutate state directly (e.g., `sites.push(newSite)` is forbidden).
- **UI state & errors** are NOT persisted.

## Theme System

- **ThemeManager** singleton in `src/theme/ThemeManager.ts` manages theme switching, CSS vars, and system preference.
- **Themes**: Use `settings.theme` in store for theme selection (`light`, `dark`, `high-contrast`, `system`).
- **Hooks:**
  - `useTheme()` for theme object, switching, and color access.
  - `useThemeClasses()` for classnames (background, text, border, etc).
  - `useThemeValue()` for theme-dependent values.
  - `useStatusColors()` for status-specific colors.

## Themed Components

- **Use only themed components** (from `../theme/components`): `ThemedBox`, `ThemedText`, `ThemedButton`, `StatusIndicator`, `ThemedInput`, `ThemedSelect`, `ThemedCheckbox`, `MiniChartBar`.
- **Variants:** Use `variant`, `surface`, and status props for consistent styling. Never hardcode colors or styles.

## Implementation Checklist

- [ ] Use `useStore()` for all state
- [ ] Use error/loading actions for async ops
- [ ] Use only themed components (no custom CSS)
- [ ] Use theme hooks for dynamic styling
- [ ] Handle both success and error cases
- [ ] Clear errors before new actions
- [ ] Use try-catch-finally for async
- [ ] Select only needed state props
- [ ] Avoid unnecessary re-renders
- [ ] Clean up listeners/timers

## Patterns & Best Practices

- **State:**
  - Select only needed state from store
  - Never mutate state directly
- **Theme:**
  - Use theme hooks for all dynamic values
  - Never hardcode theme values
- **Error Handling:**
  - Show errors via global error display in `App.tsx`
  - Use local error state for component-specific errors
- **Performance:**
  - Memoize expensive components
  - Clean up side effects

## Summary

- Centralized state (Zustand)
- Themed components only
- Proper error/loading handling
- Responsive to theme changes
- Consistent, accessible UI

Follow these rules for all new features and changes to maintain code quality and user experience.
