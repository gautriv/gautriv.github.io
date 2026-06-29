# Field Notes — real-world critiques and the rules they forced

This is the compounding log behind the blog-voice skills. Every time a published post draws a real, substantive critique (a comment, a DM, an editor, a reader who bounced), it gets an entry here. The point is that lessons accumulate instead of being re-learned cold.

**Read this before reviewing or drafting.** Check the draft against the failure modes already logged below. A post that repeats a logged mistake is the most embarrassing kind, because we already paid for that lesson once.

**Entry format:**
- **Date** — when the critique landed.
- **Source** — who/where, and the post it hit.
- **The charge** — what they actually said (steelmanned, not the insult).
- **The valid kernel** — the part that was true after stripping the hostility.
- **Failure mode → rule** — the named failure and the skill rule it created or changed.

This file is also the convergence ledger for skill-hardening loops: when we iterate the skills against a critique, record which gate closed.

---

## 2026-06-16 — "McPost" / AI-slop charge

- **Source:** LinkedIn comment, Anthony H. ("CPO | Technical Writing Manager"), reacting to a post that referenced `/modern-day-technical-writing-is-dead/` ("The industrialization of technical writing"). A second analytical pass from Gemini sharpened the usable signal.
- **The charge:** "A generic, wordy puff piece that could say the same thing in far fewer words and in his own voice." A "#McPost": lots of junk words, little nutrition. Not in his voice. The disclosure that the post was written with AI in the loop gave a hostile reader a ready weapon ("AI slop").
- **The valid kernel (after stripping the status move):**
  1. **Wordy / low signal-to-noise.** ~14-minute read; the core economic argument is restated four times in new costumes (sections: economic meat grinder, the 50% fallacy, the human in the loop, the disruption is finite). One idea, four sections.
  2. **"Not his voice."** The human-only layer was underweight: one thin personal beat ("six months building orchestrators") buried under ~2,400 words of macro philosophy. When the human content is that small a fraction, the prose reads as AI-smoothed even when it isn't.
  3. **"Puff piece / little nutrition."** The macro/economic claims rested on illustrative numbers dressed as data ("2,000,000 words a day", a 50/70/90/99 staircase, a 92/55/22/7 curve) instead of citable real-world data. A skeptic deflates a fake-precise number and discredits the whole piece.
  4. **Over-saturation.** The death metaphor (autopsy / meat grinder / grave / coffin / waiting room / no chairs) ran at max in every section. High stakes earns peaks, not a flat 11 the whole way.
  5. **Machine-assembled feel.** Same structural module reused (two-column human/AI grid 3x, styled bar-viz box 2x); the cinematic template applied end-to-end.
  6. **Doom is a saturated 2026 genre.** "Technical writing is dead" is itself the cliché; the value had to live in the specific mechanism, not the doom conclusion.
- **The deeper finding:** the blog's own manifesto (`/how-i-write/`) declares AI's job as catching *"you said the same thing three times in different sentences"* and *"you started with conviction and ended with hedging,"* and declares hook + thesis + lived experience as human-only. The post violated both. The review pass failed at the job the blog publicly promises it does.
- **Strategy chosen:** earn the disclosure, don't hide it. Out-human the prose (dominant hook/thesis/lived detail), ground claims in real data, make the AI loop do its declared job.
- **Failure modes → rules created/changed:**
  | Failure | Rule |
  |---|---|
  | Under-evidenced macro claims | **Evidence floor** — writing + review. Real citable data or explicit "my model" framing. No fake-precise props as fact. |
  | Human layer underweight | **Earn-the-disclosure / human-anchor ratio** — writing + review. Hook + thesis + early weighty lived detail must dominate. |
  | Same beat restated across sections | **Argumentative escalation, not thermal** — fixed the existing "escalating stakes" rule + new review redundancy/compression check with read-time budget. |
  | Max register everywhere | **Modulate within a post** — peaks need valleys; spine recurs without saturating. |
  | Reads machine-assembled to a cold reader | **The Skeptic Read** — new review pass, runs first. |
  | Repeated visual/structural module | **Intra-post module-repetition** check (anti-formula extension). |
  | Doom platitude | **Doom-shape rationing** in the insight-shape list. |
- **Convergence (skill-hardening loop) — all four gates PASS (2026-06-16):**
  1. **Re-derivation — PASS.** Run on the pre-edit post, the hardened review re-derives all three real charges: redundancy (the 50% fallacy / human-in-the-loop / disruption-is-finite sections collapse to one sentence), "not his voice" (one thin buried personal beat under ~2,400 words of macro), and vibe-not-data (the fake-precise `2,000,000` / `50-70-90-99` / `92-55-22-7` numbers).
  2. **Clean skeptic read on the rewrite — PASS.** Real cited data (Klarna 2.3M chats / 700 agents / $40M; deflection 40-60% mature, 10-20% first-year; market $5.23B→$7.71B; ~30% TW thinning with hedge), projections openly labeled "my model," human anchor promoted to the 5th paragraph and paid off at the close, no screenshot-to-mock line left.
  3. **False-positive guard — PASS.** Every new rule is gated (evidence floor → macro claims only; human-anchor → "mostly macro argument"; saturation → high-stakes only; module-repeat → 3x + functional-list exemption). They produce zero findings on a Plain how-to; a 2023 how-to control fails only on pre-existing blockers, not on any new rule.
  4. **No bloat — PASS.** Review 9→10 H2 sections, writing 21→22 (one new section each); the rest folded into existing checks; one duplicate "drama is the exception" restatement removed.
