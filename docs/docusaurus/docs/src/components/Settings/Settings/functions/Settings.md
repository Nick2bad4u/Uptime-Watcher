# Function: Settings()

> **Settings**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/Settings/Settings.tsx:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Settings/Settings.tsx#L113)

Settings component providing comprehensive application configuration.

Actual features available:

- Theme selection (light/dark/system)
- History retention limits (25-unlimited records)
- Desktop notifications (on/off)
- Sound alerts (on/off)
- Auto-start with system (on/off)
- Minimize to system tray (on/off)
- Data synchronization from SQLite backend
- SQLite database backup export
- Reset all settings to defaults

## Parameters

### props

[`Readonly`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)\<[`SettingsProperties`](../interfaces/SettingsProperties.md)\>

Component props

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

JSX element containing the settings interface
