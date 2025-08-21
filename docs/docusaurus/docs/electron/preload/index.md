# electron/preload

Preload script that exposes safe IPC communication to the renderer process.

## Remarks

Creates a secure bridge between main and renderer processes using
contextBridge. Organized by functional domains: sites, monitoring, data,
settings, events, system.
