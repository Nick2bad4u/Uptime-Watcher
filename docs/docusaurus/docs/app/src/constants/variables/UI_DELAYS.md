# Variable: UI\_DELAYS

> `const` **UI\_DELAYS**: `object`

Defined in: [src/constants.ts:222](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/constants.ts#L222)

UI delays and timing to prevent flashing and improve UX.

## Type declaration

### LOADING\_BUTTON

> `readonly` **LOADING\_BUTTON**: `100` = `100`

Delay before showing loading spinners in milliseconds

### LOADING\_OVERLAY

> `readonly` **LOADING\_OVERLAY**: `100` = `100`

Delay before showing loading overlay in milliseconds

## Remarks

These delays prevent UI flickering for operations that complete quickly
while still providing feedback for longer operations.
