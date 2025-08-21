# Interface: UseSiteDetailsResult

Defined in: [src/hooks/site/useSiteDetails.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L61)

Result interface for the useSiteDetails hook

## Properties

### activeSiteDetailsTab

> **activeSiteDetailsTab**: `string`

Defined in: [src/hooks/site/useSiteDetails.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L63)

***

### analytics

> **analytics**: [`SiteAnalytics`](../../useSiteAnalytics/interfaces/SiteAnalytics.md)

Defined in: [src/hooks/site/useSiteDetails.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L65)

***

### currentSite

> **currentSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/site/useSiteDetails.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L67)

***

### handleCheckNow()

> **handleCheckNow**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L69)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleIntervalChange()

> **handleIntervalChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L70)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L71)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveMonitor()

> **handleRemoveMonitor**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L72)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleRemoveSite()

> **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L73)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleRetryAttemptsChange()

> **handleRetryAttemptsChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L74)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### handleSaveInterval()

> **handleSaveInterval**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L75)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveName()

> **handleSaveName**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L76)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveRetryAttempts()

> **handleSaveRetryAttempts**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L77)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L78)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartMonitoring()

> **handleStartMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L79)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartSiteMonitoring()

> **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L80)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopMonitoring()

> **handleStopMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L81)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopSiteMonitoring()

> **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/site/useSiteDetails.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L82)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L83)

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### hasUnsavedChanges

> **hasUnsavedChanges**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L85)

***

### intervalChanged

> **intervalChanged**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L86)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L87)

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L88)

***

### localCheckInterval

> **localCheckInterval**: `number`

Defined in: [src/hooks/site/useSiteDetails.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L89)

***

### localName

> **localName**: `string`

Defined in: [src/hooks/site/useSiteDetails.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L90)

***

### localRetryAttempts

> **localRetryAttempts**: `number`

Defined in: [src/hooks/site/useSiteDetails.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L91)

***

### localTimeout

> **localTimeout**: `number`

Defined in: [src/hooks/site/useSiteDetails.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L92)

***

### retryAttemptsChanged

> **retryAttemptsChanged**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L93)

***

### selectedMonitor

> **selectedMonitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/hooks/site/useSiteDetails.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L94)

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/hooks/site/useSiteDetails.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L95)

***

### setActiveSiteDetailsTab()

> **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L97)

#### Parameters

##### tab

`string`

#### Returns

`void`

***

### setLocalName()

> **setLocalName**: (`name`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L98)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setShowAdvancedMetrics()

> **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L99)

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setSiteDetailsChartTimeRange()

> **setSiteDetailsChartTimeRange**: (`range`) => `void`

Defined in: [src/hooks/site/useSiteDetails.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L100)

#### Parameters

##### range

`"1h"` | `"24h"` | `"7d"` | `"30d"`

#### Returns

`void`

***

### showAdvancedMetrics

> **showAdvancedMetrics**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L101)

***

### siteDetailsChartTimeRange

> **siteDetailsChartTimeRange**: `"1h"` \| `"24h"` \| `"7d"` \| `"30d"`

Defined in: [src/hooks/site/useSiteDetails.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L102)

***

### siteExists

> **siteExists**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L103)

***

### timeoutChanged

> **timeoutChanged**: `boolean`

Defined in: [src/hooks/site/useSiteDetails.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L104)
