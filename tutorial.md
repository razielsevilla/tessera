# Tessera Application Tutorial

Welcome to the Tessera application! This tutorial outlines the core pages of the app, how to use them, and the expected outputs for your actions. 

Tessera is built to log your life experiences, media, and interactive fiction, turning them into cryptographic zero-knowledge proofs and visual mosaics on the Solana blockchain.

---

## 1. Landing Page (`/`)

The home page serves as the entry point and introduction to the Tessera ecosystem.

* **How to use it**: 
  * Connect your Solana wallet using the provided connect button.
  * Read through the introduction of what Tessera does (Zero-Knowledge life logging and Mosaic generation).
* **Expected Output**: 
  * Once the wallet is connected securely, you will be authenticated and have the option to navigate to the `/dashboard`.

---

## 2. User Dashboard (`/dashboard`)

This is the main hub where you track and visualize your activities.

### Personal Retrospective
A sub-section of the dashboard acting as a secure digital journal.
* **How to use it**:
  * Write your thoughts in the "Journal Entry" text area and give it a title/date.
  * Click **Encrypt & Store Locally** to cryptographically secure your entry using the local Rust engine (`encrypt.rs`) so it remains completely private.
  * Click **Distill Insight ✨** to process your entry (likely using AI) to extract key themes, summaries, or meaningful patterns from your reflection.
* **Expected Output**:
  * An encrypted version of your journal is saved securely on your local device. 
  * If using the Distill Insight button, you will receive a generated summary or reflection on your writing.

### Other Dashboard Features
* **Mosaic Canvas**: View your generated "Mosaic", a visual representation of your logged data.
* **Logging Activities**: Use the available trackers (such as the `MediaLogger`, `InteractiveFictionLogger`, or general `LifeEconomyTracker`) to input new experiences.
* **Minting**: Access the `MintForm` to mint your recent life economy data onto the Solana blockchain as an encrypted or zero-knowledge asset.
* **Expected Output**:
  * **On Logging**: The local state updates, displaying your new activities.
  * **On Minting**: A transaction is sent to your Solana wallet. Upon approval, your data is cryptographically processed (using the Tessera WASM engine), committed to the blockchain, and your visual Mosaic Canvas updates to reflect the newly minted "tiles".

---

## 3. ZK Proof Generation (`/prove`)

This page handles the privacy-preserving aspects of your logged data. It allows you to prove you have certain data or have completed certain activities without revealing the underlying data itself.

* **How to use it**:
  * Select specific activity logs or milestones you want to generate a proof for (e.g., "I have logged over 100 hours of media").
  * Click the "Generate Proof" button. Behind the scenes, the browser utilizes the `tessera-engine` (WASM) and `.zkey` circuit files to generate a Zero-Knowledge proof locally.
* **Expected Output**:
  * The application computes the math locally and outputs a verifiable cryptographic proof.
  * A success message will appear showing confirming the proof was generated and verified successfully by the application's smart contracts.

---

## 4. Embed Widget (`/embed`)

This page allows you to share your Tessera Mosaic externally on your own websites, blogs, or social profiles.

* **How to use it**:
  * Select the specific Mosaic or dataset you wish to showcase.
  * Copy the generated `<iframe>` code snippet.
* **Expected Output**:
  * A lightweight, read-only view of your Mosaic Canvas that you can safely embed elsewhere without exposing your private keys or sensitive underlying data.

---

### General Tips

* **Wallet Required**: Most interactions (minting, proving, updating dashboard state) require a confirmed Solana wallet connection.
* **Local Processing**: Computation relating to Zero-Knowledge proofs and encryption (like standard image parsing or hash derivation) happens right in your browser via WebAssembly (WASM) to ensure your data stays private.
