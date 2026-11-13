---
title: "I Built Work Hub to Keep Tabs on My Work"
subtitle: "A daily brief and dashboard that remember what I picked up, why I put something off, and how I like to work."
category: "Technical Writing"
description: "Work Hub tracks commitments in Claude Code, saves the reasons behind Jira recommendations and deferrals, and remembers working preferences in local Markdown."
permalink: /work-hub-follow-ups/
image: "/assets/work-hub-dashboard.png"
header-img: "/assets/work-hub-dashboard.png"
alt_text: "Work Hub’s local inbox showing a study habit, an upgrade documentation task with a next action, and a meeting follow-up."
og_title: "I Built Work Hub to Keep Tabs on My Work"
og_description: "Work Hub gives Claude Code a local memory for how you work and keeps a history of what you picked up, deferred, or finished."
og_image: "/assets/work-hub-dashboard.png"
twitter_card: "summary_large_image"
seo_keywords: "Work Hub Claude Code plugin, technical writing workflow, documentation task tracker, Jira documentation workflow, local task tracker"
published: true
ai_note: "I supplied the opening and structure. Codex edited the draft and checked the feature descriptions against the Work Hub repository. The dashboard screenshot uses sample data."
faqs:
  - question: "What is Work Hub?"
    answer: "Work Hub is an open source Claude Code plugin with a local task tracker, a daily brief, and editable working memory. It brings connected work and personal commitments together and keeps a history of Jira recommendations, deferrals, and outcomes."
  - question: "What Markdown files does Work Hub create?"
    answer: "On a new Claude Code session, Work Hub copies missing starter files into ~/.claude/work-hub/ and creates or updates ~/.claude/CLAUDE.md so Claude can find them. The starter files include CLAUDE.md, persona.md, MEMORY.md, and files for project conventions, checklists, and lessons."
  - question: "Does Work Hub need a .env file?"
    answer: "Local tasks, habits, and the dashboard work without one. For connected sources, Work Hub can read the project or home .env or use credentials from the process environment. If neither file exists, it shows the setup paths and key names."
  - question: "Can Work Hub draft documentation?"
    answer: "It can hand a Jira issue you select to the separately installed docs-tools orchestrator in local draft mode. The active Claude Code directory needs to be the documentation checkout."
---

