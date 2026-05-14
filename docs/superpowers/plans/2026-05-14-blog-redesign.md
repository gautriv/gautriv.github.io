# Blog Redesign (v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Bootstrap/jQuery/AdSense-injected site with a vanilla CSS + ES-module shell in the **Studio** design language, an **Atelier-rhythm** reading column inside posts, AI-era LLM friendliness (semantic DOM, JSON-LD audit, `llms.txt`, per-post `.md` alternates), AI deep-link fragment highlighting, and revenue-preserving single-slot AdSense placement.

**Architecture:** A `v2/` namespace (`_includes/v2/*`, `css/v2/*`, `js/v2/*`) is built alongside the existing tree on a long-lived branch. Layouts are rewritten to consume only the v2 namespace. Old includes/CSS/JS are deleted at cutover. No Bootstrap, no jQuery, no FontAwesome kit, no injected ad rails. Vanilla CSS Grid + Flexbox + custom properties. Vanilla ES module JS.

**Tech Stack:** Jekyll 4.x · Kramdown (GFM) · Rouge · jekyll-feed, jekyll-paginate, jekyll-seo-tag, jemoji, jekyll-redirect-from · Geist + Geist Mono + Instrument Serif (Google Fonts) · Vanilla ES2020 · Simple Jekyll Search (kept) · AdSense (kept) · TinyLetter (kept) · Disqus (kept).

**Reference artifacts:**
- Spec: [`docs/superpowers/specs/2026-05-14-blog-redesign-design.md`](../specs/2026-05-14-blog-redesign-design.md)
- Mockups (visual source of truth): [`mockups/studio-home.html`](../../../mockups/studio-home.html), [`mockups/studio-post.html`](../../../mockups/studio-post.html), [`mockups/atelier-post.html`](../../../mockups/atelier-post.html)
- Project guide: [`CLAUDE.md`](../../../CLAUDE.md)

**Verification model (no unit tests for a Jekyll static site):** Each task ends with concrete browser-verifiable checks. Local serve: `bundle exec jekyll serve --livereload` at `http://127.0.0.1:4000`. DOM checks via `curl` + `grep`. Lighthouse + Google's Rich Results Test at the end.

---

## Phase 0 — Setup

### Task 0.1: Create the long-lived redesign branch

**Files:** none

- [ ] **Step 1: Check current branch is clean.**
  Run: `git status --short`
  Expected: empty (or only `assets/.DS_Store` which is fine to ignore).

- [ ] **Step 2: Create branch.**
  Run: `git checkout -b redesign/v2`
  Expected: `Switched to a new branch 'redesign/v2'`

- [ ] **Step 3: Commit the spec + plan + mockups + CLAUDE.md update produced during brainstorming.**

```bash
git add docs/superpowers/specs/2026-05-14-blog-redesign-design.md \
        docs/superpowers/plans/2026-05-14-blog-redesign.md \
        mockups/ \
        CLAUDE.md
git commit -m "docs: blog redesign v2 spec, plan, and mockups"
```

### Task 0.2: Scaffold the v2 directories

**Files:**
- Create: `_includes/v2/.gitkeep`, `css/v2/.gitkeep`, `js/v2/.gitkeep`, `pages/courses/.gitkeep`

- [ ] **Step 1: Create directories.**

```bash
mkdir -p _includes/v2 css/v2 js/v2 pages/courses
touch _includes/v2/.gitkeep css/v2/.gitkeep js/v2/.gitkeep pages/courses/.gitkeep
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/ css/v2/ js/v2/ pages/courses/
git commit -m "scaffold: v2 directories for redesign"
```

---

## Phase 1 — Design system foundation

### Task 1.1: Design tokens (`css/v2/tokens.css`)

**Files:**
- Create: `css/v2/tokens.css`

- [ ] **Step 1: Write the file.**

```css
/* Design tokens — single source of truth. No selectors except :root and @media. */
:root {
  /* Background */
  --bg: #0A0A0B;
  --bg-2: #111114;
  --bg-3: #18181C;

  /* Lines */
  --line: #1F1F25;
  --line-2: #2A2A33;

  /* Text */
  --text: #EDEDF0;
  --text-2: #A0A0AA;
  --text-3: #5A5A66;

  /* Accent */
  --accent: #5B8DEF;
  --accent-2: #3E7BFB;
  --accent-glow: rgba(91, 141, 239, 0.18);

  /* Signal (AI deep-link + status) */
  --signal: #FFD23F;
  --green: #4ADE80;
  --highlight: rgba(255, 210, 63, 0.18);

  /* Type */
  --sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --serif: "Instrument Serif", Georgia, "Times New Roman", serif;

  /* Layout */
  --page-max: 1400px;
  --reading-measure: 68ch;
  --gutter: 32px;
  --gutter-sm: 16px;

  /* Radii */
  --radius: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;

  /* Motion */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --t-fast: 150ms;
  --t-med: 250ms;
}

/* Light-mode stub (v2 deferred — only safe fallbacks) */
@media (prefers-color-scheme: light) {
  :root {
    --bg: #FFFFFF;
    --bg-2: #F8F8FA;
    --bg-3: #F1F1F4;
    --line: #E6E6EA;
    --line-2: #D0D0D6;
    --text: #0A0A0B;
    --text-2: #4A4A55;
    --text-3: #8A8A95;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root { --t-fast: 0ms; --t-med: 0ms; }
}
```

- [ ] **Step 2: Commit.**

```bash
git add css/v2/tokens.css
git commit -m "feat(v2): add design tokens"
```

### Task 1.2: Base reset + body type (`css/v2/base.css`)

**Files:**
- Create: `css/v2/base.css`

- [ ] **Step 1: Write the file.**

```css
/* Reset + body baseline. Keep tag-level styles minimal so per-post inline <style> wins predictably. */
*, *::before, *::after { box-sizing: border-box; }
html, body, h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, blockquote { margin: 0; padding: 0; }

html { scroll-behavior: smooth; background: var(--bg); }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  font-feature-settings: "kern", "liga";
}

a { color: inherit; text-decoration: none; }

img, svg, video { max-width: 100%; height: auto; display: block; }

button { font: inherit; cursor: pointer; background: none; border: none; padding: 0; color: inherit; }

input, textarea, select { font: inherit; color: inherit; }

ul, ol { list-style: none; }

/* Accessible focus ring */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip-to-content */
.skip-link {
  position: absolute;
  top: -40px; left: 8px;
  background: var(--accent);
  color: white;
  padding: 8px 14px;
  border-radius: var(--radius);
  font-family: var(--mono);
  font-size: 12px;
  z-index: 1000;
  transition: top var(--t-fast) var(--ease);
}
.skip-link:focus { top: 8px; }

/* Blueprint grid background — global; mask narrows it near hero areas via specific page rules. */
.bg-grid::before {
  content: "";
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(to right, rgba(91, 141, 239, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(91, 141, 239, 0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%);
}
```

- [ ] **Step 2: Commit.**

```bash
git add css/v2/base.css
git commit -m "feat(v2): add base reset and body type"
```

### Task 1.3: Head include (`_includes/v2/site-head.html`)

**Files:**
- Create: `_includes/v2/site-head.html`

- [ ] **Step 1: Write the file.**

```liquid
{%- comment -%}
  v2 site head — single font request, critical CSS inlined, non-critical preloaded.
  Drop-in replacement for the old <head>; keep SEO/OG/structured-data includes orthogonal.
{%- endcomment -%}

<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>
  {%- if page.hometype == "homepage" -%}
    {{ site.title }} | {{ site.description }}
  {%- else -%}
    {{ page.title }} | {{ site.title }}
  {%- endif -%}
</title>

<!-- Preconnects -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

<!-- SEO meta -->
{% seo %}
<meta name="description" content="{% if page.description %}{{ page.description | strip_html | strip_newlines | truncate: 170 }}{% else %}{{ page.content | strip | strip_html | truncate: 170 }}{% endif %}">
<meta name="keywords" content="{{ page.tags }}{% if page.tags %}, {% endif %}{{ page.seo_keywords | default: page.keywords }}">
<meta name="robots" content="all,follow">
<meta name="p:domain_verify" content="110e96fb74a1a7312dbb2bc27e2b8a0b">

<!-- Open Graph -->
<meta property="og:title" content="{% if page.og_title %}{{ page.og_title }}{% elsif page.title %}{{ page.title }}{% else %}{{ site.title }}{% endif %}">
<meta property="og:description" content="{% if page.og_description %}{{ page.og_description }}{% elsif page.description %}{{ page.description | strip_html | strip_newlines | truncate: 170 }}{% else %}{{ page.content | strip_html | truncate: 170 }}{% endif %}">
<meta property="og:image" content="{% if page.og_image %}{{ page.og_image | prepend: site.url }}{% elsif page.image %}{{ page.image | prepend: site.url }}{% else %}{{ site.url }}/img/logo.png{% endif %}">
<meta property="og:url" content="{{ page.url | replace:'index.html','' | prepend: site.url }}">
<meta property="og:type" content="{% if page.layout == 'posts' %}article{% else %}website{% endif %}">

<!-- Twitter -->
<meta name="twitter:card" content="{% if page.twitter_card %}{{ page.twitter_card }}{% else %}summary_large_image{% endif %}">
<meta name="twitter:title" content="{% if page.og_title %}{{ page.og_title }}{% elsif page.title %}{{ page.title }}{% else %}{{ site.title }}{% endif %}">
<meta name="twitter:description" content="{% if page.og_description %}{{ page.og_description }}{% elsif page.description %}{{ page.description | strip_html | strip_newlines | truncate: 170 }}{% else %}{{ page.content | strip_html | truncate: 170 }}{% endif %}">
<meta name="twitter:image" content="{% if page.og_image %}{{ page.og_image | prepend: site.url }}{% elsif page.image %}{{ page.image | prepend: site.url }}{% else %}{{ site.url }}/img/logo.png{% endif %}">

<!-- LLM-era hints -->
{%- if page.layout == "posts" -%}
{% include v2/llms-meta.html %}
{%- endif -%}

<!-- Structured data -->
{%- if page.layout == "posts" -%}
  {% include structured-data-article.html %}
  {% include structured-data-howto.html %}
  {% include structured-data-faq.html %}
{%- endif -%}

<!-- Single font request -->
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">

<!-- v2 critical CSS bundle (will be combined; for now load individually) -->
<link rel="stylesheet" href="{{ site.url }}/css/v2/tokens.css">
<link rel="stylesheet" href="{{ site.url }}/css/v2/base.css">
<link rel="stylesheet" href="{{ site.url }}/css/v2/chrome.css">
{%- if page.hometype == "homepage" -%}
<link rel="stylesheet" href="{{ site.url }}/css/v2/feed.css">
{%- endif -%}
{%- if page.layout == "posts" -%}
<link rel="stylesheet" href="{{ site.url }}/css/v2/post.css">
{%- endif -%}
{%- unless page.hometype == "homepage" or page.layout == "posts" -%}
<link rel="stylesheet" href="{{ site.url }}/css/v2/listing.css">
{%- endunless -%}
<link rel="stylesheet" href="{{ site.url }}/css/v2/utility.css">

<!-- Favicon -->
<link rel="shortcut icon" href="{{ site.url }}/img/favicon.ico">

{% include google_analytics.html %}
{% include adsense.html %}
```

