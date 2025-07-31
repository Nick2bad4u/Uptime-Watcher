<h1 class="text-3xl font-semibold">

Basic usage
</h1>

<div class="prose">

<p>

This page will walk you through the basics of creating schemas, parsing data, and using inferred types. For complete documentation on Zod's schema API, refer to <a href="/api">Defining schemas</a>.
</p>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="defining-a-schema">

<a data-card="" class="peer" href="?id=defining-a-schema">Defining a schema</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Before you can do anything else, you need to define a schema. For the purposes of this guide, we'll use a simple object schema.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rf54uvbl5b»-content-zod" data-state="active" id="radix-«Rf54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rf54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rf54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rf54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rf54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">; </span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Player</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  username: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  xp: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rf54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rf54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<!-- -->

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="parsing-data">

<a data-card="" class="peer" href="?id=parsing-data">Parsing data</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Given any Zod schema, use <code>.parse</code> to validate an input. If it's valid, Zod returns a strongly-typed <em>deep clone</em> of the input.
</p>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Player.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ username: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;billie&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, xp: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; returns { username: &quot;billie&quot;, xp: 100 }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Note</strong> — If your schema uses certain asynchronous APIs like <code>async</code> <a href="#refine">refinements</a> or <a href="/api#transform">transforms</a>, you'll need to use the <code>.parseAsync()</code> method instead.
</p>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Player.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parseAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ username: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;billie&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, xp: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="handling-errors">

<a data-card="" class="peer" href="?id=handling-errors">Handling errors</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

When validation fails, the <code>.parse()</code> method will throw a <code>ZodError</code> instance with granular information about the validation issues.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1d54uvbl5b»-content-zod" data-state="active" id="radix-«R1d54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1d54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1d54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1d54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1d54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  Player.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ username: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">42</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, xp: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;100&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(error){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(error </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">instanceof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ZodError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">){</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    error.issues; </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    /* [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">      {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        expected: &#x27;string&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        code: &#x27;invalid_type&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        path: [ &#x27;username&#x27; ],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        message: &#x27;Invalid input: expected string&#x27;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">      },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">      {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        expected: &#x27;number&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        code: &#x27;invalid_type&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        path: [ &#x27;xp&#x27; ],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">        message: &#x27;Invalid input: expected number&#x27;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">      }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    ] */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1d54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1d54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To avoid a <code>try/catch</code> block, you can use the <code>.safeParse()</code> method to get back a plain result object containing either the successfully parsed data or a <code>ZodError</code>. The result type is a <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" rel="noreferrer noopener" target="_blank">discriminated union</a>, so you can handle both cases conveniently.
</p>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Player.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ username: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">42</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, xp: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;100&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.success) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  result.error;   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ZodError instance</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  result.data;    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { username: string; xp: number }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span></code></pre>

</div>

</div>

</div>

</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Note</strong> — If your schema uses certain asynchronous APIs like <code>async</code> <a href="#refine">refinements</a> or <a href="/api#transform">transforms</a>, you'll need to use the <code>.safeParseAsync()</code> method instead.
</p>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParseAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="inferring-types">

<a data-card="" class="peer" href="?id=inferring-types">Inferring types</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Zod infers a static type from your schema definitions. You can extract this type with the <code>z.infer\<\></code> utility and use it however you like.
</p>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Player</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  username: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  xp: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// extract the inferred type</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Player</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Player&gt;;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// use it in your code</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> player</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Player</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { username: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;billie&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, xp: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> };</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

In some cases, the input & output types of a schema can diverge. For instance, the <code>.transform()</code> API can convert the input from one type to another. In these cases, you can extract the input and output types independently:
</p>

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

<button type="button" class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground transition-opacity group-hover:opacity-100 [&amp;_svg]:size-3.5 [@media(hover:hover)]:opacity-0 absolute right-2 top-2 z-[2] backdrop-blur-md" aria-label="Copy Text">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check transition-transform scale-0">

<path d="M20 6 9 17l-5-5"></path>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy absolute transition-transform">

<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>

</button>

<div class="overflow-hidden" dir="ltr" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">

<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>

<div class="size-full rounded-[inherit] max-h-[600px]" data-radix-scroll-area-viewport="" style="overflow-x:hidden;overflow-y:hidden">

<div style="min-width:100%;display:table">

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> mySchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MySchemaIn</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> mySchema&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; string</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MySchemaOut</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">output</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> mySchema&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// equivalent to z.infer&lt;typeof mySchema&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// number</span></span></code></pre>

</div>

</div>

</div>

</figure>

<hr/>

<p>

Now that we have the basics covered, let's jump into the Schema API.
</p>

</div>

