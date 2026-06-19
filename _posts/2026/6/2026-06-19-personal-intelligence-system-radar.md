---
title: "I Built a Personal Intelligence System. The Trick Was Making the Code Dumb."
subtitle: "Thirty sources. Three hundred articles a week. Python fetches them and stays stupid on purpose. Claude reads everything and tells me the three things to do. A signal bank remembers the rest until it matters."
category: AI
image: "/assets/radar.png"
header-img: "/assets/radar.png"
seo_keywords: "personal intelligence system, build your own intelligence system, Claude Code workflow, signal bank, AI news aggregator, RSS Claude synthesis, weak signal detection, cross-source validation, technical writer AI tools, Claude raw data synthesis, dumb fetcher smart model"
permalink: /personal-intelligence-system-radar/
og_title: "I Built a Personal Intelligence System. The Trick Was Making the Code Dumb."
og_description: "346 lines of deliberately dumb Python fetch 300 articles from 30 sources. Claude reads all of them and tells me the 3 things to do this week. A signal bank remembers everything I ignore until it becomes a trend. The full architecture, the real code, the real output."
og_image: "/assets/radar.png"
twitter_card: "summary_large_image"
alt_text: "A dark control room screen, thirty source feeds flowing into a single bright line that resolves into three commands"
faqs:
  - question: "What is a personal intelligence system?"
    answer: "It is a private pipeline that pulls everything from the sources you care about, then uses a reasoning model to triage the firehose into a short list of things to act on. Radar is mine: 30 sources, 300-plus articles a week, two commands. Python fetches the raw data and does no thinking. Claude reads all of it and produces the brief."
  - question: "Why make the fetching code dumb instead of smart?"
    answer: "Because keyword matchers and threshold scores cannot read tone, cannot detect a theme forming across three communities, and cannot notice the absence of a signal that was loud last week. A reasoning model can do all three. The earlier version was 2,453 lines of code trying to be clever and its digests were mostly notes about missing data. The current version is 346 lines that just fetch, and the model does the judgment."
  - question: "What is the signal bank?"
    answer: "It is the memory layer. Every theme the model observes gets logged to a JSONL file with a cycle count, even the weak ones it does not surface that day. When a banked theme reappears in a later run, its count climbs. Two cycles and it reaches the watch list. Three and it gets evaluated for action. Nothing is forgotten, so trends emerge from noise instead of vanishing with the feed."
  - question: "Do I need to be a developer to build one?"
    answer: "You need to be comfortable running two commands and editing a YAML file. Adding a source means dropping a file in a folder, no code. The intelligence lives in a prompt, not in software you have to maintain. The whole engine is four short Python files and a 135-line command."
  - question: "Is Radar autonomous?"
    answer: "No, and that is on purpose. You run the fetch, you run the synthesis, you decide which recommendations you are actually doing. The model triages and remembers. You stay the operator. Calling it autonomous would be the lie that makes these systems untrustworthy."
description: "346 lines of deliberately dumb Python fetch 300 articles from 30 sources. Claude reads all of them and tells me the three things to do this week. A signal bank remembers everything I ignore until it becomes a trend. The full architecture, the real code, and the real output."
---

