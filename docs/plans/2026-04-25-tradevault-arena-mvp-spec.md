# Feature Spec

## Problem
Trade Arena needs a simple on-chain tournament contract where users pay an entry fee, receive equal synthetic capital, place mock BTC/USD trades, and compete on return percentage for a prize pool.

## User Goal
- Admin can create and operate tournaments.
- Players can join before the start time, trade a single mock BTC/USD market during the tournament, and view a live leaderboard.
- After the tournament ends, the contract can settle and distribute the prize pool to the top performers.

## In Scope
- One Sails program and service for tournament management, joins, trading, leaderboard queries, and settlement
- Single mock market: BTC/USD
- One open position per participant at a time
- Long and short positions with no leverage
- Entry-fee funded prize pool
- Top-3 reward distribution
- React frontend with wallet connect, admin tournament creation, tournament list, participant trading panel, leaderboard, and settlement actions
- IDL generation and generated client usage
- gtest coverage for happy paths and key guardrails

## Out of Scope
- Real market data or oracle integration
- Real exchange or liquidity integration
- Multi-asset or multi-market support
- Multiple simultaneous positions per participant
- Liquidations, margin engine, or leverage
- Complex tournament automation or scheduled jobs
- Indexer, analytics, or historical charting

## Actors
- Admin: creates tournaments, updates mock BTC price, ends tournaments, settles prize pool
- Participant: joins tournament, opens or closes a position, views leaderboard and account state
- Viewer: reads tournament list and leaderboard without signing

## State Changes
- Create tournament with static config and `Upcoming` status
- Join tournament by paying exact entry fee and creating isolated participant state
- Update global mock BTC price
- Open a position for a participant during the active window
- Close a position and realize PnL during the active window
- End a tournament after `end_time`, freezing a final BTC price snapshot
- Settle a tournament and transfer prize rewards to the winners

## Messages And Replies
- Constructor: set admin and initial BTC price
- `create_tournament(...) -> TournamentView`
- `join_tournament(tournament_id) -> ParticipantView` with attached value
- `update_mock_price(new_price) -> u128`
- `open_position(tournament_id, direction, size) -> ParticipantView`
- `close_position(tournament_id) -> ParticipantView`
- `end_tournament(tournament_id) -> TournamentView`
- `settle_tournament(tournament_id) -> SettlementResult`
- Read queries for current price, tournaments, tournament details, participant state, and leaderboard

## Events
- Tournament created
- Tournament joined
- Mock price updated
- Position opened
- Position closed
- Tournament ended
- Tournament settled

## Invariants
- Only admin can create tournaments, update price, end tournaments, or settle tournaments
- Users cannot join twice
- Users cannot join after `start_time`
- Tournament participant count cannot exceed `max_participants`
- Trading is only allowed between `start_time` and `end_time`
- Each participant has at most one open position at a time
- Position size cannot exceed current tournament equity
- Tournament cannot settle before it has ended
- Tournament cannot settle twice

## Edge Cases
- Fewer than three participants at settlement: distribute the full pool by normalizing the configured winner shares across the existing winners
- Integer division remainder on payouts: assign the remainder to first place
- Losses are capped at position size so tournament equity cannot go below zero in the MVP
- Open positions at end time are scored using the frozen final tournament price

## Acceptance Criteria
- Contract compiles and generates IDL
- Happy-path gtests cover create, join, trade, leaderboard ranking, end, and settle
- Frontend can connect a wallet, create a tournament as admin, join, trade, view leaderboard, and end or settle when eligible
- README explains build, test, deploy, frontend wiring, and a demo flow against Vara testnet
