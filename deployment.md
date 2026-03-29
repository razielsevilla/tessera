# 🚀 Tessera — Deployment Guide

> Tessera is a multi-component system. Each component has its own deployment target and lifecycle.
> This guide covers **local development**, **devnet staging**, and **mainnet production** deployments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Component Deployment Map](#component-deployment-map)
- [1. Local Development](#1-local-development)
- [2. Smart Contract Deployment](#2-smart-contract-deployment)
- [3. Building the WASM Engine](#3-building-the-wasm-engine)
- [4. Off-Chain Storage Setup](#4-off-chain-storage-setup)
- [5. Frontend Deployment](#5-frontend-deployment)
- [6. Environment Variables](#6-environment-variables)
- [7. CI/CD Pipeline](#7-cicd-pipeline)
- [8. Rollback Strategy](#8-rollback-strategy)
- [Summary Table](#summary-table)

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | >= 20.x | Frontend and scripts |
| pnpm | >= 9.x | Monorepo package manager |
| Rust | stable (>= 1.75) | Contract and WASM engine |
| wasm-pack | >= 0.12 | Build WASM module |
| Solana CLI | >= 1.18 | Contract deployment |
| Anchor CLI | >= 0.30 | Solana contract framework |

> **Windows Note:** Run Rust/Solana CLI commands in **WSL2 (Ubuntu)** for best compatibility. The Next.js frontend runs natively on Windows with Node.js.

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# wasm-pack
cargo install wasm-pack

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest && avm use latest
```

---

## Component Deployment Map

| Component | Dev | Staging | Production |
|---|---|---|---|
| Smart Contract | Local Solana validator | Solana Devnet | Solana Mainnet-Beta |
| WASM Engine | Bundled in dev server | Bundled in preview | Bundled in production |
| Off-Chain Vault | Local mock / IPFS | IPFS (Pinata staging) | IPFS + Arweave |
| Frontend | `localhost:3000` | Vercel Preview URL | Vercel Production |

---

## 1. Local Development

```bash
# Clone and install
git clone https://github.com/your-org/tessera.git
cd tessera
pnpm install
cp .env.example .env.local   # Fill in keys (see §6)

# Terminal 1 — Start local Solana validator
solana-test-validator --reset

# Terminal 2 — Build engine and start app
pnpm --filter @tessera/engine build
pnpm --filter @tessera/app dev
# → App at http://localhost:3000
```

---

## 2. Smart Contract Deployment

### Local Validator

```bash
solana config set --url http://127.0.0.1:8899
solana airdrop 100
cd packages/contracts
anchor build && anchor deploy
anchor test --skip-local-validator
```

### Solana Devnet

```bash
solana config set --url https://api.devnet.solana.com
solana airdrop 2
anchor build -- --features devnet
anchor deploy --provider.cluster devnet
```

### Mainnet

> ⚠️ **Irreversible.** Ensure the contract has passed a full security audit before mainnet deployment. Set upgrade authority to a multisig (Squads Protocol recommended).

```bash
solana config set --url https://api.mainnet-beta.solana.com
anchor build
anchor deploy \
  --provider.cluster mainnet \
  --provider.wallet ~/.config/solana/deployer.json
```

After deploy, update `NEXT_PUBLIC_PROGRAM_ID` in the frontend environment.

---

## 3. Building the WASM Engine

```bash
cd packages/engine

# Development (with debug info)
wasm-pack build --target bundler --dev

# Production (size-optimized)
wasm-pack build --target bundler --release
```

The WASM binary is auto-bundled by Next.js via `asyncWebAssembly: true` in `next.config.js`. No separate CDN upload required.

---

## 4. Off-Chain Storage Setup

### IPFS via Pinata

1. Create account at [pinata.cloud](https://pinata.cloud)
2. Generate a JWT API key (scoped to `pinFileToIPFS`)
3. Set `PINATA_JWT` in your environment

### Arweave (Permanent Archive)

1. `npx arweave generate-wallet` → fund with AR tokens
2. Set `ARWEAVE_WALLET_JSON` (base64-encoded) in your environment

> **Cost estimate:** ~10 KB/day × 365 days ≈ 3.65 MB ≈ ~0.01 AR (one-time permanent storage fee)

---

## 5. Frontend Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

**Build settings:**
- Framework: `Next.js`
- Build Command: `pnpm build`
- Install Command: `pnpm install`

Add all environment variables (§6) in Vercel Dashboard → Project → Settings → Environment Variables.

### Cloudflare Pages (Alternative)

```bash
pnpm --filter @tessera/app build
npx wrangler pages deploy packages/app/.next \
  --project-name tessera \
  --compatibility-date 2025-01-01
```

---

## 6. Environment Variables

```bash
# Blockchain
NEXT_PUBLIC_SOLANA_NETWORK=devnet         # localnet | devnet | mainnet-beta
NEXT_PUBLIC_PROGRAM_ID=<ANCHOR_PROGRAM_ID>
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# IPFS
PINATA_JWT=<your-pinata-jwt>              # Server-side only
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# Arweave
ARWEAVE_WALLET_JSON=<base64-encoded-json> # Server-side only

# App
NEXT_PUBLIC_APP_ENV=development           # development | staging | production
NEXT_PUBLIC_APP_VERSION=0.1.0

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
```

---

## 7. CI/CD Pipeline

```
PR Opened → [ci.yml]
  ├── lint, type-check
  ├── unit tests (engine, shared)
  └── anchor test (contract on local validator)

Merge to develop → [deploy-dev.yml]
  ├── Build WASM + Next.js
  ├── Deploy to Vercel Preview
  └── Optional: anchor deploy --cluster devnet

Merge to main → [deploy-prod.yml]
  ├── Build WASM + Next.js
  ├── Deploy to Vercel Production
  └── ⚠️ Contract deploy: MANUAL with multisig approval
```

---

## 8. Rollback Strategy

| Component | Rollback Method |
|---|---|
| Frontend | Vercel → "Promote previous deployment" (instant) |
| WASM Engine | Rolls back with frontend automatically |
| Smart Contract | Deploy previous binary if upgrade authority retained; or update env var to old Program ID |
| IPFS / Arweave | Immutable — no rollback needed; new uploads are additive |

---

## Summary Table

| Component | Dev Target | Staging Target | Production Target | Deploy Method |
|---|---|---|---|---|
| Smart Contract | Local Solana validator | Solana Devnet | Solana Mainnet-Beta | Anchor CLI |
| Encryption Engine (WASM) | Bundled in dev server | Bundled in preview | Bundled in production | wasm-pack + Next.js |
| Off-Chain Vault | Local mock / IPFS dev | IPFS (Pinata staging) | IPFS + Arweave | Runtime API call |
| Frontend (Next.js) | `localhost:3000` | Vercel Preview URL | Vercel Production | Vercel CLI / GitHub Actions |
| CI/CD | GitHub Actions (PR) | GitHub Actions (develop) | GitHub Actions (main) | Automated + multisig gate |
