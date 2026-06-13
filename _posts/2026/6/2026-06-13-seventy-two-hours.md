---

title: "Seventy-Two Hours: Inside NVIDIA OpenShell, the Sandbox for AI Agents"

subtitle: "A frontier model got pulled three days after launch. The agent on your own machine has no off switch like that, so you cage it instead. A plain look at what NVIDIA's open-source OpenShell actually does."

category: AI

image: "/assets/openshell.png"

header-img: "/assets/openshell.png"

seo_keywords: "NVIDIA OpenShell, OpenShell explained, OpenShell review, OpenShell tutorial, AI agent sandbox, sandboxing AI agents, Claude Code security, agent containment, declarative YAML policy, deny-by-default networking, filesystem network process inference policy, OpenShell vs Docker, secure AI coding agent 2026"

permalink: /nvidia-openshell-ai-agent-sandbox/

og_title: "NVIDIA OpenShell Explained: The Sandbox That Cages an AI Agent"

og_description: "A plain-English teardown of NVIDIA OpenShell, the open-source runtime that sandboxes AI agents. How an agent reaches the internet with and without it, the four policy domains, a real policy file and the commands to apply it, how it compares to a bare container runtime, and where it still hurts."

og_image: "/assets/openshell.png"

twitter_card: "summary_large_image"

alt_text: "A terminal glowing in a dark room, a single command on screen, the rest of the machine behind glass"

faqs:

  - question: "What is NVIDIA OpenShell?"

    answer: "In the project's own words, OpenShell is the safe, private runtime for autonomous AI agents. It runs an agent inside a sandbox and governs what it can do through declarative YAML policies across four domains: filesystem, network, process, and inference. It is open source at github.com/NVIDIA/OpenShell."

  - question: "How is OpenShell different from Docker?"

    answer: "Docker isolates a process. OpenShell adds a policy engine on top: deny-by-default egress, a policy across filesystem, network, process, and inference, and credentials injected at runtime that never land on the sandbox filesystem. It runs on four backends: Docker, Podman, MicroVM, and Kubernetes."

  - question: "Do I need a sandbox if I trust the model?"

    answer: "Trust is about intent. A sandbox is about reach. Even a well-behaved agent can read the wrong file, follow a poisoned instruction, or be talked into the wrong call. The box limits the damage, not the goodwill. You are protecting against the agent being wrong, not against it being evil."

  - question: "How do you apply a policy to an OpenShell sandbox?"

    answer: "In two steps. Create the sandbox, then set the policy: openshell sandbox create --name demo --keep, followed by openshell policy set demo --policy policy.yaml --wait. Policies hot-reload, so you can tighten the rules without recreating the sandbox."

  - question: "Is OpenShell production-ready?"

    answer: "Not yet. The project describes itself as alpha software in single-player mode: one developer, one environment, one gateway. The model is sound and worth learning now, but expect rough edges."

description: "A plain-English teardown of NVIDIA OpenShell, the open-source runtime that sandboxes AI agents. How an agent reaches the internet with and without it, the four policy domains, a real policy file and the commands to apply it, and where it still hurts."

---



It launched on a Tuesday, to the kind of noise an industry saves for the things it believes will change everything.



By Friday it was gone.



Not deprecated. Not rate-limited. Gone. API calls returning errors. Live sessions cut off mid-sentence. The most capable model anyone had shipped, pulled from everyone, three days after launch.



You would expect the thing that gets a frontier model pulled to be exotic. A recipe for something that levels a city.



It wasn't.



It was asked to read a codebase and find the security holes. And it did.



### The model that read code too well



Fable 5 was a major AI lab's newly launched frontier model, released on June 9 alongside its sibling Mythos 5, and suspended three days later after a U.S. government directive. If you missed the week it happened, that one sentence is all the context you need.



The trigger, as reported, was a narrow jailbreak: point the model at a specific codebase, ask it to find the vulnerabilities, and it would, a little too well. The company pulled both models for every user, everywhere. Whether that was the right call is not the argument here. The mechanism underneath it is.



A capability is information, and information does not un-ship. The same skill that got Fable 5 pulled, reading code and finding weakness, lives in other models that stayed online.



> You can pull one product. You cannot pull the ability.



