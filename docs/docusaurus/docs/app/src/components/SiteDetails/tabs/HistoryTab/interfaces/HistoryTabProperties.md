# Interface: HistoryTabProperties

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/HistoryTab.tsx#L22)

Props for the HistoryTab component.

## Properties

### formatFullTimestamp()

> `readonly` **formatFullTimestamp**: (`timestamp`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/HistoryTab.tsx#L24)

Function to format timestamps for display

#### Parameters

##### timestamp

`number`

#### Returns

`string`

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/HistoryTab.tsx#L26)

Function to format response times for display

#### Parameters

##### time

`number`

#### Returns

`string`

***

### formatStatusWithIcon()

> `readonly` **formatStatusWithIcon**: (`status`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/HistoryTab.tsx#L28)

Function to format status with appropriate icons

#### Parameters

##### status

`string`

#### Returns

`string`

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/HistoryTab.tsx#L30)

Currently selected monitor to display history for
