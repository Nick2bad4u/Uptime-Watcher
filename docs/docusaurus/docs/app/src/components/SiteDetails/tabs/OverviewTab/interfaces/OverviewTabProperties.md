# Interface: OverviewTabProperties

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L32)

Props for the OverviewTab component.

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L34)

Average response time across all checks

***

### fastestResponse

> `readonly` **fastestResponse**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L36)

Fastest recorded response time

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L38)

Function to format response time for display

#### Parameters

##### time

`number`

#### Returns

`string`

***

### handleIntervalChange()

> `readonly` **handleIntervalChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L40)

Handler for monitor check interval changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveMonitor()

> `readonly` **handleRemoveMonitor**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L42)

Handler for removing the monitor

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveInterval()

> `readonly` **handleSaveInterval**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L44)

Handler for saving interval changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> `readonly` **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L46)

Handler for saving timeout changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> `readonly` **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L48)

Handler for monitor timeout changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### intervalChanged

> `readonly` **intervalChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L50)

Whether the check interval has been changed

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L52)

Whether any async operation is in progress

***

### localCheckInterval

> `readonly` **localCheckInterval**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L54)

Local state value for check interval

***

### localTimeout

> `readonly` **localTimeout**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L56)

Local state value for timeout

***

### onCheckNow()

> `readonly` **onCheckNow**: () => `void`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L58)

Handler for immediate check trigger

#### Returns

`void`

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L60)

Currently selected monitor

***

### slowestResponse

> `readonly` **slowestResponse**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L62)

Slowest recorded response time

***

### timeoutChanged

> `readonly` **timeoutChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L64)

Whether the timeout has been changed

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L66)

Total number of checks performed

***

### uptime

> `readonly` **uptime**: `string`

Defined in: [src/components/SiteDetails/tabs/OverviewTab.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/OverviewTab.tsx#L68)

Uptime percentage as a string
