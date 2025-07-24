# Interface: UptimeEvents

Defined in: [electron/events/eventTypes.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L81)

Comprehensive event map for the Uptime Watcher application.

## Remarks

Defines all events that can be emitted throughout the application lifecycle,
organized by functional domains. Each event includes strongly typed data
for compile-time safety and comprehensive metadata for debugging.

Event Categories:
- **Site Events**: Site CRUD operations and lifecycle
- **Monitor Events**: Individual monitor status and operations
- **Database Events**: Data persistence and backup operations
- **System Events**: Application lifecycle and errors
- **Internal Events**: Manager-to-manager communication
- **Performance Events**: Metrics and warnings

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### cache:invalidated

> **cache:invalidated**: `object`

Defined in: [electron/events/eventTypes.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L84)

#### identifier?

> `optional` **identifier**: `string`

#### reason

> **reason**: `"manual"` \| `"delete"` \| `"expiry"` \| `"update"`

#### timestamp

> **timestamp**: `number`

#### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

***

### config:changed

> **config:changed**: `object`

Defined in: [electron/events/eventTypes.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L91)

#### newValue

> **newValue**: `unknown`

#### oldValue

> **oldValue**: `unknown`

#### setting

> **setting**: `string`

#### source

> **source**: `"system"` \| `"user"` \| `"migration"`

#### timestamp

> **timestamp**: `number`

***

### database:backup-created

> **database:backup-created**: `object`

Defined in: [electron/events/eventTypes.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L99)

#### fileName

> **fileName**: `string`

#### size

> **size**: `number`

#### timestamp

> **timestamp**: `number`

#### triggerType

> **triggerType**: `"manual"` \| `"scheduled"` \| `"shutdown"`

***

### database:error

> **database:error**: `object`

Defined in: [electron/events/eventTypes.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L108)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### error

> **error**: `Error`

#### operation

> **operation**: `string`

#### timestamp

> **timestamp**: `number`

***

### database:retry

> **database:retry**: `object`

Defined in: [electron/events/eventTypes.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L116)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### attempt

> **attempt**: `number`

#### operation

> **operation**: `string`

#### timestamp

> **timestamp**: `number`

***

### database:success

> **database:success**: `object`

Defined in: [electron/events/eventTypes.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L123)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### duration?

> `optional` **duration**: `number`

#### operation

> **operation**: `string`

#### timestamp

> **timestamp**: `number`

***

### database:transaction-completed

> **database:transaction-completed**: `object`

Defined in: [electron/events/eventTypes.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L130)

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

***

### internal:database:backup-downloaded

> **internal:database:backup-downloaded**: `object`

Defined in: [electron/events/eventTypes.ts:138](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L138)

#### fileName?

> `optional` **fileName**: `string`

#### operation

> **operation**: `"backup-downloaded"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

***

### internal:database:data-exported

> **internal:database:data-exported**: `object`

Defined in: [electron/events/eventTypes.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L145)

#### fileName?

> `optional` **fileName**: `string`

#### operation

> **operation**: `"data-exported"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

***

### internal:database:data-imported

> **internal:database:data-imported**: `object`

Defined in: [electron/events/eventTypes.ts:154](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L154)

#### operation

> **operation**: `"data-imported"`

#### recordCount?

> `optional` **recordCount**: `number`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

***

### internal:database:get-sites-from-cache-requested

> **internal:database:get-sites-from-cache-requested**: `object`

Defined in: [electron/events/eventTypes.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L161)

#### operation

> **operation**: `"get-sites-from-cache-requested"`

#### timestamp

> **timestamp**: `number`

***

### internal:database:get-sites-from-cache-response

> **internal:database:get-sites-from-cache-response**: `object`

Defined in: [electron/events/eventTypes.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L166)

#### operation

> **operation**: `"get-sites-from-cache-response"`

#### sites

> **sites**: [`Site`](../../../../shared/types/interfaces/Site.md)[]

#### timestamp

> **timestamp**: `number`

***

### internal:database:history-limit-updated

> **internal:database:history-limit-updated**: `object`

Defined in: [electron/events/eventTypes.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L172)

#### limit

> **limit**: `number`

#### operation

> **operation**: `"history-limit-updated"`

#### timestamp

> **timestamp**: `number`

***

### internal:database:initialized

> **internal:database:initialized**: `object`

Defined in: [electron/events/eventTypes.ts:178](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L178)

#### operation

> **operation**: `"initialized"`

#### success

> **success**: `boolean`

#### timestamp

> **timestamp**: `number`

***

### internal:database:sites-refreshed

> **internal:database:sites-refreshed**: `object`

