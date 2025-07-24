# Function: setupTimingInterceptors()

> **setupTimingInterceptors**(`axiosInstance`): `void`

Defined in: [electron/services/monitoring/utils/httpClient.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/utils/httpClient.ts#L87)

Set up request and response interceptors for precise timing measurement.

## Parameters

### axiosInstance

`AxiosInstance`

Axios instance to configure with timing interceptors

## Returns

`void`

## Remarks

Uses performance.now() for high-precision timing measurement. Adds metadata
to request config and calculates duration in response interceptor.
Also handles timing for error responses to ensure consistent measurement.

The timing data is attached to response/error objects via declaration merging
defined in HttpMonitor.ts for type safety.
