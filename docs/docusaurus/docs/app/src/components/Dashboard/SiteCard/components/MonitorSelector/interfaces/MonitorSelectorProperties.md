# Interface: MonitorSelectorProperties

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L16)

Props for the MonitorSelector component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L18)

Optional CSS classes for custom styling

***

### monitors

> **monitors**: [`Monitor`](../../../../../../../shared/types/interfaces/Monitor.md)[]

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L20)

Array of available monitors to choose from

***

### onChange()

> **onChange**: (`event`) => `void`

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L22)

Callback function for selection change events

#### Parameters

##### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L24)

ID of the currently selected monitor
