# Function: setupTimingInterceptors()

> **setupTimingInterceptors**(`axiosInstance`): `void`

Defined in: [electron/services/monitoring/utils/httpClient.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/httpClient.ts#L95)

Sets up request and response interceptors for precise timing measurement on an Axios instance.

## Parameters

### axiosInstance

`AxiosInstance`

The AxiosInstance to configure with timing interceptors.

## Returns

`void`

## Remarks

Uses `performance.now()` for high-precision timing measurement. Adds metadata to request config and calculates duration in response interceptor. Also handles timing for error responses to ensure consistent measurement. The timing data is attached to response/error objects via declaration merging defined in HttpMonitor.ts for type safety. This function mutates the provided Axios instance.

## Example

```typescript
const client = axios.create();
setupTimingInterceptors(client);
```

## See

[createHttpClient](createHttpClient.md)
