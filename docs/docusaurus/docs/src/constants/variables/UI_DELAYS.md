# Variable: UI\_DELAYS

> `const` **UI\_DELAYS**: `object`

Defined in: [src/constants.ts:316](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L316)

UI delays and timing to prevent flashing and improve UX.

## Type declaration

### LOADING\_BUTTON

> `readonly` **LOADING\_BUTTON**: `100` = `100`

Delay before showing loading spinners in milliseconds

### LOADING\_OVERLAY

> `readonly` **LOADING\_OVERLAY**: `100` = `100`

Delay before showing loading overlay in milliseconds

### STATE\_UPDATE\_DEFER

> `readonly` **STATE\_UPDATE\_DEFER**: `0` = `0`

Minimal delay to defer state updates in useEffect cleanup.

#### Remarks

Used to comply with React best practices by avoiding direct setState
calls in useEffect. The 0ms delay defers execution to the next tick of
the event loop.

## Remarks

These delays prevent UI flickering for operations that complete quickly while
still providing feedback for longer operations.
