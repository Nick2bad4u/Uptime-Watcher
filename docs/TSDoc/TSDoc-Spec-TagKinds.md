\<!doctype html\>
<html lang="en" dir="ltr" class="docs-wrapper docs-doc-page docs-version-current plugin-docs plugin-id-default docs-doc-id-pages/spec/tag_kinds">
<head>
<meta charset="UTF-8">
<meta name="generator" content="Docusaurus v2.3.1">
<title data-rh="true">
Tag kinds \| TSDoc
</title>
<meta data-rh="true" name="viewport" content="width=device-width,initial-scale=1">
<meta data-rh="true" name="twitter:card" content="summary_large_image">
<meta data-rh="true" property="og:image" content="https://tsdoc.org/images/site/tsdoc-ograph.png">
<meta data-rh="true" name="twitter:image" content="https://tsdoc.org/images/site/tsdoc-ograph.png">
<meta data-rh="true" property="og:url" content="https://tsdoc.org/pages/spec/tag_kinds/">
<meta data-rh="true" name="docusaurus_locale" content="en">
<meta data-rh="true" name="docsearch:language" content="en">
<meta data-rh="true" name="docusaurus_version" content="current">
<meta data-rh="true" name="docusaurus_tag" content="docs-default-current">
<meta data-rh="true" name="docsearch:version" content="current">
<meta data-rh="true" name="docsearch:docusaurus_tag" content="docs-default-current">
<meta data-rh="true" property="og:title" content="Tag kinds | TSDoc">
<meta data-rh="true" name="description" content="TSDoc distinguishes three kinds of tags: Block tags, modifier tags, and inline tags.">
<meta data-rh="true" property="og:description" content="TSDoc distinguishes three kinds of tags: Block tags, modifier tags, and inline tags.">

`<link data-rh="true" rel="icon" href="/images/site/favicon.ico">`{=html}`<link data-rh="true" rel="canonical" href="https://tsdoc.org/pages/spec/tag_kinds/">`{=html}`<link data-rh="true" rel="alternate" href="https://tsdoc.org/pages/spec/tag_kinds/" hreflang="en">`{=html}`<link data-rh="true" rel="alternate" href="https://tsdoc.org/pages/spec/tag_kinds/" hreflang="x-default">`{=html}`<link rel="search" type="application/opensearchdescription+xml" title="TSDoc" href="/opensearch.xml">`{=html}

`<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic">`{=html}`<link rel="stylesheet" href="/assets/css/styles.2fa9719f.css">`{=html}
`<link rel="preload" href="/assets/js/runtime~main.50027455.js" as="script">`{=html}
`<link rel="preload" href="/assets/js/main.cf755157.js" as="script">`{=html}
</head>
<body class="navigation-with-keyboard">
<script>!function(){function t(t){document.documentElement.setAttribute("data-theme",t)}var e=function(){var t=null;try{t=localStorage.getItem("theme")}catch(t){}return t}();t(null!==e?e:"light")}()</script>

