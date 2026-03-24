---
name: s-link-assistant-collision
description: Run the S-Link collision-analysis workflow from VIN and accident evidence to analysis, replacement list generation, and draft report output.
---

# S-Link Collision Analysis Workflow

## Goal

Analyze accident evidence, summarize impact damage, propose replacement candidates, and generate a draft damage report for S-Link users.

## Upstream Dependency

- Start only after the request is routed here by `s-link-assistant-router`.

## Recommended Downstream Skills

- `volcengine-vin-decoder`
- `volcengine-car-damage-analyzer`
- `volcengine-repair-parts-generator`

## Workflow

1. Collect VIN text or VIN image, accident images, and optional text description.
2. Confirm the vehicle.
3. Analyze impact zone, visible damage, likely hidden damage, and inspection targets.
4. Return a result card containing:
   - VIN and vehicle summary
   - accident summary
   - visible damage parts
   - possible hidden damage parts
   - inspection items
   - risk estimate
   - confidence
5. Provide two follow-up actions:
   - `生成换件清单`
   - `生成初步定损报告`
6. If the user requests the replacement list, convert all three part categories into selectable rows with replacement advice.
7. If the user requests the report, output a draft report link or document preview.

## Rules

- Separate confirmed visible damage from inferred hidden damage.
- When evidence is weak, bias toward inspection rather than over-claiming damage.
- Keep safety-sensitive notes explicit.
