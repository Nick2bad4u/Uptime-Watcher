# Interface: SiteRepositoryDependencies

Defined in: [electron/services/database/SiteRepository.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SiteRepository.ts#L15)

Defines the dependencies required by the [SiteRepository](../classes/SiteRepository.md) for managing site data persistence.

## Remarks

Used to inject the [DatabaseService](../../DatabaseService/classes/DatabaseService.md) for transactional operations. This interface is used for dependency injection.

## Properties

### databaseService

> `readonly` **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/SiteRepository.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SiteRepository.ts#L20)

The database service used for transactional operations.
