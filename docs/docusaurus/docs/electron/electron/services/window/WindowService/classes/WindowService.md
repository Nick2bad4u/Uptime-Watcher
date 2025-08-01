# Class: WindowService

Defined in: [electron/services/window/WindowService.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L61)

Service responsible for window management and lifecycle.

## Remarks

Provides centralized management of Electron browser windows with proper
security configuration, content loading, and event handling. Ensures
windows are created with appropriate security settings including context
isolation and disabled node integration.

## Constructors

### Constructor

> **new WindowService**(): `WindowService`

Defined in: [electron/services/window/WindowService.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L86)

Create a new WindowService instance.

#### Returns

`WindowService`

#### Remarks

Initializes the service with proper defaults and prepares for window creation.
Windows are not created automatically - call createMainWindow() to create the main window.

## Methods

### closeMainWindow()

> **closeMainWindow**(): `void`

Defined in: [electron/services/window/WindowService.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L95)

Close the main window.

#### Returns

`void`

***

### createMainWindow()

> **createMainWindow**(): `BrowserWindow`

Defined in: [electron/services/window/WindowService.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L117)

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

The window is initially hidden and will be shown when ready-to-show
event is fired to prevent visual flash.

***

### getAllWindows()

> **getAllWindows**(): `BrowserWindow`[]

Defined in: [electron/services/window/WindowService.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L141)

Get all browser windows.

#### Returns

`BrowserWindow`[]

***

### getMainWindow()

> **getMainWindow**(): `null` \| `BrowserWindow`

Defined in: [electron/services/window/WindowService.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L150)

Get the main window instance.

#### Returns

`null` \| `BrowserWindow`

Main window instance or null if not created

***

### hasMainWindow()

> **hasMainWindow**(): `boolean`

Defined in: [electron/services/window/WindowService.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L159)

Check if the main window exists and is not destroyed.

#### Returns

`boolean`

True if main window is available for operations

***

### sendToRenderer()

> **sendToRenderer**(`channel`, `data?`): `void`

Defined in: [electron/services/window/WindowService.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/window/WindowService.ts#L169)

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
