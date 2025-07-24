# Interface: OverviewTabProperties

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L31)

Props for the OverviewTab component.

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L33)

Average response time across all checks

***

### fastestResponse

> `readonly` **fastestResponse**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L35)

Fastest recorded response time

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L37)

Function to format response time for display

#### Parameters

##### time

`number`

#### Returns

`string`

***

### handleIntervalChange()

> `readonly` **handleIntervalChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L39)

Handler for monitor check interval changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveMonitor()

> `readonly` **handleRemoveMonitor**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L41)

Handler for removing the monitor

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveInterval()

> `readonly` **handleSaveInterval**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L43)

Handler for saving interval changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> `readonly` **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L45)

Handler for saving timeout changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> `readonly` **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L47)

Handler for monitor timeout changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### intervalChanged

> `readonly` **intervalChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L49)

Whether the check interval has been changed

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L51)

Whether any async operation is in progress

***

### localCheckInterval

> `readonly` **localCheckInterval**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L53)

Local state value for check interval

***

### localTimeout

> `readonly` **localTimeout**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L55)

Local state value for timeout

***

### onCheckNow()

> `readonly` **onCheckNow**: () => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L57)

Handler for immediate check trigger

#### Returns

`void`

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L59)

Currently selected monitor

***

### slowestResponse

> `readonly` **slowestResponse**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L61)

Slowest recorded response time

***

### timeoutChanged

> `readonly` **timeoutChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L63)

Whether the timeout has been changed

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L65)

Total number of checks performed

***

### uptime

> `readonly` **uptime**: `string`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/OverviewTab.tsx#L67)

Uptime percentage as a string
