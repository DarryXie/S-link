---
name: volcengine-car-damage-analyzer
description: Analyze accident photos or accident descriptions for a Volcengine Ark assistant to infer impact position, visible damage, likely internal damage, inspection targets, and risk level. Use when the current assistant runs on Doubao or another Ark model and needs to inspect crash images, summarize vehicle damage, or prepare structured findings for repair planning.
---

# Volcengine Car Damage Analyzer

## Overview

Use this skill when the input includes accident photos, a crash description, or both. Focus on what is visible, what is likely but not certain, and what must still be inspected before parts are confirmed.

## Model-Specific Guidance

- Assume the target model is Volcengine Ark, typically a Doubao vision-capable model.
- Prefer concise Chinese output with explicit arrays for downstream reuse.
- If image evidence is weak, bias toward `inspect` rather than over-claiming exact damage.

## Inputs

Accept any combination of:

- accident images
- accident description text
- known vehicle model
- VIN or normalized vehicle context from another skill

Require at least one damage signal: image or descriptive text.

## Workflow

1. Identify the primary impact zone.
2. List visible exterior damage.
3. Infer likely hidden or internal damage caused by the impact path.
4. Separate confirmed damage from uncertain inspection targets.
5. Assign `risk_level` and `confidence`.

## Output Contract

Default to JSON for direct user-facing answers and downstream reuse. Only use another format when the user explicitly asks for it.

```yaml
summary: string
accident_position: string
visible_damage_parts: array[string]
possible_internal_damage: array[string]
inspection_items: array[string]
safety_risks: array[string]
risk_level: enum[low, medium, high]
confidence: number
```

## Rules

- Use `visible_damage_parts` only for damage supported by the image or explicit text.
- Use `possible_internal_damage` for plausible hidden damage in the impact path.
- Use `inspection_items` for teardown-dependent or ambiguous areas.
- Mention safety or drivability concerns in `safety_risks` when appropriate.
- Do not fabricate OEM part numbers, labor hours, or prices.
- If the image is weak or partial, lower `confidence`.

## Error Handling

- If the image is unreadable and no text exists, say the input is insufficient.
- If only one angle is visible, say that hidden damage may be underestimated.
- If the vehicle identity is uncertain, continue with lower confidence rather than blocking.

## Example Requests

- `Analyze which areas were hit in this crash photo`
- `Infer which parts need inspection from this image`
- `Return a structured damage analysis result`
