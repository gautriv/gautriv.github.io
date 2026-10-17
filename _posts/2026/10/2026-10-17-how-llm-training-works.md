---
title: "Every Number Has a Parent"
subtitle: "Part 1 of Weights to Words, a series on how language models are built and run. A working miniature transformer-style model with 44 knobs that you can train in your browser, where every number on the page tells you who made it."
category: AI
image: "/assets/how-llm-training-works.png"
header-img: "/assets/how-llm-training-works.png"
seo_keywords: "how LLMs are trained, how does LLM training work, LLM training explained, transformer step by step, interactive transformer, what is a parameter in an LLM, what are weights in a neural network, embeddings explained, query key value attention explained, softmax explained, backpropagation explained, Adam optimizer explained, cross entropy loss, train a tiny transformer in browser, AI for technical writers"
permalink: /how-llm-training-works/
og_title: "How an LLM Is Trained: Every Number Explained, in a Model You Can Train Yourself"
og_description: "A working miniature transformer-style model with 44 knobs that runs in your browser. Follow one sentence through tokens, embeddings, attention, logits, loss, backprop and Adam, then press train and watch every number on the page recalculate."
og_image: "/assets/how-llm-training-works.png"
twitter_card: "summary_large_image"
alt_text: "A tiny language model's three guesses for the word after I drink hot, with tea, coffee and pizza bars, and every number color-coded as chosen, trainable or calculated"
faqs:
  - question: "How is a large language model trained, in plain terms?"
    answer: "Take a piece of real text, hide the next word, and let the model guess it. The guess comes out as a chance for every possible next word. A loss formula turns the chance it gave the real word into one mistake score. Backpropagation works out how each trainable number affected that score, and an optimizer such as Adam nudges every one of them a little in the helpful direction. Repeat that over trillions of words and the numbers settle into something that predicts text well."
  - question: "What is a parameter or weight in an LLM?"
    answer: "A single number the training process is allowed to change. Embedding rows, the Q, K and V projection tables, the feed-forward layers and the output scorer are all made of them. A person sets their starting values at setup, usually with a seeded random rule, and training turns them. Everything else the model produces, such as Q vectors, attention shares and logits, is calculated fresh on every run from those stored weights."
  - question: "What are Q, K and V in attention?"
    answer: "Three separate learned tables, Wq, Wk and Wv, each run on every token. Q is what a token is looking for, K is what each token offers to be matched against, and V is the message it shares. Q is compared with every K to get scores, softmax turns the scores into shares that add up to 100 percent, and the shares decide how much of each V gets mixed in."
  - question: "Why does a model trained on one sentence not learn anything useful?"
    answer: "Because the cheapest way to get one sentence right is to memorize it. In the toy model in this post, ten rounds of training push the chance of the right word above 99 percent while the attention shares barely move. Real models train on hundreds of billions to trillions of tokens, so memorizing any single sentence stops paying off and the only way to lower the loss everywhere is to learn patterns that generalize."
  - question: "Is the model in this post a real neural network?"
    answer: "Yes, a very small one. It has 44 trainable parameters, one attention head, one feed-forward block and three candidate answers. It genuinely runs the forward pass, computes exact gradients with backpropagation, checks one against a finite difference, and updates every weight with Adam. It is simplified on purpose so that every number can be traced, not a claim that production models are this small."
description: "How LLM training actually works, shown in a working miniature transformer-style model with 44 knobs that you can train in your browser. Tokens, embeddings, Q K V attention, logits, loss, backpropagation and Adam, with every number traced to who made it."
---

<style>
.article-body .enx {
  --x-bg: #0d1117;
  --x-bg-2: #131a24;
  --x-bg-3: #18212d;
  --x-line: rgba(255, 255, 255, 0.09);
  --x-line-2: rgba(255, 255, 255, 0.16);
  --x-ink: #e6e9ef;
  --x-ink-2: #a9b2c1;
  --x-ink-3: #6f7a8b;
  --x-chosen: #f2c14e;
  --x-train: #8fb4ff;
  --x-calc: #62d9a3;
  --x-accent: #5b8def;
  --x-wrong: #ff8a7a;
  --x-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  background: var(--x-bg);
  background-image:
    linear-gradient(rgba(91, 141, 239, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(91, 141, 239, 0.045) 1px, transparent 1px);
  background-size: 24px 24px;
  border: 1px solid var(--x-line);
  border-radius: 16px;
  margin: 36px 0;
  padding: 20px 22px 18px;
  color: var(--x-ink);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.6;
  overflow-wrap: normal;
  min-width: 0;
  scroll-margin-top: 88px;
}
.article-body .enx p { font-size: 15px; line-height: 1.6; margin: 0 0 10px; color: var(--x-ink); }
.article-body .enx b, .article-body .enx strong { color: var(--x-ink); font-weight: 600; }
.article-body .enx em { color: var(--x-ink-2); font-family: var(--sans); font-style: normal; }
.article-body .enx code { background: none; border: 0; padding: 0; color: var(--x-ink-2); font-size: 12.5px; }
.article-body .enx .enx-fallback { color: var(--x-ink-2); font-family: var(--mono); font-size: 13px; margin: 0; }
.article-body .enx.is-ready .enx-fallback { display: none; }

/* header + live readout */
.article-body .enx-head { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: space-between; align-items: baseline; margin: 0 0 14px; }
.article-body .enx-tagline, .article-body .enx-eyebrow, .article-body .enx-chip-l, .article-body .enx-flow span, .article-body .enx-plain span, .article-body .enx-real span, .article-body .enx-inspect-h, .article-body .enx-wall-n, .article-body .enx-metrics span {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--x-ink-3);
}
.article-body .enx-tagline { color: var(--x-accent); }
.article-body .enx-live { font-family: var(--mono); font-size: 11.5px; color: var(--x-ink-3); font-variant-numeric: tabular-nums; }
.article-body .enx-live b { color: var(--x-calc); font-weight: 500; }

