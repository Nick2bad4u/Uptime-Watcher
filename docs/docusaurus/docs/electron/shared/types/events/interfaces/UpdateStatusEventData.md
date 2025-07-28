# Interface: UpdateStatusEventData

Defined in: [shared/types/events.ts:217](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L217)

Payload for update status change events.

## Remarks

Used to communicate the current status of application updates, including errors.
- `error`: Error message if status is 'error'.
- `status`: The current update status.

## Example

// Example: Update downloaded
```typescript
const event: UpdateStatusEventData = {
  status: 'downloaded'
};
```

## Properties

### error?

> `optional` **error**: `string`

Defined in: [shared/types/events.ts:221](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L221)

Error message if status is 'error'.

***

### status

> **status**: `"error"` \| `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"idle"`

Defined in: [shared/types/events.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L226)

The current update status.

#### Remarks

Can be 'available', 'checking', 'downloaded', 'downloading', 'error', or 'idle'.
