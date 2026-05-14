# Blog Redesign — Studio Shell + Atelier Reading Column

**Status:** Approved design, ready for implementation planning
**Date:** 2026-05-14
**Owner:** Gaurav Trivedi
**Reference mockups:**
- [`mockups/studio-home.html`](../../../mockups/studio-home.html) — homepage direction
- [`mockups/studio-post.html`](../../../mockups/studio-post.html) — post chrome / system styling
- [`mockups/atelier-post.html`](../../../mockups/atelier-post.html) — post reading-column layout (drop cap, prose rhythm, blockquote treatment) to be ported into the Studio palette

---

## 1. Why we are doing this

The current site is a Bootstrap 4 + jQuery + AdSense-injection theme that has accumulated bespoke styles per surface (gradient nav with particles, dark glassmorphism search overlay, dark gradient footer, custom hero slider with "Free courses" tabs). The result is visually inconsistent, slow, and signals the wrong thing for an AI-era technical writing publication: it looks like a generic monetized template, not a working journal by someone shipping AI tools.

The redesign has three objectives, in priority order:

1. **Aesthetic credibility.** Move to a coherent design system that signals technical authority on first impression — comparable to Linear, Stripe, and Vercel reference points the user studies.
2. **AI-era readiness.** Make the DOM semantically clean and machine-readable so LLM agents, RAG pipelines, and AI search engines can parse the content correctly. Support deep-link fragment highlighting from AI referrers.
3. **Revenue protection.** Keep AdSense revenue with a *single, designed-in* in-article slot, *one* sticky right-rail unit, and *one* sticky left-rail unit on long posts. No homepage ads. No injected stacks.

## 2. Scope

### In scope (this spec)

- New design system: tokens, typography, color, spacing, motion.
- Replacement of `_layouts/default.html`, `_layouts/posts.html`, `_layouts/page.html`.
- Replacement / rewrite of the includes that define visual chrome.
- New CSS (replacing `critical.css`, `custom.css`, `style.default.css`, `fontastic.css`).
- New JS (vanilla, replacing the Bootstrap + jQuery dependencies).
- Restyle of `index.html`, `pages/topnav/*`, `pages/category/*`, `pages/footer/*`, `404.html`, `privacy.html`.
- LLM-friendly DOM, JSON-LD audit, `/llms.txt` and per-post `.md` plain variant.
- Fragment-highlight JS for AI deep links.
- Sticky designed-in ad slots (rules in §10).
- An on-post "Focus" toggle that hides chrome + ads for distraction-free reading.

### Explicitly out of scope (deferred)

- Inline RAG widget ("ask this essay" answering with grounded inference) — needs backend.
- Generative UI / live code playgrounds — needs backend.
- Migration of post body Markdown. Posts stay as-is. Per-post inline `<style>` blocks (see §11) must keep working under the new shell.
- Disqus replacement.
- Newsletter platform migration (TinyLetter stays).
- Search engine swap (Simple Jekyll Search stays, gets a Studio command-palette skin).

## 3. Design DNA

Two complementary directions, fused:

| Surface | Direction | Why |
|---|---|---|
| **Global chrome** (nav, footer, homepage feed, listings, category pages, 404) | **Studio** | Dark, system-app feel, mono metadata, blueprint grid, single electric-blue accent. Signals technical authority on landing. |
| **Article body** (the reading column inside a post) | **Atelier reading rhythm in Studio palette** | Dark Studio surface, but with Atelier's editorial type-driven prose: 21px serif-influenced reading, drop cap on lede, dramatic blockquotes, italic emphasis, "standalone" paragraph treatment. Honors Gaurav's literary voice (Nolan / Maté / Naval / Ramsey) where the words are doing the work. |

The two combine cleanly because Atelier's reading rhythm is a typographic system, not a visual chrome. We use Studio's fonts and colors but Atelier's pacing, drop cap, and pull-quote choreography.

## 4. Design tokens

All tokens live in `:root` in the new global stylesheet. No magic numbers in component CSS.

### 4.1 Color

