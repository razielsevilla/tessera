# Known Bugs (P2 & Below)

This document tracks known non-critical bugs (P2 and below) that are deferred until after the public launch. All P0 (Critical/Blocker) and P1 (High/Must-Fix) bugs have been resolved as part of the Phase 8 Hardening & Security Audit.

## P2 Bugs (Requires attention, but not blockers for launch)
- **UI/UX**: The `MosaicCanvas` occasionally flickers when resizing the browser window rapidly on Safari.
- **Wallet**: If Phantom wallet auto-locks while the mint transaction is signing, the error message returned is generic instead of prompting the user to unlock.
- **Performance**: The yearly mosaic zoom animation drops frames on mid-tier Android devices when rendering all 365 textured tiles.
- **Data Persistence**: Offline-first IndexedDB cache eviction sometimes triggers a noisy warning in the console if the tab is closed mid-sync (data remains safe).
