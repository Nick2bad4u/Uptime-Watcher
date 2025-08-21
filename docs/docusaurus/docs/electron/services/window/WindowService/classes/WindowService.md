# Class: WindowService

Defined in: [electron/services/window/WindowService.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L66)

Service responsible for window management and lifecycle.

## Remarks

Provides centralized management of Electron browser windows with proper
security configuration, content loading, and event handling. Ensures windows
are created with appropriate security settings including context isolation
and disabled node integration.

## Constructors

### Constructor

> **new WindowService**(): `WindowService`

Defined in: [electron/services/window/WindowService.ts:301](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L301)

Create a new WindowService instance.

#### Returns

`WindowService`

#### Remarks

Initializes the service with proper defaults and prepares for window
creation. Windows are not created automatically - call createMainWindow()
to create the main window.

## Methods

### closeMainWindow()

> **closeMainWindow**(): `void`

Defined in: [electron/services/window/WindowService.ts:312](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L312)

Close the main window.

#### Returns

`void`

***

### createMainWindow()

> **createMainWindow**(): `BrowserWindow`

Defined in: [electron/services/window/WindowService.ts:335](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L335)

Create and configure the main application window.

#### Returns

`BrowserWindow`

The created BrowserWindow instance

#### Remarks

Creates a new main window with secure defaults including:

- Context isolation enabled for security
- Node integration disabled in renderer
- Preload script for safe IPC communication
- Appropriate minimum and default dimensions
- Environment-specific content loading

The window is initially hidden and will be shown when ready-to-show event
is fired to prevent visual flash.

***

### getAllWindows()

> **getAllWindows**(): `BrowserWindow`[]

Defined in: [electron/services/window/WindowService.ts:359](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L359)

Get all browser windows.

#### Returns

`BrowserWindow`[]

***

### getMainWindow()

> **getMainWindow**(): `null` \| `BrowserWindow`

Defined in: [electron/services/window/WindowService.ts:368](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L368)

Get the main window instance.

#### Returns

`null` \| `BrowserWindow`

Main window instance or null if not created

***

### hasMainWindow()

> **hasMainWindow**(): `boolean`

Defined in: [electron/services/window/WindowService.ts:377](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L377)

Check if the main window exists and is not destroyed.

#### Returns

`boolean`

True if main window is available for operations

***

### sendToRenderer()

> **sendToRenderer**(`channel`, `data?`): `void`

Defined in: [electron/services/window/WindowService.ts:387](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L387)

Send a message to the main window's renderer process.

#### Parameters

##### channel

`string`

IPC channel name

##### data?

`unknown`

Optional data to send

#### Returns

`void`

***

### cleanupWindowEvents()

> **cleanupWindowEvents**(): `void`

Defined in: [electron/services/window/WindowService.ts:523](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/window/WindowService.ts#L523)

Cleanup window event listeners.

#### Returns

`void`

#### Remarks

Removes all event listeners to prevent memory leaks. Should be called
before destroying the window.
