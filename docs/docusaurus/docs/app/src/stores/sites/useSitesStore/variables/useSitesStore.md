# Variable: useSitesStore

> `const` **useSitesStore**: `UseBoundStore`\<`StoreApi`\<[`SitesStore`](../../types/type-aliases/SitesStore.md)\>\>

Defined in: [src/stores/sites/useSitesStore.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSitesStore.ts#L55)

Main sites store combining all site-related functionality.

## Remarks

Creates a Zustand store that composes multiple action modules to provide
a complete interface for site management. The store uses dependency injection
to share common functions between modules while maintaining clear boundaries.

## Returns

Complete sites store with all actions and state
