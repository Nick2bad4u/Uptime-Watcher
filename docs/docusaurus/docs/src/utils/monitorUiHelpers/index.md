# src/utils/monitorUiHelpers

Dynamic UI utilities that use monitor registry for extensible UI behavior.

## Remarks

These utilities eliminate hardcoded monitor type checks throughout the
frontend by providing dynamic configuration-based helpers for UI behavior.

All utilities support caching for optimal performance and include error
handling.

## Example

```typescript
// Check if a monitor type supports response time
const hasResponseTime = await supportsResponseTime("http");

// Get the default monitor ID from a list
const defaultId = getDefaultMonitorId(["monitor-1", "monitor-2"]);
```

## Functions

- [clearConfigCache](functions/clearConfigCache.md)
- [getDefaultMonitorId](functions/getDefaultMonitorId.md)
- [supportsAdvancedAnalytics](functions/supportsAdvancedAnalytics.md)
- [supportsResponseTime](functions/supportsResponseTime.md)
- [allSupportsAdvancedAnalytics](functions/allSupportsAdvancedAnalytics.md)
- [allSupportsResponseTime](functions/allSupportsResponseTime.md)
- [formatMonitorDetail](functions/formatMonitorDetail.md)
- [formatMonitorTitleSuffix](functions/formatMonitorTitleSuffix.md)
- [getAnalyticsLabel](functions/getAnalyticsLabel.md)
- [getMonitorHelpTexts](functions/getMonitorHelpTexts.md)
- [getTypesWithFeature](functions/getTypesWithFeature.md)
- [shouldShowUrl](functions/shouldShowUrl.md)