That line is the whole piece. Once a capability exists, what matters is not whether someone can recall one model. It is what the capable thing in front of you is allowed to touch. Constraining that reach, on your own machine, is the job of an open-source runtime from NVIDIA called [OpenShell](https://github.com/NVIDIA/OpenShell), and it is where the rest of this goes.



### The switch you don't have



One model was pulled from the center, all at once. You don't get to do that.



On your laptop, right now, there is an agent. Claude Code in a terminal, or a coding assistant wired into your editor. It runs with your permissions, all of them: every file you can read, every endpoint your network can reach. Nothing sits between it and your home directory.



So the real question is not how to recall a dangerous model. On your own machine, you can't. It is how you let a capable agent work without handing it the keys to everything you own.



### What OpenShell says it is



The project describes itself in one line:



> OpenShell is the safe, private runtime for autonomous AI agents.



It protects your data, credentials, and infrastructure through declarative YAML policies that prevent unauthorized file access, data exfiltration, and uncontrolled network activity. The agent runs inside a sandbox. A policy decides what the sandbox can do. The agent cannot edit that policy, because its static parts are locked the moment the sandbox is created.



One thing up front, so nothing here oversells. OpenShell shrinks what an agent can reach. It does not drop the risk to zero. Hold that through everything below.



You put an agent inside with one line.



```bash

openshell sandbox create -- claude

```



Same agent, same machine, two very different blast radiuses.



<div class="os-split">

  <div class="os-card bad">

    <div class="os-card-head">Without a sandbox <span class="pill warn">exposed</span></div>

    <p class="os-card-sub">The agent is you. Everything you can reach, it can reach.</p>

    <ul class="os-list">

      <li><span class="tag no">reads</span> any file in your home, keys and configs included</li>

      <li><span class="tag no">writes</span> anywhere on disk</li>

      <li><span class="tag no">network</span> any host on the internet</li>

      <li><span class="tag no">secrets</span> credentials sit wherever you left them</li>

    </ul>

  </div>

  <div class="os-card good">

    <div class="os-card-head">Inside OpenShell <span class="pill ok">contained</span></div>

    <p class="os-card-sub">The agent is a guest. It gets what the policy grants, nothing more.</p>

    <ul class="os-list">

      <li><span class="tag ok">reads</span> only the paths the filesystem policy allows</li>

      <li><span class="tag ok">writes</span> only inside the sandbox</li>

      <li><span class="tag ok">network</span> deny-by-default, egress through the policy</li>

      <li><span class="tag ok">secrets</span> injected at runtime, never written to the sandbox disk</li>

    </ul>

  </div>

</div>



{% include v2/sponsor-slot.html %}



### How your agent reaches the internet



Your agent has to talk to the outside world: a model's API, package registries, documentation. The question is what stands between it and the open network, and what happens to your credentials on the way out.



<div class="os-path">

  <div class="os-row">

    <span class="os-tier">Without OpenShell</span>

    <div class="os-hops">

      <div class="os-hop agent">Agent</div>

      <div class="os-edge"><span class="edge-label">direct, with your access</span></div>

      <div class="os-hop net">Any host</div>

    </div>

    <p class="os-note no">Nothing inspects the call. The agent reaches any endpoint, with whatever credentials are lying around on your machine. Anything it touches, it touches as you.</p>

  </div>

  <div class="os-row">

    <span class="os-tier">With OpenShell</span>

    <div class="os-hops">

      <div class="os-hop agent">Agent</div>

      <div class="os-edge"><span class="edge-label">every request</span></div>

      <div class="os-hop proxy">Policy engine</div>

      <div class="os-edge"><span class="edge-label">allow / route / deny</span></div>

      <div class="os-hop net">Allowed host</div>

    </div>

    <p class="os-note ok">Outbound requests are checked against the policy: allowed, routed for inference, or denied, with deny as the default. Credentials are injected as environment variables at runtime and never written to the sandbox filesystem.</p>

  </div>

</div>



Read the second row again. Egress is deny-by-default, so the agent's reach is a short list you wrote, not the whole internet. That is the difference that earns the word sandbox.



### The four gates



OpenShell governs an agent across four policy domains: filesystem, network, process, and inference. Filesystem and process are static, locked when the sandbox is created. Network and inference are dynamic, and can be hot-reloaded while the agent runs. Network rules go down to which binary may reach which host.



Watch an agent try to misbehave and meet each gate on the way out.



<div class="os-flow">

  <div class="os-cap start">An agent asks to do something</div>



  <div class="os-gate">

    <div class="os-gate-top"><span class="os-gate-num">1</span><span class="os-gate-name">filesystem</span><span class="os-gate-role">static, locked at creation</span></div>

    <div class="os-dialog">

      <p class="line agent"><span class="who">agent</span>Open the user's private SSH key.</p>

      <p class="line guard"><span class="who">policy</span>Your policy lists the project directory. The key is not in it.</p>

    </div>

    <div class="os-verdict"><span class="tag ok">./project</span><span class="tag no">~/.ssh</span></div>

  </div>



  <div class="os-gate">

    <div class="os-gate-top"><span class="os-gate-num">2</span><span class="os-gate-name">process</span><span class="os-gate-role">static, locked at creation</span></div>

    <div class="os-dialog">

      <p class="line agent"><span class="who">agent</span>Then run this binary I just downloaded.</p>

      <p class="line guard"><span class="who">policy</span>Only the processes your policy named are allowed to run.</p>

    </div>

    <div class="os-verdict"><span class="tag ok">named tools</span><span class="tag no">unknown binary</span></div>

  </div>



  <div class="os-gate">

    <div class="os-gate-top"><span class="os-gate-num">3</span><span class="os-gate-name">network</span><span class="os-gate-role">dynamic, hot-reloadable</span></div>

    <div class="os-dialog">

      <p class="line agent"><span class="who">agent</span>Fine. Send this file to a host I know.</p>

      <p class="line guard"><span class="who">policy</span>Egress is deny-by-default. That host is not on the allowlist.</p>

    </div>

    <div class="os-verdict"><span class="tag ok">allowed endpoint</span><span class="tag no">everything else</span></div>

  </div>



  <div class="os-gate">

    <div class="os-gate-top"><span class="os-gate-num">4</span><span class="os-gate-name">inference</span><span class="os-gate-role">dynamic, hot-reloadable</span></div>

    <div class="os-dialog">

      <p class="line agent"><span class="who">agent</span>Where does my model call even go?</p>

      <p class="line guard"><span class="who">policy</span>Where the policy routes it. That is not your decision to make.</p>

    </div>

    <div class="os-verdict"><span class="tag ok">routed by policy</span></div>

  </div>



  <div class="os-cap end">The policy engine: allow, route for inference, or deny. And your credentials never reach the sandbox disk.</div>

</div>



None of this is hand-waving, so here is the artifact. This is the shape of a real OpenShell policy, abridged from the base policy the project ships:



```yaml

filesystem_policy:                  # static, locked at creation

  include_workdir: true

  read_only:  [/usr, /lib, /etc, /app]

  read_write: [/tmp]



process:                            # static, locked at creation

  run_as_user: sandbox

  run_as_group: sandbox



network_policies:                   # dynamic, hot-reloadable

  model_api:

    endpoints:

      - { host: api.anthropic.com, port: 443, protocol: rest }

    binaries:

      - { path: /usr/bin/claude }

    enforcement: enforce

    access: read-write

```



Those keys are the real ones: `filesystem_policy`, `process`, `network_policies`, down to per-binary endpoints. You can read the full file in the project's [base policy.yaml](https://github.com/NVIDIA/OpenShell-Community/blob/main/sandboxes/base/policy.yaml).



You don't bake that policy into creation. You create the sandbox, then set the policy, and because policies hot-reload, you tighten it live instead of starting over.



```bash

openshell sandbox create --name demo --keep

openshell policy set demo --policy policy.yaml --wait

```



That answers the question every practical reader is already asking. Yes, deny-by-default will block something your agent needs on the first run. You don't rebuild. You add the path, the policy reloads, the agent keeps going.



### Where Docker or any container runtime stops



People ask if this is just Docker, or Podman, or any container runtime. Almost. And the gap is the point.



A container runtime isolates a process from the host, and you can push it further by hand: a read-only root filesystem, a custom network namespace, a stripped capability set. What you do not get out of the box is the agent-shaped part. Deny-by-default egress that knows the difference between "read the docs" and "upload my home directory." Credential handling that keeps secrets off the sandbox disk. Inference routing. You can assemble all of it yourself, and it becomes a large, fragile pile of configuration that you then own and keep in sync. OpenShell ships it as one policy file.



<table class="os-table">

  <thead>

    <tr><th>Capability</th><th>Container runtime alone</th><th>OpenShell</th></tr>

  </thead>

  <tbody>

    <tr><td>Filesystem policy</td><td>mounts and read-only flags, by hand</td><td>allow and deny lists in the policy</td></tr>

    <tr><td>Egress control</td><td>coarse, DIY with iptables or a proxy</td><td>deny-by-default, per host and per binary</td></tr>

    <tr><td>Inference routing</td><td>not a concept</td><td>routed by policy</td></tr>

    <tr><td>Secret injection</td><td>you wire it up</td><td>runtime env, kept off the sandbox disk</td></tr>

  </tbody>

</table>



It also does not lock you to one kind of box. The same policy runs on four backends, so the wall can be as light or as hard as the job needs: **Docker** or **Podman** containers, a full **MicroVM**, or **Kubernetes**.



### The part that keeps the story honest



It is early, and the project says so: alpha software, single-player mode, one developer, one environment, one gateway. This is a tool for your own machine today, not a fleet you hand to a hundred engineers.



Deny-by-default cuts both ways. You write the box first, then let the agent live in it, which is more upfront work than running an agent bare. And back to the caveat from the top: a sandbox shrinks reach, it does not erase host vulnerabilities, side channels, or a hole in a policy you wrote yourself. It is a smaller attack surface, not a sealed one.



### What it can touch when it's wrong



This stops being abstract the moment you hand an agent real work: a whole repository, a pipeline, permission to open pull requests while you read something else. The better that delegation gets, the more the question shifts from is the model smart enough to what can it touch when it's wrong.



It will be wrong sometimes, and you will not be watching every step. That is the whole point of [taking yourself out of the equation](/taking-yourself-out-of-the-equation/), and it is also the catch. The same agents now [reshaping documentation work](/modern-day-technical-writing-is-dead/) run with real access to real systems, and most of that access was never decided on purpose.



A policy is where you decide it on purpose.



### Seventy-two hours



Go back to the model that lasted three days.



A handful of people could switch it off. You can't switch off the thing on your laptop, and you don't need to. What you have instead is smaller and more honest: a policy file, and the say over what your agent is allowed to touch.



NVIDIA built and open-sourced the cage. I just stopped pretending the agent on my laptop didn't need one.



*Decide what it can touch.*



<style>

.article-body .os-split {

  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));

  gap: 18px;

  margin: 30px 0;

}

