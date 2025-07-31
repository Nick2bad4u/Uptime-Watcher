<h1 class="text-3xl font-semibold">

Defining schemas
</h1>

<div class="prose">

<p>

To validate data, you must first define a <em>schema</em>. Schemas represent <em>types</em>, from simple primitive values to complex nested objects and arrays.
</p>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="primitives">

<a data-card="" class="peer" href="?id=primitives">Primitives</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

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
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// primitive types</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">symbol</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="coercion">

<a data-card="" class="peer" href="?id=coercion">Coercion</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To coerce input data to the appropriate type, use <code>z.coerce</code> instead:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// String(input)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Number(input)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Boolean(input)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// BigInt(input)</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The coerced variant of these schemas attempts to convert the input value to the appropriate type.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;tuna&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">42</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;42&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;true&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;null&quot;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The input type of these coerced schemas is <code>unknown</code> by default. To specify a more specific input type, pass a generic parameter:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> A</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> AInput</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> A</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; number</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> B</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.coerce.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> BInput</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; number</span></span></code></pre>

</div>

</div>

</div>

</figure>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" data-orientation="vertical">

<div class="group/accordion relative scroll-m-20" data-state="closed" data-orientation="vertical">

<h3 data-orientation="vertical" data-state="closed" class="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent">

<button type="button" aria-controls="radix-«R21b54uvbl5b»" aria-expanded="false" data-state="closed" data-orientation="vertical" id="radix-«R1b54uvbl5b»" class="flex flex-1 items-center gap-2 px-4 py-2.5 text-start focus-visible:outline-none" data-radix-collection-item>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90">

<path d="m9 18 6-6-6-6"></path>
</svg>

How coercion works in Zod
</button>

</h3>

<div id="radix-«R21b54uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" data-state="closed" hidden="" role="region" aria-labelledby="radix-«R1b54uvbl5b»" data-orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="literals">

<a data-card="" class="peer" href="?id=literals">Literals</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Literal schemas represent a <a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types" rel="noreferrer noopener" target="_blank">literal type</a>, like <code>"hello world"</code> or <code>5</code>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> tuna</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> twelve</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> twobig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> tru</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To represent the JavaScript literals <code>null</code> and <code>undefined</code>:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// equivalent to z.undefined()</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To allow multiple literal values:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> colors</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;red&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;green&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;blue&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">colors.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;green&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">colors.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;yellow&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To extract the set of allowed values from a literal schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R2f54uvbl5b»-content-zod" data-state="active" id="radix-«R2f54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R2f54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R2f54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R2f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">colors.values; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; Set&lt;&quot;red&quot; | &quot;green&quot; | &quot;blue&quot;&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R2f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="strings">

<a data-card="" class="peer" href="?id=strings">Strings</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<!-- -->

<p>

Zod provides a handful of built-in string validation and transform APIs. To perform some common string validations:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R2t54uvbl5b»-content-zod" data-state="active" id="radix-«R2t54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R2t54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R2t54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R2t54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2t54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">max</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">regex</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-z]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">+$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">startsWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;aaa&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">endsWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;zzz&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">includes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;---&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uppercase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">lowercase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R2t54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2t54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To perform some simple string transforms:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// trim whitespace</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">toLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// toLowerCase</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">toUpperCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// toUpperCase</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">normalize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// normalize unicode characters</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R3554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R3554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="string-formats">

<a data-card="" class="peer" href="?id=string-formats">String formats</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To validate against some common string formats:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">hostname</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">emoji</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// validates a single emoji character</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">base64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">base64url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">jwt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nanoid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">cuid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">cuid2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ulid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ipv4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ipv6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">cidrv4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ipv4 CIDR block</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">cidrv6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ipv6 CIDR block</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">duration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="emails">

<a data-card="" class="peer" href="?id=emails">Emails</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To validate email addresses:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

By default, Zod uses a comparatively strict email regex designed to validate normal email addresses containing common characters. It's roughly equivalent to the rules enforced by Gmail. To learn more about this regex, refer to <a href="https://colinhacks.com/essays/reasonable-email-regex" rel="noreferrer noopener" target="_blank">this post</a>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">(?!</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\.</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">)(?!</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">*</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\.\.</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">)(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-z0-9_&#x27;+\-</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">*</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">)</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-z0-9_+-]</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">@(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-z0-9][a-z0-9</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">*</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\.</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">+</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-z]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">{2,}$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">i</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To customize the email validation behavior, you can pass a custom regular expression to the <code>pattern</code> param.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ pattern:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> /</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">your regex here</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Zod exports several useful regexes you could use.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Zod&#x27;s default email regex</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ pattern: z.regexes.email }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// equivalent</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the regex used by browsers to validate input[type=email] fields</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ pattern: z.regexes.html5Email });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the classic emailregex.com regex (RFC 5322)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ pattern: z.regexes.rfc5322Email });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// a loose regex that allows Unicode (good for intl emails)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ pattern: z.regexes.unicodeEmail });</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="uuids">

<a data-card="" class="peer" href="?id=uuids">UUIDs</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To validate UUIDs:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To specify a particular UUID version:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// supports &quot;v1&quot;, &quot;v2&quot;, &quot;v3&quot;, &quot;v4&quot;, &quot;v5&quot;, &quot;v6&quot;, &quot;v7&quot;, &quot;v8&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ version: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;v4&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// for convenience</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuidv4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuidv6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuidv7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The RFC 9562/4122 UUID spec requires the first two bits of byte 8 to be <code>10</code>. Other UUID-like identifiers do not enforce this constraint. To validate any UUID-like identifier:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">guid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="urls">

<a data-card="" class="peer" href="?id=urls">URLs</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To validate any WHATWG-compatible URL:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;https://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;http://localhost&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;mailto:<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="d2bcbda0b7a2beab92a8bdb6fcb6b7a4">[email&#160;protected]</a>&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

As you can see this is quite permissive. Internally this uses the <code>new URL()</code> constructor to validate inputs; this behavior may differ across platforms and runtimes but it's the mostly rigorous way to validate URIs/URLs on any given JS runtime/engine.
</p>

<p>

To validate the hostname against a specific regex:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ hostname:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> /</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">example</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\.</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">com</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;https://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;https://zombo.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To validate the protocol against a specific regex, use the <code>protocol</code> param.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ protocol:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> /</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">https</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;https://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;http://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

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

<strong>Web URLs</strong> — In many cases, you'll want to validate Web URLs specifically. Here's the recommended schema for doing so:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> httpUrl</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  protocol:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> /</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">https</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  hostname: z.regexes.domain</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This restricts the protocol to <code>http</code>/<code>https</code> and ensures the hostname is a valid domain name with the <code>z.regexes.domain</code> regular expression:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-zA-Z0-9]</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">(?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-zA-Z0-9-]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">{0,61}</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-zA-Z0-9]</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">?</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold">\.</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">+</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">[a-zA-Z]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">{2,}$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

</div>

</div>

<p>

To normalize URLs, use the <code>normalize</code> flag. This will overwrite the input value with the <a href="https://chatgpt.com/share/6881547f-bebc-800f-9093-f5981e277c2c" rel="noreferrer noopener" target="_blank">normalized URL</a> returned by <code>new URL()</code>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;HTTP://ExAmPle.com:80/./a/../b?X=1#f oo&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">).href</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;http://example.com/b?X=1#f%20oo&quot;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="iso-datetimes">