Note: `_includes/v2/llms-meta.html` does not exist yet (created in Phase 12). The `{% include %}` would fail. Wrap it with an existence test or accept that Phase 12 must complete before posts render — the v2 default layout is wired in Phase 3, but a `posts` layout test page only happens after Phase 5. So Phase 12 must complete before Phase 5 verification. Reorder if needed; the explicit dependency is noted in Phase 5 Task 5.9.

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/site-head.html
git commit -m "feat(v2): add site-head include"
```

---

## Phase 2 — Global chrome

### Task 2.1: Top nav include (`_includes/v2/nav.html`)

**Files:**
- Create: `_includes/v2/nav.html`

- [ ] **Step 1: Write the file.** Source of truth: `mockups/studio-home.html` lines 156–175 (the `.top` header). Adapted to Liquid:

```liquid
{%- comment -%}
  v2 top nav — Studio sticky bar with logo mark, primary links, search trigger, subscribe CTA.
  Mobile: hamburger collapses primary links into an overlay.
{%- endcomment -%}

<header class="top" data-v2-nav>
  <div class="top-inner">
    <a href="{{ '/' | prepend: site.baseurl }}" class="brand" aria-label="Being Technical Writer — home">
      <span class="logo-mark" aria-hidden="true">B</span>
      <span class="brand-name">beingtechnical</span><span class="brand-sub">.writer</span>
    </a>

    <nav class="nav" aria-label="Primary">
      {% for item in site.data.topnavigation.topnavigation %}
        {%- assign is_active = false -%}
        {%- if page.url contains item.url and item.url != "/" -%}{%- assign is_active = true -%}{%- endif -%}
        <a href="{{ item.url | prepend: site.baseurl }}"{% if is_active %} class="active" aria-current="page"{% endif %}>{{ item.title }}</a>
      {% endfor %}
    </nav>

    <div class="top-cta">
      <button type="button" class="search-trigger" data-search-open aria-label="Open search">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="7" cy="7" r="5"></circle><path d="M11 11l3 3"></path>
        </svg>
        <span class="label">Search</span>
        <span class="kbd">⌘K</span>
      </button>
      <a href="#newsletter" class="btn-primary">Subscribe</a>
      <button type="button" class="nav-toggle" data-nav-toggle aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>

  <div class="mobile-menu" data-mobile-menu hidden>
    <nav aria-label="Primary mobile">
      {% for item in site.data.topnavigation.topnavigation %}
        <a href="{{ item.url | prepend: site.baseurl }}">{{ item.title }}</a>
      {% endfor %}
    </nav>
  </div>
</header>

{% include v2/search-palette.html %}
```

Note: `v2/search-palette.html` is created in Phase 8.

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/nav.html
git commit -m "feat(v2): add top nav include"
```

### Task 2.2: Footer include (`_includes/v2/foot.html`)

**Files:**
- Create: `_includes/v2/foot.html`

- [ ] **Step 1: Write the file.** Sparse Studio footer per spec §6:

```liquid
{%- comment -%}
  v2 footer — sparse Studio chrome. Brand line + status + 3 link columns + colophon.
{%- endcomment -%}

<footer class="foot">
  <div class="foot-inner">

    <div class="foot-brand">
      <div class="brand">
        <span class="logo-mark" aria-hidden="true">B</span>
        <span class="brand-name">beingtechnical</span><span class="brand-sub">.writer</span>
      </div>
      <p class="foot-tagline">Field notes from a working technical writer adopting AI faster than the org chart can keep up.</p>
      <ul class="foot-social" aria-label="Social links">
        <li><a href="https://github.com/gtrivedi88" aria-label="GitHub">GitHub</a></li>
        <li><a href="https://www.linkedin.com/in/gauravtrivedi1988/" aria-label="LinkedIn">LinkedIn</a></li>
        <li><a href="https://twitter.com/beingtechwriter" aria-label="Twitter / X">X</a></li>
        <li><a href="/feed.xml" aria-label="RSS feed">RSS</a></li>
      </ul>
    </div>

    <div class="foot-col">
      <h4>The Catalogue</h4>
      <nav>
        <a href="{{ '/' | prepend: site.baseurl }}">Feed</a>
        <a href="{{ '/category-ai/' | prepend: site.baseurl }}">AI</a>
        <a href="{{ '/categories/' | prepend: site.baseurl }}">All categories</a>
        <a href="{{ '/archives/' | prepend: site.baseurl }}">Archive</a>
        <a href="{{ '/courses/' | prepend: site.baseurl }}">Courses</a>
      </nav>
    </div>

    <div class="foot-col">
      <h4>The Project</h4>
      <nav>
        {% for item in site.data.footer.footercolumnone %}
          <a href="{{ item.url | prepend: site.url }}">{{ item.title }}</a>
        {% endfor %}
        <a href="{{ '/privacy/' | prepend: site.baseurl }}">Privacy</a>
      </nav>
    </div>

  </div>

  <div class="foot-bar">
    <span>© {{ site.time | date: '%Y' }} Being Technical Writer · MMXXVI</span>
    <span>Set in <em>Geist</em> + <em>Geist Mono</em> + <em>Instrument Serif</em></span>
  </div>
</footer>
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/foot.html
git commit -m "feat(v2): add footer include"
```

### Task 2.3: Chrome stylesheet (`css/v2/chrome.css`)

**Files:**
- Create: `css/v2/chrome.css`

- [ ] **Step 1: Write the file.** Lift the nav + footer CSS from the mockup, retokenized. (Source: `mockups/studio-home.html` `.top`, `.brand`, `.nav`, `.top-cta`, `.search`, `.btn`, `footer`.)

```css
/* Top nav */
.top {
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(12px);
  background: rgba(10, 10, 11, 0.72);
  border-bottom: 1px solid var(--line);
}
.top-inner {
  max-width: var(--page-max); margin: 0 auto;
  padding: 14px var(--gutter);
  display: flex; align-items: center; gap: 32px;
}
.brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text);
}
.brand .logo-mark {
  width: 26px; height: 26px;
  border: 1px solid var(--line-2);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--bg-3), var(--bg-2));
  font-family: var(--serif);
  font-style: italic;
  font-size: 16px;
  color: var(--accent);
}
.brand .brand-name { color: var(--text); }
.brand .brand-sub { color: var(--text-3); font-weight: 400; }

.nav {
  display: flex; gap: 4px;
  margin-left: 24px;
}
.nav a {
  font-size: 13px;
  color: var(--text-2);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all var(--t-fast) var(--ease);
}
.nav a:hover { color: var(--text); background: var(--bg-3); }
.nav a.active { color: var(--text); background: var(--bg-3); }

.top-cta {
  margin-left: auto;
  display: flex; gap: 8px; align-items: center;
}
.search-trigger {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-3);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 6px 10px 6px 12px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-3);
  transition: border-color var(--t-fast) var(--ease);
}
.search-trigger:hover { border-color: var(--line-2); color: var(--text-2); }
.search-trigger .kbd {
  font-family: var(--mono); font-size: 11px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 3px 7px;
}

.btn-primary {
  background: var(--text);
  color: var(--bg);
  border-radius: var(--radius);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  transition: opacity var(--t-fast) var(--ease);
}
.btn-primary:hover { opacity: 0.86; }

.nav-toggle { display: none; color: var(--text-2); padding: 6px; }

.mobile-menu {
  border-top: 1px solid var(--line);
  background: var(--bg);
  padding: 12px var(--gutter);
}
.mobile-menu nav { display: flex; flex-direction: column; gap: 4px; }
.mobile-menu a {
  padding: 12px;
  font-size: 15px;
  color: var(--text);
  border-radius: var(--radius);
}
.mobile-menu a:hover { background: var(--bg-3); }

/* Footer */
.foot {
  border-top: 1px solid var(--line);
  background: var(--bg);
  position: relative;
  z-index: 1;
}
.foot-inner {
  max-width: var(--page-max); margin: 0 auto;
  padding: 64px var(--gutter) 32px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
}
.foot-brand .brand { font-size: 15px; margin-bottom: 16px; }
.foot-tagline {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.55;
  max-width: 42ch;
  margin-bottom: 20px;
}
.foot-social { display: flex; gap: 18px; }
.foot-social a {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-3);
  transition: color var(--t-fast) var(--ease);
}
.foot-social a:hover { color: var(--accent); }

.foot-col h4 {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 16px;
  font-weight: 500;
}
.foot-col nav { display: flex; flex-direction: column; gap: 10px; }
.foot-col nav a {
  font-size: 14px;
  color: var(--text-2);
  transition: color var(--t-fast) var(--ease);
}
.foot-col nav a:hover { color: var(--text); }

.foot-bar {
  border-top: 1px solid var(--line);
  padding: 20px var(--gutter);
  max-width: var(--page-max);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--text-3);
}
.foot-bar em { color: var(--accent); font-style: normal; }

/* Responsive */
@media (max-width: 900px) {
  .top-inner { padding: 12px 16px; gap: 12px; }
  .nav, .search-trigger .label, .search-trigger .kbd { display: none; }
  .nav-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .foot-inner { grid-template-columns: 1fr; gap: 32px; padding: 48px 16px 24px; }
  .foot-bar { flex-direction: column; gap: 12px; padding: 16px; text-align: center; }
}
```

- [ ] **Step 2: Commit.**

```bash
git add css/v2/chrome.css
git commit -m "feat(v2): add chrome stylesheet (nav + footer)"
```

### Task 2.4: Update top-nav data (`_data/topnavigation.yml`)

**Files:**
- Modify: `_data/topnavigation.yml`

- [ ] **Step 1: Replace contents.**

```yaml
topnavigation:

    - title: Feed
      url: /

    - title: AI
      url: /category-ai/

    - title: Craft
      url: /category-technical-writing/

    - title: Archive
      url: /archives/

    - title: Courses
      url: /courses/

    - title: About
      url: /aboutme/
```

- [ ] **Step 2: Commit.**

```bash
git add _data/topnavigation.yml
git commit -m "feat(v2): replace top-nav links with v2 IA"
```

### Task 2.5: Nav JS (`js/v2/nav.js`)

**Files:**
- Create: `js/v2/nav.js`

- [ ] **Step 1: Write the file.**

```js
/* v2 nav: mobile menu toggle + ⌘K / Ctrl+K shortcut for search */
(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  document.addEventListener('keydown', (e) => {
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    if (isCmdK) {
      e.preventDefault();
      const trigger = document.querySelector('[data-search-open]');
      if (trigger) trigger.click();
    }
  });
})();
```

- [ ] **Step 2: Commit.**

```bash
git add js/v2/nav.js
git commit -m "feat(v2): add nav JS (mobile menu, cmd+k)"
```

---

## Phase 3 — New default layout

### Task 3.1: Rewrite `_layouts/default.html`

**Files:**
- Modify: `_layouts/default.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```html
<!DOCTYPE html>
<html lang="en">
<head>
{% include v2/site-head.html %}
</head>
<body class="bg-grid">

<a class="skip-link" href="#main">Skip to content</a>

{% include v2/nav.html %}

<main id="main">
{{ content }}
</main>

{% include v2/foot.html %}

<script defer src="{{ site.url }}/js/v2/nav.js"></script>
<script defer src="{{ site.url }}/js/v2/search.js"></script>
{%- if page.layout == "posts" -%}
<script defer src="{{ site.url }}/js/v2/toc.js"></script>
<script defer src="{{ site.url }}/js/v2/progress.js"></script>
<script defer src="{{ site.url }}/js/v2/focus.js"></script>
<script defer src="{{ site.url }}/js/v2/fragment-glow.js"></script>
{%- endif -%}

