# Interface: OverviewTabProperties

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L39)

Props for the OverviewTab component.

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L41)

Average response time across all checks

***

### fastestResponse

> `readonly` **fastestResponse**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L43)

Fastest recorded response time

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L45)

Function to format response time for display

#### Parameters

##### time

`number`

#### Returns

`string`

***

### handleIntervalChange()

> `readonly` **handleIntervalChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L47)

Handler for monitor check interval changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveMonitor()

> `readonly` **handleRemoveMonitor**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L49)

Handler for removing the monitor

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveInterval()

> `readonly` **handleSaveInterval**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L51)

Handler for saving interval changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> `readonly` **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L53)

Handler for saving timeout changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> `readonly` **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L55)

Handler for monitor timeout changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### intervalChanged

> `readonly` **intervalChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L57)

Whether the check interval has been changed

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L59)

Whether any async operation is in progress

***

### localCheckInterval

> `readonly` **localCheckInterval**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L61)

Local state value for check interval

***

### localTimeout

> `readonly` **localTimeout**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L63)

Local state value for timeout

***

### onCheckNow()

> `readonly` **onCheckNow**: () => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L65)

Handler for immediate check trigger

#### Returns

`void`

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L67)

Currently selected monitor

***

### slowestResponse

> `readonly` **slowestResponse**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L69)

Slowest recorded response time

***

### timeoutChanged

> `readonly` **timeoutChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L71)

Whether the timeout has been changed

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L73)

Total number of checks performed

***

### uptime

> `readonly` **uptime**: `string`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/OverviewTab.tsx#L75)

Uptime percentage as a string
