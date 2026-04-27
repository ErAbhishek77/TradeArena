# TradeVault Keeper Automation Architecture

## Contract

- Keep one global BTC price in contract state.
- Use admin-only keeper calls as the oracle/automation boundary.
- `keeper_tick` is the primary operational path:
  1. write new price
  2. process SL/TP auto-closes for the selected tournament
  3. end tournament if time passed
  4. settle tournament if ended

## Position Processing

- Store SL/TP on the position itself.
- Evaluate trigger conditions against the synced tournament price.
- Write realized PnL into participant state on auto-close.
- Persist the last close reason and last close price for frontend readback.

## Frontend

- Live preview still uses Binance websocket price.
- Official tournament score remains contract price.
- Order form sends optional SL/TP directly to contract.
- Admin sync button uses keeper processing instead of plain price-only sync.

## Keeper Script

- Runs from the frontend Node toolchain using existing Gear + Sails dependencies.
- Connects to Binance websocket ticker.
- On interval:
  - reads latest price
  - queries tournament status
  - skips `Upcoming` and `Settled`
  - calls `keeper_tick`

## Safety

- Only admin/keeper can call keeper functions.
- Keeper functions reject zero prices.
- Settlement remains idempotent and protected against repeat execution.
