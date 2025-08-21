# Interface: MonitorRepositoryDependencies

Defined in: [electron/services/database/MonitorRepository.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L84)

Repository dependencies for managing monitor data persistence.

## Remarks

Provides the required database service for monitor operations. Used for
dependency injection pattern to ensure proper service coupling.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/MonitorRepository.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L91)

Database service for transactional operations.

#### Remarks

Must be properly initialized before being passed to the repository.