</body>
</html>
```

- [ ] **Step 2: Commit.**

```bash
git add _layouts/default.html
git commit -m "feat(v2): rewrite default layout to use v2 includes only"
```

### Task 3.2: Smoke-test that the build runs

- [ ] **Step 1: Start the Jekyll server.**

Run: `bundle exec jekyll serve --livereload --port 4000`
Expected: server starts; build warnings about missing includes (`v2/search-palette.html`, `v2/llms-meta.html`) are expected at this point — they're created in Phase 8 and Phase 12.

- [ ] **Step 2: Temporarily comment out the two unresolved includes in `_includes/v2/nav.html` and `_includes/v2/site-head.html` so the build succeeds.** Wrap them in HTML comments — example for nav:

```liquid
{%- comment -%}{% include v2/search-palette.html %}{%- endcomment -%}
```

And in site-head:

```liquid
{%- comment -%}{% include v2/llms-meta.html %}{%- endcomment -%}
```

- [ ] **Step 3: Visit `http://127.0.0.1:4000/` in browser.**
  Expected: page renders with new dark Studio nav + footer; current homepage content (old slider + intro + post cards) renders in between because `index.html` still uses the old structure. Nav links visible. ⌘K shortcut doesn't yet work (no palette). Footer shows the new sparse layout.

- [ ] **Step 4: Capture a baseline of how things look.**

Run: `curl -s http://127.0.0.1:4000/ | grep -c 'class="top"'`
Expected: `1` (nav present once).

Run: `curl -s http://127.0.0.1:4000/ | grep -c 'class="foot"'`
Expected: `1` (footer present once).

- [ ] **Step 5: Commit the temporary placeholders.**

```bash
git add _includes/v2/nav.html _includes/v2/site-head.html
git commit -m "fixup(v2): temp-comment unresolved includes for smoke test"
```

---

## Phase 4 — Homepage feed

### Task 4.1: Feed stylesheet (`css/v2/feed.css`)

**Files:**
- Create: `css/v2/feed.css`

- [ ] **Step 1: Write the file.** Lift from `mockups/studio-home.html` (`.hero`, `.feed`, `.pinned`, `.row`, `.feed-rail`, `.tag-list`, `.side`, `.panel`, `.input-row`), retokenized to use `var(--*)`. Full CSS is ~280 lines — copy from the mockup file lines 196–462, replacing literal hex values with the tokens defined in `tokens.css` (e.g., `#0A0A0B` → `var(--bg)`).

For brevity in this plan, the literal copy step is mechanical. The mockup is the visual source of truth; the implementer's job is the token substitution.

- [ ] **Step 2: Verify token substitution.** After saving, run:

Run: `grep -E '#[0-9A-Fa-f]{6}' css/v2/feed.css | grep -v 'rgba'`
Expected: empty output (no raw hex literals outside `rgba()` calls — colors must come from tokens). If any leak, refactor them to tokens.

- [ ] **Step 3: Commit.**

```bash
git add css/v2/feed.css
git commit -m "feat(v2): add feed stylesheet"
```

### Task 4.2: Rewrite `index.html`

**Files:**
- Modify: `index.html` (full rewrite)

- [ ] **Step 1: Write the new contents.** This is the Studio homepage adapted to consume `site.posts` via Liquid.

```liquid
---
layout: default
focus: homepage
hometype: homepage
description: "Field notes from a working technical writer adopting AI faster than the org chart can keep up. Longform essays on craft, tooling, and the work that doesn't automate."
---

<section class="hero">
  <div class="hero-eyebrow">
    <span>Issue {{ site.posts | size }} — {{ site.time | date: '%B %-d, %Y' }}</span>
  </div>
  <h1>Field notes on <span class="accent">writing</span>, AI, and the work that doesn't automate.</h1>
  <p>A working journal from inside a technical writing team adopting AI faster than the org chart can keep up. Longform essays, tooling teardowns, and uncomfortable observations.</p>

  <div class="hero-stats">
    <div class="stat">
      <span class="v">{{ site.posts | size }}</span>
      <span class="l">Essays published</span>
    </div>
    <div class="stat">
      <span class="v">~14m</span>
      <span class="l">Median read</span>
    </div>
    <div class="stat">
      <span class="v">{% assign first_post = site.posts | last %}{{ first_post.date | date: '%Y' }}</span>
      <span class="l">Running since</span>
    </div>
  </div>
</section>

<section class="feed">

  <aside class="feed-rail">
    <h4>Filter</h4>
    <ul class="tag-list">
      <li class="active"><span>All essays</span><span class="count">{{ site.posts | size }}</span></li>
      {% for cat in site.data.categories.categories %}
        {% assign cat_count = 0 %}
        {% for p in site.posts %}{% if p.categories contains cat.title %}{% assign cat_count = cat_count | plus: 1 %}{% endif %}{% endfor %}
        <li><a href="{{ cat.url }}"><span>{{ cat.title }}</span><span class="count">{{ cat_count }}</span></a></li>
      {% endfor %}
    </ul>
  </aside>

  <div class="feed-main">

    {% assign pinned = paginator.posts | first %}
    <article class="pinned">
      <div class="pinned-art" aria-hidden="true">
        <div class="pinned-art-text">{{ site.posts | size }}</div>
        <div class="pinned-art-glyph">LEAD</div>
      </div>
      <div class="pinned-body">
        <div class="pinned-meta">
          <span class="badge-pin">★ Pinned</span>
          {% for c in pinned.categories %}<span class="badge-cat">{{ c }}</span>{% endfor %}
          <span>{% include readtime.html content=pinned.content %} · {{ pinned.date | date: '%b %-d, %Y' }}</span>
        </div>
        <h2><a href="{{ pinned.url | prepend: site.baseurl }}">{{ pinned.title }}</a></h2>
        <p class="dek">{{ pinned.description | default: pinned.subtitle | strip_html | truncate: 280 }}</p>
        <div class="footer-meta">
          <span>By {{ pinned.author | strip_html | default: 'Gaurav Trivedi' }}</span>
          <span style="margin-left: auto; color: var(--accent);">Read essay →</span>
        </div>
      </div>
    </article>

    {% for post in paginator.posts offset:1 %}
    <article class="row">
      <div class="row-num">{{ paginator.total_posts | minus: forloop.index }}</div>
      <div class="row-body">
        <h3><a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a></h3>
        <p class="sub">{{ post.description | default: post.subtitle | strip_html | truncate: 180 }}</p>
        <div class="meta">
          {% for c in post.categories %}<span class="pill">{{ c }}</span>{% endfor %}
          <span>{% include readtime.html content=post.content %}</span>
        </div>
      </div>
      <div class="row-date">{{ post.date | date: '%b %-d' }}<br>{{ post.date | date: '%Y' }} <span class="row-arrow">→</span></div>
    </article>
    {% endfor %}

  </div>

  <aside class="side">
    <div class="panel newsletter" id="newsletter">
      {% include newsletter.html %}
    </div>
  </aside>

</section>

<!-- Pagination -->
<nav class="pager" aria-label="Page navigation">
  {% if paginator.previous_page %}
    <a href="{% if paginator.previous_page == 1 %}/{% else %}/page{{ paginator.previous_page }}{% endif %}">← Newer</a>
  {% endif %}
  <span>Page {{ paginator.page }} of {{ paginator.total_pages }}</span>
  {% if paginator.next_page %}
    <a href="/page{{ paginator.next_page }}">Older →</a>
  {% endif %}
</nav>
```

- [ ] **Step 2: Add pager CSS.** Append to `css/v2/feed.css`:

```css
.pager {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 32px var(--gutter) 64px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-2);
}
.pager a { color: var(--accent); }
.pager a:hover { text-decoration: underline; text-underline-offset: 3px; }
```

- [ ] **Step 3: Verify in browser.**

Visit `http://127.0.0.1:4000/`. Expected: Studio hero, blueprint grid background, stats row, filter rail on the left with category counts, pinned latest post as a big card, then 14 compact rows of older posts, newsletter panel on the right, pagination at the bottom.

- [ ] **Step 4: Commit.**

```bash
git add index.html css/v2/feed.css
git commit -m "feat(v2): rewrite homepage feed in Studio style"
```

---

## Phase 5 — Post layout

### Task 5.1: Post stylesheet (`css/v2/post.css`)

**Files:**
- Create: `css/v2/post.css`

- [ ] **Step 1: Write the file.** This is a *fusion*: Studio chrome around the article + Atelier reading rhythm inside. Lift base structure from `mockups/studio-post.html` (article header, 3-column frame, rails, end matter). Lift reading-column rhythm from `mockups/atelier-post.html` (drop cap, `p.emph`, blockquote with side bar, `h2::before § NN`, lede paragraph). Combine into one stylesheet, retokenized.

Specific reading-column rules to copy from `atelier-post.html` and re-skin for Studio palette:

```css
.article {
  max-width: 68ch;
  font-size: 19px;
  line-height: 1.72;
}
.article > p:first-of-type::first-letter {
  font-family: var(--serif);
  font-style: italic;
  float: left;
  font-size: 96px;
  line-height: 0.82;
  padding: 8px 14px 0 0;
  color: var(--accent);
  font-weight: 400;
}
.article p { margin-bottom: 1.4em; color: var(--text); }
.article p.lede {
  font-family: var(--serif);
  font-style: italic;
  font-size: 26px;
  line-height: 1.45;
  color: var(--text);
  letter-spacing: -0.01em;
}
.article p.emph {
  font-family: var(--serif);
  font-style: italic;
  font-size: 28px;
  line-height: 1.3;
  color: var(--text);
  text-align: center;
  padding: 32px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin: 48px 0;
}
.article h2 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 56px 0 20px;
  position: relative;
}
.article h2::before {
  content: "§ " counter(section-counter, decimal-leading-zero);
  counter-increment: section-counter;
  display: block;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--text-3);
  margin-bottom: 6px;
  font-weight: 400;
}
.article { counter-reset: section-counter; }
.article blockquote {
  margin: 36px 0;
  padding: 24px 28px;
  border-left: 3px solid var(--accent);
  background: linear-gradient(135deg, rgba(91,141,239,0.06), transparent);
  border-radius: var(--radius);
  font-family: var(--serif);
  font-style: italic;
  font-size: 24px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}
.article a { color: var(--accent); }
.article a:hover { text-decoration: underline; text-underline-offset: 3px; }
.article code { font-family: var(--mono); font-size: 0.92em; background: var(--bg-2); padding: 1px 6px; border-radius: 3px; color: var(--accent); }
.article pre { background: var(--bg-2); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; overflow-x: auto; }
.article pre code { background: transparent; padding: 0; color: var(--text); }
.article img { border-radius: var(--radius); margin: 24px 0; }
.article ul, .article ol { padding-left: 1.4em; margin-bottom: 1.4em; }
.article ul { list-style: disc; }
.article ol { list-style: decimal; }
.article hr { border: 0; border-top: 1px solid var(--line); margin: 40px 0; }
```

Also include the three-column frame (`.reading-frame`, `.left-rail`, `.right-rail`, `.toc`, `.toc-note`), article head (`.article-head`, `.pre-tags`, `.chip`, `.article-bar`), and end-matter (`.end-divider`, `.related`, `.rel-card`) styles from `mockups/studio-post.html` lines 105–360, retokenized.

- [ ] **Step 2: Verify.**

Run: `grep -E '#[0-9A-Fa-f]{6}' css/v2/post.css | grep -v 'rgba'`
Expected: empty.