Defined in: [electron/events/eventTypes.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L184)

#### operation

> **operation**: `"sites-refreshed"`

#### siteCount

> **siteCount**: `number`

#### timestamp

> **timestamp**: `number`

***

### internal:database:update-sites-cache-requested

> **internal:database:update-sites-cache-requested**: `object`

Defined in: [electron/events/eventTypes.ts:190](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L190)

#### operation

> **operation**: `"update-sites-cache-requested"`

#### sites?

> `optional` **sites**: [`Site`](../../../../shared/types/interfaces/Site.md)[]

#### timestamp

> **timestamp**: `number`

***

### internal:monitor:all-started

> **internal:monitor:all-started**: `object`

Defined in: [electron/events/eventTypes.ts:198](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L198)

#### monitorCount

> **monitorCount**: `number`

#### operation

> **operation**: `"all-started"`

#### siteCount

> **siteCount**: `number`

#### timestamp

> **timestamp**: `number`

***

### internal:monitor:all-stopped

> **internal:monitor:all-stopped**: `object`

Defined in: [electron/events/eventTypes.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L207)

#### activeMonitors

> **activeMonitors**: `number`

#### operation

> **operation**: `"all-stopped"`

#### reason

> **reason**: [`EventReason`](../type-aliases/EventReason.md)

#### timestamp

> **timestamp**: `number`

***

### internal:monitor:manual-check-completed

> **internal:monitor:manual-check-completed**: `object`

Defined in: [electron/events/eventTypes.ts:214](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L214)

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

***

### internal:monitor:site-setup-completed

> **internal:monitor:site-setup-completed**: `object`

Defined in: [electron/events/eventTypes.ts:222](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L222)

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"site-setup-completed"`

#### timestamp

> **timestamp**: `number`

***

### internal:monitor:started

> **internal:monitor:started**: `object`

Defined in: [electron/events/eventTypes.ts:228](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L228)

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"started"`

#### timestamp

> **timestamp**: `number`

***

### internal:monitor:stopped

> **internal:monitor:stopped**: `object`

Defined in: [electron/events/eventTypes.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L235)

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

***

### internal:site:added

> **internal:site:added**: `object`

Defined in: [electron/events/eventTypes.ts:244](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L244)

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"added"`

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### timestamp

> **timestamp**: `number`

***

### internal:site:cache-updated

> **internal:site:cache-updated**: `object`

Defined in: [electron/events/eventTypes.ts:251](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L251)

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"cache-updated"`

#### timestamp

> **timestamp**: `number`

***

### internal:site:is-monitoring-active-requested

> **internal:site:is-monitoring-active-requested**: `object`

Defined in: [electron/events/eventTypes.ts:257](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L257)

#### identifier

> **identifier**: `string`

#### monitorId

> **monitorId**: `string`

#### operation

> **operation**: `"is-monitoring-active-requested"`

#### timestamp

> **timestamp**: `number`

***

### internal:site:is-monitoring-active-response

> **internal:site:is-monitoring-active-response**: `object`

Defined in: [electron/events/eventTypes.ts:264](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L264)

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

***

### internal:site:removed

> **internal:site:removed**: `object`

Defined in: [electron/events/eventTypes.ts:272](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L272)

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"removed"`

#### timestamp

> **timestamp**: `number`

***

### internal:site:restart-monitoring-requested

> **internal:site:restart-monitoring-requested**: `object`

Defined in: [electron/events/eventTypes.ts:278](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L278)

#### identifier

> **identifier**: `string`

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### operation

> **operation**: `"restart-monitoring-requested"`

#### timestamp

> **timestamp**: `number`

***

### internal:site:restart-monitoring-response

> **internal:site:restart-monitoring-response**: `object`

Defined in: [electron/events/eventTypes.ts:285](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L285)

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

***

### internal:site:start-monitoring-requested

> **internal:site:start-monitoring-requested**: `object`

Defined in: [electron/events/eventTypes.ts:293](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L293)

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"start-monitoring-requested"`

#### timestamp

> **timestamp**: `number`

***

### internal:site:stop-monitoring-requested

> **internal:site:stop-monitoring-requested**: `object`

Defined in: [electron/events/eventTypes.ts:300](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L300)

#### identifier

> **identifier**: `string`

#### monitorId?

> `optional` **monitorId**: `string`

#### operation

> **operation**: `"stop-monitoring-requested"`

#### timestamp

> **timestamp**: `number`

***

### internal:site:updated

> **internal:site:updated**: `object`

Defined in: [electron/events/eventTypes.ts:307](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L307)

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

***

### monitor:added

