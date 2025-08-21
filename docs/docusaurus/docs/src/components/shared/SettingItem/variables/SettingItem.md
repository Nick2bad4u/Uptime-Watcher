# Variable: SettingItem

> `const` **SettingItem**: [`React.FC`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L1021)\<[`SettingItemProps`](../interfaces/SettingItemProps.md)\>

Defined in: [src/components/shared/SettingItem.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/shared/SettingItem.tsx#L47)

Standardized setting item layout with title, description, and control

## Example

```tsx
<SettingItem
    title="Auto Start"
    description="Launch the application on system startup"
    control={
        <ThemedCheckbox
            checked={settings.autoStart}
            onChange={handleChange}
        />
    }
/>;
```

## Param

SettingItem props

## Returns

Setting item component with consistent layout
