---
name: s-link-assistant-parts-order
description: Run the S-Link parts-ordering workflow using VIN plus a parts list to produce a selectable cart-ready result card.
---

# S-Link Parts Ordering Workflow

## Goal

Turn VIN plus a parts list into a structured order-preparation card that users can review, select, and add to the cart.

## Upstream Dependency

- Start only after the request is routed here by `s-link-assistant-router`.

## Recommended Downstream Skills

- `volcengine-vin-decoder`
- `volcengine-parts-list-recognizer`
- `volcengine-parts-cart-builder`

## Workflow

1. Request VIN text or VIN image together with the parts-list source.
2. Confirm the vehicle first.
3. Extract parts rows from images, files, or pasted text.
4. Merge duplicate rows conservatively.
5. Return a result card with:
   - VIN
   - vehicle summary
   - selectable line items
   - quantity controls
   - `加入购物车`
   - placeholders for quote and order generation
6. Allow the user to continue uploading parts-list content and merge it back into the same card.

## Rules

- Default missing quantity to `1`.
- Never fabricate OEM numbers or prices.
- Keep the interaction card-based and easy to confirm.
