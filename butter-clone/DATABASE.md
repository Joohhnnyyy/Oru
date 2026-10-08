# Database Decisions & Conventions

- 2026-10-07: Scroll progress, pointer parallax, reveal state, and media playback remain ephemeral client-side state with no persistence. These values are transient UI behavior and do not need to survive reloads or be shared across users.
- 2026-10-07: Homepage animation state remains client-side and does not require persistence; keep animation implementation independent of database storage.