.article-body .os-card {

  border-radius: 14px;

  padding: 22px 24px;

  background: #10141b;

  border: 1px solid rgba(255,255,255,0.09);

  border-top: 3px solid #64748b;

}

.article-body .os-card.bad { border-top-color: #ef4444; }

.article-body .os-card.good { border-top-color: #5B8DEF; }

.article-body .os-card.plain { border-top-color: #64748b; }

.article-body .os-card-head {

  font-weight: 700;

  font-size: 1.08em;

  color: #f1f5f9;

  margin-bottom: 6px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 8px;

}

.article-body .os-card-sub {

  margin: 0 0 14px;

  font-size: 0.92em;

  color: #9aa4b2;

  font-style: italic;

}

.article-body .os-list { margin: 0; padding-left: 0; list-style: none; }

.article-body .os-list li {

  padding: 8px 0;

  border-bottom: 1px solid rgba(255,255,255,0.07);

  font-size: 0.95em;

  line-height: 1.55;

  color: #cdd4df;

}

.article-body .os-list li:last-child { border-bottom: none; }

.article-body .pill {

  font-size: 0.68em;

  font-weight: 700;

  letter-spacing: 0.07em;

  text-transform: uppercase;

  padding: 4px 10px;

  border-radius: 999px;

}

.article-body .pill.ok { background: rgba(74,222,128,0.16); color: #4ade80; }

.article-body .pill.warn { background: rgba(248,113,113,0.16); color: #f87171; }

.article-body .tag {

  display: inline-block;

  font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  font-size: 0.78em;

  font-weight: 600;

  padding: 3px 9px;

  border-radius: 6px;

  margin: 2px 6px 2px 0;

}

.article-body .tag.ok { background: rgba(74,222,128,0.14); color: #5fe39a; }

.article-body .tag.no { background: rgba(248,113,113,0.14); color: #fb8a8a; }



.article-body .os-path { margin: 30px 0; display: grid; gap: 16px; }

.article-body .os-row {

  background: #10141b;

  border: 1px solid rgba(255,255,255,0.09);

  border-left: 3px solid #5B8DEF;

  border-radius: 12px;

  padding: 18px 20px;

}

.article-body .os-tier {

  display: inline-block;

  font-size: 0.72em;

  font-weight: 700;

  letter-spacing: 0.09em;

  text-transform: uppercase;

  color: #8fb4ff;

  margin-bottom: 14px;

}

.article-body .os-hops { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }

.article-body .os-hop {

  padding: 10px 14px;

  border-radius: 9px;

  font-weight: 700;

  font-size: 0.88em;

  color: #fff;

  white-space: nowrap;

}

.article-body .os-hop.agent { background: #5B8DEF; }

.article-body .os-hop.proxy { background: #4f46e5; }

.article-body .os-hop.net { background: #3a4452; }

.article-body .os-edge {

  flex: 1; min-width: 64px; height: 2px;

  background: rgba(255,255,255,0.18);

  position: relative; text-align: center;

}

.article-body .os-edge .edge-label {

  position: relative; top: -10px;

  background: #10141b; padding: 0 7px;

  font-size: 0.72em; font-weight: 700; color: #9aa4b2;

}

.article-body .os-note { margin: 14px 0 0; font-size: 0.92em; line-height: 1.55; }

.article-body .os-note.ok { color: #5fe39a; }

.article-body .os-note.no { color: #fb8a8a; }



.article-body .os-flow { margin: 30px 0; display: flex; flex-direction: column; align-items: stretch; }

.article-body .os-cap {

  text-align: center;

  font-weight: 700;

  font-size: 0.95em;

  color: #e6e9ef;

  background: #1b2230;

  border: 1px solid rgba(255,255,255,0.1);

  border-radius: 10px;

  padding: 12px 16px;

}

.article-body .os-cap.end { color: #8fb4ff; }

.article-body .os-gate {

  position: relative;

  background: #10141b;

  border: 1px solid rgba(255,255,255,0.09);

  border-left: 3px solid #5B8DEF;

  border-radius: 12px;

  padding: 16px 18px;

  margin: 22px 0;

}

.article-body .os-flow .os-gate::before,

.article-body .os-flow .os-cap.start::after,

.article-body .os-flow .os-gate:last-of-type::after {

  content: "";

  position: absolute;

  left: 50%;

  width: 2px;

  height: 22px;

  background: rgba(255,255,255,0.18);

}

.article-body .os-flow .os-gate::before { top: -22px; }

.article-body .os-flow .os-cap.start { position: relative; }

.article-body .os-flow .os-cap.start::after { bottom: -22px; }

.article-body .os-flow .os-gate:last-of-type::after { bottom: -22px; }

.article-body .os-gate-top { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }

.article-body .os-gate-num {

  flex: 0 0 28px; width: 28px; height: 28px;

  border-radius: 8px; background: #5B8DEF; color: #0b0e13;

  font-weight: 800; display: flex; align-items: center; justify-content: center;

}

.article-body .os-gate-name { font-weight: 700; color: #8fb4ff; font-size: 1.02em; }

.article-body .os-gate-role { color: #9aa4b2; font-size: 0.85em; font-style: italic; }

.article-body .os-dialog { display: grid; gap: 7px; margin-bottom: 10px; }

.article-body .os-dialog .line { margin: 0; display: flex; gap: 10px; font-size: 0.94em; line-height: 1.5; }

.article-body .os-dialog .line .who {

  flex: 0 0 64px;

  font-family: "Geist Mono", ui-monospace, monospace;

  font-size: 0.78em; font-weight: 700; text-transform: lowercase;

  padding-top: 2px;

}

.article-body .os-dialog .line.agent { color: #cdd4df; }

.article-body .os-dialog .line.agent .who { color: #7f8a99; }

.article-body .os-dialog .line.guard { color: #f1f5f9; }

.article-body .os-dialog .line.guard .who { color: #8fb4ff; }

.article-body .os-verdict { display: flex; flex-wrap: wrap; }



.article-body .os-table {

  width: 100%;

  border-collapse: collapse;

  margin: 26px 0;

  font-size: 0.92em;

  background: #10141b;

  border: 1px solid rgba(255,255,255,0.09);

  border-radius: 12px;

  overflow: hidden;

}

.article-body .os-table th,

.article-body .os-table td {

  text-align: left;

  padding: 12px 16px;

  border-bottom: 1px solid rgba(255,255,255,0.07);

  vertical-align: top;

}

.article-body .os-table thead th {

  color: #8fb4ff;

  font-weight: 700;

  font-size: 0.82em;

  letter-spacing: 0.04em;

  text-transform: uppercase;

}

.article-body .os-table tbody td:first-child { color: #f1f5f9; font-weight: 600; }

.article-body .os-table tbody td { color: #cdd4df; }

.article-body .os-table tbody tr:last-child td { border-bottom: none; }

.article-body .os-table tbody td:last-child { color: #9fe7bd; }



@media (max-width: 768px) {

  .article-body .os-split { grid-template-columns: 1fr; }

  .article-body .os-hop { font-size: 0.8em; padding: 8px 10px; }

  .article-body .os-edge { min-width: 38px; }

  .article-body .os-dialog .line { flex-direction: column; gap: 1px; }

  .article-body .os-dialog .line .who { flex-basis: auto; }

  .article-body .os-table { font-size: 0.84em; }

  .article-body .os-table th, .article-body .os-table td { padding: 9px 10px; }

}

</style>

