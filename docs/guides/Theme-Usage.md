// Example: How to use the new errorAlert color in React components

import React from 'react';
import { useTheme } from './src/theme/useTheme';
import { ThemedText } from './src/theme/components';

// Method 1: Using the useTheme hook to access the color directly
function ExampleWithHook() {
const { currentTheme } = useTheme();

return (

<div style={{ color: currentTheme.colors.errorAlert }}>
This text uses the errorAlert color from the theme
</div>
);
}

// Method 2: Using CSS classes with theme variables (RECOMMENDED)
function ExampleWithCSS() {
return (

<div className="error-alert__text">
This text uses the errorAlert color via CSS custom property
</div>
);
}

// Method 3: Using ThemedText component with custom styling
function ExampleWithThemedComponent() {
return (
<ThemedText
variant="primary"
style={{ color: 'var(--color-error-alert)' }} >
This text uses the errorAlert color via CSS custom property
</ThemedText>
);
}

// Method 4: Creating a reusable component
function ErrorAlertText({ children }: { children: React.ReactNode }) {
return (
<span className="error-alert__text">
{children}
</span>
);
}

export default function ExampleUsage() {
return (

<div>
<h2>Examples of using the errorAlert theme color:</h2>
<ExampleWithHook />
<ExampleWithCSS />
<ExampleWithThemedComponent />
<ErrorAlertText>This is an error alert message</ErrorAlertText>
</div>
);
}
