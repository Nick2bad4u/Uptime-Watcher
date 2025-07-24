# Function: createMetricsMiddleware()

> **createMetricsMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:343](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/middleware.ts#L343)

Metrics middleware that tracks event counts and timing.

## Parameters

### options

Configuration options for metrics collection

#### metricsCallback?

(`metric`) => `void`

#### trackCounts?

`boolean`

#### trackTiming?

`boolean`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that collects event metrics

## Remarks

Options include:
- `trackCounts`: Whether to track event occurrence counts (default: true)
- `trackTiming`: Whether to track event processing duration (default: true)
- `metricsCallback`: Optional callback to receive metric data for external systems

## Example

```typescript
const metricsMiddleware = createMetricsMiddleware({
  trackCounts: true,
  trackTiming: true,
  metricsCallback: (metric) => {
    console.log(`Metric: ${metric.name} = ${metric.value}`);
  }
});
eventBus.use(metricsMiddleware);
```
