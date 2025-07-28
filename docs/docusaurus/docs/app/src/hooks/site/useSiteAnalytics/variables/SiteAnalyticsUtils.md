# Variable: SiteAnalyticsUtils

> `const` **SiteAnalyticsUtils**: `object`

Defined in: [src/hooks/site/useSiteAnalytics.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteAnalytics.ts#L171)

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

Uptime percentage (0-100)

#### Returns

`"critical"` \| `"excellent"` \| `"good"` \| `"warning"`

Status level based on uptime thresholds

#### Remarks

Thresholds: ≥99.9% = excellent, ≥99% = good, ≥95% = warning, \<95% = critical

### getPerformanceStatus()

> **getPerformanceStatus**(`responseTime`): `"critical"` \| `"excellent"` \| `"good"` \| `"warning"`

Get performance status based on response time

#### Parameters

##### responseTime

`number`

Average response time in milliseconds

#### Returns

`"critical"` \| `"excellent"` \| `"good"` \| `"warning"`

Status level based on response time thresholds

#### Remarks

Thresholds: ≤200ms = excellent, ≤500ms = good, ≤1000ms = warning, \>1000ms = critical