```
/* Dark default (only theme for v1) */
--bg:          #0A0A0B;   /* page */
--bg-2:        #111114;   /* panel */
--bg-3:        #18181C;   /* recessed surface */
--line:        #1F1F25;   /* hairline */
--line-2:      #2A2A33;   /* hairline on hover */
--text:        #EDEDF0;   /* primary type */
--text-2:      #A0A0AA;   /* secondary type */
--text-3:      #5A5A66;   /* tertiary / muted */
--accent:      #5B8DEF;   /* electric blue — single accent */
--accent-2:    #3E7BFB;   /* hover / focus state */
--accent-glow: rgba(91,141,239,0.18);
--signal:      #FFD23F;   /* AI-deep-link highlight only */
--green:       #4ADE80;   /* live / status only */
--highlight:   rgba(255,210,63,0.18); /* fragment-glow bg */
```

Light mode is **deferred to v2** — we ship dark-first to preserve the design DNA and reduce v1 scope. Add a stub `prefers-color-scheme: light` block with sensible fallbacks but do not iterate on it for v1.

### 4.2 Type

```
--sans:  "Geist", -apple-system, BlinkMacSystemFont, sans-serif;
--mono:  "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
--serif: "Instrument Serif", Georgia, serif;
```

Load via Google Fonts with `preconnect` + a single `<link>` request (one stylesheet href).

Type roles:

- **Display** — Geist 600/700 with negative tracking. Used for h1, h2, big numerals.
- **Body sans** — Geist 400 for UI, panels, chrome.
- **Body reading** — Geist 400 at 18–20px (Studio is sans-led, no body serif). For post body we use Geist at **19px / 1.7 line-height** plus `font-feature-settings: "kern", "liga"`.
- **Italic emphasis & "standalone" prose** — Instrument Serif italic for pull quotes, lede emphasis, drop cap. This is where Atelier's voice enters.
- **Metadata, dates, tags, code, version chips, kbd shortcuts, breadcrumbs** — Geist Mono.

### 4.3 Spacing & Layout

```
--page-max: 1400px;          /* feed pages */
--article-frame-max: 1400px; /* article wrapper */
--reading-measure: 68ch;     /* article body column */
--gutter: 32px;
--gutter-sm: 16px;
--radius: 8px;
--radius-lg: 12px;
--radius-pill: 999px;
```

### 4.4 Motion

- Default transition: `150ms` `cubic-bezier(0.4, 0, 0.2, 1)`.
- Reveal: subtle 8px translate + opacity on scroll-into-view (IntersectionObserver), once per element.
- Reading progress bar: 2px top, `var(--accent)` → `var(--signal)` gradient, transition `150ms` linear.
- Honor `prefers-reduced-motion: reduce` — disable all transforms, fade in instantly.

## 5. Information architecture

### 5.1 Pages affected (full list)

| File | Action | Notes |
|---|---|---|
| `index.html` | Rewrite | New feed: Studio hero stats, pinned lead, list rows. Drop hero slider include and intro section. |
| `_layouts/default.html` | Replace | New head, new nav include, new footer include, no slider/intro/newsletter sections embedded — those are now homepage-only blocks. |
| `_layouts/posts.html` | Replace | 3-column article frame: left TOC rail, reading column, right sponsor + AI prompts rail. Atelier reading rhythm inside Studio surface. |
| `_layouts/page.html` | Replace | Simple Studio surface for static pages. No left/right rails by default. |
| `404.html` | Restyle | Studio mono empty-state. |
| `privacy.html` | Restyle | Strip inline gradient styles, inherit page layout. Content unchanged. |
| `pages/topnav/categories.html` | Rewrite | Drop the bespoke "categories hero" accordion. Use a Studio grid of category cards. |
| `pages/topnav/videos.html` | Restyle | Match page layout. |
| `pages/category/category-*.html` (5 files) | Rewrite | Use shared Studio listing template (same row pattern as homepage). |
| `pages/footer/appreciate.html` | Restyle | Match page layout. |
| `pages/footer/archives.html` | Rewrite | Studio archive: year-grouped list, mono dates. |
| `pages/footer/contact.html` | Restyle | Match page layout. |
| `pages/footer/siteanalytics.html` | **Delete** | Remove file and any nav reference. (Confirmed §13.3.) |
| `pages/courses/index.html` *(new)* | **Add** | Dedicated `/courses/` page. Holds the API Documentation and AI & ML Essentials course content currently embedded in the homepage slider. (Confirmed §13.1.) |
| `_data/topnavigation.yml` | **Rewrite** | Replace links with `Feed`, `AI`, `Craft`, `Archive`, `About`. (Confirmed §13.2.) |

