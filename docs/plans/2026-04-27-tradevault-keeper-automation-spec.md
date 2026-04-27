# TradeVault Keeper Automation Spec

## Goal

Upgrade TradeVault Arena from frontend-only SL/TP alerts to keeper-driven on-chain automation.

## Scope

- Add optional Stop Loss and Take Profit levels to open positions.
- Add admin-only keeper functions that:
  - sync Binance BTC/USDT price into contract state
  - auto-close positions when SL/TP is hit
  - end tournaments after `end_time`
  - settle tournaments after end
- Expose close reason and keeper summary state to the frontend.
- Add a Node keeper runner that calls the on-chain keeper function on an interval.

## Non-Goals

- No real DEX execution.
- No normal-user price updates.
- No frontend-only auto-close behavior.

## Public Interface Changes

- `Position`
  - `stop_loss_price: Option<u128>`
  - `take_profit_price: Option<u128>`
- `ParticipantView`
  - `last_close_reason: Option<CloseReason>`
  - `last_close_price: Option<u128>`
- `OpenPosition`
  - adds optional SL/TP parameters
- New commands
  - `update_price_and_process(tournament_id, new_btc_price)`
  - `process_tournament(tournament_id)`
  - `keeper_tick(tournament_id, new_btc_price)`
- New result
  - `KeeperTickSummary`
- New events
  - `PriceUpdated`
  - `StopLossTriggered`
  - `TakeProfitTriggered`
  - `PositionClosed.close_reason`

## Acceptance

- Keeper tick updates price and auto-processes open positions.
- Long and Short SL/TP triggers close correctly.
- Tournament lifecycle can be processed automatically after `end_time`.
- Frontend submits SL/TP into `open_position` and shows on-chain risk levels.
- Trade history can show manual vs keeper close reason.
