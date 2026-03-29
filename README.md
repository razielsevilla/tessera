<div align="center">

<br />

```
████████╗███████╗███████╗███████╗███████╗██████╗  █████╗
╚══██╔══╝██╔════╝██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗
   ██║   █████╗  ███████╗███████╗█████╗  ██████╔╝███████║
   ██║   ██╔══╝  ╚════██║╚════██║██╔══╝  ██╔══██╗██╔══██║
   ██║   ███████╗███████║███████║███████╗██║  ██║██║  ██║
   ╚═╝   ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

**Privacy-first · Web3-powered · Life as a Personal RPG**

*365 days. 365 tiles. One unbreakable mosaic.*

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-7c3aed.svg?style=for-the-badge)](LICENSE)
[![Built with Rust](https://img.shields.io/badge/Rust-Powered-f97316.svg?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-On--Chain-9945FF.svg?style=for-the-badge&logo=solana)](https://solana.com/)
[![IPFS](https://img.shields.io/badge/IPFS-Encrypted%20Vault-65a30d.svg?style=for-the-badge&logo=ipfs)](https://ipfs.tech/)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-f59e0b.svg?style=for-the-badge)]()

</div>

---

## ✦ What is Tessera?

**Tessera** is a privacy-first, Web3-enabled life tracker that transforms your daily habits into a **mathematically verified, on-chain mosaic**.

Every day you log — your deep work sessions, the novels you're drawn into, the energy it takes to show up for the people who need you, and the hours you pour into mastering your craft. Tessera takes all of that raw, intimate data and does two things with it:

1. **Encrypts everything personal** and seals it in a decentralized vault that only *your wallet* can open.
2. **Commits a cryptographic fingerprint** (a tessera tile) to the blockchain — a public proof that the day happened, rendered as a beautiful, data-rich visual.

Over 365 days, these tiles form a **verifiable mosaic**: a living artifact of a year well lived.

---

## ✦ The Philosophy

> *"What you do in private is your power. What you prove in public is your legacy."*

Tessera is built on a strict contract:

| What happens on-chain | What stays encrypted |
|---|---|
| Cryptographic hash of your day's achievements | Your actual task lists and journal entries |
| Visual tile metadata (color, glow, texture, frame tier) | Your mood ratings and energy levels |
| IPFS vault content address (CID) | All module data: media logs, social events, skill notes |
| Minting timestamp and wallet address | Everything personal |

No centralized database. No accounts. No passwords. Just your wallet, your encrypted vault, and the chain.

---

## ✦ How a Day Works

```
  You log your day                 Engine runs locally              On-chain tile minted
  ─────────────────               ──────────────────────           ────────────────────
  📋 Sprint tasks                 🔒 Raw data encrypted            ◆ Tile color = your mood
  📖 Media sessions               📦 Uploaded to IPFS vault        ◆ Tile glow  = your output
  ⚡ Social energy metrics         🔗 CID embedded in payload       ◆ Tile frame = your skill tier
  🧠 Skill practice hours         ✍️  Payload signed by wallet      ◆ Tile grain = your media genre
         │                               │                                  │
         └───────[ All local ]───────────┘            ┌─────────────────────┘
                                                       │
                                              Your mosaic gains a new tile
```

Nothing leaves your device unencrypted. The blockchain only ever sees a hash.

---

## ✦ Core Tracking Dimensions

<table>
<tr>
<td width="50%">

### 📋 Sprint & Project
- Task completions with weighted scoring
- System design milestone tracking
- Sprint retrospectives
- Life economy (household gamification)

</td>
<td width="50%">

### 📖 Deep-Dive Media Logs
- Book and interactive fiction sessions
- Branching narrative choice logging
- Genre, trope, pacing, and heat level tags
- Reading progress tracking

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Social Battery Metrics
- Mood baseline vs. post-engagement delta
- Meeting and call volume tracking
- Social drain/recharge event logging
- Engagement energy cost rating

</td>
<td width="50%">

### 🧠 Technical Skill Trees
- Per-skill daily hour logging
- Visual skill dependency node graph
- Milestone thresholds (Bronze → Legendary)
- Framework and language specializations

</td>
</tr>
</table>

---

## ✦ The Mosaic — Visual System

Each tessera tile is a **composite visual asset** rendered from your on-chain metadata. No two days look the same.

| Visual Property | Source Data | Visual Effect |
|---|---|---|
| 🎨 **Core Color** | Mood baseline + social battery | Shifts across a curated HSL spectrum |
| ✨ **Glow / Opacity** | Productivity score | Dim on rest days, luminous on peak days |
| 🖼️ **Border Frame** | Skill tree milestone tier | Bronze → Silver → Gold → Legendary |
| 🌿 **Texture / Pattern** | Media genre engaged | 32 unique SVG pattern overlays |
| 💎 **Special Flags** | ZK-proven achievements, streaks | Shimmer, pulse, or crown overlays |

---

## ✦ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Dashboard (Layer 1)                  │
│         Mosaic Canvas · Module Forms · Skill Tree View          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│               Rust/WASM Encryption Engine (Layer 2)             │
│    AES-256-GCM · HKDF Key Derive · Poseidon Hash · BMP Compile  │
└──────────────────┬──────────────────────────┬───────────────────┘
                   │                          │
    ┌──────────────▼──────────┐   ┌───────────▼──────────────────┐
    │  IPFS/Arweave  (Layer 3)│   │  Solana Program   (Layer 4)  │
    │  Encrypted Vault Blobs  │   │  Mint · Verify · Store BMP   │
    └─────────────────────────┘   └──────────────────────────────┘
                                              │
                              ┌───────────────▼──────────────────┐
                              │   Phantom Wallet     (Layer 5)   │
                              │   Identity · Sign · Key Derive   │
                              └──────────────────────────────────┘
```