> **monitor:added**: `object`

Defined in: [electron/events/eventTypes.ts:315](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L315)

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

***

### monitor:check-completed

> **monitor:check-completed**: `object`

Defined in: [electron/events/eventTypes.ts:321](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L321)

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

***

### monitor:down

> **monitor:down**: `object`

Defined in: [electron/events/eventTypes.ts:329](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L329)

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

***

### monitor:removed

> **monitor:removed**: `object`

Defined in: [electron/events/eventTypes.ts:336](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L336)

#### monitorId

> **monitorId**: `string`

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

***

### monitor:status-changed

> **monitor:status-changed**: `object`

Defined in: [electron/events/eventTypes.ts:342](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L342)

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

***

### monitor:up

> **monitor:up**: `object`

Defined in: [electron/events/eventTypes.ts:352](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L352)

#### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### siteId

> **siteId**: `string`

#### timestamp

> **timestamp**: `number`

***

### monitoring:started

> **monitoring:started**: `object`

Defined in: [electron/events/eventTypes.ts:360](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L360)

#### monitorCount

> **monitorCount**: `number`

#### siteCount

> **siteCount**: `number`

#### timestamp

> **timestamp**: `number`

***

### monitoring:stopped

> **monitoring:stopped**: `object`

Defined in: [electron/events/eventTypes.ts:366](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L366)

#### activeMonitors

> **activeMonitors**: `number`

#### reason

> **reason**: `"error"` \| `"shutdown"` \| `"user"`

#### timestamp

> **timestamp**: `number`

***

### performance:metric

> **performance:metric**: `object`

Defined in: [electron/events/eventTypes.ts:372](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L372)

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

***

### performance:warning

> **performance:warning**: `object`

Defined in: [electron/events/eventTypes.ts:380](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L380)

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

***

### site:added

> **site:added**: `object`

Defined in: [electron/events/eventTypes.ts:388](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L388)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### source

> **source**: `"user"` \| `"import"` \| `"migration"`

#### timestamp

> **timestamp**: `number`

***

### site:cache-miss

> **site:cache-miss**: `object`

Defined in: [electron/events/eventTypes.ts:394](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L394)

#### backgroundLoading

> **backgroundLoading**: `boolean`

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"cache-lookup"`

#### timestamp

> **timestamp**: `number`

***

### site:cache-updated

> **site:cache-updated**: `object`

Defined in: [electron/events/eventTypes.ts:402](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L402)

#### identifier

> **identifier**: `string`

#### operation

> **operation**: `"cache-updated"` \| `"background-load"` \| `"manual-refresh"`

#### timestamp

> **timestamp**: `number`

***

### site:removed

> **site:removed**: `object`

Defined in: [electron/events/eventTypes.ts:408](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L408)

#### cascade

> **cascade**: `boolean`

#### siteId

> **siteId**: `string`

#### siteName

> **siteName**: `string`

#### timestamp

> **timestamp**: `number`

***

### site:updated

> **site:updated**: `object`

Defined in: [electron/events/eventTypes.ts:415](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L415)

#### previousSite

> **previousSite**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

#### timestamp

> **timestamp**: `number`

#### updatedFields

> **updatedFields**: `string`[]

***

### sites:state-synchronized

> **sites:state-synchronized**: `object`

Defined in: [electron/events/eventTypes.ts:423](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L423)

#### action

> **action**: `"delete"` \| `"update"` \| `"bulk-sync"`

#### siteIdentifier?

> `optional` **siteIdentifier**: `string`

#### source?

> `optional` **source**: `"database"` \| `"cache"` \| `"frontend"`

#### timestamp

> **timestamp**: `number`

***

### system:error

> **system:error**: `object`

Defined in: [electron/events/eventTypes.ts:430](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L430)

#### context

> **context**: `string`

#### error

> **error**: `Error`

#### recovery?

> `optional` **recovery**: `string`

#### severity

> **severity**: `"critical"` \| `"high"` \| `"low"` \| `"medium"`

#### timestamp

> **timestamp**: `number`

***

### system:shutdown

> **system:shutdown**: `object`

Defined in: [electron/events/eventTypes.ts:438](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L438)

#### reason

> **reason**: `"error"` \| `"user"` \| `"update"`

#### timestamp

> **timestamp**: `number`

#### uptime

> **uptime**: `number`

***

### system:startup

> **system:startup**: `object`

Defined in: [electron/events/eventTypes.ts:445](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L445)

#### environment

> **environment**: `"development"` \| `"production"` \| `"test"`

#### timestamp

> **timestamp**: `number`

#### version

> **version**: `string`
