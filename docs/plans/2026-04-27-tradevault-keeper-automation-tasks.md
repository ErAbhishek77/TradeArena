# TradeVault Keeper Automation Tasks

1. Extend contract position and participant types for SL/TP and close reason state.
2. Add keeper summary types and keeper-facing events.
3. Update `open_position` validation for Long/Short SL/TP rules.
4. Add internal helpers for auto-close, tournament end, and settlement processing.
5. Expose `update_price_and_process`, `process_tournament`, and `keeper_tick`.
6. Refresh generated IDL and Rust client outputs.
7. Add gtests for Long/Short SL/TP triggers and keeper lifecycle processing.
8. Update frontend arena bindings for new position fields and keeper methods.
9. Replace frontend-only SL/TP automation with contract-backed inputs and readback.
10. Add keeper runner script and frontend package command.
11. Run `cargo test`, `cargo build --release`, and `npm run build`.
