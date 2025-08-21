# Interface: HttpFormData

Defined in: [shared/types/formData.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L108)

Form data interface for HTTP monitors.

## Remarks

Used for monitors that check HTTP/HTTPS endpoints.

## Extends

- [`BaseFormData`](BaseFormData.md)

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [shared/types/formData.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L46)

Interval between checks in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`checkInterval`](BaseFormData.md#checkinterval)

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [shared/types/formData.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L48)

Whether the monitor is enabled

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`enabled`](BaseFormData.md#enabled)

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types/formData.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L50)

Number of retry attempts when a check fails

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`retryAttempts`](BaseFormData.md#retryattempts)

***

### timeout

> **timeout**: `number`

Defined in: [shared/types/formData.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L52)

Timeout for the monitor check in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`timeout`](BaseFormData.md#timeout)

***

### auth?

> `optional` **auth**: `object`

Defined in: [shared/types/formData.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L110)

Authentication credentials

#### password

> **password**: `string`

#### username

> **username**: `string`

***

### expectedContent?

> `optional` **expectedContent**: `string`

Defined in: [shared/types/formData.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L115)

Expected response body content (for validation)

***

### expectedStatusCode?

> `optional` **expectedStatusCode**: `number`

Defined in: [shared/types/formData.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L117)

Expected HTTP status code (default: 200)

***

### followRedirects?

> `optional` **followRedirects**: `boolean`

Defined in: [shared/types/formData.ts:119](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L119)

Whether to follow redirects

***

### headers?

> `optional` **headers**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [shared/types/formData.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L121)

Custom headers to send with the request

***

### method?

> `optional` **method**: `"DELETE"` \| `"GET"` \| `"HEAD"` \| `"POST"` \| `"PUT"`

Defined in: [shared/types/formData.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L123)

HTTP method to use for the request

***

### type

> **type**: `"http"`

Defined in: [shared/types/formData.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L124)

The type of monitor (http, port, ping)

#### Overrides

[`BaseFormData`](BaseFormData.md).[`type`](BaseFormData.md#type)

***

### url

> **url**: `string`

Defined in: [shared/types/formData.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L126)

The URL to monitor