- **Proof artifact + a SECOND lesson (the over-correction):** the first retro-edit cut the post 2,626→1,818 words but went too far — it deleted the author's *distinct ideas and framing* (the "autopsy" section title, the 50→70→90→99 compounding staircase, the CFO-vs-CTO two-math beat) in the name of "compression" and "de-saturation," and introduced a rendering bug (inline `<strong>` labels rendered invisible because `.article-body p strong` inherits the dark theme's near-white `--text` on light cards). Gaurav rejected it: "you removed my thinking... what's left? Do you over-complicate the skills?" **Reverted to original.**
  - **Root cause:** the new compression/redundancy/de-saturation rules were read as "delete sections" instead of "tighten sentences and lower metaphor frequency." "Wordy" meant over-written prose and relentless drama, NOT too many ideas.
  - **Fix to the skills (a SIMPLIFICATION, not more rules):** added a **GUARDRAIL — the author's ideas and voice are sacred** to the redundancy check (review) and the one-idea-per-section + metaphor-spine rules (writing): compress words-per-idea, never the count of ideas; related-but-different facets are not duplicates; de-saturation lowers frequency, never deletes framings/voice; prescribe "tighten," not "delete a section." **Removed** the "intra-post module repetition" check entirely — it was marginal and it is what drove collapsing the 3 grids (causing the bug and stripping structure). Net: skills got SIMPLER and safer, not more complex.
  - **Still open:** the genuinely-warranted fixes (add real Klarna/deflection data as reinforcement; relabel the 3 fake-precise numbers as the author's directional model; strengthen the human anchor) are to be applied SURGICALLY on top of the original, additively, with the author steering — not via another from-scratch rewrite.

---

## 2026-06-28 — "The Trust Layer Nobody Built" drafting + multi-round editorial stress-test

- **Source:** Self-review while drafting a new post (agent trust, written for technical writers), then several rounds of external editorial critique (the Gemini stress-test loop). The post went from 8.9 → 9.7 across the rounds.
- **The charges (ranked) and where they land:**
  1. **Fabricated lived anchor (worst).** The first draft opened on a WordPress.org plugin rejection presented as the author's first-person experience. It never happened; Gaurav caught it: "I have never done it. Why would I run it." → Reinforces **the lived detail is yours** + **evidence floor**. New emphasis (logged, not a new rule, the rule exists): **never invent a first-person anecdote for the author.** If the real lived detail is missing, ASK for it. A fabricated anchor is worse than a thin one, and it poisons the whole disclosure.
  2. **Wrong altitude.** The first full draft was engineer-grade (Python dataclasses, `min()`, consumer-side policy floors) for a technical-writer audience. Gaurav: "too tech heavy... how can it help technical writers." → **New Altitude rule** (writing + review): translate engineering into the docs world (deterministic policy → a link-checker or publish gate; provenance vector → "is the source current, was it verified, did a human review it"). Engineer-altitude prose reads off-target even when it is correct.
  3. **Absolute claims an expert deflates.** "The agent can't review itself" was too strong; multi-agent critique demonstrably raises quality. → **New defensibility line**: narrow the claim to the true mechanism ("review raises quality but cannot establish correctness"). A broad absolute a domain expert kills with one counterexample sinks the post's authority.
  4. **Guessed the author's architecture.** Framed his doc orchestrator as governed by `CLAUDE.md`; it is a Claude plugin of skills, rules living in the skill markdown. → Reinforces the trace-to-source rule: confirm the author's real system before building an argument on it.
- **Wins worth repeating (positive patterns, not failures):**
  - **Coin and define the artifact.** Naming a reusable artifact ("Documentation Trust Record") and giving a one-sentence definition of the key term ("a trust layer is...") moved the piece from commentary to reference. For thought-leadership posts: name the thing, define it once, then use the name relentlessly.
  - **SME-verify news pegs against PRIMARY sources during drafting, not after.** Claude Tag (real, launched 2026-06-23), ANS ("intent to launch," LF press release not the InfoWorld secondary), and the verbatim Gartner quote were all checked before the post relied on them.
- **Discipline honored (per the 2026-06-16 over-correction lesson):** logged the fabricated-anchor case here instead of adding a rule that already exists; kept the two genuinely-new skill additions (Altitude, defensibility) to a few lines each. No from-scratch rewrites, no section bloat.
