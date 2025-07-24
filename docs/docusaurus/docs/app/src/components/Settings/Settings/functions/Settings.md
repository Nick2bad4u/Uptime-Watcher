# Function: Settings()

> **Settings**(`props`): `Element`

Defined in: [src/components/Settings/Settings.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Settings/Settings.tsx#L52)

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

`Readonly`\<`SettingsProperties`\>

Component props

## Returns

`Element`

JSX element containing the settings interface
