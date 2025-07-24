# Interface: UIStore

Defined in: [src/stores/ui/types.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L14)

UI store interface.
Manages user interface state and interactions.

## Properties

### activeSiteDetailsTab

> **activeSiteDetailsTab**: `string`

Defined in: [src/stores/ui/types.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L16)

Active tab in site details modal

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/ui/types.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L18)

Currently selected site identifier

***

### setActiveSiteDetailsTab()

> **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/stores/ui/types.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L20)

Set active tab in site details modal

#### Parameters

##### tab

`string`

#### Returns

`void`

***

### setSelectedSite()

> **setSelectedSite**: (`site`) => `void`

Defined in: [src/stores/ui/types.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L22)

Set selected site

#### Parameters

##### site

`undefined` | [`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### setShowAdvancedMetrics()

> **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L24)

Set advanced metrics visibility

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setShowSettings()

> **setShowSettings**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L27)

Set settings modal visibility

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setShowSiteDetails()

> **setShowSiteDetails**: (`show`) => `void`

Defined in: [src/stores/ui/types.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L30)

Set site details modal visibility

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setSiteDetailsChartTimeRange()

> **setSiteDetailsChartTimeRange**: (`range`) => `void`

Defined in: [src/stores/ui/types.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L32)

Set chart time range

#### Parameters

##### range

[`ChartTimeRange`](../../../types/type-aliases/ChartTimeRange.md)

#### Returns

`void`

***

### showAdvancedMetrics

> **showAdvancedMetrics**: `boolean`

Defined in: [src/stores/ui/types.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L34)

Whether to show advanced metrics

***

### showSettings

> **showSettings**: `boolean`

Defined in: [src/stores/ui/types.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L37)

Whether settings modal is open

***

### showSiteDetails

> **showSiteDetails**: `boolean`

Defined in: [src/stores/ui/types.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L39)

Whether site details modal is open

***

### siteDetailsChartTimeRange

> **siteDetailsChartTimeRange**: [`ChartTimeRange`](../../../types/type-aliases/ChartTimeRange.md)

Defined in: [src/stores/ui/types.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/ui/types.ts#L41)

Selected time range for charts