<a data-card="" class="peer" href="?id=iso-datetimes">ISO datetimes</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

As you may have noticed, Zod string includes a few date/time related validations. These validations are regular expression based, so they are not as strict as a full date/time library. However, they are very convenient for validating user input.
</p>

<p>

The <code>z.iso.datetime()</code> method enforces ISO 8601; by default, no timezone offsets are allowed:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> datetime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00.123Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00.123456Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅ (arbitrary precision)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00+02:00&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ (offsets not allowed)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ (local not allowed)</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To allow timezone offsets:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> datetime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ offset: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// allows timezone offsets</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00+02:00&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// basic offsets not allowed</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00+02&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00+0200&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Z is still supported</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">datetime.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅ </span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To allow unqualified (timezone-less) datetimes:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ local: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:01&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅ seconds optional</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To constrain the allowable time <code>precision</code>. By default, seconds are optional and arbitrary sub-second precision is allowed.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> a</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">a.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">a.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">a.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00.123Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> b</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// minute precision (no seconds)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">b.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">b.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">b.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00.123Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> c</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// second precision only</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">c.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">c.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">c.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00.123Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">datetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// millisecond precision only</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">d.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">d.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">d.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01T06:15:00.123Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="iso-dates">

<a data-card="" class="peer" href="?id=iso-dates">ISO dates</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

The <code>z.iso.date()</code> method validates strings in the format <code>YYYY-MM-DD</code>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> date</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">date.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-01&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">date.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-1-1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">date.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2020-01-32&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="iso-times">

<a data-card="" class="peer" href="?id=iso-times">ISO times</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

The <code>z.iso.time()</code> method validates strings in the format <code>HH:MM\[:SS\[.s+\]\]</code>. By default seconds are optional, as are sub-second deciams.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> time</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">time.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;03:15&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">time.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;03:15:00&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">time.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;03:15:00.9999999&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅ (arbitrary precision)</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

No offsets of any kind are allowed.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">time.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;03:15:00Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ (no `Z` allowed)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">time.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;03:15:00+02:00&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ (no offsets allowed)</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Use the <code>precision</code> parameter to constrain the allowable decimal precision.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// HH:MM (minute precision)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// HH:MM:SS (second precision)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// HH:MM:SS.s (decisecond precision)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// HH:MM:SS.ss (centisecond precision)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ precision: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// HH:MM:SS.sss (millisecond precision)</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="ip-addresses">

<a data-card="" class="peer" href="?id=ip-addresses">IP addresses</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> ipv4</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ipv4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">ipv4.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;192.168.0.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> ipv6</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ipv6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">ipv6.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2001:db8:85a3::8a2e:370:7334&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="ip-blocks-cidr">

<a data-card="" class="peer" href="?id=ip-blocks-cidr">IP blocks (CIDR)</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Validate IP address ranges specified with <a href="https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing" rel="noreferrer noopener" target="_blank">CIDR notation</a>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> cidrv4</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">cidrv4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">cidrv4.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;192.168.0.0/24&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> cidrv6</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">cidrv6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">cidrv6.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2001:db8::/32&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="jwts">

<a data-card="" class="peer" href="?id=jwts">JWTs</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Validate <a href="https://jwt.io/" rel="noreferrer noopener" target="_blank">JSON Web Tokens</a>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">jwt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">jwt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ alg: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;HS256&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="template-literals">

<a data-card="" class="peer" href="?id=template-literals">Template literals</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>New in Zod 4</strong>
</p>

</div>

</div>

</div>

<p>

To define a template literal schema:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">templateLiteral</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello, &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `hello, ${string}!`</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The <code>z.templateLiteral</code> API can handle any number of string literals (e.g. <code>"hello"</code>) and schemas. Any schema with an inferred type that's assignable to <code>string \| number \| bigint \| boolean \| null \| undefined</code> can be passed.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">templateLiteral</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hi there&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `hi there`</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">templateLiteral</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;email: &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() ]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `email: ${string}`</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">templateLiteral</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;high&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) ]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `high5`</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">templateLiteral</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([ z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;grassy&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)) ]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `grassy` | `null`</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">templateLiteral</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([ z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;px&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;em&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;rem&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]) ]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `${number}px` | `${number}em` | `${number}rem`</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="numbers">

<a data-card="" class="peer" href="?id=numbers">Numbers</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Use <code>z.number()</code> to validate numbers. It allows any finite number.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">3.14</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">NaN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">Infinity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Zod implements a handful of number-specific validations:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rbp54uvbl5b»-content-zod" data-state="active" id="radix-«Rbp54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rbp54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rbp54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rbp54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rbp54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">gte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);                     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// alias .min(5)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">lte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);                     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// alias .max(5)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">positive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();       </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nonnegative</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">negative</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nonpositive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">multipleOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);              </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// alias .step(5)</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rbp54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rbp54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

If (for some reason) you want to validate <code>NaN</code>, use <code>z.nan()</code>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nan</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">NaN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);              </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nan</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;anything else&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="integers">

<a data-card="" class="peer" href="?id=integers">Integers</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To validate integers:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// restricts to safe integer range</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">int32</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// restrict to int32 range</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="bigints">

<a data-card="" class="peer" href="?id=bigints">BigInts</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To validate BigInts:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Zod includes a handful of bigint-specific validations.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rd154uvbl5b»-content-zod" data-state="active" id="radix-«Rd154uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rd154uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rd154uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rd154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rd154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">gt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">gte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);                    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// alias `.min(5n)`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">lt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">lte</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);                    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// alias `.max(5n)`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">positive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nonnegative</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">negative</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nonpositive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">bigint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">multipleOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);             </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// alias `.step(5n)`</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rd154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rd154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="booleans">

<a data-card="" class="peer" href="?id=booleans">Booleans</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To validate boolean values:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="dates">

<a data-card="" class="peer" href="?id=dates">Dates</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Use <code>z.date()</code> to validate <code>Date</code> instances.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// success: true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;2022-01-12T06:15:00.000Z&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// success: false</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To customize the error message:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">issue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> issue.input </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> undefined</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> ?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Required&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> :</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Invalid date&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Zod provides a handful of date-specific validations.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Re954uvbl5b»-content-zod" data-state="active" id="radix-«Re954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Re954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Re954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Re954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Re954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;1900-01-01&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">), { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too old!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">max</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too young!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Re954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Re954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div id="zod-enums" style="height:0px">

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="enums">

<a data-card="" class="peer" href="?id=enums">Enums</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Use <code>z.enum</code> to validate inputs against a fixed set of allowable <em>string</em> values.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">FishEnum.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;Salmon&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">FishEnum.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Swordfish&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; ❌</span></span></code></pre>

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

Careful — If you declare your string array as a variable, Zod won't be able to properly infer the exact values of each element.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> fish</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">];</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(fish);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> FishEnum&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// string</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To fix this, always pass the array directly into the <code>z.enum()</code> function, or use <a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions" rel="noreferrer noopener" target="_blank"><code>as const</code></a>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> fish</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">as</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(fish);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> FishEnum&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// &quot;Salmon&quot; | &quot;Tuna&quot; | &quot;Trout&quot;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

