# Interface: HttpMonitorFields

Defined in: [src/types/monitor-forms.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L25)

HTTP monitor specific fields

## Extends

- [`BaseMonitorFields`](BaseMonitorFields.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitor-forms.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L13)

Check interval in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`checkInterval`](BaseMonitorFields.md#checkinterval)

***

### expectedStatusCode?

> `optional` **expectedStatusCode**: `number`

Defined in: [src/types/monitor-forms.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L27)

Expected status code

***

### followRedirects?

> `optional` **followRedirects**: `boolean`

Defined in: [src/types/monitor-forms.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L29)

Follow redirects

***

### headers?

> `optional` **headers**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [src/types/monitor-forms.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L31)

Request headers

***

### method?

> `optional` **method**: `"DELETE"` \| `"GET"` \| `"HEAD"` \| `"POST"` \| `"PUT"`

Defined in: [src/types/monitor-forms.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L33)

HTTP method

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/monitor-forms.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L15)

Monitor name

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`name`](BaseMonitorFields.md#name)

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitor-forms.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L17)

Number of retry attempts

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`retryAttempts`](BaseMonitorFields.md#retryattempts)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitor-forms.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L19)

Timeout in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`timeout`](BaseMonitorFields.md#timeout)

***

### url

> **url**: `string`

Defined in: [src/types/monitor-forms.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L35)

URL to monitor
