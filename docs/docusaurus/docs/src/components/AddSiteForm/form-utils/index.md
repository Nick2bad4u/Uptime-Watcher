# src/components/AddSiteForm/form-utils

Shared utilities for form field components in the AddSiteForm module.

## Remarks

Provides helper functions for accessibility and validation patterns across
all form components. These utilities ensure consistent accessibility patterns
and reduce code duplication in form field implementations.

Key features:

- Accessibility label generation with required field indicators
- ARIA attribute management for form fields
- Consistent form validation patterns
- Helper functions for error and help text handling

## Example

```typescript
import { createAriaLabel, getAriaDescribedBy } from "./form-utils";

// Create accessible label
const ariaLabel = createAriaLabel("Site Name", true); // "Site Name (required)"

// Handle ARIA describedby for errors
const describedBy = getAriaDescribedBy(
    "field-id",
    errorMessage,
    helpText
);
```

## Variables

- [REQUIRED\_SUFFIX](variables/REQUIRED_SUFFIX.md)

## Functions

- [createAriaLabel](functions/createAriaLabel.md)
- [getAriaDescribedBy](functions/getAriaDescribedBy.md)
