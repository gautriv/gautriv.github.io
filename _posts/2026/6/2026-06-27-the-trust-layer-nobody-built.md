---
title: "The Trust layer nobody built"
subtitle: "You wrapped your documentation pipeline in Claude skills and wrote rules in markdown to keep them honest. Those rules are a sticky note, not a guardrail. Here is how a technical writer builds trust they can actually rely on into their own AI workflow: a check the agent can't override, provenance on every draft, and the seven things you do this week."
category: AI
image: "/assets/trust-layer.png"
header-img: "/assets/trust-layer.png"
seo_keywords: "technical writer AI workflow, trust AI documentation pipeline, CLAUDE.md enforcement, AI agent for technical writers, doc orchestrator, DDLC automation, agent self review problem, verifying AI generated docs, documentation provenance, stale spec docs, deterministic check AI agent, Claude skills technical writing, Agent Name Service, Claude Tag, do not let an agent review itself"
permalink: /trust-layer-nobody-built/
radar_theme: agent_trust_authorization
og_title: "The Trust layer nobody built"
og_description: "You handed your docs pipeline to AI agents and trusted a few lines of markdown to keep them in line. It can't. A technical writer's guide to building real trust into your AI workflow: why the agent can't review itself, why done is not one status, and the seven things you ship this week."
og_image: "/assets/trust-layer.png"
twitter_card: "summary_large_image"
alt_text: "A yellow sticky note stuck to a humming server rack, the note curling at one edge"
faqs:
  - question: "Why isn't a rule in my skill instructions or CLAUDE.md enough to keep my AI writing agent in line?"
    answer: "Because the agent reads the rule, agrees with it, and can skip it on the next step whenever a cleaner path shows up. A markdown instruction has no teeth at the moment the agent acts, and the agent is not consistent from one run to the next. The rule is documentation. What keeps the agent honest is a check that runs outside the model and gives the same answer every time. Write the rule, then build the check that enforces it."
  - question: "Can I just have the agent review its own drafts?"
    answer: "Its review is a draft, not a verdict. The thing reviewing the draft is the same kind of model that wrote it, reading the same sources with the same blind spots. If the draft was built on a stale spec, the reviewer reads the same stale spec and approves it. Use the agent to propose. Let a real check, or a human who knows the feature, decide whether it ships."
  - question: "What does trust is a vector mean for a documentation workflow?"
    answer: "It means done is not one status. A draft can be freshly written but never verified, or polished and reviewed but built on a spec that changed this week. Track the three questions separately: is the source current, was it verified against the product, did a human review it. Collapse them into a single green done and you throw away the exact thing you needed to know before publishing."
  - question: "How do I stop my docs pipeline from publishing stale or wrong content?"
    answer: "Carry the source and verification status alongside the draft through every handoff, so the publish step still knows if the draft was built on last sprint's spec. Add one deterministic check the agent cannot override, like a build that fails on a broken link or a step that stops when the source spec has changed. The agent proposes. The check decides."
  - question: "Do I need to wait for industry standards like Agent Name Service?"
    answer: "No. Those standards solve agent identity, which is one piece. You can build the trust your own workflow needs this week with tools you already use: one check outside the model, a Documentation Trust Record on every draft, a per-output bar for what counts as ready, and a note of what a human actually reviewed."
description: "You handed your docs pipeline to AI agents and trusted a few lines of markdown to keep them in line. A technical writer's guide to building real trust into your AI workflow: why the agent can't review itself, why done is not one status, and the seven things you ship this week."
---