### 5.2 Includes — keep / rewrite / drop

| Include | Action | Notes |
|---|---|---|
| `topnavigation.html` | **Rewrite** | Drop gradient + particles + 5-icon social cluster + Bootstrap toggler. Replace with Studio sticky nav: logo mark, primary links, search trigger, subscribe button. |
| `navbarmenu.html` | **Rewrite** | Drop Bootstrap collapse. New mobile-friendly menu inside the new nav. |
| `footer.html` | **Rewrite** | Drop dark-gradient w/ purple accent. Replace with a sparse Studio footer: brand mark + status line + 3 link columns + colophon line. |
| `slider.html` | **Drop** | The "Free courses" tab carousel is removed from the homepage. Move its content to a dedicated `/courses/` page if still wanted (decision deferred — flag in §13). |
| `newsletter.html` | **Rewrite** | Slim Studio panel: heading, one-line value prop, email input, submit. Reuse on homepage closer block and as a sidebar card. |
| `categorieswidget.html` | **Rewrite** | Studio "Filter" rail: vertical list with counts. Same data file. |
| `share_bar.html` | **Rewrite** | Studio inline row: text-led labels, mono icons, no FontAwesome dependency. |
| `previousnext.html` | **Rewrite** | Studio paired cards: `← Prev` + `Next →` with title + 1-line dek. Image optional. |
| `adsense.html` | **Keep** | Single script load. |
| `search.html` | **Rewrite** | Drop the fullscreen glassmorphism + Sora font. Replace with a Studio command-palette modal: ⌘K, list of results, keyboard nav. Same `search.json` data, same `SimpleJekyllSearch` library. |
| `toc.html` | **Rewrite** | Drop jQuery TOC plugin. New vanilla generator that builds the left rail from `<h2>` / `<h3>` in `.article-body` after render. IntersectionObserver for active-section highlight. |
| `readtime.html` | **Keep** | Logic is fine; only the wrapper class changes. |
| `categorieswidget.html` | (see above) | |
| `disqus.html` | **Keep** | Wrap in a Studio panel container. |
| `slider.html` | (see drop above) | |
| `goodtoknow.html`, `note.html`, `important.html`, `horizontal.html`, `coffee.html`, `tinyletter.html`, `multiplex.html`, `image-with-alt.html`, `lazy-load-images.html`, `previousnext.html`, `share_bar.html`, `tag_page.html` | **Audit during planning** | Most are post-body utility partials. Style them to inherit from the new design tokens; do not rewrite logic. |
| `structured-data-article.html`, `structured-data-faq.html`, `structured-data-howto.html` | **Keep + audit** | These power LLM-friendliness. Ensure `dateModified`, `author.url`, `publisher.logo` actually populate (currently `dateModified` is hardcoded to `datePublished`). See §8. |
| `google_analytics.html`, `adsense.html` | **Keep** | |

### 5.3 New includes to add

- `_includes/v2/site-head.html` — meta tags, font preconnect, single critical CSS load.
- `_includes/v2/nav.html` — Studio top nav.
- `_includes/v2/foot.html` — Studio footer.
- `_includes/v2/post-toc.html` — left-rail TOC scaffolding (the JS lives in `js/v2/toc.js`).
- `_includes/v2/post-rails.html` — left + right rail HTML.
- `_includes/v2/ai-ask-card.html` — UI shell for the right-rail "Ask this essay" panel. Static prompts only in v1 (clicking a prompt does nothing or opens a "coming soon" modal — copy in spec §13).
- `_includes/v2/sponsor-slot.html` — single in-content AdSense slot wrapper with the designed-in label.
- `_includes/v2/fragment-loader.html` — script tag that wires up §9.
- `_includes/v2/llms-meta.html` — `<link rel="alternate" type="text/markdown" href="...">` for the plain-text variant + `<meta name="llms:summary">` etc.

The `v2/` namespace lets the new template tree coexist with the old includes during migration. Once cutover is complete and verified, remove the old files and flatten the namespace.

