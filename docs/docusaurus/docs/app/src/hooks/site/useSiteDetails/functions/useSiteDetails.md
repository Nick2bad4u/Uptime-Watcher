# Function: useSiteDetails()

> **useSiteDetails**(`props`): `object`

Defined in: [src/hooks/site/useSiteDetails.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteDetails.ts#L59)

Hook for managing site details state and operations.

Provides all necessary state and handlers for the site details view,
including monitor selection, monitoring controls, settings management,
and integration with analytics.

## Parameters

### props

`UseSiteDetailsProperties`

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

> **handleCheckNow**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleIntervalChange()

> **handleIntervalChange**: (`e`) => `void`

#### Parameters

##### e

`ChangeEvent`\<`HTMLSelectElement`\>

#### Returns

`void`

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

#### Parameters

##### e

`ChangeEvent`\<`HTMLSelectElement`\>

#### Returns

`void`

### handleRemoveMonitor()

> **handleRemoveMonitor**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleRemoveSite()

> **handleRemoveSite**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleRetryAttemptsChange()

> **handleRetryAttemptsChange**: (`e`) => `void`

#### Parameters

##### e

`ChangeEvent`\<`HTMLInputElement`\>

#### Returns

`void`

### handleSaveInterval()

> **handleSaveInterval**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleSaveName()

> **handleSaveName**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleSaveRetryAttempts()

> **handleSaveRetryAttempts**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleSaveTimeout()

> **handleSaveTimeout**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleStartMonitoring()

> **handleStartMonitoring**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleStartSiteMonitoring()

> **handleStartSiteMonitoring**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleStopMonitoring()

> **handleStopMonitoring**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleStopSiteMonitoring()

> **handleStopSiteMonitoring**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleTimeoutChange()

> **handleTimeoutChange**: (`e`) => `void`

#### Parameters

##### e

`ChangeEvent`\<`HTMLInputElement`\>

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

> **setLocalName**: `Dispatch`\<`SetStateAction`\<`string`\>\>

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
