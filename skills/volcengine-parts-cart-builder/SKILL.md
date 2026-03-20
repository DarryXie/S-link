---
name: volcengine-parts-cart-builder
description: Convert a repair parts table into cart-ready procurement recommendations for a Volcengine Ark assistant, with included items, excluded items, quantities, and purchase decisions. Use when the current assistant runs on Doubao or another Ark model and needs to prepare a purchase list, shopping cart draft, or procurement-ready summary from repair recommendations.
---

# Volcengine Parts Cart Builder

## Overview

Use this skill when a repair recommendation already exists and the next step is procurement. Convert a `parts_table` or equivalent replacement recommendation into cart-ready items with clear inclusion decisions and quantities.

## Model-Specific Guidance

- Assume the target model is Volcengine Ark.
- Keep output compact and deterministic so it can be pasted into a cart UI or procurement workflow.
- Prefer explicit reasons for inclusion or exclusion instead of verbose discussion.

## Inputs

Accept any combination of:

- `parts_table`
- `model`
- `vin`
- `text` that signals procurement intent
- optional quantity hints such as package size, minimum order quantity, or replacement count

Require a `parts_table` or an equivalent structured list of replacement recommendations.

## Workflow

1. Read the recommended parts and their replacement levels.
2. Include only `replace` and, when justified, `recommend_replace`.
3. Exclude `inspect` items unless the user explicitly asks to pre-buy them.
4. Normalize quantity recommendations.
5. Summarize what should be purchased now versus verified later.

## Output Contract

Default to JSON for direct user-facing answers and downstream reuse. Only use another format when the user explicitly asks for it.

```yaml
model: string
vin: string
summary: string
cart_items:
  type: array
  items:
    part_name: string
    purchase_decision: enum[include, exclude, verify-first]
    quantity: number
    reason: string
excluded_items: array[string]
verify_first_items: array[string]
confidence: number
```

## Rules

- Default `inspect` items to `verify-first`.
- Do not fabricate exact prices, supplier names, or stock levels.
- Do not over-purchase uncertain parts unless the user explicitly prefers that tradeoff.
- Keep reasons short and procurement-oriented.
- Emit JSON by default in user-facing output.

## Error Handling

- If no parts table exists, say the input is insufficient.
- If quantity hints are missing, default to `1` with lower confidence.
- If the recommendation quality is weak, move more items into `verify-first`.

## Example Requests

- `Turn this parts_table into a purchase list`
- `Which parts should go into the cart now and which should be verified first`
- `Generate a cart-ready list for preorder creation`
