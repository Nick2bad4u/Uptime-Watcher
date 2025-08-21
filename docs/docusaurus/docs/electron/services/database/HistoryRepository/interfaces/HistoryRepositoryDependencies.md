# Interface: HistoryRepositoryDependencies

Defined in: [electron/services/database/HistoryRepository.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L83)

Defines the dependencies required by the [HistoryRepository](../classes/HistoryRepository.md) for
managing history data persistence.

## Remarks

Provides the required [DatabaseService](../../DatabaseService/classes/DatabaseService.md) for all history operations. This
interface is used for dependency injection.

## Properties

### databaseService

> `readonly` **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/HistoryRepository.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L89)

The database service used for transactional operations.