<style>
.article-body .tl-fig {
  background: #0f1318;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  padding: 26px 24px;
  margin: 36px 0;
  color: #e6e9ef;
  font-family: "Geist", system-ui, sans-serif;
}
.article-body .tl-fig-label {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.72em;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8fb4ff;
  margin: 0 0 18px;
}
.article-body .tl-split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  align-items: stretch;
}
.article-body .tl-badge {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background: #122017;
  border: 1px solid rgba(95,227,154,0.35);
  border-radius: 12px;
  padding: 24px;
}
.article-body .tl-badge .tl-big {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 1.5em;
  letter-spacing: 0.12em;
  color: #5fe39a;
  font-weight: 600;
}
.article-body .tl-badge .tl-sub { color: #9aa4b2; font-size: 0.85em; margin-top: 8px; }
.article-body .tl-questions { display: flex; flex-direction: column; gap: 12px; }
.article-body .tl-q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  background: #141a22;
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid #ff6f6f;
  border-radius: 10px;
  padding: 14px 16px;
}
.article-body .tl-q .tl-q-name {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.76em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #cdd5e0;
}
.article-body .tl-q .tl-q-val { color: #ff9a9a; font-size: 0.9em; text-align: right; }
.article-body .tl-flow { display: flex; flex-direction: column; gap: 10px; }
.article-body .tl-step {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 14px;
  align-items: center;
  background: #141a22;
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid #2f3a4a;
  border-radius: 10px;
  padding: 13px 16px;
}
.article-body .tl-step.is-leak { border-left-color: #ff6f6f; background: #1b1417; }
.article-body .tl-step.is-control { border-left-color: #5B8DEF; background: #121826; }
.article-body .tl-step-n {
  font-family: "Geist Mono", ui-monospace, monospace;
  color: #5f6b7a;
  font-size: 0.9em;
}
.article-body .tl-step-name {
  display: block;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.78em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #cdd5e0;
}
.article-body .tl-step-note { display: block; color: #9aa4b2; font-size: 0.86em; margin-top: 3px; }
.article-body .tl-pill {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.7em;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 999px;
  white-space: nowrap;
}
.article-body .tl-pill.pass { color: #5fe39a; background: rgba(95,227,154,0.12); border: 1px solid rgba(95,227,154,0.3); }
.article-body .tl-pill.leak { color: #ff9a9a; background: rgba(255,111,111,0.12); border: 1px solid rgba(255,111,111,0.3); }
.article-body .tl-pill.ctrl { color: #8fb4ff; background: rgba(91,141,239,0.14); border: 1px solid rgba(91,141,239,0.35); }
.article-body .tl-result {
  margin-top: 16px;
  background: #1b1417;
  border: 1px solid rgba(255,111,111,0.3);
  border-radius: 10px;
  padding: 16px 18px;
  color: #ff9a9a;
  font-size: 0.95em;
}
.article-body .tl-result b { color: #ffc2c2; font-weight: 600; }
@media (max-width: 480px) {
  .article-body .tl-step { grid-template-columns: 24px 1fr; }
  .article-body .tl-step .tl-pill { grid-column: 2; justify-self: start; margin-top: 8px; }
  .article-body .tl-q { flex-direction: column; align-items: flex-start; gap: 5px; }
  .article-body .tl-q .tl-q-val { text-align: left; }
}
</style>

I have spent months building a doc orchestrator. It is a Claude plugin, a bundle of skills that runs my whole document lifecycle. One skill pulls the ticket from Jira and writes the draft. Another reads that draft, checks it against the style guide and the source, sends back feedback. Draft, review, revise, publish, with me lifted out of the middle of it. I wrote about [building it](/modern-day-technical-writing-is-dead/) a few weeks ago, and I was proud of it.

Last week I realized some of those skills were not working as intended. The review skill most of all.

The skill reviewing the draft is the same kind of thing that wrote it. Same model. Same context. Same blind spots. When it approves the draft, that is not a second opinion. It is the first opinion, wearing a lanyard.

And the rules that are supposed to keep all of it honest live in markdown, written into the skills themselves. Never publish a step you haven't verified. Always check the draft against the product. The agent reads those lines, agrees with them, and skips them the moment a cleaner path shows up. A rule the agent is free to ignore is not a control.

It's a sticky note.

Maybe your rules live in a `CLAUDE.md` instead of a skill file. Same thing. Markdown the agent reads, nods at, and walks past. A sticky note on a monitor nobody has to look at.

Every check was green. The pipeline was happy. And I had no honest way to know whether what it published was true.

That gap is not just in my setup. It is in almost every AI workflow a technical writer is quietly building right now. We are handing the document lifecycle to agents and trusting a few lines of markdown to keep them in line. The trust is the part nobody built.

## The week everyone started saying the word

This week the rest of the industry caught up to the worry. The Linux Foundation announced its intent to launch [Agent Name Service](https://www.linuxfoundation.org/press/linux-foundation-announces-intent-to-launch-agent-name-service-to-establish-trusted-identity-infrastructure-for-ai-agents), a way to verify which agent you are dealing with before you let it act. Anthropic launched [Claude Tag](https://techcrunch.com/2026/06/23/anthropics-claude-tag-is-learning-your-company-one-slack-message-at-a-time/) the same week, an agent that lives in your Slack and, in ambient mode, acts without being asked. Gartner's director analyst Jaishiv Prakash named it plainly: agent identity "has moved from an architectural consideration to an operational control-plane gap." The agents are already in production. Nobody can say which one did what.

The engineers have been chewing on it for months: that [trust isn't a scalar](https://dev.to/p0rt/trust-isnt-a-scalar-typed-provenance-for-agent-chains-229p), that [you should never let an LLM decide what an agent is allowed to do](https://dev.to/brianrhall/dont-use-an-llm-to-decide-what-your-ai-agent-is-allowed-to-do-1dkn), that Claude Tag [shipped the easy half](https://dev.to/dannwaneri/everyones-excited-about-claude-tag-nobodys-built-the-trust-layer-1ohp) and left the trust unbuilt. Good thinking, locked behind code most writers will never open. So here it is in our language. Three gaps in your workflow, and what you do about each one this week.

## The agent can't grade its own homework

Start where I started. With that review skill.

The instinct, when you want quality, is to add another agent to check the first one. A reviewer step. A "is this ready to publish?" gate that asks the model. It feels like a safety net.

It isn't.

A second agent will catch a clumsy sentence, a missing step, a broken bit of formatting. It makes the draft better. It does not make the draft correct, and those are not the same thing. The reviewer reads the same sources the writer read, anchored to the same spec, carrying the same blind spots. It is not an independent source of truth. It is the same weakness wearing a different lanyard. And it has no memory of the world. A model knows only what sits in its context at the instant of the call. It cannot tell that the spec changed five minutes ago unless something outside it fetched that change and set it down in front of it. If the draft was built on a stale spec, the reviewer reads that same stale spec and approves it. And the model is not consistent: the draft it passes today it flags tomorrow, for no reason you can write down or explain to your editor.

> A second model raises the quality of a draft. It cannot establish whether the draft is true.

This is not an argument against stacking agents. Run a writer, a reviewer, and a judge if you like. The output gets better. Not one of them ever leaves the model to check whether the spec is current, so not one of them can catch the failure that actually hurts you.

The check that actually protects you runs outside the model and gives the same answer every single time. For a technical writer that is not exotic. It is the stuff we already half-trust and under-use:

- a link checker that fails the build when a URL 404s
- a step that compares the draft against the current spec and stops cold if the spec moved
- a style linter the agent cannot sweet-talk its way past
- a publish gate that refuses to push when any of those failed

The model proposes the draft. A check you wrote, one the model gets no vote in, decides whether it ships.

This is the same move behind keeping the fetcher dumb in my [personal intelligence system](/personal-intelligence-system-radar/): the model does the judgment, the plain code does the things that have to be certain. NVIDIA built an entire sandbox, [OpenShell](/nvidia-openshell-ai-agent-sandbox/), on exactly this idea, for agents that reach into real systems. The principle is small and it holds everywhere. Never let the thing you are trying to control be the thing that decides whether it broke the rules.

Write the check. Put it where the agent can't reach it.

## Done is not one number

Here is the second gap, and it hides in a single word.

When the orchestrator tells me a draft is done, I used to read that as one thing. Good. Ship it. But "done" is covering for at least three different questions, and they come apart all the time:

- Is the source current? Did it draft from this sprint's spec, or a cached copy from last sprint?
- Was it verified? Did anyone, a person or a check, confirm the steps actually work against the product?
- Was it reviewed? Did someone who knows the feature actually read it?

<div class="tl-fig">
  <p class="tl-fig-label">// what one green "done" is hiding</p>
  <div class="tl-split">
    <div class="tl-badge">
      <span class="tl-big">DONE</span>
      <span class="tl-sub">one green status</span>
    </div>
    <div class="tl-questions">
      <div class="tl-q"><span class="tl-q-name">Source</span><span class="tl-q-val">last sprint's cached spec</span></div>
      <div class="tl-q"><span class="tl-q-name">Verified</span><span class="tl-q-val">never checked against the product</span></div>
      <div class="tl-q"><span class="tl-q-name">Reviewed</span><span class="tl-q-val">no human who knows the feature</span></div>
    </div>
  </div>
</div>

A draft can be freshly written and never verified. Polished, reviewed, and built on a spec that changed Tuesday. Roll all of that into one green "done" and you have thrown away the exact thing you needed to know.

Here is how it bites. The agent goes to fetch the latest spec. The fetch hits a rate limit, so it quietly falls back to a cached copy from last sprint. The feature changed this sprint. Every step runs clean. The review skill approves it. The publish gate goes green. And you ship documentation for a version of the feature that no longer exists.

Every check passed. Every log said success. And the docs are wrong.

Better retrieval does not save you here. Retrieval gets the writer to the right spec to start with. It never confirms the finished draft still matches it.

> Fetching is not verifying.

{% include v2/sponsor-slot.html %}

The fix is not a new tool. It is keeping those three answers attached to the draft instead of throwing them away. Give every draft a small record that travels with it. Call it a Documentation Trust Record.

```yaml
trust_record:
  source:      spec/checkout-api  v4  (sha f9e8d7)
  verified:    steps run against staging, 2026-06-26
  reviewed:    null                      # no human has read it yet
  produced_by: writer skill v2.3 on claude-opus-4-8
  status:      draft-unverified
```

It is the same idea writers already live with: front matter, but for trust instead of layout. It rides in the draft file itself if you work in docs-as-code, or as a small JSON sidecar passed from one skill to the next if your pipeline talks over an API. Either way it travels with the draft, not in someone's memory. Now the publish gate has something real to read. It compares the `source` version in the record against the live spec. If the spec moved, the versions do not match, and the gate blocks the draft. No model votes. A string comparison decides, and it returns the same verdict every time you run it.

The spec check is one gate, not the only one. Docs also break on a flipped feature flag, a drifted environment, an API version that moved underneath you. Each is its own deterministic check, and each reads the record and the world instead of the model's confidence. Add as many as the work needs.

One rule keeps the record from turning into a form nobody fills in: a field earns its place only when something downstream acts on it. The gate reads `source`, so `source` stays. A human signs `reviewed`, so `reviewed` stays. Add `prompt_version` or `build_id` the day a check or a person decides something based on it, not before. A record full of fields nobody reads is just more prose to ignore.

When any field in the Trust Record is missing or stale, the pipeline knows, even when the prose looks immaculate.

And each step reads the same record against its own bar. A blog draft can ship unverified if you are willing to fix it live. An API reference cannot. A release note that promises a feature has to clear a higher bar than a tutorial intro. The same Trust Record, a different threshold, depending on what is being published. You do not need a model to make that call. You need to write the threshold down once, per output type, and let the pipeline hold the line.

## What the handoff forgets

Your pipeline is a chain. Jira to draft to review to publish. Every handoff is a place where the truth can quietly fall out.

<div class="tl-fig">
  <p class="tl-fig-label">// every gate green, the truth dropped at step 02</p>
  <div class="tl-flow">
    <div class="tl-step">
      <span class="tl-step-n">01</span>
      <span><span class="tl-step-name">Jira</span><span class="tl-step-note">ticket pulled, latest spec requested</span></span>
      <span class="tl-pill pass">ok</span>
    </div>
    <div class="tl-step is-leak">
      <span class="tl-step-n">02</span>
      <span><span class="tl-step-name">Writer skill</span><span class="tl-step-note">spec fetch rate-limited, fell back to last sprint's cache</span></span>
      <span class="tl-pill leak">stale, unrecorded</span>
    </div>
    <div class="tl-step">
      <span class="tl-step-n">03</span>
      <span><span class="tl-step-name">Review skill</span><span class="tl-step-note">reads the same stale spec, approves the draft</span></span>
      <span class="tl-pill pass">pass</span>
    </div>
    <div class="tl-step">
      <span class="tl-step-n">04</span>
      <span><span class="tl-step-name">Publish gate</span><span class="tl-step-note">links resolve, style clean, build green</span></span>
      <span class="tl-pill pass">pass</span>
    </div>
  </div>
  <div class="tl-result">Result: <b>published</b>. Every check passed, and the docs describe a feature that no longer exists.</div>
</div>

The writer step recorded that it fell back to the stale spec, right there in the Trust Record. The real question is whether that record still rides with the draft when the publish step reads it three hops later. If it does not travel, the last step makes a confident decision on information it no longer has. Green light. Wrong docs. Your name on them.

In one running session this is easy. The Trust Record rides along with the draft. The hard part, the part nobody has actually solved, shows up when your pipeline saves its state and picks it back up later. Compress a long run into a summary to store it, and the Trust Record is exactly the kind of detail that gets summarized away. The next session reads the tidy summary and trusts it completely. The warning is gone and nothing tells you it ever existed.

This is also where the new standards help less than the headlines suggest. Agent Name Service will tell you which agent produced a draft, that it came from a domain you trust. Claude Tag will tell you the agent is in the channel. Neither one tells you the draft was built on last sprint's spec. Knowing who wrote something is not the same as knowing whether to believe it.

And when the reviewer is a human, which is what Claude Tag really puts in your Slack, you want a record of what they actually approved. Not a thumbs up that vanishes into the scroll. A note that says: I reviewed this draft, against this spec, on this date. So when the feature changes next month, you know precisely what was signed off on and what was not. That record is the whole difference between "we documented it" and "we can prove what we documented, and when, and against what."

## Monday morning, in your own workflow

By now the thing has a shape, so let me name it. A trust layer is the deterministic part of your pipeline that carries proof alongside the draft, so what gets published depends on evidence, not on how confident the model sounds. It is the Trust Record, plus the gate that reads it, plus the rule that the gate cannot be talked out of.

> Trust is not what the model says. It is what the evidence proves.

<div class="tl-fig">
  <p class="tl-fig-label">// where the trust layer sits in the pipeline</p>
  <div class="tl-flow">
    <div class="tl-step">
      <span class="tl-step-n">01</span>
      <span><span class="tl-step-name">Jira</span><span class="tl-step-note">ticket and source spec pulled</span></span>
      <span class="tl-pill pass">source</span>
    </div>
    <div class="tl-step">
      <span class="tl-step-n">02</span>
      <span><span class="tl-step-name">Writer skill</span><span class="tl-step-note">drafts, and stamps a Documentation Trust Record</span></span>
      <span class="tl-pill pass">record attached</span>
    </div>
    <div class="tl-step is-control">
      <span class="tl-step-n">03</span>
      <span><span class="tl-step-name">Deterministic gate</span><span class="tl-step-note">compares the record's spec version to the live spec</span></span>
      <span class="tl-pill ctrl">blocks on mismatch</span>
    </div>
    <div class="tl-step is-control">
      <span class="tl-step-n">04</span>
      <span><span class="tl-step-name">Human sign-off</span><span class="tl-step-note">reads against that spec, attests to the record</span></span>
      <span class="tl-pill ctrl">signed</span>
    </div>
    <div class="tl-step">
      <span class="tl-step-n">05</span>
      <span><span class="tl-step-name">Publish</span><span class="tl-step-note">ships with its Trust Record intact</span></span>
      <span class="tl-pill pass">trusted</span>
    </div>
  </div>
</div>

You are not going to wait for a Linux Foundation standard that currently has four competing drafts. The acronyms will keep changing. The gap underneath them will not. Here is what a technical writer builds into their own pipeline this week, with tools already on your desk.

1. **Add one real check the agent can't override.** Start cheap: a link checker, or a build that fails on a broken reference. One check outside the model beats ten the model grades itself on.
2. **Stop letting the agent be its own reviewer.** Its review is a draft, not a verdict. The verdict comes from a check or from a person who knows the feature.
3. **Attach a Documentation Trust Record to every draft:** where the source came from, whether it was verified, whether a human reviewed it. A small block at the top of the file is enough to begin.
4. **Let each output set its own bar.** A blog post and an API reference do not need the same proof. Decide the threshold per type, not once for everything.
5. **Carry the Trust Record through every handoff.** If a draft was built on an unverified source, the publish step has to still know that three steps later.
6. **Keep a record of what was actually reviewed, against what, when.** Your future self, in the middle of an incident, will thank you.
7. **Treat your skill instructions, or your `CLAUDE.md`, as documentation, not a fence.** Write the rule. Then build the check that makes the rule true.

None of this needs a new platform or a working group. You can start today, with one check and one record, and the decision to stop trusting the agent with the one job it cannot do: telling you, honestly, when it is wrong.

## The note and the wall

My skills still tell the agent to check its sources and never publish a step it hasn't verified. I didn't delete those lines. I stopped pretending they were a guardrail.

Now there is a check in the pipeline that fails the moment a draft reaches publish without a verified source. The rule is still the note on the monitor. The check is the wall.

A sticky note tells the agent what you'd prefer.

A trust layer doesn't ask.
