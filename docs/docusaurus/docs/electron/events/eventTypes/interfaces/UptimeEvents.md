# Interface: UptimeEvents

Defined in: [electron/events/eventTypes.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L37)

Comprehensive event map for the Uptime Watcher application.

## Remarks

Defines all events that can be emitted throughout the application lifecycle,
organized by functional domains. Each event includes strongly typed data for
compile-time safety and comprehensive metadata for debugging, auditing, and
event-driven workflows.

## See

 - [EventCategory](../type-aliases/EventCategory.md)
 - [EventCheckType](../type-aliases/EventCheckType.md)
 - [EventEnvironment](../type-aliases/EventEnvironment.md)
 - [EventReason](../type-aliases/EventReason.md)
 - [EventSeverity](../type-aliases/EventSeverity.md)
 - [EventSource](../type-aliases/EventSource.md)
 - [EventTriggerType](../type-aliases/EventTriggerType.md)

## Extends

- [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### cache:invalidated

> **cache:invalidated**: `object`

Defined in: [electron/events/eventTypes.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L52)

Emitted when a cache entry is invalidated for a site or monitor.

#### identifier?

> `optional` **identifier**: `string`

#### reason

> **reason**: `"delete"` \| `"expiry"` \| `"manual"` \| `"update"`

#### timestamp

> **timestamp**: `number`

#### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

#### Remarks

Used to trigger cache refreshes or notify listeners of data changes.

#### Param

Optional unique identifier for the cache entry.

#### Param

Reason for invalidation ("delete", "expiry", "manual", or
  "update").

#### Param

Unix timestamp (ms) when invalidation occurred.

#### Param

Type of cache invalidated ("all", "monitor", or "site").

***

### config:changed

> **config:changed**: `object`

Defined in: [electron/events/eventTypes.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L72)

Emitted when a configuration setting is changed.

#### newValue

> **newValue**: `unknown`

#### oldValue

> **oldValue**: `unknown`

#### setting

> **setting**: `string`

#### source

> **source**: `"user"` \| `"system"` \| `"migration"`

#### timestamp

> **timestamp**: `number`

#### Remarks

Used to propagate configuration changes throughout the application.

#### Param

The new value of the setting.

#### Param

The previous value of the setting.

#### Param

The name of the setting that changed.

#### Param

The origin of the change ("migration", "system", or
  "user").

#### Param

Unix timestamp (ms) when the change occurred.

***

### database:backup-created

> **database:backup-created**: `object`

Defined in: [electron/events/eventTypes.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L92)

Emitted when a database backup is created.

#### fileName

> **fileName**: `string`

#### size

> **size**: `number`

#### timestamp

> **timestamp**: `number`

#### triggerType

> **triggerType**: `"manual"` \| `"shutdown"` \| `"scheduled"`

#### Remarks

Used for backup tracking and notification.

#### Param

Name of the backup file.

#### Param

Size of the backup file in bytes.

#### Param

Unix timestamp (ms) when backup was created.

#### Param

What triggered the backup ("manual", "scheduled", or
  "shutdown").

***

### database:error

> **database:error**: `object`

Defined in: [electron/events/eventTypes.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L111)

Emitted when a database error occurs.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### error

> **error**: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### operation

> **operation**: `string`

#### timestamp

> **timestamp**: `number`

#### Remarks

Additional properties may be present for context.

#### Param

The error object.

#### Param

The database operation that failed.

#### Param

Unix timestamp (ms) when the error occurred.

***

### database:retry

> **database:retry**: `object`

Defined in: [electron/events/eventTypes.ts:128](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L128)

Emitted when a database operation is retried after failure.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### attempt

> **attempt**: `number`

#### operation

> **operation**: `string`

#### timestamp

> **timestamp**: `number`

#### Remarks

Additional properties may be present for context.

#### Param

The retry attempt number.

#### Param

The database operation being retried.

#### Param

Unix timestamp (ms) when the retry occurred.

***

### database:success

> **database:success**: `object`

Defined in: [electron/events/eventTypes.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L145)

Emitted when a database operation succeeds.

#### Index Signature

\[`key`: `string`\]: `unknown`

#### duration?

> `optional` **duration**: `number`

#### operation

> **operation**: `string`

#### timestamp

> **timestamp**: `number`

#### Remarks

Additional properties may be present for context.

#### Param

Optional duration (ms) of the operation.

#### Param

The database operation that succeeded.

#### Param

Unix timestamp (ms) when the operation succeeded.

***

### database:transaction-completed

> **database:transaction-completed**: `object`

Defined in: [electron/events/eventTypes.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L161)

Emitted when a database transaction completes.

#### duration

> **duration**: `number`

#### operation

> **operation**: `string`

#### recordsAffected?

> `optional` **recordsAffected**: `number`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

#### Param

Duration (ms) of the transaction.

#### Param

The database operation performed in the transaction.

#### Param

Optional number of records affected.

#### Param

Whether the transaction was successful.

#### Param

Unix timestamp (ms) when the transaction completed.

***

### internal:database:backup-downloaded

> **internal:database:backup-downloaded**: `object`

Defined in: [electron/events/eventTypes.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L177)

Emitted when a database backup is downloaded.

#### fileName?

> `optional` **fileName**: `string`

#### operation

> **operation**: `"backup-downloaded"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

#### Param

Optional name of the backup file.

#### Param

The operation type (always "backup-downloaded").

#### Param

Whether the download was successful.

#### Param

Unix timestamp (ms) when the download completed.

***

### internal:database:data-exported

> **internal:database:data-exported**: `object`

Defined in: [electron/events/eventTypes.ts:192](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L192)

Emitted when database data is exported.

#### fileName?

> `optional` **fileName**: `string`

#### operation

> **operation**: `"data-exported"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

#### Param

Optional name of the exported file.

#### Param

The operation type (always "data-exported").

#### Param

Whether the export was successful.

#### Param

Unix timestamp (ms) when the export completed.

***

### internal:database:data-imported

> **internal:database:data-imported**: `object`

Defined in: [electron/events/eventTypes.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L207)

Emitted when database data is imported.

#### operation

> **operation**: `"data-imported"`

#### recordCount?

> `optional` **recordCount**: `number`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

#### Param

The operation type (always "data-imported").

#### Param

Optional number of records imported.

#### Param

Whether the import was successful.

#### Param

Unix timestamp (ms) when the import completed.

***

### internal:database:get-sites-from-cache-requested

> **internal:database:get-sites-from-cache-requested**: `object`

Defined in: [electron/events/eventTypes.ts:221](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L221)

Emitted when a request is made to get sites from the cache.

#### operation

> **operation**: `"get-sites-from-cache-requested"`

#### timestamp

> **timestamp**: `number`

#### Param

The operation type (always
  "get-sites-from-cache-requested").

#### Param

Unix timestamp (ms) when the request was made.

***

### internal:database:get-sites-from-cache-response

> **internal:database:get-sites-from-cache-response**: `object`

Defined in: [electron/events/eventTypes.ts:234](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L234)

Emitted in response to a get-sites-from-cache request.

#### operation

> **operation**: `"get-sites-from-cache-response"`

#### sites

> **sites**: [`Site`](../../../../shared/types/interfaces/Site.md)[]

#### timestamp

> **timestamp**: `number`

#### Param

The operation type (always
  "get-sites-from-cache-response").

#### Param

The list of sites returned from the cache.

#### Param

Unix timestamp (ms) when the response was sent.

***

### internal:database:history-limit-updated

> **internal:database:history-limit-updated**: `object`

Defined in: [electron/events/eventTypes.ts:247](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L247)

Emitted when the history limit for the database is updated.

#### limit

> **limit**: `number`

#### operation

> **operation**: `"history-limit-updated"`

#### timestamp

> **timestamp**: `number`

#### Param

The new history limit value.

#### Param

The operation type (always "history-limit-updated").

#### Param

Unix timestamp (ms) when the update occurred.

***

### internal:database:initialized

> **internal:database:initialized**: `object`

Defined in: [electron/events/eventTypes.ts:260](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L260)

Emitted when the database is initialized.

#### operation

> **operation**: `"initialized"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

#### Param

The operation type (always "initialized").

#### Param

Whether initialization was successful.

#### Param

Unix timestamp (ms) when initialization completed.

***

### internal:database:sites-refreshed

> **internal:database:sites-refreshed**: `object`

Defined in: [electron/events/eventTypes.ts:273](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L273)

Emitted when the sites cache is refreshed in the database.

#### operation

> **operation**: `"sites-refreshed"`

#### siteCount

> **siteCount**: `number`

#### timestamp

> **timestamp**: `number`

#### Param

The operation type (always "sites-refreshed").

#### Param

The number of sites refreshed.

#### Param

Unix timestamp (ms) when the refresh completed.

***

### internal:database:update-sites-cache-requested

> **internal:database:update-sites-cache-requested**: `object`

Defined in: [electron/events/eventTypes.ts:287](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L287)

Emitted when a request is made to update the sites cache.

#### operation

> **operation**: `"update-sites-cache-requested"`

#### sites?

> `optional` **sites**: [`Site`](../../../../shared/types/interfaces/Site.md)[]

#### timestamp

> **timestamp**: `number`

#### Param

The operation type (always
  "update-sites-cache-requested").

#### Param

Optional list of sites to update in the cache.

#### Param

Unix timestamp (ms) when the request was made.

***

### internal:monitor:all-started

> **internal:monitor:all-started**: `object`

Defined in: [electron/events/eventTypes.ts:303](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L303)

Emitted when all monitors are started.

#### monitorCount

> **monitorCount**: `number`

#### operation

> **operation**: `"all-started"`

#### siteCount

> **siteCount**: `number`

#### timestamp

> **timestamp**: `number`

#### Param

The number of monitors started.

#### Param

The operation type (always "all-started").

#### Param

The number of sites involved.

#### Param

Unix timestamp (ms) when the operation completed.

***

### internal:monitor:all-stopped

> **internal:monitor:all-stopped**: `object`

Defined in: [electron/events/eventTypes.ts:318](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L318)

Emitted when all monitors are stopped.

#### activeMonitors

> **activeMonitors**: `number`

#### operation

> **operation**: `"all-stopped"`

#### reason

> **reason**: [`EventReason`](../type-aliases/EventReason.md)

#### timestamp

> **timestamp**: `number`

#### Param

The number of monitors that were active.

#### Param

The operation type (always "all-stopped").

#### Param

The reason for stopping.

#### Param

Unix timestamp (ms) when the operation completed.

***

### internal:monitor:manual-check-completed

> **internal:monitor:manual-check-completed**: `object`

Defined in: [electron/events/eventTypes.ts:334](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L334)

Emitted when a manual monitor check is completed.

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"manual-check-completed"`

#### result

> **result**: [`StatusUpdate`](../../../../shared/types/interfaces/StatusUpdate.md)

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the monitor or site.

#### Param

Optional monitor ID.

#### Param

The operation type (always "manual-check-completed").

#### Param

The status update result.

#### Param

Unix timestamp (ms) when the check completed.

***

### internal:monitor:site-setup-completed

> **internal:monitor:site-setup-completed**: `object`

Defined in: [electron/events/eventTypes.ts:349](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L349)

Emitted when site setup for monitoring is completed.

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"site-setup-completed"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The operation type (always "site-setup-completed").

#### Param

Unix timestamp (ms) when setup completed.

***

### internal:monitor:started

> **internal:monitor:started**: `object`

Defined in: [electron/events/eventTypes.ts:363](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L363)

Emitted when a monitor is started.

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"started"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the monitor or site.

#### Param

Optional monitor ID.

#### Param

The operation type (always "started").

#### Param

Unix timestamp (ms) when the monitor started.

***

### internal:monitor:stopped

> **internal:monitor:stopped**: `object`

Defined in: [electron/events/eventTypes.ts:379](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L379)

Emitted when a monitor is stopped.

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"stopped"`

#### reason

> **reason**: [`EventReason`](../type-aliases/EventReason.md)

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the monitor or site.

#### Param

Optional monitor ID.

#### Param

The operation type (always "stopped").

#### Param

The reason for stopping.

#### Param

Unix timestamp (ms) when the monitor stopped.

***

### internal:site:added

> **internal:site:added**: `object`

Defined in: [electron/events/eventTypes.ts:395](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L395)

Emitted when a site is added internally.

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"added"`

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The operation type (always "added").

#### Param

The site object added.

#### Param

Unix timestamp (ms) when the site was added.

***

### internal:site:cache-updated

> **internal:site:cache-updated**: `object`

Defined in: [electron/events/eventTypes.ts:409](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L409)

Emitted when a site's cache is updated internally.

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"cache-updated"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The operation type (always "cache-updated").

#### Param

Unix timestamp (ms) when the cache was updated.

***

### internal:site:is-monitoring-active-requested

> **internal:site:is-monitoring-active-requested**: `object`

Defined in: [electron/events/eventTypes.ts:425](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L425)

Emitted when a request is made to check if monitoring is active for a
site.

#### identifier

> **identifier**: `string`

#### monitorId

> **monitorId**: `string`

#### operation

> **operation**: `"is-monitoring-active-requested"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The monitor ID.

#### Param

The operation type (always
  "is-monitoring-active-requested").

#### Param

Unix timestamp (ms) when the request was made.

***

### internal:site:is-monitoring-active-response

> **internal:site:is-monitoring-active-response**: `object`

Defined in: [electron/events/eventTypes.ts:442](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L442)

Emitted in response to a monitoring active check request.

#### identifier

> **identifier**: `string`

#### isActive

> **isActive**: `boolean`

#### monitorId

> **monitorId**: `string`

#### operation

> **operation**: `"is-monitoring-active-response"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

Whether monitoring is active.

#### Param

The monitor ID.

#### Param

The operation type (always
  "is-monitoring-active-response").

#### Param

Unix timestamp (ms) when the response was sent.

***

### internal:site:removed

> **internal:site:removed**: `object`

Defined in: [electron/events/eventTypes.ts:457](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L457)

Emitted when a site is removed internally.

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"removed"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The operation type (always "removed").

#### Param

Unix timestamp (ms) when the site was removed.

***

### internal:site:restart-monitoring-requested

> **internal:site:restart-monitoring-requested**: `object`

Defined in: [electron/events/eventTypes.ts:472](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L472)

Emitted when a request is made to restart monitoring for a site.

#### identifier

> **identifier**: `string`

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### operation

> **operation**: `"restart-monitoring-requested"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The monitor object.

#### Param

The operation type (always
  "restart-monitoring-requested").

#### Param

Unix timestamp (ms) when the request was made.

***

### internal:site:restart-monitoring-response

> **internal:site:restart-monitoring-response**: `object`

Defined in: [electron/events/eventTypes.ts:489](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L489)

Emitted in response to a restart monitoring request.

#### identifier

> **identifier**: `string`

#### monitorId

> **monitorId**: `string`

#### operation

> **operation**: `"restart-monitoring-response"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The monitor ID.

#### Param

The operation type (always
  "restart-monitoring-response").

#### Param

Whether the restart was successful.

#### Param

Unix timestamp (ms) when the response was sent.

***

### internal:site:start-monitoring-requested

> **internal:site:start-monitoring-requested**: `object`

Defined in: [electron/events/eventTypes.ts:506](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L506)

Emitted when a request is made to start monitoring for a site.

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"start-monitoring-requested"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

Optional monitor ID.

#### Param

The operation type (always
  "start-monitoring-requested").

#### Param

Unix timestamp (ms) when the request was made.

***

### internal:site:stop-monitoring-requested

> **internal:site:stop-monitoring-requested**: `object`

Defined in: [electron/events/eventTypes.ts:522](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L522)

Emitted when a request is made to stop monitoring for a site.

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"stop-monitoring-requested"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

Optional monitor ID.

#### Param

The operation type (always
  "stop-monitoring-requested").

#### Param

Unix timestamp (ms) when the request was made.

***

### internal:site:updated

> **internal:site:updated**: `object`

Defined in: [electron/events/eventTypes.ts:538](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L538)

Emitted when a site is updated internally.

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"updated"`

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### timestamp

> **timestamp**: `number`

#### updatedFields?

> `optional` **updatedFields**: `string`[]

#### Param

The unique identifier for the site.

#### Param

The operation type (always "updated").

#### Param

The updated site object.

#### Param

Unix timestamp (ms) when the update occurred.

#### Param

Optional list of updated field names.

***

### monitor:added

> **monitor:added**: `object`

Defined in: [electron/events/eventTypes.ts:553](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L553)

Emitted when a monitor is added.

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

The monitor object added.

#### Param

The ID of the site the monitor belongs to.

#### Param

Unix timestamp (ms) when the monitor was added.

***

### monitor:check-completed

> **monitor:check-completed**: `object`

Defined in: [electron/events/eventTypes.ts:568](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L568)

Emitted when a monitor check is completed.

#### checkType

> **checkType**: `"manual"` \| `"scheduled"`

#### monitorId

> **monitorId**: `string`

#### result

> **result**: [`StatusUpdate`](../../../../shared/types/interfaces/StatusUpdate.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

The type of check ("manual" or "scheduled").

#### Param

The monitor ID.

#### Param

The status update result.

#### Param

The ID of the site the monitor belongs to.

#### Param

Unix timestamp (ms) when the check completed.

***

### monitor:down

> **monitor:down**: `object`

Defined in: [electron/events/eventTypes.ts:584](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L584)

Emitted when a monitor goes down.

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

The monitor object.

#### Param

The site object.

#### Param

The ID of the site.

#### Param

Unix timestamp (ms) when the monitor went down.

***

### monitor:removed

> **monitor:removed**: `object`

Defined in: [electron/events/eventTypes.ts:598](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L598)

Emitted when a monitor is removed.

#### monitorId

> **monitorId**: `string`

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

The monitor ID.

#### Param

The ID of the site the monitor belonged to.

#### Param

Unix timestamp (ms) when the monitor was removed.

***

### monitor:status-changed

> **monitor:status-changed**: `object`

Defined in: [electron/events/eventTypes.ts:615](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L615)

Emitted when a monitor's status changes.

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### newStatus

> **newStatus**: `string`

#### previousStatus

> **previousStatus**: `string`

#### responseTime?

> `optional` **responseTime**: `number`

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

The monitor object.

#### Param

The new status string.

#### Param

The previous status string.

#### Param

Optional response time in ms.

#### Param

The site object.

#### Param

The ID of the site.

#### Param

Unix timestamp (ms) when the status changed.

***

### monitor:up

> **monitor:up**: `object`

Defined in: [electron/events/eventTypes.ts:633](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L633)

Emitted when a monitor goes up.

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

The monitor object.

#### Param

The site object.

#### Param

The ID of the site.

#### Param

Unix timestamp (ms) when the monitor went up.

***

### monitoring:started

> **monitoring:started**: `object`

Defined in: [electron/events/eventTypes.ts:647](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L647)

Emitted when monitoring is started.

#### monitorCount

> **monitorCount**: `number`

#### siteCount

> **siteCount**: `number`

#### timestamp

> **timestamp**: `number`

#### Param

The number of monitors started.

#### Param

The number of sites involved.

#### Param

Unix timestamp (ms) when monitoring started.

***

### monitoring:stopped

> **monitoring:stopped**: `object`

Defined in: [electron/events/eventTypes.ts:660](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L660)

Emitted when monitoring is stopped.

#### activeMonitors

> **activeMonitors**: `number`

#### reason

> **reason**: `"error"` \| `"shutdown"` \| `"user"`

#### timestamp

> **timestamp**: `number`

#### Param

The number of monitors that were active.

#### Param

The reason for stopping.

#### Param

Unix timestamp (ms) when monitoring stopped.

***

### performance:metric

> **performance:metric**: `object`

Defined in: [electron/events/eventTypes.ts:676](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L676)

Emitted when a performance metric is recorded.

#### category

> **category**: `"monitoring"` \| `"database"` \| `"system"` \| `"ui"`

#### metric

> **metric**: `string`

#### timestamp

> **timestamp**: `number`

#### unit

> **unit**: `string`

#### value

> **value**: `number`

#### Param

The metric category ("database", "monitoring",
  "system", or "ui").

#### Param

The metric name.

#### Param

Unix timestamp (ms) when the metric was recorded.

#### Param

The unit of the metric.

#### Param

The value of the metric.

***

### performance:warning

> **performance:warning**: `object`

Defined in: [electron/events/eventTypes.ts:693](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L693)

Emitted when a performance warning is triggered.

#### actual

> **actual**: `number`

#### metric

> **metric**: `string`

#### suggestion?

> `optional` **suggestion**: `string`

#### threshold

> **threshold**: `number`

#### timestamp

> **timestamp**: `number`

#### Param

The actual value that triggered the warning.

#### Param

The metric name.

#### Param

Optional suggestion for remediation.

#### Param

The threshold value for the warning.

#### Param

Unix timestamp (ms) when the warning was triggered.

***

### site:added

> **site:added**: `object`

Defined in: [electron/events/eventTypes.ts:709](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L709)

Emitted when a site is added.

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### source

> **source**: `"user"` \| `"migration"` \| `"import"`

#### timestamp

> **timestamp**: `number`

#### Param

The site object added.

#### Param

The source of the addition ("import", "migration", or
  "user").

#### Param

Unix timestamp (ms) when the site was added.

***

### site:cache-miss

> **site:cache-miss**: `object`

Defined in: [electron/events/eventTypes.ts:723](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L723)

Emitted when a site cache miss occurs.

#### backgroundLoading

> **backgroundLoading**: `boolean`

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"cache-lookup"`

#### timestamp

> **timestamp**: `number`

#### Param

Whether background loading is in progress.

#### Param

The unique identifier for the site.

#### Param

The operation type (always "cache-lookup").

#### Param

Unix timestamp (ms) when the cache miss occurred.

***

### site:cache-updated

> **site:cache-updated**: `object`

Defined in: [electron/events/eventTypes.ts:738](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L738)

Emitted when a site's cache is updated.

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"cache-updated"` \| `"background-load"` \| `"manual-refresh"`

#### timestamp

> **timestamp**: `number`

#### Param

The unique identifier for the site.

#### Param

The operation type ("background-load",
  "cache-updated", or "manual-refresh").

#### Param

Unix timestamp (ms) when the cache was updated.

***

### site:removed

> **site:removed**: `object`

Defined in: [electron/events/eventTypes.ts:752](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L752)

Emitted when a site is removed.

#### cascade

> **cascade**: `boolean`

#### siteId

> **siteId**: `string`

#### siteName

> **siteName**: `string`

#### timestamp

> **timestamp**: `number`

#### Param

Whether the removal was cascaded.

#### Param

The ID of the site removed.

#### Param

The name of the site removed.

#### Param

Unix timestamp (ms) when the site was removed.

***

### site:updated

> **site:updated**: `object`

Defined in: [electron/events/eventTypes.ts:767](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L767)

Emitted when a site is updated.

#### previousSite

> **previousSite**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### timestamp

> **timestamp**: `number`

#### updatedFields

> **updatedFields**: `string`[]

#### Param

The previous site object.

#### Param

The updated site object.

#### Param

Unix timestamp (ms) when the update occurred.

#### Param

List of updated field names.

***

### sites:state-synchronized

> **sites:state-synchronized**: `object`

Defined in: [electron/events/eventTypes.ts:784](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L784)

Emitted when site state is synchronized.

#### action

> **action**: `"delete"` \| `"update"` \| `"bulk-sync"`

#### siteIdentifier?

> `optional` **siteIdentifier**: `string`

#### source?

> `optional` **source**: `"cache"` \| `"database"` \| `"frontend"`

#### timestamp

> **timestamp**: `number`

#### Param

The synchronization action ("bulk-sync", "delete", or
  "update").

#### Param

Optional site identifier.

#### Param

Optional source of the synchronization ("cache",
  "database", or "frontend").

#### Param

Unix timestamp (ms) when synchronization occurred.

***

### system:error

> **system:error**: `object`

Defined in: [electron/events/eventTypes.ts:801](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L801)

Emitted when a system error occurs.

#### context

> **context**: `string`

#### error

> **error**: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### recovery?

> `optional` **recovery**: `string`

#### severity

> **severity**: `"medium"` \| `"critical"` \| `"high"` \| `"low"`

#### timestamp

> **timestamp**: `number`

#### Param

The error context string.

#### Param

The error object.

#### Param

Optional recovery suggestion.

#### Param

The severity of the error ("critical", "high", "low",
  or "medium").

#### Param

Unix timestamp (ms) when the error occurred.

***

### system:shutdown

> **system:shutdown**: `object`

Defined in: [electron/events/eventTypes.ts:816](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L816)

Emitted when the system is shutting down.

#### reason

> **reason**: `"update"` \| `"error"` \| `"user"`

#### timestamp

> **timestamp**: `number`

#### uptime

> **uptime**: `number`

#### Param

The reason for shutdown ("error", "update", or "user").

#### Param

Unix timestamp (ms) when shutdown started.

#### Param

The system uptime in ms.

***

### system:startup

> **system:startup**: `object`

Defined in: [electron/events/eventTypes.ts:830](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L830)

Emitted when the system starts up.

#### environment

> **environment**: `"development"` \| `"production"` \| `"test"`

#### timestamp

> **timestamp**: `number`

#### version

> **version**: `string`

#### Param

The runtime environment ("development",
  "production", or "test").

#### Param

Unix timestamp (ms) when startup completed.

#### Param

The application version string.
