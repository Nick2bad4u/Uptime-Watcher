# Variable: SiteAnalyticsUtils

> `const` **SiteAnalyticsUtils**: `object`

Defined in: [src/hooks/site/useSiteAnalytics.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteAnalytics.ts#L226)

Utility functions for common calculations

## Type declaration

### calculateSLA()

> **calculateSLA**(`uptime`, `targetSLA`): `object`

Calculate SLA compliance

#### Parameters

##### uptime

`number`

##### targetSLA

`number` = `99.9`

#### Returns

`object`

##### actualDowntime

> **actualDowntime**: `number`

##### allowedDowntime

> **allowedDowntime**: `number`

##### compliant

> **compliant**: `boolean`

##### deficit

> **deficit**: `number`

### getAvailabilityStatus()

> **getAvailabilityStatus**(`uptime`): `"critical"` \| `"excellent"` \| `"good"` \| `"warning"`

Get availability status based on uptime percentage

#### Parameters

##### uptime

`number`

#### Returns

`"critical"` \| `"excellent"` \| `"good"` \| `"warning"`

### getPerformanceStatus()

> **getPerformanceStatus**(`responseTime`): `"critical"` \| `"excellent"` \| `"good"` \| `"warning"`

Get performance status based on response time

#### Parameters

##### responseTime

`number`

#### Returns

`"critical"` \| `"excellent"` \| `"good"` \| `"warning"`
