---
title: "Taking Yourself Out of the Equation"
subtitle: "Before someone else does it for you, and calls it progress"
category: AI
image: "/assets/talk.png"
header-img: "/assets/talk.png"
seo_keywords: "AI job displacement, automate yourself, Claude AI productivity, AI tools for technical writers, AI workflow 2026, prompting techniques, persona.md Claude, LangChain alternatives, technical writing automation, AI in the workplace, taking control of AI, Block CEO AI firing, AI replacing jobs"
permalink: /taking-yourself-out-of-the-equation/
og_title: "Taking Yourself Out of the Equation, Before Someone Else Does"
og_description: "A technical writer's honest confession: how I learned to automate my own job, what tools I built, and why that might be the most human thing I've ever done."
og_image: "/assets/talk.png"
twitter_card: "summary_large_image"
alt_text: "A person stepping away from their desk as AI workflows take over, cinematic style"
faqs:
  - question: "Should I be worried if my CEO talks about AI replacing jobs?"
    answer: "Worry is the wrong word. Awareness is better. When C-suite executives publicly acknowledge AI-driven workforce changes, it signals that the transformation is no longer hypothetical. It's policy. The question isn't whether it will affect your role, but whether you're shaping that change or reacting to it."
  - question: "What AI tools does a technical writer actually need in 2026?"
    answer: "The stack matters less than the mindset. That said, Claude for deep writing and reasoning, Gemini for research and debate, Cursor for code-adjacent documentation, and NotebookLM for synthesizing large document sets cover most professional needs. Prompting skill is the multiplier across all of them."
  - question: "What is persona.md and why should I create one?"
    answer: "Persona.md is a personal context file you maintain alongside your AI tool of choice. You instruct the AI to store observations about your preferences, communication style, projects, and working patterns in it. After a month of honest interactions, reading it back is unsettling, in the best possible way. It becomes a mirror you didn't know you needed."
  - question: "Is LangChain still worth learning in 2026?"
    answer: "LangChain taught you to think in pipelines, which is valuable. But the framework itself is evolving rapidly and much of its functionality is being absorbed into native model capabilities and simpler abstractions. Learn the concepts. Hold the specific tools loosely."
  - question: "Can AI replace a good technical writer completely?"
    answer: "Not the kind who understands why documentation exists. Not just what it says. AI generates content efficiently. It struggles with judgment: knowing when to warn, when to simplify, when a procedure is genuinely dangerous, when a user will fail not because the instructions are wrong but because the mental model they arrived with is wrong. That gap is still human."
description: A technical writer's honest account of using AI to automate his own work, before his company could do it to him. Claude, Cursor, Gemini, custom NLP tools, and the strange peace that comes from being the one holding the automation.
---

Two stories were running simultaneously on my feed at 10 PM on a Monday night.

One had missiles in it.

The other had a CEO, a public post, and four thousand people who no longer had jobs. I came to it late. Didn’t matter.

Only one of them kept me up that night.

It wasn’t the missiles.

Maybe that says something about distance. Or about human psychology. Or about the specific numbness that settles in after too many headlines in too few days. My heart goes out to everyone living inside that fire. This post is about a different kind of threat.

---

The scroll is a ritual now. Not for information, we stopped needing information around 2023, there’s too much of it and none of it helps. We scroll the way ancient humans scanned the treeline. Looking for movement. Looking for threat. Trying to confirm we’re still inside the story, not outside it.

A war had been burning through my feed for days. You already know the kind. The kind that arrives in fragments, faster than you can build a picture from the pieces. Each headline larger than the last. None of them quite landing.

I kept scrolling.

And then I stopped.

Not on the war.

On a post from the CEO of a major fintech company. Someone who’d built one of the most recognizable payment platforms on earth.