:::::::::::::::::::::::::::::::::::::::::::::::::: {#__docusaurus}
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

:::::::::::::::::::::::::::::::::::: {#docusaurus_skipToContent_fallback .main-wrapper .mainWrapper_jTsy .docsWrapper_tRBZ}
<button aria-label="Scroll back to top" class="clean-btn theme-back-to-top-button backToTopButton_bgm4" type="button">
</button>

::::::::::::::::::::::::::::::::::: docPage_gWUA
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
`<a class="menu__link" tabindex="0" href="/pages/spec/overview/">`{=html}TSDoc
spec`</a>`{=html}
</li>
<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-2 menu__list-item">
`<a class="menu__link menu__link--active" aria-current="page" tabindex="0" href="/pages/spec/tag_kinds/">`{=html}Tag
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

:::::::::::::::::::::::::: {.container .padding-top--md .padding-bottom--lg}
::::::::::::::::::::::::: row
:::::::::::::::::::::: {.col .docItemCol__Pkv}
::::::::::::::::::::: docItemContainer_Bu3E
<article>

::: {.tocCollapsible_L2mx .theme-doc-toc-mobile .tocMobile_O5LO}
<button type="button" class="clean-btn tocCollapsibleButton_sGbr">
On this page
</button>
:::

:::::::::::: {.theme-doc-markdown .markdown}
<header>
<h1>
Tag kinds
</h1>
</header>
<p>
TSDoc distinguishes three kinds of tags: Block tags, modifier tags, and
inline tags.
</p>
<p>
Tag names start with an at-sign (`<code>`{=html}@`</code>`{=html})
followed by ASCII letters using \"camelCase\" capitalization.
</p>
<p>
A tag is defined to have exactly one of these three forms. For example,
the `<code>`{=html}@link`</code>`{=html} tag must not be written as a
block tag because it is defined to be an inline tag.
</p>
<h2 class="anchor anchorWithStickyNavbar_Dpyi" id="block-tags">
Block
tags`<a href="#block-tags" class="hash-link" aria-label="Direct link to Block tags" title="Direct link to Block tags">`{=html}​`</a>`{=html}
</h2>
<p>
Block tags should always appear as the first element on a line. In
normalized form, a block tag should be the only element on its line,
except for certain tags that assign special meaning to the first line of
text. For example, the
`<a href="/pages/tags/example/">`{=html}@example`</a>`{=html} and
`<a href="/pages/tags/throws/">`{=html}@throws`</a>`{=html} tags
interpret their first line as a section title.
</p>
<p>
All text following a block tag, up until the start of the next block tag
or modifier tag, is considered to be the block tag\'s
`<strong>`{=html}tag content`</strong>`{=html}. The content may include
Markdown elements and inline tags. Any content appearing prior to the
first block tag is interpreted as the special \"summary\" section.
</p>
<p>
`<strong>`{=html}Examples of block tags:`</strong>`{=html}
</p>

::::: {.language-ts .codeBlockContainer_HN2s .theme-code-block style="--prism-color:#000000;--prism-background-color:#ffffff"}
:::: codeBlockContent_YIEk
<pre tabindex="0" class="prism-code language-ts codeBlock_wIUF thin-scrollbar"><code class="codeBlockLines_c4cI"><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">/**</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * This is the special summary section.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> *</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * @remarks</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * This is a standalone block.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> *</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * @example Logging a warning</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * ```ts</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * logger.warn(&#x27;Something happened&#x27;);</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * ```</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> *</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * @example Logging an error</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * ```ts</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * logger.error(&#x27;Something happened&#x27;);</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * ```</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> */</span><br></span></code></pre>

::: buttonGroup_hg4O
<button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn">
[`<svg class="copyButtonIcon_AOu5" viewBox="0 0 24 24">`{=html}`<path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z">`{=html}`</path>`{=html}`</svg>`{=html}`<svg class="copyButtonSuccessIcon_rA7l" viewBox="0 0 24 24">`{=html}`<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z">`{=html}`</path>`{=html}`</svg>`{=html}]{.copyButtonIcons_NJJd
aria-hidden="true"}
</button>
:::
::::
:::::

<h2 class="anchor anchorWithStickyNavbar_Dpyi" id="modifier-tags">
Modifier
tags`<a href="#modifier-tags" class="hash-link" aria-label="Direct link to Modifier tags" title="Direct link to Modifier tags">`{=html}​`</a>`{=html}
</h2>
<p>
Modifier tags indicate a special quality of an API. Modifier tags are
generally parsed the same as block tags, with the expectation that their
tag content is empty. If tag content is found after a modifier tag, a
parser may choose to discard it, or (in situations where it improves
compatibility) to associate it with the previous block tag.
</p>
<p>
In normalized form, the modifier tags appear on a single line at the
bottom of the doc comment.
</p>
<p>
`<strong>`{=html}Examples of modifier tags:`</strong>`{=html}
</p>

::::: {.language-ts .codeBlockContainer_HN2s .theme-code-block style="--prism-color:#000000;--prism-background-color:#ffffff"}
:::: codeBlockContent_YIEk
<pre tabindex="0" class="prism-code language-ts codeBlock_wIUF thin-scrollbar"><code class="codeBlockLines_c4cI"><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">/**</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * This is the special summary section.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> *</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * @remarks</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * This is a standalone block.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> *</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> * @public @sealed</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)"> */</span><br></span></code></pre>

::: buttonGroup_hg4O
<button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn">
[`<svg class="copyButtonIcon_AOu5" viewBox="0 0 24 24">`{=html}`<path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z">`{=html}`</path>`{=html}`</svg>`{=html}`<svg class="copyButtonSuccessIcon_rA7l" viewBox="0 0 24 24">`{=html}`<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z">`{=html}`</path>`{=html}`</svg>`{=html}]{.copyButtonIcons_NJJd
aria-hidden="true"}
</button>
:::
::::
:::::

<p>
In the above example, `<code>`{=html}@public`</code>`{=html} and
`<code>`{=html}@sealed`</code>`{=html} are modifier tags.
</p>
<h2 class="anchor anchorWithStickyNavbar_Dpyi" id="inline-tags">
Inline
tags`<a href="#inline-tags" class="hash-link" aria-label="Direct link to Inline tags" title="Direct link to Inline tags">`{=html}​`</a>`{=html}
</h2>
<p>
Inline tags appear as content elements along with Markdown expressions.
Inline tags are always surrounded by `<code>`{=html}{`</code>`{=html}
and `<code>`{=html}}`</code>`{=html} characters. The
`<code>`{=html}@link`</code>`{=html} and
`<code>`{=html}@inheritDoc`</code>`{=html} tags are examples of inline
tags.
</p>
<p>
`<strong>`{=html}Examples of inline tags:`</strong>`{=html}
</p>

::::: {.language-ts .codeBlockContainer_HN2s .theme-code-block style="--prism-color:#000000;--prism-background-color:#ffffff"}
:::: codeBlockContent_YIEk
<pre tabindex="0" class="prism-code language-ts codeBlock_wIUF thin-scrollbar"><code class="codeBlockLines_c4cI"><span class="token-line" style="color:#000000"><span class="token keyword" style="color:rgb(0, 0, 255)">class</span><span class="token plain"> </span><span class="token class-name" style="color:rgb(38, 127, 153)">Book</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">{</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">  </span><span class="token comment" style="color:rgb(0, 128, 0)">/**</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   * Writes the book information into a JSON file.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   *</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   * @remarks</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   * This method saves the book information to a JSON file conforming to the standardized</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   * {@link http://example.com/ | Example Book Interchange Format}.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   */</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">  </span><span class="token keyword" style="color:rgb(0, 0, 255)">public</span><span class="token plain"> </span><span class="token function" style="color:rgb(0, 0, 255)">writeFile</span><span class="token punctuation" style="color:rgb(4, 81, 165)">(</span><span class="token plain">options</span><span class="token operator" style="color:rgb(0, 0, 0)">?</span><span class="token operator" style="color:rgb(0, 0, 0)">:</span><span class="token plain"> IWriteFileOptions</span><span class="token punctuation" style="color:rgb(4, 81, 165)">)</span><span class="token operator" style="color:rgb(0, 0, 0)">:</span><span class="token plain"> </span><span class="token keyword" style="color:rgb(0, 0, 255)">void</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">{</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">    </span><span class="token punctuation" style="color:rgb(4, 81, 165)">.</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">.</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">.</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">  </span><span class="token punctuation" style="color:rgb(4, 81, 165)">}</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain" style="display:inline-block"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">  </span><span class="token comment" style="color:rgb(0, 128, 0)">/**</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   * {@inheritDoc Book.writeFile}</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   * @deprecated Use {@link Book.writeFile} instead.</span><br></span><span class="token-line" style="color:#000000"><span class="token comment" style="color:rgb(0, 128, 0)">   */</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">  </span><span class="token keyword" style="color:rgb(0, 0, 255)">public</span><span class="token plain"> </span><span class="token function" style="color:rgb(0, 0, 255)">save</span><span class="token punctuation" style="color:rgb(4, 81, 165)">(</span><span class="token punctuation" style="color:rgb(4, 81, 165)">)</span><span class="token operator" style="color:rgb(0, 0, 0)">:</span><span class="token plain"> </span><span class="token keyword" style="color:rgb(0, 0, 255)">void</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">{</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">    </span><span class="token punctuation" style="color:rgb(4, 81, 165)">.</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">.</span><span class="token plain"> </span><span class="token punctuation" style="color:rgb(4, 81, 165)">.</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain">  </span><span class="token punctuation" style="color:rgb(4, 81, 165)">}</span><span class="token plain"></span><br></span><span class="token-line" style="color:#000000"><span class="token plain"></span><span class="token punctuation" style="color:rgb(4, 81, 165)">}</span><br></span></code></pre>

::: buttonGroup_hg4O
<button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn">
[`<svg class="copyButtonIcon_AOu5" viewBox="0 0 24 24">`{=html}`<path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z">`{=html}`</path>`{=html}`</svg>`{=html}`<svg class="copyButtonSuccessIcon_rA7l" viewBox="0 0 24 24">`{=html}`<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z">`{=html}`</path>`{=html}`</svg>`{=html}]{.copyButtonIcons_NJJd
aria-hidden="true"}
</button>
:::
::::
:::::

<h2 class="anchor anchorWithStickyNavbar_Dpyi" id="see-also">
See
also`<a href="#see-also" class="hash-link" aria-label="Direct link to See also" title="Direct link to See also">`{=html}​`</a>`{=html}
</h2>
<ul>
<li>
`<a href="https://github.com/microsoft/tsdoc/issues/21" target="_blank" rel="noopener noreferrer">`{=html}RFC
#21`</a>`{=html}: Support for custom TSDoc tags
</li>
</ul>
::::::::::::

<footer class="theme-doc-footer docusaurus-mt-lg">

::::: {.theme-doc-footer-edit-meta-row .row}
::: col
`<a href="https://github.com/microsoft/rushstack-websites/tree/main/websites/tsdoc.org/docs/pages/spec/tag_kinds.md" target="_blank" rel="noreferrer noopener" class="theme-edit-this-page">`{=html}`<svg fill="currentColor" height="20" width="20" viewBox="0 0 40 40" class="iconEdit_M5Ac" aria-hidden="true">`{=html}`<g>`{=html}`<path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z">`{=html}`</path>`{=html}`</g>`{=html}`</svg>`{=html}Edit
this page`</a>`{=html}
:::

::: {.col .lastUpdated_OkfV}
:::
:::::

</footer>
</article>
<nav class="pagination-nav docusaurus-mt-lg" aria-label="Docs pages navigation">
`<a class="pagination-nav__link pagination-nav__link--prev" href="/pages/spec/overview/">`{=html}

::: pagination-nav__sublabel
Previous
:::

::: pagination-nav__label
TSDoc spec
:::

`</a>`{=html}`<a class="pagination-nav__link pagination-nav__link--next" href="/pages/spec/standardization_groups/">`{=html}

::: pagination-nav__sublabel
Next
:::

::: pagination-nav__label
Standardization groups
:::

`</a>`{=html}
</nav>
:::::::::::::::::::::
::::::::::::::::::::::

:::: {.col .col--3}
::: {.tableOfContents_KF6W .thin-scrollbar .theme-doc-toc-desktop}
<ul class="table-of-contents table-of-contents__left-border">
<li>
`<a href="#block-tags" class="table-of-contents__link toc-highlight">`{=html}Block
tags`</a>`{=html}
</li>
<li>
`<a href="#modifier-tags" class="table-of-contents__link toc-highlight">`{=html}Modifier
tags`</a>`{=html}
</li>
<li>
`<a href="#inline-tags" class="table-of-contents__link toc-highlight">`{=html}Inline
tags`</a>`{=html}
</li>
<li>
`<a href="#see-also" class="table-of-contents__link toc-highlight">`{=html}See
also`</a>`{=html}
</li>
</ul>
:::
::::
:::::::::::::::::::::::::
::::::::::::::::::::::::::

</main>
:::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::

<footer class="footer">

::::: {.container .container-fluid}
:::: {.footer__bottom .text--center}
::: footer__copyright
© 2024 Microsoft
:::
::::
:::::

</footer>
::::::::::::::::::::::::::::::::::::::::::::::::::

<script src="/assets/js/runtime~main.50027455.js"></script>
<script src="/assets/js/main.cf755157.js"></script>
</body>
</html>
