# src/services/logger

Centralized logging service using electron-log for consistent logging across processes.

## Remarks

Provides structured logging functionality organized by functional domains
(app, site, monitor, store) for contextual logging that's easy to filter.

Uses electron-log/renderer for proper renderer process logging that automatically
forwards logs to the main process via IPC for centralized file logging while
maintaining console output in the renderer process for development.

## Type Aliases

- [Logger](type-aliases/Logger.md)

## Variables

- [default](variables/default.md)
