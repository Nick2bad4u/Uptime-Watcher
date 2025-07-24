# Variable: useSitesStore

> `const` **useSitesStore**: `UseBoundStore`\<`StoreApi`\<[`SitesStore`](../../types/type-aliases/SitesStore.md)\>\>

Defined in: [src/stores/sites/useSitesStore.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSitesStore.ts#L54)

Main sites store combining all site-related functionality.

## Remarks

Creates a Zustand store that composes multiple action modules to provide
a complete interface for site management. The store uses dependency injection
to share common functions between modules while maintaining clear boundaries.
