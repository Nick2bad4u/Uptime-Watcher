# Interface: SiteActionsResult

Defined in: [src/hooks/site/useSiteActions.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L29)

Result interface for the useSiteActions hook.

## Remarks

Provides a complete set of action handlers for site operations, including
individual monitor control and site-wide monitoring management. All handlers
include proper error handling and user action logging.

## Extended by

- [`UseSiteResult`](../../useSite/interfaces/UseSiteResult.md)

## Properties

### handleCardClick()

> **handleCardClick**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L31)

Handler for clicking on site card to show details

#### Returns

`void`

***

### handleCheckNow()

> **handleCheckNow**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L33)

Handler for immediate status check of current monitor

#### Returns

`void`

***

### handleStartMonitoring()

> **handleStartMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L35)

Handler for starting monitoring on current monitor

#### Returns

`void`

***

### handleStartSiteMonitoring()

> **handleStartSiteMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L37)

Handler for starting monitoring on all site monitors

#### Returns

`void`

***

### handleStopMonitoring()

> **handleStopMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L39)

Handler for stopping monitoring on current monitor

#### Returns

`void`

***

### handleStopSiteMonitoring()

> **handleStopSiteMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L41)

Handler for stopping monitoring on all site monitors

#### Returns

`void`
