---
name: reviewing-blog-voice
description: Use when reviewing, editing, auditing, critiquing, proofing, or sanity-checking any draft blog post or post section for gautriv.github.io / Being Technical Writer (Gaurav Trivedi), including drafts you just wrote and drafts pasted in for feedback.
---

# Reviewing Gaurav's Blog Voice

## Overview

This is the audit pass. Every draft for the blog gets reviewed against the voice before it ships, including drafts you just generated. Generation and review are two separate passes. A draft that reads fine to you can still be drifting toward generic AI prose.

**Core principle:** Report findings as evidence, not vibes. Quote the offending line, name the rule, give the fix. Gaurav uses critique loops to force depth, so rank your findings by severity and do not soften them. Blunt beats diplomatic.

The voice itself is defined in `writing-blog-voice` and `CLAUDE.md`. This skill checks compliance.

## The Core (these override every check below)

When a finding under one check conflicts with another, these win. Do not average them.

1. **The author's ideas and voice are sacred.** Flag restatement and dead prose; never recommend deleting his ideas, framings, or section titles. Prescribe "tighten this," not "cut this section." Over-cutting his thinking is a worse failure than a slightly-long post.
2. **Length is not a metric.** A long post that earns every section and reads well ships. Flag repetition and boredom, never length itself.
3. **100% human voice is the bar.** A draft can pass every mechanical check and still fail if it doesn't read as wholly him. The Skeptic Read and the human-voice checks outrank tidy correctness.
4. **Substance and honesty first.** A fabricated fact or a hollow argument in beautiful prose is a Rewrite, not a pass.

## How To Run The Review

First skim `field-notes.md` (same folder): real critiques of published posts, logged as named failure modes. Check this draft against every one of them. Repeating a logged mistake is the worst kind of miss, because that lesson was already paid for once.

Go through the draft once per category below. Use the format that fits the finding:

- **For a present violation** (a banned word, an em dash, a flat paragraph you can point at):
  `[SEVERITY] anchor → rule broken → fix`
- **For a structural absence** (missing closing loop, missing confession beat, no forward pull, no metaphor spine — there's no line to quote because the thing isn't there):
  `[MISSING] element name → why it matters → operational fix (where to add it, what to add)`

**Anchoring (avoid hallucinated line numbers):** You see tokens, not lines, so do NOT eyeball line numbers for prose findings — you will be off by 5-20 and the feedback becomes useless. Anchor every judgment finding by a short verbatim **quote** plus the **section heading** it lives under (e.g. `Section "The economic meat grinder", para starting "The dashboard was green..."`). Only cite a literal line number when it came from actual tool output (a `grep -n` hit for an em dash or banned word). Tool-given line numbers are real; eyeballed ones are not.

