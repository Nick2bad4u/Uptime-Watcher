# Interface: UIStore

Defined in: [src/stores/ui/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L21)

Interface for the UI store.

## Remarks

Provides state and actions for managing user interface interactions and modal visibility.

## Properties

### activeSiteDetailsTab

> **activeSiteDetailsTab**: `string`

Defined in: [src/stores/ui/types.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L25)

The active tab in the site details modal.

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/ui/types.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L30)

The identifier of the currently selected site.

***

### setActiveSiteDetailsTab()

> **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/stores/ui/types.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L37)

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

Defined in: [src/stores/ui/types.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L44)

Sets the selected site.

#### Parameters

##### site

The site to select, or `undefined` to clear selection.

`undefined` | [`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### setShowAdvancedMetrics()

> **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L51)

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

Defined in: [src/stores/ui/types.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L60)

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

Defined in: [src/stores/ui/types.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L67)

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

Defined in: [src/stores/ui/types.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L74)

Sets the selected time range for site details charts.

#### Parameters

##### range

[`ChartTimeRange`](../../../types/type-aliases/ChartTimeRange.md)

The chart time range to select.

#### Returns

`void`

***

### showAdvancedMetrics

> **showAdvancedMetrics**: `boolean`

Defined in: [src/stores/ui/types.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L79)

Whether advanced metrics are visible in the UI.

***

### showSettings

> **showSettings**: `boolean`

Defined in: [src/stores/ui/types.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L86)

Whether the settings modal is currently open.

***

### showSiteDetails

> **showSiteDetails**: `boolean`

Defined in: [src/stores/ui/types.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L91)

Whether the site details modal is currently open.

***

### siteDetailsChartTimeRange

> **siteDetailsChartTimeRange**: [`ChartTimeRange`](../../../types/type-aliases/ChartTimeRange.md)

Defined in: [src/stores/ui/types.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/ui/types.ts#L96)

The selected time range for charts in the site details modal.
