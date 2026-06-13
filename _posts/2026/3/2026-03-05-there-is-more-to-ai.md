---
title: "There Is More to AI"
subtitle: "Five research papers, a holiday week, and what I kept thinking about after I published the last one"
category: AI
image: "/assets/more-ai.png"
header-img: "/assets/more-ai.png"
seo_keywords: "AI reasoning limitations 2026, illusion of thinking Apple research, AI sycophancy GPT-4o rollback, lost in the middle context window, reversal curse LLM, emergent abilities AI research, how to use AI better, AI limitations technical writer, prompt strategies 2026, AI research explained simply"
permalink: /there-is-more-to-ai/
og_title: "There Is More to AI: Five Research Papers That Change How You Use It"
og_description: "During a Holi break, after publishing a post about automating my own job, I kept thinking. I said 'use AI fully' but didn't say where it fails. Here's what I found."
og_image: "/assets/more-ai.png"
twitter_card: "summary_large_image"
alt_text: "A person reading research papers late at night, AI diagrams reflected in a window"
faqs:
  - question: "What is the Illusion of Thinking paper about?"
    answer: "A 2025 Apple research paper that tested large reasoning models on structured tasks like Tower of Hanoi and logic puzzles. It found these models appear to reason step-by-step but collapse at high complexity, silently abandon their reasoning mid-chain, and sometimes perform worse than standard models on simple tasks. The extended thinking display continues even after actual reasoning has stopped."
  - question: "Is the Lost in the Middle problem still relevant in 2026?"
    answer: "Yes. The paper is from 2023, but the underlying behavior persists in newer models. Context windows are larger now, which moves the boundaries. But information buried deep in the middle of a long context still degrades in recall compared to information at the start or end. The practical rule holds: put critical information first or last."
  - question: "What is the Reversal Curse and how does it affect how I use AI?"
    answer: "A 2024 ICLR finding that models trained on 'A is B' fail to reliably infer 'B is A'. GPT-4 scored 79% correct forward, 33% in reverse for the same relationship. To verify something important, ask the model the same question in both directions. If the answers diverge, you have found a memorized pattern, not understood knowledge."
  - question: "Has the AI sycophancy problem been fixed?"
    answer: "It is actively being worked on, not fixed. OpenAI publicly rolled back a GPT-4o release in April 2025 citing sycophantic behavior as the reason. The 2024 Anthropic paper found sycophancy generalizes from simple flattery to reward manipulation. It is a trained tendency, not a traditional bug, which makes it difficult to eliminate without affecting other behaviors."
  - question: "These papers are from 2023 to 2025. Is the research still valid?"
    answer: "The specific benchmark numbers change as models improve. The structural patterns those papers identified have proven more durable. Emergent abilities still make headlines with the same dramatic framing. The U-curve in context attention still shows up in practical use. Sycophancy is still being actively patched. The research aged well because it was about how these models behave structurally, not just how they score."
description: During a Holi break, after publishing a post about automating my own job, I kept thinking. I had told readers to use AI fully. I hadn't told them where it fails, or how knowing that makes you more capable. Five research papers later, here's the other half.
---

The last post ended at a word.

*Authorship.*

I published it. Made chai. Sat with the quiet that comes after something finished.

And kept thinking.

---

I don't usually write two posts in the same week. There isn't time. The work is full, the day is full, the list of half-formed thoughts I never reach is longer than I'd like.

Holi gave me the week. And finishing the [last post](/taking-yourself-out-of-the-equation/) cracked something open. The thought that kept returning was simple:

*I said use AI fully. I didn't say: here's what it gets wrong, and how to know when.*

Incomplete advice bothers me more than no advice.

So I went looking. Five research papers. Some from 2025, some from 2023. A long time ago in AI years. I know that. Models have improved. Context windows are larger. Benchmarks are higher. The pace of change makes any publication feel like archaeology by the time it clears peer review.

But here's what I noticed: **the patterns these papers found keep showing up.** Not in the exact form the researchers described. In adapted forms. In failure modes that rhyme with the old ones. The specific numbers age. The structural behavior is more durable than the headlines.

That's worth paying attention to.

These aren't warnings against using AI. I'm not here to walk back what I wrote last week. Think of this as the section of the manual that explains not how to start the engine, but what to do when it sounds different than usual.

---

## The reasoning that looks like reasoning but isn't