</div>

</div>

<p>

Enum-like object literals (<code>{ \[key: string\]: string \| number }</code>) are supported.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Fish</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  Salmon: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  Tuna: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">as</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> const</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Fish)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">FishEnum.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;Salmon&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">FishEnum.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Swordfish&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

You can also pass in an externally-declared TypeScript enum.
</p>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Zod 4</strong> — This replaces the <code>z.nativeEnum()</code> API in Zod 3.
</p>

<p>

Note that using TypeScript's <code>enum</code> keyword is <a href="https://www.totaltypescript.com/why-i-dont-like-typescript-enums" rel="noreferrer noopener" target="_blank">not recommended</a>.
</p>

</div>

</div>

</div>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">enum</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Fish</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">  Salmon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">  Tuna</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">  Trout</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Fish);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="enum">

<a data-card="" class="peer" href="?id=enum"><code>.enum</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To extract the schema's values as an enum-like object:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rft54uvbl5b»-content-zod" data-state="active" id="radix-«Rft54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rft54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rft54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rft54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rft54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">FishEnum.enum;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; { Salmon: &quot;Salmon&quot;, Tuna: &quot;Tuna&quot;, Trout: &quot;Trout&quot; }</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rft54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rft54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="exclude">

<a data-card="" class="peer" href="?id=exclude"><code>.exclude()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To create a new enum schema, excluding certain values:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rg954uvbl5b»-content-zod" data-state="active" id="radix-«Rg954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rg954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rg954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rg954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rg954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> TunaOnly</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> FishEnum.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">exclude</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rg954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rg954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="extract">

<a data-card="" class="peer" href="?id=extract"><code>.extract()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To create a new enum schema, extracting certain values:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rgl54uvbl5b»-content-zod" data-state="active" id="radix-«Rgl54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rgl54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rgl54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rgl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rgl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> FishEnum</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> SalmonAndTroutOnly</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> FishEnum.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">extract</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Salmon&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Trout&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rgl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rgl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="stringbool">

<a data-card="" class="peer" href="?id=stringbool">Stringbools</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>💎 New in Zod 4</strong>
</p>

</div>

</div>

</div>

<p>

In some cases (e.g. parsing environment variables) it's valuable to parse certain string "boolish" values to a plain <code>boolean</code> value. To support this, Zod 4 introduces <code>z.stringbool()</code>:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> strbool</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">stringbool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;yes&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;on&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;y&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;enabled&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; true</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;no&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;off&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;n&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;disabled&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; false</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">strbool.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">/* anything else */</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ZodError&lt;[{ code: &quot;invalid_value&quot; }]&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To customize the truthy and falsy values:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// these are the defaults</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">stringbool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  truthy: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;yes&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;on&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;y&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;enabled&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  falsy: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;no&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;off&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;n&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;disabled&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

By default the schema is <em>case-insensitive</em>; all inputs are converted to lowercase before comparison to the <code>truthy</code>/<code>falsy</code> values. To make it case-sensitive:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">stringbool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  case: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;sensitive&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="optionals">

<a data-card="" class="peer" href="?id=optionals">Optionals</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To make a schema <em>optional</em> (that is, to allow <code>undefined</code> inputs).
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Ri154uvbl5b»-content-zod" data-state="active" id="radix-«Ri154uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Ri154uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Ri154uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Ri154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ri154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">optional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;yoda&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// or z.literal(&quot;yoda&quot;).optional()</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Ri154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ri154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

This returns a <code>ZodOptional</code> instance that wraps the original schema. To extract the inner schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Ri954uvbl5b»-content-zod" data-state="active" id="radix-«Ri954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Ri954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Ri954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Ri954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ri954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">optionalYoda.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">unwrap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ZodLiteral&lt;&quot;yoda&quot;&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Ri954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ri954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="nullables">

<a data-card="" class="peer" href="?id=nullables">Nullables</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To make a schema <em>nullable</em> (that is, to allow <code>null</code> inputs).
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Ril54uvbl5b»-content-zod" data-state="active" id="radix-«Ril54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Ril54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Ril54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Ril54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ril54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;yoda&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// or z.literal(&quot;yoda&quot;).nullable()</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Ril54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ril54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

This returns a <code>ZodNullable</code> instance that wraps the original schema. To extract the inner schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rit54uvbl5b»-content-zod" data-state="active" id="radix-«Rit54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rit54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rit54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rit54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rit54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">nullableYoda.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">unwrap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ZodLiteral&lt;&quot;yoda&quot;&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rit54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rit54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="nullish">

<a data-card="" class="peer" href="?id=nullish">Nullish</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To make a schema <em>nullish</em> (both optional and nullable):
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rj954uvbl5b»-content-zod" data-state="active" id="radix-«Rj954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rj954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rj954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rj954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rj954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> nullishYoda</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nullish</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;yoda&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">));</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rj954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rj954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Refer to the TypeScript manual for more about the concept of <a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing" rel="noreferrer noopener" target="_blank">nullish</a>.
</p>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="unknown">

<a data-card="" class="peer" href="?id=unknown">Unknown</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Zod aims to mirror TypeScript's type system one-to-one. As such, Zod provides APIs to represent the following special types:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// allows any values</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">any</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// inferred type: `any`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// inferred type: `unknown`</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="never">

<a data-card="" class="peer" href="?id=never">Never</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

No value will pass validation.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">never</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// inferred type: `never`</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="objects">

<a data-card="" class="peer" href="?id=objects">Objects</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To define an object type:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  // all properties are required by default</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Person</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    age: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Person</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Person&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  // =&gt; { name: string; age: number; }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

By default, all properties are required. To make certain properties optional:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rkp54uvbl5b»-content-zod" data-state="active" id="radix-«Rkp54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rkp54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rkp54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rkp54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rkp54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Dog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  age: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">optional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Dog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Yeller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rkp54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rkp54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

By default, unrecognized keys are <em>stripped</em> from the parsed result:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Dog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Yeller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, extraKey: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; { name: &quot;Yeller&quot; }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="zstrictobject">

<a data-card="" class="peer" href="?id=zstrictobject"><code>z.strictObject</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To define a <em>strict</em> schema that throws an error when unknown keys are found:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> StrictDog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">strictObject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">StrictDog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Yeller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, extraKey: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ throws</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="zlooseobject">

<a data-card="" class="peer" href="?id=zlooseobject"><code>z.looseObject</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To define a <em>loose</em> schema that allows unknown keys to pass through:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> LooseDog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">looseObject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Dog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Yeller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, extraKey: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; { name: &quot;Yeller&quot;, extraKey: true }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="catchall">

<a data-card="" class="peer" href="?id=catchall"><code>.catchall()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To define a <em>catchall schema</em> that will be used to validate any unrecognized keys:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rm554uvbl5b»-content-zod" data-state="active" id="radix-«Rm554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rm554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rm554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rm554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rm554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> DogWithStrings</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  age: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">optional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">catchall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">DogWithStrings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Yeller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, extraKey: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;extraValue&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">DogWithStrings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Yeller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, extraKey: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">42</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rm554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rm554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="shape">

