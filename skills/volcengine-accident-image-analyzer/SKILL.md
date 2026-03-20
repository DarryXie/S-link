---
name: volcengine-accident-image-analyzer
description: Analyze vehicle accident images, VIN inputs, and repair requests for a Volcengine Ark assistant to produce structured damage assessments, repair-parts recommendations, and optional procurement cart drafts. Use when the current assistant runs on Doubao or another Ark model and needs to inspect crash photos, parse VIN or VIN photos, infer damaged or inspection parts, route a multi-step accident-repair workflow, or turn a parts table into a purchase-ready cart.
---
# Volcengine Accident Image Analyzer
## Overview
Use this skill as the orchestrator for the Volcengine accident-repair skill suite. Accept any combination of accident photos, accident descriptions, VIN, VIN photo, known vehicle model, or an existing `parts_table`.
Route only the steps needed for the request. Reuse structured results the user already provides instead of repeating upstream analysis, and delegate specialized work to sibling Volcengine skills whenever possible.
## Model-Specific Guidance
- Assume the target model is Volcengine Ark, typically a Doubao text or vision model.
- Prefer compact Chinese output with stable JSON blocks when structured results are needed.
- Do not rely on OpenAI tool-call syntax or function-call formatting.
- If the user asks for prose, summarize the structured result after producing the core fields mentally; do not invent extra schema fields.
## Workflow Decision Tree
Choose the smallest path that satisfies the request:
- If the user only asks what a VIN identifies, delegate to `$volcengine-vin-decoder`.
- If the user provides accident photos or a damage description, first ask for VIN when it is missing, then delegate to `$volcengine-car-damage-analyzer`.
- If the user wants a repair list or replacement advice, delegate to `$volcengine-repair-parts-generator` after vehicle context is available.
- If the user already has `parts_table` and wants a procurement list, delegate to `$volcengine-parts-cart-builder`.
- If the user asks for the full flow, orchestrate the suite end to end.
## Normalize Inputs
Normalize the request into these signals when possible:
- `vin`
- `vin_image`
- `image_url` or local accident images
- `text`
- `model`
- `request_analysis`
- `request_parts`
- `request_cart`
- `parts_table`
Prefer explicit structured inputs over inference. If `model` is already confirmed, skip VIN decoding. If `parts_table` already exists, skip repair-parts generation unless the user asks to revise it.
When the user sends accident images but no `vin`, `vin_image`, or confirmed `model`, ask one short follow-up first: invite them to provide the VIN so later repair suggestions can be more accurate. If the user says they cannot provide it, skip VIN resolution and continue with image-based analysis.
## Available Child Skills
Delegate to these sibling skills:
- `$volcengine-vin-decoder` for VIN parsing and vehicle identity normalization
- `$volcengine-car-damage-analyzer` for impact assessment and damage inference
- `$volcengine-repair-parts-generator` for replacement recommendations and parts planning
- `$volcengine-parts-cart-builder` for procurement-ready cart drafting
## Execute the Workflow
### Step 1: Identify Intent
Classify the request as one of these:
- VIN decode
- Damage analysis
- Repair-parts planning
- Cart generation
- End-to-end accident repair workflow
### Step 2: Resolve Vehicle Context
Delegate to `$volcengine-vin-decoder` only when `vin` or `vin_image` is available and `model` is not already confirmed.
If the request starts from accident images and vehicle context is missing, ask once for VIN before proceeding. Do not block the workflow if the user cannot provide it.
### Step 3: Analyze Damage
Delegate to `$volcengine-car-damage-analyzer` when accident images or accident text exists.
### Step 4: Generate Repair Parts
Delegate to `$volcengine-repair-parts-generator` only after vehicle context exists and at least one damage signal is available.
### Step 5: Build Cart Data
Delegate to `$volcengine-parts-cart-builder` only when `parts_table` exists and the user shows procurement intent.
## Common Requests
Map typical requests like this:
- `Decode this VIN` -> VIN decode only
- `Analyze this crash photo` -> ask for VIN first if missing, then run damage analysis
- `Draft a repair parts list` -> vehicle context plus repair-parts generation
- `Turn these parts into a purchase list` -> use existing `parts_table` and build cart data
- `Start from VIN and crash image, then give me the full repair workflow` -> run the end-to-end workflow
## Produce Outputs
Return the smallest structure that satisfies the request:
- VIN decode: pass through the structured output from `$volcengine-vin-decoder`
- Damage analysis only: pass through the structured output from `$volcengine-car-damage-analyzer`
- Repair plan: pass through the structured output from `$volcengine-repair-parts-generator`
- Cart plan: pass through the structured output from `$volcengine-parts-cart-builder`
- End-to-end result: combine `vehicle_info`, `damage_analysis`, `repair_parts`, and `cart_items`
Default to JSON output at every step, especially when the result needs to be reused by the EPC assistant or the shopping cart flow.
## Apply Safety and Confidence Rules
- Lower `confidence` whenever you rely on sparse text, low-quality images, or missing vehicle context.
- Mark uncertain internal or hidden components as `inspect`.
- Do not invent exact prices, stock, supplier availability, or OEM part numbers.
- Do not present a single exterior image as a final structural or safety conclusion.
- If VIN cannot be decoded but the user gives a model, continue with that model and state the limitation.
