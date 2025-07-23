\<!doctype html\>
<html lang="en" dir="ltr" class="docs-wrapper docs-doc-page docs-version-current plugin-docs plugin-id-default docs-doc-id-pages/intro/using_tsdoc">
<head>
<meta charset="UTF-8">
<meta name="generator" content="Docusaurus v2.3.1">
<title data-rh="true">
How can I use TSDoc? \| TSDoc
</title>
<meta data-rh="true" name="viewport" content="width=device-width,initial-scale=1">
<meta data-rh="true" name="twitter:card" content="summary_large_image">
<meta data-rh="true" property="og:image" content="https://tsdoc.org/images/site/tsdoc-ograph.png">
<meta data-rh="true" name="twitter:image" content="https://tsdoc.org/images/site/tsdoc-ograph.png">
<meta data-rh="true" property="og:url" content="https://tsdoc.org/pages/intro/using_tsdoc/">
<meta data-rh="true" name="docusaurus_locale" content="en">
<meta data-rh="true" name="docsearch:language" content="en">
<meta data-rh="true" name="docusaurus_version" content="current">
<meta data-rh="true" name="docusaurus_tag" content="docs-default-current">
<meta data-rh="true" name="docsearch:version" content="current">
<meta data-rh="true" name="docsearch:docusaurus_tag" content="docs-default-current">
<meta data-rh="true" property="og:title" content="How can I use TSDoc? | TSDoc">
<meta data-rh="true" name="description" content="By itself, the @microsoft/tsdoc package is not a documentation solution you can use directly. It is an engine component used by other tools such as API Extractor. The NPM dependency report is an easy way to find tools that implement TSDoc.">
<meta data-rh="true" property="og:description" content="By itself, the @microsoft/tsdoc package is not a documentation solution you can use directly. It is an engine component used by other tools such as API Extractor. The NPM dependency report is an easy way to find tools that implement TSDoc.">

`<link data-rh="true" rel="icon" href="/images/site/favicon.ico">`{=html}`<link data-rh="true" rel="canonical" href="https://tsdoc.org/pages/intro/using_tsdoc/">`{=html}`<link data-rh="true" rel="alternate" href="https://tsdoc.org/pages/intro/using_tsdoc/" hreflang="en">`{=html}`<link data-rh="true" rel="alternate" href="https://tsdoc.org/pages/intro/using_tsdoc/" hreflang="x-default">`{=html}`<link rel="search" type="application/opensearchdescription+xml" title="TSDoc" href="/opensearch.xml">`{=html}

`<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic">`{=html}`<link rel="stylesheet" href="/assets/css/styles.2fa9719f.css">`{=html}
`<link rel="preload" href="/assets/js/runtime~main.50027455.js" as="script">`{=html}
`<link rel="preload" href="/assets/js/main.cf755157.js" as="script">`{=html}
</head>
<body class="navigation-with-keyboard">
<script>!function(){function t(t){document.documentElement.setAttribute("data-theme",t)}var e=function(){var t=null;try{t=localStorage.getItem("theme")}catch(t){}return t}();t(null!==e?e:"light")}()</script>

