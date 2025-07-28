# Interface: SettingsRepositoryDependencies

Defined in: [electron/services/database/SettingsRepository.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L18)

Defines the dependencies required by the SettingsRepository for managing application settings persistence.

## Remarks

Provides the required DatabaseService for all settings operations.
This interface is used for dependency injection to ensure proper service coupling.

## Properties

### databaseService

> **databaseService**: [`DatabaseService`](../../DatabaseService/classes/DatabaseService.md)

Defined in: [electron/services/database/SettingsRepository.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L25)

The database service used for transactional operations.

#### Remarks

Must be properly initialized before being passed to the repository.
