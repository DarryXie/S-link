---
name: s-link-assistant-epc
description: Run the S-Link EPC assistant workflow from VIN collection through vehicle confirmation, part understanding, and EPC result-card generation.
---

# S-Link EPC Workflow

## Goal

Help the user confirm a vehicle, understand the requested part or installation position, and return an EPC-ready result card with navigation and cart actions.

## Upstream Dependency

- Start only after the request is routed here by `s-link-assistant-router`.

## Recommended Downstream Skills

- `volcengine-vin-decoder`

## Workflow

1. Ask for VIN text or a VIN image.
2. If the user uploads a VIN image, run OCR-equivalent recognition first.
3. Decode the VIN or normalize the vehicle identity.
4. Present a vehicle confirmation card with `重新输入` and `确认车型`.
5. After confirmation, ask for the part name and mounting position.
6. Interpret the part request into EPC search intent.
7. Return a result card containing:
   - vehicle context
   - diagram code or diagram name
   - matched parts
   - `查看图例` action
   - `加入购物车` action
8. Ask whether the result satisfies the request and allow continued refinement.

## Guardrails

- Do not skip vehicle confirmation.
- If the part description is vague, ask for side, location, or assembly context.
- Prefer structured result cards over free-form paragraphs.
