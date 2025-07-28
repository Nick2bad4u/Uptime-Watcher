# Variable: SiteCardFooter

> `const` **SiteCardFooter**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<`object`\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardFooter.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteCard/SiteCardFooter.tsx#L31)

Footer section component for site cards with interactive hint text.

Features:
- Hover-triggered opacity animation for subtle user guidance
- Consistent styling with top border separator
- Static content optimized with React.memo
- Responsive design with themed text components

## Returns

JSX.Element containing the footer with interaction hint (no props required)

## Example

```tsx
<SiteCardFooter />
```

## Remarks

This component uses group-hover:opacity-100 which requires the parent
container to have the Tailwind 'group' class applied. The parent SiteCard
component provides this styling context.