<a data-card="" class="peer" href="?id=shape"><code>.shape</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To access the internal schemas:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rmh54uvbl5b»-content-zod" data-state="active" id="radix-«Rmh54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rmh54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rmh54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rmh54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rmh54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Dog.shape.name; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; string schema</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Dog.shape.age; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; number schema</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rmh54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rmh54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="keyof">

<a data-card="" class="peer" href="?id=keyof"><code>.keyof()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To create a <code>ZodEnum</code> schema from the keys of an object schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rmt54uvbl5b»-content-zod" data-state="active" id="radix-«Rmt54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rmt54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rmt54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rmt54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rmt54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> keySchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Dog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">keyof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; ZodEnum&lt;[&quot;name&quot;, &quot;age&quot;]&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rmt54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rmt54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="extend">

<a data-card="" class="peer" href="?id=extend"><code>.extend()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To add additional fields to an object schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rn954uvbl5b»-content-zod" data-state="active" id="radix-«Rn954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rn954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rn954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rn954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rn954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> DogWithBreed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Dog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">extend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  breed: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rn954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rn954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

This API can be used to overwrite existing fields! Be careful with this power! If the two schemas share keys, B will override A.
</p>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Alternative: spread syntax</strong> — You can alternatively avoid <code>.extend()</code> altogether by creating a new object schema entirely. This makes the strictness level of the resulting schema visually obvious.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> DogWithBreed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// or z.strictObject() or z.looseObject()...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Dog.shape,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  breed: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

You can also use this to merge multiple objects in one go.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> DogWithBreed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Animal.shape,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Pet.shape,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  breed: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This approach has a few advantages:
</p>

<ol>

<li>

It uses language-level features (<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax" rel="noreferrer noopener" target="_blank">spread syntax</a>) instead of library-specific APIs
</li>

<li>

The same syntax works in Zod and Zod Mini
</li>

<li>

It's more <code>tsc</code>-efficient — the <code>.extend()</code> method can be expensive on large schemas, and due to <a href="https://github.com/microsoft/TypeScript/pull/61505" rel="noreferrer noopener" target="_blank">a TypeScript limitation</a> it gets quadratically more expensive when calls are chained
</li>

<li>

If you wish, you can change the strictness level of the resulting schema by using <code>z.strictObject()</code> or <code>z.looseObject()</code>
</li>

</ol>

</div>

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="pick">

<a data-card="" class="peer" href="?id=pick"><code>.pick()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Inspired by TypeScript's built-in <code>Pick</code> and <code>Omit</code> utility types, Zod provides dedicated APIs for picking and omitting certain keys from an object schema.
</p>

<p>

Starting from this initial schema:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Recipe</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  title: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  description: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">optional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  ingredients: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { title: string; description?: string | undefined; ingredients: string[] }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To pick certain keys:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Ro954uvbl5b»-content-zod" data-state="active" id="radix-«Ro954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Ro954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Ro954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Ro954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ro954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> JustTheTitle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Recipe.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">pick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ title: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Ro954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Ro954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="omit">

<a data-card="" class="peer" href="?id=omit"><code>.omit()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To omit certain keys:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rol54uvbl5b»-content-zod" data-state="active" id="radix-«Rol54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rol54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rol54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rol54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rol54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> RecipeNoId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Recipe.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">omit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ id: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rol54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rol54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="partial">

<a data-card="" class="peer" href="?id=partial"><code>.partial()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

For convenience, Zod provides a dedicated API for making some or all properties optional, inspired by the built-in TypeScript utility type <a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype" rel="noreferrer noopener" target="_blank"><code>Partial</code></a>.
</p>

<p>

To make all fields optional:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rp554uvbl5b»-content-zod" data-state="active" id="radix-«Rp554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rp554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rp554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rp554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rp554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> PartialRecipe</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Recipe.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">partial</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { title?: string | undefined; description?: string | undefined; ingredients?: string[] | undefined }</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rp554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rp554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To make certain properties optional:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rpd54uvbl5b»-content-zod" data-state="active" id="radix-«Rpd54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rpd54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rpd54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rpd54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rpd54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> RecipeOptionalIngredients</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Recipe.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">partial</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  ingredients: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { title: string; description?: string | undefined; ingredients?: string[] | undefined }</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rpd54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rpd54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="required">

<a data-card="" class="peer" href="?id=required"><code>.required()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Zod provides an API for making some or all properties <em>required</em>, inspired by TypeScript's <a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#requiredtype" rel="noreferrer noopener" target="_blank"><code>Required</code></a> utility type.
</p>

<p>

To make all properties required:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rpt54uvbl5b»-content-zod" data-state="active" id="radix-«Rpt54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rpt54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rpt54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rpt54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rpt54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> RequiredRecipe</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Recipe.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">required</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { title: string; description: string; ingredients: string[] }</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rpt54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rpt54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To make certain properties required:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rq554uvbl5b»-content-zod" data-state="active" id="radix-«Rq554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rq554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rq554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rq554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rq554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> RecipeRequiredDescription</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Recipe.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">required</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({description: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { title: string; description: string; ingredients: string[] }</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rq554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rq554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="recursive-objects">

<a data-card="" class="peer" href="?id=recursive-objects">Recursive objects</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To define a self-referential type, use a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get" rel="noreferrer noopener" target="_blank">getter</a> on the key. This lets JavaScript resolve the cyclical schema at runtime.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Category</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  get</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> subcategories</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Category)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Category</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Category&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { name: string; subcategories: Category[] }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card">

<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

Though recursive schemas are supported, passing cyclical data into Zod will cause an infinite loop.
</p>

</div>

</div>

</div>

<p>

You can also represent <em>mutually recursive types</em>:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> User</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  email: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">email</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  get</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> posts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Post)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Post</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  title: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  get</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> author</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> User</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

All object APIs (<code>.pick()</code>, <code>.omit()</code>, <code>.required()</code>, <code>.partial()</code>, etc.) work as you'd expect.
</p>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="circularity-errors">

<a data-card="" class="peer" href="?id=circularity-errors">Circularity errors</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Due to TypeScript limitations, recursive type inference can be finicky, and it only works in certain scenarios. Some more complicated types may trigger recursive type errors like this:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Activity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  get</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> subactivities</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // ^ ❌ &#x27;subactivities&#x27; implicitly has return type &#x27;any&#x27; because it does not</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // have a return type annotation and is referenced directly or indirectly</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // in one of its return expressions.ts(7023)</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Activity));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

In these cases, you can resolve the error with a type annotation on the offending getter:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Activity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  get</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> subactivities</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ZodNullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">ZodArray</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Activity&gt;&gt; {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">nullable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Activity));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<!-- -->

<!-- -->

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="arrays">

<a data-card="" class="peer" href="?id=arrays">Arrays</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To define an array schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rs554uvbl5b»-content-zod" data-state="active" id="radix-«Rs554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rs554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rs554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rs554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rs554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> stringArray</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// or z.string().array()</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rs554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rs554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To access the inner schema for an element of the array.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rsd54uvbl5b»-content-zod" data-state="active" id="radix-«Rsd54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rsd54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rsd54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rsd54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rsd54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">stringArray.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">unwrap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; string schema</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rsd54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rsd54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Zod implements a number of array-specific validations:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rsl54uvbl5b»-content-zod" data-state="active" id="radix-«Rsl54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rsl54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rsl54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rsl54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rsl54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// must contain 5 or more items</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">max</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// must contain 5 or fewer items</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// must contain 5 items exactly</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rsl54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rsl54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<!-- -->

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="tuples">

<a data-card="" class="peer" href="?id=tuples">Tuples</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Unlike arrays, tuples are typically fixed-length arrays that specify different schemas for each index.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> MyTuple</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">tuple</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyTuple</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> MyTuple&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// [string, number, boolean]</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To add a variadic ("rest") argument:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> variadicTuple</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">tuple</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()], z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; [string, ...number[]];</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="unions">

