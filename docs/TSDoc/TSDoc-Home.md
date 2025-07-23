::::::::::::::::::::::: {.docMainContainer_cKen role="main"}
:::::::::::::::::::::: {.container .padding-top--md .padding-bottom--lg}
::::::::::::::::::::: row
:::::::::::::::::: {.col .docItemCol__Pkv}
::::::::::::::::: docItemContainer_Bu3E
::: {.tocCollapsible_L2mx .theme-doc-toc-mobile .tocMobile_O5LO}
On this page
:::

:::::::::: {.theme-doc-markdown .markdown}
<div>

# What is TSDoc?

</div>

TSDoc is a proposal to standardize the doc comments used in
[TypeScript](http://www.typescriptlang.org/){target="_blank"
rel="noopener noreferrer"} code, so that different tools can extract
content without getting confused by each other\'s markup. The TSDoc
notation looks pretty familiar:

::::: {.language-typescript .codeBlockContainer_HN2s .theme-code-block style="--prism-color:#000000;--prism-background-color:#ffffff"}
:::: codeBlockContent_YIEk
``` {.prism-code .language-typescript .codeBlock_wIUF .thin-scrollbar tabindex="0"}
export class Statistics {
  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   * @beta
   */
  public static getAverage(x: number, y: number): number {
    return (x + y) / 2.0;
  }
}
```

::: buttonGroup_hg4O
[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iY29weUJ1dHRvbkljb25fQU91NSIgdmlld2JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTksMjFIOFY3SDE5TTE5LDVIOEEyLDIgMCAwLDAgNiw3VjIxQTIsMiAwIDAsMCA4LDIzSDE5QTIsMiAwIDAsMCAyMSwyMVY3QTIsMiAwIDAsMCAxOSw1TTE2LDFINEEyLDIgMCAwLDAgMiwzVjE3SDRWM0gxNlYxWiIgLz48L3N2Zz4=){.copyButtonIcon_AOu5}![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iY29weUJ1dHRvblN1Y2Nlc3NJY29uX3JBN2wiIHZpZXdib3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxLDdMOSwxOUwzLjUsMTMuNUw0LjkxLDEyLjA5TDksMTYuMTdMMTkuNTksNS41OUwyMSw3WiIgLz48L3N2Zz4=){.copyButtonSuccessIcon_rA7l}]{.copyButtonIcons_NJJd
aria-hidden="true"}
:::
::::
:::::

We are developing a library package
[\@microsoft/tsdoc](https://www.npmjs.com/package/@microsoft/tsdoc){target="_blank"
rel="noopener noreferrer"} that provides an open source reference
implementation of a parser. Using this library is an easy way to ensure
that your tool is 100% compatible with the standard.

👋 **\*Give it a try!** The [TSDoc Playground](/play/){target="_blank"}
provides an interactive demo of the parser!\*

## Why do we need TSDoc?[​](#why-do-we-need-tsdoc "Direct link to Why do we need TSDoc?"){.hash-link aria-label="Direct link to Why do we need TSDoc?"} {#why-do-we-need-tsdoc .anchor .anchorWithStickyNavbar_Dpyi}

A single source file may get analyzed by multiple tools. Here\'s some
examples of popular tools that need to parse doc comments:

- [TypeDoc](https://github.com/TypeStrong/typedoc){target="_blank"
  rel="noopener noreferrer"}: an API reference generator that extracts
  member documentation from code comments
- [DocFX](https://dotnet.github.io/docfx/){target="_blank"
  rel="noopener noreferrer"}: an integrated pipeline that ingests API
  reference content for many different programming languages, but then
  applies its own Markdown renderer and custom tag parsing
- [API Extractor](https://api-extractor.com/){target="_blank"
  rel="noopener noreferrer"}: a build tool that tracks TypeScript API
  review workflows and generates \*.d.ts rollups for third-party SDKs
- [ESLint](https://eslint.org/){target="_blank"
  rel="noopener noreferrer"}: lint rules might look for tags such as
  `@virtual` or `@override`, which represent behavioral contracts to be
  validated
- [Visual Studio Code](https://code.visualstudio.com){target="_blank"
  rel="noopener noreferrer"}: an editor that supports syntax
  highlighting and interactive refactoring for TypeScript doc comments
- **Your own scripts!** - Developers often create build scripts that
  extract documentation or bundling directives from code comments

