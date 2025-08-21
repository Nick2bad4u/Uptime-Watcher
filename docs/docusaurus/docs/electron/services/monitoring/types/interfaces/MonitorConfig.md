# Interface: MonitorConfig

Defined in: [electron/services/monitoring/types.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L155)

Configuration for monitor check behavior.

## Remarks

Global configuration that applies to all monitors of a given type, unless
overridden by individual monitor settings.

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: [electron/services/monitoring/types.ts:165](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L165)

Request timeout in milliseconds.

#### Remarks

Maximum time to wait for a response before considering the check failed.
Individual monitors can override this with their own timeout settings.

#### Default Value

```ts
10000 (10 seconds)
```

***

### userAgent?

> `optional` **userAgent**: `string`

Defined in: [electron/services/monitoring/types.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L176)

User agent string for HTTP requests.

#### Remarks

Identifies the monitoring application in HTTP request headers. Some
servers may use this for logging or access control.

#### Default Value

```ts
"Uptime-Watcher/1.0"
```
