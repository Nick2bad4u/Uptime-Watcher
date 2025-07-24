# Variable: EVENT\_CATEGORIES

> `const` **EVENT\_CATEGORIES**: `object`

Defined in: [electron/events/eventTypes.ts:459](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L459)

Event categories for filtering and middleware processing.

## Type declaration

### CACHE

> `readonly` **CACHE**: readonly \[`"cache:invalidated"`, `"site:cache-miss"`, `"site:cache-updated"`\]

### CONFIG

> `readonly` **CONFIG**: readonly \[`"config:changed"`\]

### DATABASE

> `readonly` **DATABASE**: readonly \[`"database:backup-created"`, `"database:error"`, `"database:retry"`, `"database:success"`, `"database:transaction-completed"`\]

### INTERNAL\_DATABASE

> `readonly` **INTERNAL\_DATABASE**: readonly \[`"internal:database:backup-downloaded"`, `"internal:database:data-exported"`, `"internal:database:data-imported"`, `"internal:database:get-sites-from-cache-requested"`, `"internal:database:get-sites-from-cache-response"`, `"internal:database:history-limit-updated"`, `"internal:database:initialized"`, `"internal:database:sites-refreshed"`, `"internal:database:update-sites-cache-requested"`\]

### INTERNAL\_MONITOR

> `readonly` **INTERNAL\_MONITOR**: readonly \[`"internal:monitor:all-started"`, `"internal:monitor:all-stopped"`, `"internal:monitor:manual-check-completed"`, `"internal:monitor:site-setup-completed"`, `"internal:monitor:started"`, `"internal:monitor:stopped"`\]

### INTERNAL\_SITE

> `readonly` **INTERNAL\_SITE**: readonly \[`"internal:site:added"`, `"internal:site:cache-updated"`, `"internal:site:is-monitoring-active-requested"`, `"internal:site:is-monitoring-active-response"`, `"internal:site:removed"`, `"internal:site:restart-monitoring-requested"`, `"internal:site:restart-monitoring-response"`, `"internal:site:start-monitoring-requested"`, `"internal:site:stop-monitoring-requested"`, `"internal:site:updated"`\]

### MONITOR

> `readonly` **MONITOR**: readonly \[`"monitor:added"`, `"monitor:check-completed"`, `"monitor:removed"`, `"monitor:status-changed"`, `"monitor:up"`, `"monitor:down"`\]

### MONITORING

> `readonly` **MONITORING**: readonly \[`"monitoring:started"`, `"monitoring:stopped"`\]

### PERFORMANCE

> `readonly` **PERFORMANCE**: readonly \[`"performance:metric"`, `"performance:warning"`\]

### SITE

> `readonly` **SITE**: readonly \[`"site:added"`, `"site:removed"`, `"site:updated"`, `"sites:state-synchronized"`\]

### SYSTEM

> `readonly` **SYSTEM**: readonly \[`"system:error"`, `"system:shutdown"`, `"system:startup"`\]

## Remarks

Organizes all events by functional domain for filtering, routing, and middleware processing.
Internal events are intentionally separated for manager-to-manager communication.