## 6. Component inventory

These are the components the new shell exposes. Each must be defined once in CSS and reused.

### Global chrome

- **Top nav.** Sticky, blur-back, hairline-bottom. Slots: logo mark, brand wordmark, primary nav, search trigger with ⌘K kbd, subscribe button.
- **Search command palette.** Modal with keyboard focus trap, fuzzy match list, "Esc" to close. Driven by Simple Jekyll Search + a thin Studio skin.
- **Footer.** Sparse: brand line + status line + 3 link columns + signed colophon (e.g., "Set in Geist + Geist Mono · v4.2.0").

### Homepage feed (`index.html`)

- **Hero block.** Eyebrow chip, large display headline with one italic accent word, value-prop paragraph, stat row (essays, subscribers, run-length, median read).
- **Filter rail (left).** Tag and series filters with counts.
- **Pinned lead card.** Large card with gradient art panel, title, dek, byline, "Read essay →" CTA.
- **Article rows.** Compact rows: `[Nº] [title + sub + meta] [date]` with hover lift.
- **Side panel (right).** System status panel, sponsored slot, newsletter card.
- **Closing block.** Pagination links in mono.

### Post layout (`_layouts/posts.html`)

The post layout has three columns at ≥1100px and collapses to a single column below.

- **Article head.** Pre-tags (category, series, lead-essay badge), h1, italic dek, mono meta bar (author, dates, read time, word count, commit-style id).
- **Left rail.** "Outline" label + active-section TOC + small "JSON-LD ready" status note linking to the `.md` plain variant.
- **Reading column.** Atelier-rhythm prose in Studio palette. Drop cap on first paragraph (Instrument Serif italic, accent color). Body in Geist 19px. `p.lede` for opener, `p.emph` for centered standalone lines, `blockquote` with left accent bar and small mono "—" caption. h2 with mono "§ NN" prefix.
- **Right rail.** AI ask card (static prompts, see §13 v2 deferral), single sticky sponsor unit.
- **End matter.** "End of essay" mono divider, related-posts triplet of Studio cards, `previousnext` block, share row, comments panel.

### 6.1 Focus mode (entry + exit, both)

Focus mode is a per-post reading mode that hides the top nav, both rails, all ads, the sponsor slot, the share row, and the related-posts block — leaving only the article head, reading column, and end-matter divider on a centered max-width-720 canvas. Triggered from the article-head toolbar.

**Critical:** the user must always have a visible, obvious way out. When focus mode is active:

1. **A persistent "Exit focus" pill** sits fixed at the top-right corner of the viewport, above all content, visible at all times during focus mode. Style: subtle Studio chip (`var(--bg-2)` background, `var(--line-2)` border, `var(--text-2)` color, mono 11px, `× Exit focus` label). On hover the border shifts to `var(--accent)` and color to `var(--text)`. The pill has `aria-label="Exit focus mode"` and a `Esc` mono kbd hint inline.
2. **Pressing `Esc` exits focus mode.** Same handler that the pill click triggers. No nested modal traps.
3. **The reading-progress bar stays visible** at the top of the viewport so the reader still has an indicator of position.
4. **State is not persisted across navigations.** Each post starts in normal mode by default. (A v2 idea is a per-user preference; not in v1.)

The component contract: a single `js/v2/focus.js` module exposes `enter()`, `exit()`, and `toggle()`. The article-head button calls `toggle()`. The exit pill calls `exit()`. The `keydown` handler for `Escape` calls `exit()`. The module sets / removes the `focus` class on `<body>`. CSS in `css/v2/utility.css` does the rest.

The exit-pill DOM is rendered always but hidden via `body:not(.focus) .focus-exit { display: none; }`. No JS injection.

### Listing template (used by category + tag pages)

- **Page head.** Eyebrow + h1 + dek + count chip.
- **Row list.** Same compact row pattern as homepage.

## 7. Stack changes

