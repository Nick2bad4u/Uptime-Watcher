# Interface: UptimeOrchestratorDependencies

Defined in: [electron/UptimeOrchestrator.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/UptimeOrchestrator.ts#L97)

Dependencies for UptimeOrchestrator.

## Remarks

Following the repository pattern and service layer architecture,
these managers encapsulate domain-specific operations and provide
a clean separation between data access and business logic.

Each manager implements the service layer pattern with underlying
repository pattern for data persistence, ensuring consistent
transaction handling and domain boundaries.

## Properties

### databaseManager

> **databaseManager**: [`DatabaseManager`](../../managers/DatabaseManager/classes/DatabaseManager.md)

Defined in: [electron/UptimeOrchestrator.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/UptimeOrchestrator.ts#L98)

***

### monitorManager

> **monitorManager**: [`MonitorManager`](../../managers/MonitorManager/classes/MonitorManager.md)

Defined in: [electron/UptimeOrchestrator.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/UptimeOrchestrator.ts#L99)

***

### siteManager

> **siteManager**: [`SiteManager`](../../managers/SiteManager/classes/SiteManager.md)

Defined in: [electron/UptimeOrchestrator.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/UptimeOrchestrator.ts#L100)
