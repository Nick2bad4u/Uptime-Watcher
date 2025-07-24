# Function: createHttpClient()

> **createHttpClient**(`config`): `AxiosInstance`

Defined in: [electron/services/monitoring/utils/httpClient.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/httpClient.ts#L31)

Create a configured Axios instance optimized for HTTP monitoring.

## Parameters

### config

[`MonitorConfig`](../../../types/interfaces/MonitorConfig.md)

Monitor configuration containing timeout, userAgent, etc.

## Returns

`AxiosInstance`

Configured Axios instance with timing interceptors and connection pooling

## Remarks

Sets up connection pooling, custom status validation, and timing measurement.
All HTTP responses are treated as "successful" for manual status code handling
in monitoring logic. This allows proper evaluation of HTTP error codes as
legitimate monitoring results rather than Axios errors.

The 10KB request limit is suitable for monitoring scenarios which typically
send minimal data (headers, basic payloads). Response limit is 10MB to handle
larger pages if needed.

## See

 - [MonitorConfig](../../../types/interfaces/MonitorConfig.md) for available configuration options
 - [setupTimingInterceptors](setupTimingInterceptors.md) for timing measurement details
