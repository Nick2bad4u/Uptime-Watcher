# Function: setupTimingInterceptors()

> **setupTimingInterceptors**(`axiosInstance`): `void`

Defined in: [electron/services/monitoring/utils/httpClient.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/httpClient.ts#L87)

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
