#!/bin/bash
set -e

echo "Building zk-confession-box contract..."
cargo build --target wasm32-unknown-unknown --release

# Path to wasm
WASM_PATH="target/wasm32-unknown-unknown/release/zk_confession_box.wasm"

# Optimized wasm
soroban contract optimize --wasm $WASM_PATH

OPTIMIZED_WASM="target/wasm32-unknown-unknown/release/zk_confession_box.optimized.wasm"

echo "Deploying to Stellar Testnet..."
# Assumes 'deployer' identity is configured and funded
CONTRACT_ID=$(stellar contract deploy \
  --wasm $OPTIMIZED_WASM \
  --source deployer \
  --network testnet)

echo "Contract deployed successfully!"
echo "CONTRACT_ID=$CONTRACT_ID"

# Save to .env
echo "ZK_CONFESSION_BOX_ID=$CONTRACT_ID" >> .env

echo "Generating TypeScript bindings..."
bun run bindings
