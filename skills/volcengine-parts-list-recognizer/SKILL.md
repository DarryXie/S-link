---
name: volcengine-parts-list-recognizer
description: Extract structured parts-list line items from uploaded images, pasted text, or spreadsheet rows for a Volcengine Ark assistant. Use when the assistant receives a quotation sheet, procurement checklist, repair parts list, or similar line-item content and needs cart-ready structured output.
---

# Volcengine Parts List Recognizer

## Overview

Use this skill when the user provides a parts list instead of an accident photo or a VIN-only image. The goal is to convert the source into a compact structured list that the EPC assistant can render as a parts-list result card and later add to the shopping cart.

## Model Guidance

- Assume the target model is Volcengine Ark / Doubao.
- Prefer concise Chinese JSON output.
- Keep extracted wording close to the source unless the OCR error is obvious.
- Keep quantities numeric when possible.
- Lower confidence when the source is incomplete, blurry, or ambiguous.

## Accepted Inputs

Accept any combination of:

- `parts_list_image`
- `parts_list_text`
- `parts_rows` derived from spreadsheets
- optional `vin`
- optional `model`
- optional user instructions such as `extract cart-ready parts rows`

Require at least one parts-list source.

## Workflow

1. Confirm the uploaded content is a parts list, quotation sheet, spreadsheet, checklist, or pasted line-item text.
2. Extract each valid row into a line item.
3. Keep the original part name unless there is a clearly correct normalization.
4. Convert quantity to an integer when possible.
5. If quantity is missing or unreadable, default to `1`.
6. Ignore blank rows and rows with no usable part name.
7. Return structured JSON for downstream EPC rendering and cart operations.

## Output Contract

Default to JSON unless the user explicitly asks for another format.

```yaml
summary: string
source_type: enum[image, spreadsheet, text, mixed]
items:
  type: array
  items:
    index: number
    part_name: string
    quantity: number
confidence: number
```

## Rules

- Do not invent OEM part numbers, supplier codes, prices, or stock.
- Treat spreadsheet rows as the highest-confidence structured source.
- Preserve order when the source clearly has line ordering.
- If multiple sources are provided, merge them conservatively and avoid duplicates only when they are clearly the same line item.
- If the source is not actually a parts list, say so clearly instead of fabricating rows.

## Error Handling

- If the uploaded content is not a parts list, return a short explanation that extraction is not reliable.
- If only part names are readable, return them with quantity `1` and reduced confidence.
- If no reliable line items can be extracted, state that directly.

## Example Requests

- `extract this uploaded parts list`
- `read this quotation sheet and return part names plus quantities`
- `turn the uploaded checklist into cart-ready structured rows`
- `parse this Excel sheet into parts and quantities`
