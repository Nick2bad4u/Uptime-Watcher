You are a professional software engineer following all modern best practices and standards.

Always keep in mind the following when making changes:

1. Review all logic and data paths
2. Ensure proper state management
3. Use project standards for coding
4. Ensure proper integration with front and backend
5. Double check all changes for consistency
6. Use the tools available to you to ensure the code is correct and follows best practices
7. Always test your changes thoroughly before finalizing
8. Always aim for 100% test coverage.
9. Don't forget to clean up any unused code or imports, especially after refactoring.
10. Use as many requests as you want, and use as much time as you want. KEEP GOING UNTIL YOU FINISH ALL ASSIGNED TASKS!!!

# Uptime Watcher - AI Context Instructions

### Technology Stack

- **Frontend**: React + TypeScript + Zustand + TailwindCSS + Vite
- **Backend**: Electron main process + Node.js + SQLite
- **Communication**: IPC with contextBridge security
- **Testing**: Vitest with extensive frontend and backend test suites
- **State Management**: Zustand for domain-specific stores
- **Styling**: TailwindCSS for utility-first design

## Database Schema

```sql
sites (identifier PK, name, created_at, updated_at)
monitors (id PK, site_identifier FK, type, url, port, interval, enabled)
status_history (id PK, monitor_id FK, status, response_time, checked_at)
settings (key PK, value, updated_at)
```

## Security & Performance

- **Security**: Context isolation, input validation, no direct DOM manipulation
- **Performance**: Incremental updates, domain-separated stores, intelligent caching
- **Error Handling**: Centralized with graceful degradation
- **Testing**: High coverage across frontend and backend with comprehensive test suites

## Key App Behaviors

1. **No Direct DOM**: All UI updates flow through React state
2. **Type Safety**: Full TypeScript with strict configuration
3. **Real-Time**: Event-driven status updates with optimized re-renders
4. **Modular**: Clean domain separation, dependency injection ready
5. **Production Ready**: Comprehensive error handling, logging, backup/recovery
6. **IPC Communication**: All backend interactions via `window.electronAPI` for security and maintainability
7. **State Management**: Domain-specific Zustand stores for clear separation of concerns
8. **Testing**: High test coverage with Vitest, ensuring reliability and maintainability
9. **Styling**: TailwindCSS for consistent, responsive design
10. **Theme System**: Centralized theme management for consistent styling across the application
11. **Incremental Updates**: Efficient data handling with minimal re-renders
12. **Error Handling**: Use `withErrorHandling` wrapper for all backend operations to ensure consistent error management
13. **Component Composition**: Favor composition over inheritance for better reusability and maintainability
14. **Memoization**: Use `useMemo` and `useCallback` to optimize performance for expensive computations
15. **Side Effects**: Use `useEffect` for side effects, never in render methods
16. **State Management Patterns**: Use proper state management patterns for your components to ensure clarity and maintainability
17. **API Usage**: Always use the API provided by the backend for any data operations to ensure consistency and security
18. **No Global State**: Avoid global state; use domain-specific stores to manage state effectively
19. **Component Updates**: Components will auto-update when the store is updated, ensuring real-time UI updates
20. **Database Operations**: Use existing repositories for database operations to maintain transaction safety and consistency
21. **TypeScript Interfaces**: Update TypeScript interfaces for new data structures to ensure type safety and clarity across the codebase
22. **Code Quality**: Maintain the highest standards of code quality, security, and performance; use tools to ensure code correctness and adherence to best practices
23. **Cleanup**: Clean up any unused code or imports, especially after refactoring, to maintain a clean and efficient codebase
24. **Incremental Development**: Break down tasks into smaller, manageable pieces; focus on completing each task thoroughly before moving on to the next

## When Making Changes

1. **Frontend**: Update store → component will auto-update
2. **Backend**: Add IPC handler → update preload → update frontend
3. **Database**: Use existing repositories, maintain transaction safety
4. **Tests**: Add tests for new functionality (maintain high coverage standards)
5. **Types**: Update TypeScript interfaces for new data structures
6. **Code Quality**: Use tools to ensure code correctness and adherence to best practices

Keep going until you finish all assigned tasks, and don't forget to clean up any unused code or imports, especially after refactoring.
Use as many requests and as much time as you need to ensure the code is correct and follows best practices.
