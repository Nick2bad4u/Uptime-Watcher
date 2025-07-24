# Class: ServiceContainer

Defined in: [electron/services/ServiceContainer.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L83)

Centralized service container for dependency management.

## Methods

### getAutoUpdaterService()

> **getAutoUpdaterService**(): [`AutoUpdaterService`](../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

Defined in: [electron/services/ServiceContainer.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L158)

#### Returns

[`AutoUpdaterService`](../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

***

### getConfigurationManager()

> **getConfigurationManager**(): [`ConfigurationManager`](../../../managers/ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/services/ServiceContainer.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L169)

#### Returns

[`ConfigurationManager`](../../../managers/ConfigurationManager/classes/ConfigurationManager.md)

***

### getDatabaseManager()

> **getDatabaseManager**(): [`DatabaseManager`](../../../managers/DatabaseManager/classes/DatabaseManager.md)

Defined in: [electron/services/ServiceContainer.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L179)

#### Returns

[`DatabaseManager`](../../../managers/DatabaseManager/classes/DatabaseManager.md)

***

### getDatabaseService()

> **getDatabaseService**(): [`DatabaseService`](../../database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/ServiceContainer.ts:203](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L203)

#### Returns

[`DatabaseService`](../../database/DatabaseService/classes/DatabaseService.md)

***

### getHistoryRepository()

> **getHistoryRepository**(): [`HistoryRepository`](../../database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/services/ServiceContainer.ts:209](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L209)

#### Returns

[`HistoryRepository`](../../database/HistoryRepository/classes/HistoryRepository.md)

***

### getInitializationStatus()

> **getInitializationStatus**(): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `boolean`\>

Defined in: [electron/services/ServiceContainer.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L226)

Get initialization status summary for debugging.

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `boolean`\>

Object with service names and their initialization status

***

### getInitializedServices()

> **getInitializedServices**(): `object`[]

Defined in: [electron/services/ServiceContainer.ts:258](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L258)

Get all initialized services for shutdown and debugging.

#### Returns

`object`[]

Array of service name/instance pairs for all initialized services

#### Remarks

Dynamically discovers all initialized services by inspecting private fields.
This approach automatically includes new services without manual updates.

Only includes services that are actually initialized (not undefined).
Useful for shutdown procedures, health checks, and debugging.

***

### getIpcService()

> **getIpcService**(): [`IpcService`](../../ipc/IpcService/classes/IpcService.md)

Defined in: [electron/services/ServiceContainer.ts:290](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L290)

#### Returns

[`IpcService`](../../ipc/IpcService/classes/IpcService.md)

***

### getMonitorManager()

> **getMonitorManager**(): [`MonitorManager`](../../../managers/MonitorManager/classes/MonitorManager.md)

Defined in: [electron/services/ServiceContainer.ts:304](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L304)

#### Returns

[`MonitorManager`](../../../managers/MonitorManager/classes/MonitorManager.md)

***

### getMonitorRepository()

> **getMonitorRepository**(): [`MonitorRepository`](../../database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/services/ServiceContainer.ts:346](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L346)

#### Returns

[`MonitorRepository`](../../database/MonitorRepository/classes/MonitorRepository.md)

***

### getNotificationService()

> **getNotificationService**(): [`NotificationService`](../../notifications/NotificationService/classes/NotificationService.md)

Defined in: [electron/services/ServiceContainer.ts:358](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L358)

#### Returns

[`NotificationService`](../../notifications/NotificationService/classes/NotificationService.md)

***

### getSettingsRepository()

> **getSettingsRepository**(): [`SettingsRepository`](../../database/SettingsRepository/classes/SettingsRepository.md)

Defined in: [electron/services/ServiceContainer.ts:368](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L368)

#### Returns

[`SettingsRepository`](../../database/SettingsRepository/classes/SettingsRepository.md)

***

### getSiteManager()

> **getSiteManager**(): [`SiteManager`](../../../managers/SiteManager/classes/SiteManager.md)

Defined in: [electron/services/ServiceContainer.ts:380](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L380)

#### Returns

[`SiteManager`](../../../managers/SiteManager/classes/SiteManager.md)

***

### getSiteRepository()

> **getSiteRepository**(): [`SiteRepository`](../../database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/services/ServiceContainer.ts:449](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L449)

#### Returns

[`SiteRepository`](../../database/SiteRepository/classes/SiteRepository.md)

***

### getSiteService()

> **getSiteService**(): [`SiteService`](../../site/SiteService/classes/SiteService.md)

Defined in: [electron/services/ServiceContainer.ts:461](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L461)

#### Returns

[`SiteService`](../../site/SiteService/classes/SiteService.md)

***

### getUptimeOrchestrator()

> **getUptimeOrchestrator**(): [`UptimeOrchestrator`](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

Defined in: [electron/services/ServiceContainer.ts:477](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L477)

#### Returns

[`UptimeOrchestrator`](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

***

### getWindowService()

> **getWindowService**(): [`WindowService`](../../window/WindowService/classes/WindowService.md)

Defined in: [electron/services/ServiceContainer.ts:493](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L493)

#### Returns

[`WindowService`](../../window/WindowService/classes/WindowService.md)

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/ServiceContainer.ts:506](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L506)

Initialize all services in the correct order.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getInstance()

> `static` **getInstance**(`config?`): `ServiceContainer`

Defined in: [electron/services/ServiceContainer.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L126)

Get the singleton service container instance.

#### Parameters

##### config?

[`ServiceContainerConfig`](../interfaces/ServiceContainerConfig.md)

#### Returns

`ServiceContainer`

***

### resetForTesting()

> `static` **resetForTesting**(): `void`

Defined in: [electron/services/ServiceContainer.ts:154](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L154)

**`Internal`**

Reset the singleton container for testing purposes.

#### Returns

`void`

#### Remarks

**Testing Utility**: Clears the singleton instance to allow clean test isolation.

**Usage Pattern:**
```typescript
// In test setup
ServiceContainer.resetForTesting();

// Create fresh container for test
const container = ServiceContainer.getInstance({ enableDebugLogging: true });
```

**Important Notes:**
- Only use in test environments
- Does not clean up existing service instances
- Does not close database connections or cleanup resources
- Call cleanup methods on services before reset if needed
