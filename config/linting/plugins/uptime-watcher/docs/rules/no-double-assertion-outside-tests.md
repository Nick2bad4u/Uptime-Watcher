# No Double Assertion Outside Tests

Disallows chained type assertions such as `as unknown as` in production code.

## What it checks

- `TSAsExpression` and `TSTypeAssertion` nodes whose expression is already another assertion.
- Test files are excluded by default.

## Why

Double assertion bypasses type safety and often masks missing runtime validation.
