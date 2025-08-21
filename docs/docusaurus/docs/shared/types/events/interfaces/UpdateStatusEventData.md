# Interface: UpdateStatusEventData

Defined in: [shared/types/events.ts:322](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L322)

Payload for update status change events.

## Remarks

Used to communicate the current status of application updates, including
errors. - `error`: Error message if status is 'error'.

- `status`: The current update status.

## Example

```typescript
const event: UpdateStatusEventData = {
    status: "downloaded",
};
```

## Properties

### error?

> `optional` **error**: `string`

Defined in: [shared/types/events.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L326)

Error message if status is 'error'.

***

### status

> **status**: `"error"` \| `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"idle"`

Defined in: [shared/types/events.ts:334](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L334)

The current update status.

#### Remarks

Can be 'available', 'checking', 'downloaded', 'downloading', 'error', or
'idle'.