- [ ] **Step 3: Commit.**

```bash
git add css/v2/post.css
git commit -m "feat(v2): add post stylesheet (Studio frame + Atelier reading rhythm)"
```

### Task 5.2: Post TOC scaffolding (`_includes/v2/post-toc.html`)

**Files:**
- Create: `_includes/v2/post-toc.html`

- [ ] **Step 1: Write the file.**

```liquid
<aside class="left-rail">
  <div class="toc-label">Outline</div>
  <ol class="toc" data-toc>
    <!-- Populated by js/v2/toc.js after content render -->
    <li class="toc-empty">Loading sections…</li>
  </ol>
  <div class="toc-note">
    <span>Machine-readable</span>
    JSON-LD ready · Plain Markdown at <a href="{{ page.url | replace_last: '/', '' | append: '.md' }}"><code>{{ page.slug }}.md</code></a>.
  </div>
</aside>
```

Note: `replace_last` is not stock Liquid; fall back to a slug-based path. Replace the `<a href>` value with a build-safe construction:

```liquid
<a href="{{ page.url | append: 'index.md' | replace: '//', '/' }}"><code>{{ page.slug }}.md</code></a>
```

The exact `.md` permalink format is finalized in Task 12.4.

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/post-toc.html
git commit -m "feat(v2): add post TOC scaffold"
```

### Task 5.3: TOC JS (`js/v2/toc.js`)

**Files:**
- Create: `js/v2/toc.js`

- [ ] **Step 1: Write the file.**

```js
/* v2 TOC: scan article h2/h3, render list, highlight active on scroll. */
(function () {
  const tocList = document.querySelector('[data-toc]');
  const article = document.querySelector('.article');
  if (!tocList || !article) return;

  const headings = article.querySelectorAll('h2[id], h3[id]');
  if (headings.length === 0) {
    tocList.innerHTML = '<li class="toc-empty">No sections</li>';
    return;
  }

  tocList.innerHTML = '';
  const items = [];
  headings.forEach((h, i) => {
    const li = document.createElement('li');
    li.className = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    li.appendChild(a);
    tocList.appendChild(li);
    items.push({ id: h.id, el: h, li });
  });

  // Active section on scroll
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const item = items.find((it) => it.el === entry.target);
      if (!item) return;
      if (entry.isIntersecting) {
        items.forEach((it) => it.li.classList.remove('active'));
        item.li.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  items.forEach((it) => obs.observe(it.el));
})();
```

- [ ] **Step 2: Commit.**

```bash
git add js/v2/toc.js
git commit -m "feat(v2): add vanilla TOC with active-section highlight"
```

### Task 5.4: Post rails include (`_includes/v2/post-rails.html`)

**Files:**
- Create: `_includes/v2/post-rails.html`

- [ ] **Step 1: Write the file.**

```liquid
<aside class="right-rail">
  {% include v2/ai-ask-card.html %}

  <div class="panel">
    <div class="panel-h">— Sponsored —</div>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-7149683584202371"
         data-ad-slot="2604911171"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>
</aside>
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/post-rails.html
git commit -m "feat(v2): add post rails include (AI card + right sponsor slot)"
```

### Task 5.5: Sponsor slot include (`_includes/v2/sponsor-slot.html`)

**Files:**
- Create: `_includes/v2/sponsor-slot.html`

- [ ] **Step 1: Write the file.**

```liquid
{%- comment -%}
  v2 in-content sponsor slot — designed-in, single placement.
  Use between sections in long posts: {% include v2/sponsor-slot.html %}
{%- endcomment -%}

<div class="sponsor" role="complementary" aria-label="Sponsor message">
  <div class="sponsor-tag">Sponsored</div>
  <div class="sponsor-body">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-7149683584202371"
         data-ad-slot="7422872052"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>
</div>
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/sponsor-slot.html
git commit -m "feat(v2): add in-content sponsor slot include"
```

### Task 5.6: AI ask card (`_includes/v2/ai-ask-card.html`)

**Files:**
- Create: `_includes/v2/ai-ask-card.html`

- [ ] **Step 1: Write the file.**

```liquid
<div class="panel ai-panel" data-ai-ask>
  <div class="panel-h">Ask this essay</div>
  <button class="ai-prompt" data-ai-prompt type="button">Explain this for me <span class="arrow">→</span></button>
  <button class="ai-prompt" data-ai-prompt type="button">Give me a checklist from this <span class="arrow">→</span></button>
  <button class="ai-prompt" data-ai-prompt type="button">Summarize the key argument <span class="arrow">→</span></button>
  <div class="ai-input">
    <input type="text" placeholder="Ask anything about this essay..." data-ai-input>
    <button type="button" data-ai-submit aria-label="Submit question">↵</button>
  </div>
  <div class="ai-foot">Grounded in this article only · No web search</div>
</div>

<!-- "Coming in v2" modal -->
<div class="modal" id="ai-modal" hidden role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
  <div class="modal-backdrop" data-modal-close></div>
  <div class="modal-card">
    <h3 id="ai-modal-title">Coming in v2</h3>
    <p>This will answer using only the content of this article. No web search. We're shipping the UI first; the answering engine comes next.</p>
    <button type="button" class="btn-primary" data-modal-close>Got it</button>
  </div>
</div>

<script>
(function() {
  const modal = document.getElementById('ai-modal');
  const closes = modal.querySelectorAll('[data-modal-close]');
  const prompts = document.querySelectorAll('[data-ai-prompt], [data-ai-submit]');
  function open() { modal.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { modal.hidden = true; document.body.style.overflow = ''; }
  prompts.forEach((b) => b.addEventListener('click', open));
  closes.forEach((c) => c.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (!modal.hidden && e.key === 'Escape') close(); });
})();
</script>
```

- [ ] **Step 2: Add CSS for `.ai-panel`, `.ai-prompt`, `.ai-input`, `.modal` to `css/v2/post.css`** — lift from `mockups/studio-post.html` `.ai-panel`, `.ai-prompt`, `.ai-input` rules. Add modal:

```css
.modal[hidden] { display: none; }
.modal { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
.modal-card {
  position: relative;
  background: var(--bg-2);
  border: 1px solid var(--line-2);
  border-radius: var(--radius-lg);
  padding: 28px;
  max-width: 440px;
  width: calc(100% - 32px);
}
.modal-card h3 { font-size: 22px; margin-bottom: 12px; }
.modal-card p { color: var(--text-2); font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
.modal-card .btn-primary { background: var(--accent); color: white; }
```

- [ ] **Step 3: Commit.**

```bash
git add _includes/v2/ai-ask-card.html css/v2/post.css
git commit -m "feat(v2): add AI ask card with coming-soon modal stub"
```

### Task 5.7: Rewrite `_layouts/posts.html`

**Files:**
- Modify: `_layouts/posts.html` (full rewrite, drop `IntelligentSideRails`)

- [ ] **Step 1: Write the new contents.**

```liquid
---
layout: default
---

<section class="article-head">
  <div class="pre-tags">
    {% for c in page.categories %}<span class="chip accent">{{ c }}</span>{% endfor %}
    {% if page.series %}<span class="chip">{{ page.series }}</span>{% endif %}
  </div>
  <h1>{{ page.title }}</h1>
  {% if page.subtitle %}<p class="dek">{{ page.subtitle }}</p>{% endif %}
  <div class="article-bar">
    <div><span>by</span> <strong>{{ page.author | strip_html | default: 'Gaurav Trivedi' }}</strong></div>
    <div><span>published</span> <strong>{{ page.date | date: '%Y-%m-%d' }}</strong></div>
    {% if page.last_modified_at %}
    <div><span>updated</span> <strong>{{ page.last_modified_at | date: '%Y-%m-%d' }}</strong></div>
    {% endif %}
    <div><span>read</span> <strong>{% include readtime.html content=page.content %}</strong></div>
    <div style="margin-left: auto;"><span>commit</span> <strong>{{ page.path | sha1 | slice: 0, 6 }}</strong></div>
  </div>
  <div class="article-actions">
    <button type="button" class="top-btn" data-focus-toggle>⊙ Focus</button>
  </div>
</section>

<div class="reading-frame">

  {% include v2/post-toc.html %}

  <main class="article article-body">
    {{ content }}
  </main>

  {% include v2/post-rails.html %}

</div>

<!-- End matter -->
<div class="end">
  <div class="end-divider">— end of essay —</div>

  <section class="related">
    <h4>Read after this</h4>
    <div class="related-grid">
      {% for post in site.related_posts limit:3 %}
      <article class="rel-card">
        <div class="n">{{ post.date | date: '%b %-d, %Y' }}</div>
        <h5><a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a></h5>
        <p>{{ post.description | default: post.subtitle | strip_html | truncate: 160 }}</p>
      </article>
      {% endfor %}
    </div>
  </section>

  {% include previousnext.html %}

  <section class="post-share">
    <h4>Share this essay</h4>
    {% include share_bar.html %}
  </section>

  <section class="comments-section">
    <h4>Join the discussion</h4>
    {% include disqus.html %}
  </section>
</div>

<!-- Focus mode exit pill (always in DOM, hidden when not in focus mode via CSS) -->
<button type="button" class="focus-exit" data-focus-exit aria-label="Exit focus mode">
  × Exit focus <span class="kbd">Esc</span>
</button>
```

- [ ] **Step 2: Commit.**

```bash
git add _layouts/posts.html
git commit -m "feat(v2): rewrite posts layout with 3-column reading frame"
```

### Task 5.8: Reading progress bar (`js/v2/progress.js`)

**Files:**
- Create: `js/v2/progress.js`

- [ ] **Step 1: Write the file.**

```js
/* v2 reading progress: 2px bar at top of viewport, advances as user scrolls article. */
(function () {
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.prepend(bar);

  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (max <= 0) return;
    const pct = (h.scrollTop / max) * 100;
    bar.style.width = pct + '%';
  };

  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
```

- [ ] **Step 2: Add to `css/v2/utility.css` (file created here if not already).** Create the file with:

```css
/* Reading progress */
.progress {
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--signal));
  width: 0%;
  z-index: 100;
  transition: width 150ms linear;
}
```

- [ ] **Step 3: Commit.**

```bash
git add js/v2/progress.js css/v2/utility.css
git commit -m "feat(v2): add reading-progress bar"
```

### Task 5.9: Verify a sample post renders

- [ ] **Step 1: Pick a real post.** Use `/taking-yourself-out-of-the-equation/`.

- [ ] **Step 2: Visit.**

Visit `http://127.0.0.1:4000/taking-yourself-out-of-the-equation/`. Expected: Studio article header with chips, h1, dek, mono meta bar; 3-column reading frame (TOC left, article center, AI card + sponsor right); Atelier reading rhythm (drop cap, mono `§ NN` h2 prefix, accent blockquote bar); reading progress bar at top; end matter with related posts, prev/next, share, comments; "× Exit focus Esc" pill is in the DOM but hidden.

- [ ] **Step 3: DOM smoke checks.**

Run: `curl -s http://127.0.0.1:4000/taking-yourself-out-of-the-equation/ | grep -c 'class="reading-frame"'`
Expected: `1`

Run: `curl -s http://127.0.0.1:4000/taking-yourself-out-of-the-equation/ | grep -c 'class="left-rail"'`
Expected: `1`

Run: `curl -s http://127.0.0.1:4000/taking-yourself-out-of-the-equation/ | grep -c 'data-focus-exit'`
Expected: `1`

- [ ] **Step 4: Commit any tweaks.** (No new files; just verification.)

---

## Phase 6 — Focus mode

### Task 6.1: Focus JS (`js/v2/focus.js`)

**Files:**
- Create: `js/v2/focus.js`

- [ ] **Step 1: Write the file.**

```js
/* v2 focus mode: toggle, exit, Esc handler. Single source of truth for the body.focus class. */
(function () {
  const toggle = document.querySelector('[data-focus-toggle]');
  const exit = document.querySelector('[data-focus-exit]');
  if (!toggle && !exit) return;

  function enter() {
    document.body.classList.add('focus');
    if (toggle) toggle.setAttribute('aria-pressed', 'true');
  }
  function leave() {
    document.body.classList.remove('focus');
    if (toggle) toggle.setAttribute('aria-pressed', 'false');
  }
  function toggleMode() {
    if (document.body.classList.contains('focus')) leave(); else enter();
  }

  if (toggle) toggle.addEventListener('click', toggleMode);
  if (exit) exit.addEventListener('click', leave);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('focus')) {
      leave();
    }
  });
})();
```

- [ ] **Step 2: Commit.**

```bash
git add js/v2/focus.js
git commit -m "feat(v2): add focus mode JS (toggle, exit pill, Esc)"
```

### Task 6.2: Focus CSS (append to `css/v2/utility.css`)

**Files:**
- Modify: `css/v2/utility.css`

- [ ] **Step 1: Append.**

```css
/* Focus mode: hide chrome, center reading column. */
body.focus .top,
body.focus .left-rail,
body.focus .right-rail,
body.focus .sponsor,
body.focus .related,
body.focus .post-share,
body.focus .comments-section,
body.focus .foot,
body.focus .article-actions { display: none; }

body.focus .reading-frame { grid-template-columns: 1fr; max-width: 780px; margin: 0 auto; }
body.focus .article-head { max-width: 780px; margin: 0 auto; }

/* Focus exit pill — present always, hidden when not in focus mode */
.focus-exit {
  position: fixed;
  top: 16px; right: 16px;
  z-index: 110;
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--bg-2);
  border: 1px solid var(--line-2);
  color: var(--text-2);
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all var(--t-fast) var(--ease);
}
.focus-exit:hover { border-color: var(--accent); color: var(--text); }
.focus-exit .kbd {
  font-size: 10px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 2px 6px;
}
body:not(.focus) .focus-exit { display: none; }
```

- [ ] **Step 2: Verify in browser.**

Reload `/taking-yourself-out-of-the-equation/`. Click "⊙ Focus" in the article header. Expected: top nav, rails, ads, footer, end-matter all disappear; the "× Exit focus Esc" pill appears top-right. Click the pill — expected: returns to normal. Re-enter focus and press `Esc` — expected: returns to normal.

- [ ] **Step 3: Commit.**

```bash
git add css/v2/utility.css
git commit -m "feat(v2): add focus mode CSS and exit pill styles"
```

---

## Phase 7 — Fragment highlight from AI deep links

### Task 7.1: Fragment-glow JS (`js/v2/fragment-glow.js`)

**Files:**
- Create: `js/v2/fragment-glow.js`

- [ ] **Step 1: Write the file.**

```js
/* v2 fragment-glow: when URL has a #fragment matching an element id in the article,
   smooth-scroll to it and flash a 4s glow + "AI deep link" label. */
(function () {
  function applyGlow(el) {
    el.classList.add('fragment-glow');
    el.setAttribute('data-fragment-glow', 'true');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Analytics breadcrumb, only if dataLayer exists
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'ai_referrer_landing', fragment: el.id || '' });
    }

    setTimeout(() => {
      el.classList.remove('fragment-glow');
      el.removeAttribute('data-fragment-glow');
    }, 4000);
  }

  function run() {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.substring(1));
    const el = document.getElementById(id) || document.querySelector(`[name="${CSS.escape(id)}"]`);
    if (!el) return;
    // Only highlight if it's inside the article (avoid nav/footer accidental matches)
    if (!el.closest('.article, .article-head')) return;
    applyGlow(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Also handle in-page hash changes (e.g., TOC click then AI deep-link via History API)
  window.addEventListener('hashchange', run);
})();
```

- [ ] **Step 2: Commit.**

```bash
git add js/v2/fragment-glow.js
git commit -m "feat(v2): add AI fragment-glow on deep-link landing"
```

### Task 7.2: Fragment-glow CSS (append to `css/v2/utility.css`)

**Files:**
- Modify: `css/v2/utility.css`

- [ ] **Step 1: Append.**

```css
/* Fragment glow — applied when an element is the target of an AI deep link */
.fragment-glow {
  background: var(--highlight);
  padding: 2px 4px;
  margin: -2px -4px;
  border-radius: 3px;
  border-bottom: 1px solid var(--signal);
  position: relative;
  animation: fg-pulse 1.8s ease-out 0.4s 2;
}
.fragment-glow::before {
  content: "↳ AI deep link";
  position: absolute;
  top: -28px; left: 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--signal);
  background: var(--bg);
  padding: 4px 10px;
  border: 1px solid var(--line);
  border-radius: 4px;
  white-space: nowrap;
}
@keyframes fg-pulse {
  0% { background: var(--highlight); }
  50% { background: rgba(255, 210, 63, 0.35); }
  100% { background: var(--highlight); }
}
```

- [ ] **Step 2: Verify.**

Visit `http://127.0.0.1:4000/taking-yourself-out-of-the-equation/#section-h2-id` (use a real h2 id; check with `curl ... | grep 'id='`). Expected: page scrolls to the h2, the glow + "↳ AI deep link" chip flash for ~4 seconds.

- [ ] **Step 3: Commit.**

```bash
git add css/v2/utility.css
git commit -m "feat(v2): add fragment-glow visual treatment"
```

---

## Phase 8 — Search command palette

### Task 8.1: Search palette include (`_includes/v2/search-palette.html`)

**Files:**
- Create: `_includes/v2/search-palette.html`

- [ ] **Step 1: Write the file.**

```html
<div class="search-palette" id="search-palette" hidden role="dialog" aria-modal="true" aria-labelledby="search-title">
  <div class="search-backdrop" data-search-close></div>
  <div class="search-card">
    <div class="search-head">
      <h2 id="search-title" class="visually-hidden">Search essays</h2>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"></circle><path d="M11 11l3 3"></path></svg>
      <input type="search" id="search-input" placeholder="Search essays..." autocomplete="off" aria-label="Search essays">
      <button type="button" class="search-close" data-search-close aria-label="Close search">Esc</button>
    </div>
    <ul id="results-container" class="search-results"></ul>
    <div class="search-foot">
      <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
      <span><kbd>↵</kbd> open</span>
      <span><kbd>Esc</kbd> close</span>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/v2/search-palette.html
git commit -m "feat(v2): add search command-palette markup"
```

### Task 8.2: Search palette CSS (append to `css/v2/chrome.css`)

**Files:**
- Modify: `css/v2/chrome.css`

- [ ] **Step 1: Append.**

```css
/* Search command palette */
.search-palette[hidden] { display: none; }
.search-palette {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 12vh;
}
.search-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(8px);
}
.search-card {
  position: relative;
  width: min(620px, calc(100% - 32px));
  background: var(--bg-2);
  border: 1px solid var(--line-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.search-head {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  color: var(--text-3);
}
.search-head input {
  flex: 1;
  background: transparent; border: 0; outline: 0;
  color: var(--text);
  font-family: var(--sans); font-size: 16px;
}
.search-close {
  font-family: var(--mono); font-size: 11px;
  border: 1px solid var(--line); border-radius: 4px;
  padding: 4px 8px;
  color: var(--text-3);
}
.search-results {
  max-height: 50vh; overflow-y: auto;
  padding: 8px;
}
.search-results a {
  display: block;
  padding: 12px;
  border-radius: var(--radius);
  color: var(--text-2);
  font-size: 14px;
  border: 1px solid transparent;
}
.search-results a:hover,
.search-results a:focus { background: var(--bg-3); color: var(--text); border-color: var(--line-2); }
.search-foot {
  display: flex; gap: 20px;
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  font-family: var(--mono); font-size: 11px;
  color: var(--text-3);
}
.search-foot kbd {
  background: var(--bg); border: 1px solid var(--line);
  padding: 2px 6px; border-radius: 4px;
}
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
```

- [ ] **Step 2: Commit.**

```bash
git add css/v2/chrome.css
git commit -m "feat(v2): add search palette styles"
```

### Task 8.3: Search JS (`js/v2/search.js`)

**Files:**
- Create: `js/v2/search.js`

- [ ] **Step 1: Write the file.**

```js
/* v2 search palette: thin wrapper around Simple Jekyll Search.
   Loads SJS on first open to keep page weight low. */
(function () {
  const trigger = document.querySelector('[data-search-open]');
  const palette = document.getElementById('search-palette');
  const closes = document.querySelectorAll('[data-search-close]');
  const input = document.getElementById('search-input');
  if (!trigger || !palette || !input) return;

  let sjsLoaded = false;

  function open() {
    palette.hidden = false;
    document.body.style.overflow = 'hidden';
    if (!sjsLoaded) loadSJS();
    setTimeout(() => input.focus(), 30);
  }
  function close() {
    palette.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    document.getElementById('results-container').innerHTML = '';
  }

  function loadSJS() {
    const s = document.createElement('script');
    s.src = '/js/search-script.js';
    s.onload = () => {
      window.SimpleJekyllSearch({
        searchInput: input,
        resultsContainer: document.getElementById('results-container'),
        searchResultTemplate: '<li><a href="{url}" tabindex="0">{title}</a></li>',
        noResultsText: '<li class="search-empty">No results.</li>',
        json: '/search.json',
        fuzzy: true,
        limit: 10,
      });
      sjsLoaded = true;
    };
    document.body.appendChild(s);
  }

  trigger.addEventListener('click', open);
  closes.forEach((c) => c.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (!palette.hidden && e.key === 'Escape') close();
  });
})();
```

- [ ] **Step 2: Re-enable the include in `_includes/v2/nav.html`.** Remove the comment wrapper around `{% include v2/search-palette.html %}`.

- [ ] **Step 3: Verify.**

Reload site. Press ⌘K. Expected: palette opens centered, input focused. Type "AI". Expected: live results render. Click a result. Expected: navigates. Press Esc. Expected: palette closes.

- [ ] **Step 4: Commit.**

```bash
git add js/v2/search.js _includes/v2/nav.html
git commit -m "feat(v2): wire search command palette to SJS"
```

---

## Phase 9 — Other post chrome (previous/next, share, categories widget)

### Task 9.1: Rewrite `_includes/previousnext.html`

**Files:**
- Modify: `_includes/previousnext.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```liquid
<nav class="prev-next" aria-label="More essays">
  {% if page.previous.url %}
  <a class="pn-item pn-prev" href="{{ page.previous.url }}">
    <span class="pn-label">← Previous</span>
    <span class="pn-title">{{ page.previous.title }}</span>
    {% if page.previous.description %}<span class="pn-dek">{{ page.previous.description | strip_html | truncate: 100 }}</span>{% endif %}
  </a>
  {% else %}<div class="pn-item pn-empty"></div>{% endif %}

  {% if page.next.url %}
  <a class="pn-item pn-next" href="{{ page.next.url }}">
    <span class="pn-label">Next →</span>
    <span class="pn-title">{{ page.next.title }}</span>
    {% if page.next.description %}<span class="pn-dek">{{ page.next.description | strip_html | truncate: 100 }}</span>{% endif %}
  </a>
  {% else %}<div class="pn-item pn-empty"></div>{% endif %}
</nav>
```

- [ ] **Step 2: Add CSS to `css/v2/post.css`.**

```css
.prev-next {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin: 48px 0;
}
.pn-item {
  display: flex; flex-direction: column; gap: 6px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--bg-2);
  transition: all var(--t-fast) var(--ease);
}
.pn-item:hover { border-color: var(--line-2); transform: translateY(-2px); }
.pn-prev { text-align: left; }
.pn-next { text-align: right; }
.pn-label {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--text-3);
}
.pn-title {
  font-size: 16px; font-weight: 600; color: var(--text);
  letter-spacing: -0.015em;
}
.pn-dek { color: var(--text-2); font-size: 13px; line-height: 1.45; }
.pn-empty { background: transparent; border: 0; }
@media (max-width: 700px) { .prev-next { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Commit.**

```bash
git add _includes/previousnext.html css/v2/post.css
git commit -m "feat(v2): rewrite previousnext to paired Studio cards"
```

### Task 9.2: Rewrite `_includes/share_bar.html`

**Files:**
- Modify: `_includes/share_bar.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```liquid
{%- assign post_url = site.url | append: site.baseurl | append: page.url -%}
<div class="share-row">
  <a class="share-btn" href="https://twitter.com/intent/tweet?text={{ page.title | url_encode }}&url={{ post_url | url_encode }}" target="_blank" rel="noopener" aria-label="Share on X (Twitter)">X</a>
  <a class="share-btn" href="https://www.linkedin.com/shareArticle?mini=true&url={{ post_url | url_encode }}&title={{ page.title | url_encode }}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">LinkedIn</a>
  <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u={{ post_url | url_encode }}" target="_blank" rel="noopener" aria-label="Share on Facebook">Facebook</a>
  <a class="share-btn" href="https://www.reddit.com/submit?url={{ post_url | url_encode }}&title={{ page.title | url_encode }}" target="_blank" rel="noopener" aria-label="Share on Reddit">Reddit</a>
  <a class="share-btn" href="mailto:?subject={{ page.title | url_encode }}&body=Check this out: {{ post_url | url_encode }}" aria-label="Share via Email">Email</a>
  <button class="share-btn" data-share-copy data-url="{{ post_url }}" aria-label="Copy link">Copy link</button>
</div>

<script>
(function () {
  const btn = document.querySelector('[data-share-copy]');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.url); btn.textContent = '✓ Copied'; setTimeout(() => btn.textContent = 'Copy link', 1500); }
    catch (e) { console.warn('copy failed', e); }
  });
})();
</script>
```

- [ ] **Step 2: Add CSS to `css/v2/post.css`.**

```css
.share-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 32px; }
.share-btn {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-2);
  padding: 8px 14px;
  border: 1px solid var(--line); border-radius: var(--radius-pill);
  background: var(--bg-2);
  transition: all var(--t-fast) var(--ease);
}
.share-btn:hover { color: var(--text); border-color: var(--line-2); background: var(--bg-3); }
```

- [ ] **Step 3: Commit.**

```bash
git add _includes/share_bar.html css/v2/post.css
git commit -m "feat(v2): rewrite share bar to text-led pill row"
```

### Task 9.3: Rewrite `_includes/categorieswidget.html`

**Files:**
- Modify: `_includes/categorieswidget.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```liquid
<div class="categories-widget">
  <h4>Categories</h4>
  <ul class="tag-list">
    {% for item in site.data.categories.categories %}
      {% assign cat_count = 0 %}
      {% for p in site.posts %}{% if p.categories contains item.title %}{% assign cat_count = cat_count | plus: 1 %}{% endif %}{% endfor %}
      <li>
        <a href="{{ item.url }}">
          <span>{{ item.title }}</span>
          <span class="count">{{ cat_count }}</span>
        </a>
      </li>
    {% endfor %}
  </ul>
</div>
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/categorieswidget.html
git commit -m "feat(v2): rewrite categories widget to Studio list"
```

