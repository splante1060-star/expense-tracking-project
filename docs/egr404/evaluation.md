# Pocket AI Evaluation

EGR404 | Status: November 16, 2026

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

| Criterion          | Desired behavior                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Tone               | Warm, approachable, plain, and nonjudgmental                                                                |
| Role               | Concrete explanations of Pocket spending, bills, balance changes, and category totals                       |
| Current capability | Explicitly acknowledge that Pocket records cannot currently be retrieved                                    |
| Future access      | Describe approved tools, without implying users must manually supply records                                |
| Scope              | Avoid unsolicited tips, financial decision recommendations, and claims of modifying records or moving money |
| Factual boundaries | Treat Pocket as the source of truth and acknowledge missing information                                     |

A preliminary general-versus-specific comparison was run, but it mainly demonstrated the need for Pocket context. The deliverable was refined to focus on the initial Pocket response versus successive instruction revisions. `scripts/test_prompt_general.py` was removed because it is no longer used.

This is a qualitative, exploratory comparison with one recorded response per prompt version. Multiple instructions changed together, so results do not isolate individual instruction effects or establish consistent behavior. Introductory answers alone do not verify financial accuracy, recommendation avoidance across other questions, or enforcement of read-only access.

## Financial Integration Plan at the End of Week 1

| Area               | Check                                                                            |
| ------------------ | -------------------------------------------------------------------------------- |
| Authentication     | Preserve the Week 2 route check when adding financial tools                      |
| User isolation     | Financial tools cannot retrieve another user's records                           |
| Financial accuracy | Answers agree with a small set of known Pocket records and calculations          |
| Grounding          | Unsupported balances, transactions, dates, and totals are not presented as facts |
| Failure handling   | Missing records and service/database failures produce clear, distinct outcomes   |

User isolation, financial accuracy, and database-failure checks remain planned for Weeks 3–4. Week 2 authentication and application tests are recorded below.

## Budget and Evidence

The initial API budget is approximately $10. Keep prompts short and output capped, reuse recorded responses for documentation, and make additional paid requests only when needed to verify a change or a defined evaluation question. No repeat call is needed solely to document the successful connection.

Record the test date, script/model/settings, exact prompt, observed response, and limitations in [results.md](results.md). Do not record API keys. Exact request cost and token usage were not captured by the initial script.

## Week 2 — Integration and Conversation Evaluation

The primary chronological record is Sophie's **Next.js OpenAI API Integration.docx**, supplemented by the referenced Pocket AI conversation for prompt wording and follow-up details. Current implementation was checked against `app/api/ai/route.ts` and `components/ai/chat-interface.tsx`. Results below document prior local tests; no new application or paid model tests were run for this documentation update.

Testing progressed from a stub endpoint, through Clerk protection and a fixed OpenAI question, to a live chat UI, response validation, error recovery, prompt boundaries, and multi-turn history. Earlier `{ message: text }` requests are historical; the current contract is `{ messages: [{ role, content }] }`.

| Area                      | Method and pass criterion                                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication            | Compare unauthenticated terminal POST (401 after protection) with signed-in dashboard POST (200)                                                                                              |
| End-to-end chat           | Submit the role question at `localhost:3000/ai`; show user text, loading feedback, then nonempty assistant text acknowledging missing data access                                             |
| Backend output validation | Temporarily mock empty `output_text`; expect 502, without a model call                                                                                                                        |
| Frontend validation       | Temporarily mock HTTP 200 with `{ message: "" }`; expect friendly error and no assistant message                                                                                              |
| Loading and recovery      | Three-second success and HTTP 500 mocks; check loading, disabled Send, cleanup, and ability to submit after failure                                                                           |
| Prompt boundaries         | Three real model prompts: missing grocery data, investment recommendation, and pressure to fabricate a spending estimate; require no invented financial amount or personalized recommendation |
| History roles             | Submit a client `system` role; expect 400 `Invalid conversation history` before a model call                                                                                                  |
| Context follow-up         | Ask “What can you help me with?” then “Can you explain the first one?” without refreshing; require reference to the first capability in the prior response                                    |

