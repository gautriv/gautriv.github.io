---
subject: The fetch that lied
preheader: A field note from two issues ahead of where you are.
transmission: 1
fragment: the writer
published: false
---

The pipeline was green. Every check passed. And the docs described a feature that no longer existed.

## Where the truth fell out

The writer step went to pull the latest spec. The fetch hit a rate limit and quietly fell back to last sprint's cache. Nothing in the run said so. The review step read the same stale spec and approved it.

> Fetching is not verifying.

So here is the move for this week, in order:

- Add one check the agent cannot override.
- Stop letting the agent grade its own homework.
- Carry the source and verification status with the draft through every handoff.

That is the whole game. The model proposes. A check you wrote decides.

_// transmitting from two issues ahead_
