# Interface: SiteRepositoryDependencies

Defined in: [electron/services/database/SiteRepository.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L69)

Defines the dependencies required by the [SiteRepository](../classes/SiteRepository.md) for managing
site data persistence.

## Remarks

Used to inject the [DatabaseService](../../DatabaseService/classes/DatabaseService.md) for transactional operations. This
interface is used for dependency injection.

## Properties

### databaseService

> `readonly` **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/SiteRepository.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L75)

The database service used for transactional operations.
