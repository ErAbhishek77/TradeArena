# TradeVault Arena Deployment Guide

This guide deploys the MVP to Vara testnet and connects the frontend to the live program.

## Target Network

- RPC: `wss://testnet.vara.network`
- Frontend env: `VITE_NODE_ENDPOINT=wss://testnet.vara.network`

## Prerequisites

- Rust toolchain with the project already building
- `cargo-sails`
- Node.js and npm
- `vara-wallet`
- a Vara-compatible browser wallet for the frontend
- `jq` for shell extraction in the examples below

Install `vara-wallet` if needed:

```bash
npm install -g vara-wallet
```

## 1. Build Release Artifacts

From the project root:

```bash
cargo build --release
```

Deploy these files:

```bash
target/wasm32-gear/release/tradevault_arena.opt.wasm
target/wasm32-gear/release/tradevault_arena.idl
```

Use `.opt.wasm` for deployment. The plain `.wasm` is an intermediate artifact.

## 2. Prepare A Testnet Wallet

Configure `vara-wallet` for testnet:

```bash
vara-wallet config set network testnet
```

Create or import an admin wallet:

```bash
vara-wallet wallet create --name arena-admin
vara-wallet wallet list
```

Fund it with testnet VARA:

```bash
vara-wallet faucet
vara-wallet --network testnet balance
```

You can also use the Gear IDEA portal for testnet funding if needed.

## 3. Upload And Initialize The Program

TradeVault Arena's constructor is:

- `Create(initial_btc_price: u128)`

Example deployment with initial mock price `$100000`:

```bash
UPLOAD=$(vara-wallet --network testnet --account arena-admin program upload \
  ./target/wasm32-gear/release/tradevault_arena.opt.wasm \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl \
  --init Create \
  --args '[100000]' \
  --value 3000000000000)

PROGRAM_ID=$(echo "$UPLOAD" | jq -r .programId)
echo "$PROGRAM_ID"
```

Why the constructor value matters:

- `3000000000000` raw units equals `3 VARA`
- the MVP uses a reward-claim flow after settlement
- keeping a small reserve on the program account makes payout claims safer than deploying with zero constructor value

## 4. Verify The Deployment

Check the admin and starting BTC price:

```bash
vara-wallet call "$PROGRAM_ID" TradevaultArena/Admin \
  --args '[]' \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl

vara-wallet call "$PROGRAM_ID" TradevaultArena/CurrentMockPrice \
  --args '[]' \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl
```

List tournaments before creation:

```bash
vara-wallet call "$PROGRAM_ID" TradevaultArena/Tournaments \
  --args '[]' \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl
```

## 5. Create A Tournament

Example shell timestamps:

```bash
NOW_MS=$(python3 - <<'PY'
import time
print(int(time.time() * 1000))
PY
)

START_MS=$((NOW_MS + 300000))
END_MS=$((NOW_MS + 3600000))
```

Create a tournament:

```bash
vara-wallet --network testnet --account arena-admin call "$PROGRAM_ID" TradevaultArena/CreateTournament \
  --args "[\"Weekend BTC Sprint\", 5000000000000, $START_MS, $END_MS, 1000, 25]" \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl
```

That example creates:

- entry fee: `5 VARA` in raw units
- initial virtual balance: `1000`
- max participants: `25`

## 6. Connect The Frontend

From the project root:

```bash
cd frontend
npm install
cp .env.example .env
```

Set:

```bash
VITE_NODE_ENDPOINT=wss://testnet.vara.network
VITE_PROGRAM_ID=0xYOUR_PROGRAM_ID
```

Then run:

```bash
npm run dev
```

Open the local Vite URL, connect the browser wallet, and verify:

- the current mock BTC price loads
- the tournament list loads
- the admin wallet sees the admin desk

## 7. Demo Sequence

### Admin

1. Create a tournament that starts a few minutes in the future.
2. Share the frontend with participant wallets.
3. Update the mock BTC price during the active window.
4. After `end_time`, click `End Tournament`.
5. Click `Settle Prize Pool`.

### Participants

1. Connect wallet.
2. Join before start time.
3. Open long or short once the event becomes active.
4. Close position when desired.
5. After settlement, click `Claim Reward` if eligible.

## 8. Optional CLI Admin Actions

Update the mock BTC price:

```bash
vara-wallet --network testnet --account arena-admin call "$PROGRAM_ID" TradevaultArena/UpdateMockPrice \
  --args '[102500]' \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl
```

End the first tournament:

```bash
vara-wallet --network testnet --account arena-admin call "$PROGRAM_ID" TradevaultArena/EndTournament \
  --args '[1]' \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl
```

Settle the first tournament:

```bash
vara-wallet --network testnet --account arena-admin call "$PROGRAM_ID" TradevaultArena/SettleTournament \
  --args '[1]' \
  --idl ./target/wasm32-gear/release/tradevault_arena.idl
```

## 9. Troubleshooting

### Program ID missing in frontend

- set `VITE_PROGRAM_ID` in `frontend/.env`
- or paste the deployed ID into the program input in the UI

### Wallet can connect but cannot transact

- confirm the wallet account has TVARA
- confirm the wallet is on Vara-format addresses
- confirm the browser extension is allowed for the frontend origin

### Join fails

- user may already be joined
- tournament may already be active
- attached entry fee must match exactly

### Settle fails

- the tournament must be explicitly ended first
- settlement is admin-only
- `end_time` must already be in the past

### Reward claim fails

- only settled tournaments expose claimable rewards
- only winning wallets should have non-zero `claimable_reward`

## 10. Post-Deploy Checklist

- contract uploaded from `tradevault_arena.opt.wasm`
- program ID recorded
- admin query verified
- price query verified
- tournament created
- frontend `.env` configured
- admin wallet can update the mock BTC price
- participant wallet can join
- settlement and claim flow tested once end time passes
