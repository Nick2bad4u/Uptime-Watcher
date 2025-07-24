# Type Alias: UpdateStatus

> **UpdateStatus** = `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"error"` \| `"idle"`

Defined in: [src/stores/types.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L116)

Application update status enumeration.

## Remarks

Represents the various states of the application update process,
from initial idle state through checking, downloading, and completion.
Used by the updates store to track update progress and display
appropriate UI states to the user.
