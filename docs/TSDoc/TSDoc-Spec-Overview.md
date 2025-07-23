\<!doctype html\>
<html lang="en" dir="ltr" class="docs-wrapper docs-doc-page docs-version-current plugin-docs plugin-id-default docs-doc-id-pages/spec/overview">
<head>
<meta charset="UTF-8">
<meta name="generator" content="Docusaurus v2.3.1">
<title data-rh="true">
TSDoc spec \| TSDoc
</title>
<meta data-rh="true" name="viewport" content="width=device-width,initial-scale=1">
<meta data-rh="true" name="twitter:card" content="summary_large_image">
<meta data-rh="true" property="og:image" content="https://tsdoc.org/images/site/tsdoc-ograph.png">
<meta data-rh="true" name="twitter:image" content="https://tsdoc.org/images/site/tsdoc-ograph.png">
<meta data-rh="true" property="og:url" content="https://tsdoc.org/pages/spec/overview/">
<meta data-rh="true" name="docusaurus_locale" content="en">
<meta data-rh="true" name="docsearch:language" content="en">
<meta data-rh="true" name="docusaurus_version" content="current">
<meta data-rh="true" name="docusaurus_tag" content="docs-default-current">
<meta data-rh="true" name="docsearch:version" content="current">
<meta data-rh="true" name="docsearch:docusaurus_tag" content="docs-default-current">
<meta data-rh="true" property="og:title" content="TSDoc spec | TSDoc">
<meta data-rh="true" name="description" content="Technical details for the TSDoc syntax are tracked by &quot;RFC&quot; issues with the">
<meta data-rh="true" property="og:description" content="Technical details for the TSDoc syntax are tracked by &quot;RFC&quot; issues with the">

`<link data-rh="true" rel="icon" href="/images/site/favicon.ico">`{=html}`<link data-rh="true" rel="canonical" href="https://tsdoc.org/pages/spec/overview/">`{=html}`<link data-rh="true" rel="alternate" href="https://tsdoc.org/pages/spec/overview/" hreflang="en">`{=html}`<link data-rh="true" rel="alternate" href="https://tsdoc.org/pages/spec/overview/" hreflang="x-default">`{=html}`<link rel="search" type="application/opensearchdescription+xml" title="TSDoc" href="/opensearch.xml">`{=html}

`<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic">`{=html}`<link rel="stylesheet" href="/assets/css/styles.2fa9719f.css">`{=html}
`<link rel="preload" href="/assets/js/runtime~main.50027455.js" as="script">`{=html}
`<link rel="preload" href="/assets/js/main.cf755157.js" as="script">`{=html}
</head>
<body class="navigation-with-keyboard">
<script>!function(){function t(t){document.documentElement.setAttribute("data-theme",t)}var e=function(){var t=null;try{t=localStorage.getItem("theme")}catch(t){}return t}();t(null!==e?e:"light")}()</script>

