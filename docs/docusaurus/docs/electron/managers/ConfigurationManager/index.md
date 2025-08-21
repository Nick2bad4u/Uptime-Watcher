# electron/managers/ConfigurationManager

Configuration manager for business rules and policies with standardized
caching across the Electron backend.

## Remarks

Centralizes business logic for configuration decisions and caches validation
results. Provides consistent configuration management across the application
with built-in validation, caching, and business rule enforcement.

Key responsibilities:

- Business rule enforcement for sites and monitors
- Configuration validation with caching for performance
- Default value management for application settings
- Cache coordination for configuration data
- Validation result caching to avoid repeated computations
- Type-safe configuration value handling
- Development vs production configuration differences

## Examples

```typescript
const configManager = new ConfigurationManager();

// Validate site configuration
const validation = await configManager.validateSiteConfig(siteData);
if (!validation.isValid) {
    console.error("Site validation failed:", validation.errors);
}

// Get default values
const defaultInterval = configManager.getDefaultCheckInterval();
const historyLimit = configManager.getDefaultHistoryLimit();
```

```typescript
// First call performs validation
const result1 = await configManager.validateMonitorConfig(config);

// Second call uses cached result (if within TTL)
const result2 = await configManager.validateMonitorConfig(config);
```

## Classes

- [ConfigurationManager](classes/ConfigurationManager.md)

## Interfaces

- [HistoryRetentionConfig](interfaces/HistoryRetentionConfig.md)
