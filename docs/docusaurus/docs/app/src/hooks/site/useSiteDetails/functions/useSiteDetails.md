# Function: useSiteDetails()

> **useSiteDetails**(`props`): `object`

Defined in: [src/hooks/site/useSiteDetails.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteDetails.ts#L63)

Hook for managing site details state and operations.

Provides all necessary state and handlers for the site details view,
including monitor selection, monitoring controls, settings management,
and integration with analytics.

## Parameters

### props

[`UseSiteDetailsProperties`](../interfaces/UseSiteDetailsProperties.md)

Hook props containing the site to manage

## Returns

`object`

Object containing all site details state and handlers

### activeSiteDetailsTab

> **activeSiteDetailsTab**: `string`

### analytics

> **analytics**: [`SiteAnalytics`](../../useSiteAnalytics/interfaces/SiteAnalytics.md)

### currentSite

> **currentSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

### handleCheckNow()

> **handleCheckNow**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleIntervalChange()

> **handleIntervalChange**: (`e`) => `void`

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

### handleRemoveMonitor()

> **handleRemoveMonitor**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleRemoveSite()

> **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleRetryAttemptsChange()

> **handleRetryAttemptsChange**: (`e`) => `void`

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

### handleSaveInterval()

> **handleSaveInterval**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleSaveName()

> **handleSaveName**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleSaveRetryAttempts()

> **handleSaveRetryAttempts**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleSaveTimeout()

> **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleStartMonitoring()

> **handleStartMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleStartSiteMonitoring()

> **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleStopMonitoring()

> **handleStopMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleStopSiteMonitoring()

> **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### handleTimeoutChange()

> **handleTimeoutChange**: (`e`) => `void`

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

### hasUnsavedChanges

> **hasUnsavedChanges**: `boolean`

### intervalChanged

> **intervalChanged**: `boolean`

### isLoading

> **isLoading**: `boolean`

### isMonitoring

> **isMonitoring**: `boolean`

### localCheckInterval

> **localCheckInterval**: `number`

### localName

> **localName**: `string`

### localRetryAttempts

> **localRetryAttempts**: `number`

### localTimeout

> **localTimeout**: `number`

### retryAttemptsChanged

> **retryAttemptsChanged**: `boolean`

### selectedMonitor

> **selectedMonitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

### selectedMonitorId

> **selectedMonitorId**: `string`

### setActiveSiteDetailsTab()

> **setActiveSiteDetailsTab**: (`tab`) => `void`

#### Parameters

##### tab

`string`

#### Returns

`void`

### setLocalName

> **setLocalName**: [`Dispatch`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L1636)\<[`SetStateAction`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L1630)\<`string`\>\>

### setShowAdvancedMetrics()

> **setShowAdvancedMetrics**: (`show`) => `void`

#### Parameters

##### show

`boolean`

#### Returns

`void`

### setSiteDetailsChartTimeRange()

> **setSiteDetailsChartTimeRange**: (`range`) => `void`

#### Parameters

##### range

[`ChartTimeRange`](../../../../stores/types/type-aliases/ChartTimeRange.md)

#### Returns

`void`

### showAdvancedMetrics

> **showAdvancedMetrics**: `boolean`

### siteDetailsChartTimeRange

> **siteDetailsChartTimeRange**: [`ChartTimeRange`](../../../../stores/types/type-aliases/ChartTimeRange.md)

### siteExists

> **siteExists**: `boolean`

### timeoutChanged

> **timeoutChanged**: `boolean`

## Example

```tsx
function SiteDetails({ site }) {
  const {
    currentSite,
    selectedMonitor,
    isLoading,
    handleStartMonitoring,
    handleStopMonitoring,
    // ... other state and handlers
  } = useSiteDetails({ site });

  // Use the state and handlers in your component
}
```
