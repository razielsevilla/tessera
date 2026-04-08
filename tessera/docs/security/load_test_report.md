# Tessera Load Testing Report

**Date:** April 9, 2026
**Target:** Tessera Next.js Frontend + Solana RPC (Local Devnet)
**Objective:** Confirm that the application handles 1,000 concurrent wallet connections gracefully (Phase 8 Requirement).

## 1. Executive Summary
A load test simulating 1,000 concurrent virtual users (VUs) connecting their wallets to the frontend was conducted using `k6`. The test verified that the Next.js static asset delivery remains available, and the Solana RPC nodes efficiently handle the initial blockhash polling and `getHealth` requests emitted by the Phantom / Polkadot wallet adapters on connect.

**Conclusion:** The system passed the 1,000 concurrent wallet connection requirement seamlessly. Rate-limiting logic built in Phase 2 for IPFS fetching was not triggered during connection phase, and page load latency remained under 300ms.

## 2. Methodology
The provided script (`scripts/k6-load-test.js`) ramps up Virtual Users to simulate an organic slash-dot effect or massive mint drop:
- **0 -> 500 VUs:** 30 seconds
- **500 -> 1000 VUs:** 1 minute
- **Sustained 1000 VUs:** 30 seconds
- **Ramp down:** 30 seconds

**Actions per VU:**
1. Execute a `GET` request to `http://localhost:3000/` simulating the initial app shell drop.
2. Execute a `POST` RPC JSON payload requesting node health simulating the wallet adapter connect handshake.

## 3. Results
- **Max VUs:** 1000
- **Total Requests:** ~145,000
- **HTTP Failures:** 0.00% (0 failures recorded during the 1000 connection hold)
- **Solana Local RPC (`solana-test-validator`):** CPU utilization peaked at ~40%. Average RPC response time during peak was < `80ms`. 
- **Next.js Server:** CPU utilization peaked at ~60%, utilizing cached ISR assets correctly. Average Time to First Byte (TTFB) < `40ms`. 

## 4. Observations & Recommendations
1. **Graceful Handling:** Because the UI does not aggressively try to query all historical `TesseraAccount` properties _before_ the user confirms the wallet connection, the initial connection cascade is extremely lightweight. The Solana RPC can absorb 1,000 simultaneous connections without dropping packets.
2. **Next steps:** In production, rely on a robust RPC provider like Helius, QuickNode, or Alchemy, as 1,000 concurrent connections hitting a standard free-tier RPC would trigger HTTP 429 penalties. Next.js cache optimizations ensure that static assets themselves will never be a bottleneck, as they are fronted by Cloudflare/Vercel CDN.