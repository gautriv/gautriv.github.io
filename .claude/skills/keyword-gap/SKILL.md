---
name: keyword-gap
description: Use to find page-2 ranking opportunities for gautriv.github.io / Being Technical Writer — pulls queries ranking 11-20 from live Search Console, maps them to posts, diagnoses WHY each underperforms, and recommends specific content additions to reach page 1. Phase 2 of the SEO workflow suite. Trigger with /keyword-gap.
---

# Keyword Gap

## Overview

Queries where a page ranks 11-20 are the highest-leverage SEO targets: real demand, real impressions, near-zero clicks (page 2 is invisible). This skill pulls those from **live Search Console**, maps each to its source post, and proposes the specific content changes that would push it to page 1. Proposals land in the shared backlog. Nothing is published.

**This is not keyword stuffing.** "Page 2 → add keywords" is dead. The job is to **diagnose why** a page underperforms and recommend the right intervention. Your judgment is the product; the data layer only supplies the numbers.

**Architecture boundary:** the page-2 query data and the URL→post map are deterministic (seo-mcp + manifest). YOU diagnose and recommend. Never invent queries — use only what Search Console returns.

## Two sites, two voices

The manifest covers **both** properties under `beingtechnicalwriter.com`:
- **Blog** — paths under `gautriv.github.io/_posts/...`. Edits use `writing-blog-voice` → `reviewing-blog-voice`.
- **API-docs course** — paths under `apidocumentation/` (`_docs/*.md` lessons, root `*.md` pages). This is your **top page-2 opportunity** (the "best/top api documentation tools 2025" queries live here). **Course content has its own voice and process** (Maya / the Greenfield universe). When a target's `path` is under `apidocumentation/`, do NOT use the blog voice skills — follow the course repo's own rules (`apidocumentation/CLAUDE.md`, its Phase 2 spec, `scripts/voice-check.rb`), and make edits in that repo on a branch. The diagnosis and SEO recommendation are the same; the writing craft is the course's, not the blog's.

## Setup

```bash
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
PY="$SEO_MCP/.venv/bin/python"
```

## Steps

1. **Refresh the manifest** (URL→post map): `bash scripts/seo-manifest.sh`

2. **Pull live page-2 queries** (positions 11-20, ≥20 impressions, last 8 weeks):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.cli page-two --weeks 8
   ```
   Each row: `page` (full URL), `query`, `position`, `impressions`, `clicks`.
   (Ad-hoc alternative inside a session: call the `find_page_two_queries` MCP tool from the `seo` server.)

3. **Group rows by page** and **map each page to its post** via `state/seo-manifest.json` (match `url` to the page's path). The manifest gives `path` (source `.md`), `title`, `description`, `headings`, `word_count`.
   - If a page is **not in the manifest** (e.g. `/apidocumentation/...` doc pages are not blog posts), still record the opportunity but set `target_path` to null and note "locate source manually."

4. **Read the post** and **diagnose why it ranks 11-20 for its target queries.** Work through this checklist — name the actual reason(s), don't guess:
   - **Intent mismatch** — does the post answer what the query-searcher wants (informational vs. commercial vs. comparison)?
   - **Missing entity / subtopic** — does the query name a tool, concept, or comparison the post never covers?
   - **Weak/late intro** — is the answer buried below the fold?
   - **No comparison table / list** — commercial queries ("best X 2025") often need a structured comparison the post lacks.
   - **Missing FAQ** — are there obvious follow-up questions (the query's long-tail) left unanswered?
   - **Thin EEAT / examples** — does it lack the depth, examples, or first-hand experience competitors show?
   - **Freshness** — does a "2025"-style query meet a stale post? (Cross-check with content-decay later.)

5. **Recommend the specific intervention** matched to the diagnosis: a new H2 section, named entities/subtopics to cover, a comparison table, an FAQ block, a rewritten intro — not "add keywords." Tie each recommendation to the query it serves.

6. **Write one backlog item per page** (the helper sets id/timestamps):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" - <<'PYEOF'
   import json
   from seo_mcp import backlog
   item = backlog.make_item(
       site="sc-domain:beingtechnicalwriter.com", type="keyword-gap",
       target_url="<page-url>", target_path="<_posts/...md or null>", query="<page-url>",
       facts={"target_queries": [{"query": "...", "position": 13.1, "impressions": 77, "clicks": 0}]},
       problem="<the diagnosed reason it sits on page 2>",
       recommendation="<specific section/entity/table/FAQ to add, per query>",
       reasoning="<why this closes the gap>",
       edit_tier="section", confidence=0.7, expected_impact="high", effort="medium",
       evidence=["pos 13.1, 77 impressions, 0 clicks for 'top api documentation tools 2025'"],
   )
   print(json.dumps(item))
   PYEOF
   ```
   Pipe it in:
   ```bash
   echo '<item-json>' | PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.backlog upsert \
     --file state/seo-backlog.jsonl --now "$(date +%F)"
   ```

7. **Render the backlog** and **stop (preview-first):**
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.backlog render --file state/seo-backlog.jsonl
   ```
   Present the diagnoses + recommendations. Only edit posts when the user approves specific items.

## Applying a proposal (only on approval)

- Match the edit to the `edit_tier`: usually `section` (add a focused H2) or `paragraph`. Reach for `restructure`/`rewrite` only when the diagnosis genuinely demands it.
- Route every edit through **writing-blog-voice**, then **reviewing-blog-voice**. New sections must read like Gaurav, carry real substance (the EEAT the ranking lacks), and respect CLAUDE.md — no AI transitions, no em dashes, scoped inline styles.
- Add internal links to/from the post where natural (see the `internal-linking` skill). Never auto-commit or publish; edits stay on the `seo-workflows` branch.
- After applying, set the item `status` to `done`.

## Guardrails

- Only target queries Search Console actually returned.
- Every recommendation names a reason and a concrete change. "Add keywords" is a failure.
- Don't promise page-1 rankings; these are leverage bets, scored by confidence/impact/effort.
- High-impression, zero-click page-2 queries on commercial intent ("best/top ... 2025") are the priority.
