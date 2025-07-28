# Function: Settings()

> **Settings**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/Settings/Settings.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Settings/Settings.tsx#L70)

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

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

JSX element containing the settings interface