| Concern | Today | After |
|---|---|---|
| CSS framework | Bootstrap 4 CDN | None. Native CSS Grid + Flexbox + custom properties. |
| JS framework | jQuery 3.6 + Popper + Bootstrap JS | None. Vanilla modules. |
| Icon font | FontAwesome kit (kit.fontawesome.com) | Inline SVG, locally inlined. Drop the font kit `<script>`. |
| Search | Simple Jekyll Search + bespoke Sora overlay | Simple Jekyll Search + Studio palette skin. Keep `search.json`. |
| TOC | jQuery `$.fn.toc` plugin | Vanilla `js/v2/toc.js` reading `.article-body h2, h3`. |
| Lazy load | `js/lazyload.js` | Use native `loading="lazy"` on `<img>`; keep the polyfill script for old browsers if needed. |
| Newsletter | TinyLetter form POST | Unchanged. Skin only. |
| Comments | Disqus | Unchanged. Skin only. |
| Ad system | AdSense + injected side rails (JS class `IntelligentSideRails`) | AdSense + static, designed-in slots. Drop the dynamic injection class. |

The full removal list:

- `<link>` for Bootstrap CDN (in `_layouts/default.html`).
- `<script>` for jQuery, Popper, Bootstrap JS (in `_layouts/default.html`).
- `<script>` for the FontAwesome kit (replace with inline SVGs for the handful of icons we keep).
- `IntelligentSideRails` class in `_layouts/posts.html` (replaced by simple sticky slot markup).
- `js/front.js` (Bootstrap-dependent), `js/toc.js` (jQuery-dependent) — replaced by new vanilla modules.

`css/critical.css`, `css/custom.css`, `css/style.default.css`, `css/fontastic.css` are all replaced by:

- `css/v2/tokens.css` — `:root` design tokens (no selectors except `:root` and `@media`).
- `css/v2/base.css` — element resets, body type, link defaults.
- `css/v2/chrome.css` — top nav, footer, search palette.
- `css/v2/feed.css` — homepage hero, rows, filter rail.
- `css/v2/post.css` — article head, three-column frame, reading column, rails.
- `css/v2/listing.css` — category and archive listing pages.
- `css/v2/utility.css` — focus mode, fragment-glow, reading progress, sponsor slot, AI ask card.

One CSS bundle, inlined into `<head>` as critical, with the remainder lazy-loaded. Target total CSS < 35 KB minified.

## 8. LLM-friendliness (subsystem 2)

### 8.1 Semantic DOM

- Article wrapped in `<article itemscope itemtype="https://schema.org/BlogPosting">`.
- Each h2 gets a stable `id` (kramdown `auto_ids: true` already generates these — keep).
- `<time itemprop="datePublished">` and `<time itemprop="dateModified">` on the meta bar.
- Author and publisher in machine-readable spans / structured data.
- Strip wrapper-div noise: the new post layout uses `<article>`, `<aside>`, `<nav>`, `<main>` semantically. No `<div class="row">` for layout.

### 8.2 Structured data audit

The existing `_includes/structured-data-article.html` has issues:

