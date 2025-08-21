# Variable: EnhancedMonitoringServiceFactory

> `const` **EnhancedMonitoringServiceFactory**: `object`

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:276](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L276)

Factory class for creating and configuring complete enhanced monitoring
service bundles.

## Type declaration

### createServices()

> **createServices**(`dependencies`): [`EnhancedMonitoringServices`](../interfaces/EnhancedMonitoringServices.md)

Creates a complete bundle of enhanced monitoring services configured for
immediate use.

#### Parameters

##### dependencies

[`EnhancedMonitoringDependencies`](../interfaces/EnhancedMonitoringDependencies.md)

Complete set of required external dependencies

#### Returns

[`EnhancedMonitoringServices`](../interfaces/EnhancedMonitoringServices.md)

A complete bundle of enhanced monitoring services ready for use

#### Remarks

This method creates and configures all enhanced monitoring services with
proper interdependencies. All services are initialized and ready for use
upon return. The factory handles complex service relationships
internally.

**Service Creation Order:**

1. Operation registry for tracking active operations
2. Status update service for safe concurrent updates
3. Timeout manager for operation lifecycle management
4. Enhanced checker with all dependencies injected

**Dependency Validation:** The factory validates that all required
dependencies are provided and properly configured before creating
services. Invalid or missing dependencies will result in clear error
messages.

#### Examples

```typescript
const dependencies = {
    eventEmitter: typedEventBus,
    getHistoryLimit: () => 100,
    historyRepository: historyRepo,
    monitorRepository: monitorRepo,
    siteRepository: siteRepo,
    sites: sitesCache,
};

const services =
    EnhancedMonitoringServiceFactory.createServices(dependencies);
const result = await services.checker.checkMonitor(site, monitorId);
```

```typescript
const mockDependencies = {
    eventEmitter: createMockEventBus(),
    getHistoryLimit: () => 50,
    historyRepository: createMockHistoryRepo(),
    // ... other mocked dependencies
};

const services =
    EnhancedMonitoringServiceFactory.createServices(
        mockDependencies
    );
// Use services for testing...
```

#### Throws

Throws descriptive errors if required dependencies are missing,
  invalid, or incompatible with the enhanced monitoring system

#### See

 - [EnhancedMonitoringDependencies](../interfaces/EnhancedMonitoringDependencies.md) for dependency requirements
 - [EnhancedMonitoringServices](../interfaces/EnhancedMonitoringServices.md) for provided service bundle

## Remarks

This factory provides a single point of entry for creating all enhanced
monitoring services with proper dependency injection and configuration. It
ensures that all services are created with the correct interdependencies and
are ready for immediate use.

**Factory Benefits:**

- **Centralized Configuration**: Single place to configure all monitoring
  services - **Dependency Management**: Automatic handling of complex service
  dependencies - **Consistency**: Ensures all service instances use
  compatible configurations - **Simplicity**: Reduces boilerplate code for
  service instantiation
- **Testability**: Facilitates easy mocking and testing of service bundles