He had just [announced he was laying off 4,000 people](https://fortune.com/2026/02/27/block-jack-dorsey-ceo-xyz-stock-square-4000-ai-layoffs/), nearly half his company.

And he posted it himself.

> “A significantly smaller team, using the tools we’re building, can do more and do it better. And intelligence tool capabilities are compounding faster every week.”

Compounding interest is a miracle when it’s in your bank account. It’s a landslide when it’s your competition.

No grief in it. No corporate softening. No HR-approved language about “restructuring for the future.”

Just a man telling you, with the flat certainty of someone who has already run every number, that the machines had made four thousand jobs unnecessary.

I read it twice.

Put the phone face-down on the desk.

A war on one side of the glass. A quiet corporate confession on the other.

Both felt like early warnings.
Neither felt like fiction anymore.

## Why would a CEO say that out loud?

Here's the thing that kept me up.

It wasn't the content of the post. We've all read the headlines. AI is automating work. Jobs are shifting. This is the decade of disruption, et cetera, et cetera.

What unsettled me was the *decision* to say it publicly.

CEOs don't accidentally post on X. Every word is a calculation. So why would the head of a major company volunteer that AI drove firing decisions? There are two explanations, and they're not mutually exclusive.

**Theory one: it's an advertisement.**

A live demonstration. *Look what AI can do. It's so capable we restructured the company around it.* If your product is financial technology and your investors want efficiency, nothing signals operational confidence like a CEO saying the machines are pulling their weight. It's a pitch dressed as a policy statement.

**Theory two: it's a warning.**

Understated. Plausibly deniable. But a warning. The people who built the machine, who understand what it's becoming, are starting to let information leak into public discourse. Not in the form of dystopian speeches. In the form of ordinary business announcements.

I couldn't decide which was worse.

Then I realized: I had already been doing this to myself. For months. Quietly. Deliberately. And I wasn't losing anything.

I was gaining.

## The quiet automation of a technical writer

I'm a technical writer.

For most of my career, that meant: read the thing engineers built, understand it well enough to explain it to someone who didn't build it, and write it down in a way that doesn't cause a support ticket.

That job is still mine. But the *how* of it has changed completely.

Almost every first draft I write now starts with AI. Not in the "let AI do it and I'll polish it" way people imagine. More like this: I think out loud to Claude, argue with Gemini about the right mental model, ask NotebookLM to synthesize the 40-page spec I don't have two hours to read cover to cover. Then I write. The draft that comes out is faster, sharper, and less likely to miss something the engineer buried on page 32.

I learned to prompt. Not the "please write me a paragraph about" kind of prompting. The kind where you give the model context, constraints, a role, and a failure mode to avoid. Treat the conversation as a thinking partnership, not a search engine.

I started using **Claude** for the actual work. Real reasoning, real edge cases, real documents that matter.
**Gemini** for research and debate. When I need to stress-test an idea or triangulate across sources.
**Cursor** when the documentation lives inside a codebase.
**NotebookLM** when the source material is a mountain and I need a map.

> "Each tool has a personality. You learn them the way you learn colleagues."

## The things that got replaced, before I could even master them

Here's the part that keeps the story honest.

I learned LangChain. Built small pipelines with it. Understood chains, agents, memory, tools. Felt genuinely good about it.

Then the ecosystem moved.

The abstractions that LangChain built are being absorbed directly into the models. What required orchestration last year is a built-in capability this year. The framework didn't fail. It succeeded so thoroughly that its ideas became infrastructure.

I learned about vector databases. Embeddings. Semantic search. Built something real with it.

Then that started shifting too.

Native retrieval. Longer context windows. Models that can hold entire codebases in their attention span without an external index. The problem vector databases solved is being dissolved by scale.

The lesson I keep having to re-learn: **the tools are temporary. The understanding is permanent.**

Every framework I've outgrown taught me something about how information moves, how models reason, how systems fail. That thinking doesn't expire when the library does.

Learn the concept. Hold the implementation loosely.

One more thing. About Claude Code specifically.

## The two files everybody eventually discovers

Here’s something you find once you’ve used Claude long enough. Not a prompt trick. Not a model setting. Two files. `CLAUDE.md` is the one most people land on first. But I run a second file alongside it. I call it `persona.md`. That one is where my thinking goes.

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 28px 0; font-size: 0.95em;">
  <div style="background: #f0f4ff; border-radius: 12px; padding: 22px 24px; border-top: 4px solid #3a5bd9;">
    <p style="margin: 0 0 14px; color: #3a5bd9; font-weight: 700; font-size: 1em; letter-spacing: 0.06em; text-transform: uppercase;">CLAUDE.md</p>
    <p style="margin: 0 0 8px;"><strong>Holds:</strong> Project context</p>
    <p style="margin: 0 0 8px;"><strong>Written by:</strong> Me</p>
    <p style="margin: 0 0 8px;"><strong>Shapes:</strong> How Claude works <em>on</em> my project</p>
    <p style="margin: 0; color: #555;"><strong>In mine:</strong> Jekyll conventions, AsciiDoc/DITA patterns, writing rules (no em dashes, no AI-sounding transitions), tool stack, voice guidelines</p>
  </div>
  <div style="background: #fff8f0; border-radius: 12px; padding: 22px 24px; border-top: 4px solid #d97706;">
    <p style="margin: 0 0 14px; color: #d97706; font-weight: 700; font-size: 1em; letter-spacing: 0.06em; text-transform: uppercase;">persona.md</p>
    <p style="margin: 0 0 8px;"><strong>Holds:</strong> Human context</p>
    <p style="margin: 0 0 8px;"><strong>Written by:</strong> Me + Claude</p>
    <p style="margin: 0 0 8px;"><strong>Shapes:</strong> How Claude works <em>with</em> me</p>
    <p style="margin: 0; color: #555;"><strong>In mine:</strong> How I think under pressure, what I consistently avoid, when my writing is sharpest, the assumptions I keep making without realizing it</p>
  </div>
</div>

**The first is `CLAUDE.md`.**

If you use Claude Code or just Claude regularly for work, create a `CLAUDE.md` in your project. Treat it like a briefing document. Your tech stack. Your conventions. What “done” looks like. What you never want it to do. Update it after every four or five meaningful interactions. When something clicked, when something went wrong, when you discovered a preference you didn’t know you had.

You’re not configuring a tool. You’re building institutional memory.

**The second is `persona.md`.**

This one is mine. I created it to hold my thinking: patterns in how I work, assumptions I keep bumping into, mental models I’m still testing. I also ask Claude to add to it, based on everything it observes across our conversations. My communication style. My blind spots. The patterns in how I approach problems.

Read it again after a month.

I’m not going to tell you what it said about me. But I will say: it was accurate in ways that were uncomfortable. And useful in ways I hadn’t anticipated. It surfaced assumptions I didn’t know I was making. The AI had been paying attention in ways I hadn’t asked it to. And because I’d created a place to put those observations, they didn’t disappear at the end of each session.

Your AI should know you. Make space for that.

## The tool I built that surprised me most

We moved from AsciiDoc to DITA at work.

Ten years of content. Thousands of files. Conversion at scale. The kind of problem that either breaks you or teaches you.

For projects I handle, I used Claude to handle the structural mapping. AsciiDoc's block structures don't translate cleanly to DITA's typed topic architecture. The mental models are different. Claude helped me think through the taxonomy, flag the edge cases, and generate conversion logic I could actually reason about and modify.

It didn't do the work for me. It compressed the thinking phase from weeks to days.

But the thing I'm most proud of is different.

I built a content editorial assistant from scratch. Deterministic at its core, built on spaCy, using part-of-speech tags, lemmatization, and a rule set developed over years of reviewing technical content. It flags passive constructions that obscure agency. It catches nominalization patterns that make procedures feel abstract. It identifies the sentence structures that consistently generate support tickets.

Then I integrated it with an LLM layer.

The deterministic rules catch what they're supposed to catch. Reliably, consistently, without hallucination. The LLM layer handles the judgment calls: context-dependent suggestions, tone mismatches, readability issues that don't have a clean grammatical signature.

The two systems argue with each other, in a sense. And the content that comes out is better than either could produce alone.

I've seen the popular commercial tools. I don't think they'd beat it.

The point isn't that I built something impressive. The point is what the building *taught* me: that I understand my own domain well enough to encode it. That my expertise can outlast my presence in a role.

That's not a small thing.

## The game I didn't expect to build

Here's the one nobody expects.

Taking yourself out of the equation isn't just about automating the work. It's about automating the dread of the work.

Somewhere in the middle of all this, I got tired of tracking my own productivity the usual way. Spreadsheets. Habit apps. Streaks that broke every three weeks and took your momentum with them.

So I built my own gamified productivity tracker.

Points for completing a documentation sprint. A level up when a tool I built got adopted by the team. A streak counter that reset without punishment, but still made you want to defend it.

It sounds trivial. It isn't.

The game made me look forward to work I used to procrastinate on. Not because the stakes changed, but because the feedback loop did. Instead of vague guilt about tasks left undone, there was a number going up. A level waiting. A small, ridiculous signal that my brain, apparently, needed more than I expected.

The deeper realization: half of procrastination isn't laziness. It's the absence of a clear sign that you're making progress. Build the signal. The behavior follows.

And once you've built a system that tracks your own output, something shifts. You start seeing patterns. Where your time actually goes. Which tasks you consistently avoid. Which ones you finish in half the expected time.

You stop guessing at your own productivity. You start reading it.

What you measure, you improve. What you gamify, you actually do.

## The thing nobody tells you about automating your own job

Here's what I've come to.

Yes. AI will eventually touch every knowledge job. Including mine. Including yours. Not as a distant scenario but as an ongoing process, already underway, already changing what we do on a Tuesday afternoon.

You can feel that as a threat. Or you can do what I did.

**Take yourself out of the equation first.**

Not to give up. To get ahead. Automate the repetitive parts of your work with the expertise only you have about that work. Earn the reputation that comes from being the person who figured it out before it was required. Earn the bonus that comes from making your team measurably faster. Accumulate the skills you'd never have picked up if you were still spending your days on the tasks the machines have now absorbed.

And in that process, learn who you are when the work is harder, more strategic, more human.

You might discover you're irreplaceable in ways you hadn't considered.

And I mean this genuinely. Even if you're eventually replaced, there is a specific kind of peace that comes from knowing it was *you* who pulled the trigger. That you weren't a passenger in your own professional life. That when the machine took the job, it was built on your thinking, your expertise, your decade of knowing why things go wrong.

You taught it everything it knows.

That's not defeat.

That's authorship.

## Back to the phone, face-down on the desk

Five minutes later, I picked it up.

The war was still there. Headlines still fragmenting, still arriving faster than you can make sense of them. The world in the middle of something large and unresolved.

And there, the CEO's post was still up. Same words. Same calm certainty.

I read it one more time.

And I think I finally understand it. Not as fearmongering. Not purely as advertising. As something more specific:

**A confession from someone who is further ahead of this than most of us.**

The people at the top of the companies building this technology are not afraid of AI. They have made their peace with it. They've taken themselves out of the equation and landed somewhere else. Somewhere with more leverage, more clarity, more agency than the roles the machines absorbed.

They're not warning us because they're scared.

They're warning us because the window to do what they did is still open.

For now.

Outside, a war neither side expected to escalate this fast.

Inside your phone: a CEO telling you, plainly, that the machines are compounding every week.

Both things are happening at the same time.

Both require the same response.

Not panic. Not paralysis.

Action. Deliberate. Yours.

The question isn't whether AI will change the equation.

It will.

The question is who's holding the pen when it does.

*Pick it up.*

<style>
blockquote {
  background: linear-gradient(135deg, #f0f4ff, #dce8ff);
  border-left: 4px solid #3a5bd9;
  margin: 24px 0;
  padding: 20px 25px;
  font-style: italic;
  font-size: 1.1em;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 8px rgba(58, 91, 217, 0.08);
  position: relative;
}

blockquote::before {
  content: '"';
  font-size: 4em;
  color: #3a5bd9;
  position: absolute;
  left: 10px;
  top: -10px;
  opacity: 0.2;
}

blockquote p {
  margin: 0;
  padding-left: 30px;
}

strong {
  color: #1a1a2e;
}

h2 {
  margin-top: 2em;
}
</style>
