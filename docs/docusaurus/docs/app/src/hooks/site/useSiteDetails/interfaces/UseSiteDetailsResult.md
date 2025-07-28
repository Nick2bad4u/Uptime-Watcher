# Interface: UseSiteDetailsResult

Defined in: [src/hooks/site/useSiteDetails.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L47)

Result interface for the useSiteDetails hook

## Properties

### activeSiteDetailsTab

> **activeSiteDetailsTab**: `string`

Defined in: [src/hooks/site/useSiteDetails.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L49)

***

### analytics

> **analytics**: [`SiteAnalytics`](../../useSiteAnalytics/interfaces/SiteAnalytics.md)

Defined in: [src/hooks/site/useSiteDetails.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L51)

***

### currentSite

> **currentSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/site/useSiteDetails.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L53)

***

### handleCheckNow()

> **handleCheckNow**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L55)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleIntervalChange()

> **handleIntervalChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L56)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L57)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveMonitor()

> **handleRemoveMonitor**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L58)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleRemoveSite()

> **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L59)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleRetryAttemptsChange()

> **handleRetryAttemptsChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L60)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### handleSaveInterval()

> **handleSaveInterval**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L61)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveName()

> **handleSaveName**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L62)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveRetryAttempts()

> **handleSaveRetryAttempts**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L63)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L64)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartMonitoring()

> **handleStartMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L65)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartSiteMonitoring()

> **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L66)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopMonitoring()

> **handleStopMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L67)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopSiteMonitoring()

> **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L68)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L69)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### hasUnsavedChanges

> **hasUnsavedChanges**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L71)

***

### intervalChanged

> **intervalChanged**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L72)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L73)

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L74)

***

### localCheckInterval

> **localCheckInterval**: `number`

Defined in: [src/hooks/site/useSiteDetails.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L75)

***

### localName

> **localName**: `string`

Defined in: [src/hooks/site/useSiteDetails.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L76)

***

### localRetryAttempts

> **localRetryAttempts**: `number`

Defined in: [src/hooks/site/useSiteDetails.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L77)

***

### localTimeout

> **localTimeout**: `number`

Defined in: [src/hooks/site/useSiteDetails.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L78)

***

### retryAttemptsChanged

> **retryAttemptsChanged**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L79)

***

### selectedMonitor

> **selectedMonitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/hooks/site/useSiteDetails.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L80)

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/hooks/site/useSiteDetails.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L81)

***

### setActiveSiteDetailsTab()

> **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L83)

#### Parameters

##### tab

`string`

#### Returns

`void`

***

### setLocalName()

> **setLocalName**: (`name`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L84)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setShowAdvancedMetrics()

> **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L85)

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setSiteDetailsChartTimeRange()

> **setSiteDetailsChartTimeRange**: (`range`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L86)

#### Parameters

##### range

[`ChartTimeRange`](../../../../stores/types/type-aliases/ChartTimeRange.md)

#### Returns

`void`

***

### showAdvancedMetrics

> **showAdvancedMetrics**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L87)

***

### siteDetailsChartTimeRange

> **siteDetailsChartTimeRange**: [`ChartTimeRange`](../../../../stores/types/type-aliases/ChartTimeRange.md)

Defined in: [src/hooks/site/useSiteDetails.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L88)

***

### siteExists

> **siteExists**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L89)

***

### timeoutChanged

> **timeoutChanged**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteDetails.ts#L90)
