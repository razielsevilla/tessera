# 🏛️ Tessera — System Architecture

> **"Privacy at the core. Verifiability at the surface."**
> Tessera is built on a strict separation between what is *proven* (on-chain) and what is *known* (off-chain, encrypted). No personal data ever touches the blockchain.

---

## Table of Contents

- [Architectural Philosophy](#architectural-philosophy)
- [Layer Overview](#layer-overview)
- [Layer 1 — Presentation Layer](#layer-1--presentation-layer)
- [Layer 2 — Client-Side Encryption Engine](#layer-2--client-side-encryption-engine)
- [Layer 3 — Off-Chain Encrypted Vault](#layer-3--off-chain-encrypted-vault)
- [Layer 4 — Smart Contract Layer](#layer-4--smart-contract-layer)
- [Layer 5 — Wallet / Identity Layer](#layer-5--wallet--identity-layer)
- [Cross-Layer Data Flow](#cross-layer-data-flow)
- [Security Model](#security-model)
- [Summary Table](#summary-table)

---

## Architectural Philosophy

Tessera follows a **layered, privacy-first architecture** where the sensitivity of data inversely dictates its visibility:

| Data Sensitivity | Storage Location | Accessibility |
|---|---|---|
| High (journal entries, mood, media logs) | Encrypted off-chain (IPFS/Arweave) | Owner's wallet only |
| Medium (module scores, aggregated stats) | Client-computed, hashed | Never stored raw |
| Low (cryptographic hash, visual metadata) | On-chain (Solana/Substrate) | Public, verifiable |

This ensures the blockchain acts solely as an **immutable proof layer**, not a data store.

---

## Layer Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     LAYER 1 — PRESENTATION                           │
│              Next.js / React Dynamic Canvas Dashboard                │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                  LAYER 2 — ENCRYPTION ENGINE                         │
│          Client-Side ZK / AES-256 Vault & Payload Compiler           │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
┌─────────────▼──────────┐    ┌─────────────▼──────────────────────────┐
│  LAYER 3 — OFF-CHAIN   │    │      LAYER 4 — SMART CONTRACT          │
│  Encrypted Vault        │    │   Solana / Polkadot Substrate (Rust)   │
│  IPFS / Arweave         │    │   Daily Tessera Minting & Verification │
└────────────────────────┘    └────────────────────────────────────────┘
                                             │
              ┌──────────────────────────────▼──────────────┐
              │          LAYER 5 — IDENTITY / WALLET         │
              │   Web3 Wallet (Phantom / Polkadot.js ext.)   │
              └──────────────────────────────────────────────┘
```

---

## Layer 1 — Presentation Layer

**Technology:** Next.js 14+ (App Router), React, HTML5 Canvas / SVG

**Responsibilities:**
- Render the daily tessera mosaic canvas from on-chain metadata
- Provide the data entry UI for all tracking modules
- Visualize skill trees, social battery curves, and sprint boards
- Animate tessera tiles with dynamic visual properties
- Handle wallet connection and session management

**Tessera Visual Rendering Logic:**

| Visual Property | Data Source | Example Rule |
|---|---|---|
| Core Color | Mood baseline / Social Battery | Calm Blue → Energized Amber |
| Opacity / Glow | Productivity output | Low tasks = dim, High output = glowing |
| Border / Frame | Skill Tree milestone level | Bronze → Silver → Gold → Legendary |
| Texture / Pattern | Media genre engaged | Fiction = organic curves, Technical = grid |

**Key Components:**
- `MosaicCanvas` — renders the full 365-tile yearly view
- `TesseraCell` — individual tile renderer using on-chain metadata
- `ModuleForm` — dynamically generated daily input forms per module
- `SkillTreeView` — interactive node graph for technical progress
- `VaultUnlock` — wallet-signed decryption flow for private data

---

## Layer 2 — Client-Side Encryption Engine

**Technology:** Custom Rust-compiled WASM module + Web Crypto API

**Responsibilities:**
- Locally encrypt sensitive journal/log data using the wallet's derived key
- Compile daily activity into a **Bundled Metadata Payload (BMP)**
- Generate the cryptographic hash commitment sent on-chain
- Produce ZK-friendly proofs for threshold achievement claims

**Bundled Metadata Payload (BMP) Structure:**

```
BMP = {
  version:        u8,
  date_epoch:     u32,
  vault_cid:      [u8; 46],    // IPFS CID of encrypted vault blob
  module_hash:    [u8; 32],    // Poseidon hash of all module scores
  visual_meta:    [u8; 16],    // Encoded visual property flags
  zk_proof_ref:   [u8; 32],   // Reference to off-chain proof (optional)
  signature:      [u8; 64],    // Ed25519 wallet signature
}
```

**Encryption Flow:**
1. User inputs raw data in the browser (never leaves the device unencrypted)
2. Engine derives an AES-256-GCM key from the wallet's signing key (HKDF)
3. Raw data is encrypted → IPFS blob uploaded → CID returned
4. Module scores are hashed via Poseidon (ZK-compatible)
5. BMP is assembled and signed by the wallet
6. BMP is submitted to the smart contract for minting

---

## Layer 3 — Off-Chain Encrypted Vault

**Technology:** IPFS (primary), Arweave (permanent archival), Lit Protocol (optional key management)

**Responsibilities:**
- Store the user's encrypted daily data blob (granular module logs)
- Expose only the CID (content address) publicly; never the content
- Provide permanent, immutable storage for data longevity

**Vault Blob Schema (encrypted):**

```json
{
  "vault_version": 1,
  "date": "2025-10-15",
  "modules": {
    "sprint": { ... },
    "media": { ... },
    "social": { ... },
    "skills": { ... }
  },
  "journal": "encrypted_plaintext_entry",
  "mood_rating": 7,
  "tags": ["deep-work", "social-recovery"]
}
```

**Data Management Strategy:**
- IPFS for immediate availability (pinned via Pinata or Web3.Storage)
- Arweave for guaranteed permanent storage (one-time fee per day)
- Fallback: local encrypted IndexedDB cache for offline-first usage

---

## Layer 4 — Smart Contract Layer

**Technology:** Rust — Solana Program Library (SPL) or Polkadot Ink! / Substrate pallet

**Responsibilities:**
- Receive, validate, and store the Bundled Metadata Payload
- Mint a unique NFT/account record per day per user
- Enforce one-mint-per-day per wallet address
- Verify the Ed25519 payload signature
- Emit events for frontend indexing

**Contract Logic (Pseudocode):**

```rust
pub fn mint_tessera(
    ctx: Context<MintTessera>,
    payload: BundledMetadataPayload,
) -> Result<()> {
    // 1. Verify date is today and not already minted
    require!(is_today(payload.date_epoch), TesseraError::WrongDate);
    require!(!tessera_exists(&ctx, payload.date_epoch), TesseraError::AlreadyMinted);

    // 2. Verify wallet signature over payload
    verify_ed25519_signature(&payload)?;

    // 3. Store BMP in on-chain account
    let tessera = &mut ctx.accounts.tessera_account;
    tessera.owner       = ctx.accounts.signer.key();
    tessera.payload     = payload;
    tessera.minted_at   = Clock::get()?.unix_timestamp;

    emit!(TesseraMinted { owner: tessera.owner, date: payload.date_epoch });
    Ok(())
}
```

**State Accounts (Solana model):**

| Account | Data Stored | Size |
|---|---|---|
| `UserProfile` | Wallet, streak count, highest frame tier | ~128 bytes |
| `TesseraAccount` | Full BMP payload per day | ~256 bytes |
| `MilestoneAccount` | Skill tier unlock timestamps | ~64 bytes |

---

## Layer 5 — Wallet / Identity Layer

**Technology:** Phantom Wallet (Solana) / Polkadot.js Extension, WalletConnect

**Responsibilities:**
- Act as the user's sole identity — no username/password
- Sign the daily BMP before on-chain submission
- Act as root key material for encryption key derivation
- Authorize decryption of vault contents on-demand

**Sessions:**
- Sessions are ephemeral; no keys are ever persisted to `localStorage` in raw form
- Vault decryption keys are re-derived on each session from a signed nonce
- All signing operations go through the wallet adapter — private keys are never exposed

---

## Cross-Layer Data Flow

```
USER INPUT (browser)
       │
       ▼
[Layer 1] Raw module data collected in form
       │
       ▼
[Layer 2] Encrypt raw data → upload to IPFS → get CID
          Compute module score hashes
          Assemble BMP
          Request wallet signature
       │
       ├──── Encrypted blob ──────► [Layer 3] IPFS / Arweave
       │
       └──── Signed BMP ──────────► [Layer 4] Smart Contract → On-chain mint
                                            │
                                            ▼
                                   [Layer 1] Canvas updates with new tile
```

---

## Security Model

| Threat | Mitigation |
|---|---|
| On-chain data exposure | Only cryptographic hashes and visual metadata stored on-chain |
| IPFS blob interception | AES-256-GCM encryption; only user's derived key can decrypt |
| Replay attacks | Payload includes day epoch; contract enforces one-mint-per-day |
| Key theft | Keys never leave wallet extension; derived via HKDF per session |
| Data manipulation | Poseidon hash of module scores committed on-chain; vault CID is immutable |
| Wallet compromise | ZK proofs can optionally prove threshold achievements without revealing raw scores |

---

## Summary Table

| Layer | Name | Technology | Primary Role |
|---|---|---|---|
| 1 | Presentation | Next.js 14, React, Canvas/SVG | UI, tessera rendering, user input |
| 2 | Encryption Engine | Rust/WASM, Web Crypto API | Local encryption, BMP assembly, signing |
| 3 | Off-Chain Vault | IPFS, Arweave | Encrypted personal data storage |
| 4 | Smart Contract | Rust (Solana SPL / Ink!) | On-chain minting, verification, history |
| 5 | Identity / Wallet | Phantom, Polkadot.js | Authentication, signing, key derivation |
| Cross | Data Flow | All layers | Secure unidirectional data pipeline |
| Cross | Security Model | Cryptography + Contract logic | Privacy, integrity, anti-replay enforcement |
