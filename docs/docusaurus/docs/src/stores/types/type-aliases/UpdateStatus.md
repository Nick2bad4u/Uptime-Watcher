# Type Alias: UpdateStatus

> **UpdateStatus** = `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"error"` \| `"idle"`

Defined in: [src/stores/types.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L127)

Application update status enumeration.

## Remarks

Represents the various states of the application update process, from initial
idle state through checking, downloading, and completion. Used by the updates
store to track update progress and display appropriate UI states to the
user.
