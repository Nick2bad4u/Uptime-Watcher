# Interface: HistoryTabProperties

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/HistoryTab.tsx#L55)

Props for the HistoryTab component.

## Remarks

Defines the required properties for rendering the history tab, including
formatting functions for consistent display and the monitor whose history
should be displayed.

## Properties

### formatFullTimestamp()

> `readonly` **formatFullTimestamp**: (`timestamp`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/HistoryTab.tsx#L57)

Function to format timestamps for display

#### Parameters

##### timestamp

`number`

#### Returns

`string`

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/HistoryTab.tsx#L59)

Function to format response times for display

#### Parameters

##### time

`number`

#### Returns

`string`

***

### formatStatusWithIcon()

> `readonly` **formatStatusWithIcon**: (`status`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/HistoryTab.tsx#L61)

Function to format status with appropriate icons

#### Parameters

##### status

`string`

#### Returns

`string`

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/HistoryTab.tsx#L63)

Currently selected monitor to display history for
