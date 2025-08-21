# Function: performSinglePingCheck()

> **performSinglePingCheck**(`host`, `timeout`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/utils/pingRetry.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/pingRetry.ts#L75)

Performs a single ping connectivity check without retry logic.

## Parameters

### host

`string`

Target hostname or IP address to ping.

### timeout

`number`

Maximum time to wait for the ping response in milliseconds.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

A promise that resolves to a [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) with ping
  status and timing.

## Remarks

This function performs a single ping attempt to the specified host using the
node-ping library. It measures response time and returns a structured result.
This function is used internally by [performPingCheckWithRetry](performPingCheckWithRetry.md) and can
also be used directly for single-attempt checks.

Uses only cross-platform ping options: numeric, timeout, and min_reply for
maximum compatibility.

## Throws

Error if the ping operation fails or times out.

## See

[performPingCheckWithRetry](performPingCheckWithRetry.md)
