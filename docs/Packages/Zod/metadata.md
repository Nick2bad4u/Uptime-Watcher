<h1 class="text-3xl font-semibold">

Metadata and registries
</h1>

<div class="prose">

<p>

It's often useful to associate a schema with some additional <em>metadata</em> for documentation, code generation, AI structured outputs, form validation, and other purposes.
</p>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="registries">

<a data-card="" class="peer" href="?id=registries">Registries</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Metadata in Zod is handled via <em>registries</em>. Registries are collections of schemas, each associated with some <em>strongly-typed</em> metadata. To create a simple registry:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRegistry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">registry</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;{ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }&gt;();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To register, lookup, and remove schemas from this registry:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> mySchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySchema, { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;A cool schema!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">has</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySchema); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySchema); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; { description: &quot;A cool schema!&quot; }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">remove</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySchema);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">clear</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// wipe registry</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

TypeScript enforces that the metadata for each schema matches the registry's <strong>metadata type</strong>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySchema, { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;A cool schema!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySchema, { description: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">123</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

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

<strong>Special handling for <code>id</code></strong> — Zod registries treat the <code>id</code> property specially. An <code>Error</code> will be thrown if multiple schemas are registered with the same <code>id</code> value. This is true for all registries, including the global registry.
</p>

</div>

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="register">

<a data-card="" class="peer" href="?id=register"><code>.register()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Note</strong> — This method is special in that it does not return a new schema; instead, it returns the original schema. No other Zod method does this! That includes <code>.meta()</code> and <code>.describe()</code> (documented below) which return a new instance.
</p>

</div>

</div>

</div>

<p>

Schemas provide a <code>.register()</code> method to more conveniently add it to a registry.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> mySchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">mySchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">register</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(myRegistry, { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;A cool schema!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; mySchema</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This lets you define metadata "inline" in your schemas.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> mySchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">register</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(myRegistry, { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;The user&#x27;s name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  age: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">register</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(myRegistry, { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;The user&#x27;s age&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">})</span></span></code></pre>

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

If a registry is defined without a metadata type, you can use it as a generic "collection", no metadata required.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRegistry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">registry</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="metadata">

<a data-card="" class="peer" href="?id=metadata">Metadata</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="zglobalregistry">

<a data-card="" class="peer" href="?id=zglobalregistry"><code>z.globalRegistry</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

For convenience, Zod provides a global registry (<code>z.globalRegistry</code>) that can be used to store metadata for JSON Schema generation or other purposes. It accepts the following metadata:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> GlobalMeta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  example</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  examples</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">[] </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// array-style (JSON Schema)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Record</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">&lt;</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, { value: unknown; [k: string]: unknown }</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// map-style (OpenAPI)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  deprecated</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  [</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">k</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To register some metadata in <code>z.globalRegistry</code> for a schema:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> emailSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">register</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.globalRegistry, { </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;email_address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Email address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Your email address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  examples: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="bfd9d6cdcccb91d3decccbffdac7ded2cfd3da91dcd0d2">[email&#160;protected]</a>&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="meta">

<a data-card="" class="peer" href="?id=meta"><code>.meta()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

For a more convenient approach, use the <code>.meta()</code> method to register a schema in <code>z.globalRegistry</code>.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R3554uvbl5b»-content-zod" data-state="active" id="radix-«R3554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R3554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R3554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R3554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R3554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> emailSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;email_address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Email address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Please enter a valid email address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R3554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R3554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Calling <code>.meta()</code> without an argument will <em>retrieve</em> the metadata for a schema.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">emailSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; { id: &quot;email_address&quot;, title: &quot;Email address&quot;, ... }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Metadata is associated with a <em>specific schema instance.</em> This is important to keep in mind, especially since Zod methods are immutable—they always return a new instance.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> A</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;A cool string&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">A</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; { hello: &quot;true&quot; }</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> B</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> A</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">_</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; undefined</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="describe">

<a data-card="" class="peer" href="?id=describe"><code>.describe()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

The <code>.describe()</code> method still exists for compatibility with Zod 3, but <code>.meta()</code> is now the recommended approach.
</p>

</div>

</div>

</div>

<p>

The <code>.describe()</code> method is a shorthand for registering a schema in <code>z.globalRegistry</code> with just a <code>description</code> field.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R4554uvbl5b»-content-zod" data-state="active" id="radix-«R4554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R4554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R4554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R4554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R4554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> emailSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">emailSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">describe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;An email address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// equivalent to</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">emailSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;An email address&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R4554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R4554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="custom-registries">

<a data-card="" class="peer" href="?id=custom-registries">Custom registries</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

You've already seen a simple example of a custom registry:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRegistry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.registry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">{ description: string };</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Let's look at some more advanced patterns.
</p>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="referencing-inferred-types">

<a data-card="" class="peer" href="?id=referencing-inferred-types">Referencing inferred types</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

It's often valuable for the metadata type to reference the <em>inferred type</em> of a schema. For instance, you may want an <code>examples</code> field to contain examples of the schema's output.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyMeta</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">examples</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">$output</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">[] };</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRegistry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">registry</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">MyMeta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { examples: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;world&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">] });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { examples: [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">] });</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The special symbol <code>z.$`output</code> is a reference to the schemas inferred output type (<code>z.infer&lt;typeof schema&gt;</code>). Similarly you can use <code>z.`$input</code> to reference the input type.
</p>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="constraining-schema-types">

<a data-card="" class="peer" href="?id=constraining-schema-types">Constraining schema types</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Pass a second generic to <code>z.registry()</code> to constrain the schema types that can be added to a registry. This registry only accepts string schemas.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRegistry</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">registry</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;{ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">description</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ZodString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;A number&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myRegistry.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;A number&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//             ^ &#x27;ZodNumber&#x27; is not assignable to parameter of type &#x27;ZodString&#x27; </span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