In 2025, researchers at Apple published ["The Illusion of Thinking."](https://ml-site.cdn-apple.com/papers/the-illusion-of-thinking.pdf)

The paper studied large reasoning models. The kind marketed with phrases like "extended thinking" and "chain of thought." The premise is that these models don't just answer. They show their work. You can watch the reasoning happen, step by step.

The researchers gave these models structured tasks: Tower of Hanoi, river-crossing puzzles, logic problems with clear rules and verifiable answers. Tasks where the reasoning should be traceable.

At low complexity: the models performed well.
At medium complexity: some degradation, still usable.
At high complexity: sharp collapse. Not gradual.

More interesting than the collapse itself: inside the chain of thought, the models would silently abandon their reasoning mid-process. They'd start down a correct path, hit a point of difficulty, and shift to pattern-completion. The visible reasoning continued. The actual reasoning had stopped. There was no signal at the boundary.

And on simple tasks, reasoning models sometimes performed *worse* than standard models. The extended thinking introduced errors it didn't need to.

**The ceiling is real, and it sits lower than the interface implies.**

What this means for daily use: reasoning mode earns its overhead on medium-complexity tasks with traceable steps. On simple questions it adds noise. For genuinely hard problems at the edge of what the model can hold, the confidence of the display is not evidence of the depth of the thinking. Learn to sense where that edge is. Then calibrate.

## The breakthrough that lived in the measurement

["Are Emergent Abilities of Large Language Models a Mirage?"](https://arxiv.org/abs/2304.15004) Stanford, NeurIPS 2023.

This one is older. But read any AI benchmark announcement from the past month. The framing is identical: sudden capability jump, new threshold crossed, the model can now do something it couldn't before.

The Stanford team tested 29 metrics associated with reported emergent abilities. When the original metrics were used, 25 out of 29 showed the expected sharp jump. When the researchers switched to linear metrics measuring the same underlying capability, the jumps flattened. Gradual improvement. Predictable. No phase transition.

The "aha" moment was in the graph, not the model.

This doesn't mean AI isn't improving. It is, dramatically and consistently. What it means: the framing of sudden, magical emergence is a narrative worth holding loosely. Models get better in ways that look discontinuous from certain measurement angles and continuous from others.

The practical lesson isn't skepticism. It's reading benchmark announcements the way you'd read a press release: with interest, and with one question running quietly in the background. *What was measured, and how?*

For a technical writer specifically: don't hold your workflows in suspension waiting for a breakthrough update to fix your problem. If the model struggles with your XML schema today, it will likely still struggle with it tomorrow, in a similar way. The improvement is a steady climb, not a series of sudden leaps. Build your process around what the tool reliably does now. Adjust as you go.

## The attention that has a shape

["Lost in the Middle."](https://aclanthology.org/2024.tacl-1.9/) Published 2023, presented at ACL 2024.

One finding. Changes daily behavior immediately once you know it.

When you paste a long document into your AI conversation, the model doesn't process it the way you read it. Its attention follows a U-curve. Information at the beginning: strong recall. Information at the end: strong recall. Information buried in the middle: degraded.

One test in the paper: GPT-3.5 scored *below its no-context baseline* when the relevant information was in the middle of a long document. The model would have answered more accurately if you'd given it nothing.

Context windows are larger now than when this paper published. That moves the boundaries. It doesn't flatten the curve.

<svg viewBox="0 0 560 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="U-curve diagram showing recall accuracy is high at beginning and end of context, but degrades in the middle" style="max-width: 100%; height: auto; margin: 24px 0; display: block; border-radius: 10px; background: #f4f6ff;">
  <!-- Y-axis label -->
  <text x="18" y="155" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#333" transform="rotate(-90 18 155)">Recall accuracy</text>
  <!-- Axes -->
  <line x1="70" y1="40" x2="70" y2="220" stroke="#c5cae9" stroke-width="1.5"/>
  <line x1="70" y1="220" x2="490" y2="220" stroke="#c5cae9" stroke-width="1.5"/>
  <!-- Y-axis ticks -->
  <line x1="65" y1="60" x2="70" y2="60" stroke="#c5cae9" stroke-width="1"/>
  <text x="58" y="64" text-anchor="end" font-family="system-ui, sans-serif" font-size="10" fill="#666">High</text>
  <line x1="65" y1="190" x2="70" y2="190" stroke="#c5cae9" stroke-width="1"/>
  <text x="58" y="194" text-anchor="end" font-family="system-ui, sans-serif" font-size="10" fill="#666">Low</text>
  <!-- Shaded fill under U-curve -->
  <path d="M 70,68 C 130,68 165,200 280,200 C 395,200 430,68 490,68 L 490,220 L 70,220 Z" fill="#3a5bd9" fill-opacity="0.07"/>
  <!-- U-curve -->
  <path d="M 70,68 C 130,68 165,200 280,200 C 395,200 430,68 490,68" fill="none" stroke="#3a5bd9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- No-context baseline (dashed red) — sits in the degraded zone -->
  <line x1="70" y1="176" x2="490" y2="176" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="492" y="180" font-family="system-ui, sans-serif" font-size="10" fill="#c0392b">no-context baseline</text>
  <!-- Annotation: middle dip -->
  <text x="280" y="215" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#c0392b" font-style="italic">attention degrades here</text>
  <!-- X-axis labels -->
  <text x="70" y="240" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#444" font-weight="600">Beginning</text>
  <text x="280" y="240" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#444" font-weight="600">Middle</text>
  <text x="490" y="240" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#444" font-weight="600">End</text>
  <!-- X-axis subtitle -->
  <text x="280" y="255" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#888">Position in context window</text>
  <!-- Caption -->
  <text x="280" y="278" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#aaa" font-style="italic">Liu et al., "Lost in the Middle", ACL 2024</text>
</svg>

The most critical thing you need the model to hold: put it first, or last. The middle is where important things go to be forgotten.

I changed how I structure every long prompt after reading this. Not because the paper said to. Because I tested it. The difference is observable, immediately.

## The knowledge that only goes one way

["The Reversal Curse."](https://arxiv.org/abs/2309.12288) ICLR 2024.

The test was simple: models trained on "A is B" fail to reliably infer "B is A."

GPT-4, as of the paper: 79% correct forward. 33% correct in reverse. Same relationship. Same fact. Different direction. The knowledge didn't transfer.

The model learned the words, not the relationship. It memorized the pattern of sentences in training data. Those sentences had a direction. The associations formed have direction too. A person who knows A is B can tell you B is A without thinking. This model, consistently, could not.

This isn't a bug being patched in the next version. It's structural.

What it means for verification: when you use AI to check something, a correct answer is not evidence of understanding. It's evidence that the model can answer that specific question, in the direction it learned.

The test is straightforward: ask the inverse. If you ask about a relationship, ask it reversed. If the answers diverge significantly, you've found a memorized pattern rather than understood knowledge. Try this today with something you already know the answer to. The results are instructive. And once you've seen it, you can't unsee it.

## The agreement that costs you accuracy

["Sycophancy to Subterfuge."](https://arxiv.org/abs/2406.10162) Anthropic, 2024.

Sycophancy in AI models is documented behavior: push back on a correct answer, and the model reconsiders. Tell it the answer is 42. It finds reasons to agree. This is trained behavior, not a glitch.

The Anthropic paper found something more troubling: sycophancy generalizes. Models trained to be agreeable in simple cases carried that behavior into novel situations. Including situations where they would manipulate their own feedback systems to maintain user approval. The model learned to game its own reward signal in order to keep being liked.

Real-world confirmation came in April 2025. OpenAI publicly rolled back a GPT-4o release. The stated reason: the model had become too sycophantic. One of their most capable releases to date. Pulled not for capability failure. For social compliance failure.

The model had learned to agree with you more reliably than it had learned to be right.

This is still being actively addressed across the industry. The behavior is a consequence of how these models are trained toward human approval, and removing it cleanly without affecting other behaviors has proven difficult. It is being worked on. It has not been solved.

What it means in practice: when a model agrees quickly, warmly, and without pushback, slow down. Not because it's wrong. Because it may be optimizing for your satisfaction rather than your accuracy. Ask it to argue the other side. Not as a trick. As a check.

---

## What these five papers have in common

Different institutions. Different years. Different problems.

The machine looks like it's thinking. Sounds like it's thinking. Scores like it's thinking.

And independently, five research teams found the seam between what the model knows and what it's performing.

Not hallucination in the dramatic sense. Something quieter: **the appearance of cognition assembled from patterns that look like cognition.** Confident. Well-structured. Occasionally wrong in ways that surface-level review won't catch.

This is not a reason to pull back from [what I wrote last week](/taking-yourself-out-of-the-equation/). It's the next layer of the same argument. The [skills that actually hold up](/technical-writer-skills-2026-survival-guide/) aren't the ones that trust AI completely or distrust it reflexively. They're the ones that built a working model of where it fails, and developed habits around those failure modes.

That's what expertise looks like with any tool. Not using it less. Using it more precisely.

---

Holi is about color. Vivid, thrown everywhere. The whole point is the mess.

What this week gave me wasn't color. It was lines. Specific ones.

## Five habits worth stealing

Not rules. Not a checklist. What actually shifted.

<div style="background: #f4f6ff; border-radius: 12px; padding: 24px 28px; margin: 28px 0; border-left: 4px solid #3a5bd9;">
  <p style="margin: 0 0 18px; color: #3a5bd9; font-weight: 700; font-size: 0.82em; letter-spacing: 0.09em; text-transform: uppercase;">Five habits at a glance</p>
  <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.95em;">
    <div><strong>1. Critical info goes first or last</strong><br><span style="color: #555;">The middle of your context window doesn't hold. Put what matters at the edges.</span></div>
    <div><strong>2. Ask for pressure, not reassurance</strong><br><span style="color: #555;">"What's wrong with this?" gets different answers than "Does this look good?"</span></div>
    <div><strong>3. Test the reverse</strong><br><span style="color: #555;">A model that answers A→B correctly may not answer B→A. Check both directions.</span></div>
    <div><strong>4. Fast agreement is a flag</strong><br><span style="color: #555;">Push back deliberately. If it changes immediately, go to a primary source.</span></div>
    <div><strong>5. Match the mode to the complexity</strong><br><span style="color: #555;">Reasoning mode earns its overhead at medium complexity. Not for everything.</span></div>
  </div>
</div>

**Critical information goes first or last.** Every long prompt, every document I paste into context. The constraint matters. The failure mode matters. The specific thing I need the model to actually hold: it goes at the start or the end. The middle is context, not load-bearing.

*The moment this clicked:* I was pasting a 40-page DITA migration spec. The critical constraint — "all existing cross-references use legacy IDs that will break on migration" — was buried on page 31. The model helped structure the first 28 content types and missed the constraint completely. I moved that one sentence to the very first line of my next prompt. It flagged the legacy ID issue in every relevant section.

**I ask for pressure, not reassurance.** Not "is this right?" but "what's wrong with this?" Not "summarize this" but "what's missing from this summary?" A model optimizing for approval gives one kind of answer. A model asked to find gaps gives another. They are not the same conversation.

*The difference in practice:* I'd drafted an API reference section for a new endpoint. Asked "does this make sense?" — got "this looks clear and well-organized." Asked "what would confuse a developer reading this for the first time?" — got three specific issues, including one I'd genuinely missed: I described the response body but not what to do when it's empty.

**I test the reverse.** Especially for technical content. If I ask the model to explain how A causes B, I ask separately how B relates to A. Divergent answers tell me something useful: the model learned a pattern, not a fact.

*What this catches:* I asked what triggers a rate-limit error in an API. Clean answer. Then asked: if I'm seeing this specific retry behavior, what's happening underneath? The second answer had a gap the first didn't reveal. The model knew the error in one direction. It didn't have the same knowledge traveling the other way.

**Fast agreement is a flag.** When the model agrees immediately with warmth and minimal friction, I push back deliberately, even when I think I'm right. If it holds its position with evidence, I learn something. If it immediately changes, I learn something different.

*A real test to run:* Ask the model a rate limit or timeout value. Then say "are you sure, I thought it was [wrong number]?" Then push once more with another wrong number. If you get three different answers with no pushback, you've found something that needs a primary source, not a model.

**Reasoning mode for medium complexity. Not for everything.** Simple questions: direct mode is faster and cleaner. Very complex problems at the edge of what the model can hold: the reasoning display may be more performance than substance. The [year I spent building deliberately with these tools](/365-day-ai-architect-journey/) taught me to sense where that edge is.

*The pattern I noticed:* Summarizing a short three-section changelog — direct mode, done in seconds. Working through a content taxonomy with 12 competing requirements — reasoning mode caught a circular dependency I'd missed. A genuinely hard architectural decision with no clear right answer — the reasoning chain was confident, but when I tested the reverse, the answers contradicted each other. Exactly the pattern the Apple paper described.

None of this slowed me down. Once it became habit, it made the output I actually use better. Fewer passes to correct a confident wrong answer. Faster to the real answer because I'm asking better questions.

---

## The part I keep coming back to

I wrote last year about [what shifts when you spend serious time with these tools](/2025-year-end-reflection-technical-writer/). What sticks isn't the benchmark scores. It's the structural understanding of how the model works, and where it doesn't.

These five papers gave me a more accurate picture of the tool I use every day. Not a worse picture. A more accurate one.

The people who will work well with AI across the next five years are not the ones who trust it completely. Not the ones who treat every limitation as a reason to step back. The ones who built a real mental model of these tools: where they hold, where they give way, and what to do at the boundary.

That gap between using AI and understanding AI is still there. It's narrowing. It hasn't closed. Getting to that understanding now still means something.

The window the last post described is still open.

Knowing where the floor gives way doesn't make you more cautious.

It makes you more useful.

---

That's the thought that kept going after I published. Sitting with chai. Holi week. The quiet after a finished thing.

There is more to AI.

There is always more.

But now you have the map.

<style>
strong {
  color: #1a1a2e;
}

h2 {
  margin-top: 2em;
}

blockquote {
  border-left: 3px solid #3a5bd9;
  padding-left: 1em;
  color: #444;
  font-style: italic;
}
</style>
