---
name: measure-wins
description: Use to measure whether applied SEO fixes actually worked on gautriv.github.io / Being Technical Writer — grades resolved backlog items against current Search Console data (type-aware, net of a sitewide control, with derived confidence), reports which intervention types and specific title hypotheses won or failed, and proposes gated retries/reverts for losers. Phase 5 of the SEO workflow suite. Trigger with /measure-wins.
---

# Measure Wins

## Overview

Phases 1-4 are open-loop: they diagnose, propose, and write a backlog item, then stop. This skill closes the loop. It grades the work you actually applied (title/description rewrites, added sections, links, refreshes) against current Search Console numbers, so over time you learn **which kinds of changes move rankings on this specific site** — not from SEO blogs, from your own history.

It reports what worked, and for losers it proposes a **gated** next move: a retry, a revert, or "stop, this page is saturated." Nothing is applied or published here. This is measurement and a preview.

**Reality for this site (be honest):** traffic is low and snapshot history is thin, so most early grades will be `too_recent` or low-confidence. That is correct behavior, not a bug. The dataset gets trustworthy over months. Report confidence honestly; never dress up noise as a win.

**Architecture boundary:** the grading math is deterministic (seo-mcp `evaluation.py` + `grade.py`): type-aware primary metric, per-metric deadbands, net-of-control deltas, derived confidence. YOU read the graded outcomes and decide whether a loser is worth retrying, reverting, or leaving alone — that judgment is the craft.

## Two sites

The backlog spans the **blog** (`gautriv.github.io/_posts/...`) and the **API-docs course** (`apidocumentation/...`). Grading runs on both (same GSC property). But a retry on a course lesson is written in the course voice (Maya / Greenfield, per `apidocumentation/CLAUDE.md` + `scripts/voice-check.rb`) in the course repo; a blog retry routes through `reviewing-blog-voice`. Grade everything; route the rewrite correctly.

## Setup

```bash
SEO_MCP="${SEO_MCP_DIR:-/Users/gauravtrivedi/Documents/live_projects/seo-mcp}"
PY="$SEO_MCP/.venv/bin/python"
```

## Steps

1. **Grade resolved items** against current Search Console data (appends one outcome record per item):
   ```bash
   PYTHONPATH="$SEO_MCP" "$PY" -m seo_mcp.grade \
     --backlog state/seo-backlog.jsonl --outcomes state/seo-outcomes.jsonl --weeks 4
   ```
   The grader short-circuits anything younger than the 4-week window to `too_recent` (no GSC call), matches the baseline window to the change date, judges each type on the metric it should move, subtracts the **sitewide median move** as a pseudo-control, and derives a 0-1 confidence from volume × maturity × control-stability × metric-agreement. It prints a one-line outcome summary.

2. **Read `state/seo-outcomes.jsonl`** (latest record per `id`). Each carries `outcome`, `confidence` + `confidence_factors`, `primary_metric`, raw `deltas`, and `net_deltas` (the first-class evidence — the verdict label is a convenience).

3. **Report, grouped two ways:**
   - **By intervention type** (`ctr`, `keyword-gap`, `content-decay`, `internal-link`): win-rate among matured, confident items. This is the "which workflow works" view.
   - **By `intervention_kind`** (`numeric_title`, `comparison_title`, `faq_addition`, …) where present: the finer "which *kind* of change works here" view that the learning layer will eventually consume.
   For each item show net-of-control deltas and the four confidence factors, never the bare scalar.

4. **Emit a run-summary counter** so a silent break is visible:
   `graded / too_recent / inconclusive_low_volume / confounded / improved / flat / declined / saturated / retry-proposed / reverted`.

5. **Flag gated losers and propose a next move.** Only act on a loser that is **matured AND confidence ≥ 0.4 AND not `confounded`** (noise and ambiguous results get no retry):
   - **`flat` or mild `declined`** → propose the strongest **untried** option from `assessment.options`, with a one-line rationale for *why it differs* and the expected effect. No random wandering.
   - **Severe `declined`** (net CTR ≤ −0.5pp **and** ≤ −15% relative) → recommend **reverting to the baseline title first**, then retrying after it stabilizes. Never stack a new experiment on a bleeding page.
   - **`saturated`** (CTR already beats expected-for-position) → stop. Record the experiment winner; "review in ~6 months."

6. **STOP — preview-first.** Present the report and the proposed moves. Apply nothing without approval.

## Applying a retry or revert (only on approval)

Reopening is explicit and history-preserving (a plain ctr-optimize re-run can't reopen a `done` item). Record the failed attempt, then reopen:

```bash
PYTHONPATH="$SEO_MCP" "$PY" - <<'PYEOF'
import json
from seo_mcp import backlog
items = backlog.load_backlog("state/seo-backlog.jsonl")
it = next(i for i in items if i["id"] == "<id>")
# 1. keep the attempt + its observed effect in the hypothesis history
backlog.record_hypothesis(it, {"net_deltas": {"ctr": -0.012}, "outcome": "declined",
                               "confidence": 0.55, "graded_at": "<today>"})
# 2a. retry: reopen for the next untried option
backlog.reopen_for_retry(it, now="<today>")
# 2b. OR saturation: stop and record the winner
# backlog.set_experiment(it, status="saturated", winner_kind="comparison_title", winner_title="<title>")
backlog.save_backlog("state/seo-backlog.jsonl", items)
PYEOF
```

- A **retry** then flows through `/ctr-optimize`'s "Applying" step (write the new pick into front matter, set `status: done`, capture a fresh `baseline_metrics`). Add the `kind` of the new option so the learning layer can group it.
- A **revert** writes the baseline title back and sets `status: monitoring_revert` — the grader skips scoring a revert as a win/loss; once it stabilizes, reset baseline before the next option.
- Course pages: write in the course voice in the course repo on a branch. Blog pages: route through `reviewing-blog-voice`.
- Never auto-commit or publish. Edits live on the `seo-workflows` branch.

## Guardrails

- Grade first, judge second. The math is fixed; the verdict label is downstream of `net_deltas`.
- A retry requires maturity + confidence ≥ 0.4 + not confounded. If you can't meet the bar, say "not enough signal yet," don't guess.
- GSC is pre/post, not a randomized A/B. The median control nets out tides but can't prove causation — say "consistent with the change," never "caused by."
- Don't optimize forever. `saturated` is a legitimate terminal state.
- Low traffic: trust CTR/position rates and the volume guard over raw clicks.
