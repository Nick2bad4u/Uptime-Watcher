# Interface: StatusBadgeProperties

Defined in: [src/components/common/StatusBadge.tsx:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L57)

Props for the StatusBadge component

## Properties

### className?

> `readonly` `optional` **className**: `string`

Defined in: [src/components/common/StatusBadge.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L59)

Additional CSS classes

***

### formatter()?

> `readonly` `optional` **formatter**: (`label`, `status`) => `string`

Defined in: [src/components/common/StatusBadge.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L61)

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

> `readonly` **label**: `string`

Defined in: [src/components/common/StatusBadge.tsx:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L67)

Label text to display (expected to be localized by caller)

#### Example

```ts
Status , "Current State", "Monitor Status"
```

***

### showIcon?

> `readonly` `optional` **showIcon**: `boolean`

Defined in: [src/components/common/StatusBadge.tsx:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L69)

Whether to show the status icon

***

### size?

> `readonly` `optional` **size**: `"base"` \| `"lg"` \| `"sm"` \| `"xl"` \| `"2xl"` \| `"3xl"` \| `"xs"` \| `"4xl"`

Defined in: [src/components/common/StatusBadge.tsx:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L71)

Text size (affects both text and icon sizing)

***

### status

> `readonly` **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [src/components/common/StatusBadge.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L73)

Current status to display