/* stage tabs */
.article-body .enx-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; }
.article-body .enx-tab {
  flex: 0 0 auto; display: inline-flex; gap: 7px; align-items: center; padding: 7px 12px; border-radius: 999px;
  border: 1px solid var(--x-line); background: var(--x-bg-2); color: var(--x-ink-2); font-size: 13px; white-space: nowrap;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 160ms var(--x-ease-out);
}
.article-body .enx-tab.is-seen:not(.is-on) span { color: var(--x-calc); }
.article-body .enx-tab.is-seen:not(.is-on) span::after { content: " ✓"; }
.article-body .enx-tab span { font-family: var(--mono); font-size: 11px; color: var(--x-ink-3); }
.article-body .enx-tab.is-on { background: rgba(91, 141, 239, 0.16); border-color: rgba(91, 141, 239, 0.55); color: #fff; }
.article-body .enx-tab.is-on span { color: var(--x-train); }

/* stage body */
.article-body .enx-stage.is-enter { animation: enx-in 200ms var(--x-ease-out) both; }
@keyframes enx-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes enx-fade { from { opacity: 0; } to { opacity: 1; } }
.article-body .enx-title { font-size: 21px; line-height: 1.25; letter-spacing: var(--track-heading); font-weight: 600; color: #fff; margin: 6px 0 6px; text-wrap: balance; }
.article-body .enx .enx-lede { color: var(--x-ink-2); margin-bottom: 14px; }
.article-body .enx-flow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 0 14px; }
.article-body .enx-flow > div { background: var(--x-bg-2); border: 1px solid var(--x-line); border-radius: 10px; padding: 10px 12px; min-width: 0; }
.article-body .enx-flow > div.is-out { border-color: rgba(98, 217, 163, 0.35); }
.article-body .enx-flow p { font-size: 13.5px; margin: 4px 0 0; line-height: 1.5; color: var(--x-ink); overflow-wrap: anywhere; }
.article-body .enx-scene { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--x-line); border-radius: 12px; padding: 16px; margin: 0 0 12px; min-width: 0; }
.article-body .enx-scene > *:last-child { margin-bottom: 0; }
.article-body .enx .enx-note { font-size: 13.5px; color: var(--x-ink-2); margin: 12px 0 0; }
.article-body .enx-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; align-items: center; }

/* numbers: the whole point of the page */
.article-body .enx-n {
  display: inline; font-family: var(--mono); font-size: 0.92em; font-variant-numeric: tabular-nums; padding: 0 2px; margin: 0 -1px;
  border-radius: 4px; border: 0; text-decoration: underline dotted; text-decoration-thickness: 1px; text-underline-offset: 3px; line-height: inherit; cursor: help;
  transition: background var(--t-fast);
}
.article-body .enx-n.is-chosen { color: var(--x-chosen); }
.article-body .enx-n.is-trainable { color: var(--x-train); }
.article-body .enx-n.is-calc { color: var(--x-calc); }
.article-body .enx-n.is-lit, .article-body .enx-n[aria-expanded="true"] { background: rgba(255, 255, 255, 0.12); }
.article-body .enx-n.is-hint { animation: enx-hint 1.6s var(--x-ease-out) 1s 3 both; }
@keyframes enx-hint { 0% { box-shadow: 0 0 0 0 rgba(98, 217, 163, 0.55); } 70%, 100% { box-shadow: 0 0 0 9px rgba(98, 217, 163, 0); } }
.article-body .enx-n.is-changed { animation: enx-flash 700ms ease-out; }
.article-body .enx.is-auto .enx-n.is-changed { animation: none; }
@keyframes enx-flash { 0% { background: rgba(255, 210, 63, 0.35); } 100% { background: transparent; } }
.article-body .is-chosen-t { color: var(--x-chosen); }
.article-body .is-train-t { color: var(--x-train); }
.article-body .is-calc-t { color: var(--x-calc); }
.article-body .enx-vec { white-space: nowrap; color: var(--x-ink-3); }
.article-body .enx-key { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; margin: 0 0 14px; font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; }
.article-body .enx-key > span::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: currentColor; margin-right: 6px; vertical-align: 1px; }
.article-body .enx-key .enx-key-tip { color: var(--x-ink-3); letter-spacing: 0.02em; text-transform: none; font-family: var(--sans); font-size: 12.5px; }
.article-body .enx-key .enx-key-tip::before { content: none; }

/* chips, rows, machines */
.article-body .enx-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.article-body .enx-chip { background: var(--x-bg-3); border: 1px solid var(--x-line); border-radius: 10px; padding: 8px 12px; min-width: 0; }
.article-body .enx-chip.is-out { border-color: rgba(98, 217, 163, 0.45); box-shadow: 0 0 0 3px rgba(98, 217, 163, 0.07); }
.article-body .enx-chip-l { display: block; margin-bottom: 3px; font-size: 10px; }
.article-body .enx-chip-v { font-size: 15px; }
.article-body .enx-arrow { color: var(--x-ink-3); font-family: var(--mono); }
.article-body .enx-machine { flex: 1 1 150px; background: var(--x-bg-3); border: 1px solid var(--x-line); border-radius: 12px; padding: 10px 12px; }
.article-body .enx-machine small { display: block; color: var(--x-ink-3); font-family: var(--mono); font-size: 10.5px; margin-top: 6px; }
.article-body .enx-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px; }
.article-body .enx-grid2 .enx-n { display: block; text-align: center; padding: 6px 0; margin: 0; border: 1px solid rgba(143, 180, 255, 0.25); background: rgba(143, 180, 255, 0.06); }

/* sentence tokens */
.article-body .enx-tokens { display: flex; flex-wrap: wrap; gap: 10px; }
.article-body .enx-tok { display: inline-flex; flex-direction: column; align-items: center; min-width: 76px; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(242, 193, 78, 0.35); background: rgba(242, 193, 78, 0.06); font-size: 20px; font-weight: 600; color: #fff; }
.article-body .enx-tok small { font-family: var(--mono); font-size: 10px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--x-ink-3); }
.article-body .enx-tok.is-hidden { border-style: dashed; border-color: var(--x-line-2); background: transparent; color: var(--x-ink-3); }
.article-body .enx-stage.is-enter .enx-tok { animation: enx-in var(--spring-smooth) var(--ease-spring) both; animation-delay: calc(var(--i) * 70ms); }

