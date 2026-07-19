---
title: "Loop Engineering Is a Writing Job"
subtitle: "Your agent ends every session with the same confident word. Here is the loop that checks that word from outside: a written definition of done, a boring checker, a heartbeat, and a grade. Five small files, one afternoon, real output included."
category: AI
image: "/assets/loop-engineering.png"
header-img: "/assets/loop-engineering.png"
seo_keywords: "loop engineering, what is loop engineering, AI agent verification, verify AI agent output, verification loop, definition of done AI agent, Claude Code stop hook checker, AI agents technical writing, release notes validation script, agent says done who checks, external checker AI workflow, docs as code quality gates"
permalink: /loop-engineering/
radar_theme: ai_agent_eval_patterns
og_title: "Loop Engineering Is a Writing Job"
og_description: "The industry is asking what loop engineering is. The operator's answer: an external loop that checks your agent's done against a written definition it cannot edit. Built with five real files: a loop spec, a checker, a hook, a heartbeat, and a grade."
og_image: "/assets/loop-engineering.png"
twitter_card: "summary_large_image"
alt_text: "A terminal showing four FAIL lines from a checker script beside an AI agent summary that says done"
faqs:
  - question: "What is loop engineering?"
    answer: "Loop engineering is building the loop that checks an agent's work from outside the agent, against a definition of done the agent cannot edit. The agent does the work and claims done. A deterministic checker validates that claim against a written spec: links resolve, versions match the manifest, tickets exist, banned terms are absent. The checker logs every run so its own silence can't hide a failure, and the whole loop gets graded later against what actually happened."
  - question: "Can't the agent just check its own work?"
    answer: "It can, and the review will read beautifully, and it settles nothing. The reviewer is the same kind of model that did the work, holding the same context and the same blind spots. A self-review raises quality the way rereading your own email raises quality: worth doing, but it cannot establish that the claim is true. Verification has to come from something the agent does not control, usually a small script that gives the same answer every time."
  - question: "Do technical writers need to code to build a verification loop?"
    answer: "Less than you'd think. The checker in this post is 133 lines of standard-library Python, and an agent will happily write that part for you. The part the agent cannot write is the loop spec: the definition of done. Deciding that a release note is done when every ticket ID exists in the sprint export, every link returns 200, and the version matches the manifest is editorial judgment about sources and failure modes. That judgment is the writing job. The code is the easy half."
  - question: "What belongs in a definition of done for documentation?"
    answer: "Only what a script can check. Links resolve, version strings match a manifest, every documented flag exists in the current CLI help, screenshots are younger than the last UI release, banned terms are absent, required front matter keys are present. Qualities like clear and consistent are real but they are not predicates, so they stay in your style guide and your human review. The discipline of the spec is admitting the difference."
description: "The industry is asking what loop engineering is. The operator's answer, built for technical writers: an external loop that checks your agent's done against a written definition it cannot edit. Five real files, shown with real output."
---