- `dateModified` is currently `{{ page.date | date_to_xmlschema }}` — same as `datePublished`. Should read an optional `last_modified_at` front-matter field, falling back to `page.date`.
- No `author.url`.
- No `mainEntityOfPage` for non-post pages.
- `publisher.logo` URL hardcoded to `/img/logo.png` — confirm the file exists at the right size (≥ 112px tall per Google's spec).

Fix all four in the rewrite.

Keep `structured-data-faq.html` and `structured-data-howto.html`. Audit them for the same date/url issues.

### 8.3 `/llms.txt` and per-post `.md` alternates

- Add a root `llms.txt` that lists the site's top essays with one-line summaries and absolute URLs, generated by a Liquid template at build time.
- Generate a `.md` alternate for each post at the same path with `.md` extension (e.g., `/taking-yourself-out-of-the-equation.md`). Content is the raw Markdown body without front matter, with a 6-line YAML header summarizing title, author, date, canonical URL, and tags.
- Add `<link rel="alternate" type="text/markdown" href="...md">` to each post's `<head>`.

Implementation pattern: a Jekyll plugin file isn't needed. Use a `_layouts/post-md.html` with `permalink: ":slug.md"` strategy, or generate via a small Ruby plugin only if cleaner. Decision deferred to writing-plans skill.

### 8.4 Meta hints for AI

Add (to the article `<head>`):

- `<meta name="llms:summary" content="…">` — short answer-form summary, sourced from `page.description`.
- `<meta name="llms:topics" content="ai, technical-writing, …">` — from `page.seo_keywords`.
- `<link rel="alternate" type="text/markdown" href="…">`.

These have no standard yet; they cost nothing to ship and are forward-compatible if a standard emerges.

## 9. Fragment highlighting from AI deep links (subsystem 3)

### Goal

When a user lands from an AI search engine, the URL often carries a fragment that targets a paragraph. The current site does nothing with this. After redesign:

- If the URL fragment matches an element id, scroll smoothly to it and apply a 2-second `--highlight`-colored glow, with a small mono chip reading "↳ AI deep link" above the highlighted block.
- If the fragment uses a text-fragment URL spec (`#:~:text=…`), let the browser's native handler do the scroll, but additionally apply the glow via JS that listens for `scrollend` and matches the URL fragment.

### Implementation outline

- `js/v2/fragment-glow.js` runs at `DOMContentLoaded`.
- Reads `location.hash` and `location.search`.
- Resolves a target element (by id or by text match within the article).
- Adds `class="fragment-glow"` to the target element.
- Removes the class after 4 seconds (CSS handles the glow animation).
- Reports via `dataLayer` if Google Analytics is loaded, with event name `ai_referrer_landing`. (Don't add a new analytics dependency for this — just push to GA if present.)

### Authoring

Posts can opt-in to "AI-friendly anchors" by wrapping a critical sentence in:

```markdown
{::nomarkdown}<span class="ai-anchor" id="numbness">{:/}the specific numbness that settles in after too many headlines in too few days{::nomarkdown}</span>{:/}
```

This is optional. The default behavior works for `id`s on `<h2>` / `<h3>` (which kramdown already emits).

## 10. AdSense placement rules

**Three slots survive, no more.** Codify the placement so future authoring stays consistent:

| Slot | Where | When | Notes |
|---|---|---|---|
| **In-content** | Inside `.post-body`, manually placed between sections | Always on posts > 800 words | Use the `_includes/v2/sponsor-slot.html` partial — styled, labelled, single slot. Existing AdSense slot id stays. |
| **Sticky right rail** | `_includes/v2/post-rails.html` right column | Only on posts, only at ≥1100px viewport | One unit, sticky at `top: 90px`, contained inside the rail. No injection of additional units. |
| **Sticky left rail (optional)** | Left column above TOC | Only on posts > 2500 words, only at ≥1100px | Disabled by default; turn on with `ad_left_rail: true` in post front matter. |

**Removed:**

- Hero ad block on homepage.
- The `IntelligentSideRails` JS class.
- Any ad inside `_layouts/page.html` (static pages stay clean).
- The current 4-slot rotation on long posts.

**Mobile (≤700px):** Only the in-content slot renders. Rails are hidden by CSS.

**Focus mode:** The post-page Focus toggle hides all ads. This is documented in the privacy / UX page as a feature.

## 11. Compatibility with existing post bodies

Posts contain inline `<style>` and `<script>` blocks per the project's authoring convention. The new shell must not break them.

Rules for the new `_layouts/posts.html`:

- Scope global post-body styles under `.article-body` so per-post inline styles override predictably.
- Reset typography on `.article-body` to a known baseline; don't depend on tag selectors leaking from chrome stylesheets.
- Don't `display: none` any tag globally — per-post styles may rely on default visibility.

The target end-state per §7 is **no jQuery, no Bootstrap**. Before we delete the jQuery / Bootstrap CDN tags, a migration audit task in the implementation plan greps every post for inline `<script>` dependencies (`$`, `jQuery`, `.toc(`, `bootstrap.`). Any post that hits is rewritten to vanilla JS before cutover. There is no exception that keeps jQuery in v2.

## 12. Accessibility & performance

### Accessibility

- All interactive elements keyboard-reachable with visible focus states (`outline: 2px solid var(--accent); outline-offset: 2px`).
- Colour contrast must meet WCAG AA: body type on `--bg` is `--text` (≥ 16:1). Muted `--text-3` reserved for non-essential metadata only.
- `aria-current="page"` on active nav link.
- `aria-label` on icon-only buttons (Focus, Share, search trigger).
- `prefers-reduced-motion: reduce` disables transforms.
- Skip-to-content link at top of `<body>`.

### Performance

- One web-font request (Geist, Geist Mono, Instrument Serif via a single Google Fonts URL with `display=swap`).
- Critical CSS inlined; non-critical lazy-loaded with `rel=preload` + `onload` swap.
- All images get `loading="lazy"` and explicit `width` / `height` to prevent CLS.
- No render-blocking JS. All scripts `defer`.
- Drop the Bootstrap and jQuery CDN requests (saves ~150 KB transferred).
- Target Lighthouse: Performance ≥ 90 mobile, ≥ 95 desktop. Accessibility ≥ 95. SEO 100.

## 13. Locked decisions and v2 deferrals

### Locked (confirmed with user 2026-05-14)

1. **"Free courses" content.** Moves out of the homepage slider into a dedicated `/courses/` page styled in the new design system. Linked from primary nav (as part of "About" or as a top-level "Courses") and the footer. The page reuses the courses content currently in `_includes/slider.html` (API Documentation course + AI & ML Essentials course) and discards the slider.
2. **Top nav labels.** Replace `_data/topnavigation.yml` content with: `Feed`, `AI`, `Craft`, `Archive`, `About`. (Home goes away — the feed *is* the homepage. "Categories" is replaced by the dual-axis "AI" and "Craft" jumps plus the searchable Archive. "Videos" is folded into Archive or About.)
3. **`siteanalytics.html`.** Delete. Remove the file, remove any nav references.
4. **`/llms.txt` generator.** Pure Liquid template at site root. No Ruby plugin needed for v1. The template iterates `site.posts` (sorted by date desc, limit 50), emitting title + absolute URL + one-line description per entry, plus a header block with site name, RSS link, and "alternate Markdown available at `/<slug>.md`" hint.
5. **AI "Ask this essay" card.** Static UI in v1 with three suggested prompts and an input. Clicking any prompt or submitting the input opens a small modal: *"Coming in v2. This will answer using only the content of this article, no web search."* No backend. Real RAG is v2.
6. **Light mode.** Stub `prefers-color-scheme: light` block with safe fallback colors. No iteration in v1. Full work is v2.
7. **Focus mode exit.** See §6.1 below — a dedicated requirement, not a deferral.

### Still deferred (v2 or design-time decisions)

8. **Custom serif drop cap.** Confirmed: Instrument Serif italic in Studio palette is the one place serif type enters the post body.
9. **Brand mark.** Current FontAwesome `fa-keyboard-o` icon. Replace with a custom inline SVG mark (the "B" with serif italic from the Studio mockup). Designed as a one-off asset during implementation.
10. **`/courses/` page IA.** Layout, hero, sections per course — designed during implementation, following the Studio listing/page template.

## 14. Migration strategy (high-level)

The detailed implementation plan is written by the writing-plans skill in the next step. This section sets the shape so that plan can target the right outcomes.

- Work on a long-lived branch (`redesign/v2`), not main.
- Build the new design system first (tokens + base + chrome). Verify on a single test page.
- Build the homepage second. Verify against the Studio home mockup.
- Build the post layout third. Verify against `mockups/studio-post.html` + Atelier reading rhythm.
- Migrate listing pages, then static pages, then 404 + privacy.
- Do the LLM-friendliness work (structured data audit, `llms.txt`, `.md` alternates).
- Do the fragment-highlight script.
- Audit post-body inline styles against the new shell (spot-check ten posts).
- Run Lighthouse + the structured-data validator.
- Cut over: rename `v2/` includes to canonical names, delete `_layouts/*.old.html` fallback copies, delete dead CSS.
- Ship.

## 15. Files touched

For traceability. Implementation plan should track these as checklist items.

### Replace (full rewrite, content-aware)
- `_layouts/default.html`
- `_layouts/posts.html`
- `_layouts/page.html`
- `_includes/topnavigation.html` (→ `_includes/v2/nav.html`)
- `_includes/navbarmenu.html` (folded into nav, delete old)
- `_includes/footer.html` (→ `_includes/v2/foot.html`)
- `_includes/newsletter.html`
- `_includes/categorieswidget.html`
- `_includes/share_bar.html`
- `_includes/previousnext.html`
- `_includes/search.html`
- `_includes/toc.html`
- `_includes/structured-data-article.html` (date / author URL fixes)
- `index.html`
- `404.html`
- `privacy.html` (only style hooks; content unchanged)
- `pages/topnav/categories.html`
- `pages/topnav/videos.html`
- `pages/category/category-*.html` (×5)
- `pages/footer/appreciate.html`
- `pages/footer/archives.html`
- `pages/footer/contact.html`

### Drop (deleted after cutover)
- `_includes/slider.html` (homepage slider; content moved to `/courses/`)
- `pages/footer/siteanalytics.html`
- `css/critical.css`
- `css/custom.css`
- `css/style.default.css`
- `css/fontastic.css`
- `js/front.js`
- `js/toc.js`

### Add
- `_includes/v2/site-head.html`
- `_includes/v2/nav.html`
- `_includes/v2/foot.html`
- `_includes/v2/post-toc.html`
- `_includes/v2/post-rails.html`
- `_includes/v2/ai-ask-card.html`
- `_includes/v2/sponsor-slot.html`
- `_includes/v2/fragment-loader.html`
- `_includes/v2/llms-meta.html`
- `css/v2/tokens.css`
- `css/v2/base.css`
- `css/v2/chrome.css`
- `css/v2/feed.css`
- `css/v2/post.css`
- `css/v2/listing.css`
- `css/v2/utility.css`
- `js/v2/nav.js` (mobile menu, search trigger, kbd shortcut)
- `js/v2/toc.js` (vanilla TOC + active-section)
- `js/v2/fragment-glow.js`
- `js/v2/progress.js` (reading progress bar)
- `js/v2/search.js` (Studio command palette wrapper around Simple Jekyll Search)
- `js/v2/focus.js` (focus mode: enter / exit / toggle, exit pill, Esc handler — see §6.1)
- `llms.txt` (generated at build via Liquid template at site root — pure Liquid, no Ruby plugin)
- `pages/courses/index.html` (the new `/courses/` page; reuses content from old slider)

### Keep, audit, restyle hooks only
- `_includes/adsense.html`
- `_includes/google_analytics.html`
- `_includes/disqus.html`
- `_includes/readtime.html`
- `_includes/structured-data-faq.html`
- `_includes/structured-data-howto.html`
- `_includes/note.html`, `important.html`, `goodtoknow.html`, `coffee.html`, `horizontal.html`, `image-with-alt.html`, `tinyletter.html`, `multiplex.html`, `tag_page.html`, `lazy-load-images.html`
- `_data/*.yml`
- `search.json`
- `feed.xml`
- `sitemap.xml`
- `robots.txt`
- All `_posts/**/*.md` (content unchanged; per-post inline styles audited for compatibility)
- `assets/`, `img/`, `fonts/` directories
- `Gemfile`, `_config.yml` (no changes needed beyond a new `last_modified_at` plugin enablement, if we adopt one)

---

## 16. Success criteria

The redesign is done when:

- Homepage and a representative long post render correctly under the new shell with no Bootstrap or jQuery loaded.
- All 5 category pages, all 4 footer pages, the 2 topnav pages, 404, and privacy render under the new shell.
- A spot-check of 10 recent posts shows no per-post inline-style breakage.
- AdSense slots render in their three approved positions and revenue tracking shows ad impressions are firing.
- Google's Structured Data Testing Tool validates without errors on a sample post.
- A fragment URL like `/taking-yourself-out-of-the-equation/#numbness` scrolls + glows on landing.
- Lighthouse on a representative post hits the targets in §12.
- The Focus toggle on a post hides chrome + ads and produces a clean reading view. A visible "Exit focus" pill is present, and pressing `Esc` returns to normal mode (§6.1).
- `/courses/` page exists and renders the API Documentation + AI & ML Essentials course blocks; the homepage no longer has a slider.
- Top nav reads `Feed / AI / Craft / Archive / About`.
- `pages/footer/siteanalytics.html` is removed and no nav links to it.
- `llms.txt` exists at site root and lists at least the 50 most recent posts with absolute URLs and one-line descriptions.

When all of the above are checked, ship from `redesign/v2` to `main`.