<a data-card="" class="peer" href="?id=unions">Unions</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Union types (<code>A \| B</code>) represent a logical "OR". Zod union schemas will check the input against each option in order. The first value that validates successfully is returned.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> stringOrNumber</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">union</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()]);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// string | number</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">stringOrNumber.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;foo&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// passes</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">stringOrNumber.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">14</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// passes</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To extract the internal option schemas:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rtv54uvbl5b»-content-zod" data-state="active" id="radix-«Rtv54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rtv54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rtv54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rtv54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rtv54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">stringOrNumber.options; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// [ZodString, ZodNumber]</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rtv54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rtv54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<!-- -->

<!-- -->

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="discriminated-unions">

<a data-card="" class="peer" href="?id=discriminated-unions">Discriminated unions</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

A <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" rel="noreferrer noopener" target="_blank">discriminated union</a> is a special kind of union in which a) all the options are object schemas that b) share a particular key (the "discriminator"). Based on the value of the discriminator key, TypeScript is able to "narrow" the type signature as you'd expect.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyResult</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">status</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;success&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">status</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;failed&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">error</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> };</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> handleResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(result.status </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;success&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">){</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    result.data; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    result.error; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

You could represent it with a regular <code>z.union()</code>. But regular unions are <em>naive</em>—they check the input against each option in order and return the first one that passes. This can be slow for large unions.
</p>

<p>

So Zod provides a <code>z.discriminatedUnion()</code> API that uses a <em>discriminator key</em> to make parsing more efficient.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> MyResult</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">discriminatedUnion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;status&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ status: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;success&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">), data: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ status: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;failed&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">), error: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<!-- -->

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" data-orientation="vertical">

<div class="group/accordion relative scroll-m-20" data-state="closed" data-orientation="vertical">

<h3 data-orientation="vertical" data-state="closed" class="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent">

<button type="button" aria-controls="radix-«R2v154uvbl5b»" aria-expanded="false" data-state="closed" data-orientation="vertical" id="radix-«Rv154uvbl5b»" class="flex flex-1 items-center gap-2 px-4 py-2.5 text-start focus-visible:outline-none" data-radix-collection-item>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90">

<path d="m9 18 6-6-6-6"></path>
</svg>

Nesting discriminated unions
</button>

</h3>

<div id="radix-«R2v154uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" data-state="closed" hidden="" role="region" aria-labelledby="radix-«Rv154uvbl5b»" data-orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="intersections">

<a data-card="" class="peer" href="?id=intersections">Intersections</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Intersection types (<code>A & B</code>) represent a logical "AND".
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> a</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">union</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> b</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">union</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> c</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">intersection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(a, b);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> c</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> c&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; number</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This can be useful for intersecting two object types.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Person</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Person</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Person&gt;;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Employee</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ role: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Employee</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Employee&gt;;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> EmployedPerson</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">intersection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Person, Employee);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> EmployedPerson</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> EmployedPerson&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Person &amp; Employee</span></span></code></pre>

</div>

</div>

</div>

</figure>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card">

<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

When merging object schemas, prefer <a href="#extend"><code>A.extend(B)</code></a> over intersections. Using <code>.extend()</code> will give you a new object schema, whereas <code>z.intersection(A, B)</code> returns a <code>ZodIntersection</code> instance which lacks common object methods like <code>pick</code> and <code>omit</code>.
</p>

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="records">

<a data-card="" class="peer" href="?id=records">Records</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Record schemas are used to validate types such as <code>Record\<string, number\></code>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> IdCache</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> IdCache</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> IdCache&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Record&lt;string, string&gt;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">IdCache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  carlotta: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;77d2586b-9e8e-4ecf-8b21-ea7e0530eadd&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  jimmie: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;77d2586b-9e8e-4ecf-8b21-ea7e0530eadd&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The key schema can be any Zod schema that is assignable to <code>string \| number \| symbol</code>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Keys</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">union</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">symbol</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> AnyObject</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Keys, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Record&lt;string | number | symbol, unknown&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

To create an object schemas containing keys defined by an enum:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Keys</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;email&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Person</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Keys, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { id: string; name: string; email: string }</span></span></code></pre>

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

<strong>Zod 4</strong> — In Zod 4, if you pass a <code>z.enum</code> as the first argument to <code>z.record()</code>, Zod will exhaustively check that all enum values exist in the input as keys. This behavior agrees with TypeScript:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyRecord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;a&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;b&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRecord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyRecord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { a: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;foo&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, b: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;bar&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myRecord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> MyRecord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { a: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;foo&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ missing required key `b`</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

In Zod 3, exhaustiveness was not checked. To replicate the old behavior, use <code>z.partialRecord()</code>.
</p>

</div>

</div>

</div>

<p>

If you want a <em>partial</em> record type, use <code>z.partialRecord()</code>. This skips the special exhaustiveness checks Zod normally runs with <code>z.enum()</code> and <code>z.literal()</code> key schemas.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Keys</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">enum</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;id&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;email&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">or</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">never</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()); </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Person</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">partialRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Keys, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { id?: string; name?: string; email?: string }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" data-orientation="vertical">

<div class="group/accordion relative scroll-m-20" data-state="closed" data-orientation="vertical">

<h3 data-orientation="vertical" data-state="closed" class="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent">

<button type="button" aria-controls="radix-«R31554uvbl5b»" aria-expanded="false" data-state="closed" data-orientation="vertical" id="radix-«R11554uvbl5b»" class="flex flex-1 items-center gap-2 px-4 py-2.5 text-start focus-visible:outline-none" data-radix-collection-item>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90">

<path d="m9 18 6-6-6-6"></path>
</svg>

A note on numeric keys
</button>

</h3>

<div id="radix-«R31554uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" data-state="closed" hidden="" role="region" aria-labelledby="radix-«R11554uvbl5b»" data-orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="maps">

<a data-card="" class="peer" href="?id=maps">Maps</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> StringNumberMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> StringNumberMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> StringNumberMap&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Map&lt;string, number&gt;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> StringNumberMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;one&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">myMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;two&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">StringNumberMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(myMap);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="sets">

<a data-card="" class="peer" href="?id=sets">Sets</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> NumberSet</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> NumberSet</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> NumberSet&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Set&lt;number&gt;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> mySet</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> NumberSet</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">mySet.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">mySet.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">NumberSet.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(mySet);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Set schemas can be further constrained with the following utility methods.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R11t54uvbl5b»-content-zod" data-state="active" id="radix-«R11t54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R11t54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R11t54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R11t54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R11t54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// must contain 5 or more items</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">max</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// must contain 5 or fewer items</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// must contain 5 items exactly</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R11t54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R11t54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="files">

<a data-card="" class="peer" href="?id=files">Files</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To validate <code>File</code> instances:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R12954uvbl5b»-content-zod" data-state="active" id="radix-«R12954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R12954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R12954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R12954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R12954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> fileSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">file</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">fileSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">10_000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// minimum .size (bytes)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">fileSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">max</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1_000_000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// maximum .size (bytes)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">fileSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">mime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;image/png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// MIME type</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">fileSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">mime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;image/png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;image/jpeg&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">]); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// multiple MIME types</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R12954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R12954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="promises">

