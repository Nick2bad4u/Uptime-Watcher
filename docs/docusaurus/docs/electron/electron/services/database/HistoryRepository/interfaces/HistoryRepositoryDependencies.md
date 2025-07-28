# Interface: HistoryRepositoryDependencies

Defined in: [electron/services/database/HistoryRepository.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L23)

Defines the dependencies required by the [HistoryRepository](../classes/HistoryRepository.md) for managing history data persistence.

## Remarks

Provides the required [DatabaseService](../../DatabaseService/classes/DatabaseService.md) for all history operations. This interface is used for dependency injection.

## Properties

### databaseService

> `readonly` **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/HistoryRepository.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L28)

The database service used for transactional operations.
