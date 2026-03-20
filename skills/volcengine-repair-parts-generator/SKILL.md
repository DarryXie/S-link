---
name: volcengine-repair-parts-generator
description: Turn vehicle context and damage findings into a repair-parts plan for a Volcengine Ark assistant, with replacement recommendations, inspection items, repair advice, and risk level. Use when the current assistant runs on Doubao or another Ark model and needs to draft a repair parts list, convert damage analysis into actionable parts guidance, or prepare a structured repair recommendation.
---

# Volcengine Repair Parts Generator

## Overview

Use this skill after vehicle identity and at least one damage signal are available. Produce a repair-oriented parts plan that separates confirmed replacement candidates from items that still need inspection.

## Model-Specific Guidance

- Assume the target model is Volcengine Ark.
- Prefer concise Chinese output with stable JSON fields for later cart conversion.
- When evidence is incomplete, bias toward `inspect` and explain the verification step.

## Inputs

Accept any combination of:

- `vin`
- `model`
- `accident_position`
- `visible_damage_parts`
- `possible_internal_damage`
- `inspection_items`
- `text`

Require vehicle context plus at least one damage-related signal.

## Workflow

1. Confirm the vehicle context from `model` or `vin`.
2. Merge visible damage, inferred internal damage, and inspection hints.
3. Build a repair scope.
4. Classify each part as `replace`, `recommend_replace`, or `inspect`.
5. Summarize repair advice and assign `risk_level` and `confidence`.

## Output Contract

Default to JSON for direct user-facing answers and downstream reuse. Only use another format when the user explicitly asks for it.

```yaml
model: string
vin: string
summary: string
damaged_parts: array[string]
inspection_items: array[string]
repair_advice: array[string]
parts_table:
  type: array
  items:
    part_name: string
    replacement_level: enum[replace, recommend_replace, inspect]
risk_level: enum[low, medium, high]
confidence: number
```

## Rules

- Prefer `replace` only for clearly supported damage.
- Use `recommend_replace` when damage is likely but not fully proven.
- Use `inspect` for hidden, uncertain, or teardown-dependent parts.
- Mention teardown or verification steps in `repair_advice` when confidence is limited.
- Do not fabricate exact OEM part numbers, labor time, or prices.
- Emit JSON by default in user-facing output.

## Error Handling

- If both vehicle context and damage signals are missing, say the input is insufficient.
- If the model is uncertain, continue with lower `confidence`.
- If evidence is sparse, keep more items in `inspect`.

## Example Requests

- `Generate a repair parts list from this damage analysis`
- `What should likely be replaced on this vehicle?`
- `Draft a parts table from the VIN and crash findings`
