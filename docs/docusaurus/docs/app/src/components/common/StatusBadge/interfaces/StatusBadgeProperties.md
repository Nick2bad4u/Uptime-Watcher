# Interface: StatusBadgeProperties

Defined in: [src/components/common/StatusBadge.tsx:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L17)

Props for the StatusBadge component

## Properties

### className?

> `optional` **className**: `string`

Defined in: [src/components/common/StatusBadge.tsx:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L19)

Additional CSS classes

***

### formatter()?

> `optional` **formatter**: (`label`, `status`) => `string`

Defined in: [src/components/common/StatusBadge.tsx:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L21)

Optional custom formatter for label and status display

#### Parameters

##### label

`string`

##### status

[`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

#### Returns

`string`

***

### label

> **label**: `string`

Defined in: [src/components/common/StatusBadge.tsx:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L26)

Label text to display (expected to be localized by caller)

#### Example

```ts
"Status", "Current State", "Monitor Status"
```

***

### showIcon?

> `optional` **showIcon**: `boolean`

Defined in: [src/components/common/StatusBadge.tsx:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L28)

Whether to show the status icon

***

### size?

> `optional` **size**: `"base"` \| `"2xl"` \| `"3xl"` \| `"4xl"` \| `"lg"` \| `"sm"` \| `"xl"` \| `"xs"`

Defined in: [src/components/common/StatusBadge.tsx:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L30)

Text size (affects both text and icon sizing)

***

### status

> **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [src/components/common/StatusBadge.tsx:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L32)

Current status to display