All these tools recognize a syntax that is loosely based on
[JSDoc](https://jsdoc.app/){target="_blank" rel="noopener noreferrer"},
but each with its own flavor of syntax extensions. This can lead to
frustrating incompatibilities.

Consider a hypothetical input:

::::: {.language-typescript .codeBlockContainer_HN2s .theme-code-block style="--prism-color:#000000;--prism-background-color:#ffffff"}
:::: codeBlockContent_YIEk
``` {.prism-code .language-typescript .codeBlock_wIUF .thin-scrollbar tabindex="0"}
/**
 * @returns true if the specified tag is surrounded with `{`
 * and `}` characters.
 *
 * @example
 * Prints "true" for `{@link}` but "false" for `@internal`:
 * ```ts
 * console.log(isInlineTag('{@link}'));
 * console.log(isInlineTag('@internal'));
 * ```
 * @see {@link http://example.com/@internal | the @internal tag}
 */
declare function isInlineTag(tagName: string): boolean;
```

::: buttonGroup_hg4O
[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iY29weUJ1dHRvbkljb25fQU91NSIgdmlld2JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTksMjFIOFY3SDE5TTE5LDVIOEEyLDIgMCAwLDAgNiw3VjIxQTIsMiAwIDAsMCA4LDIzSDE5QTIsMiAwIDAsMCAyMSwyMVY3QTIsMiAwIDAsMCAxOSw1TTE2LDFINEEyLDIgMCAwLDAgMiwzVjE3SDRWM0gxNlYxWiIgLz48L3N2Zz4=){.copyButtonIcon_AOu5}![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iY29weUJ1dHRvblN1Y2Nlc3NJY29uX3JBN2wiIHZpZXdib3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxLDdMOSwxOUwzLjUsMTMuNUw0LjkxLDEyLjA5TDksMTYuMTdMMTkuNTksNS41OUwyMSw3WiIgLz48L3N2Zz4=){.copyButtonSuccessIcon_rA7l}]{.copyButtonIcons_NJJd
aria-hidden="true"}
:::
::::
:::::

Is this `isInlineTag()` function marked as `@internal`? Well, API
Extractor would say \"no,\" because it recognizes many
[CommonMark](https://commonmark.org/){target="_blank"
rel="noopener noreferrer"} constructs. But the TypeScript compiler would
say \"yes\" \-- even for the `@see` hypertext and URL \-- because its
parser treats everything as literal text.

Is the `@see` block part of the `@example`? Again, different tools
behave differently depending on how they handle that tag.

In many cases, sloppy parsing mostly works. Occasional malfunctions are
no big deal. But when these directives determine professional website
content or build output, incorrect parsing can become a serious concern.

## Three requirements[​](#three-requirements "Direct link to Three requirements"){.hash-link aria-label="Direct link to Three requirements"} {#three-requirements .anchor .anchorWithStickyNavbar_Dpyi}

TSDoc aims to standardize the doc comment grammar, while carefully
balancing several competing design requirements:

1.  **Extensibility:** Tools must be able to define their own custom
    tags to represent domain-specific metadata in a natural way.
2.  **Interoperability:** Custom tags must not prevent other tools from
    correctly analyzing the comment. In order words, custom tags must
    use established syntax patterns that can be safely recognized and
    discarded during parsing.
3.  **Familiar syntax:** As much as possible, TSDoc should preserve the
    familiar style of JSDoc/Markdown. This also maximizes the likelihood
    that legacy comments will parse correctly as TSDoc.

***Why can\'t JSDoc be the standard?*** The JSDoc grammar is not
rigorously specified, but rather inferred from the behavior of a
particular implementation. The majority of the standard JSDoc tags are
preoccupied with providing type annotations for plain JavaScript, which
is not a primary concern for a strongly-typed language such as
TypeScript.

## Who\'s involved?[​](#whos-involved "Direct link to Who's involved?"){.hash-link aria-label="Direct link to Who's involved?"} {#whos-involved .anchor .anchorWithStickyNavbar_Dpyi}

Implementation:

- [Pete Gonzalez](https://github.com/octogonz){target="_blank"
  rel="noopener noreferrer"} created the initial concept and parser API
- [Ron Buckton](https://github.com/rbuckton){target="_blank"
  rel="noopener noreferrer"} redesigned the declaration reference syntax
  and has been working on a rewrite of the markdown parser
- [Ian Clanton-Thuon](https://github.com/iclanton/){target="_blank"
  rel="noopener noreferrer"} contributed the TSDoc Playground
