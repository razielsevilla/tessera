#!/usr/bin/env bash
# =============================================================================
# Tessera — Solana Local Dev Environment Setup (WSL Ubuntu)
# Run: bash /mnt/c/Users/Raziel/OneDrive/Documents/06_Projects/Tessera/scripts/setup-solana-wsl.sh
# =============================================================================
set -e

TESSERA_PATH="/mnt/c/Users/Raziel/OneDrive/Documents/06_Projects/Tessera"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Tessera — Solana CLI Setup (Phase 0)       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: System dependencies ──────────────────────────────────────────────
echo "▶ [1/6] Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
  build-essential pkg-config libssl-dev libudev-dev curl git \
  ca-certificates 2>&1 | tail -5
echo "  ✓ Dependencies installed"

# ── Step 2: Rust toolchain ────────────────────────────────────────────────────
echo ""
echo "▶ [2/6] Installing Rust toolchain..."
if command -v rustup &>/dev/null; then
  echo "  ✓ Rust already installed: $(rustc --version)"
else
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --quiet
  echo "  ✓ Rust installed"
fi
source "$HOME/.cargo/env" 2>/dev/null || true

# ── Step 3: Solana CLI ────────────────────────────────────────────────────────
echo ""
echo "▶ [3/6] Installing Solana CLI (stable)..."
if command -v solana &>/dev/null; then
  echo "  ✓ Solana already installed: $(solana --version)"
else
  sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
  echo "  ✓ Solana CLI installed"
fi

# Add Solana to PATH in .bashrc
SOLANA_PATH_LINE='export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"'
if ! grep -q "solana/install/active_release" "$HOME/.bashrc"; then
  echo "" >> "$HOME/.bashrc"
  echo "# Solana CLI" >> "$HOME/.bashrc"
  echo "$SOLANA_PATH_LINE" >> "$HOME/.bashrc"
fi
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# ── Step 4: Configure devnet ──────────────────────────────────────────────────
echo ""
echo "▶ [4/6] Configuring Solana for localhost devnet..."
mkdir -p "$HOME/.config/solana"
if [ ! -f "$HOME/.config/solana/id.json" ]; then
  solana-keygen new --outfile "$HOME/.config/solana/id.json" --no-bip39-passphrase --silent
  echo "  ✓ New dev keypair generated"
else
  echo "  ✓ Existing keypair found"
fi
solana config set --url localhost --quiet
echo "  ✓ Cluster set to localhost (http://localhost:8899)"

# ── Step 5: Anchor AVM ───────────────────────────────────────────────────────
echo ""
echo "▶ [5/6] Installing Anchor Version Manager (AVM)..."
if command -v avm &>/dev/null; then
  echo "  ✓ AVM already installed: $(avm --version)"
else
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --quiet 2>&1 | tail -3
  echo "  ✓ AVM installed"
fi

AVM_PATH_LINE='export PATH="$HOME/.avm/bin:$PATH"'
if ! grep -q ".avm/bin" "$HOME/.bashrc"; then
  echo "" >> "$HOME/.bashrc"
  echo "# Anchor AVM" >> "$HOME/.bashrc"
  echo "$AVM_PATH_LINE" >> "$HOME/.bashrc"
fi
export PATH="$HOME/.avm/bin:$PATH"

# Install latest Anchor
echo "  Installing Anchor (latest)..."
avm install latest 2>&1 | tail -3
avm use latest
echo "  ✓ Anchor ready: $(anchor --version)"

# ── Step 6: Tessera alias ──────────────────────────────────────────────────
echo ""
echo "▶ [6/6] Configuring Tessera workspace alias..."
ALIAS_LINE="alias cdtessera='cd $TESSERA_PATH'"
if ! grep -q "cdtessera" "$HOME/.bashrc"; then
  echo "" >> "$HOME/.bashrc"
  echo "# Tessera project shortcut" >> "$HOME/.bashrc"
  echo "$ALIAS_LINE" >> "$HOME/.bashrc"
fi

# Cargo env always available
if ! grep -q 'cargo/env' "$HOME/.bashrc"; then
  echo "" >> "$HOME/.bashrc"
  echo 'source "$HOME/.cargo/env"' >> "$HOME/.bashrc"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Setup complete! Verification:            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Solana CLI:  $(solana --version)"
echo "  Keypair:     $(solana-keygen pubkey $HOME/.config/solana/id.json)"
echo "  Config:"
solana config get
echo ""
echo "  Anchor:      $(anchor --version)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next step: start the local validator with:"
echo "    wsl -d Ubuntu-24.04 -- solana-test-validator"
echo ""
echo "  Then in another terminal, airdrop test SOL:"
echo "    wsl -d Ubuntu-24.04 -- solana airdrop 10"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