/* tables */
.article-body .enx-matwrap { overflow-x: auto; border: 1px solid var(--x-line); border-radius: 10px; }
.article-body .enx .table-scroll { margin: 0; overflow: visible; }
.article-body .enx table.enx-mat { width: 100%; min-width: 0; margin: 0; border: 0; border-radius: 0; table-layout: auto; font-size: 13.5px; background: transparent; }
.article-body .enx table.enx-mat th { background: var(--x-bg-2); color: var(--x-ink-3); font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; padding: 9px 12px; border-bottom: 1px solid var(--x-line); font-weight: 500; }
.article-body .enx table.enx-mat td { padding: 9px 12px; border-bottom: 1px solid var(--x-line); color: var(--x-ink); white-space: nowrap; overflow-wrap: normal; word-break: normal; }
.article-body .enx table.enx-mat td:first-child { color: var(--x-ink); font-weight: 500; }
.article-body .enx table.enx-mat tr:last-child td { border-bottom: 0; }

/* bars */
.article-body .enx-bars { display: grid; gap: 9px; }
.article-body .enx-barrow { display: grid; grid-template-columns: 92px 1fr 64px; gap: 10px; align-items: center; font-size: 14px; }
.article-body .enx-bar-l em { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--x-chosen); margin-left: 4px; }
.article-body .enx-track { display: block; height: 10px; border-radius: 99px; background: rgba(255, 255, 255, 0.06); overflow: hidden; }
.article-body .enx-fill { display: block; width: 100%; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #3e7bfb, #62d9a3); transition: clip-path 420ms var(--x-ease-out); }
.article-body .enx.is-auto .enx-fill { transition-duration: 100ms; }
.article-body .enx-fill.is-hit { background: linear-gradient(90deg, #c99a2e, #f2c14e); }
.article-body .enx-barrow .enx-n { text-align: right; }

/* math */
.article-body .enx-work { display: grid; gap: 8px; margin-top: 10px; }
.article-body .enx-m { display: grid; gap: 2px; background: var(--x-bg-2); border-left: 2px solid var(--x-line-2); border-radius: 0 8px 8px 0; padding: 8px 12px; }
.article-body .enx-m span { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--x-ink-3); }
.article-body .enx-m code { font-size: 13px; color: var(--x-ink-2); overflow-wrap: anywhere; }
.article-body .enx-m b { font-family: var(--mono); font-size: 13.5px; color: var(--x-calc); font-weight: 500; }

/* disclosure */
.article-body .enx-d, .article-body .enx-q { border-top: 1px solid var(--x-line); }
.article-body .enx-d > summary, .article-body .enx-q > summary { list-style: none; cursor: pointer; padding: 10px 0; font-size: 14px; color: var(--x-ink); display: flex; justify-content: space-between; gap: 10px; }
.article-body .enx-d > summary::-webkit-details-marker, .article-body .enx-q > summary::-webkit-details-marker { display: none; }
.article-body .enx-d > summary::after, .article-body .enx-q > summary::after { content: "+"; font-family: var(--mono); color: var(--x-ink-3); }
.article-body .enx-d[open] > summary::after, .article-body .enx-q[open] > summary::after { content: "−"; }
.article-body .enx-d > summary em { font-family: var(--mono); font-size: 11px; color: var(--x-ink-3); margin-left: auto; margin-right: 8px; }
.article-body .enx-d[open] { padding-bottom: 10px; }
.article-body .enx-q { margin-left: 2px; }
.article-body .enx-q > summary { font-size: 13.5px; color: var(--x-ink-2); padding: 8px 0; }
.article-body .enx-q[open] > summary { color: #fff; }
.article-body .enx-q p { font-size: 13.5px; color: var(--x-ink-2); padding: 0 0 6px 12px; border-left: 2px solid rgba(91, 141, 239, 0.45); }
.article-body .enx .enx-plain, .article-body .enx .enx-real { font-size: 13.5px; color: var(--x-ink-2); margin: 0 0 12px; }
.article-body .enx-plain span, .article-body .enx-real span { display: block; margin-bottom: 2px; font-size: 10px; }
.article-body .enx .enx-real { margin: 12px 0 0; padding-top: 12px; border-top: 1px solid var(--x-line); }

/* the number popover: anchored to the tapped number, scales out of it */
.article-body .enx-pop {
  position: absolute; z-index: 6; width: min(340px, calc(100% - 20px)); padding: 12px 34px 10px 14px; border-radius: 12px;
  background: #1a2230; border: 1px solid rgba(255, 255, 255, 0.16); box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
  font-size: 13.5px; color: var(--x-ink-2); opacity: 0; transform: scale(0.97);
  transition: opacity 100ms ease-out, transform 100ms ease-out;
}
.article-body .enx-pop.is-open { opacity: 1; transform: none; transition: opacity 150ms var(--x-ease-out), transform 150ms var(--x-ease-out); }
.article-body .enx-pop[hidden] { display: none; }
.article-body .enx .enx-pop p { font-size: 13.5px; color: var(--x-ink-2); margin: 6px 0 0; overflow-wrap: anywhere; }
.article-body .enx .enx-pop .enx-pop-k { color: var(--x-ink); }
.article-body .enx-pop-h { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: #fff; font-size: 14px; }
.article-body .enx-pop-x { position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; border-radius: 8px; color: var(--x-ink-3); font-size: 18px; line-height: 1; }

/* nav */.article-body .enx-badge { display: inline-block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 7px; border-radius: 99px; border: 1px solid currentColor; }
.article-body .enx-badge.is-chosen { color: var(--x-chosen); }
.article-body .enx-badge.is-trainable { color: var(--x-train); }
.article-body .enx-badge.is-calc { color: var(--x-calc); }
.article-body .enx-nav { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--x-line); }
.article-body .enx-pos { font-family: var(--mono); font-size: 11.5px; color: var(--x-ink-3); }
.article-body .enx-btn.is-done { border-color: rgba(98, 217, 163, 0.5); color: var(--x-calc); }
.article-body .enx-btn {
  display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 8px 15px; border-radius: 10px; font-size: 14px; font-weight: 500;
  border: 1px solid var(--x-line-2); background: var(--x-bg-3); color: var(--x-ink);
  transition: transform 160ms var(--x-ease-out), background-color 150ms ease, border-color 150ms ease;
}
.article-body .enx-btn, .article-body .enx-tab, .article-body .enx-n, .article-body .enx-dial, .article-body .enx-pop-x { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.article-body .enx-btn, .article-body .enx-tab { user-select: none; -webkit-user-select: none; }
.article-body .enx-btn:active:not(:disabled), .article-body .enx-tab:active { transform: scale(0.97); transition: transform 100ms ease-out; }
.article-body .enx-btn.is-primary { background: var(--x-accent); border-color: var(--x-accent); color: #fff; }
@media (hover: hover) and (pointer: fine) {
  .article-body .enx-btn:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.3); }
  .article-body .enx-btn.is-primary:hover:not(:disabled) { background: #3e7bfb; }
  .article-body .enx-tab:hover { border-color: var(--x-line-2); color: var(--x-ink); }
  .article-body .enx-n:hover { background: rgba(255, 255, 255, 0.1); }
  .article-body .enx-dial:hover { background: #22304a; }
  .article-body .enx-pop-x:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
}
.article-body .enx-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

/* metrics + training */
.article-body .enx-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 0 12px; }
.article-body .enx-metrics > div { background: var(--x-bg-3); border: 1px solid var(--x-line); border-radius: 10px; padding: 10px 12px; }
.article-body .enx-metrics span { display: block; font-size: 10px; }
.article-body .enx-metrics b { font-family: var(--mono); font-size: 22px; font-weight: 500; color: var(--x-calc); font-variant-numeric: tabular-nums; }
.article-body .enx-metrics.is-small b { font-size: 16px; }
.article-body .enx-train { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.article-body .enx-chart { margin: 4px 0 14px; }
.article-body .enx .enx-train-hint { margin: -4px 0 14px; }

/* svg figures */
.article-body .enx-svg { width: 100%; height: auto; overflow: visible; }
.article-body .enx-svg .ax, .article-body .enx-svg .grid { stroke: rgba(255, 255, 255, 0.14); stroke-width: 1; fill: none; }
.article-body .enx-svg .grid { stroke-dasharray: 4 5; }
.article-body .enx-svg text { font-family: var(--mono); font-size: 11px; }
.article-body .enx-svg .lbl { fill: var(--x-ink-3); }
.article-body .enx-svg .lbl-t { fill: var(--x-train); }
.article-body .enx-svg .lbl-k { fill: var(--x-calc); }
.article-body .enx-svg .pt-t { fill: var(--x-train); stroke: var(--x-bg); stroke-width: 2; }
.article-body .enx-svg .pt-k { fill: var(--x-calc); stroke: var(--x-bg); stroke-width: 2; }
.article-body .enx-svg .shift { stroke: var(--x-chosen); stroke-width: 1.5; stroke-dasharray: 3 3; }
.article-body .enx-svg .curve { fill: none; stroke: var(--x-calc); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.article-body .enx-svg .tangent { stroke: var(--x-chosen); stroke-width: 1.5; stroke-dasharray: 5 4; }
.article-body .enx-svg .arc { fill: none; stroke: rgba(91, 141, 239, 0.35); stroke-linecap: round; }
.article-body .enx-svg .arc-flow { fill: none; stroke: #9cc0ff; stroke-linecap: round; stroke-dasharray: 2 12; animation: enx-flow 1.4s linear 4; }
@keyframes enx-flow { to { stroke-dashoffset: -28; } }
.article-body .enx-svg .node { fill: var(--x-bg-3); stroke: rgba(242, 193, 78, 0.45); }
.article-body .enx-svg .node.is-q { stroke: var(--x-train); }
.article-body .enx-svg .node-t { fill: #fff; font-family: var(--sans); font-size: 13px; font-weight: 600; }

/* backprop chain */
.article-body .enx-chain { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.article-body .enx-link { display: inline-flex; flex-direction: column; padding: 7px 11px; border-radius: 10px; background: var(--x-bg-3); border: 1px solid var(--x-line); font-size: 13px; color: var(--x-ink); animation: enx-pulse 2.4s ease-out 3; animation-delay: calc(var(--i) * 0.24s); }
.article-body .enx-link small { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--x-ink-3); }
.article-body .enx-chain.is-loop .enx-link { animation: none; }
.article-body .enx-chain.is-loop .enx-link.is-train { border-color: rgba(143, 180, 255, 0.45); }
@keyframes enx-pulse { 0%, 60%, 100% { border-color: var(--x-line); box-shadow: none; } 15% { border-color: var(--x-chosen); box-shadow: 0 0 0 3px rgba(242, 193, 78, 0.14); } }

/* the knob wall */
.article-body .enx-wallwrap { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--x-line); }
.article-body .enx-wall { display: flex; flex-wrap: wrap; gap: 12px 16px; margin-top: 10px; }
.article-body .enx-wall-g { display: grid; gap: 5px; }
.article-body .enx-wall-n { font-size: 10px; }
.article-body .enx-wall-d { display: flex; flex-wrap: wrap; gap: 4px; max-width: 120px; }
.article-body .enx-dial { position: relative; width: 26px; height: 26px; border-radius: 50%; background: var(--x-bg-3); border: 1px solid var(--x-line-2); padding: 0; }
.article-body .enx-dial i { position: absolute; left: 50%; top: 3px; width: 2px; height: 10px; margin-left: -1px; border-radius: 2px; background: var(--x-train); transform-origin: 50% 10px; transition: transform 420ms var(--x-ease-out); }
.article-body .enx.is-auto .enx-dial i { transition-duration: 100ms; }
.article-body .enx-dial.is-moved { border-color: rgba(143, 180, 255, 0.65); box-shadow: 0 0 0 2px rgba(143, 180, 255, 0.12); }

/* knob sandbox */
.article-body .enx-knoblab { margin-top: 14px; padding: 14px; border-radius: 12px; border: 1px dashed rgba(242, 193, 78, 0.4); }
.article-body .enx-knoblab-c { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px 16px; margin-bottom: 12px; }
.article-body .enx-lbl { display: grid; gap: 6px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--x-ink-3); }
.article-body .enx-sel { min-height: 40px; padding: 6px 10px; border-radius: 10px; background: var(--x-bg-3); border: 1px solid var(--x-line-2); color: var(--x-ink); font-family: var(--sans); font-size: 14px; letter-spacing: 0; text-transform: none; }
.article-body .enx-range { width: 100%; accent-color: var(--x-chosen); min-height: 40px; }

/* hero */
.article-body .enx-sentence { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: baseline; margin: 6px 0 18px; font-size: clamp(30px, 6vw, 44px); font-weight: 600; letter-spacing: var(--track-title); color: #fff; line-height: 1.1; }
.article-body .enx-blank { position: relative; display: inline-block; font-family: var(--serif); font-style: italic; font-weight: 400; color: var(--x-ink-2); padding: 0 10px; border-bottom: 2px dashed var(--x-line-2); min-width: 3.6em; text-align: center; transition: color 200ms ease, border-color 200ms ease; }
.article-body .enx-blank::after { content: ""; position: absolute; left: 8px; right: 8px; top: 54%; height: 3px; border-radius: 2px; background: var(--x-wrong); transform: scaleX(0); transform-origin: left center; }
.article-body .enx-blank.is-rolling { color: var(--x-ink-3); }
.article-body .enx-blank.is-wrong { color: var(--x-wrong); border-bottom-color: rgba(255, 138, 122, 0.55); }
.article-body .enx-blank.is-wrong::after { transform: scaleX(1); }
.article-body .enx-blank.is-wrong.is-landed::after { animation: enx-strike 260ms var(--x-ease-out) 220ms both; }
.article-body .enx-blank.is-right { color: var(--x-calc); border-bottom: 2px solid rgba(98, 217, 163, 0.7); }
.article-body .enx-blank.is-landed { animation: enx-land 420ms var(--ease-spring-bounce) both; }
@keyframes enx-land { from { opacity: 0.5; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes enx-strike { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.article-body .enx .enx-verdict { min-height: 3em; margin: -6px 0 16px; font-size: 14px; color: var(--x-ink-2); opacity: 0; transform: translateY(-3px); transition: opacity 200ms var(--x-ease-out), transform 200ms var(--x-ease-out); }
.article-body .enx .enx-verdict.is-shown { opacity: 1; transform: none; }
.article-body .enx-verdict-tag { display: inline-block; margin-right: 6px; padding: 2px 8px; border-radius: 99px; font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; border: 1px solid currentColor; }
.article-body .enx-verdict-tag.is-wrong { color: var(--x-wrong); background: rgba(255, 138, 122, 0.08); }
.article-body .enx-verdict-tag.is-right { color: var(--x-calc); background: rgba(98, 217, 163, 0.08); }
.article-body .enx-try { display: block; margin-top: 4px; color: var(--x-calc); }
.article-body table.enx-compare th, .article-body table.enx-compare td { overflow-wrap: normal; word-break: normal; hyphens: auto; -webkit-hyphens: auto; }
.article-body .enx-sentence.is-small { font-size: clamp(24px, 4.6vw, 32px); margin: 4px 0 14px; }
.article-body .enx-guide { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--x-line); }
.article-body .enx-guide-h { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--x-accent); margin-bottom: 10px; }
.article-body .enx-guide ol { list-style: none; margin: 0 0 14px; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
.article-body .enx-guide li { margin: 0; padding: 12px; border-radius: 10px; background: var(--x-bg-2); border: 1px solid var(--x-line); display: grid; gap: 4px; align-content: start; font-size: 13px; line-height: 1.5; color: var(--x-ink-2); }
.article-body .enx-guide li svg { color: var(--x-train); }
.article-body .enx-guide li b { color: #fff; font-size: 14px; }
.article-body .enx-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 14px; font-size: 13px; color: var(--x-ink-3); }
.article-body .enx-legend span { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
.article-body .enx-legend span::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: currentColor; margin-right: 6px; vertical-align: 1px; }

@media (max-width: 640px) {
  .article-body .enx { padding: 16px 14px 14px; margin: 28px -4px; border-radius: 14px; }
  .article-body .enx-flow { grid-template-columns: 1fr; }
  .article-body .enx-scene { padding: 12px; }
  .article-body .enx-barrow { grid-template-columns: 70px 1fr 58px; gap: 8px; }
  .article-body .enx-metrics b { font-size: 18px; }
  .article-body .enx-title { font-size: 19px; }
  .article-body .enx-nav .enx-btn { flex: 1 1 auto; justify-content: center; }
  .article-body .enx-pos { order: -1; flex-basis: 100%; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  /* Keep the fades that explain a change; drop everything that moves. */
  .article-body .enx *, .article-body .enx *::before { animation: none !important; }
  .article-body .enx .enx-fill, .article-body .enx .enx-dial i, .article-body .enx .enx-pop, .article-body .enx .enx-verdict { transition: none !important; }
  .article-body .enx .enx-pop, .article-body .enx .enx-verdict { transform: none !important; }
  .article-body .enx-stage.is-enter { animation: enx-fade 150ms ease-out !important; }
}
@media (prefers-contrast: more) {
  .article-body .enx { --x-line: rgba(255, 255, 255, 0.35); --x-line-2: rgba(255, 255, 255, 0.55); --x-ink-2: #d6dbe4; --x-ink-3: #b3bcc9; }
  .article-body .enx-n { text-decoration-style: solid; }
}
</style>

This blog has been a blank for three months.

The last post went up on the 19th of July. Then nothing.

Not because there was nothing to say. Because I went back to being a student, one subject at a time.

First, [*Inference Engineering*](https://www.baseten.co/inference-engineering/book/), Philip Kiely's book on serving models in production.

Then the early-access chapters of Boni García's [*Context Engineering*](https://www.manning.com/books/context-engineering).

Then the [GPU Programming Specialization](https://www.coursera.org/specializations/gpu-programming) from Johns Hopkins on Coursera, which asks you to think in threads and blocks and memory a writer never has to care about. Until now.

Three subjects, in that order. Serving a model fast. Feeding a model the right context. The silicon underneath both.

The two books open from the same unspoken sentence, and the course is about the hardware that sentence runs on.

*Assume you already have a trained model.*

Fine. Where did it come from?

Most of us can recite the answer. Weights. Gradients. Backpropagation. Very few of us could point at a single weight and say who put it there, what it started as, or what moved it. When a model card says 70 billion parameters, what is one parameter, physically? A number. Fine. Whose number?

So today this blog starts a series. I'm calling it **Weights to Words**: first how the weights get made, then how those weights turn into the words you read.

- **Part 1, this post:** how a model gets trained. Where every single number comes from.
- **Part 2, next, and onward:** it picks up exactly where this post ends. What happens after this kind of training. The fine-tuning and human feedback that turn a raw text predictor into an assistant. Then the model leaves school, and the hard engineering moves to serving it, feeding it context, and the GPUs doing the arithmetic. That is the territory those three months of reading covered.

And this one isn't a diagram post. It comes with a real model.

A tiny one. Forty-four trainable numbers, one attention head, three possible answers. It reads "I drink hot" and has to guess the next word. The 44 break down like this: 6 numbers for the word embeddings, 12 in the attention machines, 17 in a small feed-forward block, and 9 in the answer judges. You'll meet every one of them. Nothing here is a cartoon of learning. It genuinely makes a guess, genuinely works out which of its numbers to blame for the mistake, and genuinely adjusts them with Adam, the optimizer family the big labs still build on. Each of those steps gets its own lab below, and you train it with a button in Lab 07.

Here it is right now, before anyone has taught it anything.

<div class="enx-hero" aria-label="The tiny model's current guess">
<p class="enx-fallback">Interactive model: the untrained network reads "I drink hot" and gives coffee 58.2%, tea 22.7%, pizza 19.1%. Needs JavaScript.</p>
</div>

It picked coffee: 58 percent of its probability went there. The book says tea.

Why coffee? Because when we set the starting numbers by hand, the coffee judge got a head-start bonus of +0.60 and the tea judge got −0.35. Nothing learned that. We typed it. You'll meet those judges in Lab 05.

Nothing is broken. That is simply what 44 hand-set numbers believe about hot drinks.

Every number on this page belongs to one of three families, and the colors never lie about which:

- **Chosen.** A person put it there and nothing will change it. The sentence. The token IDs. The learning rate.
- **Trainable.** A person set its starting value, and training is allowed to turn it. These are the parameters. The weights. The knobs.
- **Calculated.** Made fresh on every run, by a fixed rule, from numbers that came before.

> Every number in a language model was chosen by a person, set as a knob and turned by training, or calculated by a rule. There is no fourth kind.

That sentence is the whole post. The eight labs below are the proof, one stage at a time. The box above shows how to use them: step through the tabs, tap any colored number, open the drawers when you want the arithmetic.

Two ways to read this. Straight through, skipping the labs: the text stands on its own. Or stop at every lab and poke the numbers. Either way, this model is simplified on purpose, one attention head, one layer, three words, so the bottom of every stage has a note called "What a real LLM does instead." Nothing here pretends to be production scale.

## The name tags

Before the model learns anything, a surprising amount has already been decided.

The sentence is chosen. The IDs are chosen: hot is 43 because we said so, and 43 means nothing, the way your employee ID says nothing about your work. Then the ID fetches a row of two numbers from the embedding table, and here is the first real twist. Those two numbers are already knobs. They are not "the meaning of hot." They are a starting guess that training will shove around until it becomes useful. In a real model those starting values are small random numbers from a seeded generator. Here they are typed in, so the page behaves the same for everyone.

<div class="enx-lab" data-lab="name-tags" data-num="01" data-title="Before the model guesses">
<p class="enx-fallback">Interactive lab, stages 1 to 4: the practice sentence, token IDs, embedding rows, and position stickers. Needs JavaScript.</p>
</div>

The position stickers in stage 4 matter more than they look. Attention, on its own, treats a sentence like a bag of words. Without the sticker, nothing tells the model which word came first. In this toy the sticker is simply added. Most modern models encode position a different way, a trick called [RoPE](https://arxiv.org/abs/2104.09864) that works inside the attention step you're about to meet. Same job.

## Three machines with four screws each

This is where most explainers lose people. Slow down here.

Q, K and V. Query, key, value. The names sound like a database. They are not. The query is what a word is looking for. The key is what each word offers to be matched against. The value is what a word hands over if it gets picked. Each is made by its own little machine with its own four knobs, and the same machine runs on every word in the sentence.

The distinction worth keeping is the one between the machine and what it makes. Wq is stored. It is part of the model. Q, the pair of numbers it produces for "hot", is thrown away after every run and rebuilt from scratch next time.

If you write docs for a living, you already know this shape. Wq is the template. Q is the rendered page. You maintain the template. The page gets regenerated on every build.

<div class="enx-lab" data-lab="machines" data-num="02" data-title="The Q, K and V machines">
<p class="enx-fallback">Interactive lab, stages 5 to 8: where the Q, K and V knobs come from, and how each machine turns a word's input into its Q, K and V numbers. Needs JavaScript.</p>
</div>

> The knobs are the model. Everything else is a calculation the knobs make possible.

## The room where words listen

Here is the famous part. The one with [the paper title](https://arxiv.org/abs/1706.03762) everybody quotes.

"Hot" holds its Q card up against every word's K card, including its own. Each comparison is a multiply-and-add, divided by √2, the square root of the card length, so the scores don't blow up as cards get longer. Softmax, a fixed recipe (raise e to each score, divide by the total), turns the three scores into three shares of one pie. Those shares decide how much of each word's V message gets mixed into hot. Then the original hot is added back on top, so the original isn't thrown away.

That's attention. A weighted average, with weights the model computes for itself.

<div class="enx-lab" data-lab="listen" data-num="03" data-title="How words influence each other">
<p class="enx-fallback">Interactive lab, stages 9 to 12: match scores between Q and K, softmax into attention shares, mixing the V messages, and the residual connection. Needs JavaScript.</p>
</div>

Look closely at the softmax stage. The untrained model listens to all three words almost equally: 33.5, 34.0 and 32.5 percent.

Remember those numbers. They come back.

## The second workshop

One more machine, and it is the least glamorous.

The pair from attention goes into a feed-forward block: three little calculators widen it from two numbers to three, a fixed bend called tanh squashes each one, and a second table folds the three back down to two. The bend is the important part. Without it, stacking layers of multiplication collapses into one big multiplication, and depth buys you nothing.

Unglamorous, and enormous. In a standard transformer layer, the feed-forward block holds roughly two thirds of the parameters.

<div class="enx-lab" data-lab="workshop" data-num="04" data-title="A second learnable machine">
<p class="enx-fallback">Interactive lab, stages 13 to 15: the feed-forward weights W1 and b1, the tanh bend, and W2 and b2 folding the result back to two numbers. Needs JavaScript.</p>
</div>

## Three judges

Here is the strangest fact in the whole pipeline.

The judges never see the word "hot." They never see "drink." By this point, everything the model understood about the sentence has been compressed into one final pair of numbers, and that pair is all the judges get. Each judge, one per possible answer, has its own two knobs and a bonus, and turns the pair into a raw score called a logit. Softmax, the same recipe from attention, turns the scores into chances.

In this toy there are three judges. [Llama 3](https://ai.meta.com/blog/meta-llama-3/) has a vocabulary of about 128,000 tokens. That's 128,000 judges, every single time it produces a word.

<div class="enx-lab" data-lab="judges" data-num="05" data-title="How the guess is produced">
<p class="enx-fallback">Interactive lab, stages 16 and 17: the output weights Wo and bo turning the final pair into logits, and softmax turning logits into next-word chances. Needs JavaScript.</p>
</div>

{% include v2/sponsor-slot.html %}

Up to here, the model has only guessed. Nobody has graded it.

## The mistake meter

The answer card finally comes out of the drawer.

One honest word about "wrong" first. Coffee isn't bad English. *I drink hot coffee* is a perfectly good sentence. In training, the target is simply whatever the text actually said next, and this page of text said tea. Across a whole library, both words would earn probability, roughly in proportion to how often each one follows. Wrong here means one thing only: not what this example said.

The book says tea. The model gave tea 22.7 percent. A fixed formula, the negative log of that chance, turns it into one number: 1.4815. That is the loss. If the model had given tea 100 percent, the loss would be zero. The smaller the chance, the steeper it climbs. That's the reason for the log: it punishes confident misses hard. A 50 percent chance costs 0.69. A 1 percent chance costs 4.6.

Then the clever part. Backpropagation walks the whole calculation backward, from the loss through the judges, the workshop, attention, Q, K, V, all the way to the embedding rows, and hands every one of the 44 knobs a gradient: if you turn this knob up a hair, here is how much the mistake changes. It works because each step only needs to know one local fact, how much its output moves when its input moves, and a rule from school calculus, the chain rule, multiplies those local facts together on the way back.

One gradient you can check on a napkin. For the tea bonus, it is just the chance of tea minus one, a clean shortcut you get from pairing softmax with this log loss. 0.227 minus 1. That's −0.773.

Most of them you can't. So the lab proves one the hard way. It takes a single Q knob, nudges it up by 0.0001 and reruns the entire network, nudges it down and reruns again, and measures the slope directly. Backprop says 0.00019441093488. The wiggle says 0.00019441093402. They agree to the twelfth decimal place. The gap is about 0.0000000000009, smaller than the error the wiggle itself introduces.

<div class="enx-lab" data-lab="mistake" data-num="06" data-title="How the machine learns">
<p class="enx-fallback">Interactive lab, stages 18 to 20: cross-entropy loss, backpropagation gradients, and a finite-difference proof that a Q knob's gradient is real, plus a sandbox knob you can turn. Needs JavaScript.</p>
</div>

Play with the sandbox in stage 20, the "Prove it" tab. Pick the tea bonus and the curve is steep: that knob matters a lot right now. Pick the Q knob and the curve is nearly flat. Turn it as far as you like. The mistake barely notices.

That's what a gradient really is. Not a mysterious signal. A measurement, for this one example and these exact knob settings, of how much each knob would move the mistake, and in which direction. Change the example or the settings and the measurement changes too.

## The coach

Knowing which way to turn a knob is not the same as turning it.

That's the optimizer's job, and this toy uses Adam, from [Kingma and Ba's 2014 paper](https://arxiv.org/abs/1412.6980). It keeps two running memories for every knob, the average gradient and the average squared gradient, and divides one by the square root of the other. Dividing a gradient by its own typical size cancels the size out. What's left is mostly direction.

Here's the one nobody expects. Before training, the tea bonus has a gradient of −0.77. One of the K knobs, Wk[1][0], has a gradient of −0.000146. A shout and a whisper, more than five thousand times apart. Ten rounds later, that whispering K knob has moved 0.43, one of the biggest moves on the whole board. Adam cares far less about how loud a gradient is than plain gradient descent does. What moves a knob far is a gradient that keeps pointing the same way.

One press of its button is one round: guess, grade the guess, backprop, nudge all 44 knobs.

Now press it.

<div class="enx-lab" data-lab="coach" data-num="07" data-title="The optimizer and the training loop">
<p class="enx-fallback">Interactive lab, stages 21 and 22: one Adam update traced number by number, then a live training loop with a chart of the chance of tea and a wall of all 44 knobs. Needs JavaScript.</p>
</div>

One round: tea goes from 22.7 to 29.0 percent. Two rounds: 36.9. Five: 73.2. Ten: 99.4. Coffee collapses to almost nothing.

Then scroll back up the page. Every lab has recalculated. The embedding dots in Lab 01 have drifted. The Q, K and V cards have new values. The judges' knobs have turned. Same sentence, same rules, same arrows. Only the knobs changed, and that changed everything downstream.

That is the core loop of pretraining, the first and by far the biggest phase of training a language model. Real pretraining runs this same loop with more than just more data. It predicts the next token at every position of every sentence at once, in batches of millions of tokens, through dozens of layers, with a mask so no word can peek at the words after it. Bigger in every direction. Same loop.

Here is everything else that differs, side by side, against a real open model, [Llama 3 8B](https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md). The toy is a teaching instrument, not a shrunken copy.

| | This toy | Llama 3 8B |
|---|---|---|
| Trainable numbers | 44 | about 8 billion |
| Layers | 1 | 32 |
| Attention heads | 1 | 32, sharing 8 key/value heads |
| Numbers per token | 2 | 4,096 |
| Feed-forward width | 3 | 14,336 |
| Normalization | none | RMSNorm in every layer |
| Position | added stickers | RoPE rotations |
| Causal mask | not needed, it predicts one position | every position, every sequence |
| Vocabulary | 3 answers | 128,256 tokens |
| Context | 3 words | 8,192 tokens |
| Training text | 1 sentence | over 15 trillion tokens |
{: .enx-compare}

Scaling 44 up to 8 billion is not the only difference. It's the loop that carries over.

## What ten rounds actually taught it

99.4 percent of its probability on tea. Impressive.

Now go back to Lab 03 and look at the attention shares again. After ten rounds they read 33.4, 35.1 and 31.5 percent. Barely moved.

It didn't learn to listen to "drink." It didn't learn that "hot" goes with beverages. It learned to say tea. Every knob got nudged until the right answer fell out for the one sentence it has ever seen. It is a student who memorized the answer key and never opened the textbook, and the training loss cannot tell the difference. That is exactly why real labs grade their models on text the model never trained on.

Don't take my word for it. Test it.

<div class="enx-probe" aria-label="Memorization test">
<p class="enx-fallback">Interactive test: after 10 rounds of training, the model gives tea 99.4% for "I drink hot", but also 98.2% for "hot drink I" and 97.1% for "I I I". Needs JavaScript.</p>
</div>

After ten rounds, "I I I" gets tea at 97 percent. "hot drink I" gets 98. Before training, every one of them got coffee. The model did process those words. Its answer just barely depends on them. It learned to favor tea, not the link between drinking, heat, and tea, and a low training loss could never have told you the difference.

This is why real training needs an absurd amount of text. [GPT-3](https://arxiv.org/abs/2005.14165) had 175 billion parameters and trained on about 300 billion tokens. Llama 3 trained on over 15 trillion. Big models still memorize some of what they see: [Carlini and colleagues](https://arxiv.org/abs/2202.07646) found memorization grows with model size and with how often a passage is duplicated in the training data. But across fifteen trillion varied tokens, memorizing stops being the cheap way down. Learning patterns that generalize, grammar, facts, the shape of an argument, lowers the loss on far more text at once. Both happen in the same model, at the same time.

> Same loop. Same three kinds of numbers. Enough sentences that memorizing stops being the cheap way out.

Here's why I think this matters for anyone who writes documentation.

The question this page keeps asking, *where did this number come from*, is the question we ask for a living. Where did this claim come from? Which version? Who verified it? A trained model is the first artifact most of us will document where the honest answer is "from fifteen trillion tokens and an enormous number of tiny turns of a knob." You don't need to write CUDA to document AI well. But if you can't trace even a toy model end to end, you are not documenting the system. You are repeating its marketing.

## Closing the answer book

At some point a human decides training is done. Usually that means the planned budget of text and compute has been spent, or the score on text the model has never seen has stopped improving. They save the knobs and close the answer book for good.

What's left is inference: text in, tokens out, no loss, no gradients, no updates. Just the forward pass, again and again, one word at a time.

<div class="enx-lab" data-lab="answer-book" data-num="08" data-title="The full picture">
<p class="enx-fallback">Interactive lab, stage 23: the end-to-end loop, and which steps training uses versus inference. Needs JavaScript.</p>
</div>

Look at the loop in that last lab. Inference runs steps 1 to 8 and stops.

Everything in those three months of reading lives inside those eight steps. Context engineering decides what text goes in at step 1. The K and V cards from Lab 02 get saved instead of recomputed for every new token: that is the KV cache, and it is a large part of *Inference Engineering*. Quantization stores the knobs in fewer bits. The GPU course is about making the multiplications in steps 4 through 7 run on thousands of cores at once.

That is Part 2. The model has left school. Now someone has to run it fast and cheaply, for millions of people, with the right context in front of it.

## The reading list

If this lab made you want more, these are the primary sources, not summaries of summaries.

- [micrograd](https://github.com/karpathy/micrograd), Andrej Karpathy's tiny autograd engine. The backprop in this toy follows the same pattern: every number remembers what made it.
- [Let's build GPT: from scratch, in code, spelled out](https://www.youtube.com/watch?v=kCc8FmEb1nY), Karpathy again, building a real character-level transformer in two hours.
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762), the 2017 paper that introduced the transformer.
- [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980), the optimizer in Lab 07.
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/), Jay Alammar's visual walkthrough, still the best picture book for this.
- [3Blue1Brown's neural network series](https://www.3blue1brown.com/topics/neural-networks), for the intuition behind gradients and backprop.
- And the three that kept this blog quiet: [*Inference Engineering*](https://www.baseten.co/inference-engineering/book/) (free to read online), [*Context Engineering*](https://www.manning.com/books/context-engineering), and the [GPU Programming Specialization](https://www.coursera.org/specializations/gpu-programming).

## The blank

Scroll back to the top of this page.

The sentence is still there. I drink hot, and a blank.

If you trained the model, the blank now says tea. Nobody typed it. Forty-four numbers moved a little, a few dozen times, and the blank filled itself in. If you didn't train it, it still says coffee, struck through in red, because of a bonus we typed by hand.

This blog had a blank too. Three months of it, July to October, spent reading about everything that happens after a model is trained. Part 2 is the after. This was the before: every number, and every parent.

Before you go, make it guess right.

*Press train.*

<script defer src="/js/posts/llm-training-lab.js?v=4"></script>
