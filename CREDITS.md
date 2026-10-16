# Credits & provenance

- Original: [Kenton-GMI/sakura-crossing](https://github.com/Kenton-GMI/sakura-crossing).
- Source commit: `de01898e89c7f6ab3fad93fa802f0f5ac66fbd81`.
- Copyright © 2026 Kenton Wang. Original MIT notice retained verbatim in `LICENSE`.
- The original town, procedural architecture/foliage/textures, cel shading, planet projection, train and crossing sequence, collision system, first-person camera, interactions and e-bike are upstream work.
- Pixtra Interactive added the Sakura Quest presentation, five animated blossom tokens, proximity collection, directional destination guidance, active-play timer, completion/free-explore screen and restart; English objective text, responsive menu, favicon and credits. A no-op unsupported toon material property was removed to eliminate inherited warnings. Transitive build-tool vulnerabilities were patched within the original dependency ranges.

## Asset and audio audit

All retained scene art is created by source code or runtime Canvas2D, using system fonts. There are no downloaded models, image texture files or external fonts to license separately.

**Removed:** `public/audio/bfcmusic-divine-sakura-garden-fairytale-music-283353.mp3`. The upstream documentation excludes this stock track from the MIT grant. It is absent from this clean repository and every commit in its history. The playlist is empty; an Audio element has no source or preload when no tracks exist. No replacement or commercial soundtrack is supplied. The original music API remains safe with an empty playlist; music UI is hidden.

`LICENSE` covers the original code, not third-party music you might add. Only add audio whose license independently permits redistribution. Third-party dependency notices remain in their package distributions. Local adaptation screenshots live in `docs/`.
