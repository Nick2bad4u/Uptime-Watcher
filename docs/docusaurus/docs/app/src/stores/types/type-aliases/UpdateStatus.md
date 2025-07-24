# Type Alias: UpdateStatus

> **UpdateStatus** = `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"error"` \| `"idle"`

Defined in: [src/stores/types.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/types.ts#L116)

Application update status enumeration.

## Remarks

Represents the various states of the application update process,
from initial idle state through checking, downloading, and completion.
Used by the updates store to track update progress and display
appropriate UI states to the user.
