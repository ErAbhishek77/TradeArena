# Architecture Note

## Summary
Trade Arena is a single-program, single-service Sails MVP. The program owns all state in a `RefCell`, and the service exposes admin routes, player routes, and read-only leaderboard queries. Prize pool value is stored in the program account through join payments and paid out during settlement.

## Program And Service Boundaries
- `Program` constructor stores the admin and initial mock BTC price.
- One `tradevault_arena` service exposes all public routes for MVP simplicity.
- Domain logic stays in the service; the program only owns state and exposes the service.

## State Ownership
- Program-owned `ArenaState` in `RefCell`
- `ArenaState` holds:
  - `admin`
  - `current_btc_price`
  - `next_tournament_id`
  - `tournaments`
- Each `Tournament` stores config, prize pool, participant addresses, participant states, frozen final price, settlement result, and current status.
- Each `ParticipantState` stores initial balance, realized PnL, and one optional open position.

## Message Flow
- Admin deploys program and becomes the admin.
- Admin creates tournaments with fixed timestamps and limits.
- Participant joins by attaching the exact entry fee to `join_tournament`.
- Admin updates the shared mock BTC price while tournaments are running.
- Participant opens or closes a synthetic position; PnL is derived from current or frozen price.
- After `end_time`, admin calls `end_tournament`, which freezes the tournament price snapshot and marks the tournament `Ended`.
- Admin calls `settle_tournament`, which calculates leaderboard order, computes winner payouts, transfers value to winners, stores the result, and marks the tournament `Settled`.

## Routing And Public Interface
- Existing public routes that must remain stable
  - None; this is a new MVP contract
- New routes introduced by this release
  - Constructor `create(initial_btc_price)`
  - Commands for create, join, update price, open, close, end, settle
  - Queries for price, admin, tournament list, tournament details, participant state, leaderboard
- Any intentionally deprecated routes
  - None
- Whether any method signature or reply shape changes are proposed
  - Not applicable for the initial release

## Event Contract
- Existing events that must remain stable
  - None
- Any new event surface introduced by this release
  - Tournament lifecycle, trading, and settlement events
- Whether any existing event payload changes are proposed
  - Not applicable
- Whether event versioning is required
  - No for MVP

## Generated Client Or IDL Impact
- Does this release require IDL regeneration
  - Yes; build-driven IDL generation is required for the contract and frontend client
- Which clients, scripts, or tools consume the IDL
  - Rust generated client
  - React frontend TypeScript generated client
  - Deployment and manual call examples in README
- Whether old and new generated clients must coexist during cutover
  - No; single MVP version

## Contract Version And Status Surface
- How the contract exposes version information
  - Not exposed as a dedicated version route in MVP
- Whether the contract has lifecycle status such as `Active` or `ReadOnly`
  - Tournament-level lifecycle only: `Upcoming`, `Active`, `Ended`, `Settled`
- Whether old-version writes must be disabled after cutover
  - Not applicable

## Off-Chain Components
- Frontend program-id and config impact
  - Frontend needs endpoint and program ID env values
- Indexer subscription or decoder impact
  - None for MVP
- Any automation or scripts affected by the new version
  - Manual deployment and frontend env setup only

## Release And Cutover Plan
- Deploy order
  - Build contract, deploy to Vara testnet, capture program ID, configure frontend env, run frontend
- Frontend switch strategy
  - Frontend uses a single configured program ID
- Indexer switch strategy
  - None
- Whether the old version remains queryable
  - Not applicable
- Whether writes to the old version are disabled
  - Not applicable

## Failure And Recovery Paths
- Rollback target
  - Redeploy previous program build and point frontend back to that program ID
- How to revert frontend and indexer back to the previous version
  - Update env to the prior program ID and rebuild frontend if needed
- What happens if the new version is deployed but not adopted
  - The old frontend simply does not point at it; no shared mutable cutover exists in MVP

## Open Questions
- No open blockers for MVP. Price updates and tournament end remain admin-driven manual actions by design.
