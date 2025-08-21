# Variable: CacheKeys

> `const` **CacheKeys**: `object`

Defined in: [shared/utils/cacheKeys.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/cacheKeys.ts#L87)

Centralized cache key generation utilities.

## Type declaration

### config

> `readonly` **config**: `object`

Configuration-related cache keys.

#### config.byName()

> `readonly` **byName**: (`name`) => `string`

Generate cache key for configuration value by name.

##### Parameters

###### name

`string`

Configuration name or setting identifier

##### Returns

`string`

Standardized cache key for configuration values

##### Example

```typescript
const key = CacheKeys.config.byName("history-limit");
// Returns: "config:history-limit"
```

#### config.validation()

> `readonly` **validation**: (`name`) => `string`

Generate cache key for configuration validation result.

##### Parameters

###### name

`string`

Configuration name being validated

##### Returns

`string`

Standardized cache key for configuration validation

##### Example

```typescript
const key = CacheKeys.config.validation("monitor-config");
// Returns: "config:validation:monitor-config"
```

### monitor

> `readonly` **monitor**: `object`

Monitor-related cache keys.

#### monitor.byId()

> `readonly` **byId**: (`id`) => `string`

Generate cache key for monitor by ID.

##### Parameters

###### id

`string`

Monitor identifier

##### Returns

`string`

Standardized cache key for monitor data

##### Example

```typescript
const key = CacheKeys.monitor.byId("monitor-123");
// Returns: "monitor:monitor-123"
```

#### monitor.bySite()

> `readonly` **bySite**: (`siteIdentifier`) => `string`

Generate cache key for monitors by site identifier.

##### Parameters

###### siteIdentifier

`string`

Site identifier containing the monitors

##### Returns

`string`

Standardized cache key for site monitors

##### Example

```typescript
const key = CacheKeys.monitor.bySite("site-456");
// Returns: "monitor:site:site-456"
```

#### monitor.operation()

> `readonly` **operation**: (`id`) => `string`

Generate cache key for monitor operation status.

##### Parameters

###### id

`string`

Monitor identifier

##### Returns

`string`

Standardized cache key for monitor operation tracking

##### Example

```typescript
const key = CacheKeys.monitor.operation("monitor-123");
// Returns: "monitor:operation:monitor-123"
```

### site

> `readonly` **site**: `object`

Site-related cache keys.

#### site.bulkOperation()

> `readonly` **bulkOperation**: () => `string`

Generate cache key for bulk site operations.

##### Returns

`string`

Standardized cache key for bulk site operations

##### Example

```typescript
const key = CacheKeys.site.bulkOperation();
// Returns: "site:bulk"
```

#### site.byIdentifier()

> `readonly` **byIdentifier**: (`identifier`) => `string`

Generate cache key for site by identifier.

##### Parameters

###### identifier

`string`

Site identifier

##### Returns

`string`

Standardized cache key for site data

##### Example

```typescript
const key = CacheKeys.site.byIdentifier("site-123");
// Returns: "site:site-123"
```

#### site.loading()

> `readonly` **loading**: (`identifier`) => `string`

Generate cache key for site loading operation.

##### Parameters

###### identifier

`string`

Site identifier being loaded

##### Returns

`string`

Standardized cache key for site loading status

##### Example

```typescript
const key = CacheKeys.site.loading("site-123");
// Returns: "site:loading:site-123"
```

### validation

> `readonly` **validation**: `object`

Validation-related cache keys.

#### validation.byType()

> `readonly` **byType**: (`type`, `identifier`) => `string`

Generate cache key for validation result by type and identifier.

##### Parameters

###### type

`string`

Type of validation (e.g., "monitor", "site")

###### identifier

`string`

Item identifier being validated

##### Returns

`string`

Standardized cache key for validation results

##### Example

```typescript
const key = CacheKeys.validation.byType("monitor", "config-123");
// Returns: "validation:monitor:config-123"
```

#### validation.monitorType()

> `readonly` **monitorType**: (`monitorType`) => `string`

Generate cache key for monitor type validation.

##### Parameters

###### monitorType

`string`

Monitor type being validated

##### Returns

`string`

Standardized cache key for monitor type validation

##### Example

```typescript
const key = CacheKeys.validation.monitorType("http");
// Returns: "validation:monitor-type:http"
```

## Remarks

Provides domain-specific key generation functions that ensure consistent
cache key patterns across the entire application. All functions return
properly formatted cache keys following the established conventions.
