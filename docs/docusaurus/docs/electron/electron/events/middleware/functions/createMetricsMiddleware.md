# Function: createMetricsMiddleware()

> **createMetricsMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:343](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/middleware.ts#L343)

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