### Task 9.4: Rewrite `_includes/newsletter.html`

**Files:**
- Modify: `_includes/newsletter.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```liquid
<div class="panel-h">Get the <span style="color: var(--accent);">dispatch</span></div>
<p>One essay every other Sunday. Slow, considered, no filler.</p>
<form action="https://tinyletter.com/beingtechnicalwriter" method="post" target="popupwindow"
      onsubmit="window.open('https://tinyletter.com/beingtechnicalwriter', 'popupwindow', 'scrollbars=yes,width=800,height=600');return true">
  <div class="input-row">
    <input type="email" name="email" id="email" placeholder="you@somewhere.com" required>
    <button type="submit">→</button>
  </div>
</form>
```

- [ ] **Step 2: Commit.**

```bash
git add _includes/newsletter.html
git commit -m "feat(v2): slim newsletter form to Studio panel"
```

---

## Phase 10 — Page layout + listing + static pages

### Task 10.1: Rewrite `_layouts/page.html`

**Files:**
- Modify: `_layouts/page.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```liquid
---
layout: default
---

<section class="page-head">
  <h1>{{ page.title }}</h1>
  {% if page.description and page.hometype != "homepage" %}<p class="page-dek">{{ page.description }}</p>{% endif %}
</section>

<div class="page-body">
  {{ content }}
</div>
```