<a data-card="" class="peer" href="?id=promises">Promises</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card">

<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Deprecated</strong> — <code>z.promise()</code> is deprecated in Zod 4. There are vanishingly few valid uses cases for a <code>Promise</code> schema. If you suspect a value might be a <code>Promise</code>, simply <code>await</code> it before parsing it with Zod.
</p>

</div>

</div>

</div>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" data-orientation="vertical">

<div class="group/accordion relative scroll-m-20" data-state="closed" data-orientation="vertical">

<h3 data-orientation="vertical" data-state="closed" class="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent">

<button type="button" aria-controls="radix-«R32l54uvbl5b»" aria-expanded="false" data-state="closed" data-orientation="vertical" id="radix-«R12l54uvbl5b»" class="flex flex-1 items-center gap-2 px-4 py-2.5 text-start focus-visible:outline-none" data-radix-collection-item>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90">

<path d="m9 18 6-6-6-6"></path>
</svg>

See z.promise() documentation
</button>

</h3>

<div id="radix-«R32l54uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" data-state="closed" hidden="" role="region" aria-labelledby="radix-«R12l54uvbl5b»" data-orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="instanceof">

<a data-card="" class="peer" href="?id=instanceof">Instanceof</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

You can use <code>z.instanceof</code> to check that the input is an instance of a class. This is useful to validate inputs against classes that are exported from third-party libraries.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Test</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> TestSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">instanceof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Test);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">TestSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Test</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">TestSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;whatever&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="property">

<a data-card="" class="peer" href="?id=property">Property</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

To validate a particular property of a class instance against a Zod schema:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> blobSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">instanceof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">check</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">property</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;protocol&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">literal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;https:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> as</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Only HTTPS allowed&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">blobSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;https://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">blobSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> URL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;http://example.com&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">)); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The <code>z.property()</code> API works with any data type (but it's most useful when used in conjunction with <code>z.instanceof()</code>).
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> blobSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">check</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">property</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;length&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">blobSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello there!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">blobSchema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="refinements">

<a data-card="" class="peer" href="?id=refinements">Refinements</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Every Zod schema stores an array of <em>refinements</em>. Refinements are a way to perform custom validation that Zod doesn't provide a native API for.
</p>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="refine">

<a data-card="" class="peer" href="?id=refine"><code>.refine()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<!-- -->

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R14754uvbl5b»-content-zod" data-state="active" id="radix-«R14754uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R14754uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R14754uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R14754uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14754uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> &lt;=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> 255</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R14754uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14754uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card">

<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

Refinement functions should never throw. Instead they should return a falsy value to signal failure. Thrown errors are not caught by Zod.
</p>

</div>

</div>

</div>

<h4 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="error">

<a data-card="" class="peer" href="?id=error"><code>error</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h4>

<p>

To customize the error message:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R14n54uvbl5b»-content-zod" data-state="active" id="radix-«R14n54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R14n54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R14n54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R14n54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14n54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> 8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, { </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too short!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R14n54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R14n54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h4 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="abort">

<a data-card="" class="peer" href="?id=abort"><code>abort</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h4>

<p>

By default, validation issues from checks are considered <em>continuable</em>; that is, Zod will execute <em>all</em> checks in sequence, even if one of them causes a validation error. This is usually desirable, as it means Zod can surface as many errors as possible in one go.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R15354uvbl5b»-content-zod" data-state="active" id="radix-«R15354uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R15354uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R15354uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R15354uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15354uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> 8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too short!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">toLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Must be lowercase&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  </span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> myString.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;OH NO&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.error.issues;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">/* [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  { &quot;code&quot;: &quot;custom&quot;, &quot;message&quot;: &quot;Too short!&quot; },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  { &quot;code&quot;: &quot;custom&quot;, &quot;message&quot;: &quot;Must be lowercase&quot; }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">] */</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R15354uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15354uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To mark a particular refinement as <em>non-continuable</em>, use the <code>abort</code> parameter. Validation will terminate if the check fails.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R15b54uvbl5b»-content-zod" data-state="active" id="radix-«R15b54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R15b54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R15b54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R15b54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15b54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> myString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> 8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too short!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, abort: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">toLowerCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Must be lowercase&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, abort: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"> </span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> myString.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;OH NO&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.error</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.issues;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; [{ &quot;code&quot;: &quot;custom&quot;, &quot;message&quot;: &quot;Too short!&quot; }]</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R15b54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15b54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h4 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="path">

<a data-card="" class="peer" href="?id=path"><code>path</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h4>

<p>

To customize the error path, use the <code>path</code> parameter. This is typically only useful in the context of object schemas.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R15n54uvbl5b»-content-zod" data-state="active" id="radix-«R15n54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R15n54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R15n54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R15n54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15n54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> passwordForm</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    password: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    confirm: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> data.password </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> data.confirm, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Passwords don&#x27;t match&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    path: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;confirm&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// path of error</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  });</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R15n54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15n54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

This will set the <code>path</code> parameter in the associated issue:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R15v54uvbl5b»-content-zod" data-state="active" id="radix-«R15v54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R15v54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R15v54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R15v54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15v54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> passwordForm.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ password: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;asdf&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, confirm: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;qwer&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.error.issues;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">/* [{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  &quot;code&quot;: &quot;custom&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  &quot;path&quot;: [ &quot;confirm&quot; ],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  &quot;message&quot;: &quot;Passwords don&#x27;t match&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">}] */</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R15v54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R15v54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To define an asynchronous refinement, just pass an <code>async</code> function:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> userId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  // verify that ID exists in database</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

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

If you use async refinements, you must use the <code>.parseAsync</code> method to parse data! Otherwise Zod will throw an error.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R2l6b54uvbl5b»-content-zod" data-state="active" id="radix-«R2l6b54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R2l6b54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R2l6b54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R2l6b54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2l6b54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> userId.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parseAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;abc123&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R2l6b54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R2l6b54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>

<h4 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="when">

<a data-card="" class="peer" href="?id=when"><code>when</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h4>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Note</strong> — This is a power user feature and can absolutely be abused in ways that will increase the probability of uncaught errors originating from inside your refinements.
</p>

</div>

</div>

</div>

<p>

By default, refinements don't run if any <em>non-continuable</em> issues have already been encountered. Zod is careful to ensure the type signature of the value is correct before passing it into any refinement functions.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> 8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1234</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// invalid_type: refinement won&#x27;t be executed</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

