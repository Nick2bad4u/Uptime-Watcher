# Interface: BaseMonitorFields

Defined in: [src/types/monitor-forms.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L11)

Base monitor fields common to all monitor types

## Extended by

- [`HttpMonitorFields`](HttpMonitorFields.md)
- [`PortMonitorFields`](PortMonitorFields.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitor-forms.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L13)

Check interval in milliseconds

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/monitor-forms.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L15)

Monitor name

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitor-forms.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L17)

Number of retry attempts

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitor-forms.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L19)

Timeout in milliseconds
