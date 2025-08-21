# electron/services/window/WindowService

Window management service for Electron application windows.

## Remarks

Handles the creation, configuration, and lifecycle management of Electron
browser windows. Provides a centralized service for window operations
including content loading, event handling, and communication with renderers.

Key responsibilities:

- Create and configure the main application window
- Load appropriate content based on environment (dev/prod)
- Handle window lifecycle events (ready-to-show, closed, etc.)
- Manage window state and provide access methods
- Facilitate communication between main and renderer processes

The service automatically handles environment-specific loading:

- Development: Loads from Vite dev server with DevTools
- Production: Loads from built static files

## Example

```typescript
const windowService = new WindowService();
const mainWindow = windowService.createMainWindow();

// Send data to renderer
windowService.sendToRenderer("status-update", { status: "up" });

// Check if window exists
if (windowService.hasMainWindow()) {
    // Window operations...
}
```

## Classes

- [WindowService](classes/WindowService.md)