<style>
  .article-body .wh-diagram {
    container-type: inline-size;
    --wh-blue: #94baff;
    --wh-green: #a7e3b2;
    --wh-amber: #f8d48a;
    margin: 2rem 0;
    padding: clamp(14px, 3vw, 24px);
    border: 1px solid #314359;
    border-radius: 12px;
    background: #101923;
    color: #edf2f7;
    font: 0.92rem/1.5 var(--sans, system-ui);
  }
  .article-body .wh-diagram :is(p, li, figcaption) { margin: 0; }
  .article-body .wh-diagram :is(b, strong) { color: #f5f8ff; }
  .article-body .wh-diagram code {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--wh-blue);
    overflow-wrap: anywhere;
  }
  .article-body .wh-diagram .wh-start,
  .article-body .wh-diagram .wh-files li,
  .article-body .wh-diagram .wh-flow li {
    padding: 12px;
    border: 1px solid #314359;
    border-radius: 8px;
    background: #182535;
  }
  .article-body .wh-diagram :is(.wh-start, .wh-folder) { text-align: center; }
  .article-body .wh-diagram .wh-arrow {
    display: block;
    margin: 4px 0;
    color: var(--wh-blue);
    text-align: center;
  }
  .article-body .wh-diagram :is(.wh-files, .wh-flow) {
    display: grid;
    gap: 8px;
    padding: 0;
    margin: 12px 0 0;
    list-style: none;
  }
  .article-body .wh-diagram .wh-files { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .article-body .wh-diagram .wh-flow { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .article-body .wh-diagram :is(.wh-files, .wh-flow) li { min-width: 0; }
  .article-body .wh-diagram :is(.wh-files, .wh-flow) li > :first-child {
    display: block;
    margin-bottom: 4px;
  }
  .article-body .wh-diagram .wh-flow li {
    position: relative;
    border-top: 3px solid var(--wh-blue);
  }
  .article-body .wh-diagram .wh-flow .wh-wait { border-top-color: var(--wh-amber); }
  .article-body .wh-diagram .wh-flow .wh-ready { border-top-color: var(--wh-green); }
  .article-body .wh-diagram .wh-flow li + li::before {
    content: "";
    position: absolute;
    top: 50%;
    left: -8px;
    width: 7px;
    height: 7px;
    border-top: 1px solid var(--wh-blue);
    border-right: 1px solid var(--wh-blue);
    transform: translateY(-50%) rotate(45deg);
  }
  .article-body .wh-diagram .wh-label {
    display: block;
    margin-bottom: 4px;
    color: #bacbde;
    font: 0.76rem/1.35 var(--mono, monospace);
  }
  .article-body .wh-diagram figcaption {
    margin-top: 12px;
    color: #bacbde;
    font: inherit;
    font-size: 0.84rem;
    text-align: left;
  }
  @container (max-width: 535px) {
    .article-body .wh-diagram :is(.wh-files, .wh-flow) { grid-template-columns: 1fr; }
    .article-body .wh-diagram .wh-flow li + li::before {
      top: -9px;
      left: calc(50% - 3px);
      transform: rotate(135deg);
    }
  }
</style>

They say necessity is the mother of invention. I needed a way to keep tabs on everything I had going on, so I built something that works for me. If you’re struggling to keep track of your own work, it might work for you too.

I called it Work Hub. I can keep adding whatever I need to track and see it on a dashboard. A review request comes with a link and a status. “I’ll get back to you” comes with the private conviction that I’ll remember who *you* is tomorrow. I can put both in the same brief.

When I pick something up again, I want the reason it mattered, the decision I made, and the next action. And if I’ve already shown Claude how I want the brief to work, I’d like to have that conversation once.

## What Work Hub remembers

- **Local Markdown, set up automatically.** On the first Claude Code session after installation, Work Hub adds any missing starter files under `~/.claude/work-hub/`, including its own `CLAUDE.md`, `persona.md`, and `MEMORY.md`.<br>
  It also creates or updates the main `~/.claude/CLAUDE.md` so Claude can find the Work Hub instructions, and leaves any edits you’ve made to the starter files intact. [Session setup](https://github.com/gtrivedi88/work-hub/blob/9bca775/plugins/work-hub/skills/personal-workflow/scripts/personal_workflow.py#L647-L676)

- **Working preferences you can read and edit.** `persona.md` holds how I like to work, and `MEMORY.md` points Claude to project rules, checklists, and lessons it can use again.<br>
  If I correct how Claude handles a release date, it can save the preference during the conversation and tell me which file it changed. [Personalization skill](https://github.com/gtrivedi88/work-hub/blob/9bca775/plugins/work-hub/skills/personalize-workflow/SKILL.md) · [Where I wrote about using a persona file](/taking-yourself-out-of-the-equation/)

<figure class="wh-diagram" aria-labelledby="wh-memory-caption">
  <div class="wh-start">
    <b>Claude Code starts</b><br>
    <code>~/.claude/CLAUDE.md</code> imports the Work Hub instructions.
  </div>
  <span class="wh-arrow" aria-hidden="true">↓</span>
  <p class="wh-folder"><code>~/.claude/work-hub/</code></p>
  <ul class="wh-files" role="list">
    <li><code>CLAUDE.md</code> How Claude should run the brief and handle corrections.</li>
    <li><code>persona.md</code> Preferences I want Claude to use across projects.</li>
    <li><code>MEMORY.md</code> Where to find project rules, checklists, and lessons.</li>
  </ul>
  <figcaption id="wh-memory-caption">The startup hook creates missing starter files. I can open them in an editor and see what Claude will read.</figcaption>
</figure>

Say I tell Claude, “Show me where that release date came from.” If that’s a rule I want it to keep, Claude can save it in my preferences. “The release moved to Friday” belongs with this week’s work.

- **Decisions and their reasons.** For Jira work in the brief, Work Hub can record why it recommended something, what I picked up, and why I explicitly put something off.<br>
  In one test, the history shows why the upgrade guide came up (“Release is approaching”) and why the release notes went back on the list (“Still waiting for engineering”). [Decision history test](https://github.com/gtrivedi88/work-hub/blob/9bca775/tests/test_personal_workflow.py#L499-L507)

- **Where the work went next.** Work Hub keeps the draft stage, the next action I wrote down, and the dependency I’m waiting on for a selected Jira issue.<br>
  Later I can see that the implementation merged and I still need to check the flags in my draft, or see when the docs themselves shipped. [Draft and publication history test](https://github.com/gtrivedi88/work-hub/blob/9bca775/tests/test_personal_workflow.py#L511-L545)

<figure class="wh-diagram" aria-labelledby="wh-flow-caption">
  <ol class="wh-flow" role="list">
    <li>
      <span class="wh-label">First brief</span>
      <b>Upgrade guide comes up</b>
      <p>Work Hub saves “Release is approaching.”</p>
    </li>
    <li class="wh-wait">
      <span class="wh-label">After the first draft</span>
      <b>Wait for the merge</b>
      <p>The saved next action is “Verify flag names.”</p>
    </li>
    <li class="wh-ready">
      <span class="wh-label">Later brief</span>
      <b>Implementation merged</b>
      <p>The draft comes back with the flag check still to do.</p>
    </li>
    <li>
      <span class="wh-label">After publication</span>
      <b>Docs shipped</b>
      <p>The history records the URL of the published guide.</p>
    </li>
  </ol>
  <figcaption id="wh-flow-caption">The upgrade guide in Work Hub’s simulated workflow test, from recommendation to publication.</figcaption>
</figure>

The test also simulates a failed review check. Work Hub says the dependency is unknown and keeps the draft where I left it. When the merge does come through, I can open the diff and check the flags. A green Jira badge is lovely. It has yet to proofread a command. [Workflow test](https://github.com/gtrivedi88/work-hub/blob/9bca775/tests/test_personal_workflow.py#L514-L545)

<figure>
  <img src="/assets/work-hub-dashboard.png" alt="Work Hub inbox with a study session, an upgrade guide task tagged release, and a follow-up from a meeting.">
  <figcaption>My Work Hub dashboard populated with sample tasks.</figcaption>
</figure>

## What Work Hub does

- **Quick capture.** Add a task as soon as it comes to mind, whether it’s a reply you owe, a question you need to ask, or a renewal you want to check.<br>
  Keep a link to the message or meeting note and write down what you need to do next.

- **Daily brief.** Run `/work-hub:personal-workflow` in Claude Code to see connected work alongside your own tasks, agenda, and alerts.<br>
  The brief points to its sources, suggests what to pick up, and shows when a source couldn’t be checked.

- **Connected work.** Pull Jira issues, GitHub and GitLab review requests, and GitLab to-dos into the brief.<br>
  With Slack or AEM connected in Claude Code, the brief can also look at relevant messages or check what’s already published.

- **Personalized dashboard.** Use the list or board to see your inbox, due work, and what’s waiting.<br>
  Edit dates, next actions, reminders, and tags from the dashboard, and use colors to pick out related work.

- **Search and saved views.** Find an old task by its title, tag, or the next action you wrote down.<br>
  Save a view you’ll want again, like upcoming release work, and keep work and personal items in separate workspaces if you prefer.

- **Changes since the last brief.** See which items appeared, changed status, or dropped out of a connected work list.<br>
  Work Hub compares two runs when it had complete results from the same account both times.

- **Task history.** Open an item to see when you added it, what changed, and which links or dependencies you attached.<br>
  A connected ticket or review can keep its own source status alongside the status you set for your work.

- **Projects and checklists.** Group tasks under a project or milestone and see how much is complete or waiting.<br>
  Save a checklist as a template so the next release starts with the steps you already worked out.

- **Dependencies and follow-ups.** Mark work as blocked by another item or set a date to check back.<br>
  For a tracked Jira assignment, the next brief can tell you when a linked issue is done or a code review has merged.

- **Recurring tasks and habits.** Set up work you do every week or a habit you want to check off each day.<br>
  Work Hub keeps the check-in history, including missed habit dates, and brings the current occurrence forward.

- **Reminders and snoozing.** Set a reminder for when you need to act or snooze an item until you’re ready to see it again.<br>
  On macOS, you can opt in to checks at login. You can also run the worker from a terminal.

{% include v2/sponsor-slot.html %}

## What I can check later

- **Agenda and time blocks.** Add an iCalendar feed or file and see your meetings alongside your planned tasks.<br>
  Schedule time for the work and export those dates or time blocks to another calendar.

- **Watches and alerts.** Watch a web page, an RSS feed, a public GitHub release or PR, or a local Radar signal bank.<br>
  Check what changed, when the last successful check ran, and which alerts are still unread. [How I built Radar](/personal-intelligence-system-radar/)

- **Time tracking and weekly review.** Start a timer or log the time you spent, then compare it with your estimate.<br>
  The weekly review shows what you finished, what’s still waiting, what carried over, and how your habits went.

- **Documentation handoff.** Pick a Jira issue in the brief and hand it to the separately installed docs orchestrator to start a draft in your docs checkout.<br>
  Work Hub can bring you back to the draft stage and next action you saved when it’s time to continue. [The documentation workflow I built before Work Hub](/modern-day-technical-writing-is-dead/)

- **Exports and backups.** Export items as Markdown, CSV, JSON, or iCalendar, depending on where you want to use them.<br>
  Back up the tracker, Jira work history, and personal Markdown, and restore them into a fresh profile.

- **Local use and optional connections.** Use `/work-hub:tracker` for tasks, habits, and the dashboard without a `.env` file.<br>
  For connected work, Work Hub can reuse your project or home `.env`. If neither file exists, it shows you the paths and keys to use.

You can try it [here](https://github.com/gtrivedi88/work-hub).

Questions?
