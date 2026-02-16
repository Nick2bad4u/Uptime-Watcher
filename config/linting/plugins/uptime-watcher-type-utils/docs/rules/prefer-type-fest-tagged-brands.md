# Prefer TypeFest Tagged Brands

Prefers TypeFest `Tagged` for branded primitive identifiers over ad-hoc `__brand`/`__tag` intersection patterns.

## What it checks

- Type aliases that use intersection branding with explicit brand-marker fields.
- Existing `Tagged` usage is ignored.

## Why

`Tagged` provides a standard, reusable branded-type approach that improves consistency and readability.
