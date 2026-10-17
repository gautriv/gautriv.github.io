---
layout: page
title: How I write
permalink: /how-i-write/
description: "How I work with AI on this blog, and how I check what I publish. The argument is mine. The polish isn't entirely."
ai_assisted: false
last_modified_at: 2026-10-17
---

There is a paragraph in almost every essay on this site that I rewrote eleven times.

Not because the words were wrong. Because the thinking underneath was still soft. The first version was a thought. The eleventh was a position. Most readers will never know which is which.

That's the point.

This page is about how that happens.

### The loop

I sketch the spine of the essay first. Hook, turn, beats, closing image. Usually on paper. Sometimes in a markdown file with one line per paragraph. No AI yet.

Then I argue with Claude.

Section by section. I draft. It pushes back. I rewrite. It edits. I delete a paragraph it suggested and replace it with one I like better. It tells me the new one is weaker. Sometimes it's right.

When we disagree about how a sentence sounds, I win. It has to sound like me. When we disagree about whether a sentence is true, nobody wins until I've checked.

The argument is mine. The shape is mine. The polish, the rhythm, the structural surgery: those were negotiated. The final call wasn't. Every sentence that ships is one I chose to keep, and I answer for all of them.

### What stays mine

The hook. Always. If the opening lines came from a model, the essay isn't mine.

The thesis. The reason the essay exists at all. The thing I'm willing to take heat for in the comments.

The personal beats. The confession sections. The specific things I did, screwed up, learned. AI cannot supply experience.

### What AI does

Most of the time, AI isn't writing for me.

It's arguing with me.

It points at a paragraph and says: *this doesn't go far enough.* Or: *you said the same thing three times in different sentences.* Or: *you started with conviction and ended with hedging.*

Sometimes it's wrong.

Sometimes it's painfully right.

> AI can generate text. It cannot decide what is worth saying.

### How I check what I publish

A model can make a wrong sentence sound finished. So the technical claims go through a separate pass.

**Primary sources, not summaries.** A claim about a paper traces to the paper. A claim about a tool traces to its repo, its docs, its changelog. If I can't find where something came from, it doesn't ship.

**If it can run, I run it.** Commands, configs, API calls get executed before they get explained.

**The demos prove themselves.** The model in [how LLM training works](/how-llm-training-works/) is a real one, 44 knobs, small enough to trace. It checks one of its own gradients the slow way, nudging a single knob and rerunning the whole network, and the two answers agree to the twelfth decimal place. Then it hands you a test so you can catch it memorizing instead of learning. You don't have to trust me. Press the button.

**The draft gets attacked before you see it.** I ask Claude and Gemini to tear the argument apart, not polish it. On that same LLM post, the attack found five places where I'd claimed more than the evidence allowed. I had written that after the core training loop, *the rest is scale.* It isn't. I had implied that big models stop memorizing. They don't, and now the post cites the research that shows it. Each overclaim got narrowed, cited, or cut.

**When I'm wrong, I say so.** If you show me a mistake, I fix the post and note what changed. Quietly editing it away would be worse than the mistake.

> Polish makes a claim sound true. Only checking makes it true.

### Why this disclosure exists

Because you should know what you're reading. Which parts are research, which parts are judgment, which parts are polish.

I've written essays on this site about [AI replacing technical writers](/modern-day-technical-writing-is-dead/). I've written about [taking yourself out of the equation](/taking-yourself-out-of-the-equation/). I can't argue that AI is reshaping the craft while pretending it hasn't reshaped mine.

> The argument is mine. The polish isn't entirely. You are reading the loop, not its absence.

If a specific essay used AI more heavily, less heavily, or not at all, the inline confession in that essay will say so. This page is the default.

### What I will not pretend

I will not pretend the sentences are wholly mine when they aren't.

I will not pretend a model's confidence counts as evidence. It doesn't, for me or for it.

I will not pretend AI use is a moral failing that requires apology. The craft has always borrowed. Editors. Copy-editors. Beta readers. Writing groups. Claude is the latest member of that lineage. It happens to be available at 2 a.m.

I will not pretend the loop produces lower quality. It raises the bar I'm willing to ship at.

I will not pretend any of this is settled. Two years from now this page may read as quaint. I'll rewrite it then.

It won't be the first thing on this site I rewrote eleven times.