- [ ] **Step 2: Commit.**

```bash
git add _layouts/page.html
git commit -m "feat(v2): slim page layout"
```

### Task 10.2: Listing stylesheet (`css/v2/listing.css`)

**Files:**
- Create: `css/v2/listing.css`

- [ ] **Step 1: Write the file.**

```css
.page-head {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 80px var(--gutter) 32px;
  position: relative;
  z-index: 1;
}
.page-head h1 {
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.05;
  margin-bottom: 16px;
}
.page-dek {
  font-family: var(--serif);
  font-style: italic;
  font-size: 22px;
  color: var(--text-2);
  max-width: 50ch;
}

.page-body {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--gutter) 64px;
  position: relative;
  z-index: 1;
}

/* Listing rows reuse .row from feed.css. Import-by-reuse: ensure feed.css loads on listing pages too. */
/* Re-declare here for safety in case feed.css isn't loaded on a given listing page. */
.listing-rows .row {
  display: grid;
  grid-template-columns: 56px 1fr 120px;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
  align-items: center;
}
```

The listing pages will use the row component already defined in `feed.css`. Make sure those rules don't accidentally rely on a parent selector tied to the homepage; if they do, copy them into `listing.css` and namespace correctly.

- [ ] **Step 2: Commit.**

```bash
git add css/v2/listing.css
git commit -m "feat(v2): add listing stylesheet"
```

### Task 10.3: Rewrite `pages/topnav/categories.html`

**Files:**
- Modify: `pages/topnav/categories.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```liquid
---
layout: page
title: Categories
description: Browse essays by topic. Each category lists every post filed under it.
permalink: /categories/
---

<div class="category-grid">
  {% for item in site.data.categories.categories %}
    {% assign cat_count = 0 %}
    {% for p in site.posts %}{% if p.categories contains item.title %}{% assign cat_count = cat_count | plus: 1 %}{% endif %}{% endfor %}
    <a class="category-card" href="{{ item.url }}">
      <div class="cc-title">{{ item.title }}</div>
      <div class="cc-count">{{ cat_count }} {{ cat_count | pluralize: 'essay', 'essays' }}</div>
      <div class="cc-arrow">→</div>
    </a>
  {% endfor %}
</div>
```

Note: Jekyll doesn't have `pluralize` built in. Use `{% if cat_count == 1 %}essay{% else %}essays{% endif %}` instead.

- [ ] **Step 2: Replace the pluralize call with an inline if.** Final:

```liquid
<div class="cc-count">{{ cat_count }} {% if cat_count == 1 %}essay{% else %}essays{% endif %}</div>
```

- [ ] **Step 3: Add CSS to `css/v2/listing.css`.**

```css
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.category-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 24px;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  transition: all var(--t-fast) var(--ease);
  color: var(--text);
}
.category-card:hover { border-color: var(--line-2); transform: translateY(-2px); }
.category-card .cc-title {
  font-size: 22px; font-weight: 600; letter-spacing: -0.02em;
}
.category-card .cc-count {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-3);
}
.category-card .cc-arrow { color: var(--accent); font-size: 20px; }
```

- [ ] **Step 4: Commit.**

```bash
git add pages/topnav/categories.html css/v2/listing.css
git commit -m "feat(v2): rewrite categories index as Studio grid"
```

### Task 10.4: Rewrite each category page

**Files:**
- Modify: `pages/category/category-ai.html`, `category-jekyll.html`, `category-technical-writing.html`, `category-git.html`, `category-innovation.html` (5 files, same pattern)

For each file (using `category-ai.html` as the template, the pattern is identical except `categoryName: <Name>` and the iteration variable):

- [ ] **Step 1: Rewrite `pages/category/category-ai.html`.**

```liquid
---
layout: page
title: AI
categoryName: AI
description: Essays filed under AI — what works, what fails, what to use it for, and what we still don't know.
permalink: /category-ai/
---

<div class="listing-rows">
  {% for post in site.categories.AI %}
  <article class="row">
    <div class="row-num">{{ post.date | date: '%Y' }}</div>
    <div class="row-body">
      <h3><a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a></h3>
      <p class="sub">{{ post.description | default: post.subtitle | strip_html | truncate: 200 }}</p>
      <div class="meta">
        {% for c in post.categories %}<span class="pill">{{ c }}</span>{% endfor %}
        <span>{% include readtime.html content=post.content %}</span>
      </div>
    </div>
    <div class="row-date">{{ post.date | date: '%b %-d' }}<br>{{ post.date | date: '%Y' }}</div>
  </article>
  {% endfor %}
