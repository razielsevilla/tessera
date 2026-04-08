# 🗓️ Tessera — Development Phases

> A structured, milestone-driven roadmap from cryptographic foundations to full mosaic deployment.
> Each phase builds on the last and must pass its **Definition of Done** before the next begins.

---

## Table of Contents

- [Phase Overview](#phase-overview)
- [Phase 0 — Foundation & Scaffolding](#phase-0--foundation--scaffolding)
- [Phase 1 — Encryption Engine](#phase-1--encryption-engine)
- [Phase 2 — Off-Chain Vault Integration](#phase-2--off-chain-vault-integration)
- [Phase 3 — Smart Contract Core](#phase-3--smart-contract-core)
- [Phase 4 — Frontend Dashboard MVP](#phase-4--frontend-dashboard-mvp)
- [Phase 5 — Tracking Modules](#phase-5--tracking-modules)
- [Phase 6 — Mosaic & Visual System](#phase-6--mosaic--visual-system)
- [Phase 7 — ZK Proof Integration](#phase-7--zk-proof-integration)
- [Phase 8 — Hardening & Security Audit](#phase-8--hardening--security-audit)
- [Phase 9 — Public Launch](#phase-9--public-launch)
- [Summary Table](#summary-table)

---

## Phase Overview

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3

                │                        │
                └────── Phase 4 ◄────────┘
                              │
                         Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8 ──► Phase 9
```

---

## Phase 0 — Foundation & Scaffolding

**Goal:** Establish the monorepo, tooling, and development environment so every subsequent phase has a clean, consistent base.

**Duration Estimate:** 1–2 weeks

### Checklist — Definition of Done

- [x] Monorepo initialized with `pnpm workspaces` (packages: `contracts`, `engine`, `app`, `shared`)
- [x] Rust toolchain installed (`rustup`, `cargo`, `wasm-pack`)
- [x] Solana CLI or Substrate node configured and running locally
- [x] Next.js 14 app bootstrapped with TypeScript, ESLint, Prettier
- [x] Shared TypeScript types package created (`@tessera/types`)
- [x] CI pipeline set up (GitHub Actions: lint, type-check, test on PR)
- [x] `.env.example` with all required environment variables documented
- [x] `README.md` draft committed
- [x] Git branching strategy documented (`main`, `develop`, `feat/*`, `fix/*`)
- [x] All team members able to run `pnpm dev` and see the app shell

---

## Phase 1 — Encryption Engine

**Goal:** Build the client-side Rust/WASM cryptographic engine that encrypts raw vault data and compiles the Bundled Metadata Payload (BMP).

**Duration Estimate:** 3–4 weeks

### Checklist — Definition of Done

- [x] Rust crate `tessera-engine` created in `packages/engine/`
- [x] AES-256-GCM encryption/decryption of arbitrary JSON blobs implemented
- [x] HKDF-based key derivation from wallet signing key implemented
- [x] Poseidon hash function integrated for ZK-compatible module score commitments
- [x] BMP struct defined and serialized to compact binary (< 256 bytes)
- [x] Ed25519 signature verification logic implemented
- [x] `wasm-pack build` produces working WASM module
- [x] TypeScript wrapper package (`@tessera/engine`) created
- [x] Unit tests: encryption round-trip, BMP serialization, hash determinism
- [x] Integration test: encrypt → serialize BMP → verify signature → deserialize
- [x] No raw secrets leak to `console.log` in any test output

---

## Phase 2 — Off-Chain Vault Integration

**Goal:** Implement the IPFS/Arweave upload pipeline that stores encrypted vault blobs and returns CIDs for BMP inclusion.

**Duration Estimate:** 2–3 weeks

### Checklist — Definition of Done

- [x] Pinata (or Web3.Storage) SDK integrated in `packages/app/`
- [x] `uploadVaultBlob(encryptedData: Uint8Array): Promise<string>` implemented and tested
- [x] Arweave upload client implemented as a secondary/archive path
- [x] CID is deterministically included in BMP before signing
- [x] Vault blob download + decryption flow implemented (`fetchAndDecryptVault(cid, key)`)
- [x] Offline-first fallback: encrypted IndexedDB local cache when IPFS unavailable
- [x] Integration test: upload blob → get CID → fetch CID → decrypt → original data matches
- [x] IPFS gateway rate-limit handling and retry logic implemented
- [x] No plaintext personal data included in any IPFS upload

---

## Phase 3 — Smart Contract Core

**Goal:** Write, test, and deploy the Tessera minting smart contract on a local devnet.

**Duration Estimate:** 4–5 weeks

### Checklist — Definition of Done

- [x] Rust smart contract written in `packages/contracts/` (Solana Anchor or Ink!)
- [x] `mint_tessera(payload: BundledMetadataPayload)` instruction implemented
- [x] One-mint-per-day-per-wallet enforcement logic implemented and tested
- [x] Ed25519 payload signature verification within the contract
- [x] `UserProfile` account: streak counter, total mints, highest frame tier
- [x] `TesseraAccount` account: full BMP, minting timestamp, wallet owner
- [x] `MilestoneAccount`: skill tier unlock records
- [x] `TesseraMinted` event emitted on success
- [x] Local devnet deployment script (`scripts/deploy.ts`) working
- [x] Unit tests covering: happy path, double-mint rejection, wrong-date rejection, bad signature rejection
- [x] Contract bytecode size within network limits
- [x] Anchor IDL (or Ink! metadata) generated and committed to repo

---

## Phase 4 — Frontend Dashboard MVP

**Goal:** Build the foundational Next.js frontend that connects wallet, displays the tessera grid, and handles the daily minting flow end-to-end.

**Duration Estimate:** 3–4 weeks

### Checklist — Definition of Done

- [x] Wallet adapter integrated (Phantom for Solana / Polkadot.js for Substrate)
- [x] `WalletProvider` context wraps app; connect/disconnect UI implemented
- [x] `MosaicCanvas` renders a 365-slot grid (empty + filled states)
- [x] `TesseraCell` renders visual properties from on-chain BMP metadata
- [x] On-chain tessera history fetched and rendered for connected wallet
- [x] "Mint Today" flow: form → engine → IPFS upload → contract call → grid update
- [x] Loading, error, and success states for all async operations
- [x] Responsive layout for desktop and tablet viewports
- [x] Dark mode default with theme toggle
- [x] E2E test (Playwright): connect wallet (mock) → fill form → submit → new tile appears

---

## Phase 5 — Tracking Modules

**Goal:** Implement all four core tracking modules as structured data entry forms that feed the encryption engine.

**Duration Estimate:** 4–5 weeks

### Checklist — Definition of Done

**Sprint & Project Module**
- [x] Task completion tracker with point weights implemented
- [x] Milestone and sprint retrospective logging
- [x] Life economy (household gamification) task list
- [x] Module score formula documented and unit-tested

**Media & Literature Module**
- [x] Book/story log with genre tags and progress tracking
- [x] Interactive fiction branching choice logger
- [x] Trope and pacing metadata fields
- [x] Session duration tracking

**Social Battery Module**
- [x] Mood baseline slider (1–10)
- [x] External engagement counter (meetings, calls, managed teams)
- [x] Social recharge/drain event logging
- [x] Correlation metadata (mood delta vs. engagement count)

**Skills & Skill Tree Module**
- [x] Per-skill daily hours logger
- [x] Skill tree node graph UI (visual dependency map)
- [ ] Total accumulated hours tracked per skill
- [ ] Milestone threshold definitions (e.g., Bronze at 10hrs/Rust)

**Cross-Module**
- [ ] All module schemas validated by shared Zod schemas (`@tessera/types`)
- [ ] All module data is encrypted before leaving the browser
- [ ] Module scores feed correctly into BMP hash computation

---

## Phase 6 — Mosaic & Visual System

**Goal:** Implement the complete visual property rendering system that translates on-chain BMP metadata into rich, animated tessera tiles.

**Duration Estimate:** 3–4 weeks

### Checklist — Definition of Done

- [ ] Color mapping algorithm: mood/social-battery → HSL color implemented
- [ ] Glow/opacity intensity mapped from productivity score
- [ ] Border/frame tier system: None → Bronze → Silver → Gold → Legendary
- [ ] Texture/pattern system: at least 5 distinct patterns for media genre types
- [ ] Tile animation: subtle pulse on hover, glow on mint confirmation
- [ ] Yearly mosaic zoom: from full-year view to single-day tile drill-down
- [ ] Visual legend/key component explaining all tile properties
- [ ] Streak indicators on consecutive minted days
- [ ] Export mosaic as PNG/SVG (client-side canvas rendering)
- [ ] Visual regression tests: snapshot tests for each tile variant

---

## Phase 7 — ZK Proof Integration *(Optional / Advanced)*

**Goal:** Integrate optional Zero-Knowledge proofs to allow users to prove achievement thresholds (e.g., "I studied Rust for 50+ hours") without revealing raw data.

**Duration Estimate:** 4–6 weeks

### Checklist — Definition of Done

- [ ] ZK circuit defined for threshold proof (e.g., `hours_studied >= threshold`)
- [ ] Proving key and verification key generated and committed
- [ ] Client-side proof generation integrated into engine WASM module
- [ ] Contract verifier for ZK proofs implemented
- [ ] Proof reference stored in BMP `zk_proof_ref` field
- [ ] UI: "Share Achievement" flow generates and displays shareable ZK proof link
- [ ] Proof verification widget embeddable in external pages
- [ ] Security review: no information leakage from proof parameters

---

## Phase 8 — Hardening & Security Audit

**Goal:** Conduct a full security review, performance optimization, and bug squash pass before public launch.

**Duration Estimate:** 3–4 weeks

### Checklist — Definition of Done

- [ ] Smart contract formal audit completed (internal or third-party)
- [ ] Encryption engine penetration test: avalanche effect, differential analysis
- [ ] IPFS upload TLS/HTTPS enforced; no plaintext API calls
- [ ] Gas/compute unit optimization pass on all contract instructions
- [ ] Frontend Content Security Policy (CSP) headers configured
- [ ] Dependency vulnerability scan (`pnpm audit`): all HIGH/CRITICAL resolved
- [ ] No secret keys in git history (gitleaks scan passes)
- [ ] Load test: 1,000 concurrent wallet connections handled gracefully
- [ ] Error monitoring (Sentry or equivalent) integrated
- [ ] All P0 and P1 bugs resolved; known P2 bugs documented

---

## Phase 9 — Public Launch

**Goal:** Deploy to mainnet, configure production infrastructure, and open Tessera to the public.

**Duration Estimate:** 2–3 weeks

### Checklist — Definition of Done

- [ ] Smart contract deployed to mainnet (Solana mainnet-beta or Polkadot parachain)
- [ ] Arweave permanent storage configured for production uploads
- [ ] Frontend deployed to Vercel/Cloudflare Pages with custom domain
- [ ] CDN + WASM caching headers configured for engine bundle
- [ ] Environment variables validated in all production environments
- [ ] On-chain explorer link integrated (Solscan / Subscan)
- [ ] Documentation site live (`docs.tessera.app` or equivalent)
- [ ] Public announcement post drafted (Twitter/X thread, blog post)
- [ ] Community Discord/Telegram channel open for support
- [ ] Post-launch monitoring dashboard active (uptime, error rate, mint volume)

---

## Summary Table

| Phase ID | Name | Description | Key Deliverable | Estimated Duration |
|---|---|---|---|---|
| 0 | Foundation & Scaffolding | Monorepo, tooling, CI/CD setup | Working dev environment | 1–2 weeks |
| 1 | Encryption Engine | Rust/WASM crypto engine + BMP compiler | `tessera-engine` WASM package | 3–4 weeks |
| 2 | Off-Chain Vault | IPFS/Arweave encrypted blob pipeline | Upload + fetch + decrypt flow | 2–3 weeks |
| 3 | Smart Contract Core | Rust contract: mint, verify, enforce rules | Devnet-deployed contract | 4–5 weeks |
| 4 | Frontend Dashboard MVP | Next.js app, wallet connect, mosaic grid | End-to-end minting flow | 3–4 weeks |
| 5 | Tracking Modules | All 4 data modules: sprint, media, social, skills | Full module form suite | 4–5 weeks |
| 6 | Mosaic & Visual System | Dynamic tile rendering from BMP metadata | Animated yearly mosaic canvas | 3–4 weeks |
| 7 | ZK Proof Integration | Optional: threshold proofs without data exposure | Shareable ZK achievement links | 4–6 weeks |
| 8 | Hardening & Security Audit | Full audit, optimizations, bug fixes | Audit report + zero P0 bugs | 3–4 weeks |
| 9 | Public Launch | Mainnet deploy, docs, community launch | Live production app | 2–3 weeks |
