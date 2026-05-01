# Multi-Admin Smart Contract Upgrade Guide

## Overview

This guide covers upgrading the TradeVault Arena smart contract from single-admin to multi-admin architecture and redeploying it on Vara network.

---

## 🔄 What Changed

### Before (Single Admin)
```rust
pub struct ArenaState {
    pub admin: ActorId,  // Only one admin
    pub current_btc_price: u128,
    pub next_tournament_id: TournamentId,
    pub tournaments: BTreeMap<TournamentId, Tournament>,
}
```

### After (Multi-Admin)
```rust
pub struct ArenaState {
    pub admins: Vec<ActorId>,  // Multiple admins supported
    pub current_btc_price: u128,
    pub next_tournament_id: TournamentId,
    pub tournaments: BTreeMap<TournamentId, Tournament>,
}
```

---

## 🆕 New Admin Management Functions

### 1. **Get All Admins**
```rust
pub fn admins(&self) -> Vec<ActorId>
```
- **Returns**: List of all current admins
- **Permission**: Public (read-only)
- **Example**: Get all admins from the contract

### 2. **Add Admin**
```rust
pub fn add_admin(&mut self, new_admin: ActorId) -> Result<Vec<ActorId>, ArenaError>
```
- **Parameters**: `new_admin` - ActorId (wallet address) to add as admin
- **Returns**: Updated list of admins
- **Permission**: Admin-only
- **Errors**: 
  - `Unauthorized` - Caller is not an admin
  - `MathOverflow` - Unlikely, but possible in extreme cases

### 3. **Remove Admin**
```rust
pub fn remove_admin(&mut self, admin_to_remove: ActorId) -> Result<Vec<ActorId>, ArenaError>
```
- **Parameters**: `admin_to_remove` - ActorId to remove from admins
- **Returns**: Updated list of admins
- **Permission**: Admin-only
- **Errors**:
  - `Unauthorized` - Caller is not an admin
  - `CannotRemoveAllAdmins` - Cannot remove if only 1 admin remains
  - **Note**: At least 1 admin must always exist

---

## 🚀 Redeployment Steps for Vara

### Prerequisites
- Vara CLI installed: `https://docs.vara.network/`
- Rust toolchain: `rustup update`
- Cargo installed
- Access to Vara testnet/mainnet account with funds for gas

### Step 1: Prepare the Smart Contract

```bash
# Navigate to project root
cd d:\TradeArena

# Update dependencies
cargo update

# Build the contract (creates WASM binary)
cargo build --release
```

### Step 2: Generate IDL (Interface Definition Language)

The IDL file defines the contract's interface for clients:

```bash
# The build process should generate:
# - client/tradevault_arena_client.idl
# - WASM binary for deployment
```

### Step 3: Compile to Wasm32 Target

```bash
# Ensure wasm32 target is installed
rustup target add wasm32-unknown-unknown

# Build for Vara (wasm32)
cargo build --release --target wasm32-unknown-unknown
```

### Step 4: Deploy on Vara Testnet

#### Option A: Using Vara CLI

```bash
# Install Vara CLI
npm install -g @vara-js/cli

# Deploy contract
vara contract deploy \
  --wasm ./target/wasm32-unknown-unknown/release/tradevault_arena.wasm \
  --name "TradeVault Arena Multi-Admin" \
  --network testnet
```

#### Option B: Using JavaScript/TypeScript Client

Create a deployment script:

```typescript
import { GearApi } from '@gear-js/api';
import * as fs from 'fs';

async function deployContract() {
  const api = await GearApi.create({
    providerAddress: 'wss://testnet.vara.network', // or mainnet
  });

  const code = fs.readFileSync('./target/wasm32-unknown-unknown/release/tradevault_arena.wasm');
  const initialBalance = 1_000_000_000_000_000n; // Initial BTC price (1 million with scaling)

  // Upload code
  const codeId = await api.code.upload(code);
  console.log('Code ID:', codeId);

  // Create contract instance
  const contractId = await api.program.create(codeId, initialBalance);
  console.log('Contract ID:', contractId);

  api.disconnect();
}

deployContract().catch(console.error);
```

#### Option C: Using Vara Portal (GUI)

