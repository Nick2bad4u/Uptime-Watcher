# Interface: AdvancedMonitorConfig

Defined in: [shared/types/monitorConfig.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L23)

Advanced monitoring configuration options.

## Remarks

Additional configuration options for advanced monitoring features.

## Properties

### alerting?

> `optional` **alerting**: `object`

Defined in: [shared/types/monitorConfig.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L25)

Alert thresholds and rules

#### alertTypes

> **alertTypes**: (`"email"` \| `"slack"` \| `"webhook"`)[]

Types of alerts to send

#### failureThreshold

> **failureThreshold**: `number`

Consecutive failures before triggering alert

#### messageTemplate?

> `optional` **messageTemplate**: `string`

Alert message template

#### recoveryThreshold

> **recoveryThreshold**: `number`

Consecutive successes before clearing alert

***

### dataRetention?

> `optional` **dataRetention**: `object`

Defined in: [shared/types/monitorConfig.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L36)

Data retention configuration

#### aggregatedDataDays

> **aggregatedDataDays**: `number`

How long to keep aggregated data in days

#### autoCleanup

> **autoCleanup**: `boolean`

Whether to automatically clean up old data

#### detailedHistoryDays

> **detailedHistoryDays**: `number`

How long to keep detailed history in days

***

### performanceThresholds?

> `optional` **performanceThresholds**: `object`

Defined in: [shared/types/monitorConfig.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L45)

Performance monitoring thresholds

#### responseTimeCritical

> **responseTimeCritical**: `number`

Response time critical threshold in milliseconds

#### responseTimeWarning

> **responseTimeWarning**: `number`

Response time warning threshold in milliseconds

#### uptimeCritical

> **uptimeCritical**: `number`

Uptime percentage critical threshold

#### uptimeWarning

> **uptimeWarning**: `number`

Uptime percentage warning threshold

***

### scheduling?

> `optional` **scheduling**: `object`

Defined in: [shared/types/monitorConfig.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L56)

Scheduling configuration

#### activeDays?

> `optional` **activeDays**: (`"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`)[]

Days of the week when monitoring is active

#### activeHours?

> `optional` **activeHours**: `object`

Time ranges when monitoring is active

##### activeHours.end

> **end**: `string`

##### activeHours.start

> **start**: `string`

#### activeTimeZones?

> `optional` **activeTimeZones**: `string`[]

Time zones where monitoring should be active

#### maintenanceWindows?

> `optional` **maintenanceWindows**: `object`[]

Maintenance windows when monitoring is paused
