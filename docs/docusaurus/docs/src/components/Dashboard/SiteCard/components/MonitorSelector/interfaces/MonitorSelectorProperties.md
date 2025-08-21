# Interface: MonitorSelectorProperties

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L17)

Props for the MonitorSelector component.

## Properties

### className?

> `readonly` `optional` **className**: `string`

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L19)

Optional CSS classes for custom styling

***

### monitors

> `readonly` **monitors**: [`Monitor`](../../../../../../../shared/types/interfaces/Monitor.md)[]

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L21)

Array of available monitors to choose from

***

### onChange()

> `readonly` **onChange**: (`event`) => `void`

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L23)

Callback function for selection change events

#### Parameters

##### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### selectedMonitorId

> `readonly` **selectedMonitorId**: `string`

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L25)

ID of the currently selected monitor
