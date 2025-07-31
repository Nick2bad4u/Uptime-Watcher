<h1 class="text-3xl font-semibold">

Customizing errors
</h1>

<div class="prose">

<p>

In Zod, validation errors are surfaced as instances of the <code>z.core.$`ZodError</code> class.</p>
<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg><div class="min-w-0 flex-1"><div class="text-fd-muted-foreground prose-no-margin">
<p>The <code>ZodError</code> class in the <code>zod</code> package is a subclass that implements some additional convenience methods.</p>
</div></div></div>
<p>Instances of <code>`$ZodError</code> contain an <code>.issues</code> array. Each issue contains a human-readable <code>message</code> and additional structured metadata about the issue.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«Rh54uvbl5b»-content-zod" data-state="active" id="radix-«Rh54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«Rh54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«Rh54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«Rh54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rh54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// { success: false, error: ZodError }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.error.issues;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//   {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     expected: &#x27;string&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     code: &#x27;invalid_type&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     path: [],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     message: &#x27;Invalid input: expected string, received number&#x27;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//   }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ]</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«Rh54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«Rh54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<!-- -->

<p>

Every issue contains a <code>message</code> property with a human-readable error message. Error messages can be customized in a number of ways.
</p>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="the-error-param">

<a data-card="" class="peer" href="?id=the-error-param">The <code>error</code> param</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Virtually every Zod API accepts an optional error message.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Not a string!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This custom error will show up as the <code>message</code> property of any validation issues that originate from this schema.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Not a string!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ❌ throws ZodError {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//   issues: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//       expected: &#x27;string&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//       code: &#x27;invalid_type&#x27;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//       path: [],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//       message: &#x27;Not a string!&#x27;   &lt;-- 👀 custom error message</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//   ]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// }</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

All <code>z</code> functions and schema methods accept custom errors.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1j54uvbl5b»-content-zod" data-state="active" id="radix-«R1j54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1j54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1j54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1j54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1j54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too short!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad UUID!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad date!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Not an array!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too few items!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad set!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1j54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1j54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

If you prefer, you can pass a params object with an <code>error</code> parameter instead.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R1r54uvbl5b»-content-zod" data-state="active" id="radix-«R1r54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R1r54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R1r54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R1r54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1r54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too short!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">uuid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad UUID!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.iso.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">date</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad date!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad array!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Too few items!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(), { error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Bad set!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R1r54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R1r54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

The <code>error</code> param optionally accepts a function. An error customization function is known as an <strong>error map</strong> in Zod terminology. The error map will run at parse time if a validation error occurs.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: ()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">`[${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">Date</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">now</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">()</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}]: Validation failure.`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span></code></pre>

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

<strong>Note</strong> — In Zod v3, there were separate params for <code>message</code> (a string) and <code>errorMap</code> (a function). These have been unified in Zod 4 as <code>error</code>.
</p>

</div>

</div>

</div>

<p>

The error map receives a context object you can use to customize the error message based on the validation issue.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> iss.input </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> undefined</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> ?</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Field is required.&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> :</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;Invalid input.&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

For advanced cases, the <code>iss</code> object provides additional information you can use to customize the error.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    iss.code; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the issue code</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    iss.input; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the input data</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    iss.inst; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the schema/check that originated this issue</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    iss.path; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the path of the error</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Depending on the API you are using, there may be additional properties available. Use TypeScript's autocomplete to explore the available properties.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">min</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // ...the same as above</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    iss.minimum; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// the minimum value</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    iss.inclusive; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// whether the minimum is inclusive</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> `Password must have ${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">iss</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">minimum</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">} characters or more`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Return <code>undefined</code> to avoid customizing the error message and fall back to the default message. (More specifically, Zod will yield control to the next error map in the <a href="#error-precedence">precedence chain</a>.) This is useful for selectively customizing certain error messages but not others.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">int64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">issue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // override too_big error message</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (issue.code </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;too_big&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { message: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">`Value must be &lt;${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">issue</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">maximum</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    }</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    //  defer to default</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="per-parse-error-customization">

<a data-card="" class="peer" href="?id=per-parse-error-customization">Per-parse error customization</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To customize errors on a <em>per-parse</em> basis, pass an error map into the parse method:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">();</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;per-parse custom error&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

This has <em>lower precedence</em> than any schema-level custom messages.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> schema</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({ error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;highest priority&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;lower priority&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">result.error.issues;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// [{ message: &quot;highest priority&quot;, ... }]</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

The <code>iss</code> object is a <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" rel="noreferrer noopener" target="_blank">discriminated union</a> of all possible issue types. Use the <code>code</code> property to discriminate between them.
</p>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

For a breakdown of all Zod issue codes, see the <a href="/packages/core#issue-types"><code>zod/v4/core</code></a> documentation.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (iss.code </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;invalid_type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">      return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> `invalid type, expected ${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">iss</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">expected</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (iss.code </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;too_small&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">      return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> `minimum is ${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">iss</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">minimum</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="include-input-in-issues">

<a data-card="" class="peer" href="?id=include-input-in-issues">Include input in issues</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

By default, Zod does not include input data in issues. This is to prevent unintentional logging of potentially sensitive input data. To include the input data in each issue, use the <code>reportInput</code> flag:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  reportInput: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">})</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ZodError: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//   {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     &quot;expected&quot;: &quot;string&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     &quot;code&quot;: &quot;invalid_type&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     &quot;input&quot;: 12,</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D"> // 👀</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     &quot;path&quot;: [],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//     &quot;message&quot;: &quot;Invalid input: expected string, received number&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">//   }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">// ]</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="global-error-customization">

<a data-card="" class="peer" href="?id=global-error-customization">Global error customization</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To specify a global error map, use <code>z.config()</code> to set Zod's <code>customError</code> configuration setting:
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  customError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;globally modified error&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

Global error messages have <em>lower precedence</em> than schema-level or per-parse error messages.
</p>

<p>

The <code>iss</code> object is a <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions" rel="noreferrer noopener" target="_blank">discriminated union</a> of all possible issue types. Use the <code>code</code> property to discriminate between them.
</p>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

For a breakdown of all Zod issue codes, see the <a href="/packages/core#issue-types"><code>zod/v4/core</code></a> documentation.
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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> schema.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">safeParse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (iss.code </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;invalid_type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">      return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> `invalid type, expected ${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">iss</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">expected</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> (iss.code </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;too_small&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">      return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> `minimum is ${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">iss</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">minimum</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">})</span></span></code></pre>

</div>

</div>

</div>

</figure>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="internationalization">

<a data-card="" class="peer" href="?id=internationalization">Internationalization</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

To support internationalization of error message, Zod provides several built-in <strong>locales</strong>. These are exported from the <code>zod/v4/core</code> package.
</p>

<div class="my-6 flex flex-row gap-2 rounded-lg border border-s-2 bg-fd-card p-3 text-sm text-fd-card-foreground shadow-md border-s-blue-500/50">

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-5 fill-blue-500 text-fd-card">

<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
</svg>

<div class="min-w-0 flex-1">

<div class="text-fd-muted-foreground prose-no-margin">

<p>

<strong>Note</strong> — The regular <code>zod</code> library automatically loads the <code>en</code> locale automatically. Zod Mini does not load any locale by default; instead all error messages default to <code>Invalid input</code>.
</p>

</div>

</div>

</div>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R5v54uvbl5b»-content-zod" data-state="active" id="radix-«R5v54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R5v54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R5v54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R5v54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R5v54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { en } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;zod/locales&quot;</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">en</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R5v54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R5v54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<p>

To lazily load a locale, consider dynamic imports:
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
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> loadLocale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">locale</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">  const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">locale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> await</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">`zod/v4/locales/${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">locale</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">}.js`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">  z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">locale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">};</span></span>
<span class="line"> </span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> loadLocale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;fr&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<p>

For convenience, all locales are exported as <code>z.locales</code> from <code>"zod"</code>. In some bundlers, this may not be tree-shakable.
</p>

<div class="flex flex-col overflow-hidden rounded-xl border bg-fd-card my-4" dir="ltr" data-orientation="horizontal">

<div class="flex flex-row items-end gap-4 overflow-x-auto bg-fd-secondary px-4 text-fd-muted-foreground" role="tablist" aria-orientation="horizontal" tabindex="-1" data-orientation="horizontal" style="outline:none">

<button type="button" role="tab" aria-selected="true" aria-controls="radix-«R6f54uvbl5b»-content-zod" data-state="active" id="radix-«R6f54uvbl5b»-trigger-zod" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod
</button>

<button type="button" role="tab" aria-selected="false" aria-controls="radix-«R6f54uvbl5b»-content-zod-mini" data-state="inactive" id="radix-«R6f54uvbl5b»-trigger-zod-mini" class="whitespace-nowrap border-b border-transparent py-2 text-sm font-medium transition-colors hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary" tabindex="-1" data-orientation="horizontal" data-radix-collection-item>

Zod Mini
</button>

</div>

<div id="radix-«R6f54uvbl5b»-content-zod" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R6f54uvbl5b»-trigger-zod" tabindex="0" style="animation-duration:0s">

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
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.locales.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">en</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

<div id="radix-«R6f54uvbl5b»-content-zod-mini" class="p-4 prose-no-margin [&>figure:only-child]:-m-4 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none" data-state="inactive" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-«R6f54uvbl5b»-trigger-zod-mini" hidden="" tabindex="0">

</div>

</div>

<h3 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="locales">

<a data-card="" class="peer" href="?id=locales">Locales</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h3>

<p>

The following locales are available:
</p>

<ul>

<li>

<code>ar</code> — Arabic
</li>

<li>

<code>az</code> — Azerbaijani
</li>

<li>

<code>be</code> — Belarusian
</li>

<li>

<code>bg</code> — Bulgarian
</li>

<li>

<code>ca</code> — Catalan
</li>

<li>

<code>cs</code> — Czech
</li>

<li>

<code>da</code> — Danish
</li>

<li>

<code>de</code> — German
</li>

<li>

<code>en</code> — English
</li>

<li>

<code>eo</code> — Esperanto
</li>

<li>

<code>es</code> — Spanish
</li>

<li>

<code>fa</code> — Farsi
</li>

<li>

<code>fi</code> — Finnish
</li>

<li>

<code>fr</code> — French
</li>

<li>

<code>frCA</code> — Canadian French
</li>

<li>

<code>he</code> — Hebrew
</li>

<li>

<code>hu</code> — Hungarian
</li>

<li>

<code>id</code> — Indonesian
</li>

<li>

<code>is</code> — Icelandic
</li>

<li>

<code>it</code> — Italian
</li>

<li>

<code>ja</code> — Japanese
</li>

<li>

<code>kh</code> — Khmer
</li>

<li>

<code>ko</code> — Korean
</li>

<li>

<code>mk</code> — Macedonian
</li>

<li>

<code>ms</code> — Malay
</li>

<li>

<code>nl</code> — Dutch
</li>

<li>

<code>no</code> — Norwegian
</li>

<li>

<code>ota</code> — Türkî
</li>

<li>

<code>ps</code> — Pashto
</li>

<li>

<code>pl</code> — Polish
</li>

<li>

<code>pt</code> — Portuguese
</li>

<li>

<code>ru</code> — Russian
</li>

<li>

<code>sl</code> — Slovenian
</li>

<li>

<code>sv</code> — Swedish
</li>

<li>

<code>ta</code> — Tamil
</li>

<li>

<code>th</code> — Thai
</li>

<li>

<code>tr</code> — Türkçe
</li>

<li>

<code>ua</code> — Ukrainian
</li>

<li>

<code>ur</code> — Urdu
</li>

<li>

<code>vi</code> — Tiếng Việt
</li>

<li>

<code>zhCN</code> — Simplified Chinese
</li>

<li>

<code>zhTW</code> — Traditional Chinese
</li>

<li>

<code>yo</code> — Yorùbá
</li>

</ul>

<h2 class="flex scroll-m-28 flex-row items-center gap-2 undefined" id="error-precedence">

<a data-card="" class="peer" href="?id=error-precedence">Error precedence</a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-label="Link to section"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
</h2>

<p>

Below is a quick reference for determining error precedence: if multiple error customizations have been defined, which one takes priority? From <em>highest to lowest</em> priority:
</p>

<ol>

<li>

<strong>Schema-level error</strong> — Any error message "hard coded" into a schema definition.
</li>

</ol>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">&quot;Not a string!&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">);</span></span></code></pre>

</div>

</div>

</div>

</figure>

<ol start="2">

<li>

<strong>Per-parse error</strong> — A custom error map passed into the <code>.parse()</code> method.
</li>

</ol>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">12</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;My custom error&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<ol start="3">

<li>

<strong>Global error map</strong> — A custom error map passed into <code>z.config()</code>.
</li>

</ol>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">({</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">  customError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70">iss</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;My custom error&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">});</span></span></code></pre>

</div>

</div>

</div>

</figure>

<ol start="4">

<li>

<strong>Locale error map</strong> — A custom error map passed into <code>z.config()</code>.
</li>

</ol>

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

<pre class="p-4 focus-visible:outline-none"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">z.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(z.locales.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">en</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">());</span></span></code></pre>

</div>

</div>

</div>

</figure>

</div>