::::::::::::::::::::::::::::::::::::::::: {#__docusaurus}
::::: suiteNavBar_rHPh
::: {.waffle_FRnN .waffleInteraction_uHqh role="button"}
`<img src="/images/suitenav/rs-waffle.svg">`{=html}
:::

::: waffleDivider_XicE
:::

`<a href="https://rushstack.io/" class="suiteNavItem_tL2w">`{=html}Rush
Stack`</a>`{=html}`<a href="https://rushstack.io/pages/shop/" class="suiteNavItem_tL2w">`{=html}Shop`</a>`{=html}`<a href="https://rushstack.io/blog/" class="suiteNavItem_tL2w">`{=html}Blog`</a>`{=html}`<a href="https://rushstack.io/community/events/" class="suiteNavItem_tL2w">`{=html}Events`</a>`{=html}
:::::

::: {role="region" aria-label="Skip to main content"}
`<a class="skipToContent_GM1k" href="#docusaurus_skipToContent_fallback">`{=html}Skip
to main content`</a>`{=html}
:::

<nav aria-label="Main" class="navbar navbar--fixed-top">

::::::: navbar__inner
:::: navbar__items
<button aria-label="Toggle navigation bar" aria-expanded="false" class="navbar__toggle clean-btn" type="button">
<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
`<path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M4 7h22M4 15h22M4 23h22">`{=html}`</path>`{=html}
</svg>
</button>
`<a class="navbar__brand" href="/">`{=html}

::: navbar__logo
`<img src="/images/site/tsdoc-white.svg" alt="TSDoc" class="themedImage_NYNv themedImage--light_CMkm">`{=html}`<img src="/images/site/tsdoc-white.svg" alt="TSDoc" class="themedImage_NYNv themedImage--dark_ftc7">`{=html}
:::

`<b class="navbar__title text--truncate">`{=html}`</b>`{=html}`</a>`{=html}
::::

:::: {.navbar__items .navbar__items--right}
`<a aria-current="page" class="navbar__item navbar__link navbar__link--active" href="/">`{=html}Intro`</a>`{=html}`<a class="navbar__item navbar__link" href="/pages/tags/alpha/">`{=html}Tags`</a>`{=html}`<a class="navbar__item navbar__link" href="/pages/contributing/github/">`{=html}GitHub`</a>`{=html}`<a class="navbar__item navbar__link" href="/pages/resources/help/">`{=html}Help`</a>`{=html}`<a class="navbar__item navbar__link tsdoc-playground-button" href="/play/">`{=html}Playground`</a>`{=html}

::: searchBox_c7qw
<button type="button" class="DocSearch DocSearch-Button" aria-label="Search">
[`<svg width="20" height="20" class="DocSearch-Search-Icon" viewBox="0 0 20 20">`{=html}`<path d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">`{=html}`</path>`{=html}`</svg>`{=html}[Search]{.DocSearch-Button-Placeholder}]{.DocSearch-Button-Container}[]{.DocSearch-Button-Keys}
</button>
:::
::::
:::::::

::: {.navbar-sidebar__backdrop role="presentation"}
:::

</nav>

::::::::::::::::::::::::::: {#docusaurus_skipToContent_fallback .main-wrapper .mainWrapper_jTsy .docsWrapper_tRBZ}
<button aria-label="Scroll back to top" class="clean-btn theme-back-to-top-button backToTopButton_bgm4" type="button">
</button>

:::::::::::::::::::::::::: docPage_gWUA
<aside class="theme-doc-sidebar-container docSidebarContainer_vOfZ">

:::::::::: sidebarViewport_th8S
::::::::: sidebar_xgnR
<nav aria-label="Docs sidebar" class="menu thin-scrollbar menu_XQ0u">
<ul class="theme-doc-sidebar-menu menu__list">
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link">`{=html}Introduction`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/">`{=html}What is
TSDoc?`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/intro/approach/">`{=html}Approach`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/intro/using_tsdoc/">`{=html}How
can I use TSDoc?`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/intro/roadmap/">`{=html}Project
roadmap`</a>`{=html}
</li>
</ul>
</li>
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link">`{=html}NPM packages`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/packages/tsdoc/">`{=html}@microsoft/tsdoc`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/packages/tsdoc-config/">`{=html}@microsoft/tsdoc-config`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/packages/eslint-plugin-tsdoc/">`{=html}eslint-plugin-tsdoc`</a>`{=html}
</li>
</ul>
</li>
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link menu__link--active">`{=html}TSDoc
spec`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link menu__link--active" aria-current="page" tabindex="0" href="/pages/spec/overview/">`{=html}TSDoc
spec`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/spec/tag_kinds/">`{=html}Tag
kinds`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/spec/standardization_groups/">`{=html}Standardization
groups`</a>`{=html}
</li>
</ul>
</li>
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link">`{=html}Tag reference`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/alpha/">`{=html}@alpha`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/beta/">`{=html}@beta`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/decorator/">`{=html}@decorator`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/deprecated/">`{=html}@deprecated`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/defaultvalue/">`{=html}@defaultValue`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/eventproperty/">`{=html}@eventProperty`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/example/">`{=html}@example`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/experimental/">`{=html}@experimental`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/inheritdoc/">`{=html}@inheritDoc`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/internal/">`{=html}@internal`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/label/">`{=html}@label`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/link/">`{=html}@link`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/override/">`{=html}@override`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/packagedocumentation/">`{=html}@packageDocumentation`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/param/">`{=html}@param`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/privateremarks/">`{=html}@privateRemarks`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/public/">`{=html}@public`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/readonly/">`{=html}@readonly`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/remarks/">`{=html}@remarks`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/returns/">`{=html}@returns`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/sealed/">`{=html}@sealed`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/see/">`{=html}@see`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/throws/">`{=html}@throws`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/typeparam/">`{=html}@typeParam`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/tags/virtual/">`{=html}@virtual`</a>`{=html}
</li>
</ul>
</li>
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link">`{=html}Contributing`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/contributing/github/">`{=html}GitHub`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/contributing/building/">`{=html}Building
the projects`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/contributing/pr_checklist/">`{=html}Submitting
a pull request`</a>`{=html}
</li>
</ul>
</li>
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link">`{=html}Resources`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/resources/help/">`{=html}Getting
help`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/play/">`{=html}TSDoc
Playground`</a>`{=html}
</li>
</ul>
</li>
</ul>
</nav>
:::::::::
::::::::::

</aside>
<main class="docMainContainer_cKen">

::::::::::::::::: {.container .padding-top--md .padding-bottom--lg}
:::::::::::::::: row
::::::::::::: {.col .docItemCol__Pkv}
:::::::::::: docItemContainer_Bu3E
<article>

::: {.tocCollapsible_L2mx .theme-doc-toc-mobile .tocMobile_O5LO}
<button type="button" class="clean-btn tocCollapsibleButton_sGbr">
On this page
</button>
:::

::: {.theme-doc-markdown .markdown}
<header>
<h1>
TSDoc spec
</h1>
</header>
<p>
Technical details for the TSDoc syntax are tracked by \"RFC\" issues
with the
`<a href="https://github.com/microsoft/tsdoc/issues?q=is%3Aissue+is%3Aopen+label%3A%22request+for+comments%22+" target="_blank" rel="noopener noreferrer">`{=html}Request
for Comments`</a>`{=html} GitHub label.
</p>
<p>
The
`<a href="/pages/packages/tsdoc/">`{=html}@microsoft/tsdoc`</a>`{=html}
package provides a feature complete reference implementation of a
parser, and many syntax details are explained in the code comments for
its source code.
</p>
<blockquote>
<p>
This section is still under development. We\'ll post more detail soon.
</p>
</blockquote>
<h3 class="anchor anchorWithStickyNavbar_Dpyi" id="declaration-references">
Declaration
references`<a href="#declaration-references" class="hash-link" aria-label="Direct link to Declaration references" title="Direct link to Declaration references">`{=html}​`</a>`{=html}
</h3>
<p>
The `<strong>`{=html}\"old\"`</strong>`{=html} syntax for declaration
references is detailed in this technical note:
</p>
<p>
`<a href="https://github.com/microsoft/tsdoc/blob/main/spec/code-snippets/DeclarationReferences.ts" target="_blank" rel="noopener noreferrer">`{=html}/spec/code-snippets/DeclarationReferences.ts`</a>`{=html}
</p>
<p>
The `<strong>`{=html}\"new\"`</strong>`{=html} syntax for declaration
references is described in this grammar:
</p>
<p>
`<a href="https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/beta/DeclarationReference.grammarkdown" target="_blank" rel="noopener noreferrer">`{=html}/tsdoc/src/beta/DeclarationReference.grammarkdown`</a>`{=html}
</p>
<p>
Examples of the new syntax can be found in the
`<a href="https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/beta/__tests__/DeclarationReference.test.ts" target="_blank" rel="noopener noreferrer">`{=html}DeclarationReference.test.ts`</a>`{=html}
file.
</p>
:::

<footer class="theme-doc-footer docusaurus-mt-lg">

::::: {.theme-doc-footer-edit-meta-row .row}
::: col
`<a href="https://github.com/microsoft/rushstack-websites/tree/main/websites/tsdoc.org/docs/pages/spec/overview.md" target="_blank" rel="noreferrer noopener" class="theme-edit-this-page">`{=html}`<svg fill="currentColor" height="20" width="20" viewBox="0 0 40 40" class="iconEdit_M5Ac" aria-hidden="true">`{=html}`<g>`{=html}`<path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z">`{=html}`</path>`{=html}`</g>`{=html}`</svg>`{=html}Edit
this page`</a>`{=html}
:::

::: {.col .lastUpdated_OkfV}
:::
:::::

</footer>
</article>
<nav class="pagination-nav docusaurus-mt-lg" aria-label="Docs pages navigation">
`<a class="pagination-nav__link pagination-nav__link--prev" href="/pages/packages/eslint-plugin-tsdoc/">`{=html}

::: pagination-nav__sublabel
Previous
:::

::: pagination-nav__label
eslint-plugin-tsdoc
:::

`</a>`{=html}`<a class="pagination-nav__link pagination-nav__link--next" href="/pages/spec/tag_kinds/">`{=html}

::: pagination-nav__sublabel
Next
:::

::: pagination-nav__label
Tag kinds
:::

`</a>`{=html}
</nav>
::::::::::::
:::::::::::::

:::: {.col .col--3}
::: {.tableOfContents_KF6W .thin-scrollbar .theme-doc-toc-desktop}
<ul class="table-of-contents table-of-contents__left-border">
<li>
`<a href="#declaration-references" class="table-of-contents__link toc-highlight">`{=html}Declaration
references`</a>`{=html}
</li>
</ul>
:::
::::
::::::::::::::::
:::::::::::::::::

</main>
::::::::::::::::::::::::::
:::::::::::::::::::::::::::

<footer class="footer">

::::: {.container .container-fluid}
:::: {.footer__bottom .text--center}
::: footer__copyright
© 2024 Microsoft
:::
::::
:::::

</footer>
:::::::::::::::::::::::::::::::::::::::::

<script src="/assets/js/runtime~main.50027455.js"></script>
<script src="/assets/js/main.cf755157.js"></script>
</body>
</html>
