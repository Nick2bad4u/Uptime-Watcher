# Interface: MonitorConfig

Defined in: [electron/services/monitoring/types.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/types.ts#L151)

Configuration for monitor check behavior.

## Remarks

Global configuration that applies to all monitors of a given type,
unless overridden by individual monitor settings.

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: [electron/services/monitoring/types.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/types.ts#L161)

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

Defined in: [electron/services/monitoring/types.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/types.ts#L172)

User agent string for HTTP requests.

#### Default Value

```ts
"Uptime-Watcher/1.0"
```

#### Remarks

Identifies the monitoring application in HTTP request headers.
Some servers may use this for logging or access control.