:::::::::::::::::::::::::::::::::::::: {#__docusaurus}
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

:::::::::::::::::::::::: {#docusaurus_skipToContent_fallback .main-wrapper .mainWrapper_jTsy .docsWrapper_tRBZ}
<button aria-label="Scroll back to top" class="clean-btn theme-back-to-top-button backToTopButton_bgm4" type="button">
</button>

::::::::::::::::::::::: docPage_gWUA
<aside class="theme-doc-sidebar-container docSidebarContainer_vOfZ">

:::::::::: sidebarViewport_th8S
::::::::: sidebar_xgnR
<nav aria-label="Docs sidebar" class="menu thin-scrollbar menu_XQ0u">
<ul class="theme-doc-sidebar-menu menu__list">
<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1 menu__list-item">

::: menu__list-item-collapsible
`<a class="menu__link menu__link--active">`{=html}Introduction`</a>`{=html}
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
`<a class="menu__link menu__link--active" aria-current="page" tabindex="0" href="/pages/intro/using_tsdoc/">`{=html}How
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
`<a class="menu__link">`{=html}TSDoc spec`</a>`{=html}
:::

<ul style="display:block;overflow:visible;height:auto" class="menu__list">
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link" tabindex="0" href="/pages/spec/overview/">`{=html}TSDoc
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

:::::::::::::: {.container .padding-top--md .padding-bottom--lg}
::::::::::::: row
:::::::::::: {.col .docItemCol__Pkv}
::::::::::: docItemContainer_Bu3E
<article>

::: {.theme-doc-markdown .markdown}
<header>
<h1>
How can I use TSDoc?
</h1>
</header>
<p>
By itself, the `<strong>`{=html}@microsoft/tsdoc`</strong>`{=html}
package is not a documentation solution you can use directly. It is an
engine component used by other tools such as
`<a href="https://api-extractor.com/pages/tsdoc/doc_comment_syntax/" target="_blank" rel="noopener noreferrer">`{=html}API
Extractor`</a>`{=html}. The
`<a href="https://www.npmjs.com/browse/depended/@microsoft/tsdoc" target="_blank" rel="noopener noreferrer">`{=html}NPM
dependency report`</a>`{=html} is an easy way to find tools that
implement TSDoc.
</p>
<p>
Even if you have not enabled a documentation tool yet for your project,
adopting the TSDoc conventions will make your code comments more
compatible with other tools.
</p>
<p>
👉 `<strong>`{=html}To check for mistakes in your
code,`</strong>`{=html} install the
`<a href="https://www.npmjs.com/package/eslint-plugin-tsdoc" target="_blank" rel="noopener noreferrer">`{=html}eslint-plugin-tsdoc`</a>`{=html}
plugin for ESLint
</p>
<p>
👉 `<strong>`{=html}To see how your comments would be
rendered`</strong>`{=html} by a compatible documentation tool, try
pasting your `<code>`{=html}/\*\* \*/`</code>`{=html} comment into the
`<a href="/play/">`{=html}TSDoc Playground`</a>`{=html}!
</p>
<p>
👉 `<strong>`{=html}Implementing a tool that needs to parse doc
comments?`</strong>`{=html} The
`<a href="https://www.npmjs.com/package/@microsoft/tsdoc" target="_blank" rel="noopener noreferrer">`{=html}@microsoft/tsdoc`</a>`{=html}
package provides a professional quality parser. The
`<a href="https://github.com/microsoft/tsdoc/tree/main/api-demo" target="_blank" rel="noopener noreferrer">`{=html}api-demo`</a>`{=html}
folder contains sample code showing how to invoke the parser.
</p>
<p>
👉 `<strong>`{=html}Have an idea for an improvement?`</strong>`{=html}
We\'re using
`<a href="https://github.com/Microsoft/tsdoc/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc" target="_blank" rel="noopener noreferrer">`{=html}GitHub
issues`</a>`{=html} to discuss the TSDoc specification, library design,
and project roadmap.
</p>
:::

<footer class="theme-doc-footer docusaurus-mt-lg">

::::: {.theme-doc-footer-edit-meta-row .row}
::: col
`<a href="https://github.com/microsoft/rushstack-websites/tree/main/websites/tsdoc.org/docs/pages/intro/using_tsdoc.md" target="_blank" rel="noreferrer noopener" class="theme-edit-this-page">`{=html}`<svg fill="currentColor" height="20" width="20" viewBox="0 0 40 40" class="iconEdit_M5Ac" aria-hidden="true">`{=html}`<g>`{=html}`<path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z">`{=html}`</path>`{=html}`</g>`{=html}`</svg>`{=html}Edit
this page`</a>`{=html}
:::

::: {.col .lastUpdated_OkfV}
:::
:::::

</footer>
</article>
<nav class="pagination-nav docusaurus-mt-lg" aria-label="Docs pages navigation">
`<a class="pagination-nav__link pagination-nav__link--prev" href="/pages/intro/approach/">`{=html}

::: pagination-nav__sublabel
Previous
:::

::: pagination-nav__label
Approach
:::

`</a>`{=html}`<a class="pagination-nav__link pagination-nav__link--next" href="/pages/intro/roadmap/">`{=html}

::: pagination-nav__sublabel
Next
:::

::: pagination-nav__label
Project roadmap
:::

`</a>`{=html}
</nav>
:::::::::::
::::::::::::
:::::::::::::
::::::::::::::

</main>
:::::::::::::::::::::::
::::::::::::::::::::::::

<footer class="footer">

::::: {.container .container-fluid}
:::: {.footer__bottom .text--center}
::: footer__copyright
© 2024 Microsoft
:::
::::
:::::

</footer>
::::::::::::::::::::::::::::::::::::::

<script src="/assets/js/runtime~main.50027455.js"></script>
<script src="/assets/js/main.cf755157.js"></script>
</body>
</html>