In some cases, you want finer control over when refinements run. For instance consider this "password confirm" check:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R17354uvbl5b»-content-zod" data-state="active" id="radix-«R17354uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R17354uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R17354uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R17354uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17354uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    password: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    confirmPassword: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    anotherField: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> data.password </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> data.confirmPassword, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Passwords do not match&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    path: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;confirmPassword&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  password: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;asdf&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  confirmPassword: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;asdf&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  anotherField: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1234</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D"> // ❌ this error will prevent the password check from running</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R17354uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17354uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

An error on <code>anotherField</code> will prevent the password confirmation check from executing, even though the check doesn't depend on <code>anotherField</code>. To control when a refinement will run, use the <code>when</code> parameter:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R17b54uvbl5b»-content-zod" data-state="active" id="radix-«R17b54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R17b54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R17b54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R17b54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17b54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

<figure class="not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm shiki shiki-themes github-light github-dark has-diff" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    password: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    confirmPassword: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    anotherField: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">refine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> data.password </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> data.confirmPassword, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Passwords do not match&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    path: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;confirmPassword&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // run if password &amp; confirmPassword are valid</span></span>
<span class="line diff add"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">    when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">payload</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) { </span></span>
<span class="line diff add"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> schema </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">        .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">pick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ password: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, confirmPassword: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }) </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">        .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(payload.value).success; </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    },  </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  password: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;asdf&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  confirmPassword: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;asdf&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  anotherField: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">1234</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D"> // ❌ this error will not prevent the password check from running</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R17b54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17b54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="superrefine">

<a data-card="" class="peer" href="?id=superrefine"><code>.superRefine()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

The regular <code>.refine</code> API only generates a single issue with a <code>"custom"</code> error code, but <code>.superRefine()</code> makes it possible to create multiple issues using any of Zod's <a href="https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/errors.ts" rel="noreferrer noopener" target="_blank">internal issue types</a>.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R17n54uvbl5b»-content-zod" data-state="active" id="radix-«R17n54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R17n54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R17n54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R17n54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17n54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> UniqueStringArray</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">superRefine</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">ctx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> 3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    ctx.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">addIssue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      code: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;too_big&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      maximum: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      origin: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;array&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      inclusive: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too many items 😡&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      input: val,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> !==</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(val).size) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    ctx.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">addIssue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      code: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;custom&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">`No duplicates allowed.`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      input: val,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R17n54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R17n54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="check">

<a data-card="" class="peer" href="?id=check"><code>.check()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Note</strong> — The <code>.check()</code> API is a more low-level API that's generally more complex than <code>.superRefine()</code>. It can be faster in performance-sensitive code paths, but it's also more verbose.
</p>

</div>

</div>

</div>

<div class="divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card" data-orientation="vertical">

<div class="group/accordion relative scroll-m-20" data-state="closed" data-orientation="vertical">

<h3 data-orientation="vertical" data-state="closed" class="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent">

<button type="button" aria-controls="radix-«R38354uvbl5b»" aria-expanded="false" data-state="closed" data-orientation="vertical" id="radix-«R18354uvbl5b»" class="flex flex-1 items-center gap-2 px-4 py-2.5 text-start focus-visible:outline-none" data-radix-collection-item>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right -ms-1 size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-90">

<path d="m9 18 6-6-6-6"></path>
</svg>

View example
</button>

</h3>

<div id="radix-«R38354uvbl5b»" class="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down" data-state="closed" hidden="" role="region" aria-labelledby="radix-«R18354uvbl5b»" data-orientation="vertical" style="--radix-accordion-content-height:var(--radix-collapsible-content-height);--radix-accordion-content-width:var(--radix-collapsible-content-width)">

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="pipes">

<a data-card="" class="peer" href="?id=pipes">Pipes</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Schemas can be chained together into "pipes". Pipes are primarily useful when used in conjunction with <a href="#transforms">Transforms</a>.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R18f54uvbl5b»-content-zod" data-state="active" id="radix-«R18f54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R18f54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R18f54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R18f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R18f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> stringToLength</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">pipe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">));</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">stringToLength.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 5</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R18f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R18f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="transforms">

<a data-card="" class="peer" href="?id=transforms">Transforms</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Transforms are a special kind of schema. Instead of validating input, they accept anything and perform some transformation on the data. To define a transform:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R18r54uvbl5b»-content-zod" data-state="active" id="radix-«R18r54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R18r54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R18r54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R18r54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R18r54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> castToString</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(val));</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">castToString.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;asdf&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;asdf&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">castToString.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">123</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;123&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">castToString.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;true&quot;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R18r54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R18r54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card">

<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

Refinement functions should never throw. Thrown errors are not caught by Zod.
</p>

</div>

</div>

</div>

<!-- -->

<p>

To perform validation logic inside a transform, use <code>ctx</code>. To report a validation issue, push a new issue onto <code>ctx.issues</code> (similar to the <a href="#check"><code>.check()</code></a> API).
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> coercedInt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">ctx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> parsed</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Number.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parseInt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(val));</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> parsed;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (e) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    ctx.issues.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      code: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;custom&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Not a number&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">      input: val,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // this is a special constant with type `never`</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // returning it lets you exit the transform without impacting the inferred return type</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">NEVER</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Most commonly, transforms are used in conjunction with <a href="#pipes">Pipes</a>. This combination is useful for performing some initial validation, then transforming the parsed data into another form.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R19h54uvbl5b»-content-zod" data-state="active" id="radix-«R19h54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R19h54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R19h54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R19h54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19h54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> stringToLength</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">pipe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">));</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">stringToLength.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;hello&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 5</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R19h54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19h54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="transform">

<a data-card="" class="peer" href="?id=transform"><code>.transform()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Piping some schema into a transform is a common pattern, so Zod provides a convenience <code>.transform()</code> method.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R19t54uvbl5b»-content-zod" data-state="active" id="radix-«R19t54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R19t54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R19t54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R19t54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19t54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> stringToLength</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R19t54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R19t54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Transforms can also be async:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1a554uvbl5b»-content-zod" data-state="active" id="radix-«R1a554uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1a554uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1a554uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1a554uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1a554uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> idToUser</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // fetch user from database</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> db.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">getUserById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(id); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  });</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> user</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> idToUser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parseAsync</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;abc123&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1a554uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1a554uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

If you use async transforms, you must use a <code>.parseAsync</code> or <code>.safeParseAsync</code> when parsing data! Otherwise Zod will throw an error.
</p>

</div>

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="preprocess">

<a data-card="" class="peer" href="?id=preprocess"><code>.preprocess()</code></a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

Piping a transform into another schema is another common pattern, so Zod provides a convenience <code>z.preprocess()</code> function.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> coercedInt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">preprocess</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;string&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Number.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parseInt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(val);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}, z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="defaults">

<a data-card="" class="peer" href="?id=defaults">Defaults</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To set a default value for a schema:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1b154uvbl5b»-content-zod" data-state="active" id="radix-«R1b154uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1b154uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1b154uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1b154uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1b154uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> defaultTuna</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">defaultTuna.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;tuna&quot;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1b154uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1b154uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Alternatively, you can pass a function which will be re-executed whenever a default value needs to be generated:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1b954uvbl5b»-content-zod" data-state="active" id="radix-«R1b954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1b954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1b954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1b954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1b954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> randomDefault</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(Math.random);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">randomDefault.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0.4413456736055323</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">randomDefault.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0.1871840107401901</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">randomDefault.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0.7223408162401552</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1b954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1b954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="prefaults">

