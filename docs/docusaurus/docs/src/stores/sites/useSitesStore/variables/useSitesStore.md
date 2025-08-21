# Variable: useSitesStore

> `const` **useSitesStore**: `UseBoundStore`\<`StoreApi`\<[`SitesStore`](../../types/type-aliases/SitesStore.md)\>\>

Defined in: [src/stores/sites/useSitesStore.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSitesStore.ts#L62)

Main sites store combining all site-related functionality.

## Remarks

Creates a Zustand store that composes multiple action modules to provide a
complete interface for site management. The store uses dependency injection
to share common functions between modules while maintaining clear
boundaries.

## Returns

Complete sites store with all actions and state
