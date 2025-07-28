# Function: createHttpClient()

> **createHttpClient**(`config`): `AxiosInstance`

Defined in: [electron/services/monitoring/utils/httpClient.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/httpClient.ts#L37)

Creates a configured Axios instance optimized for HTTP monitoring.

## Parameters

### config

[`MonitorConfig`](../../../types/interfaces/MonitorConfig.md)

The [MonitorConfig](../../../types/interfaces/MonitorConfig.md) containing timeout, userAgent, and other HTTP options.

## Returns

`AxiosInstance`

A configured AxiosInstance with timing interceptors and connection pooling.

## Remarks

Sets up connection pooling, custom status validation, and timing measurement. All HTTP responses are treated as "successful" for manual status code handling in monitoring logic. This allows proper evaluation of HTTP error codes as legitimate monitoring results rather than Axios errors. The 10KB request limit is suitable for monitoring scenarios which typically send minimal data (headers, basic payloads). Response limit is 10MB to handle larger pages if needed.

## Example

```typescript
const client = createHttpClient({ timeout: 5000, userAgent: "UptimeWatcher/1.0" });
const response = await client.get("https://example.com");
```

## See

 - [MonitorConfig](../../../types/interfaces/MonitorConfig.md)
 - [setupTimingInterceptors](setupTimingInterceptors.md)
