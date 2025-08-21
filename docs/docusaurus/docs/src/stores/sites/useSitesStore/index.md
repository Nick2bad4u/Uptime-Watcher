# src/stores/sites/useSitesStore

Main sites store for managing site data and operations using modular
architecture.

## Remarks

This store uses a modular composition pattern to separate concerns and
improve testability. Instead of a monolithic store, it composes smaller,
focused modules:

- `useSitesState`: Core state management and data manipulation
- `useSiteOperations`: CRUD operations for sites and monitors
- `useSiteMonitoring`: Monitoring lifecycle and status management
- `useSiteSync`: Backend synchronization and data consistency

Each module is independently testable and has clear responsibilities, making
the codebase more maintainable and easier to understand.

## Example

```typescript
import { useSitesStore } from './stores';

function MyComponent() {
  const { sites, addSite, startMonitoring } = useSitesStore();

  const handleAddSite = async () => {
    const newSite = await addSite({ name: 'Example Site', monitors: [] });
    await startMonitoring();
  };

  return <div>{sites.length} sites</div>;
}
```

## Variables

- [useSitesStore](variables/useSitesStore.md)
