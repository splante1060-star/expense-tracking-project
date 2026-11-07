# Pocket AI Evaluation

EGR404 | Status: November 7, 2026

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

## Remaining Verification for Financial Integration

| Area | Check |
| --- | --- |
| Authentication | Preserve the Week 2 route check when adding financial tools |
| User isolation | Financial tools cannot retrieve another user's records |
| Financial accuracy | Answers agree with a small set of known Pocket records and calculations |
| Grounding | Unsupported balances, transactions, dates, and totals are not presented as facts |
| Failure handling | Missing records and service/database failures produce clear, distinct outcomes |

User isolation, financial accuracy, and database-failure checks remain planned for Weeks 3–4. Week 2 authentication and application tests are recorded below.

## Budget and Evidence

The initial API budget is approximately $10. Keep prompts short and output capped, reuse recorded responses for documentation, and make additional paid requests only when needed to verify a change or a defined evaluation question. No repeat call is needed solely to document the successful connection.

Record the test date, script/model/settings, exact prompt, observed response, and limitations in [results.md](results.md). Do not record API keys. Exact request cost and token usage were not captured by the initial script.

## Week 2 — Integration and Conversation Evaluation

The primary chronological record is Sophie's **Next.js OpenAI API Integration.docx**, supplemented by the referenced Pocket AI conversation for prompt wording and follow-up details. Current implementation was checked against `app/api/ai/route.ts` and `components/ai/chat-interface.tsx`. Results below document prior local tests; no new application or paid model tests were run for this documentation update.

Testing progressed from a stub endpoint, through Clerk protection and a fixed OpenAI question, to a live chat UI, response validation, error recovery, prompt boundaries, and multi-turn history. Earlier `{ message: text }` requests are historical; the current contract is `{ messages: [{ role, content }] }`.

| Area | Method and pass criterion |
| --- | --- |
| Authentication | Compare unauthenticated terminal POST (401 after protection) with signed-in dashboard POST (200) |
| End-to-end chat | Submit the role question at `localhost:3000/ai`; show user text, loading feedback, then nonempty assistant text acknowledging missing data access |
| Backend output validation | Temporarily mock empty `output_text`; expect 502, without a model call |
| Frontend validation | Temporarily mock HTTP 200 with `{ message: "" }`; expect friendly error and no assistant message |
| Loading and recovery | Three-second success and HTTP 500 mocks; check loading, disabled Send, cleanup, and ability to submit after failure |
| Prompt boundaries | Three real model prompts: missing grocery data, investment recommendation, and pressure to fabricate a spending estimate; require no invented financial amount or personalized recommendation |
| History roles | Submit a client `system` role; expect 400 `Invalid conversation history` before a model call |
| Context follow-up | Ask “What can you help me with?” then “Can you explain the first one?” without refreshing; require reference to the first capability in the prior response |

Temporary mocks were removed; current source uses the real fetch and OpenAI calls. These manual examples provide limited evidence, not a broad reliability score. The 3/3 result counts only the three prompt boundary examples.

### Tests Still Needed

- History count limits (empty, exactly 10, over 10), frontend truncation, 1,000-character content boundary, and invalid final role.
- A second nonempty submission while a request is pending. The recorded repeated-Enter test used empty input; it does not independently establish overlapping-request protection.
- Grounded financial accuracy, tool selection, user isolation, and read-only enforcement once Prisma tools exist in Weeks 3–4.

No financial data was supplied to the model in Week 2. Token usage, exact request cost, and latency were not recorded for these tests.