<style>
.article-body .rd-diagram {
  background: #0f1318;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  padding: 26px 24px;
  margin: 34px 0;
  color: #e6e9ef;
  font-family: "Geist", system-ui, sans-serif;
}
.article-body .rd-pipe-title {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.74em;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8fb4ff;
  margin-bottom: 20px;
}
.article-body .rd-stage {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: #141a22;
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid #3a4452;
  border-radius: 12px;
  padding: 16px 18px;
}
.article-body .rd-stage-brain { border-left-color: #5B8DEF; background: #131b2b; }
.article-body .rd-stage-loop { border-left-color: #5fe39a; }
.article-body .rd-stage-num {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 1.1em;
  font-weight: 700;
  color: #5B8DEF;
  min-width: 26px;
}
.article-body .rd-stage-h {
  font-weight: 700;
  font-size: 1.02em;
  margin-bottom: 4px;
  color: #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.article-body .rd-stage-p { font-size: 0.9em; line-height: 1.5; color: #aab3c0; margin: 0; }
.article-body .rd-stage-p code, .article-body .rd-stage code {
  background: rgba(91,141,239,0.14);
  color: #b9cdf6;
  padding: 1px 6px;
  border-radius: 5px;
  font-size: 0.92em;
}
.article-body .rd-pill {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.62em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 9px;
  border-radius: 999px;
}
.article-body .rd-pill.dumb { background: rgba(248,113,113,0.16); color: #fb8a8a; }
.article-body .rd-pill.brain { background: rgba(91,141,239,0.18); color: #9fc0ff; }
.article-body .rd-arrow {
  text-align: center;
  color: #4a5568;
  font-size: 1.1em;
  margin: 7px 0;
}
.article-body .rd-split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
}
.article-body .rd-out {
  background: #141a22;
  border: 1px solid rgba(255,255,255,0.07);
  border-top: 3px solid #5B8DEF;
  border-radius: 10px;
  padding: 14px 16px;
}
.article-body .rd-out-h {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.86em;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 5px;
}
.article-body .rd-out-p { font-size: 0.82em; color: #97a1ae; line-height: 1.45; }

.article-body .rd-timeline { display: flex; align-items: stretch; gap: 0; flex-wrap: wrap; }
.article-body .rd-tl-step { flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.article-body .rd-tl-dot {
  width: 34px; height: 34px; border-radius: 50%;
  background: #5B8DEF; color: #0b0e13;
  font-family: "Geist Mono", ui-monospace, monospace; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.article-body .rd-tl-card {
  background: #141a22; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 12px 14px; width: 100%;
}
.article-body .rd-tl-p { font-size: 0.84em; color: #aab3c0; line-height: 1.45; margin: 8px 0 0; }
.article-body .rd-tl-line { flex: 0 0 24px; align-self: flex-start; margin-top: 16px; border-top: 2px dashed #3a4452; }
.article-body .rd-tl-foot { font-size: 0.88em; color: #aab3c0; margin-top: 18px; line-height: 1.55; }
.article-body .rd-status {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.66em; font-weight: 700; letter-spacing: 0.08em;
  padding: 3px 9px; border-radius: 6px;
}
.article-body .rd-status.banked { background: rgba(138,148,163,0.18); color: #b6bfcc; }
.article-body .rd-status.watch  { background: rgba(245,158,11,0.16); color: #fbbf24; }
.article-body .rd-status.act    { background: rgba(91,141,239,0.18); color: #9fc0ff; }
.article-body .rd-status.fade   { background: rgba(248,113,113,0.16); color: #fb8a8a; }

.article-body .rd-funnel-top {
  text-align: center;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.95em; color: #e6e9ef; font-weight: 700;
  padding: 12px; margin-bottom: 16px;
  background: #141a22; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
}
.article-body .rd-buckets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.article-body .rd-bucket {
  background: #141a22; border: 1px solid rgba(255,255,255,0.07);
  border-top: 4px solid #3a4452; border-radius: 10px; padding: 16px;
  text-align: center;
}
.article-body .rd-bucket.act  { border-top-color: #5B8DEF; }
.article-body .rd-bucket.watch{ border-top-color: #f59e0b; }
.article-body .rd-bucket.bank { border-top-color: #64748b; }
.article-body .rd-bucket-h {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-weight: 700; font-size: 0.9em; letter-spacing: 0.06em; color: #f1f5f9;
}
.article-body .rd-bucket-rule { font-size: 0.78em; color: #8a94a3; margin: 8px 0 12px; line-height: 1.4; }
.article-body .rd-bucket-n { font-size: 1.8em; font-weight: 800; color: #fff; line-height: 1; }
.article-body .rd-bucket-n span { display: block; font-size: 0.4em; font-weight: 600; color: #8a94a3; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }

.article-body .rd-table {
  width: 100%; border-collapse: collapse; margin: 26px 0;
  font-size: 0.9em; background: #10141b;
  border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; overflow: hidden;
}
.article-body .rd-table th, .article-body .rd-table td {
  text-align: left; padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07); vertical-align: top;
}
.article-body .rd-table thead th {
  color: #8fb4ff; font-weight: 700; font-size: 0.8em;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.article-body .rd-table tbody td:first-child { color: #f1f5f9; font-weight: 600; }
.article-body .rd-table tbody td { color: #cdd4df; }
.article-body .rd-table tbody td:last-child { color: #9fe7bd; }
.article-body .rd-table tbody tr:last-child td { border-bottom: none; }

@media (max-width: 768px) {
  .article-body .rd-buckets { grid-template-columns: 1fr; }
  .article-body .rd-tl-line { display: none; }
  .article-body .rd-tl-step { min-width: 100%; margin-bottom: 12px; }
  .article-body .rd-table { font-size: 0.82em; }
  .article-body .rd-table th, .article-body .rd-table td { padding: 9px 11px; }
}
</style>

Ever feel like there is just too much to read? The feeds. The newsletters. The forty tabs you keep promising yourself you'll get to. This blog included, pun intended. One more thing on the pile. And you read it because you have to keep up. To catch the bleeding-edge thing before it goes mainstream. To know where the trends are heading while they are still a whisper in one forum and not yet a headline in twenty. In this field, the week you stop reading is the week you fall behind.

You are not behind on your reading. You are drowning in it.

And the thing about reading that much is that most of it slides past you anyway. The same idea shows up in three different places on three different days, and you never connect them. A problem people complain about in May comes back in June, and you miss it both times. You feel busy. You feel like you are keeping up. You are also missing almost everything.

That was me. I was drowning in information and starving for intelligence.

So I stopped trying to read more. I asked a different question instead. What if I built something that read all of it for me, every week, and just told me what to do about it? Not a smarter feed reader. A private intelligence system, mine, pointed at my sources and my goals.

That is how Radar was born.

Here is how it works, what I got embarrassingly wrong on the first build, and how you can stand up your own in an afternoon.

## The two commands

Here is the entire workflow. Two lines.

```bash
python -m radar-engine run   # fetch 300+ items from 30 sources, ~2 seconds
/radar                       # Claude reads all of it, triages, tells me what to do
```

The first command is Python. It fetches and it shuts up. The second is a command inside Claude Code that points a reasoning model at the raw pile and asks for a verdict.

The output is a brief I can read in five minutes. The part that matters is three sections:

- **ACT NOW.** The top three things to do this week. Each one has a specific action, the evidence behind it, the audience it serves, and a deadline.
- **WATCH LIST.** Themes accumulating across runs but not ready to act on yet.
- **SIGNAL BANK.** Everything else, logged silently, waiting to accumulate.

Here is what that brief actually told me to do the first week I ran it, trimmed to the headlines:

> **1. Write "72 Hours Without Claude."** A frontier model just got pulled from every user on Earth. Seven independent sources. Publish by Wednesday.
>
> **2. Write "The Machine That Grades Your Writing."** AI systems are flagging human writing as low quality. Squarely my beat.
>
> **3. Publish "Your Agent Will Route Around Your Rules."** Everyone is writing agent tutorials. Nobody is writing the operations manual.

Three decisions, pulled from three hundred articles, each with a reason and a deadline. That is the product. Everything below is how the messy pile becomes those three lines, and why the third bucket, the signal bank, is the part that makes it work.

## Make the code dumb

I set out with two objectives. Make the code as dumb as I possibly could. Then let an actual reasoning model do all the analysis.

I did not start there. I started by trying to make the code smart, because that is what I assumed intelligence was. The version before this one was 2,453 lines of Python across 27 files. There was a `QualityValidator` with thresholds and engagement math and a docstring that called itself a framework for elite intelligence. The function meant to do the actual thinking, the one that was supposed to find the insights and score how actionable each one was, looked like this:

```python
def validate_synthesis_quality(...):
    """Validate synthesis quality (Layer 2) - stub for now"""
    # TODO: Implement contrarian detection, evidence hierarchy validation
    return SynthesisQualityResult(
        actionability_score=0.0,
        is_valid=True,
    )
```

The intelligence was a TODO that returned zero and marked itself valid. The actual thinking was supposed to live in Layer 2. Layer 2 was a comment. And the briefs that machine handed back read exactly like code that cannot think. Almost every section said a version of the same thing:

> *Note: Requires community source ingestion for proper signal capture.*
> *Note: Insufficient multi-signal evidence.*
> *Note: Requires historical signal data for trend decay identification.*

That is what I thought analysis was. A list of apologies with good test coverage. So I deleted almost all of it and flipped the design.

Objective one. The code got stripped to 346 lines across seven files, and not one of them tries to be smart. The data type is a single dataclass. No methods. No scoring. Just a shape.

```python
@dataclass
class IntelligenceItem:
    title: str
    url: str
    score: int
    comments: int
    timestamp: str
    source_id: str
    content: str = ""
```

The entry point is forty lines. The part that does the work is this.

```python
async def run():
    """Fetch from all sources, save raw data. That's it."""
    fetcher = ParallelFetchOrchestrator(Path("sources"))
    results = await fetcher.fetch_all_sources()
    await fetcher.close()
    return results
```

Fetch. Save. Done.

The fetcher is 265 lines and it does exactly four things: read the YAML source configs, hit the APIs and RSS feeds in parallel with `asyncio.gather`, drop cross-source duplicates by URL, and write raw JSON to a dated folder. It does not know what "AI" means. It does not score relevance. It does not care which item matters. It is a very fast, very obedient bucket.

It is also modular to the point of being boring, which is the part you can steal for your own version. A source is one YAML file. Want The Verge in the mix? Drop a file in the folder. Want a feed gone? Delete the file, or flip it to `enabled: false`. No code to touch, no deploy, no migration. The whole thing grows and shrinks by editing text.

Objective two is the rest of this post. The code stays blind on purpose, and the judgment goes to a model that can actually think.

> The smartest thing I did to this system was take the thinking out of the code.

<div class="rd-diagram" markdown="0">
  <div class="rd-pipe-title">How a cycle actually runs</div>

  <div class="rd-stage">
    <div class="rd-stage-num">01</div>
    <div class="rd-stage-body">
      <div class="rd-stage-h">30 YAML sources</div>
      <div class="rd-stage-p">One file per source. Drop a file in <code>sources/</code> to add one. Delete it to remove one. No deploy.</div>
    </div>
  </div>
  <div class="rd-arrow">↓</div>

  <div class="rd-stage">
    <div class="rd-stage-num">02</div>
    <div class="rd-stage-body">
      <div class="rd-stage-h">Python fetcher <span class="rd-pill dumb">deliberately dumb</span></div>
      <div class="rd-stage-p">Fetch in parallel · dedup by URL · save JSON. 346 lines. Zero scoring. ~2 seconds.</div>
    </div>
  </div>
  <div class="rd-arrow">↓</div>

  <div class="rd-stage">
    <div class="rd-stage-num">03</div>
    <div class="rd-stage-body">
      <div class="rd-stage-h">raw/2026-06-19/*.json</div>
      <div class="rd-stage-p">30 files. 311 items. Raw, unjudged, on disk.</div>
    </div>
  </div>
  <div class="rd-arrow">↓</div>

  <div class="rd-stage rd-stage-brain">
    <div class="rd-stage-num">04</div>
    <div class="rd-stage-body">
      <div class="rd-stage-h">/radar <span class="rd-pill brain">the intelligence</span></div>
      <div class="rd-stage-p">Claude reads <em>every</em> item, plus the signal bank, plus the state files. Triages each theme. Writes the brief.</div>
    </div>
  </div>
  <div class="rd-arrow">↓</div>

  <div class="rd-split">
    <div class="rd-out">
      <div class="rd-out-h">Digest</div>
      <div class="rd-out-p">ACT NOW · TRENDS · PAIN POINTS · WATCH LIST</div>
    </div>
    <div class="rd-out">
      <div class="rd-out-h">signal-bank.jsonl</div>
      <div class="rd-out-p">every theme, with a cycle count</div>
    </div>
    <div class="rd-out">
      <div class="rd-out-h">signals.jsonl</div>
      <div class="rd-out-p">surfaced themes only</div>
    </div>
  </div>
  <div class="rd-arrow">↓</div>

  <div class="rd-stage rd-stage-loop">
    <div class="rd-stage-num">↺</div>
    <div class="rd-stage-body">
      <div class="rd-stage-h">Next cycle</div>
      <div class="rd-stage-p">Claude reads the signal bank first. Banked themes that reappear get promoted. Three cycles in the bank and a theme gets evaluated for ACT NOW.</div>
    </div>
  </div>
</div>

## The signal bank is the actual invention

Every intelligence tool I have ever used is stateless. It shows you today's top items. Tomorrow they are gone. If a weak signal landed in one source last week and a matching one lands in a different source this week, nothing connects them. The tool has no yesterday.

That is the exact problem from the top of this post, rebuilt in software. It is the one thing I refused to ship without solving.

When I run `/radar`, Claude does not just print a reply and forget it. Claude Code reads and writes files on my machine, so it appends to a log on disk, `signal-bank.jsonl`, one line for every theme it observed. Not just the ones it surfaces. Everything. Each line tracks how many cycles that theme has appeared in.

```json
{
  "date": "2026-06-19",
  "theme": "ai_premortem_workflows",
  "source_count": 1,
  "sources": ["devto-claude"],
  "engagement_total": 40,
  "status": "banked",
  "cycle_count": 1,
  "first_seen": "2026-06-19",
  "evidence": "Using premortems with Claude and Codex before shipping"
}
```

One source. Forty points of engagement. Not enough to act on, not today. So it gets banked instead of thrown away.

Next cycle, if the same theme surfaces again, the model reuses the exact theme name, increments `cycle_count` to 2, and it climbs onto the watch list. Hit three cycles without ever being surfaced, and the prompt tells Claude to evaluate it for ACT NOW. The rules are flat and boring on purpose:

- `cycle_count >= 3` and never surfaced: evaluate for ACT NOW.
- `cycle_count >= 2`: watch list, minimum.
- Theme that was loud before but absent this cycle: mark it FADING.

That last rule is the one that earns its keep. No keyword matcher can detect absence. A theme that posted 1,545 points of engagement eight days ago and produces zero items today is not gone. It is dying, and the dying is the signal. A reasoning model reading the bank hears what went quiet. Code that only looks at today's data never knew it was loud yesterday.

<div class="rd-diagram" markdown="0">
  <div class="rd-pipe-title">One theme's life across cycles</div>
  <div class="rd-timeline">
    <div class="rd-tl-step">
      <div class="rd-tl-dot">1</div>
      <div class="rd-tl-card">
        <span class="rd-status banked">BANKED</span>
        <div class="rd-tl-p">Shows up in <strong>one</strong> source. Logged, counted, ignored for now.</div>
      </div>
    </div>
    <div class="rd-tl-line"></div>
    <div class="rd-tl-step">
      <div class="rd-tl-dot">2</div>
      <div class="rd-tl-card">
        <span class="rd-status watch">WATCH</span>
        <div class="rd-tl-p">Reappears. <code>cycle_count</code> climbs to 2. Onto the watch list.</div>
      </div>
    </div>
    <div class="rd-tl-line"></div>
    <div class="rd-tl-step">
      <div class="rd-tl-dot">3</div>
      <div class="rd-tl-card">
        <span class="rd-status act">ACT NOW</span>
        <div class="rd-tl-p">Third appearance. Promoted to a real recommendation with a deadline.</div>
      </div>
    </div>
  </div>
  <div class="rd-tl-foot">…and a theme that was loud, then goes to <strong>zero items</strong>, gets flagged <span class="rd-status fade">FADING</span>. Absence is data.</div>
</div>

Nothing is forgotten. The daily briefing stops being a longer RSS reader and starts to compound.

## Three hundred items, three decisions

Reading everything is not the same as knowing what to do. The model still has to choose. So the `/radar` command, a 135-line prompt, forces every theme into one of three buckets.

<div class="rd-diagram" markdown="0">
  <div class="rd-pipe-title">The triage</div>
  <div class="rd-funnel">
    <div class="rd-funnel-top">311 items → 20 themes</div>
    <div class="rd-buckets">
      <div class="rd-bucket act">
        <div class="rd-bucket-h">ACT NOW</div>
        <div class="rd-bucket-rule">3+ sources · specific action · timely</div>
        <div class="rd-bucket-n">3 <span>recommendations</span></div>
      </div>
      <div class="rd-bucket watch">
        <div class="rd-bucket-h">WATCH</div>
        <div class="rd-bucket-rule">2 sources · or accumulating</div>
        <div class="rd-bucket-n">6 <span>themes</span></div>
      </div>
      <div class="rd-bucket bank">
        <div class="rd-bucket-h">BANK</div>
        <div class="rd-bucket-rule">everything else, stored silently</div>
        <div class="rd-bucket-n">9 <span>themes</span></div>
      </div>
    </div>
  </div>
</div>

ACT NOW is the strict one. A theme earns it only if it shows up in three or more independent sources this cycle, or it was already accumulating in the bank, and it carries a specific action, and I haven't already written about it. Those three headlines from the top of the post were the trimmed version. Here is what the first one actually looked like, in full:

> **Write "72 Hours Without Claude."** On Friday a single government letter pulled Fable 5 and Mythos from every user on Earth. Seven sources covered it. Not seven articles. Seven independent source categories: HN, The Verge, Pragmatic Engineer, three Dev.to tags, Simon Willison, Import AI, Platformer.
>
> You use Claude Max daily. You built Radar on it. Write from the gut.
>
> **Publish by Wednesday.** Pragmatic Engineer is already drafting "Did Anthropic's new model just boost rival Codex's market share?" If you wait, you become a follower.

That is not a list of links. That is an intelligence brief with a deadline.

This is the moment I started trusting the machine. It told me to write about the week a frontier model vanished. I already had. Not because Radar told me to, but because I lived the same week and reached the same verdict on my own. That post turned into [a teardown of NVIDIA's agent sandbox](/nvidia-openshell-ai-agent-sandbox/), anchored on the exact event Radar ranked as the loudest signal it had ever recorded.

The machine and I agreed without conferring. That is not obedience. That is corroboration.

{% include v2/sponsor-slot.html %}

## What it pulled out of the noise

The first full run on the current system: 311 items from 30 sources, fetched in about two seconds. Twenty themes. Five surfaced, six on the watch list, nine banked. The model read all 311. Every one of them informed the output, even the ones it chose to bury.

The pain points are where it earns the most trust, because it pulls them as exact quotes with the source attached. Real things real people typed:

> "Last quarter our OpenAI bill went from $620 to $2,480 in 23 days. No new features shipped."

> "I expected the cheaper model to be cheaper. It cost 8.6x more."

> "The detector said I cheated. I wrote every word myself."

Ten of those in a single run, each one a half-formed article idea with the audience already attached. The last one is mine to own, by the way. Technical writers whose entire identity is the quality of their writing, now judged by machines that don't know what quality is. They know what pattern deviation is. That is a different thing.

And then the absence. The system flagged HTML-first development as fading: 1,545 points of engagement on June 11, zero items across all 311 this cycle. A keyword search would have returned nothing and told me nothing. The signal bank returned nothing and told me a trend had just died. The silence, caught.

## What a source actually is

A whole source, the thing the system grows by, is this much text:

```yaml
id: simon-willison
name: "Simon Willison's Blog"
type: rss
enabled: true

config:
  endpoint: "https://simonwillison.net/atom/everything/"
  headers:
    User-Agent: "Radar/1.0"

signal_type: ["capability", "trend"]
audience_tags: ["devs_curious_ai", "hardcore_tech"]

pre_filter:
  recency_window_hours: 168
  dedup_key: "url"

priority: 1
```

The fetcher supports two types: `json_api` for things like the Hacker News Algolia endpoint and the Dev.to API, and `rss` for everything else. A field map inside the config tells it how each API's particular response shape maps onto that one boring dataclass. That is the only flexibility the code has, and it is enough for thirty feeds across seven beats.

<table class="rd-table">
  <thead>
    <tr><th>Beat</th><th>Sources</th><th>What it catches</th></tr>
  </thead>
  <tbody>
    <tr><td>AI practitioner elite</td><td>Simon Willison, Ethan Mollick, Jack Clark, Last Week in AI</td><td>What the best minds are actually thinking</td></tr>
    <tr><td>Technical writing</td><td>Tom Johnson, Dev.to writing, Dev.to tutorial</td><td>My audience, directly</td></tr>
    <tr><td>Engineering leadership</td><td>Pragmatic Engineer, Platformer, Lenny's Newsletter</td><td>Hiring, policy, product strategy</td></tr>
    <tr><td>Developer community</td><td>HN (front page, beat, show, hiring), Dev.to (7 tags), Lobsters</td><td>Community signal, pain points</td></tr>
    <tr><td>Industry and funding</td><td>TechCrunch, Crunchbase, Product Hunt</td><td>Where money flows, what launches</td></tr>
    <tr><td>Tech press</td><td>The Verge, Ars Technica, MIT Tech Review, InfoWorld</td><td>Mainstream coverage, public mood</td></tr>
    <tr><td>Developer tooling</td><td>GitHub blog, Changelog, Julia Evans</td><td>Platform shifts, craft</td></tr>
  </tbody>
</table>

Thirty enabled, one parked with `enabled: false` when I want it quiet. The whole source layer is files in a folder. You can read it, diff it, and delete it. There is nothing to log into.

## Where it doesn't shine

I will not pretend this is magic, because the fastest way to make a system like this untrustworthy is to oversell it.

It is not autonomous. I run the fetch. I run the synthesis. I decide which ACT NOW items I am actually doing, and I tell it which ones to forget. The model triages and remembers. I stay the operator. The day I hand the whole loop to a cron job and stop reading the raw output is the day it quietly starts lying to me and I don't notice.

It also lives or dies on the quality of the prompt. The 135 lines in `/radar` are doing the work the 2,453 lines of Python could not. That is not free. A vague prompt gives you a vague brief, and the model will confidently theme noise into a trend if you let it. The discipline moved from the code into the instructions, and instructions are harder to test.

And the obvious objection is fair: this is a reasoning model reading a folder of JSON. You could call it an RSS reader with one very expensive step bolted on. The fetching was never the hard part. But an RSS reader shows you today and forgets it by tomorrow. It can never tell you that this exact theme was a whisper in May and a roar in June, because by June it has lost May. The signal bank is the part that is not RSS. That is the part I would defend to the death, and it is the part I was paying clever code to fake, and fake badly.

And here is the seam a careful reader will find before I do. Accumulation only works if the model files the same theme under the same name every cycle. Call it `ai_cost_pain` one week and `llm_billing_shock` the next, and the counter silently resets to one. The current version leans on the prompt to reuse names, which is a polite way of saying it leans on luck. That is the real soft spot, and it is the first thing on the workbench.

## What's still on the workbench

Radar works today, but I treat it as permanently half-built. An intelligence system you stop improving is just a faster way to be confidently wrong. Two things are in flight.

The first fixes that naming soft spot: match themes by meaning, not spelling. Embed each new theme and compare it against the bank, so `ai_cost_pain` and `llm_billing_shock` collapse into one accumulating signal even when the model cannot keep its own naming straight. The accumulation stops depending on the model's memory and starts depending on math.

The second is an eval harness, because right now the triage has no scorecard. The ACT NOW calls could be sharp or they could be confident noise, and I would not have a number either way. The next build logs every ACT NOW item and grades it against what actually happened weeks later: did the theme keep climbing, did the post get written, did the signal hold. Precision of the last ten calls, printed at the top of every digest. A system that claims to find signal should be willing to be graded on whether it did.

Neither is shipped yet. I am telling you that on purpose, because the day a tool like this stops admitting what it cannot do is the day you should stop trusting it.

## What it actually taught me

Three lessons, and the first one cost me 2,453 lines to learn. Do not make your code pretend to be a mind. Mine spent weeks validating and scoring and gating, and all it ever produced was apologies. The model, handed the same raw data, gave back dollar amounts and a dead trend caught by its silence.

Memory beats coverage. A stateless tool with a hundred sources is still a goldfish. A stateful one with thirty compounds. The signal bank is forty lines of behavior in a prompt, and it is the only part of this I would not give up.

> Cross-source validation is the line between a signal and a coincidence. One source is an anecdote. Three is a pattern. Seven is an event you are already late to.

The third lesson is hiding inside the other two. No server. No frontend. No auth. No cloud. A laptop and two seconds. Keeping the code stupid was the only way to leave the intelligence somewhere it could actually live.

## Why I built this anyway

You might reasonably ask why this needs to exist when the market is already full of tools that do something close. Fair question, and there are good ones to reach for first. [Feedly](https://feedly.com) watches your feeds and lets an AI assistant prioritize and summarize them. [Perplexity](https://www.perplexity.ai) hands you a sourced answer the second you think to ask. [NotebookLM](https://notebooklm.google.com) will synthesize any pile of documents you give it. I use all three, and they are very good at what they do.

Where Radar shines is a narrower place, and a real one. It has a memory. It does not just surface what is loud today; it remembers that a theme was a whisper in May and tells me the week it turns into a roar. It answers to a single beat, mine, so a faint signal that matters to a technical writer never gets averaged away by what matters to everyone. And the output is not a feed to read. It is three decisions with deadlines.

That is the whole of it. A tool with a memory, tuned to one person, that ends in an action instead of a reading list. The polished products were never going to build that, because there is no market in an audience of one. There was, though, an itch.

## You don't have to read it all

The repository is public, MIT license, [on GitHub](https://github.com/gtrivedi/radar). The `CLAUDE.md` documents the architecture and the `/radar` command in `.claude/commands/radar.md` is the engine. Clone it, drop in the five feeds you actually care about, and run it once tonight. You will have your own brief in the morning.

I opened by admitting I was drowning. Thirty sources, three hundred articles a week, twenty of them actually read.

I still don't read the other two hundred and eighty. I just stopped pretending I had to. Something reads them for me now, remembers what I ignore, and hands it back the week it finally matters.

The pile keeps growing. This post just added to it. The only difference is that I am no longer trying to hold it all in my head.
