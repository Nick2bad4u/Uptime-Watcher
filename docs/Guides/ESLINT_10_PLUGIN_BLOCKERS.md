# ESLint 10 Plugin Blockers

This document tracks plugins/rules that are currently incompatible with ESLint 10 in this repository.

## Compatibility strategy in use

1. **First choice:** wrap legacy plugins with `fixupPluginRules(...)`.
2. **Fallback (current):** explicitly disable incompatible plugins/rules in `eslint.config.mjs` with temporary compatibility comments so they can be re-enabled when upstream fixes land.

### Example temporary override pattern

```js
// Temporary ESLint 10 compatibility override. Re-enable after upstream fix.
rules: {
  "tailwind/enforces-shorthand": "off",
}
```

## Wrapped via `fixupPluginRules` (currently enabled)

These were explicitly wrapped for ESLint 10 compatibility:

- `canonical`
- `functional`
- `no-constructor-bind`
- `no-explicit-type-exports`
- `no-unsanitized`
- `prefer-arrow`
- `security`
- `sort-class-members`
- `styled-components-a11y`
- `write-good-comments`

Additional wrapped compatibility candidates:

- `react`
- `no-lookahead-lookbehind-regexp`

## Temporarily disabled blockers

| Plugin / Rule                                       | Current status | Failure signature observed                                                            | Current workaround                                 |
| --------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `@microsoft/eslint-plugin-sdl`                      | Disabled       | Pulls incompatible runtime chain via deprecated APIs/dependencies                     | Plugin import disabled; fallback no-op plugin used |
| `@rushstack/eslint-plugin-security`                 | Disabled       | `Class extends value undefined is not a constructor or null`                          | Plugin import disabled                             |
| `eslint-plugin-case-police` (`configs.recommended`) | Disabled       | `context.getFilename is not a function` (`case-police/string-check`)                  | Recommended config spread commented out            |
| `mdx/remark`                                        | Disabled       | `Cannot read properties of undefined (reading 'bind')`                                | Rule forced `off`                                  |
| `import-x/unambiguous`                              | Disabled       | `Cannot use 'in' operator to search for 'sourceType' in undefined`                    | Rule forced `off`                                  |
| `istanbul/no-ignore-file`                           | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `istanbul/prefer-ignore-reason`                     | Disabled       | Same ESLint 10 context API incompatibility surface                                    | Rule forced `off`                                  |
| `loadable-imports/sort`                             | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `react-useeffect/no-non-function-return`            | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `tsdoc/syntax`                                      | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `tsdoc-require/require`                             | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `granular-selectors/granular-selectors`             | Disabled       | `context.getSource is not a function`                                                 | Rule forced `off`                                  |
| `ex/no-unhandled`                                   | Disabled       | `Cannot destructure property 'project' of 'context.parserOptions' as it is undefined` | Rule forced `off`                                  |
| `tailwind/classnames-order`                         | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `tailwind/enforces-shorthand`                       | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `tailwind/enforces-negative-arbitrary-values`       | Disabled       | ESLint 10 context API incompatibility surface                                         | Rule forced `off`                                  |
| `tailwind/migration-from-tailwind-2`                | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `tailwind/no-arbitrary-value`                       | Disabled       | ESLint 10 context API incompatibility surface                                         | Rule forced `off`                                  |
| `tailwind/no-contradicting-classname`               | Disabled       | ESLint 10 context API incompatibility surface                                         | Rule forced `off`                                  |
| `tailwind/no-custom-classname`                      | Disabled       | ESLint 10 context API incompatibility surface                                         | Rule forced `off`                                  |
| `tailwind/no-unnecessary-arbitrary-value`           | Disabled       | ESLint 10 context API incompatibility surface                                         | Rule forced `off`                                  |
| `sort-react-dependency-arrays/sort`                 | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `storybook/meta-satisfies-type`                     | Disabled       | `context.getSourceCode is not a function`                                             | Rule forced `off`                                  |
| `progress/activate`                                 | Disabled       | `context.getFilename is not a function`                                               | Rule forced `off`                                  |

## Completed migrations

- `eslint-plugin-deprecation` has been removed in favor of `@typescript-eslint/no-deprecated`.

## Re-enable checklist

When upgrading plugin versions, re-enable one item at a time and validate with:

1. `npm run lint:fix:quiet`
2. `npm run type-check:all`
3. `npm run test`

For each item:

- Remove the temporary `off` override / fallback block.
- Confirm no runtime `context.get*` / parser API crashes.
- Keep this file updated until all blockers are removed.
