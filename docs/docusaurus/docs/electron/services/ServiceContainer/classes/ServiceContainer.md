# Class: ServiceContainer

Defined in: [electron/services/ServiceContainer.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L92)

Centralized service container for dependency management and lifecycle
orchestration.

## Remarks

Provides singleton access to all core, application, feature, and utility
services. Ensures correct initialization order and dependency injection.

## Methods

### getInstance()

> `static` **getInstance**(`config?`): `ServiceContainer`

Defined in: [electron/services/ServiceContainer.ts:213](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L213)

Gets the singleton ServiceContainer instance.

#### Parameters

##### config?

[`ServiceContainerConfig`](../interfaces/ServiceContainerConfig.md)

Optional configuration for the container.

#### Returns

`ServiceContainer`

The singleton ServiceContainer instance.

#### Remarks

If the instance does not exist, it is created with the provided
configuration.

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/ServiceContainer.ts:252](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L252)

Initializes all services in the correct order.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all services are initialized.

#### Remarks

Ensures all dependencies are resolved and services are ready for use.
Should be called once during application startup.

***

### getAutoUpdaterService()

> **getAutoUpdaterService**(): [`AutoUpdaterService`](../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

Defined in: [electron/services/ServiceContainer.ts:290](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L290)

Gets the [AutoUpdaterService](../../updater/AutoUpdaterService/classes/AutoUpdaterService.md) singleton.

#### Returns

[`AutoUpdaterService`](../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

The [AutoUpdaterService](../../updater/AutoUpdaterService/classes/AutoUpdaterService.md) instance.

***

### getConfigurationManager()

> **getConfigurationManager**(): [`ConfigurationManager`](../../../managers/ConfigurationManager/classes/ConfigurationManager.md)

Defined in: [electron/services/ServiceContainer.ts:305](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L305)

Gets the [ConfigurationManager](../../../managers/ConfigurationManager/classes/ConfigurationManager.md) singleton.

#### Returns

[`ConfigurationManager`](../../../managers/ConfigurationManager/classes/ConfigurationManager.md)

The [ConfigurationManager](../../../managers/ConfigurationManager/classes/ConfigurationManager.md) instance.

***

### getDatabaseManager()

> **getDatabaseManager**(): [`DatabaseManager`](../../../managers/DatabaseManager/classes/DatabaseManager.md)

Defined in: [electron/services/ServiceContainer.ts:324](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L324)

Gets the [DatabaseManager](../../../managers/DatabaseManager/classes/DatabaseManager.md) singleton.

#### Returns

[`DatabaseManager`](../../../managers/DatabaseManager/classes/DatabaseManager.md)

The [DatabaseManager](../../../managers/DatabaseManager/classes/DatabaseManager.md) instance.

#### Remarks

Instantiates with required repositories, configuration manager, and event
bus.

***

### getDatabaseService()

> **getDatabaseService**(): [`DatabaseService`](../../database/DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/ServiceContainer.ts:354](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L354)

Gets the [DatabaseService](../../database/DatabaseService/classes/DatabaseService.md) singleton.

#### Returns

[`DatabaseService`](../../database/DatabaseService/classes/DatabaseService.md)

The [DatabaseService](../../database/DatabaseService/classes/DatabaseService.md) instance.

***

### getHistoryRepository()

> **getHistoryRepository**(): [`HistoryRepository`](../../database/HistoryRepository/classes/HistoryRepository.md)

Defined in: [electron/services/ServiceContainer.ts:364](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L364)

Gets the [HistoryRepository](../../database/HistoryRepository/classes/HistoryRepository.md) singleton.

#### Returns

[`HistoryRepository`](../../database/HistoryRepository/classes/HistoryRepository.md)

The [HistoryRepository](../../database/HistoryRepository/classes/HistoryRepository.md) instance.

***

### getInitializationStatus()

> **getInitializationStatus**(): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `boolean`\>

Defined in: [electron/services/ServiceContainer.ts:384](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L384)

Gets a summary of initialization status for all services.

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `boolean`\>

An object mapping service names to their initialization status.

#### Remarks

Useful for debugging and diagnostics.

***

### getInitializedServices()

> **getInitializedServices**(): `object`[]

Defined in: [electron/services/ServiceContainer.ts:414](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L414)

Gets all initialized services for shutdown and debugging.

#### Returns

`object`[]

Array of objects containing service names and their instances.

#### Remarks

Dynamically discovers all initialized services by inspecting private
fields. Only includes services that are actually initialized (not
undefined).

***

### getIpcService()

> **getIpcService**(): [`IpcService`](../../ipc/IpcService/classes/IpcService.md)

Defined in: [electron/services/ServiceContainer.ts:451](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L451)

Gets the [IpcService](../../ipc/IpcService/classes/IpcService.md) singleton.

#### Returns

[`IpcService`](../../ipc/IpcService/classes/IpcService.md)

The [IpcService](../../ipc/IpcService/classes/IpcService.md) instance.

#### Remarks

Instantiates with dependencies on orchestrator and updater.

***

### getMonitorManager()

> **getMonitorManager**(): [`MonitorManager`](../../../managers/MonitorManager/classes/MonitorManager.md)

Defined in: [electron/services/ServiceContainer.ts:476](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L476)

Gets the [MonitorManager](../../../managers/MonitorManager/classes/MonitorManager.md) singleton.

#### Returns

[`MonitorManager`](../../../managers/MonitorManager/classes/MonitorManager.md)

The [MonitorManager](../../../managers/MonitorManager/classes/MonitorManager.md) instance.

#### Remarks

Instantiates with repositories, event bus, and dependency injection.
Forwards important events to the main orchestrator.

#### Throws

Error if [SiteManager](../../../managers/SiteManager/classes/SiteManager.md) is not initialized when required.

***

### getMonitorRepository()

> **getMonitorRepository**(): [`MonitorRepository`](../../database/MonitorRepository/classes/MonitorRepository.md)

Defined in: [electron/services/ServiceContainer.ts:540](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L540)

Gets the [MonitorRepository](../../database/MonitorRepository/classes/MonitorRepository.md) singleton.

#### Returns

[`MonitorRepository`](../../database/MonitorRepository/classes/MonitorRepository.md)

The [MonitorRepository](../../database/MonitorRepository/classes/MonitorRepository.md) instance.

***

### getNotificationService()

> **getNotificationService**(): [`NotificationService`](../../notifications/NotificationService/classes/NotificationService.md)

Defined in: [electron/services/ServiceContainer.ts:557](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L557)

Gets the [NotificationService](../../notifications/NotificationService/classes/NotificationService.md) singleton.

#### Returns

[`NotificationService`](../../notifications/NotificationService/classes/NotificationService.md)

The [NotificationService](../../notifications/NotificationService/classes/NotificationService.md) instance.

***

### getSettingsRepository()

> **getSettingsRepository**(): [`SettingsRepository`](../../database/SettingsRepository/classes/SettingsRepository.md)

Defined in: [electron/services/ServiceContainer.ts:574](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L574)

Gets the [SettingsRepository](../../database/SettingsRepository/classes/SettingsRepository.md) singleton.

#### Returns

[`SettingsRepository`](../../database/SettingsRepository/classes/SettingsRepository.md)

The [SettingsRepository](../../database/SettingsRepository/classes/SettingsRepository.md) instance.

***

### getSiteManager()

> **getSiteManager**(): [`SiteManager`](../../../managers/SiteManager/classes/SiteManager.md)

Defined in: [electron/services/ServiceContainer.ts:597](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L597)

Gets the [SiteManager](../../../managers/SiteManager/classes/SiteManager.md) singleton.

#### Returns

[`SiteManager`](../../../managers/SiteManager/classes/SiteManager.md)

The [SiteManager](../../../managers/SiteManager/classes/SiteManager.md) instance.

#### Remarks

Instantiates with repositories, event bus, and monitoring operations.
Forwards important events to the main orchestrator.

#### Throws

Error if setting the history limit fails.

***

### getSiteRepository()

> **getSiteRepository**(): [`SiteRepository`](../../database/SiteRepository/classes/SiteRepository.md)

Defined in: [electron/services/ServiceContainer.ts:715](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L715)

Gets the [SiteRepository](../../database/SiteRepository/classes/SiteRepository.md) singleton.

#### Returns

[`SiteRepository`](../../database/SiteRepository/classes/SiteRepository.md)

The [SiteRepository](../../database/SiteRepository/classes/SiteRepository.md) instance.

***

### getSiteService()

> **getSiteService**(): [`SiteService`](../../site/SiteService/classes/SiteService.md)

Defined in: [electron/services/ServiceContainer.ts:732](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L732)

Gets the [SiteService](../../site/SiteService/classes/SiteService.md) singleton.

#### Returns

[`SiteService`](../../site/SiteService/classes/SiteService.md)

The [SiteService](../../site/SiteService/classes/SiteService.md) instance.

***

### getUptimeOrchestrator()

> **getUptimeOrchestrator**(): [`UptimeOrchestrator`](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

Defined in: [electron/services/ServiceContainer.ts:755](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L755)

Gets the [UptimeOrchestrator](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md) singleton.

#### Returns

[`UptimeOrchestrator`](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

The [UptimeOrchestrator](../../../UptimeOrchestrator/classes/UptimeOrchestrator.md) instance.

#### Remarks

Instantiates with injected manager dependencies.

***

### getWindowService()

> **getWindowService**(): [`WindowService`](../../window/WindowService/classes/WindowService.md)

Defined in: [electron/services/ServiceContainer.ts:776](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ServiceContainer.ts#L776)

Gets the [WindowService](../../window/WindowService/classes/WindowService.md) singleton.

#### Returns

[`WindowService`](../../window/WindowService/classes/WindowService.md)

The [WindowService](../../window/WindowService/classes/WindowService.md) instance.
