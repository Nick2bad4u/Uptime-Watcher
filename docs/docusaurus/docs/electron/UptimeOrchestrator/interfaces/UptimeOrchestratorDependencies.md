# Interface: UptimeOrchestratorDependencies

Defined in: [electron/UptimeOrchestrator.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/UptimeOrchestrator.ts#L176)

Dependencies for UptimeOrchestrator.

## Remarks

Following the repository pattern and service layer architecture, these
managers encapsulate domain-specific operations and provide a clean
separation between data access and business logic.

Each manager implements the service layer pattern with underlying repository
pattern for data persistence, ensuring consistent transaction handling and
domain boundaries.

## Properties

### databaseManager

> **databaseManager**: [`DatabaseManager`](../../managers/DatabaseManager/classes/DatabaseManager.md)

Defined in: [electron/UptimeOrchestrator.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/UptimeOrchestrator.ts#L177)

***

### monitorManager

> **monitorManager**: [`MonitorManager`](../../managers/MonitorManager/classes/MonitorManager.md)

Defined in: [electron/UptimeOrchestrator.ts:178](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/UptimeOrchestrator.ts#L178)

***

### siteManager

> **siteManager**: [`SiteManager`](../../managers/SiteManager/classes/SiteManager.md)

Defined in: [electron/UptimeOrchestrator.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/UptimeOrchestrator.ts#L179)
