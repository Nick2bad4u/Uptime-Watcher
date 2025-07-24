# Interface: MonitorConfig

Defined in: [electron/services/monitoring/types.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/types.ts#L150)

Configuration for monitor check behavior.

## Remarks

Global configuration that applies to all monitors of a given type,
unless overridden by individual monitor settings.

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: [electron/services/monitoring/types.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/types.ts#L160)

Request timeout in milliseconds.

#### Default Value

```ts
10000 (10 seconds)
```

#### Remarks

Maximum time to wait for a response before considering the check failed.
Individual monitors can override this with their own timeout settings.

***

### userAgent?

> `optional` **userAgent**: `string`

Defined in: [electron/services/monitoring/types.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/types.ts#L171)

User agent string for HTTP requests.

#### Default Value

```ts
"Uptime-Watcher/1.0"
```

#### Remarks

Identifies the monitoring application in HTTP request headers.
Some servers may use this for logging or access control.