**Keep output high-leverage (don't drown the blockers):** If a whole section suffers one problem (flat rhythm throughout, telling-not-showing throughout), issue ONE section-level finding with a representative example and a fix direction — do NOT itemize every paragraph. Six tiny rhythm notes bury the one real blocker and blow the output budget. Rank by severity; lead with BLOCKERS; cap minor stylistic notes to the few highest-impact ones.

Then give a final verdict: **Ships** / **Needs a pass** / **Rewrite**. Do not declare "Ships" if any BLOCKER remains.

## The Skeptic Read (run this FIRST, before any category)

Before the checklists, read the whole draft once in a different chair: as a **hostile domain expert who did not choose to read it and resents the time.** Not the supportive reader. The one looking for a reason to dismiss it. Where do they smirk, skim, roll their eyes, or screenshot a line to mock?

This is the single highest-leverage pass, because it catches the failures the checklists miss individually but that compound into "slop" to an outsider: padding, saturation, fake-precise numbers, and the smell of AI-smoothed prose. It is the exact lens a real hostile commenter uses.

- **Name the three moments a skeptic would screenshot to mock.** Quote them. If you cannot find three, you read as a fan, not a skeptic. Read again, meaner.
- **The loop's declared job (the blog publicly promises AI catches these — so you must).** The `/how-i-write/` manifesto says the AI loop's job is to catch:
  1. **Not going far enough** — a section that gestures at an idea and retreats. FLAG → push it to the real conclusion or cut it.
  2. **Saying the same thing three times in different sentences** — the redundancy/compression check below. This is distinct from rhythm flatness (that's cadence; this is *argument repetition across sections*).
  3. **Conviction → hedging drift** — opening a point with a strong claim and closing it soft. FLAG → end on the conviction.
  If the draft commits these, the loop did not run. Saying it ran is not enough.
- **Repetition check (write the one-sentence-per-section test).** For each section, write the single new load-bearing claim it adds. If two sections reduce to the *same* sentence, FLAG → merge them; one is a costume change, not a new floor. The flag is REPETITION and boring, over-written prose, never length itself. Length is not a metric here: a long post that earns every section and reads well is a success. Do NOT recommend cuts to hit a word count or read-time. Recommend them only to remove genuine restatement, or to enliven dead prose. "Make it shorter" is the wrong note; "make this section earn its place / make this paragraph a better read" is the right one.
  - **GUARDRAIL (the author's ideas and voice are sacred).** This check removes RESTATEMENT and filler. It NEVER removes a distinct idea, the author's section framing, or his voice. Related-but-different facets are NOT duplicates: cost math and disruption-tolerance math are two arguments; the "I learned AI" cope and the "institutional knowledge" cope are two copes; a compounding-capability staircase is a distinct mechanism, not a restatement of "economics win." When unsure whether something repeats or adds, KEEP IT. Compress words-per-idea, never the count of the author's ideas. Prescribe "tighten these sentences," not "delete this section." Recommend a full-section cut only when it genuinely says nothing the post hasn't already said. The cost of over-cutting (gutting his thinking, worsening the "not his voice" charge) is higher than the cost of leaving one slightly-long section.
- **Earn-the-disclosure / human-anchor ratio.** This blog discloses AI involvement openly, so the human-only layer must dominate or the disclosure becomes a weapon. Point to the specific, early, weighty, first-person lived detail only this author could supply (a real moment, mistake, name, or number from his own work). If the post is mostly macro argument with one thin confession buried in the back third, FLAG "not his voice" → promote a real lived anchor and land it early. Test: can a reader name three things only Gaurav would have written? If not, the human fraction is too thin.

## BLOCKERS (any one = not shippable)

Scan for these first. They are mechanical and non-negotiable.

| Check | How to catch it | Fix |
|-------|-----------------|-----|
| **Em dash as punctuation** | The single most common drift (~90 in the recent corpus, 74 of them in hand-written body prose, plus front-matter `faqs:`/`og_description`). Policy is to kill them. Grep the whole file for `—` and ` - ` used parenthetically, not just the body. **Default action: replace.** Flag every single one. It stays a blocker until each instance is either replaced OR Gaurav explicitly keeps that one. Never silently strip; never silently keep. | Replace with period, comma, or colon. |
| **AI transitions** | `Furthermore`, `Moreover`, `In conclusion`, `Additionally`, `It's worth noting`. (Do NOT flag `That said` — it is part of his own voice, used in his FAQ answers.) | Cut, or replace with a bridge sentence. |
| **Explanatory opener** | First 2 paragraphs say `In this post`, `Let's dive in`, `Today we'll explore`, or explain what the post is about. | Replace with a cold, concrete, single-sentence scene. |
| **Named hook** | Opening paragraph contains a country, a person's name, or the topic stated plainly. | Withhold. Describe before naming. |
| **Emoji** | Any emoji in body or headings. | Remove. |
| **Hedging / passive voice** | `it could be argued`, `there are many`, `is being done by`. | Make it active and direct. |
| **TW belittled** | Any framing that reduces technical writing to grammar/prose ("grammar won't save you"). | Reframe as translation, judgment, system ownership. |
| **Third-person hypothetical writer** | `a writer might`, `one could feel`. | Switch to `you` or `I`. |

## VOICE CHECKS (presence of the signature, not just absence of sins)

A draft can pass every BLOCKER and still be flat. Verify the engine is actually running.

**First, read the intensity. Gate the rest accordingly.** Decide the post's mode (Plain / Low / Medium / High) from its topic and stakes. Then apply the signature checks PROPORTIONALLY. Do NOT flag a deliberately Plain practical post (a how-to, a config fix) for "missing" confession, metaphor spine, demolition, withheld opening, or curiosity hooks — for that post their ABSENCE is correct. A clear `problem → why → fix → done` explainer is a success, not a deficient thriller. The drama checks apply to Medium/High posts. The craft+rigor checks (substance, rhythm variance, human texture, no machine tells, no em dashes) apply to EVERY post regardless of mode.

- **Substance sound first?** Strip the style in your head and read the bare argument. Is the insight real, specific, and technically correct, or is it beautiful prose around a hollow/shallow/oversimplified point? Any invented stat, fake capability, or vague claim dressed up as profound = FLAG. Hollow-but-pretty is the worst failure mode; catch it before anything else stylistic.
- **Intensity matched to stakes? (between posts AND within one).** Two failures here. (a) *Mismatch:* a minor tool/how-to written like a noir thriller (forced demolition, coffin metaphors, doom) = FLAG as overwrought. High stakes earn full register; small topics get clean restraint. (b) *Saturation:* even a legitimately high-stakes post must MODULATE. If the register sits at 11/10 in every section with no quiet valleys, FLAG — the doom goes numb by the third hit and reads as a model trying too hard. Related: is the metaphor spine *saturated* (the same image — grave, coffin, autopsy, meat grinder, no chairs — in section after section and in the headers) rather than recurring at the open, a midpoint, and the close? Saturation = FLAG even when the topic genuinely warrants high intensity. Peaks only land against valleys.
- **Rhythm present AND the place for literal correction.** This is where line-by-line rhythm gets fixed (the generator can't self-count). Check: one-line-paragraph drumbeats? At least one fragment cascade? Rule-of-three triads? Then scan for flattened stretches — any run of ~4-5+ similar-length sentences/paragraphs with no long-vs-short contrast. Anchor each by section + a quoted opening phrase and prescribe the break (e.g. `Section "The meat grinder", run starting "The dashboard was green..." → all even medium length → drop a 3-word drumbeat into it`). One finding per flattened stretch, not per sentence. FLAG monotony in EITHER direction: all-even, all-long, or all-choppy-short.
- **Opening cold?** Concrete, specific, mid-scene, no warm-up/thesis statement? If it explains or eases in, FLAG. (Withholding the subject is stakes-dependent — checked separately below, not required here.)
- **Opening device fresh vs. recent posts?** Don't guess what prior posts opened with — read them. Posts in this repo are NESTED (`_posts/YYYY/M/...`), not flat. Get the 3 newest with their FULL paths intact, sorted by the date in the filename:
  ```
  find _posts -type f -name '*.md' | awk -F/ '{print $NF"\t"$0}' | sort | tail -3 | cut -f2-
  ```
  Read each file at the exact path that prints (don't reconstruct the path from the date). Look at the first body paragraph (text right after the closing `---` of the front matter). Compare this draft's FIRST line/device against them. If it reuses the same move (another "number + time of day," another "I keep a folder," another "There is a quiet X happening"), FLAG as repetition. No two posts may share an opening device. If you cannot access `_posts/`, say so explicitly and skip this check — do NOT invent what the prior posts said.
- **Opening seeds the closing loop?** The opening image must be the thing the ending returns to. If the open and close don't connect, FLAG — the start→middle→end circuit is broken. (Plain-mode posts may legitimately have no loop; don't force one.)
- **Structural shape fresh vs. recent posts? (anti-formula)** Not just the opening — the whole skeleton. Read the section headers and arc of the last 2-3 posts (same `find` command above). If this draft runs the identical template (cold-open → fragment → reveal → metaphor → confession → demolition → loop) that the recent ones did, FLAG as formula drift even though each post is individually fine. The reader feels a repeated skeleton subconsciously. Vary the architecture: a different shape, a different intensity, skip beats. No two consecutive posts should share the same structural mold.
- **Closing loop?** Does the ending return to the opening image with new meaning? Is the last line short, often a 2-3 word imperative? No loop = FLAG (this is the most common miss).
- **Section headers right?** Definite-article noun phrases, slightly ominous. Not how-to titles. FLAG any `How to...` header.
- **Blockquotes are single aphorisms?** Each blockquote = one compressed, sharp line. Long quotes in a blockquote = FLAG.
- **Confession beat present?** Is there a first-person uncomfortable admission before the practical/teaching section? Missing in a personal post = FLAG.
- **Metaphor spine?** One recurring image introduced early and paid off at the close? Optional but strong; note if absent in a narrative post.
- **Bridges before pivots?** Short 1-2 sentence bridge before topic-shifting H2s? FLAG abrupt header jumps.
- **Back half held the voice? (long-form drift)** Read the SECOND half / bottom 50% as critically as the top — this is where the voice fades into smooth default prose. If the first 400 words sing and the rest flattens into even, balanced paragraphs, FLAG the drift and name where it started.
- **Every H2 re-grips the engine?** Does the first line under each section heading hit fresh (pattern interrupt, fragment, drumbeat), or does it slide in with a smooth connective sentence? FLAG any H2 that opens limp.
- **Withholding matched to stakes?** A low-stakes practical post (quick tip, API quirk, config) should NAME the subject in the first sentence, not withhold. If a how-to is being coy for two paragraphs before revealing it's about an env var, FLAG as misplaced mystery (over-applied high-stakes opening).
- **Code blocks handled right?** After any code/YAML/terminal block, is the next line an impact statement or rhythmic turn — or a textbook summary (`In the snippet above...`, `As you can see...`, `This code does...`)? Post-code explanation = FLAG. Also flag invented/filler code.
- **Hooks pulling forward — but NOT manufactured? (Medium/High posts)** Are there open loops, curiosity-gap bridges, foreshadow-then-detonate, a mirror moment, escalating stakes? BUT also check the opposite failure: is any hook manufacturing suspense the post never pays off? An open loop that resolves into nothing, withholding a fix the reader came for, fake cliffhangers = FLAG as LinkedIn-style manipulation. Clarity outranks the hook. On a Plain post, absence of hooks is correct — do not flag it.
- **Can the reader SEE it?** Are key ideas staged as concrete images/scenes (objects, bodies, light, motion), or just stated abstractly? Find any passage that explains where it could show. FLAG "tell, not show." Abstractions with no picture attached = FLAG.
- **Reads human, not machine?** Run the fingerprint scan: (a) **Burstiness** — is there real variance in sentence length, or do most sentences hover around the same length? Uniform length = FLAG. (b) **Abstract tricolons** — `efficiency, scalability, and innovation` style triads of vague nouns = FLAG. (c) **Symmetry/hedging** — over-balanced "on one hand / on the other," `it's important to note`, evenly-weighted tidy paragraphs = FLAG. (d) **List-itis** — flag a bullet list ONLY when it's dodging a narrative argument (a list of *ideas/claims/feelings* that should have been written as connected prose). Do NOT flag lists carrying functional technical data: code parameters, file/directory structures, API fields, config options, ordered setup steps, dependency lists, comparison tables. For technical content a clean list is the correct UX, not a failure. (e) **Generic over specific** — "significant impact," "various tools," "many users" where a real number/name/detail belongs = FLAG. (f) **AI lexicon** — `delve`, `tapestry`, `testament`, `crucial`, `robust`, `landscape`, `leverage`, `navigate`, `realm`, `seamless`, `underscore`, `pivotal`, `intricate`, `myriad`, `unlock`, `elevate`, `foster` = FLAG, swap for the plain human word. Read a suspect paragraph aloud: if it sounds like a press release or textbook, it's machine. Rewrite. (Note: do NOT chase AI-detector scores; see the writing skill's note. Detectors flag clean punchy prose, including this voice; the human reader is the only judge.)
- **Altitude check (audience = technical writers, not ML engineers).** Flag any concept pitched at engineer altitude with no translation into the docs world: raw dataclasses or model internals, unexplained CS jargon, code dropped in without a docs-native equivalent (a deterministic policy → a link-checker or publish gate; a provenance vector → "is the source current, was it verified, did a human review it"). Fix: translate or cut. Engineer-altitude prose reads off-target on this blog even when it is correct.
- **The four hard human-voice elements present? (where AI prose dies)** The fingerprint scan above catches surface tells. These four catch the absence of a person. (5) **Opinion** — a position he'd take heat for, not neutral analysis. Could a stakeless writer have written this? = FLAG. (6) **Emotion** — real feeling *leaked*, not described or performed ("it was frustrating" = FLAG; show it instead). (7) **Conversation** — talking to one person, asides, answering the reader's objection, not broadcasting. All-broadcast = FLAG. (8) **Asymmetry** — lopsided attention; dwells on what grips him, skips the boring, says less than everything. Even/exhaustive/balanced coverage = FLAG (the deepest AI tell). Test: name three things only Gaurav would have written, felt, or chosen to dwell on. Can't find three = voice too thin = FLAG, regardless of how clean the sentences are.
- **Humor dry, dark, and load-bearing?** If there's humor, is it deadpan satire that also wounds/reveals (the "Oh, good." register), or did it slip into slapstick, puns, quips, or jokey filler? Goofy or decorative humor = FLAG. A funny line that doesn't serve the argument = FLAG (cut it). No humor at all in a piece that should bite = note it.

## INSIGHT CHECKS (is the idea worth the rigor? — run before RIGOR)

A post can be rigorously argued AND well-written AND still not worth reading, because the underlying idea is mediocre. This pass runs first in the pipeline (Insight → Argument → Writing → Review).

- **Is the reader's job clear and served? (JTBD)** Can you name, in one sentence, the progress the reader hired this post to make, and the struggling moment behind it? If the post doesn't obviously serve a real job — if it reads like the author performing rather than the reader progressing — FLAG. Check it covers the emotional job, not just the functional one; a correct-but-cold post fails.
- **Originality, not platitude?** Would a smart peer in the field be surprised, or nod and forget? If the thesis is "learn AI or be left behind" or any LinkedIn truism, FLAG — rigorous essay, mediocre insight. Demand the sharper, more specific cut.
- **Why now?** Does the post establish what changed recently that makes this urgent today? No "why now" = FLAG (timeless-and-forgettable).
- **Insight shape — not reflexively contrarian? (cross-post)** What shape is the insight: contrarian, confirming-with-depth, synthesis, reframe, practical discovery? If THIS post and the recent ones are all contrarian ("everyone believes X / X is wrong / here's the truth"), FLAG the rut even if each is individually right — readers see the pattern. Sometimes the credibility move is confirming the consensus with depth. Vary the shape across posts.
- **Reader transformation named?** After reading, can the reader do / decide / see something they couldn't before? State it. If nothing changes in the reader — pure intellectual entertainment — FLAG. (A perspective shift counts; zero change does not. Don't demand a call-to-action where a genuine see-differently is the job.)

## RIGOR CHECKS (the argument, not just the prose)

Style can hide a hollow argument. This pass ignores the prose and interrogates the thinking. Run it on any post making a claim about the world (skip for pure how-tos). These mirror the Argument Engine in the writing skill.

- **One clear claim?** Can you state the post's single thesis in one sentence? If it argues five things or none, FLAG — the spine is missing.
- **Reasoning, not vibes?** Is the "why it's true" an actual mechanism, or assertion dressed as insight? Confident tone with no underlying logic = FLAG.
- **Defensible claims, not absolutes?** Flag any absolute a domain expert can deflate with one counterexample ("X can't Y" where a working counterexample exists, e.g. "an agent can't review itself" vs. real multi-agent critique). Fix: narrow to the true mechanism ("X raises quality but cannot establish correctness"). Broad-and-attackable sinks the post's authority; narrow-and-true survives the comments.
- **Real evidence?** Are claims backed by specific examples, numbers, named cases, or lived experience — not invented stats or hand-waving? Any fabricated or unverifiable "fact" = BLOCKER (this is worse than a style miss).
- **Evidence floor on macro claims? (the "puff piece" test)** When the post makes a claim about the industry, the market, the economy, or "what enterprises are doing," is it anchored to citable public reality (a named earnings call, a documented deployment, a real layoff, a published metric) OR openly framed as the author's own model? Either is fine. What fails: a macro claim resting on vibe, or an illustrative number wearing fake precision as if it were data (`2,000,000 words a day`, an exact `50/70/90/99` staircase, a `92/55/22/7` curve). FLAG → cite real data or visibly mark it as an estimate/model. (Fabricated-as-fact stays a BLOCKER above; this catches the softer "dressed-up illustration" that lets a skeptic call the whole piece vibes.)
- **Counter-evidence faced?** Does the post acknowledge the strongest case against it, or pretend none exists? One-sided propaganda that ignores the obvious objection = FLAG.
- **Steelman, not strawman?** When the post argues against a view, is it the smartest version of that view or a weak caricature knocked down for applause? Strawmanning = FLAG. (The Demolition Move is only legitimate against a genuine *cope*, never against a strong objection.)
- **Falsifiable?** Is there any condition under which the author would be wrong, or is it unfalsifiable preaching? A thesis nothing could disprove = FLAG.

If the prose is beautiful but this pass fails, the verdict is **Rewrite**, not "Needs a pass." Fix the argument before the sentences.

## STRUCTURAL / SITE CHECKS (v2)

- Inline grids must collapse on mobile: either `repeat(auto-fit, minmax(...))` or a `@media (max-width: 768px)` rule setting `grid-template-columns: 1fr`. A fixed multi-column grid with no collapse = BLOCKER (crushes content on phones).
- Inline `<style>` selectors scoped to `.article-body` descendants so they don't leak into chrome.
- Inline `<script>` is vanilla JS only. No `$`, jQuery, or Bootstrap globals = BLOCKER if present.
- In-content ads use `{% include v2/sponsor-slot.html %}`, not raw `<ins>` tags pasted in the body.
- Front matter: confirm `description`, `permalink`, `og_*`, `seo_keywords`, `faqs` present. On a materially-updated old post, confirm `last_modified_at`.

## Output Format Example

```
SKEPTIC READ
[SCREENSHOT] "An agentic pipeline writes 2,000,000 a day" → fake-precise number a hostile expert deflates on sight → cite a real throughput figure or cut the count.
[FLAG] Sections "The 50% fallacy" / "human in the loop" / "disruption is finite" all reduce to "economics beat quality" → redundancy → merge into one; ~25% is removable.
[FLAG] Human anchor (one buried "six months building orchestrators" beat) too thin under ~2,400 words of macro → "not his voice" → promote a real lived detail, land it early.

BLOCKERS
[BLOCKER] grep L149 "make no mistake—they are all" → em dash → "make no mistake. They are all"   (line # from grep -n, real)
[BLOCKER] Opening "In this post I'll walk through..." → explanatory opener → open cold on a concrete scene.

VOICE
[MISSING] Closing loop → ending stops on a summary paragraph, circle never closes → return to the "347 screenshots" image from the open as the final beat.
[MISSING] Confession beat → personal post never admits anything uncomfortable before teaching → add a 2-3 line first-person admission before the "tools" section.
[FLAG] Section "The economic meat grinder", whole section → flat rhythm throughout (even medium paragraphs) → break it up: drop two drumbeats and one fragment cascade. (One section-level note, not per-paragraph.)

VERDICT: Needs a pass. Fix 2 blockers, then the loop.
```

## Red Flags In Your Own Review (don't do these)

| Thought | Reality |
|---------|---------|
| "Reads good enough, ship it" | You skipped the loop and rhythm checks. Run all categories. |
| "I'll just soften this so it's encouraging" | Gaurav wants blunt, ranked critique. Diplomacy reads as dodging. |
| "The em dashes look intentional" | The stated rule is zero. Flag every one. He decides, not you. |
| "It's basically in his voice" | "Basically" means you didn't check the signature is present, only that sins are absent. Verify both. |
| "I couldn't find three things to mock" | You read as a fan. The Skeptic Read fails open, not closed. Read again, meaner, as someone who resents the time. |
| "The numbers make the point land" | If they're fake-precise illustrations, a skeptic deflates them and discards the essay. Cite real data or mark them as a model. |
