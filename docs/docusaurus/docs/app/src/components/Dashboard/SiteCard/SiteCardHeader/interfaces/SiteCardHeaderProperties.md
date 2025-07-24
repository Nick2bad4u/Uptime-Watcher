# Interface: SiteCardHeaderProperties

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L18)

Props for the SiteCardHeader component

## Properties

### hasMonitor

> **hasMonitor**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L20)

Whether site has any monitors configured

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L22)

Whether any operation is currently loading

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L24)

Whether monitoring is currently active

***

### onCheckNow()

> **onCheckNow**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L26)

Handler for immediate check button

#### Returns

`void`

***

### onMonitorIdChange()

> **onMonitorIdChange**: (`event`) => `void`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L28)

Handler for monitor selection changes

#### Parameters

##### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### onStartMonitoring()

> **onStartMonitoring**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L30)

Handler for start monitoring button

#### Returns

`void`

***

### onStopMonitoring()

> **onStopMonitoring**: () => `void`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L32)

Handler for stop monitoring button

#### Returns

`void`

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L34)

Currently selected monitor ID

***

### site

> **site**: [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L36)

Site data to display
