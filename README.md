# TradeVault Arena

TradeVault Arena is an MVP Vara dApp for synthetic trading tournaments. An admin creates a time-bound BTC/USD tournament, players pay the same entry fee, receive the same virtual starting balance, trade one mock pair with long or short positions, and finish ranked by percentage return. After the tournament ends, the top 3 wallets split the prize pool 60/30/10.

The project is intentionally narrow:

- one Sails program
- one mock market: `BTC/USD`
- one open position per participant
- no leverage
- no liquidation
- no oracle or DEX integration

## What Is Included

- Sails contract in [`app/src/lib.rs`](app/src/lib.rs)
- generated Rust client and checked-in IDL in [`client`](client)
- gtests in [`tests/gtest.rs`](tests/gtest.rs)
- React + Vite frontend in [`frontend`](frontend)
- product notes in [`docs/plans`](docs/plans)
- deployment guide in [`docs/deployment-guide.md`](docs/deployment-guide.md)

## MVP Feature Set

- Admin tournament creation
- Entry-fee based join flow
- Isolated participant vault state
- Mock BTC price management by admin
- Open and close synthetic long or short positions
- Live score calculation from realized plus unrealized PnL
- Leaderboard ranked by return percentage
- Post-end settlement
- Top-3 payout allocation
- Winner reward claim flow
- Testnet-ready frontend with Vara wallet connection and deployed program defaults

## Deployed Testnet Program

- Program ID: `0x2db313ddb41fa625b556bf3557e500fb7d80e1a360cabaf2d065826741bbadd2`
- Network endpoint: `wss://testnet.vara.network`
- Frontend IDL snapshot: [`frontend/src/assets/tradevault_arena_client.idl`](frontend/src/assets/tradevault_arena_client.idl)

The checked-in frontend IDL snapshot is synced from:

- `target/wasm32-gear/release/tradevault_arena.idl`

## Contract Model

Each tournament stores:

- `tournament_id`
- `name`
- `entry_fee`
- `start_time`
- `end_time`
- `initial_virtual_balance`
- `max_participants`
- `status`
- `prize_pool`

Each participant stores:

- `initial_virtual_balance`
- `realized_pnl`
- `optional open position`
- `claimable_reward`

Final score uses the current or frozen BTC price:

`final_value = initial_virtual_balance + realized_pnl + unrealized_pnl`

Ranking uses:

`return_percentage = ((final_value - initial_virtual_balance) / initial_virtual_balance) * 100`

## Build And Test

### Contract

```bash
cargo build
cargo build --release
```

Release artifacts land at:

- `target/wasm32-gear/release/tradevault_arena.opt.wasm`
- `target/wasm32-gear/release/tradevault_arena.idl`

### Tests

```bash
cargo test --test gtest
```

Current local verification:

- contract compiles
- `cargo test --test gtest` passes
- frontend production build passes

## Frontend

The frontend uses:

- React 18
- Vite
- `sails-js`
- `@gear-js/api`
- `@tanstack/react-query`
- browser wallet extensions via injected Vara-compatible Substrate signers

### Install And Run

```bash
cd frontend
npm install
```

The project already includes a local `.env` pointing at the deployed TradeVault Arena testnet program. To recreate it manually:

```bash
cp .env.example .env
```

Env values:

```bash
VITE_VARA_ENDPOINT=wss://testnet.vara.network
VITE_PROGRAM_ID=0x2db313ddb41fa625b556bf3557e500fb7d80e1a360cabaf2d065826741bbadd2
```

Then start the app locally:

```bash
npm run dev
```

The UI still lets you override the program ID from the control panel if you want to point the frontend at another deployment.

### Frontend Build

```bash
cd frontend
npm run build
```

## Deployment

Use the release `.opt.wasm` artifact, not the plain `.wasm`.

The step-by-step testnet flow is documented in [`docs/deployment-guide.md`](docs/deployment-guide.md).

Important deployment note:

- send constructor value with a small reserve, for example `3000000000000` raw units (`3 VARA`)
- this reserve keeps payout-claim transfers healthy after settlement
- do not deploy this program with zero attached value for the constructor in the MVP flow

## Demo Flow

1. Start the frontend with `cd frontend && npm run dev`.
2. Open the app and confirm it is connected to `wss://testnet.vara.network`.
3. Connect the deployed contract admin wallet to unlock admin actions.
4. Create a tournament with a start time a few minutes in the future.
5. Connect 2-4 participant wallets and join with the exact entry fee before the start time.
6. When the tournament becomes active, participants open long or short BTC/USD positions.
7. Admin updates the mock BTC price to move participant PnL.
8. Participants close positions to realize gains or losses.
9. After `end_time`, admin ends the tournament and settles it.
10. Winners claim rewards from the settled prize pool.

## Useful Paths

- Contract: [`app/src/lib.rs`](app/src/lib.rs)
- Tests: [`tests/gtest.rs`](tests/gtest.rs)
- Frontend app: [`frontend/src/App.tsx`](frontend/src/App.tsx)
- Frontend chain integration: [`frontend/src/lib/arena.ts`](frontend/src/lib/arena.ts)
- Frontend provider and wallet integration: [`frontend/src/providers/chain-provider.tsx`](frontend/src/providers/chain-provider.tsx)
- Frontend formatting helpers: [`frontend/src/lib/format.ts`](frontend/src/lib/format.ts)
- IDL snapshot: [`client/tradevault_arena_client.idl`](client/tradevault_arena_client.idl)
- Deployment guide: [`docs/deployment-guide.md`](docs/deployment-guide.md)

## Notes

- Prize payouts are computed during settlement and claimed by winners afterward.
- The admin wallet is the deployer account.
- The frontend defaults to program `0x2db313ddb41fa625b556bf3557e500fb7d80e1a360cabaf2d065826741bbadd2` on `wss://testnet.vara.network`.
- This repository is MVP-scoped and not production-hardened.
