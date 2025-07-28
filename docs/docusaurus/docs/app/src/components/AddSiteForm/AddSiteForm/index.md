# src/components/AddSiteForm/AddSiteForm

AddSiteForm component for creating new sites and adding monitors to existing sites.

## Remarks

- Provides a comprehensive form with validation and flexible configuration options.
- Supports both HTTP and port monitoring types, with customizable check intervals.
- Uses domain-specific Zustand stores for state management.
- Loads monitor types dynamically from the backend.
- Handles errors via a centralized error store and logger.
- All form state is managed via the [useAddSiteForm](../../SiteDetails/useAddSiteForm/functions/useAddSiteForm.md) custom hook.

## Variables

- [AddSiteForm](variables/AddSiteForm.md)
