# 📁 Tessera — Project Structure

> Tessera is organized as a **pnpm monorepo** with four workspace packages:
> `contracts`, `engine`, `app`, and `shared`. This separation enforces strict
> boundaries between the on-chain layer, the cryptographic layer, the UI layer,
> and the shared type system.

---

## Table of Contents

- [Top-Level Structure](#top-level-structure)
- [packages/contracts — Smart Contract](#packagescontracts--smart-contract)
- [packages/engine — WASM Crypto Engine](#packagesengine--wasm-crypto-engine)
- [packages/app — Next.js Frontend](#packagesapp--nextjs-frontend)
- [packages/shared — Shared Types & Utilities](#packagesshared--shared-types--utilities)
- [scripts/ — Deployment & Dev Scripts](#scripts--deployment--dev-scripts)
- [.github/ — CI/CD Workflows](#github--cicd-workflows)
- [Naming Conventions](#naming-conventions)
- [Summary Table](#summary-table)

---

## Top-Level Structure

```
tessera/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-dev.yml
│       └── deploy-prod.yml
├── packages/
│   ├── contracts/           ← Rust smart contract (Solana/Anchor or Ink!)
│   ├── engine/              ← Rust/WASM encryption engine
│   ├── app/                 ← Next.js 14 frontend
│   └── shared/              ← Shared TypeScript types & Zod schemas
├── scripts/
│   ├── deploy.ts            ← Contract deployment helper
│   ├── test-arweave.ts      ← Arweave upload smoke test
│   └── seed-devnet.ts       ← Devnet seed data generator
├── docs/                    ← Additional diagrams and references
│   ├── diagrams/
│   └── decisions/           ← Architecture Decision Records (ADRs)
├── .env.example             ← Template for all environment variables
├── .gitignore
├── pnpm-workspace.yaml      ← Workspace package declarations
├── turbo.json               ← Turborepo pipeline config
├── architecture.md
├── phases.md
├── schema.md
├── deployment.md
├── structure.md             ← This file
└── README.md
```

---

## packages/contracts — Smart Contract

Rust-based smart contract for Solana using the Anchor framework (or Ink! for Polkadot).

```
packages/contracts/
├── Cargo.toml               ← Rust crate manifest
├── Anchor.toml              ← Anchor workspace config (Solana)
├── programs/
│   └── tessera/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs       ← Program entry point, instruction routing
│           ├── instructions/
│           │   ├── mint_tessera.rs     ← Daily mint logic
│           │   ├── init_profile.rs     ← UserProfile account init
│           │   └── unlock_milestone.rs ← Skill tier milestones
│           ├── state/
│           │   ├── user_profile.rs     ← UserProfile account struct
│           │   ├── tessera_account.rs  ← TesseraAccount struct
│           │   ├── milestone_account.rs← MilestoneAccount struct
│           │   └── bmp.rs             ← BundledMetadataPayload struct
│           ├── errors.rs    ← Custom error codes
│           └── events.rs    ← On-chain event definitions
├── tests/
│   ├── mint_tessera.ts      ← Anchor integration tests
│   ├── init_profile.ts
│   └── milestones.ts
└── target/                  ← Build artifacts (gitignored)
    └── deploy/
        └── tessera.so       ← Compiled program binary
```

| File/Folder | Purpose |
|---|---|
| `programs/tessera/src/lib.rs` | Program entry point; declares all instructions |
| `instructions/mint_tessera.rs` | Core: validates & commits the daily BMP |
| `state/bmp.rs` | Defines `BundledMetadataPayload` and `VisualMeta` structs |
| `errors.rs` | `TesseraError` enum: `AlreadyMinted`, `WrongDate`, `BadSignature` |
| `tests/` | TypeScript Anchor integration tests |

---

## packages/engine — WASM Crypto Engine

Rust crate compiled to WebAssembly. Runs entirely in the browser — no server-side involvement.

```
packages/engine/
├── Cargo.toml               ← Rust crate manifest (wasm-pack target)
├── src/
│   ├── lib.rs               ← WASM exports (wasm_bindgen)
│   ├── encrypt.rs           ← AES-256-GCM encryption/decryption
│   ├── key_derive.rs        ← HKDF key derivation from wallet signing key
│   ├── bmp.rs               ← BMP assembly and serialization
│   ├── hash.rs              ← Poseidon hash implementation
│   ├── signature.rs         ← Ed25519 signature verify helper
│   └── utils.rs             ← Shared conversion utilities
├── tests/
│   ├── encrypt_test.rs      ← Encryption round-trip tests
│   ├── bmp_test.rs          ← BMP serialization tests
│   └── hash_test.rs         ← Hash determinism tests
├── pkg/                     ← wasm-pack output (gitignored in CI, committed in release)
│   ├── tessera_engine.js
│   ├── tessera_engine_bg.wasm
│   └── tessera_engine.d.ts
└── package.json             ← Workspace package descriptor (@tessera/engine)
```

| File | Purpose |
|---|---|
| `lib.rs` | Exposes `#[wasm_bindgen]` functions to TypeScript |
| `encrypt.rs` | `encrypt(data, key) → ciphertext`, `decrypt(ciphertext, key) → data` |
| `key_derive.rs` | `derive_vault_key(wallet_signature, salt) → AES key` |
| `bmp.rs` | `assemble_bmp(inputs) → BMP bytes` |
| `hash.rs` | `poseidon_hash(module_scores) → [u8; 32]` |

---

## packages/app — Next.js Frontend

Next.js 14 with App Router. The user-facing web application.

```
packages/app/
├── package.json
├── next.config.js           ← WASM plugin, env, headers config
├── tsconfig.json
├── public/
│   ├── fonts/               ← Self-hosted fonts (Inter, JetBrains Mono)
│   ├── icons/               ← SVG icons and favicon
│   └── patterns/            ← SVG texture patterns for tile rendering
├── src/
│   ├── app/                 ← Next.js App Router pages
│   │   ├── layout.tsx       ← Root layout (fonts, providers, metadata)
│   │   ├── page.tsx         ← Landing / mosaic dashboard
│   │   ├── mint/
│   │   │   └── page.tsx     ← Daily mint form page
│   │   ├── day/
│   │   │   └── [date]/
│   │   │       └── page.tsx ← Single-day tessera detail view
│   │   ├── skills/
│   │   │   └── page.tsx     ← Skill tree visualization
│   │   └── api/
│   │       ├── upload-vault/
│   │       │   └── route.ts ← Server: encrypts + uploads to IPFS
│   │       └── fetch-vault/
│   │           └── route.ts ← Server: fetches + returns encrypted blob
│   ├── components/
│   │   ├── mosaic/
│   │   │   ├── MosaicCanvas.tsx     ← 365-tile yearly grid
│   │   │   ├── TesseraCell.tsx      ← Single animated tile
│   │   │   └── TesseraLegend.tsx    ← Visual key for tile properties
│   │   ├── modules/
│   │   │   ├── SprintModule.tsx     ← Sprint/task tracking form
│   │   │   ├── MediaModule.tsx      ← Media logging form
│   │   │   ├── SocialModule.tsx     ← Social battery form
│   │   │   └── SkillsModule.tsx     ← Skill logging form
│   │   ├── skills/
│   │   │   ├── SkillTreeGraph.tsx   ← Interactive node graph
│   │   │   └── SkillNode.tsx        ← Individual skill node
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── wallet/
│   │   │   ├── WalletButton.tsx     ← Connect/disconnect
│   │   │   └── WalletProvider.tsx   ← Context provider
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Slider.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useTessera.ts        ← Fetch on-chain tessera data
│   │   ├── useMint.ts           ← Full minting flow state machine
│   │   ├── useVault.ts          ← Vault encrypt/decrypt/fetch
│   │   └── useSkillTree.ts      ← Skill accumulation calculations
│   ├── lib/
│   │   ├── anchor.ts            ← Anchor program client factory
│   │   ├── ipfs.ts              ← IPFS upload/fetch helpers
│   │   ├── arweave.ts           ← Arweave upload helpers
│   │   ├── visual.ts            ← BMP → CSS visual property mapper
│   │   └── engine.ts            ← WASM engine loader and wrapper
│   ├── store/
│   │   └── mintStore.ts         ← Zustand store for minting form state
│   ├── styles/
│   │   ├── globals.css          ← CSS custom properties, resets
│   │   ├── mosaic.css           ← Tile grid and animation styles
│   │   └── patterns.css         ← SVG pattern references
│   └── types/
│       └── next.d.ts            ← Next.js type augmentations
├── tests/
│   ├── e2e/
│   │   └── mint-flow.test.ts    ← Playwright E2E tests
│   └── unit/
│       ├── visual.test.ts       ← BMP → visual property mapping tests
│       └── hooks.test.ts        ← Hook unit tests with MSW
└── playwright.config.ts
```

| Key File | Purpose |
|---|---|
| `app/page.tsx` | Main mosaic dashboard; reads all on-chain tesserae |
| `components/mosaic/MosaicCanvas.tsx` | Renders the 365-tile grid SVG/Canvas |
| `components/mosaic/TesseraCell.tsx` | Renders a single tile from BMP visual metadata |
| `lib/visual.ts` | Maps BMP fields to CSS variables (color, glow, texture) |
| `lib/engine.ts` | Lazy-loads the WASM engine; exposes typed encrypt/hash functions |
| `hooks/useMint.ts` | Orchestrates: form → encrypt → IPFS → BMP → contract → update |
| `api/upload-vault/route.ts` | Server Route that signs Pinata requests (keeps JWT secret) |

---

## packages/shared — Shared Types & Utilities

The single source of truth for all TypeScript interfaces and Zod schemas.

```
packages/shared/
├── package.json             ← @tessera/shared
├── tsconfig.json
└── src/
    ├── types/
    │   ├── on-chain.ts      ← BMP, VisualMeta, account types (mirrors Rust structs)
    │   ├── vault.ts         ← VaultBlob and all module interfaces
    │   ├── cache.ts         ← LocalCacheEntry and SyncStatus
    │   ├── skill-registry.ts← SkillEntry, skill IDs, tier thresholds
    │   └── index.ts         ← Re-exports all types
    ├── schemas/
    │   ├── vault.schema.ts  ← Zod validation for VaultBlob
    │   ├── bmp.schema.ts    ← Zod validation for BMP inputs
    │   └── modules.schema.ts← Per-module Zod schemas
    ├── constants/
    │   ├── skills.ts        ← Skill registry: IDs, names, tier thresholds
    │   ├── genres.ts        ← Media genre enum and pattern IDs
    │   └── tiers.ts         ← Frame tier thresholds and labels
    └── utils/
        ├── date.ts          ← Day epoch conversions
        ├── scoring.ts       ← Module score computation formulas
        └── color.ts         ← Mood → HSL color mapping
```

---

## scripts/ — Deployment & Dev Scripts

```
scripts/
├── deploy.ts                ← Anchor deploy script (wraps CLI for CI use)
├── seed-devnet.ts           ← Mints N test tesserae on devnet for UI testing
├── test-ipfs-upload.ts      ← Smoke test for Pinata IPFS upload
├── test-arweave.ts          ← Smoke test for Arweave upload
└── generate-types.ts        ← Generates @tessera/types from Anchor IDL
```

---

## .github/ — CI/CD Workflows

```
.github/
└── workflows/
    ├── ci.yml               ← PR checks: lint, type-check, unit tests, anchor tests
    ├── deploy-dev.yml       ← develop branch: build + Vercel preview + optional devnet
    └── deploy-prod.yml      ← main branch: build + Vercel prod (contract deploy manual)
```

---

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| React Components | PascalCase | `MosaicCanvas.tsx`, `TesseraCell.tsx` |
| Hooks | camelCase, `use` prefix | `useMint.ts`, `useVault.ts` |
| Rust modules | snake_case | `mint_tessera.rs`, `key_derive.rs` |
| Rust types/structs | PascalCase | `TesseraAccount`, `BundledMetadataPayload` |
| API Routes (Next.js) | kebab-case directory | `upload-vault/route.ts` |
| CSS classes | kebab-case | `.tessera-cell`, `.mosaic-canvas` |
| Environment variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_PROGRAM_ID` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_STREAK_LENGTH`, `BRONZE_TIER_HOURS` |

---

## Summary Table

| Package / Folder | Language | Role | Key Outputs |
|---|---|---|---|
| `packages/contracts` | Rust (Anchor) | On-chain smart contract | `.so` program binary, Anchor IDL |
| `packages/engine` | Rust (wasm-pack) | Client-side crypto engine | `.wasm` + `.js` WASM package |
| `packages/app` | TypeScript (Next.js) | Frontend web application | Deployed Next.js app |
| `packages/shared` | TypeScript | Types, schemas, constants | `@tessera/shared` npm package |
| `scripts/` | TypeScript | Dev/deploy automation | CLI scripts |
| `.github/workflows/` | YAML | CI/CD pipeline | Automated build/deploy |
| `docs/` | Markdown | Architecture references | ADRs, diagrams |
