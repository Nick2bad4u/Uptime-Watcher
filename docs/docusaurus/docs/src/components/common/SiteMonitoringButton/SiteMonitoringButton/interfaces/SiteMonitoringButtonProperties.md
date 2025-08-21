# Interface: SiteMonitoringButtonProperties

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L43)

Props for the SiteMonitoringButton component.

## Remarks

Defines the interface for configuring the site monitoring button behavior and
appearance. The component supports both start and stop operations with
loading states and customizable styling.

## Properties

### allMonitorsRunning

> `readonly` **allMonitorsRunning**: `boolean`

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L45)

Whether all monitors are currently running - determines button state

***

### className?

> `readonly` `optional` **className**: `string`

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L47)

Additional CSS classes to apply to the button

***

### compact?

> `readonly` `optional` **compact**: `boolean`

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L49)

Whether to show compact text (for smaller spaces)

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L51)

Whether any operation is currently loading - disables button

***

### onStartSiteMonitoring()

> `readonly` **onStartSiteMonitoring**: () => `void`

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L53)

Handler for starting site-level monitoring

#### Returns

`void`

***

### onStopSiteMonitoring()

> `readonly` **onStopSiteMonitoring**: () => `void`

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L55)

Handler for stopping site-level monitoring

#### Returns

`void`
