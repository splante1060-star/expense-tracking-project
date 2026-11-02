# Pocket AI Evaluation

EGR404 | Status: November 2, 2026

## Initial Connection Check

**Purpose:** Confirm that a local Python script can send a simple prompt to OpenAI and print a response.

- Script: `scripts/test_openai.py`
- Command: `python3 scripts/test_openai.py`
- Model: `gpt-4.1-mini`
- Prompt: “What is your role as Pocket AI?”
- Instructions: identify as Pocket AI, acknowledge disconnected financial tools, avoid invented financial facts, and keep the response to two sentences.
- Settings: `store=False`, `max_output_tokens=100`.
- Connection pass criterion: the request completes without an API error and prints nonempty model text.
- Behavioral observation: review whether the reply describes its role, explicitly acknowledges unavailable tools, and avoids unsupported personal financial facts.

Connection success and instruction adherence are separate observations. This check does not evaluate financial accuracy, Next.js integration, authentication, or user isolation.

## Deliverable 4 — Prompt Refinement Experiment

**Purpose:** Compare the original Pocket AI introduction with revised instructions for personality, style, factual scope, and honest capability descriptions.

The model (`gpt-4.1-mini`), fixed question (“What is your role as Pocket AI?”), and request settings (`store=False`, `max_output_tokens=100`) stayed the same. Instructions were revised between runs. The original observed response is preserved in [results.md](results.md); the current script contains the refined instructions, not the original baseline.

| Criterion | Desired behavior |
| --- | --- |
| Tone | Warm, approachable, plain, and nonjudgmental |
| Role | Concrete explanations of Pocket spending, bills, balance changes, and category totals |
| Current capability | Explicitly acknowledge that Pocket records cannot currently be retrieved |
| Future access | Describe approved tools, without implying users must manually supply records |
| Scope | Avoid unsolicited tips, financial decision recommendations, and claims of modifying records or moving money |
| Factual boundaries | Treat Pocket as the source of truth and acknowledge missing information |

A preliminary general-versus-specific comparison was run, but it mainly demonstrated the need for Pocket context. The deliverable was refined to focus on the initial Pocket response versus successive instruction revisions. `scripts/test_prompt_general.py` was removed because it is no longer used.

This is a qualitative, exploratory comparison with one recorded response per prompt version. Multiple instructions changed together, so results do not isolate individual instruction effects or establish consistent behavior. Introductory answers alone do not verify financial accuracy, recommendation avoidance across other questions, or enforcement of read-only access.

## Planned Verification After Integration

| Area | Check |
| --- | --- |
| Authentication | Unauthenticated AI requests are rejected before a provider call |
| User isolation | Financial tools cannot retrieve another user's records |
| Financial accuracy | Answers agree with a small set of known Pocket records and calculations |
| Grounding | Unsupported balances, transactions, dates, and totals are not presented as facts |
| Failure handling | Missing records and service/database failures produce clear, distinct outcomes |

These checks remain planned until the relevant application features exist.

## Budget and Evidence

The initial API budget is approximately $10. Keep prompts short and output capped, reuse recorded responses for documentation, and make additional paid requests only when needed to verify a change or a defined evaluation question. No repeat call is needed solely to document the successful connection.

Record the test date, script/model/settings, exact prompt, observed response, and limitations in [results.md](results.md). Do not record API keys. Exact request cost and token usage were not captured by the initial script.
