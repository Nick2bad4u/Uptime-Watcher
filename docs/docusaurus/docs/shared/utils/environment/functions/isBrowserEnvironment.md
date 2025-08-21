# Function: isBrowserEnvironment()

> **isBrowserEnvironment**(): `boolean`

Defined in: [shared/utils/environment.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/environment.ts#L101)

Check if running in browser environment.

## Returns

`boolean`

True if in browser environment

## Remarks

Detects browser environment by checking for `window` and `document` objects.
This covers most browser contexts but may not detect some browser-like
environments such as web workers, service workers, or server-side rendering
contexts. For more specific environment detection, use additional checks
tailored to your use case.
