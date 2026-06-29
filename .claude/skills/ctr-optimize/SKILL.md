---
name: ctr-optimize
description: Use to improve click-through rate for gautriv.github.io / Being Technical Writer — pulls high-impression, low-CTR queries from live Search Console (per query, not per page), flags likely Google title rewrites, and generates 5 high-intent meta title + description alternatives per opportunity. Phase 3 of the SEO workflow suite. Trigger with /ctr-optimize.
---

# CTR Optimization

## Overview

Some pages already rank well but earn far fewer clicks than their position should — the title and snippet aren't winning the click. This skill finds those **per query** (the same page can behave very differently across queries), then generates alternative meta titles and descriptions. Proposals land in the backlog. Nothing is published.

**Architecture boundary:** the CTR-gap data is deterministic (seo-mcp computes expected-CTR-by-position and the gap). YOU write the titles and descriptions — that's the craft. Never target a query Search Console didn't return.

## Two sites

The manifest covers the **blog** (`gautriv.github.io/_posts/...`) and the **API-docs course** (`apidocumentation/...`). For course pages, write the title/description into the lesson's own front matter (`_docs/*.md` has `title`/`description`/`keywords`) **in the course voice** (Maya / Greenfield, per `apidocumentation/CLAUDE.md` + `scripts/voice-check.rb`), in the course repo on a branch — not the blog voice. For blog pages, use `reviewing-blog-voice`.

## Setup

```bash
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
PY="$SEO_MCP/.venv/bin/python"
```

## Steps

1. **Refresh the manifest:** `bash scripts/seo-manifest.sh`

2. **Pull low-CTR queries** (CTR ≥2pp below expected-for-position). This is a small site, so lower the impression floor:
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.cli low-ctr --weeks 8 --min-impressions 20
   ```
   Each row: `page`, `query`, `position`, `impressions`, `clicks`, `ctr`, `expected_ctr`, `ctr_gap`.

3. **Map each page to its post** via `state/seo-manifest.json`; read the post's current front-matter `title` and `description`.

4. **Read the signal before rewriting:**
   - A page ranking **well (pos ≤5) with near-zero CTR** is the strongest title/snippet opportunity — the searcher sees it and scrolls past.
   - If the live query barely appears in the current `title`/`description`, Google may be **rewriting your title**; the fix is a title that earns the click *and* contains the intent.
   - Group by page, but optimize for the **highest-impression query** the page serves.

5. **Generate 5 alternatives** per opportunity — meta `title` (≤60 chars) and `description` (≤155 chars):
   - High-intent and specific to the query; front-load the value.
   - Match search intent (how-to, comparison, "2026", tutorial) without clickbait.
   - In Gaurav's register — confident and concrete, never breathless. No em dashes. No "Ultimate Guide" filler.
   - Maps to front matter: `title`, `description`, and optionally `og_title` / `og_description`.
   - Tag each option with its **`kind`** — the lever it pulls (`numeric_title`, `question_title`, `comparison_title`, `year_added`, `brand_removed`, `intent_match`). `/measure-wins` groups by `kind` to learn which kind of rewrite actually works on this site; it can't be reconstructed later.

6. **Write one backlog item per page** (`type: ctr`, `edit_tier: metadata`):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" - <<'PYEOF'
   import json
   from seo_mcp import backlog
   item = backlog.make_item(
       site="sc-domain:beingtechnicalwriter.com", type="ctr",
       target_url="<page-url>", target_path="<_posts/...md>", query="<top-query>",
       facts={"position": 4.5, "impressions": 130, "clicks": 0, "ctr": 0.0,
              "expected_ctr": 0.07, "ctr_gap": 0.07, "current_title": "..."},
       problem="Ranks 4.5 for 'curl best practices' but 0% CTR (expected ~7%).",
       recommendation="5 title/description options below; pick one.",
       reasoning="Strong position, weak snippet; title doesn't promise the answer.",
       edit_tier="metadata", confidence=0.65, expected_impact="medium", effort="low",
       evidence=["pos 4.5, 130 impressions, 0 clicks", "title omits 'best practices'"],
   )
   item["assessment"]["options"] = [
       {"title": "...", "description": "...", "kind": "numeric_title"},
   ]  # 5 of these; tag each with its lever (kind)
   print(json.dumps(item))
   PYEOF
   ```
   Pipe to: `echo '<json>' | PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.backlog upsert --file state/seo-backlog.jsonl --now "$(date +%F)"`

7. **Render the backlog**, present the 5 options per page, and **stop (preview-first).** The user picks.

## Applying (only on approval)

- **Check for confounding first:** if the page already has an unmeasured intervention (any `done` item on the same page applied within the last ~4 weeks), a second change now makes both impossible to attribute — `/measure-wins` will grade it `confounded`. Prefer to wait, or apply knowing the result won't be attributable.
- `edit_tier: metadata`: write the chosen pair into the post's front matter (`title`, `description`; add `og_title`/`og_description` if they were customized). Do not touch the body.
- A title change resets how the page is presented in search — change one thing. Record `assessment.applied = {title, description, kind, rationale, applied_at: <today>}` so `/measure-wins` can measure the CTR delta and group the result by `kind`.
- Route copy through **reviewing-blog-voice** for register. Never auto-commit or publish; edits stay on the `seo-workflows` branch.
- After applying, set the item `status` to `done` and record `baseline_metrics` (current ctr/impressions/position over the last 4 weeks) for grading.
- **Grading is a separate phase.** Weeks later, run **`/measure-wins`** to find out whether the change worked — don't invoke `seo_mcp.grade` by hand.

## Guardrails

- Optimize **per query**, not just per page.
- Titles ≤60 chars, descriptions ≤155 — longer gets truncated in the SERP.
- No clickbait, no keyword stuffing, no em dashes. The title must deliver what it promises.
- Don't rewrite the body here — that's `keyword-gap` / `content-decay`.
