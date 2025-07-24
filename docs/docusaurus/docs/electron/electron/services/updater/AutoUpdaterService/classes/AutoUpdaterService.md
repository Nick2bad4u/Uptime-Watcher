# Class: AutoUpdaterService

Defined in: [electron/services/updater/AutoUpdaterService.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/updater/AutoUpdaterService.ts#L37)

Service responsible for handling application auto-updates.
Manages update checking, downloading, and installation.

## Remarks

This service wraps electron-updater functionality and provides a clean
interface for update management with status callbacks and error handling.

Usage pattern:
1. Initialize the service with event listeners
2. Set status callback for UI updates
3. Check for updates periodically
4. Install updates when ready

## Constructors

### Constructor

> **new AutoUpdaterService**(): `AutoUpdaterService`

#### Returns

`AutoUpdaterService`

## Methods

### checkForUpdates()

> **checkForUpdates**(): `Promise`\<`void`\>

Defined in: [electron/services/updater/AutoUpdaterService.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/updater/AutoUpdaterService.ts#L77)

Check for updates and notify if available.

#### Returns

`Promise`\<`void`\>

Promise that resolves when check completes

#### Remarks

Initiates an update check using electron-updater. If updates are found,
they will be automatically downloaded and the status callback will be
notified of progress.

Error handling:
- Network errors are caught and reported via status callback
- Invalid update server responses are handled gracefully
- All errors are logged for debugging purposes

This method is safe to call multiple times but avoid calling it
frequently as it may impact performance and server load.

***

### initialize()

> **initialize**(): `void`

Defined in: [electron/services/updater/AutoUpdaterService.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/updater/AutoUpdaterService.ts#L114)

Initialize the auto-updater with event listeners.

#### Returns

`void`

void

#### Remarks

Sets up all necessary event listeners for the update lifecycle.
This method should be called once during application startup.

Side effects:
- Registers event listeners on autoUpdater instance
- Enables automatic update notifications
- Configures progress tracking and error handling

Event listeners registered:
- checking-for-update: Update check started
- update-available: Update found
- update-not-available: No updates found
- download-progress: Download progress updates
- update-downloaded: Download completed
- error: Update process errors

Call this method only once per application instance to avoid
duplicate event listeners.

***

### quitAndInstall()

> **quitAndInstall**(): `void`

Defined in: [electron/services/updater/AutoUpdaterService.ts:189](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/updater/AutoUpdaterService.ts#L189)

Quit the application and install the update.

#### Returns

`void`

void - Method does not return as application terminates

#### Remarks

**WARNING: This method will terminate the application immediately.**

Preconditions:
- An update must be downloaded and ready (status: "downloaded")
- All critical application state should be saved before calling
- User should be prompted to confirm the action

Process:
1. Application quits immediately
2. Update installer launches
3. New version starts after installation

This method should only be called when the user has explicitly
confirmed they want to install the update and restart the application.

#### Example

```typescript
// Proper usage with user confirmation
if (updateStatus === "downloaded") {
  const userConfirmed = await showUpdateConfirmDialog();
  if (userConfirmed) {
    await saveApplicationState();
    autoUpdaterService.quitAndInstall();
  }
}
```

***

### setStatusCallback()

> **setStatusCallback**(`callback`): `void`

Defined in: [electron/services/updater/AutoUpdaterService.ts:232](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/updater/AutoUpdaterService.ts#L232)

Set the callback for update status changes.

#### Parameters

##### callback

(`statusData`) => `void`

Function to call when update status changes

#### Returns

`void`

void

#### Remarks

Registers a callback function that will be invoked whenever the update
status changes during the update lifecycle.

Callback contract:
- Must handle all UpdateStatus values gracefully
- Should not throw exceptions or perform blocking operations
- Will be called from the main process context
- May be called multiple times for the same status

The callback receives UpdateStatusData containing:
- status: Current update status
- error: Error message (only present when status is "error")

Only one callback can be registered at a time. Calling this method
multiple times will replace the previous callback.

#### Example

```typescript
autoUpdaterService.setStatusCallback((statusData) => {
  switch (statusData.status) {
    case "available":
      showUpdateAvailableNotification();
      break;
    case "error":
      showUpdateErrorMessage(statusData.error);
      break;
    // ... handle other statuses
  }
});
```
