# Interface: HttpMonitorConfig

Defined in: [shared/types/monitorConfig.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L115)

Configuration interface for HTTP monitors.

## Remarks

Used for monitors that check HTTP/HTTPS endpoints.

## Extends

- [`BaseMonitorConfig`](BaseMonitorConfig.md)

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [shared/types/monitorConfig.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L92)

Interval between checks in milliseconds

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`checkInterval`](BaseMonitorConfig.md#checkinterval)

***

### enabled

> **enabled**: `boolean`

Defined in: [shared/types/monitorConfig.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L94)

Whether the monitor is enabled

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`enabled`](BaseMonitorConfig.md#enabled)

***

### id

> **id**: `string`

Defined in: [shared/types/monitorConfig.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L96)

Unique identifier for the monitor

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`id`](BaseMonitorConfig.md#id)

***

### name

> **name**: `string`

Defined in: [shared/types/monitorConfig.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L98)

Human-readable name for the monitor

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`name`](BaseMonitorConfig.md#name)

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types/monitorConfig.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L100)

Number of retry attempts when a check fails

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`retryAttempts`](BaseMonitorConfig.md#retryattempts)

***

### timeout

> **timeout**: `number`

Defined in: [shared/types/monitorConfig.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L102)

Timeout for the monitor check in milliseconds

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`timeout`](BaseMonitorConfig.md#timeout)

***

### auth?

> `optional` **auth**: `object`

Defined in: [shared/types/monitorConfig.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L117)

Authentication configuration

#### password

> **password**: `string`

#### type

> **type**: `"basic"` \| `"bearer"`

#### username

> **username**: `string`

***

### certificate?

> `optional` **certificate**: `object`

Defined in: [shared/types/monitorConfig.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L123)

Custom certificate configuration

#### caPath?

> `optional` **caPath**: `string`

Path to custom CA certificate

#### certPath?

> `optional` **certPath**: `string`

Path to client certificate

#### ignoreSslErrors

> **ignoreSslErrors**: `boolean`

Whether to ignore SSL certificate errors

#### keyPath?

> `optional` **keyPath**: `string`

Path to client private key

***

### expectedContent?

> `optional` **expectedContent**: `object`

Defined in: [shared/types/monitorConfig.ts:134](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L134)

Expected response body content patterns

#### contains?

> `optional` **contains**: `string`[]

Content that must be present in the response

#### notContains?

> `optional` **notContains**: `string`[]

Content that must not be present in the response

#### patterns?

> `optional` **patterns**: `string`[]

Regular expression patterns to match

***

### expectedStatusCodes

> **expectedStatusCodes**: `number`[]

Defined in: [shared/types/monitorConfig.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L143)

Expected HTTP status codes

***

### followRedirects

> **followRedirects**: `boolean`

Defined in: [shared/types/monitorConfig.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L145)

Whether to follow HTTP redirects

***

### headers?

> `optional` **headers**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [shared/types/monitorConfig.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L147)

Custom headers to send with the request

***

### method

> **method**: `"DELETE"` \| `"GET"` \| `"HEAD"` \| `"POST"` \| `"PUT"`

Defined in: [shared/types/monitorConfig.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L149)

HTTP method to use

***

### requestBody?

> `optional` **requestBody**: `object`

Defined in: [shared/types/monitorConfig.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L151)

Request body for POST/PUT requests

#### contentType

> **contentType**: `string`

Content type of the request body

#### data

> **data**: `string`

The actual request body data

***

### type

> **type**: `"http"`

Defined in: [shared/types/monitorConfig.ts:157](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L157)

The type of monitor

#### Overrides

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`type`](BaseMonitorConfig.md#type)

***

### url

> **url**: `string`

Defined in: [shared/types/monitorConfig.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L159)

The URL to monitor

***

### userAgent?

> `optional` **userAgent**: `string`

Defined in: [shared/types/monitorConfig.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L161)

User agent string to use
