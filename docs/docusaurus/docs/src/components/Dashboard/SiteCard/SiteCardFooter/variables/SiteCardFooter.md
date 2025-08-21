# Variable: SiteCardFooter

> `const` **SiteCardFooter**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<`object`\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardFooter.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/SiteCardFooter.tsx#L34)

Footer section component for site cards with interactive hint text.

Features:

- Hover-triggered opacity animation for subtle user guidance
- Consistent styling with top border separator
- Static content optimized with React.memo
- Responsive design with themed text components

## Remarks

This component uses group-hover:opacity-100 which requires the parent
container to have the Tailwind 'group' class applied. The parent SiteCard
component provides this styling context.

## Example

```tsx
<SiteCardFooter />;
```

## Returns

JSX.Element containing the footer with interaction hint (no props
  required)
