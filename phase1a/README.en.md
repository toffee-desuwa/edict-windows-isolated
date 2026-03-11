# Phase 1A — Chancellor + Drafter Minimal Slice

This document is the public-safe English README for Phase 1A. This phase is an `experiment-chancellor-phase1a` direction grown on top of the Edict fork baseline. It is intended to validate a minimal collaboration mechanism, not to expand into a complete system in one step. It does not replace `main`, and it does not rewrite the original fork's Windows isolated-install MVP assets.

Phase 1A validates only the minimal collaboration chain between Chancellor and Drafter:

User -> Chancellor -> Drafter -> Chancellor -> User

Within this chain, the Chancellor receives requests, determines scope, extracts constraints, issues the `BRIEF`, reviews the `DRAFT`, and returns the `FINAL`. The Drafter is responsible for producing a bounded draft from the `BRIEF` and handing it back. The purpose of this phase is to verify that the chain works, that the role boundary is clear, and that the result is reviewable, rather than to maximize feature coverage.

This minimal collaboration chain has been validated in both the local UI and Feishu.

Validated content:

- 3 supported examples:
- short outline
- short explanation
- short reply draft
- 1 out-of-scope rejection example
- All supported examples completed the full flow:
  `BRIEF -> DRAFT -> FINAL`

Why this matters: this step shows that a verifiable collaboration mechanism matters more than a thematic naming shell. By Phase 1A, the work already forms a minimal two-agent slice that can be demonstrated and explained publicly.

Non-goals:

- not a full institution
- not six departments fully enabled
- not full Windows parity
- not an official version
- not a replacement for `main`
