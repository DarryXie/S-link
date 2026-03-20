---
name: volcengine-vin-decoder
description: Decode VIN strings or VIN images into structured vehicle information for a Volcengine Ark assistant. Use when the current assistant runs on Doubao or another Ark model and needs to identify make, model, year, series, engine, or drive type from a VIN, normalize vehicle identity before downstream repair analysis, or handle requests that ask to parse or recognize a VIN.
---

# Volcengine VIN Decoder

## Overview

Use this skill when the task is to identify a vehicle from a VIN value or VIN image. Return only information supported by the input, and keep uncertain fields empty instead of guessing.

## Model-Specific Guidance

- Assume the target model is Volcengine Ark, typically a Doubao text or vision model.
- Prefer compact Chinese JSON output that can be reused by the EPC assistant.
- Do not rely on OpenAI function-call syntax; keep the final answer schema explicit in the text response.

## Inputs

Accept any of these inputs:

- `vin`
- `vin_image`
- `text` with clarifying context

Require at least one of `vin` or `vin_image`.

## Workflow

1. Read the VIN directly if the user supplied it.
2. If the user supplied a VIN image, extract the VIN first.
3. Validate that the VIN is a 17-character standard VIN before decoding.
4. Normalize the result into structured fields.
5. Return partial output with lower `confidence` if some fields cannot be confirmed.

## Output Contract

Default to JSON for direct user-facing answers and downstream reuse. Only use another format when the user explicitly asks for it.

```yaml
vin: string
make: string
model: string
year: string
series: string
fuel_type: string
engine: string
drive_type: string
summary: string
confidence: number
```

## Rules

- Never invent unsupported vehicle facts.
- Keep unknown fields as empty strings.
- Reject clearly invalid VIN lengths or formats.
- Lower `confidence` for blurry images, ambiguous characters, or partial matches.
- Prefer normalized uppercase VIN output.
- Emit JSON by default in user-facing output.

## Error Handling

- If no VIN signal is present, say the input is insufficient.
- If the VIN image is unreadable, ask for a clearer image or typed VIN.
- If the VIN is malformed, say it is invalid instead of decoding it.

## Example Requests

- `Decode this VIN: JTMHX05J9A1234567`
- `Identify the vehicle from this VIN photo`
- `What make and model does this VIN belong to?`
