# Interface: MonitorRepositoryDependencies

Defined in: [electron/services/database/MonitorRepository.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L31)

Repository dependencies for managing monitor data persistence.

## Remarks

Provides the required database service for monitor operations.
Used for dependency injection pattern to ensure proper service coupling.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/MonitorRepository.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L38)

Database service for transactional operations.

#### Remarks

Must be properly initialized before being passed to the repository.
