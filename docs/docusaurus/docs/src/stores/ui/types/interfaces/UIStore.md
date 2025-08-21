# Interface: UIStore

Defined in: [src/stores/ui/types.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L22)

Interface for the UI store.

## Remarks

Provides state and actions for managing user interface interactions and modal
visibility.

## Properties

### activeSiteDetailsTab

> **activeSiteDetailsTab**: `string`

Defined in: [src/stores/ui/types.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L26)

The active tab in the site details modal.

***

### openExternal()

> **openExternal**: (`url`, `context?`) => `void`

Defined in: [src/stores/ui/types.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L34)

Opens an external URL using the system's default browser.

#### Parameters

##### url

`string`

The URL to open externally.

##### context?

Optional context for logging purposes.

###### siteName?

`string`

#### Returns

`void`

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/ui/types.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L39)

The identifier of the currently selected site.

***

### setActiveSiteDetailsTab()

> **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/stores/ui/types.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L46)

Sets the active tab in the site details modal.

#### Parameters

##### tab

`string`

The tab identifier to activate.

#### Returns

`void`

***

### setSelectedSite()

> **setSelectedSite**: (`site`) => `void`

Defined in: [src/stores/ui/types.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L53)

Sets the selected site.

#### Parameters

##### site

The site to select, or `undefined` to clear selection.

`undefined` | [`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### setShowAddSiteModal()

> **setShowAddSiteModal**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L60)

Sets the visibility of the add site modal.

#### Parameters

##### show

`boolean`

Whether to show the add site modal.

#### Returns

`void`

***

### setShowAdvancedMetrics()

> **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L67)

Sets the visibility of advanced metrics in the UI.

#### Parameters

##### show

`boolean`

Whether to show advanced metrics.

#### Returns

`void`

***

### setShowSettings()

> **setShowSettings**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L76)

Sets the visibility of the settings modal.

#### Parameters

##### show

`boolean`

Whether to show the settings modal.

#### Returns

`void`

***

### setShowSiteDetails()

> **setShowSiteDetails**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L83)

Sets the visibility of the site details modal.

#### Parameters

##### show

`boolean`

Whether to show the site details modal.

#### Returns

`void`

***

### setSiteDetailsChartTimeRange()

> **setSiteDetailsChartTimeRange**: (`range`) => `void`

Defined in: [src/stores/ui/types.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L90)

Sets the selected time range for site details charts.

#### Parameters

##### range

[`ChartTimeRange`](../../../types/type-aliases/ChartTimeRange.md)

The chart time range to select.

#### Returns

`void`

***

### showAddSiteModal

> **showAddSiteModal**: `boolean`

Defined in: [src/stores/ui/types.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L95)

Whether the add site modal is currently open.

***

### showAdvancedMetrics

> **showAdvancedMetrics**: `boolean`

Defined in: [src/stores/ui/types.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L100)

Whether advanced metrics are visible in the UI.

***

### showSettings

> **showSettings**: `boolean`

Defined in: [src/stores/ui/types.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L107)

Whether the settings modal is currently open.

***

### showSiteDetails

> **showSiteDetails**: `boolean`

Defined in: [src/stores/ui/types.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L112)

Whether the site details modal is currently open.

***

### siteDetailsChartTimeRange

> **siteDetailsChartTimeRange**: [`ChartTimeRange`](../../../types/type-aliases/ChartTimeRange.md)

Defined in: [src/stores/ui/types.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/ui/types.ts#L117)

The selected time range for charts in the site details modal.
