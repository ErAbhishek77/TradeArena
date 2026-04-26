# Task Plan

## Goal
Ship a demo-ready Vara MVP for a synthetic trading tournament with contract, tests, frontend, and deployment documentation.

## Preconditions
- Standard Sails workspace scaffold exists
- Rust toolchain and `cargo sails` are available
- Contract builds before frontend work starts

## Ordered Tasks
1. Replace the template contract with TradeVault Arena state, DTOs, events, errors, and public routes.
2. Make `cargo build` pass and confirm the IDL is generated from the standard build pipeline.
3. Add `gtest` coverage for tournament creation, joining, trading flow, leaderboard ranking, and settlement payouts.
4. Scaffold or build a React frontend that consumes the generated IDL and supports wallet-bound writes plus read-only tournament views.
5. Add deployment, config, and demo-run documentation for Vara testnet.

## Dependencies
- Contract DTOs and route names drive the generated clients
- Tests depend on a compiling contract and generated Rust client
- Frontend depends on the generated IDL and deployed program ID

## Verification Steps
- `cargo build`
- `cargo test`
- Frontend install and production build
- Manual demo flow on local or testnet using the deployed program

## Review Checkpoints
- Contract surface matches MVP scope only
- Prize pool transfers happen on settlement
- Leaderboard is ranked by return percentage, not raw PnL
- Frontend disables signed actions when wallet state is not ready

## Rollback Notes
- Revert contract and frontend changes together if the route or IDL contract changes
- If a deployed testnet program is replaced, update the frontend env back to the previous program ID