- [Brian Folts](https://github.com/bafolts){target="_blank"
  rel="noopener noreferrer"} contributed the **eslint-plugin-tsdoc**
  package for ESLint
- many other contributors who implemented features and bugfixes!

(Should your name appear here? [Suggest an
update](https://github.com/microsoft/rushstack-websites/edit/main/websites/tsdoc.org/docs/index.md){target="_blank"
rel="noopener noreferrer"} to this page.)

Contributing design input:

- [TypeScript](http://www.typescriptlang.org){target="_blank"
  rel="noopener noreferrer"} compiler group at Microsoft
- [API Extractor](https://api-extractor.com/){target="_blank"
  rel="noopener noreferrer"} community
- [DocFX](https://dotnet.github.io/docfx/){target="_blank"
  rel="noopener noreferrer"} maintainers
- [TypeDoc](http://typedoc.org){target="_blank"
  rel="noopener noreferrer"} community
- [SimplrJS](https://simplrjs.com/){target="_blank"
  rel="noopener noreferrer"} developers, who maintain the
  [ts-docs-gen](https://github.com/SimplrJS/ts-docs-gen){target="_blank"
  rel="noopener noreferrer"} tool
- [Tom Dale](https://github.com/tomdale){target="_blank"
  rel="noopener noreferrer"}, who\'s working on the documentation engine
  for [Ember.js](https://www.emberjs.com){target="_blank"
  rel="noopener noreferrer"},
  [Glimmer.js](https://glimmerjs.com){target="_blank"
  rel="noopener noreferrer"}, and other projects
- [Rob Eisenberg](https://github.com/EisenbergEffect){target="_blank"
  rel="noopener noreferrer"}, who\'s working on the documentation engine
  for [Aurelia](http://aurelia.io/){target="_blank"
  rel="noopener noreferrer"}.

## Next steps[​](#next-steps "Direct link to Next steps"){.hash-link aria-label="Direct link to Next steps"} {#next-steps .anchor .anchorWithStickyNavbar_Dpyi}

👉 [Learn more](/pages/intro/approach/) \-- about the goals and approach

👉 [How can I use TSDoc?](/pages/intro/using_tsdoc/) \-- learn about
tools and resources for developing with TSDoc
::::::::::

::::: {.theme-doc-footer-edit-meta-row .row}
::: col
[![](data:image/svg+xml;base64,PHN2ZyBmaWxsPSJjdXJyZW50Q29sb3IiIGhlaWdodD0iMjAiIHdpZHRoPSIyMCIgdmlld2JveD0iMCAwIDQwIDQwIiBjbGFzcz0iaWNvbkVkaXRfTTVBYyIgYXJpYS1oaWRkZW49InRydWUiPjxnPjxwYXRoIGQ9Im0zNC41IDExLjdsLTMgMy4xLTYuMy02LjMgMy4xLTNxMC41LTAuNSAxLjItMC41dDEuMSAwLjVsMy45IDMuOXEwLjUgMC40IDAuNSAxLjF0LTAuNSAxLjJ6IG0tMjkuNSAxNy4xbDE4LjQtMTguNSA2LjMgNi4zLTE4LjQgMTguNGgtNi4zdi02LjJ6IiAvPjwvZz48L3N2Zz4=){.iconEdit_M5Ac}Edit
this
page](https://github.com/microsoft/rushstack-websites/tree/main/websites/tsdoc.org/docs/index.md){.theme-edit-this-page
target="_blank" rel="noreferrer noopener"}
:::

::: {.col .lastUpdated_OkfV}
:::
:::::

[](/pages/intro/approach/){.pagination-nav__link
.pagination-nav__link--next}

::: pagination-nav__sublabel
Next
:::

::: pagination-nav__label
Approach
:::
:::::::::::::::::
::::::::::::::::::

:::: {.col .col--3}
::: {.tableOfContents_KF6W .thin-scrollbar .theme-doc-toc-desktop}
- [Why do we need
  TSDoc?](#why-do-we-need-tsdoc){.table-of-contents__link
  .toc-highlight}
- [Three requirements](#three-requirements){.table-of-contents__link
  .toc-highlight}
- [Who\'s involved?](#whos-involved){.table-of-contents__link
  .toc-highlight}
- [Next steps](#next-steps){.table-of-contents__link .toc-highlight}
:::
::::
:::::::::::::::::::::
::::::::::::::::::::::
:::::::::::::::::::::::
