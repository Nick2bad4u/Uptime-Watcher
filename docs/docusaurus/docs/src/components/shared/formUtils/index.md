# src/components/shared/formUtils

Shared form utility functions and validation patterns for consistent form
behavior across components.

## Remarks

This module provides standardized form handling utilities, input change
handlers, validation patterns, and common form operations. It ensures
consistent behavior and reduces code duplication across form components in
the application.

Key features:

- Input change handler creators with optional validation
- Select change handler creators with type conversion
- Common validation patterns for URLs, ports, and text fields
- Standardized form event handling patterns

## Example

```tsx
import { createInputChangeHandler, validationPatterns } from './formUtils';

function MyForm() {
  const [url, setUrl] = useState('');
  const handleUrlChange = createInputChangeHandler(setUrl);

  return (
    <input
      pattern={validationPatterns.url}
      onChange={handleUrlChange}
      value={url}
    />
  );
}
```

## Variables

- [validationPatterns](variables/validationPatterns.md)

## Functions

- [createInputChangeHandler](functions/createInputChangeHandler.md)
- [createSelectChangeHandler](functions/createSelectChangeHandler.md)
- [createCheckboxChangeHandler](functions/createCheckboxChangeHandler.md)