<a data-card="" class="peer" href="?id=prefaults">Prefaults</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

In Zod, setting a <em>default</em> value will short-circuit the parsing process. If the input is <code>undefined</code>, the default value is eagerly returned. As such, the default value must be assignable to the <em>output type</em> of the schema.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Sometimes, it's useful to define a <em>prefault</em> ("pre-parse default") value. If the input is <code>undefined</code>, the prefault value will be parsed instead. The parsing process is <em>not</em> short circuited. As such, the prefault value must be assignable to the <em>input type</em> of the schema.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">transform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">prefault</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 4</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This is also useful if you want to pass some input value through some mutating refinements.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> a</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">toUpperCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">prefault</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;  tuna  &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">a.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;TUNA&quot;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> b</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">toUpperCase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;  tuna  &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">b.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; &quot;  tuna  &quot;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="catch">

<a data-card="" class="peer" href="?id=catch">Catch</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Use <code>.catch()</code> to define a fallback value to be returned in the event of a validation error:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1ch54uvbl5b»-content-zod" data-state="active" id="radix-«R1ch54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1ch54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1ch54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1ch54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ch54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> numberWithCatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">42</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">numberWithCatch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">numberWithCatch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;tuna&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 42</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1ch54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ch54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Alternatively, you can pass a function which will be re-executed whenever a catch value needs to be generated.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1cp54uvbl5b»-content-zod" data-state="active" id="radix-«R1cp54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1cp54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1cp54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1cp54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1cp54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> numberWithRandomCatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">ctx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  ctx.error; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the caught ZodError</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Math.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">random</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">numberWithRandomCatch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;sup&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0.4413456736055323</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">numberWithRandomCatch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;sup&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0.1871840107401901</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">numberWithRandomCatch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;sup&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 0.7223408162401552</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1cp54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1cp54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="branded-types">

<a data-card="" class="peer" href="?id=branded-types">Branded types</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

TypeScript's type system is <a href="https://www.typescriptlang.org/docs/handbook/type-compatibility.html" rel="noreferrer noopener" target="_blank">structural</a>, meaning that two types that are structurally equivalent are considered the same.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> };</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Dog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> };</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> pluto</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Dog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;pluto&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> };</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> simba</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> pluto; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// works fine</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

In some cases, it can be desirable to simulate <a href="https://en.wikipedia.org/wiki/Nominal_type_system" rel="noreferrer noopener" target="_blank">nominal typing</a> inside TypeScript. This can be achieved with <em>branded types</em> (also known as "opaque types").
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">brand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Cat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Dog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">brand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Dog&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Cat&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { name: string } &amp; z.$brand&lt;&quot;Cat&quot;&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Dog</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Dog&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { name: string } &amp; z.$brand&lt;&quot;Dog&quot;&gt;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> pluto</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Dog.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;pluto&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> simba</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> pluto; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ not allowed</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Under the hood, this works by attaching a "brand" to the schema's inferred type.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">brand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Cat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> Cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> Cat&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { name: string } &amp; z.$brand&lt;&quot;Cat&quot;&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

With this brand, any plain (unbranded) data structures are no longer assignable to the inferred type. You have to parse some data with the schema to get branded data.
</p>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

Note that branded types do not affect the runtime result of <code>.parse</code>. It is a static-only construct.
</p>

</div>

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="readonly">

<a data-card="" class="peer" href="?id=readonly">Readonly</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To mark a schema as readonly:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1e954uvbl5b»-content-zod" data-state="active" id="radix-«R1e954uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1e954uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1e954uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1e954uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1e954uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> ReadonlyUser</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> ReadonlyUser</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ReadonlyUser&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// Readonly&lt;{ name: string }&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1e954uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1e954uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

The inferred type of the new schemas will be marked as <code>readonly</code>. Note that in TypeScript, this only affects objects, arrays, tuples, <code>Set</code>, and <code>Map</code>:
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1eh54uvbl5b»-content-zod" data-state="active" id="radix-«R1eh54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1eh54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1eh54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1eh54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1eh54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">() }).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { readonly name: string }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// readonly string[]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">tuple</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()]).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// readonly [string, number]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ReadonlyMap&lt;string, Date&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">readonly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ReadonlySet&lt;string&gt;</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1eh54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1eh54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

Inputs will be parsed like normal, then the result will be frozen with <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze" rel="noreferrer noopener" target="_blank"><code>Object.freeze()</code></a> to prevent modifications.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1ep54uvbl5b»-content-zod" data-state="active" id="radix-«R1ep54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1ep54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1ep54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1ep54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ep54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> ReadonlyUser.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;fido&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;simba&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// throws TypeError</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1ep54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1ep54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="json">

<a data-card="" class="peer" href="?id=json">JSON</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To validate any JSON-encodable value:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> jsonSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">json</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This is a convenience API that returns the following union schema:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> jsonSchema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">lazy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">union</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">([</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(params), </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(jsonSchema), </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), jsonSchema)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  ]);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="custom">

<a data-card="" class="peer" href="?id=custom">Custom</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

You can create a Zod schema for any TypeScript type by using <code>z.custom()</code>. This is useful for creating schemas for types that are not supported by Zod out of the box, such as template string literals.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> px</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">custom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">`${</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">number</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}px`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&gt;((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> val </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;string&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> ?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> /</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">^</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">\d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">+</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF">px</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">test</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(val) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> px</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> z</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">infer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> px&gt;; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// `${number}px`</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">px.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;42px&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// &quot;42px&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">px.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;42vw&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// throws;</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

If you don't provide a validation function, Zod will allow any value. This can be dangerous!
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">custom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">&lt;{ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">arg</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> }&gt;(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// performs no validation</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

You can customize the error message and other options by passing a second argument. This parameter works the same way as the params parameter of <a href="#refine"><code>.refine</code></a>.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.custom</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">&lt;...&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;custom error message&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="functions">

<a data-card="" class="peer" href="?id=functions">Functions</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-orange-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert size-5 fill-orange-500 text-fd-card">

<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

In Zod 4, <code>z.function()</code> no longer returns a Zod schema.
</p>

</div>

</div>

</div>

<p>

Zod provides a <code>z.function()</code> utility for defining Zod-validated functions. This way, you can avoid intermixing validation code with your business logic.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> MyFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  input: [z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// parameters (must be an array or a ZodTuple)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  output: z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// return type</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Function schemas have an <code>.implement()</code> method which accepts a function and returns a new function that automatically validates its inputs and outputs.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> computeTrimmedLength</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> MyFunction.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">implement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">  // TypeScript knows input is a string!</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> input.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">computeTrimmedLength</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;sandwich&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 8</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">computeTrimmedLength</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot; asdf &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// =&gt; 4</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This function will throw a <code>ZodError</code> if the input is invalid:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">computeTrimmedLength</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">42</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// throws ZodError</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

If you only care about validating inputs, you can omit the <code>output</code> field.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> MyFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  input: [z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// parameters (must be an array or a ZodTuple)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> computeTrimmedLength</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> MyFunction.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">implement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> input.trim.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

