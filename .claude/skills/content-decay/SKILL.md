---
name: content-decay
description: Use to detect and address declining older posts on gautriv.github.io / Being Technical Writer — takes a weekly Search Console snapshot, flags posts losing clicks/impressions/position/CTR, builds a research brief on what changed, and (only on request) drafts a revised, up-to-date version on a branch. Phase 4 of the SEO workflow suite. Trigger with /content-decay.
---

# Content Decay

## Overview

Old posts rot: the world moves on, competitors refresh, rankings slide. This skill takes a weekly **snapshot** of Search Console (so decline is measured against real history, not a single frame), flags decaying older posts on multiple dimensions, and produces a **research brief** on what changed. Revising a post is a **separate, explicitly-approved step** that drafts on a branch and never auto-publishes.

**Reality for this site (be honest):** click volume is low, so day-one decay signal is thin and best read on **impressions/position**, not just clicks. The signal strengthens every week as snapshots accumulate. Treat early output as directional.

**Architecture boundary:** the snapshot store, decline detection, and trend series are deterministic (seo-mcp). YOU judge whether a flagged post is genuinely stale and what to refresh; the research and rewrite are your craft.

## Two sites

The manifest covers the **blog** (`gautriv.github.io/_posts/...`) and the **API-docs course** (`apidocumentation/...`). Decay detection runs on both (same GSC property). But a decaying **course lesson** is not a blog refresh: the course is mid-revamp (its Phase 2 rewrites lessons in Maya's voice). If a flagged page's `path` is under `apidocumentation/`, hand it to the course's own per-lesson process (`apidocumentation/CLAUDE.md`, its Phase 2 spec, `docs/superpowers/`), not the blog refresh below. Surface it in the report either way; just route the rewrite correctly.

## Setup

```bash
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
PY="$SEO_MCP/.venv/bin/python"
```

## Weekly run (what the cron does)

1. **Snapshot** the current window into the SQLite store (builds history for trends + grading):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.cli snapshot --weeks 1
   ```

2. **Detect decay** (recent 4wk vs prior 4wk; lower the baseline floor for this small site):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.cli decay --recent-weeks 4 --baseline-weeks 4 --min-baseline-clicks 1
   ```
   Each row reports recent-vs-baseline clicks/impressions/position/CTR and which dimensions declined.

3. **Refresh the manifest** and **keep posts older than ~6 months** (decay is for mature content). Map each decaying page to its post; drop non-posts and recent posts.

4. **Pull the trend** for context ("declining since…"):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.cli trend --page "<url>"
   ```

5. **Build a research brief** per candidate: use **WebSearch** to find what changed since the post was written — new tool versions, deprecations, new entrants, updated guidance, fresh product releases relevant to the post's topic. Summarize what's now stale and what a refresh must add.

6. **Write one backlog item per decaying post** (`type: content-decay`, `edit_tier` usually `section`):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" - <<'PYEOF'
   import json
   from seo_mcp import backlog
   item = backlog.make_item(
       site="sc-domain:beingtechnicalwriter.com", type="content-decay",
       target_url="<url>", target_path="<_posts/...md>", query="<url>",
       facts={"declines": ["impressions","position"], "recent": {...}, "baseline": {...}, "trend": [...]},
       problem="Impressions down 40% and position slipping since <date>.",
       recommendation="Refresh: <what the research brief says is now stale / missing>.",
       reasoning="<why this decline + what changed in the world>",
       edit_tier="section", confidence=0.6, expected_impact="medium", effort="medium",
       evidence=["impressions 1200->700 over 8wks", "competitor X added Y in 2026"],
   )
   print(json.dumps(item))
   PYEOF
   ```
   Pipe to: `echo '<json>' | PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.backlog upsert --file state/seo-backlog.jsonl --now "$(date +%F)"`

7. **STOP.** The weekly run ends here: snapshot + backlog + research brief. **Do not draft revisions automatically.**

## Revising a post (separate, explicit, on request only)

When the user asks to revise a specific flagged post:

1. **Branch** — work on `seo-workflows` (or a fresh `refresh/<slug>` branch). Never edit the published file in place on `main`.
2. **Smallest viable refresh** per the diagnosis: update stale facts, add the missing recent developments, refresh examples. Reach for a full rewrite only when the post is fundamentally outdated.
3. Route everything through **writing-blog-voice**, then **reviewing-blog-voice**. The refresh must read like Gaurav and preserve his ideas/voice — update substance, don't sand off character.
4. Set `last_modified_at: <today>` in front matter (feeds `dateModified` structured data).
5. **Never auto-commit or publish.** Present the draft for review.
6. Mark the backlog item `status: done` and record `baseline_metrics` (current clicks/impressions/position/ctr) so grading can measure the refresh later.

## Grading (the feedback loop)

Grading is its own phase now. Weeks after items are marked `done`, run **`/measure-wins`** — it grades resolved items (type-aware, net of a sitewide control, with derived confidence), reports which recommendation types actually worked, and proposes gated retries. Don't invoke `seo_mcp.grade` by hand from here.

## Guardrails

- Snapshot **first** every run — history is what makes decay real.
- Only flag posts older than ~6 months; recent dips are noise.
- A refresh preserves voice and ideas. Never auto-publish. Edits live on a branch.
- Low-traffic pages: read impressions/position, not just clicks.
