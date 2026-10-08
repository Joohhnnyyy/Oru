# Document synthesis

## Classified inputs
- Documents synthesized: 1
- SPEC: 1 — `C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md`
- ADR, PRD, DOC, UNKNOWN: 0
- Referenced migration documents consulted: `migration-docs/layout.md`, `migration-docs/animations.md`, `migration-docs/assets.md`, and `migration-docs/design-tokens.md`.
- The classified source is high-confidence SPEC with per-document precedence override 1; it is not locked.
- Cross-reference cycle check: no cycle among the classified documents. The four source references are the migration documents above.
- `.planning/STATE.md` was absent when checked; there was no STATE scope text to apply.

## Extracted intel
- Locked decisions: 0; no ADRs were classified.
- Requirements: 0; no PRDs were classified. See `requirements.md`.
- Constraints: 7 total — 3 schema, 3 protocol, 1 nfr; 0 api-contract.
- Context topics: 0; no DOCs were classified. See `context.md`.
- Per-type files: `decisions.md`, `requirements.md`, `constraints.md`, `context.md`.

## Website animation and asset scope; source gaps
- Animation work covers the page's section-specific reveals, scrolling, pinning, hover, carousel, video playback and 3D hero behavior, with reduced-motion support. The migration catalog supplies extracted behavior for many effects, but identifies some observed/tune-by-eye behavior and missing Lenis option values. The 3D keychain physics choice remains open because Rapier is outside the approved dependency list.
- Asset work covers local images, logos, videos, keychain models and Draco decoder files, including extraction and deduplication of embedded clips. The source inventory describes 51 embedded video files and 33 unique mp4s. The repository currently lacks `reference/`, `reference/index.html`, and `reference/marketing-assets`, so the specified source assets cannot presently be copied or extracted.
- The original SPEC section inventory is superseded by its own §12 correction and the linked layout inventory: these describe 15 blocks rather than the earlier 11 and clarify changed section behaviors. Animation specifics and asset inventory are grounded in the linked migration documents; open or observed gaps are retained rather than filled in by assumption.

## Conflict counts and outputs
- Conflicts: 0 blockers, 0 competing variants, 0 auto-resolved; 2 warnings (missing referenced asset source; unresolved Rapier decision).
- Conflict detail: `C:/Users/Asmi/OneDrive/Desktop/oru/.planning/INGEST-CONFLICTS.md`.
- Intel directory: `C:/Users/Asmi/OneDrive/Desktop/oru/.planning/intel/`.
