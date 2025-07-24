# Type Alias: UpdateStatus

> **UpdateStatus** = `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"error"` \| `"idle"`

Defined in: [src/stores/types.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/types.ts#L116)

Application update status enumeration.

## Remarks

Represents the various states of the application update process,
from initial idle state through checking, downloading, and completion.
Used by the updates store to track update progress and display
appropriate UI states to the user.
