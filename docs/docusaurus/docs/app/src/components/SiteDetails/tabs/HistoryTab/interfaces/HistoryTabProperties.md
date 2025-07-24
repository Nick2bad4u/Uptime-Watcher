# Interface: HistoryTabProperties

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/HistoryTab.tsx#L23)

Props for the HistoryTab component.

## Properties

### formatFullTimestamp()

> `readonly` **formatFullTimestamp**: (`timestamp`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/HistoryTab.tsx#L25)

Function to format timestamps for display

#### Parameters

##### timestamp

`number`

#### Returns

`string`

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/HistoryTab.tsx#L27)

Function to format response times for display

#### Parameters

##### time

`number`

#### Returns

`string`

***

### formatStatusWithIcon()

> `readonly` **formatStatusWithIcon**: (`status`) => `string`

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/HistoryTab.tsx#L29)

Function to format status with appropriate icons

#### Parameters

##### status

`string`

#### Returns

`string`

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/HistoryTab.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/HistoryTab.tsx#L31)

Currently selected monitor to display history for
