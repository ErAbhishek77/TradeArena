# Quick Vara Deployment Guide

## Prerequisites Setup

```bash
# Install Rust and wasm32 target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Vara CLI
npm install -g @vara-js/cli

# Or use cargo-gear (official Gear deployment tool)
cargo install cargo-gear
```

## Build Smart Contract

```bash
# Navigate to project root
cd d:\TradeArena

# Build release binary
cargo build --release --target wasm32-unknown-unknown

# Output location:
# target/wasm32-unknown-unknown/release/tradevault_arena.wasm
```

## Deployment Methods

### Method 1: Using cargo-gear (Easiest)

```bash
# Install cargo-gear
cargo install cargo-gear

# Deploy directly
cargo gear build
cargo gear submit --program ./target/gear/tradevault_arena.wasm \
  --args "1000000000000000" \
  --network vara-testnet
```

### Method 2: Using Vara CLI

```bash
# Ensure you're in the contract directory
cd d:\TradeArena

# Deploy contract
vara deploy \
  --wasm ./target/wasm32-unknown-unknown/release/tradevault_arena.wasm \
  --payload "0x00e8764817000000" \
  --network testnet
```

### Method 3: Using Python Script (Vara Network)

```bash
# Install substrate SDK
pip install substrate-interface

# Then run deployment script
python scripts/deploy_to_vara.py
```

## Vara Deployment Configuration

### Vara Testnet
```
Network: wss://testnet.vara.network
Chain: Vara Testnet
Gas multiplier: 1.5x
Min balance: 10 VARA for testnet
```

### Vara Mainnet
```
Network: wss://mainnet.vara.network
Chain: Vara Mainnet
Gas multiplier: 2.0x
Min balance: 50 VARA for mainnet
```

## Verify Deployment

```bash
# Check if contract exists
vara contract info <CONTRACT_ID> --network testnet

# Read contract state
vara contract read <CONTRACT_ID> \
  --method "admins" \
  --network testnet

# Get all admins
vara contract read <CONTRACT_ID> \
  --method "admins" \
  --network testnet \
  --format json
```

## Add Additional Admin (After Deployment)

```bash
# Call add_admin function
vara call <CONTRACT_ID> \
  --method "addAdmin" \
  --args "[\"<NEW_ADMIN_ADDRESS>\"]" \
  --network testnet
```

## Frontend Integration

### Update Provider Config

In `frontend/src/config.ts`:

```typescript
export const VARA_CONFIG = {
  testnet: {
    rpc: 'wss://testnet.vara.network',
    contractId: '<YOUR_DEPLOYED_CONTRACT_ID>',
    network: 'testnet',
  },
  mainnet: {
    rpc: 'wss://mainnet.vara.network',
    contractId: '<YOUR_DEPLOYED_CONTRACT_ID>',
    network: 'mainnet',
  },
};

export const CURRENT_NETWORK = process.env.REACT_APP_VARA_NETWORK || 'testnet';
```

### Call Contract Methods

```typescript
import { GearApi } from '@gear-js/api';

async function getAdmins(contractId: string) {
  const api = await GearApi.create({
    providerAddress: 'wss://testnet.vara.network',
  });

  const { AdminsReply } = await import('@gear-js/api');
  
  const state = await api.programState.read(contractId, AdminsReply);
  console.log('Admins:', state.admins);
  
  api.disconnect();
}
```

## Troubleshooting

### Error: "Insufficient balance for gas"
```bash
# Request testnet VARA from faucet
# Visit: https://testnet.vara.network/faucet
```

### Error: "WASM binary too large"
```bash
# Optimize build
cargo build --release \
  --target wasm32-unknown-unknown \
  -Z build-std=core \
  --no-default-features
```

### Error: "Contract not found"
```bash
# Verify contract ID is correct
vara contract info <CONTRACT_ID> --network testnet --verbose
```

## Monitoring Deployment

### View Transaction Status
```bash
# Using explorer
# Testnet: https://testnet.vara.network/explorer
# Mainnet: https://vara.network/explorer
```

### Track Gas Usage
```bash
# Check contract state size
vara contract size <CONTRACT_ID>

# Get contract metadata
vara contract metadata <CONTRACT_ID>
```

## Multi-Admin Setup After Deployment

```bash
# Get current admins
vara contract read <CONTRACT_ID> \
  --method "admins" \
  --network testnet

# Add first additional admin
vara call <CONTRACT_ID> \
  --method "addAdmin" \
  --args "[\"0x<SECOND_ADMIN_ADDRESS>\"]" \
  --signer <DEPLOYER_KEY_FILE>

# Add second additional admin
vara call <CONTRACT_ID> \
  --method "addAdmin" \
  --args "[\"0x<THIRD_ADMIN_ADDRESS>\"]" \
  --signer <DEPLOYER_KEY_FILE>

# Verify admins were added
vara contract read <CONTRACT_ID> \
  --method "admins" \
  --network testnet
```

## Rollback Plan

If issues occur:

```bash
# Switch frontend to old contract
# Update CONTRACTS config to point to old CONTRACT_ID

export OLD_CONTRACT_ID="0x<previous_contract>"
export CURRENT_CONTRACT_ID="$OLD_CONTRACT_ID"

# Users will automatically use old contract
```

## Performance Tips

1. **Gas Optimization**
   - Use `--release` flag always
   - Enable LTO in Cargo.toml

2. **Deployment Speed**
   - Use testnet first
   - Test all functions before mainnet

3. **Cost Reduction**
   - Batch operations when possible
   - Use read-only calls for queries

## Useful Commands Cheatsheet

```bash
# Build
cargo build --release --target wasm32-unknown-unknown

# Deploy (testnet)
vara deploy --wasm ./target/wasm32-unknown-unknown/release/tradevault_arena.wasm --network testnet

# Get admins
vara contract read <ID> --method "admins" --network testnet

# Add admin
vara call <ID> --method "addAdmin" --args "[\"<ADDRESS>\"]" --network testnet

# Check contract
vara contract info <ID> --network testnet

# Get state
vara contract read <ID> --method "currentMockPrice" --network testnet
```

---

**Last Updated**: 2026-04-29
**Contract Version**: Multi-Admin v0.1.0
**Vara Network Status**: [Check Status](https://vara.network/status)

