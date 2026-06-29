---
name: internal-linking
description: Use to find and propose internal links between posts on gautriv.github.io / Being Technical Writer — surfaces orphan pages (no inbound links) and weak hubs, then recommends specific, relevant in-body links from existing posts. Phase 1 of the SEO workflow suite. Trigger with /internal-linking.
---

# Internal Linking

## Overview

The cheapest, lowest-risk SEO win: every post should be reachable from other posts, and strong posts should funnel authority to relevant ones. This skill surfaces **orphan pages** (no inbound internal links) and weakly-linked posts, then proposes **specific in-body links from genuinely related existing posts**. Proposals land in the shared SEO backlog. Nothing is published.

**Architecture boundary (do not cross):** the link graph, orphan detection, and backlog storage are deterministic and come from the `seo-mcp` data layer. **You** supply the judgment — which post should link to which, the anchor text, and where in the body the link belongs. Never invent a link target that is not a real post in the manifest.

## Two sites — including blog↔course links

The manifest now covers the **blog** (`gautriv.github.io/_posts/...`) and the **API-docs course** (`apidocumentation/...`), so you can propose links **between** them — a blog post about API docs linking into the course, or a lesson linking to a related essay. These cross-property links are high SEO value. When you propose applying a link, route it by where the *source* page lives: blog source → `writing-blog-voice`; course source (`apidocumentation/`) → the course's own voice (`apidocumentation/CLAUDE.md` + `scripts/voice-check.rb`), in the course repo on a branch.

## Setup

```bash
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
PY="$SEO_MCP/.venv/bin/python"
```

## Steps

1. **Refresh the manifest** (rebuilds the site + link graph; ~3s):
   ```bash
   bash scripts/seo-manifest.sh
   ```
   This writes `state/seo-manifest.json` — every post's `url`, `path` (source `.md`), `title`, `description`, `headings`, `categories`, `tags`, `word_count`, and `internal_links` (in-body only).

2. **List orphans** and read the manifest:
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.manifest orphans --manifest state/seo-manifest.json
   ```
   Then read `state/seo-manifest.json` for the full post data you'll reason over.

3. **For each orphan (and any thin-but-strong post), find 1–3 real existing posts that should link to it.** Judge relevance by genuine topical overlap — compare titles, descriptions, headings, categories, and tags. A link is justified only if a reader of the source post would actually want the target. Prefer strong/related hubs as sources. Respect CLAUDE.md's **Internal Linking Convention**: "link naturally, do not force." If nothing genuinely relevant exists, say so and skip — a forced link is worse than an orphan.

4. **Propose the anchor + placement.** For each source→target link, name the source post, a natural anchor phrase, and roughly where in the source body it fits (which section/paragraph). Anchors must read like Gaurav wrote them, not "click here" or keyword-stuffed.

5. **Write one backlog item per orphan** (deterministic id; re-runs update, not duplicate). Pipe the JSON to the backlog CLI:
   ```bash
   echo '<item-json>' | PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.backlog upsert \
     --file state/seo-backlog.jsonl --now "$(date +%F)"
   ```

6. **Render the backlog** for review:
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.backlog render --file state/seo-backlog.jsonl
   ```

7. **Stop here by default (preview-first).** Present the proposals. Only edit posts when the user approves specific items.

## Backlog item shape

One item per orphan. `facts` are deterministic (from the manifest); `assessment` is your judgment.

```json
{
  "id": "",                          // leave empty; the CLI is not used for id — set it via the helper below
  "site": "sc-domain:beingtechnicalwriter.com",
  "type": "internal-link",
  "query": "/orphan-url/",          // the orphan url, so the id is unique per orphan
  "target_url": "/orphan-url/",
  "target_path": "_posts/.../orphan.md",
  "facts": { "inbound": 0, "word_count": 2959, "candidate_sources": ["/a/", "/b/"] },
  "assessment": {
    "problem": "Orphan: no posts link to this 2,959-word piece.",
    "recommendation": "Link from /a/ (anchor: 'sandboxed AI agents') and /b/ (anchor: 'agentic IDEs').",
    "reasoning": "Both cover adjacent agent tooling; readers there would want this deeper piece.",
    "edit_tier": "paragraph",
    "confidence": 0.8,
    "expected_impact": "medium",
    "effort": "low",
    "evidence": ["0 inbound internal links", "topical overlap on AI agent sandboxes"]
  },
  "status": "open"
}
```

Build the item with the helper so id/timestamps are correct rather than hand-writing them:
```bash
PYTHONPATH="$SEO_MCP" "$PY" - <<'PYEOF'
import json
from seo_mcp import backlog
item = backlog.make_item(
    site="sc-domain:beingtechnicalwriter.com", type="internal-link",
    target_url="/orphan-url/", target_path="_posts/.../orphan.md", query="/orphan-url/",
    facts={"inbound": 0, "candidate_sources": ["/a/", "/b/"]},
    problem="...", recommendation="...", reasoning="...",
    edit_tier="paragraph", confidence=0.8, expected_impact="medium", effort="low",
    evidence=["0 inbound internal links", "..."],
)
print(json.dumps(item))
PYEOF
```

## Applying a proposal (only on approval)

- **Smallest viable edit** (`edit_tier: paragraph`): insert ONE natural, contextual link in the **source** post's body near relevant content. Do not restructure.
- Route the edit through **writing-blog-voice**, then **reviewing-blog-voice**. The anchor and surrounding sentence must match Gaurav's voice.
- Never edit chrome, templates, or the related-posts widget. Never auto-commit or publish. Edits stay on the `seo-workflows` branch.
- After applying, set the item's `status` to `done` (a later grading pass records the outcome).

## Guardrails

- Only link between **real posts** present in `state/seo-manifest.json`.
- Relevance must be genuine. Forced links fail the review pass and hurt the reader.
- One contextual link per source→target; don't stuff a paragraph with links.
- Honor the existing internal-linking inventory already in CLAUDE.md.