1. Go to [Vara Portal](https://idea.gear.rs)
2. Navigate to "Upload Program"
3. Select the compiled WASM file
4. Set initial parameters (initial_btc_price)
5. Sign and submit transaction

### Step 5: Initialize First Admin

After deployment, the deployer becomes the first admin automatically.

```typescript
// Frontend integration example
async function addSecondAdmin(
  contractId: string,
  secondAdminAddress: string,
  signingAccount: Account
) {
  const api = await GearApi.create();
  
  const { TransactionBuilder } = await import('@gear-js/api');
  
  const txn = new TransactionBuilder()
    .addInstruction({
      type: 'Call',
      destination: contractId,
      payload: {
        kind: 'AddAdmin',
        newAdmin: secondAdminAddress,
      },
    })
    .build();

  const txHash = await api.tx(signingAccount).signAndSend(txn);
  console.log('Transaction hash:', txHash);
  
  api.disconnect();
}
```

### Step 6: Verify Deployment

```bash
# Check contract state (example with Vara CLI)
vara contract read <CONTRACT_ID> --network testnet

# Or via API
curl https://testnet-indexer.vara.network/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query { program(id: \"<CONTRACT_ID>\") { id, name } }"}'
```

---

## 🔄 Migration from Old to New Contract

If you have an existing single-admin contract and want to migrate:

### Option 1: Manual Migration (Recommended)

1. **Deploy new multi-admin contract** on Vara
2. **Add existing admins** using the new `add_admin()` function
3. **Migrate tournament data** using a backend script
4. **Update frontend** to point to new contract ID
5. **Announce** the migration to users

### Option 2: State Migration Script

```rust
// Example migration helper (not part of contract)
use sails_rs::prelude::*;

pub fn migrate_admins(old_admin: ActorId) -> Vec<ActorId> {
    vec![old_admin]
}
```

---

## 🛡️ Security Best Practices

### 1. **Admin Management**
- Never remove the last admin
- Add co-admins from different wallet addresses
- Regularly review the admin list
- Remove inactive admins

### 2. **Transaction Safety**
```typescript
// Always check admin list before executing sensitive operations
async function verifyAdminExists(contractId: string, address: string) {
  const admins = await contractService.getAdmins(contractId);
  return admins.includes(address);
}
```

### 3. **Role Separation** (Future Enhancement)
Consider implementing different admin roles:
```rust
pub enum AdminRole {
    SuperAdmin,    // Can add/remove admins
    TournamentAdmin, // Can create tournaments
    KeeperAdmin,   // Can update prices
}
```

---

## 📝 Integration with Frontend

### Update Configuration

In [frontend/src/config.ts](../../frontend/src/config.ts):

```typescript
export const CONTRACTS = {
  ARENA: {
    OLD_ID: '0x...', // Previous contract
    NEW_ID: '0x...', // New multi-admin contract
    VARA_NETWORK: 'testnet', // or 'mainnet'
  },
};
```

### Update Client Calls

```typescript
// Get all admins
const admins = await arenaClient.admins();
console.log('Current admins:', admins);

// Add new admin (admin-only)
const updatedAdmins = await arenaClient.addAdmin(newWalletAddress);

// Remove admin (admin-only)
const remaining = await arenaClient.removeAdmin(adminToRemove);
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run tests
cargo test --release

# Run specific test
cargo test test_multi_admin -- --nocapture
```

### Integration Tests

```bash
# Test on Vara testnet
cargo test --features=integration-test --release
```

### Manual Testing Checklist

- [ ] Single admin can create tournaments
- [ ] Multiple admins can each create tournaments
- [ ] Non-admin cannot create tournaments
- [ ] Add new admin successfully
- [ ] Remove admin successfully
- [ ] Cannot remove last admin
- [ ] All existing functions work with new structure
- [ ] Events emit correctly

---

## ⚠️ Common Issues & Solutions

### Issue: "Unauthorized" error for existing admin
**Solution**: Ensure the wallet is in the admins list
```typescript
const admins = await contract.admins();
console.log('Contract admins:', admins);
console.log('My address:', myAddress);
```

### Issue: WASM binary too large
**Solution**: Enable optimizations in Cargo.toml
```toml
[profile.release]
opt-level = 'z'
lto = true
strip = true
```

### Issue: Deployment gas limit exceeded
**Solution**: Upload code first, then create instance separately
```bash
# Two-step process
vara code upload --wasm ./contract.wasm --network testnet
vara program create --code-id <CODE_ID> --args <INIT_ARGS> --network testnet
```

---

## 📊 Contract Upgrade Timeline

| Phase | Action | Timeline |
|-------|--------|----------|
| **1** | Deploy new contract on testnet | Immediate |
| **2** | Test multi-admin functionality | 1-2 days |
| **3** | Audit & security review | 3-5 days |
| **4** | Deploy to mainnet | After audit |
| **5** | Migrate active tournaments | 1-2 weeks |
| **6** | Sunset old contract | 30+ days |

---

## 🔗 Useful Resources

- [Vara Documentation](https://docs.vara.network/)
- [Gear Smart Contracts](https://docs.gear.rs/)
- [Sails-rs Framework](https://docs.gear.rs/developing-contracts/sails/)
- [Vara JS API](https://docs.vara.network/api/javascript/)
- [Smart Contract Security](https://docs.vara.network/security/)

---

## 📞 Support

For issues or questions:
- Check the [Vara Discord](https://discord.gg/vara)
- Review [deployment logs](#deployment-logs)
- Check contract events for errors

---

## 📄 Deployment Logs

### Example Successful Deployment
```
[2026-04-29T10:30:00] Uploading WASM binary...
[2026-04-29T10:30:05] Code ID: 0xabcd1234...
[2026-04-29T10:30:10] Creating contract instance...
[2026-04-29T10:30:15] Contract ID: 0xefgh5678...
[2026-04-29T10:30:16] ✓ Deployment successful!
[2026-04-29T10:30:20] Initial admin: 0x1234...
```