→ Full details in [`architecture.md`](./architecture.md)

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Smart Contract** | Rust, Solana (Anchor Framework) |
| **Encryption Engine** | Rust compiled to WASM (wasm-pack), AES-256-GCM, Poseidon |
| **Decentralized Storage** | IPFS (Pinata), Arweave |
| **Wallet / Identity** | Phantom, Solana Wallet Adapter |
| **Monorepo Tooling** | pnpm Workspaces, Turborepo |
| **Testing** | Anchor (contract), Vitest (unit), Playwright (E2E) |
| **CI/CD** | GitHub Actions, Vercel |

---

## ✦ Getting Started

### Prerequisites

- Node.js ≥ 20, pnpm ≥ 9
- Rust stable ≥ 1.75 + `wasm-pack`
- Solana CLI + Anchor CLI
- Phantom Wallet browser extension

### Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/tessera.git
cd tessera

# 2. Install all dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# → Edit .env.local with your IPFS keys and RPC URL

# 4. Start local Solana validator (in a separate terminal)
solana-test-validator --reset

# 5. Build the WASM encryption engine
pnpm --filter @tessera/engine build

# 6. Start the development server
pnpm --filter @tessera/app dev
```

**Open `http://localhost:3000`** → Connect your Phantom wallet → Start logging.

→ Full deployment details in [`deployment.md`](./deployment.md)

---

## ✦ Project Structure

```
tessera/
├── packages/
│   ├── contracts/   ← Rust smart contract (Anchor/Solana)
│   ├── engine/      ← Rust/WASM encryption engine
│   ├── app/         ← Next.js 14 frontend
│   └── shared/      ← TypeScript types, Zod schemas, constants
├── scripts/         ← Deploy, seed, and test helpers
├── docs/            ← Architecture diagrams, ADRs
├── architecture.md  ← System architecture deep dive
├── phases.md        ← Development roadmap with checklists
├── schema.md        ← Data schema (on-chain + vault + cache)
├── deployment.md    ← Deployment guide (local → mainnet)
└── structure.md     ← File and folder reference
```

→ Full breakdown in [`structure.md`](./structure.md)

---

## ✦ Development Roadmap

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation & Scaffolding | 🔲 Planned |
| 1 | Encryption Engine | 🔲 Planned |
| 2 | Off-Chain Vault Integration | 🔲 Planned |
| 3 | Smart Contract Core | 🔲 Planned |
| 4 | Frontend Dashboard MVP | 🔲 Planned |
| 5 | Tracking Modules | 🔲 Planned |
| 6 | Mosaic & Visual System | 🔲 Planned |
| 7 | ZK Proof Integration | 🔲 Planned |
| 8 | Hardening & Security Audit | 🔲 Planned |
| 9 | Public Launch | 🔲 Planned |

→ Full phase definitions with checklists in [`phases.md`](./phases.md)

---

## ✦ Privacy Guarantees

- ✅ **Zero plaintext on-chain** — Only hashes and visual metadata touch the blockchain
- ✅ **Wallet-sovereign encryption** — Only your private key can derive the vault decryption key
- ✅ **No user accounts** — Wallet address is your only identity; no email, no password
- ✅ **Client-side encryption only** — Encryption happens in your browser via WASM; keys never leave the device
- ✅ **Content-addressed storage** — IPFS CIDs are immutable; vault contents cannot be swapped out after minting
- ✅ **Optional ZK proofs** — Prove achievements to others without revealing the underlying data

---

## ✦ Data Schema

Three tiers, strict privacy boundaries:

| Tier | Location | Visibility | Size |
|---|---|---|---|
| On-chain BMP | Solana account | Public (hashes only) | ~196 bytes/day |
| Encrypted Vault | IPFS + Arweave | Owner only | ~2–20 KB/day |
| Local Cache | Browser IndexedDB | Session only | Ephemeral |

→ Full schema details in [`schema.md`](./schema.md)

---

## ✦ Contributing

Tessera is in active development. Contributions are welcome once the core architecture is stabilized (post Phase 3).

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a Pull Request against `develop`

Please read the [Architecture Doc](./architecture.md) before contributing to ensure your changes align with the privacy model.

---

## ✦ License

Tessera is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

*Built with obsessive attention to privacy, craft, and the belief that a year well-lived deserves to be remembered.*

**◆ &nbsp; ◇ &nbsp; ◆ &nbsp; ◇ &nbsp; ◆**

</div>