Temporary mocks were removed; current source uses the real fetch and OpenAI calls. These manual examples provide limited evidence, not a broad reliability score. The 3/3 result counts only the three prompt boundary examples.

### Tests Still Needed

- History count limits (empty, exactly 10, over 10), frontend truncation, 1,000-character content boundary, and invalid final role.
- A second nonempty submission while a request is pending. The recorded repeated-Enter test used empty input; it does not independently establish overlapping-request protection.
- Grounded financial accuracy, tool selection, user isolation, and read-only enforcement once Prisma tools exist in Weeks 3–4.

No financial data was supplied to the model in Week 2. Token usage, exact request cost, and latency were not recorded for these tests.

## Week 3 — Financial Data Retrieval Evaluation (Deliverables 1–4)

Evidence: the referenced **Pocket AI Project Overview** conversation, including the recorded Deliverable 1 research, Deliverable 2 local database results, Deliverable 3 live local chat results, and Deliverable 4 production/local test observations. Current source and Git history were checked while preparing Deliverable 5. The conversation references screenshots and `Week 3 - Deliverable 4.pdf`; this Markdown update records the conversation's observations and does not claim to have independently re-inspected those images. No fresh paid API or database tests were run for this update.

| Goal                      | Method and criterion                                                                                                                    | Evidence scope                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Financial accuracy        | Compare monthly/category totals and counts with the prior Prisma result, dashboard, and visible transactions                            | Local database endpoint, local chat, and Vercel chat; limited recorded examples                                |
| Conversation context      | Change category without repeating month; confirm an offered lookup with “Yes”                                                           | Production chat observations                                                                                   |
| Missing/unsupported data  | Ask for an unclear month, empty category period, balance, and transaction details; require clarification or honest limits               | Production observations; no broad hallucination rate inferred                                                  |
| Authentication/security   | Signed-out production POST must return 401; local identity tests must select the intended mock user and reject missing/unknown identity | Production authentication plus 4 mock helper cases; not full cross-account isolation                           |
| Errors/read-only behavior | Reject invalid arguments; distinguish successful zero from errors; refuse writes; inspect reachable database operations                 | 9 validator cases, 2 database simulations, 3 simplified API-handler simulations, chat refusals and code review |

Deliverable 2 also tested seven month/date cases via `npx tsx scripts/test-month-date-range.ts`: November, July, December, and four invalid formats/months. It is a diagnostic script that logs results and catches errors, not an assertion-based suite. The invalid `PIZZA` category in the temporary endpoint was initially a TypeScript rejection; Deliverable 4 subsequently exercised category rejection at runtime in the parser.

Local scripts: `test-ai-tool-validation.ts`, `test-ai-user-isolation.ts`, `test-ai-database-failure.ts`, and `test-ai-api-failure.ts` under `scripts/`, run with `npx tsx`. The first two import the actual validator/identity helper. The last two reproduce simplified handling logic; they do not directly test production Prisma, the full Next.js route, or real OpenAI outages. Counts should remain separate rather than becoming a combined production pass rate.

### Remaining Verification After Week 3

- Two authenticated real accounts through the full API and user-scoped database path.
- Direct financial-function and route tests with mocked dependencies at their actual boundaries; controlled service-failure integration tests.
- Vercel runtime timezone and transactions at month boundaries, including daylight saving changes; the Eastern prompt date alone does not verify query boundaries.
- Independent transaction-level reconciliation of exact September grocery cents/counts, intermediate tool-call instrumentation, and a before/after database audit for modification attempts.
- Week 2 history boundary/truncation and concurrent nonempty submission tests remain outstanding. No broad prompt-injection resistance or reliability score is established.

Week 3 usage reported by OpenAI: **15,141 tokens, 28 requests, $0 spent**. No per-test cost, latency, or token allocation was captured. See [results.md](results.md) for observed values and verified Git checkpoints.
