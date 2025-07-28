# Function: useAddSiteForm()

> **useAddSiteForm**(): [`AddSiteFormActions`](../interfaces/AddSiteFormActions.md) & [`AddSiteFormState`](../interfaces/AddSiteFormState.md)

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L86)

Hook for managing add site form state and operations.

## Returns

[`AddSiteFormActions`](../interfaces/AddSiteFormActions.md) & [`AddSiteFormState`](../interfaces/AddSiteFormState.md)

Combined form state and action handlers containing all form fields,
validation state, and manipulation functions for managing the add site form

## Remarks

Provides comprehensive form state management with real-time validation,
support for both new sites and adding monitors to existing sites.
Handles dynamic field validation based on monitor type and maintains
proper form state throughout the user interaction lifecycle.