<style>
.article-body .le-fig {
  background: #0f1318;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  padding: 26px 24px;
  margin: 36px 0;
  color: #e6e9ef;
  font-family: "Geist", system-ui, sans-serif;
}
.article-body .le-fig-label {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.72em;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8fb4ff;
  margin: 0 0 18px;
}
.article-body .le-flow { display: flex; flex-direction: column; gap: 10px; }
.article-body .le-step {
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
.article-body .le-step.is-control { border-left-color: #5B8DEF; background: #121826; }
.article-body .le-step-n {
  font-family: "Geist Mono", ui-monospace, monospace;
  color: #5f6b7a;
  font-size: 0.9em;
}
.article-body .le-step-name {
  display: block;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.78em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #cdd5e0;
}
.article-body .le-step-note { display: block; color: #9aa4b2; font-size: 0.86em; margin-top: 3px; }
.article-body .le-pill {
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.7em;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 999px;
  white-space: nowrap;
  color: #5fe39a;
  background: rgba(95,227,154,0.12);
  border: 1px solid rgba(95,227,154,0.3);
}
.article-body .le-pill.ctrl { color: #8fb4ff; background: rgba(91,141,239,0.12); border-color: rgba(91,141,239,0.35); }
.article-body .le-step.is-no { border-left-color: #ff6f6f; background: #1b1417; }
.article-body .le-pill.no { color: #ff9a9a; background: rgba(255,111,111,0.12); border-color: rgba(255,111,111,0.3); }
</style>

Done.

The agent ends every session with it. A tidy summary, four bullets of what shipped, a green line about checks passing. It says done the way a contractor says done from the driveway, engine already running. The tiles are in. The grout is drying. Trust me.

I trusted it for months.

Then I found out what the word was covering for. My review skill, the one whose whole job was keeping the writer skill honest, was [the same model reading the same sources with the same blind spots](/trust-layer-nobody-built/). Every check was green. The pipeline was happy. And I had no honest way to know whether anything it published was true.

The industry spent this month reaching for a name for the fix. It landed on [loop engineering](https://newsletter.pragmaticengineer.com/p/what-is-loop-engineering), asked what that means, and mostly shrugged. The sharpest thread on the subject skipped the naming and [asked the only question that matters](https://dev.to/nexuslabzen/your-ai-agent-says-done-who-checks-that-from-outside-the-agent-3fe4): the agent says done. Who checks that, from outside?

I run one of these loops in production. So here is a working answer instead of a shrug.

> Loop engineering is building the loop that checks an agent's work from outside the agent, against a definition of done the agent cannot edit.

The rest of this post unpacks that sentence into five small files and an afternoon. Not a platform. Files. I built them this week, ran them, and the output below is real, including the run where the draft failed four ways.

## The loop, drawn once

Start with what the word is.

Done is a claim. A statement made by the party that did the work, about the work, in the same breath as the work. Every other department in your company has a name for that. Self-assessment. Nobody staffs an audit with them.

An agent without a checker is half a system. The half that talks. The five files are the other half.

The reflex fix is to ask the agent to double-check itself, and the review it produces will be prompt, thorough, and articulate. It will even improve the draft. What it cannot do is settle whether the claim is true. The student grading their own exam is not dishonest. Just invested.

None of this is my invention, and that is the point. Test-driven development wrote the check before the code and made the red bar the boss. Site reliability engineers page on a missing heartbeat, not just on errors, because they paid for that lesson in outages. Aviation put its definition of done on a laminated card decades ago and made the pilot read it aloud. Compilers have never trusted source code at all; every build is a verification pass against a written grammar. Verification against a written spec is where every discipline lands once the doer gets fast enough to outrun the checking. Ours just got there. The term is new. The loop is not.

So the loop has four properties, and each one exists because I watched its absence fail.

**The checker lives outside the agent and runs the same way every time.** A script, not a second model. A dumb check that shares nothing with the doer beats a brilliant one that shares everything. Your link checker has no opinion about the prose. That is its qualification.

**The definition of done freezes before the work starts.** Left loose, done drifts mid-run. "Notes for every ticket in the sprint" quietly becomes "notes for the tickets that were easy to find," and the summary still reads like victory. Write the finish line down before the race, or the runner will move it.

**Somebody watches the watcher.** A checker that found nothing prints nothing. A checker that silently died also prints nothing. Same silence, opposite meanings. We will give the checker a pulse.

**The loop gets graded later.** A checker that never fails is either guarding a flawless pipeline or unplugged. You will not know which until you read its log the way you'd read anyone else's claims.

<div class="le-fig">
  <p class="le-fig-label">// the loop, end to end</p>
  <div class="le-flow">
    <div class="le-step">
      <span class="le-step-n">01</span>
      <span><span class="le-step-name">Agent skill</span><span class="le-step-note">drafts the release notes, declares done</span></span>
      <span class="le-pill">claim</span>
    </div>
    <div class="le-step is-control">
      <span class="le-step-n">02</span>
      <span><span class="le-step-name">Loop spec</span><span class="le-step-note">the written definition of done, frozen before the run</span></span>
      <span class="le-pill ctrl">frozen</span>
    </div>
    <div class="le-step is-control">
      <span class="le-step-n">03</span>
      <span><span class="le-step-name">Checker</span><span class="le-step-note">validates every predicate, names every failure</span></span>
      <span class="le-pill ctrl">verdict</span>
    </div>
    <div class="le-step is-control">
      <span class="le-step-n">04</span>
      <span><span class="le-step-name">Heartbeat</span><span class="le-step-note">one log line per run, pass or fail, so silence can't lie</span></span>
      <span class="le-pill ctrl">loud</span>
    </div>
    <div class="le-step">
      <span class="le-step-n">05</span>
      <span><span class="le-step-name">Grade</span><span class="le-step-note">monthly read of claims vs outcomes</span></span>
      <span class="le-pill">graded</span>
    </div>
  </div>
</div>

That is the whole theory. Now the files.

## The loop spec

One file. The most important one, and the one almost nobody writes.

This is the definition of done for one deliverable: release notes for a product I invented this week so I could break its release notes in peace. The product is a stand-in. The spec, the checks, and every line of output below ran for real:

```yaml
# Definition of done: release notes for DocPortal
# Rule: if a script cannot check it, it does not belong in this file.

version_must_match: fixtures/manifest.json
tickets_must_exist_in: fixtures/sprint-export.json
links_must_resolve: true

required_front_matter:
  - title
  - version
  - date

banned_terms:
  - simply
  - seamless
  - leverage
  - best-in-class
```

Seventeen lines. Five predicates. Everything else got rejected.

And the rejects are the interesting part. "The notes are clear." "The tone is consistent." "The reader can find what changed." All real qualities. None of them predicates. A script cannot check clarity, so clarity stays in the style guide and the human review, where it belongs. What survives into this file is only what has a yes or a no.

> If a script cannot check it, it does not belong in the file.

Painful discipline. Most of what we call quality turns out to be unfalsifiable, and this file makes you admit it, line by line.

Now look at what writing it demands. You have to know where the source of truth for the version lives. Which system owns the list of shipped tickets. Which failures embarrass you in public and which just embarrass you in standup. Which words mark a draft as machine-written before anyone reads past the first bullet. That is not configuration. That is audience analysis, source mapping, and editorial judgment, compressed until it has an exit code.

The audience just happens to be a script.

And that sentence is the real shift hiding under the buzzword. We have always written for one kind of reader: a person, interpreting. The loop spec adds a second: a machine, verifying. Two audiences now, permanently. The manual explains the system to the human. The spec proves the work to the machine. The same writer owns both, which is why this is [an expansion of the job, not the death of it](/modern-day-technical-writing-is-dead/).

## The checker

The second file is deliberately boring.

```python
def check(notes_path, spec):
    failures = []
    text = Path(notes_path).read_text()
    fm = front_matter(text)          # small regex helper, elided

    for key in spec.get("required_front_matter", []):
        if key not in fm:
            failures.append(f"front-matter: required key '{key}' missing")

    manifest = json.loads((HERE / spec["version_must_match"]).read_text())
    if fm.get("version") != manifest["version"]:
        failures.append(f"version: notes say {fm.get('version')}, "
                        f"manifest says {manifest['version']}")

    sprint = json.loads((HERE / spec["tickets_must_exist_in"]).read_text())
    for ticket in sorted(set(re.findall(r"TW-\d+", text))):
        if ticket not in sprint["tickets"]:
            failures.append(f"tickets: {ticket} not in sprint export {sprint['sprint']}")

    if spec.get("links_must_resolve") == "true":   # flat parser, values stay strings
        for url in re.findall(r"\]\((https?://[^)]+)\)", text):
            status = link_status(url)      # curl, follows redirects
            if status != 200:
                failures.append(f"links: {url} returned {status}")

    body = text.split("---", 2)[-1].lower()
    for term in spec.get("banned_terms", []):
        if re.search(rf"\b{re.escape(term)}\b", body):
            failures.append(f"banned-terms: '{term}'")

    return failures
```

There is no model anywhere in it, and that is the design, not a budget decision. A checker that thinks can be persuaded. A checker that reads the same sources as the writer inherits the writer's blind spots. This one compares strings and exit codes, which makes it immune to a well-written apology. The full file is 133 lines, heartbeat and a tiny parser for that flat YAML included, because a spec this simple does not deserve a dependency.

One more thing before you wire it anywhere.

> Before you trust a checker, lie to it.

I fed it a draft seeded with four classic failures: a version number two releases stale, a ticket ID that exists nowhere, a link to a page that does not exist, and one word from the banned list. If the checker blesses this draft, the checker goes in the bin.

```
$ python3 check_release_notes.py fixtures/release-notes.md
FAIL version: notes say 3.2.0, manifest says 3.4.0
FAIL tickets: TW-2199 not in sprint export 2026-W29
FAIL links: https://beingtechnicalwriter.com/docs/webhooks/ returned 404
FAIL banned-terms: 'simply' (1 occurrence)
```

Exit code 1. Four failures, four named reasons, nothing to interpret. The 404 is real, by the way: the fixture borrows this blog's domain so the dead link would be dead when curl knocked.

Fix the draft, run it again:

```
$ python3 check_release_notes.py fixtures/release-notes-fixed.md
PASS all predicates in loop-spec.yaml hold for fixtures/release-notes-fixed.md
```

No confetti. PASS and exit code 0 is the entire celebration. You want your celebrations boring and your failures loud, which is the exact opposite of how agents currently write their summaries.

{% include v2/sponsor-slot.html %}

## The wiring

A checker nobody invokes is a diary.

The one place it must never live is inside the skill's own instructions. "Run the checker before finishing" is a sentence, and an agent treats sentences as suggestions with good PR. A checker the agent invokes by promise is a checker the agent can skip by accident, and it will pick the worst possible week to do it. The checker gets invoked by the harness or by CI. Never by politeness.

<div class="le-fig">
  <p class="le-fig-label">// where the checker is allowed to live</p>
  <div class="le-flow">
    <div class="le-step is-no">
      <span class="le-step-n">01</span>
      <span><span class="le-step-name">The skill's own markdown</span><span class="le-step-note">"run the checker before finishing" is a sentence, and sentences are skippable</span></span>
      <span class="le-pill no">a promise</span>
    </div>
    <div class="le-step is-control">
      <span class="le-step-n">02</span>
      <span><span class="le-step-name">Harness hook</span><span class="le-step-note">the harness runs it when the agent stops, context still loaded</span></span>
      <span class="le-pill ctrl">the desk</span>
    </div>
    <div class="le-step is-control">
      <span class="le-step-n">03</span>
      <span><span class="le-step-name">CI gate</span><span class="le-step-note">blocks the pull request, no matter who or what opened it</span></span>
      <span class="le-pill ctrl">the door</span>
    </div>
  </div>
</div>

In Claude Code, that means a hook:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 loops/check_release_notes.py docs/release-notes/next.md 1>&2 || exit 2"
          }
        ]
      }
    ]
  }
}
```

The `|| exit 2` is load-bearing. In a Stop hook, exit code 2 refuses to let the session end and feeds the checker's output back to the agent. The agent reads its own failures and goes back to work. You were not in the room, and the loop still closed.

The second home is CI, as a gate on the docs pull request:

```yaml
- name: Release notes gate
  run: python3 loops/check_release_notes.py docs/release-notes/next.md
```

Use the hook when the work happens at your desk and you want the agent to fix its own mess while it still has the context loaded. Use the CI gate to protect the main branch from everyone, agent or human, including you at 11 PM with a hotfix and total confidence. Most pipelines eventually want both.

One hole left to plug. The spec is a file in the repo, and an agent with write access can edit its own definition of done. "Notes for every ticket" becomes "notes for most tickets," the checker agrees with the new wording, and every light stays green. So the spec gets the same protection as any governing document: CI reads it from the main branch, not from the pull request, and the file sits behind a required review. A change to the definition of done is a human decision. Make the repo enforce that, because the post's whole definition hangs on those four words: the agent cannot edit it.

## The pulse

Now the failure mode nobody designs for, because it looks exactly like success.

One team's [postmortem made the rounds this month](https://dev.to/nexuslabzen/our-drift-warning-hook-was-silently-dead-for-23-days-zero-warnings-looked-exactly-like-good-472f): their quality hook had been silently dead for twenty-three days. A timeout killed it on every run before it could finish. No error surfaced. Zero warnings, three straight weeks, and the team read the silence as discipline improving. The instrument was unplugged and the dashboard called it health.

That is why the checker in this loop writes a log line on every run, including the passes:

```
{"ts": "2026-07-19T12:53:10+0530", "result": "FAIL", "failures": ["version: ...", "tickets: ...", "links: ...", "banned-terms: ..."]}
{"ts": "2026-07-19T12:53:23+0530", "result": "PASS", "failures": []}
```

The line on success is the point. Passing runs must leave fingerprints, or you cannot tell a healthy quiet from a dead one.

Then a second, tiny check watches the first. Weekly, on a schedule, it asks one question: has the log gone quiet?

```
$ python3 check_release_notes.py --pulse
PULSE OK: last run 0.0 days ago (PASS).
```

And when I tested it against silence, first with no log at all, then with a log whose last entry I backdated:

```
PULSE FAIL: loop-log.jsonl does not exist. The checker has never run.
PULSE FAIL: last checker run was 17.2 days ago. A quiet log is not a healthy log.
```

A dozen lines of code, and the twenty-three-day failure mode is now a loud Monday-morning alert. The guard has a guard. It sounds paranoid until you remember that the entire class of disaster we are engineering against is things that look fine.

## The grade

The last step runs on a calendar, not a trigger.

Once a month, read the log like an editor reads a writer's track record. A predicate that has never once failed is either protecting you or decorative, and you should find out which. A failure class that keeps arriving from an angle the spec never covers means the spec grows a predicate. A gap in the timestamps means the pulse needs teeth. The loop spec is a living document in the only meaningful sense of that phrase: it changes because reality graded it.

This part is not hypothetical for me. [Radar](/personal-intelligence-system-radar/), the system that reads the industry for me every week, is one long verification loop: Claude proposes the calls, a deterministic Python layer validates and commits them, and an eval grades every call weeks later against what actually happened. The ledger today: one graded win, arrived this week, five calls still open. A month from now that line will read differently, and I do not get to choose how. Which is exactly why I still trust the system. Not because it is always right. Because I know how often it is wrong, and in which direction. That number exists nowhere in the agent's own summaries. It only exists because a loop outside the agent kept receipts.

## What the loop cannot see

Now let me argue against my own files.

A predicate becomes a target the moment it has consequences. Goodhart's law does not spare documentation: box an agent in with a banned-terms list and it will find the hundred other ways to write badly. Box it in with a ticket check and it will produce one dutiful, useless line per ticket. The defense is baked into where the predicates point: at ground truth the agent cannot author. The manifest. The sprint export. The live URL. You can game a description. It is much harder to game a 404.

The spec itself can be wrong, and a wrong predicate is worse than a missing one. Not because it fails. Because it fails often enough that you stop reading the failures. A flaky link check that cries wolf twice a week trains you to skim past FAIL, and then the loop is dead in the way that matters while looking perfectly alive in the log. When a predicate turns noisy, fix it or demote it the same day. Trust in the checker is the actual asset. The code is just where you keep it.

And the ceiling stays out of reach. All five predicates passing tells you nothing about whether the notes are clear, honest, or worth reading. Some of that an LLM judge with a rubric can flag, and it earns a seat as an advisor. It never gets to be the gate, because a judge that shares the doer's brain shares its blind spots. The loop was never meant to replace your judgment. It exists to stop your judgment being spent on dead links.

> The loop guards the floor. The ceiling is still yours.

The day someone ships a deterministic check for clarity, I will happily retire that sentence. I am not holding my breath.

## Six loops you can write this month

The release-notes loop is one instance of a pattern with obvious siblings. Same five files every time. Only the spec changes.

- **The link-integrity loop.** Every URL in changed pages answers 200, every internal anchor resolves. Nightly. The oldest check in the book, finally pointed at the newest writer on the team.
- **The docs-drift loop.** Every flag in the CLI reference exists in the current `--help` output, every version string matches the release manifest. Runs on a schedule, because drift does not open pull requests.
- **The API-reference loop.** Every endpoint in the OpenAPI file has a page, every documented field exists in the schema, every example validates against it.
- **The screenshot loop.** Every screenshot is younger than the last UI release, or it gets flagged. The most quietly embarrassing predicate in documentation.
- **The style-gate loop.** Banned terms absent, headings cased per the guide, every image carries alt text. Your style guide, except it now has an exit code.
- **The terminology loop.** Deprecated product names at zero, term casing matched against the termbase. The rename your company did in March is enforced by a script that, unlike everyone else, did not forget by April.

And if a developer is reading over your shoulder, nothing here is docs-only. The same five files wrap a code agent or a migration agent unchanged. Only the spec's sentences differ: the tests pass, coverage does not drop, no new dependency appears, the dry run matches the plan.

Notice what changed as you read that list. The code stopped mattering. Every one of those is the same 133 lines wearing a different spec, and an agent will write those lines for you in a minute. What the agent cannot supply is the spec.

The code is a commodity. The spec is the craft.

## Done is a claim

Step back far enough and this stops being about documentation.

Any AI system allowed to work unsupervised is really two systems: one that produces claims, and one that verifies them. Ship only the first and you have shipped half a system. The law does not care what the agent makes: code, pipelines, research, anything that arrives with a confident summary on top. This post built the second system for one small corner of the world, and the surprise is what it turned out to be made of. Writing.

We spent our careers writing for readers who might misunderstand. The loop spec is written for a new kind of reader: one that cannot be talked past, does not skim, and extends no goodwill. It reads exactly what you wrote and nothing you meant. Writers have been begging for a reader like that forever. Be careful what you wish for; it arrived, and it wants predicates.

The industry will settle its institutional definition of loop engineering soon, with platforms and certifications and a conference track. Fine. Yours is five files: a spec, a checker, a hook, a heartbeat log, and a grade. One afternoon, most of it spent on the file with no code in it, deciding what done means for the thing you ship. That file is the one the agent never gets to edit. Guard it. It is the most important document in your pipeline.

The contractor is still in the driveway. The engine is still running. Done, the contractor says.

The difference is the checklist taped to the bathroom door. The contractor knows you read it. The tap gets turned before the van moves.

A while ago I wrote about [taking yourself out of the equation](/taking-yourself-out-of-the-equation/). The writer disappears. The work remains. What I could not see then is the condition attached: the work only outlasts you if what done means outlasts you too. You can only step out of a loop you have spelled out. The agents will keep saying done, faster and with more polish every quarter. The writers who stay essential will not be the ones checking every claim by hand. They will be the ones who wrote what the claim has to prove.

Done is a claim. What it has to prove is a document.

*Go write it.*
