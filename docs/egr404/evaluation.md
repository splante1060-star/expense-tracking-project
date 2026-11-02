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
