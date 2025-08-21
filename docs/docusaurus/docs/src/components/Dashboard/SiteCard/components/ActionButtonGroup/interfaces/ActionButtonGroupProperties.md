# Interface: ActionButtonGroupProperties

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L21)

Props for the ActionButtonGroup component.

## See

ActionButtonGroup

## Properties

### allMonitorsRunning

> `readonly` **allMonitorsRunning**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L23)

Whether all monitors are currently running

***

### disabled

> `readonly` **disabled**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L25)

Whether all buttons should be disabled

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L27)

Whether any operation is currently loading

***

### isMonitoring

> `readonly` **isMonitoring**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L29)

Whether monitoring is currently active

***

### onCheckNow()

> `readonly` **onCheckNow**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L31)

Callback function to trigger immediate site check

#### Returns

`void`

***

### onStartMonitoring()

> `readonly` **onStartMonitoring**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L33)

Callback function to start monitoring

#### Returns

`void`

***

### onStartSiteMonitoring()

> `readonly` **onStartSiteMonitoring**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L35)

Callback function to start site-wide monitoring

#### Returns

`void`

***

### onStopMonitoring()

> `readonly` **onStopMonitoring**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L37)

Callback function to stop monitoring

#### Returns

`void`

***

### onStopSiteMonitoring()

> `readonly` **onStopSiteMonitoring**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L39)

Callback function to stop site-wide monitoring

#### Returns

`void`
