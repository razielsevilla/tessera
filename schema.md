# 🗃️ Tessera — Data Schema

> Tessera has no traditional database. Instead, it uses a **three-tier schema** distributed across:
> 1. **On-chain accounts** — immutable, minimal, public
> 2. **Encrypted off-chain vaults** — private, granular, stored on IPFS/Arweave
> 3. **Client-side local cache** — ephemeral, offline-first IndexedDB layer
>
> Understanding which data lives where — and why — is fundamental to the privacy model.

---

## Table of Contents

- [Schema Philosophy](#schema-philosophy)
- [Tier 1 — On-Chain Data Model](#tier-1--on-chain-data-model)
  - [UserProfile Account](#userprofile-account)
  - [TesseraAccount](#tesseraaccount)
  - [MilestoneAccount](#milestoneaccount)
  - [BundledMetadataPayload (BMP)](#bundledmetadatapayload-bmp)
- [Tier 2 — Off-Chain Encrypted Vault](#tier-2--off-chain-encrypted-vault)
  - [VaultBlob Root](#vaultblob-root)
  - [SprintModule](#sprintmodule)
  - [MediaModule](#mediamodule)
  - [SocialModule](#socialmodule)
  - [SkillsModule](#skillsmodule)
- [Tier 3 — Local Client Cache (IndexedDB)](#tier-3--local-client-cache-indexeddb)
- [Type Definitions (TypeScript)](#type-definitions-typescript)
- [Data Relationships Diagram](#data-relationships-diagram)
- [Summary Table](#summary-table)

---

## Schema Philosophy

| Principle | Implementation |
|---|---|
| **Minimal on-chain footprint** | BMP payload is < 256 bytes per day |
| **Zero plaintext on-chain** | All personal fields are hashed or encrypted before touching the chain |
| **ZK-compatible hashing** | Module scores use Poseidon hash (native to most ZK circuits) |
| **Sovereign decryption** | Only the owner's wallet-derived AES key can open the vault blob |
| **Offline-first** | All writes cached locally first; syncs to IPFS when online |

---

## Tier 1 — On-Chain Data Model

Data stored on-chain is strictly minimal — enough to prove a day happened and render a tessera tile, nothing more.

### UserProfile Account

Stores per-user aggregate state. Created on first mint.

**Solana Account (Anchor struct):**

```rust
#[account]
pub struct UserProfile {
    pub owner:           Pubkey,     // 32 bytes — wallet public key
    pub total_mints:     u32,        //  4 bytes — lifetime tessera count
    pub current_streak:  u32,        //  4 bytes — consecutive days minted
    pub longest_streak:  u32,        //  4 bytes — all-time best streak
    pub frame_tier:      u8,         //  1 byte  — 0=None,1=Bronze,2=Silver,3=Gold,4=Legend
    pub created_at:      i64,        //  8 bytes — unix timestamp of first mint
    pub last_mint_epoch: u32,        //  4 bytes — day epoch of last mint (days since unix 0)
    pub bump:            u8,         //  1 byte  — PDA bump seed
}
// Total: ~58 bytes (+ discriminator + padding = ~96 bytes allocated)
```

| Field | Type | Description |
|---|---|---|
| `owner` | `Pubkey` | Wallet address; PDA seed |
| `total_mints` | `u32` | Lifetime count of minted tesserae |
| `current_streak` | `u32` | Consecutive consecutive days minted |
| `longest_streak` | `u32` | All-time best streak in days |
| `frame_tier` | `u8` | Visual border tier unlocked (0–4) |
| `created_at` | `i64` | Unix timestamp of profile creation |
| `last_mint_epoch` | `u32` | Day number of most recent mint |
| `bump` | `u8` | PDA bump for deterministic address |

---

### TesseraAccount

One account per day per user. Stores the full BMP for that day.

```rust
#[account]
pub struct TesseraAccount {
    pub owner:       Pubkey,                    // 32 bytes
    pub minted_at:   i64,                       //  8 bytes — actual minting timestamp
    pub payload:     BundledMetadataPayload,    // 196 bytes (see below)
    pub bump:        u8,                        //  1 byte
}
// PDA Seeds: ["tessera", owner.key(), day_epoch_bytes]
```

---

### MilestoneAccount

Tracks skill tier unlock events. One account per skill per user.

```rust
#[account]
pub struct MilestoneAccount {
    pub owner:         Pubkey,   // 32 bytes
    pub skill_id:      u16,      //  2 bytes — references a skill registry
    pub tier_unlocked: u8,       //  1 byte  — 1=Bronze, 2=Silver, 3=Gold, 4=Legendary
    pub unlocked_at:   i64,      //  8 bytes — timestamp of unlock
    pub total_hours:   f32,      //  4 bytes — hours at time of unlock
    pub bump:          u8,       //  1 byte
}
```

---

### BundledMetadataPayload (BMP)

The heart of the on-chain data. Embedded inside `TesseraAccount`. **Public, non-sensitive.**

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BundledMetadataPayload {
    pub version:      u8,          //  1 byte  — schema version
    pub date_epoch:   u32,         //  4 bytes — days since Unix epoch
    pub vault_cid:    [u8; 46],    // 46 bytes — IPFS CIDv1 (base32)
    pub module_hash:  [u8; 32],    // 32 bytes — Poseidon(sprint,media,social,skills)
    pub visual_meta:  VisualMeta,  // 16 bytes — packed visual properties
    pub zk_proof_ref: [u8; 32],   // 32 bytes — optional ZK proof CID, or [0; 32]
    pub signature:    [u8; 64],    // 64 bytes — Ed25519 signature over all above fields
}
// Total: 1 + 4 + 46 + 32 + 16 + 32 + 64 = 195 bytes
```

#### VisualMeta (packed 16 bytes)

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct VisualMeta {
    pub color_h:       u16,   // Hue (0–360 mapping mood)
    pub color_s:       u8,    // Saturation (social energy)
    pub color_l:       u8,    // Lightness (energy level)
    pub glow_intensity:u8,    // 0–255 (productivity score)
    pub frame_tier:    u8,    // 0–4
    pub texture_id:    u8,    // 0–31 (media genre pattern)
    pub flags:         u8,    // Bitmask: streak/milestone/zk-proven
    pub reserved:      [u8; 8], // Future use
}
```

---

## Tier 2 — Off-Chain Encrypted Vault

Stored as an AES-256-GCM encrypted blob on IPFS. Only decryptable by the wallet owner.

### VaultBlob Root

```typescript
interface VaultBlob {
  vault_version: number;       // Schema version for migration support
  date: string;                // ISO 8601 date, e.g. "2025-10-15"
  created_at: number;          // Unix timestamp (ms)
  mood_rating: number;         // 1–10 baseline mood (raw input)
  energy_level: number;        // 1–10 physical energy
  journal: string;             // Free-text journal entry (encrypted)
  tags: string[];              // User-defined tags, e.g. ["deep-work", "rest-day"]
  modules: {
    sprint: SprintModuleData;
    media: MediaModuleData;
    social: SocialModuleData;
    skills: SkillsModuleData;
  };
}
```

---

### SprintModule

```typescript
interface SprintModuleData {
  tasks_completed: Task[];
  sprint_name: string | null;
  retrospective_note: string | null;
  milestone_hit: string | null;          // e.g. "Finished auth module"
  life_economy_tasks: LifeEconomyTask[]; // Household/chore gamification
  productivity_score: number;            // Computed: 0–100
}

interface Task {
  id: string;
  title: string;
  weight: number;             // Point value (1–5)
  completed: boolean;
  category: 'design' | 'implementation' | 'review' | 'research' | 'admin';
}

interface LifeEconomyTask {
  id: string;
  label: string;              // e.g. "Cooked dinner", "Did laundry"
  points: number;
  completed: boolean;
}
```

---

### MediaModule

```typescript
interface MediaModuleData {
  sessions: MediaSession[];
  total_minutes: number;      // Sum of all session durations
  genres_engaged: string[];   // Deduplicated list
}

interface MediaSession {
  id: string;
  title: string;              // Book/story/film title
  type: 'book' | 'interactive-fiction' | 'manga' | 'film' | 'podcast';
  genre: string[];            // e.g. ["romance", "sports-fiction", "high-stakes"]
  duration_minutes: number;
  progress_percent: number;   // 0–100
  branching_choices: BranchingChoice[]; // For interactive fiction
  tropes_noted: string[];     // e.g. ["found-family", "rivals-to-lovers"]
  pacing_rating: number;      // 1–5 (slow burn to fast-paced)
  heat_level: number | null;  // 1–5 (for applicable genres)
  notes: string | null;
}

interface BranchingChoice {
  chapter: string;
  decision: string;           // Description of choice made
  outcome_noted: string | null;
}
```

---

### SocialModule

```typescript
interface SocialModuleData {
  mood_delta: number;         // Mood change after social events (+/-)
  external_engagements: Engagement[];
  social_battery_start: number; // 0–100 at day start
  social_battery_end: number;   // 0–100 at day end
  recharge_activities: string[]; // e.g. ["solo walk", "reading", "nap"]
  social_score: number;         // Computed: 0–100 (balance metric)
}

interface Engagement {
  id: string;
  type: 'fundraising-meeting' | 'partnership-call' | 'team-management' |
        'community-event' | 'casual-social' | 'conflict' | 'mentorship';
  duration_minutes: number;
  participant_count: number;
  energy_cost: number;        // 1–5 (how draining it was)
  outcome_note: string | null;
}
```

---

### SkillsModule

```typescript
interface SkillsModuleData {
  sessions: SkillSession[];
  total_hours_today: number;
  skills_summary: { [skillId: string]: number }; // skillId → hours today
  skill_score: number;        // Computed: 0–100
}

interface SkillSession {
  id: string;
  skill_id: string;           // References the global skill registry
  skill_name: string;         // e.g. "Rust", "Substrate Pallets", "ZK Circuits"
  subcategory: string | null; // e.g. "Macros", "Lifetimes", "Anchor Framework"
  duration_minutes: number;
  notes: string | null;
  resources_used: string[];   // URLs or book titles
}
```

---

## Tier 3 — Local Client Cache (IndexedDB)

Stored in the browser using `idb` (IndexedDB wrapper). Clears on explicit logout or browser data clear.

```typescript
// IndexedDB Store: "tessera-local-cache"
interface LocalCacheEntry {
  date: string;               // ISO 8601 — primary key
  vault_blob_encrypted: ArrayBuffer; // Locally encrypted (same key as IPFS)
  bmp_draft: Partial<BundledMetadataPayload> | null; // In-progress BMP
  ipfs_cid: string | null;    // Set after successful IPFS upload
  tx_signature: string | null; // Set after successful on-chain mint
  sync_status: 'draft' | 'uploaded' | 'minted' | 'failed';
  last_modified: number;      // Unix timestamp (ms)
}
```

| Field | Purpose |
|---|---|
| `vault_blob_encrypted` | Offline-first data; survives browser refresh |
| `bmp_draft` | Saved progress on incomplete daily form |
| `ipfs_cid` | Avoids re-uploading if IPFS already succeeded |
| `tx_signature` | Avoids double-mint if contract already confirmed |
| `sync_status` | Drives the UI state machine for the minting flow |

---

## Type Definitions (TypeScript)

All shared types live in `packages/shared/src/types/`:

```
types/
├── on-chain.ts     ← BMP, VisualMeta, and on-chain account types
├── vault.ts        ← VaultBlob and all module interfaces
├── cache.ts        ← LocalCacheEntry and sync status types
├── skill-registry.ts ← SkillEntry, skill IDs, milestone thresholds
└── index.ts        ← Re-exports all types
```

---

## Data Relationships Diagram

```
Wallet (Pubkey)
    │
    ├──(PDA seed)──► UserProfile Account (on-chain)
    │                    └── frame_tier, streak, total_mints
    │
    ├──(PDA seed)──► TesseraAccount × N (one per minted day, on-chain)
    │                    └── BundledMetadataPayload
    │                              ├── vault_cid ──────────────────► IPFS/Arweave Vault Blob (encrypted)
    │                              ├── module_hash ─── (Poseidon hash of module scores)
    │                              ├── visual_meta ─── (renders tile appearance)
    │                              └── zk_proof_ref ──► (optional ZK proof on IPFS)
    │
    ├──(PDA seed)──► MilestoneAccount × M (one per skill unlock, on-chain)
    │
    └──(local key)──► IndexedDB Local Cache (browser, encrypted)
                          └── LocalCacheEntry × N (one per day, offline-first)
```

---

## Summary Table

| Tier | Location | Technology | Sensitivity | Size per Day | Access Control |
|---|---|---|---|---|---|
| 1 — On-Chain Accounts | Solana / Substrate | Rust, Anchor / Ink! | None (hashes only) | ~256 bytes | Public, immutable |
| 1 — BMP (embedded) | Inside TesseraAccount | Rust struct | None (metadata) | ~196 bytes | Public |
| 1 — VisualMeta (packed) | Inside BMP | Packed bits | None (visual) | 16 bytes | Public |
| 2 — Vault Blob | IPFS + Arweave | JSON (encrypted) | High | ~2–20 KB | Wallet owner only |
| 2 — SprintModule | Inside VaultBlob | TypeScript interface | High | Variable | Wallet owner only |
| 2 — MediaModule | Inside VaultBlob | TypeScript interface | High | Variable | Wallet owner only |
| 2 — SocialModule | Inside VaultBlob | TypeScript interface | High | Variable | Wallet owner only |
| 2 — SkillsModule | Inside VaultBlob | TypeScript interface | High | Variable | Wallet owner only |
| 3 — Local Cache | IndexedDB (browser) | idb, ArrayBuffer | High (encrypted) | ~2–20 KB | Current browser session |