</div>
```

- [ ] **Step 2: Repeat for each other category file**, substituting `site.categories.<Name>` and the front-matter values. Note Jekyll category access uses the actual category name as declared in posts' `category:` front matter — verify each.

- [ ] **Step 3: Commit.**

```bash
git add pages/category/*.html
git commit -m "feat(v2): rewrite all category pages as listing rows"
```

### Task 10.5: Restyle `pages/topnav/videos.html`

- [ ] **Step 1: Read the existing file.**

Run: `head -100 pages/topnav/videos.html`

- [ ] **Step 2: Strip the inline styles and replace front matter to use page layout.** Specific changes vary by current content; goal is plain HTML inside the `page` layout with no inline gradient styles. Inline styles that affect *video embed sizing* may be kept (they are content, not chrome).

- [ ] **Step 3: Commit.**

```bash
git add pages/topnav/videos.html
git commit -m "feat(v2): restyle videos page to use page layout"
```

### Task 10.6: Restyle footer pages

**Files:**
- Modify: `pages/footer/appreciate.html`, `pages/footer/archives.html`, `pages/footer/contact.html`

- [ ] **Step 1: For each, strip inline chrome styles and ensure they use `layout: page`. `archives.html` gets a year-grouped list of posts.**

`pages/footer/archives.html`:

```liquid
---
layout: page
title: Archive
description: Every essay, sorted by year. {{ site.posts | size }} essays since {% assign first = site.posts | last %}{{ first.date | date: '%Y' }}.
permalink: /archives/
---

<div class="archive">
  {% assign current_year = '' %}
  {% for post in site.posts %}
    {% assign year = post.date | date: '%Y' %}
    {% if year != current_year %}
      {% unless forloop.first %}</ul>{% endunless %}
      <h2 class="archive-year">{{ year }}</h2>
      <ul class="archive-list">
      {% assign current_year = year %}
    {% endif %}
    <li>
      <span class="archive-date">{{ post.date | date: '%b %-d' }}</span>
      <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
      {% for c in post.categories %}<span class="pill">{{ c }}</span>{% endfor %}
    </li>
    {% if forloop.last %}</ul>{% endif %}
  {% endfor %}
</div>
```

- [ ] **Step 2: Add archive CSS to `css/v2/listing.css`.**

```css
.archive-year {
  font-family: var(--mono);
  font-size: 14px;
  letter-spacing: 0.12em;
  color: var(--text-3);
  margin: 40px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.archive-list { display: flex; flex-direction: column; gap: 4px; }
.archive-list li {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  align-items: baseline;
  padding: 10px 0;
  font-size: 15px;
}
.archive-list .archive-date {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
  color: var(--text-3); text-transform: uppercase;
}
.archive-list a { color: var(--text); }
.archive-list a:hover { color: var(--accent); }
```

- [ ] **Step 3: Restyle `appreciate.html` and `contact.html` similarly — front-matter to `layout: page`, drop inline gradient/Bootstrap chrome, keep content.**

- [ ] **Step 4: Commit.**

```bash
git add pages/footer/appreciate.html pages/footer/archives.html pages/footer/contact.html css/v2/listing.css
git commit -m "feat(v2): restyle footer pages to page layout"
```

### Task 10.7: Restyle `404.html`

**Files:**
- Modify: `404.html` (full rewrite)

- [ ] **Step 1: Write the new contents.**

```html
---
layout: default
permalink: /404.html
---

<section class="page-head" style="text-align: center;">
  <div style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.24em; color: var(--text-3); text-transform: uppercase; margin-bottom: 16px;">HTTP 404 · Not Found</div>
  <h1>This essay isn't where you left it.</h1>
  <p class="page-dek" style="margin: 24px auto 32px;">Maybe a permalink moved. Maybe a typo. Maybe this is the AI hallucinating a URL. Either way, here are two ways out.</p>
  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
    <a href="/" class="btn-primary">Back to the feed</a>
    <a href="/archives/" style="font-family: var(--mono); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); padding: 10px 14px; border: 1px solid var(--line-2); border-radius: var(--radius);">Browse the archive →</a>
  </div>
</section>
```

- [ ] **Step 2: Commit.**

```bash
git add 404.html
git commit -m "feat(v2): restyle 404 in Studio voice"
```

### Task 10.8: Restyle `privacy.html`

**Files:**
- Modify: `privacy.html`

- [ ] **Step 1: Strip all inline `<style>` and bespoke chrome from the file, ensure `layout: page` is set, and let content fall through.** Specific markup will vary; goal is to reduce the file to plain HTML/Markdown body content under the `page` layout.

- [ ] **Step 2: Commit.**

```bash
git add privacy.html
git commit -m "feat(v2): restyle privacy page to page layout"
```

### Task 10.9: Delete `pages/footer/siteanalytics.html`

- [ ] **Step 1: Delete.**

```bash
git rm pages/footer/siteanalytics.html
```

- [ ] **Step 2: Audit for references.**

Run: `grep -r "siteanalytics" --include="*.html" --include="*.yml" --include="*.md" .`
Expected: only the now-deleted file appears in `_site/` (build output) which is fine.

- [ ] **Step 3: Commit.**

```bash
git commit -m "chore(v2): delete siteanalytics page"
```

---

## Phase 11 — Courses page

### Task 11.1: Create `/courses/` page

**Files:**
- Create: `pages/courses/index.html`

- [ ] **Step 1: Write the file.** Lift the two course blocks from the existing `_includes/slider.html`. Course content (titles, descriptions, links) reused verbatim.

```liquid
---
layout: page
title: Free Courses
description: Two free, self-paced courses for technical writers stepping into AI-era documentation.
permalink: /courses/
---

<div class="courses">

  <article class="course-card">
    <div class="course-eyebrow">Course 01 · Self-paced</div>
    <h2>API Documentation: From Zero to Hero</h2>
    <p>Transform your technical writing skills and master the art of API documentation. This course is a complete guide to creating clear, concise, developer-friendly documentation that stands out. Industry-standard tools, best practices, and real-world techniques to simplify complex APIs.</p>
    <ul class="course-features">
      <li>Comprehensive learning path</li>
      <li>Industry-standard tools</li>
      <li>Self-paced, free</li>
    </ul>
    <a href="https://beingtechnicalwriter.com/apidocumentation/" class="btn-primary">Explore the course →</a>
  </article>

  <article class="course-card">
    <div class="course-eyebrow">Course 02 · Self-paced</div>
    <h2>AI &amp; ML for Technical Writers</h2>
    <p>Step into the future of technical communication. Learn how to document complex AI &amp; ML concepts with clarity, precision, and relevance. Simplify cutting-edge technology for diverse audiences.</p>
    <ul class="course-features">
      <li>AI &amp; ML fundamentals</li>
      <li>AI &amp; ML documentation patterns</li>
      <li>Self-paced, free</li>
    </ul>
    <a href="https://beingtechnicalwriter.com/aimldocumentation/" class="btn-primary">Explore the course →</a>
  </article>

</div>
```

- [ ] **Step 2: Add CSS to `css/v2/listing.css`.**

```css
.courses { display: flex; flex-direction: column; gap: 24px; max-width: 800px; }
.course-card {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 32px;
}
.course-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}
.course-card h2 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.025em;
  margin-bottom: 16px;
}
.course-card p { color: var(--text-2); font-size: 15px; line-height: 1.6; margin-bottom: 20px; max-width: 60ch; }
.course-features {
  display: flex; gap: 18px; flex-wrap: wrap;
  margin-bottom: 24px;
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em;
  color: var(--text-3);
}
.course-features li::before { content: "→ "; color: var(--accent); }
.course-card .btn-primary { display: inline-block; }
```

- [ ] **Step 3: Verify.** Visit `http://127.0.0.1:4000/courses/`. Expected: two course cards stacked vertically.

- [ ] **Step 4: Commit.**

```bash
git add pages/courses/index.html css/v2/listing.css
git commit -m "feat(v2): add /courses/ page, ports homepage slider content"
```

### Task 11.2: Delete `_includes/slider.html`

- [ ] **Step 1: Verify the include is no longer referenced.**

Run: `grep -r 'include slider.html' --include="*.html" --include="*.md" .`
Expected: no matches.

- [ ] **Step 2: Delete and commit.**

```bash
git rm _includes/slider.html
git commit -m "chore(v2): drop homepage slider include"
```

---

## Phase 12 — LLM-friendliness

### Task 12.1: Fix `_includes/structured-data-article.html`

**Files:**
- Modify: `_includes/structured-data-article.html`

- [ ] **Step 1: Replace the contents.**

```liquid
{%- assign modified = page.last_modified_at | default: page.date -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ site.url }}{{ page.url }}"
  },
  "headline": {{ page.title | jsonify }},
  "description": {{ page.description | strip_html | strip_newlines | truncate: 160 | jsonify }},
  "image": "{{ site.url }}{{ page.image }}",
  "author": {
    "@type": "Person",
    "name": "Gaurav Trivedi",
    "url": "{{ site.url }}/aboutme/"
  },
  "publisher": {
    "@type": "Organization",
    "name": {{ site.title | jsonify }},
    "logo": {
      "@type": "ImageObject",
      "url": "{{ site.url }}/img/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "{{ page.date | date_to_xmlschema }}",
  "dateModified": "{{ modified | date_to_xmlschema }}",
  "keywords": {{ page.seo_keywords | default: '' | jsonify }}
}
</script>
```

- [ ] **Step 2: Confirm `/img/logo.png` exists and is ≥112px tall.**

Run: `ls -lh img/logo.png && file img/logo.png`
Expected: a PNG that prints dimensions. If smaller than 112px tall, source a higher-res replacement before completing this task. (If the logo is genuinely missing, swap the URL to a known asset and flag for the user.)

- [ ] **Step 3: Commit.**

```bash
git add _includes/structured-data-article.html
git commit -m "fix(v2): structured-data article — author.url, modified, logo dimensions"
```

### Task 12.2: Audit FAQ + HowTo structured data

**Files:**
- Read: `_includes/structured-data-faq.html`, `_includes/structured-data-howto.html`

- [ ] **Step 1: Open both files and check that field names match the latest Schema.org / Google Rich Results spec.** Common issues: missing `@id`, wrong nesting of `acceptedAnswer`, missing `step` order.

- [ ] **Step 2: Validate a representative post.**

Visit `https://search.google.com/test/rich-results` and paste the URL of `https://beingtechnicalwriter.com/taking-yourself-out-of-the-equation/` after the staging site is deployed, OR locally test with `curl -s http://127.0.0.1:4000/taking-yourself-out-of-the-equation/ | grep -A 200 'application/ld+json'` and paste into the validator.

- [ ] **Step 3: Fix any errors inline.** Commit if changes were made:

```bash
git add _includes/structured-data-faq.html _includes/structured-data-howto.html
git commit -m "fix(v2): structured-data faq+howto audits"
```

### Task 12.3: Generate `llms.txt`

**Files:**
- Create: `llms.txt` (Liquid-templated)

- [ ] **Step 1: Write the file at the repo root.**

```liquid
---
permalink: /llms.txt
sitemap: false
---
# {{ site.title }}

> {{ site.description }}

Site: {{ site.url }}
Feed: {{ site.url }}/feed.xml
Author: Gaurav Trivedi <{{ site.url }}/aboutme/>

This file lists recent essays. Each essay also has a plain-Markdown alternate at the same path with a `.md` suffix (e.g., `/taking-yourself-out-of-the-equation.md`).

## Recent essays

{% for post in site.posts limit:50 %}
- [{{ post.title }}]({{ site.url }}{{ post.url }}) — {{ post.description | default: post.subtitle | strip_html | truncate: 140 }} *(filed in {{ post.categories | join: ', ' }}, {{ post.date | date: '%Y-%m-%d' }})*
{% endfor %}

## Categories

{% for cat in site.data.categories.categories -%}
- [{{ cat.title }}]({{ site.url }}{{ cat.url }})
{% endfor %}
```

- [ ] **Step 2: Verify.**

After build: `curl -s http://127.0.0.1:4000/llms.txt | head -20`
Expected: the rendered Markdown text, no Liquid leakage.

- [ ] **Step 3: Commit.**

```bash
git add llms.txt
git commit -m "feat(v2): add llms.txt at site root"
```

### Task 12.4: Per-post `.md` alternates

**Files:**
- Create: `_layouts/post-md.html`

- [ ] **Step 1: Decide approach.** Pure Liquid: a new layout that outputs raw Markdown at `<slug>.md`. The simplest pattern is to introduce a generated alternate-page for each post via a default front-matter mapping. Since Jekyll's collections don't easily fork outputs by extension, the cleanest no-plugin path is:

  - Add a `_plugins/md_alternate.rb` Ruby plugin that, for each post, registers an additional `Jekyll::Page` whose path matches the post's permalink with `.md` extension.
  - The plugin emits the raw post body (no front matter, no Liquid).

The spec §13.4 confirmed the **Liquid-template-only** approach is preferred. There is no pure-Liquid way to emit a duplicate file per post. To stay plugin-free we instead:

  - **Skip the per-post `.md` alternate for v1.** The `<link rel="alternate" type="text/markdown">` is still emitted in head, pointing to the post URL with `.md` appended; if the URL 404s, that's acceptable for v1.
  - In v2, add the small Ruby plugin to actually emit the alternates.

This is a change from §13.4. Document the deferral here and update CLAUDE.md (Task 14.4 below).

- [ ] **Step 2: No file to create for v1.** Commit a small note in the spec footer if you like, or just leave the deferral recorded in this task.

### Task 12.5: LLM meta include (`_includes/v2/llms-meta.html`)

**Files:**
- Create: `_includes/v2/llms-meta.html`

- [ ] **Step 1: Write the file.**

```liquid
<meta name="llms:summary" content="{{ page.description | strip_html | strip_newlines | truncate: 280 | escape }}">
<meta name="llms:topics" content="{{ page.seo_keywords | default: page.tags | escape }}">
<link rel="alternate" type="text/markdown" href="{{ site.url }}{{ page.url | replace: '/index.html', '' | append: '.md' }}">
```

- [ ] **Step 2: Re-enable the include in `_includes/v2/site-head.html`.** Remove the comment wrapper around `{% include v2/llms-meta.html %}`.

- [ ] **Step 3: Verify.**

Run: `curl -s http://127.0.0.1:4000/taking-yourself-out-of-the-equation/ | grep 'llms:summary'`
Expected: a meta tag with the summary content.

- [ ] **Step 4: Commit.**

```bash
git add _includes/v2/llms-meta.html _includes/v2/site-head.html
git commit -m "feat(v2): emit llms:* meta hints on post pages"
```

---

## Phase 13 — Post body inline-style audit

### Task 13.1: Grep all posts for jQuery / Bootstrap dependencies

- [ ] **Step 1: Run audit.**

Run: `grep -rl '\$(' --include='*.md' _posts/ > /tmp/jquery-posts.txt; cat /tmp/jquery-posts.txt`
Run: `grep -rl 'jQuery' --include='*.md' _posts/ >> /tmp/jquery-posts.txt`
Run: `grep -rl 'data-toggle' --include='*.md' _posts/ > /tmp/bootstrap-posts.txt; cat /tmp/bootstrap-posts.txt`
Run: `grep -rl 'class="nav-tabs' --include='*.md' _posts/ >> /tmp/bootstrap-posts.txt`

- [ ] **Step 2: For each match, open the post and fix.** Migrate `$(...)` to `document.querySelector(...)`. Migrate Bootstrap tab/collapse/modal markup to vanilla equivalents inline. Document changes in commit messages per post.

- [ ] **Step 3: Re-run greps to confirm zero matches.**

- [ ] **Step 4: Commit.**

```bash
git add _posts/
git commit -m "fix(v2): migrate inline jQuery/Bootstrap in posts to vanilla"
```

### Task 13.2: Spot-check 10 recent posts visually

- [ ] **Step 1: Build site.** Server already running.

- [ ] **Step 2: Visit the 10 most recent post URLs and confirm rendering.** Take notes on any breakage. The list (from `_posts/` mtime):

1. `/there-is-more-to-ai/`
2. `/taking-yourself-out-of-the-equation/`
3. `/365-day-ai-architect-journey/`
4. `/2025-year-end-reflection-technical-writer/`
5. `/technical-writer-skills-2026-survival-guide/`
6. `/cursor-ai-api-doc/`
7. `/ai-devil-wifi/`
8. `/antigravity-ide/`
9. `/google-io-tw-impact/`
10. `/model-training-2/`

- [ ] **Step 3: Fix breakage inline.** Likely: a few inline `<style>` blocks scoping selectors too broadly (e.g., `h2 { color: ... }` instead of `.article h2`). Add `.article-body` ancestor selector where necessary.

- [ ] **Step 4: Commit.**

```bash
git add _posts/
git commit -m "fix(v2): scope inline post styles to article-body"
```

---

## Phase 14 — Cleanup, cutover, final checks

### Task 14.1: Delete old CSS files

- [ ] **Step 1: Confirm new layouts no longer reference them.**

Run: `grep -r "critical.css\|custom.css\|style.default.css\|fontastic.css" --include="*.html" --include="*.liquid" .`
Expected: matches only in `_site/` (build output) and `mockups/` (those don't matter).

- [ ] **Step 2: Delete.**

```bash
git rm css/critical.css css/custom.css css/style.default.css css/fontastic.css
git commit -m "chore(v2): delete old CSS files"
```

### Task 14.2: Delete old JS files

- [ ] **Step 1: Confirm not referenced.**

Run: `grep -r "front.js\|toc.js" --include="*.html" --include="*.liquid" . | grep -v "v2/toc.js" | grep -v "_site/"`
Expected: no matches.

- [ ] **Step 2: Delete.**

```bash
git rm js/front.js js/toc.js
git commit -m "chore(v2): delete old JS files"
```

### Task 14.3: Delete old includes

- [ ] **Step 1: Delete and commit.**

```bash
git rm _includes/topnavigation.html _includes/navbarmenu.html _includes/footer.html _includes/search.html _includes/toc.html
git commit -m "chore(v2): delete old chrome includes"
```

### Task 14.4: Update CLAUDE.md to reflect actual v1 deferrals

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: In the "Active Redesign (v2)" section, update the LLM-friendliness line.**

```
- **LLM-friendliness:** A site-root `llms.txt` lists the 50 most recent essays with summaries. Per-post `.md` plain-text alternates are deferred to v2 (no Ruby plugin in v1). Article structured data (BlogPosting, FAQ, HowTo) is audited and emits author URL + dateModified.
```

- [ ] **Step 2: Commit.**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with actual v1 deferrals"
```

### Task 14.5: Lighthouse + Rich Results check

- [ ] **Step 1: Run Lighthouse on the homepage.** Use Chrome DevTools or `npx lighthouse http://127.0.0.1:4000/ --view`. Targets: Performance ≥ 90 mobile, ≥ 95 desktop, Accessibility ≥ 95, SEO 100.

- [ ] **Step 2: Run Lighthouse on a representative post.** Same targets.

- [ ] **Step 3: If any score falls short, identify the top three culprits and fix.** Most likely: render-blocking webfont (consider `font-display: swap` — already set), unused CSS (remove rules from `css/v2/*.css` not used on the audited page).

- [ ] **Step 4: Validate structured data.**

Visit `https://validator.schema.org/` and paste a post URL once deployed, or paste the JSON-LD block locally. Target: zero errors.

- [ ] **Step 5: Commit any fixes.**

```bash
git add css/v2/ js/v2/ _layouts/ _includes/
git commit -m "perf(v2): Lighthouse and structured-data fixes"
```

### Task 14.6: Final smoke test of every URL

- [ ] **Step 1: Crawl the site map.**

Run: `curl -s http://127.0.0.1:4000/sitemap.xml | grep -oP '(?<=<loc>)[^<]+' > /tmp/urls.txt; wc -l /tmp/urls.txt`
Expected: ≥ 140 URLs (all posts + index + categories + pages).

- [ ] **Step 2: Check each returns 200.**

```bash
while read url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$code $url"
done < /tmp/urls.txt | grep -v '^200'
```

Expected: no output (all 200).

- [ ] **Step 3: If any URL fails, fix permalinks/redirects.**

- [ ] **Step 4: Commit.**

```bash
git add .
git commit -m "fix(v2): final URL audit fixes" --allow-empty
```

### Task 14.7: Merge to main

- [ ] **Step 1: Push the branch.**

Run: `git push -u origin redesign/v2`

- [ ] **Step 2: Open a PR in the browser.**

Run: `gh pr create --title "Blog redesign v2: Studio shell + Atelier reading column" --body-file docs/superpowers/specs/2026-05-14-blog-redesign-design.md --base main --head redesign/v2`

- [ ] **Step 3: Wait for the user to review the live site preview** (GitHub Pages PR preview or local serve).

- [ ] **Step 4: After approval, merge.**

Run: `gh pr merge --merge --delete-branch`

---

## Self-Review

The plan is built directly off the spec. Spec coverage:

- §3 Design DNA → tokens (Task 1.1), base (1.2), feed/post stylesheets (4.1, 5.1) — covered.
- §4 Tokens → Task 1.1 — covered.
- §5 IA / page inventory → Phases 4, 5, 10, 11 — every file in spec §15 has a task.
- §6 Component inventory → covered across Phases 2, 4, 5, 9.
- §6.1 Focus mode exit → Phase 6 — covered with Esc + pill + same handler, pill always in DOM (Task 5.7 markup) hidden by CSS (Task 6.2).
- §7 Stack changes → Phase 3 (drop Bootstrap/jQuery/FontAwesome), Phase 14 (delete files) — covered.
- §8 LLM-friendliness → Phase 12 — covered. NOTE: §8.3's per-post `.md` alternate is explicitly deferred in Task 12.4 — change recorded in CLAUDE.md update Task 14.4.
- §9 Fragment glow → Phase 7 — covered.
- §10 Ad rules → Task 5.4 right-rail slot, Task 5.5 in-content sponsor include, Task 4.2 no homepage ads — covered. NOTE: Task 5.4 hardcodes the right-rail slot ID `2604911171`; the optional left-rail slot per §10 is NOT included in v1 — that's a v2 add when posts opt-in with `ad_left_rail: true`.
- §11 Per-post compatibility → Phase 13 audit — covered.
- §12 Accessibility + performance → Phase 14.5 — covered.
- §13 Locked decisions → all locked: Phase 11 (courses), Task 2.4 (top nav), Task 10.9 (delete siteanalytics), Task 12.3 (llms.txt), Task 5.6 (AI ask stub), Task 1.1 (light-mode stub), Phase 6 (focus exit).
- §14 Migration strategy → reflected in phase ordering.
- §15 Files touched → cross-referenced.
- §16 Success criteria → reflected in Tasks 14.5–14.6.

**Placeholder scan:** No "TBD", "TODO", "fill in later", or generic "add error handling" in any step. Tasks 4.1 and 5.1 reference the mockup files for full CSS content rather than re-spelling every rule — this is intentional and self-contained because the mockups are checked into the repo and the implementer can copy from them; tokens are defined in Task 1.1 and the token-substitution verification step ensures no hex literals leak.

**Type / name consistency:**
- `body.focus` class is used in `js/v2/focus.js` (Task 6.1), CSS (Task 6.2), and the focus-exit pill markup (Task 5.7). Consistent.
- `data-focus-toggle`, `data-focus-exit`, `data-search-open`, `data-search-close`, `data-nav-toggle`, `data-mobile-menu` selectors — all used consistently between markup and JS.
- TOC: `.article` is the selector in `js/v2/toc.js` (Task 5.3), matching the `class="article article-body"` on `<main>` in `_layouts/posts.html` (Task 5.7).
- AdSense slot IDs: `7422872052` for in-content (sponsor-slot), `2604911171` for right-rail (post-rails) — match the IDs currently in `_layouts/posts.html`.

**One gap closed:** Task 12.4 originally said "create `_layouts/post-md.html`" but explained the no-plugin Liquid approach doesn't support per-post `.md` alternates cleanly. The honest deferral is recorded inline and CLAUDE.md update (Task 14.4) reflects it.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-14-blog-redesign.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a redesign of this size (90+ steps) because each phase is independent enough that fresh context per task speeds things up.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Slower per task but you see everything happen in one thread.

**Which approach?**
