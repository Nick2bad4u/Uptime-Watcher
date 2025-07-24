# Variable: useSitesStore

> `const` **useSitesStore**: `UseBoundStore`\<`StoreApi`\<[`SitesStore`](../../types/type-aliases/SitesStore.md)\>\>

Defined in: [src/stores/sites/useSitesStore.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSitesStore.ts#L54)

Main sites store combining all site-related functionality.

## Remarks

Creates a Zustand store that composes multiple action modules to provide
a complete interface for site management. The store uses dependency injection
to share common functions between modules while maintaining clear boundaries.
