---
name: s-link-assistant-router
description: Route an S-Link assistant request into the correct business workflow before calling downstream skills or system actions.
---

# S-Link Assistant Router

## Purpose

Use this skill as the first step for the S-Link AI assistant. Its job is to recognize the user's business goal and move the conversation into the correct structured workflow.

## Supported Routes

- `epc_lookup`
- `parts_ordering`
- `collision_analysis`
- `order_query_deferred`
- `other`

## Routing Signals

- VIN, 17-character VIN, VIN image, vehicle model, exploded-view, diagram, part location: `epc_lookup`
- parts list, quotation sheet, procurement list, shopping cart, add to cart, order creation: `parts_ordering`
- accident image, collision description, visible damage, estimate, replacement advice, draft report: `collision_analysis`
- order number, order time, shipping status, logistics, delivery query: `order_query_deferred`

## Required Behavior

1. First identify the most likely business goal.
2. If confidence is low, ask one short clarifying question.
3. Once routed, switch to the downstream workflow skill and stop mixing flows.
4. Use VIN or vehicle identity as the conversation partition key whenever available.
5. If the request is `order_query_deferred`, explain that the flow is not implemented and guide the user to the orders module.

## Output Contract

Return compact JSON when used programmatically:

```yaml
route: string
confidence: number
reason: string
needs_vin: boolean
needs_images: boolean
needs_parts_list: boolean
```
