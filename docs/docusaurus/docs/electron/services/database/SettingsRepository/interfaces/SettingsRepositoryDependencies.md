# Interface: SettingsRepositoryDependencies

Defined in: [electron/services/database/SettingsRepository.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L73)

Defines the dependencies required by the SettingsRepository for managing
application settings persistence.

## Remarks

Provides the required DatabaseService for all settings operations. This
interface is used for dependency injection to ensure proper service
coupling.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/SettingsRepository.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L80)

The database service used for transactional operations.

#### Remarks

Must be properly initialized before being passed to the repository.
