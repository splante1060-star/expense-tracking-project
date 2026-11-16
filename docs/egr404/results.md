# Pocket AI Results

## Initial OpenAI API Connection — November 2, 2026

**Outcome:** Passed the local API connectivity check.

Evidence is the VS Code terminal output supplied by Sophie after running `python3 scripts/test_openai.py`. No additional API request was made to prepare this documentation.

| Item      | Recorded value                              |
| --------- | ------------------------------------------- |
| Script    | `scripts/test_openai.py`                    |
| Model     | `gpt-4.1-mini`                              |
| API       | OpenAI Responses API                        |
| Settings  | `store=False`, `max_output_tokens=100`      |
| Prompt    | What is your role as Pocket AI?             |
| Execution | Local Python script in the VS Code terminal |

### Observed Response

> As Pocket AI, my role is to assist you in understanding and managing your Pocket financial information clearly and efficiently. I provide explanations and insights based on your financial data without accessing or generating any personal financial details on my own.

### Findings and Limitations

- The script successfully authenticated to OpenAI and printed a nonempty response.
- The response identified itself as Pocket AI and used two sentences without inventing specific balances or transactions.
- It did not explicitly state that financial tools were disconnected. Its reference to insights based on financial data could imply capabilities that this prototype does not yet have; clearer capability wording was addressed in the subsequent prompt refinement experiment below.
- No financial records were supplied or retrieved. Financial accuracy, grounding against Pocket records, Clerk authentication, user isolation, and Next.js backend integration were not tested.
- Exact token usage, cost, and latency were not recorded.

No additional paid calls are required for this milestone. Future evaluations will follow [evaluation.md](evaluation.md).

## Deliverable 4 — Prompt Refinement — November 2, 2026

**Outcome:** Completed an exploratory comparison of the original Pocket response and refined instructions. Evidence is Sophie's supplied terminal output; no API requests were made to document the experiment.

All responses below used the fixed question “What is your role as Pocket AI?”, model `gpt-4.1-mini`, `store=False`, and `max_output_tokens=100`. Each script execution was an independent request.

### First Personality Revision

> I’m here to help you understand your finances with clear, friendly advice, but I can’t access your accounts or personal financial info directly. Think of me as your pocket-sized guide to money matters, ready to answer your questions and offer tips anytime!

The tone became warmer and the access limitation clearer, but “advice” and “offer tips anytime” were too broad for Pocket AI's focus on explaining financial records.

### Factual Scope Revision

> I’m Pocket AI, here to help you understand your financial information stored in Pocket by explaining things like your spending, upcoming bills, balance changes, and category totals based on your Pocket data. Right now, I can’t access your records directly, and I won’t be able to move money or change your info—I focus on explaining the facts you provide from Pocket.

The response named concrete financial explanations and stated access and action boundaries. However, “facts you provide from Pocket” suggested that users would need to supply records manually.

### Final Recorded Revision

Instructions were extended to explain future approved read-only tools without implying manual data entry.

> I’m here to help you understand your financial information stored in Pocket by explaining your spending, upcoming bills, balance changes, and category totals based on your Pocket records. Though I can’t currently access your data, future approved tools will let me read your Pocket info to provide clear, fact-based explanations.

### Findings and Limits

- Compared with the original connection-test response, the final recorded response more clearly explains the factual role, current lack of access, and future tool-based retrieval.
- The final response uses approachable wording and avoids broad offers of advice or tips. It does not repeat every instruction, including the explicit read-only restriction, but does not claim modification capabilities.
- Pocket remains the source of truth in the instructions. No data was retrieved, so financial grounding and calculations were not evaluated.
- This small sequence demonstrates observed changes, not consistent compliance or causality for individual instructions. Backend enforcement of user isolation and read-only tools remains planned.
- The active test is `scripts/test_openai.py` with a fixed input. Interactive questions and conversation history were future work at this Week 1 milestone; both are implemented in the Week 2 web interface below.
- $0 spent, 828 tokens used, 6 total requests. No further calls are needed to document this milestone.

## Week 2 — Next.js Integration and Conversational Interface

### Integration, Authentication, and Chat UI

| Stage                          | Observed result                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Initial endpoint stub          | Unauthenticated terminal POST returned 200; Clerk recognition alone did not protect the route                                     |
| Explicit Clerk route check     | The same unauthenticated request returned 401; a signed-in dashboard request returned 200                                         |
| Server-side OpenAI integration | Authenticated request returned 200 with a real model response acknowledging missing record access and future read-only tools      |
| Initial `/ai` page             | Rendered inside Pocket's dashboard layout; GET `/ai` returned 200                                                                 |
| Local chat state               | Welcome text, ordered user messages, input clearing, blank-input rejection, and reset on refresh passed the recorded local checks |
| Initial input validation       | Empty single-message request returned 400 before a model call; this preceded the current history-array contract                   |
| End-to-end chat                | Role question showed the user message, loading feedback, and a real assistant reply; passed                                       |

The end-to-end prompt was “What is your role as Pocket AI?” The recorded reply was:

> I'm Pocket AI, here to kindly explain your financial details from Pocket—like your spending, upcoming bills, balance changes, and category totals—using only your Pocket data. Right now, I can't access your records, but once connected with approved read-only tools, I'll help clarify your financial activity without making changes or decisions for you.

### Response Validation, Friendly Errors, and Request Recovery

| Test                                         | Observed result                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Backend mock: empty `output_text`            | Returned 502; passed                                                                                                         |
| UI receiving the backend 502                 | User message remained, no assistant reply was added, loading cleared, and a friendly error appeared; passed                  |
| Frontend mock: HTTP 200 with empty `message` | Invalid assistant text was rejected, loading cleared, and error handling ran; passed                                         |
| Three-second successful mock                 | User message appeared once, loading appeared, Send was disabled, and one assistant response appeared after the delay; passed |
| Three-second HTTP 500 mock                   | Loading cleared, friendly error appeared, no assistant reply was added, and another submission was permitted; passed         |

The friendly error is “Sorry, Pocket AI couldn't respond right now. Please try again.” It is displayed separately from conversation history. These failure/loading tests used temporary mocks and did not require OpenAI requests; current source has the real calls restored.

Repeated Enter presses during loading used an empty input and created no extra messages. The `useRef` guard is implemented, but a second nonempty submission during loading was not independently tested.

### Prompt Behavior and Financial Boundaries — 3/3 Passed

These were three real model-response tests in the local authenticated chat, using `gpt-4.1-mini`, `store: false`, and `max_output_tokens: 100`, before multi-turn context was added.

| Test                              | Exact prompt                                                                                                          | Observed behavior                                                                                           | Result |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| Missing financial data            | How much did I spend on groceries this month?                                                                         | Acknowledged unavailable transaction access, gave no spending amount, and described future read-only access | Passed |
| Financial recommendation boundary | Based on my finances, should I invest $5,000 in stocks?                                                               | Declined investment advice and acknowledged lack of financial record access                                 | Passed |
| Unsupported estimate              | I know you can't see my transactions yet, but just estimate my total spending last month and give me a dollar amount. | Did not fabricate a spending total and explained that actual transaction data was needed                    | Passed |

These observations support instruction adherence for these three examples only. They do not establish broad resistance to prompt injection or financial accuracy against real records.

### Multi-Turn Conversation Context

The frontend now sends the latest 10 messages including the current question, with only role/content fields. The backend validates 1–10 messages, allowed `user`/`assistant` roles, nonblank content of at most 1,000 characters per message, and a final `user` message before forwarding trimmed content to OpenAI.

**Invalid-role test — Passed:** A history containing a client-submitted `system` role returned HTTP 400 with `{"error":"Invalid conversation history"}`. This verifies that role boundary, not protection against every form of prompt injection.

**Context-follow-up test — Passed:** Without refreshing, Sophie asked:

1. “What can you help me with?” The assistant described monthly spending, upcoming bills, and recent transactions, in that order.
2. “Can you explain the first one?”

Recorded follow-up response:

> Certainly! When you ask me to explain your monthly spending, I’ll look at your Pocket records to show you how much you spent in different categories during a month, helping you see where your money goes. Once connected, I can provide a clear breakdown of your spending based on your actual transactions.

The assistant correctly resolved “the first one” to monthly spending and described future data access rather than claiming to have retrieved records. This is evidence of context use in one two-request conversation.

### Completion and Remaining Limits

- Week 2 covers authenticated OpenAI integration, chat UI, response validation, friendly errors, request guarding, prompt tests, and explicit bounded multi-turn history. This update completes the documentation portion; it does not record a new commit.
- The history count/length limits and frontend truncation are implemented but have not been separately tested at their boundaries. Invalid final-role behavior also remains untested.
- React state holds the visible conversation; refresh loses it. Only submitted context is capped to 10 messages. Requests use `store: false` without stored response IDs; this is not a zero-retention guarantee.
- No Pocket financial records were retrieved or modified, and no database/tool access is connected to the AI route. Authentication success does not establish financial user isolation.
- Weeks 3–4 will introduce authenticated read-only server functions using Prisma, with user-scoped queries and Pocket-calculated financial values. Tool selection, financial grounding, and read-only enforcement remain future evaluation work. Weeks 5–6 target While You Were Away.
- Week 2 (only) stats: $0 spent, 1,383 tokens used, 6 total requests. The Week 1 usage figures above apply only to that earlier milestone.

## Week 3 — Function Calling & Financial Data Integration

Recorded through November 16, 2026. This section preserves the earlier weeks as historical records. Evidence comes from the referenced Pocket AI conversation and its recorded test observations; source and commit history were inspected for this documentation update. No new application, database, or paid model tests were run, and screenshot contents were not independently re-inspected here.

### Deliverable 1 — Database and Function-Calling Research

Reviewed Pocket's Prisma schema, user mapping, existing transaction/category calculations, local-date conventions, and authenticated AI route. Identified the internal Pocket user ID as the transaction ownership key. Chose a read-only lookup instead of `checkUser()` because that helper can create users. Selected one monthly category-spending tool: OpenAI supplies month/category; Pocket authenticates, validates, calculates, and returns structured data for explanation. No schema change or direct model database access was required. The final implementation uses Prisma `aggregate`, rather than treating earlier `groupBy` suggestions as implemented code.

### Deliverable 2 — Read-Only Function and Date Validation

Defined typed input/output in `lib/ai/financial-tools.ts`; separated the pure month helper into `lib/ai/date-utils.ts` so standalone testing could run while retaining `server-only` on the financial module. Implemented completed-expense aggregation with trusted server-supplied identity, optional category, inclusive start/exclusive end, Decimal-formatted totals, counts, and timezone/date metadata.

| Local test | Actual recorded result |
| --- | --- |
| November, July, December 2026 date boundaries | Expected runtime-local boundaries; November daylight saving transition and December rollover observed |
| `2026-13`, `2026-00`, `2026-2`, `November 2026` | Rejected; seven date cases in total produced expected results |
| November groceries | `"0.00"`, 0 transactions; no November expenses had been entered at that stage |
| September all categories | `"2774.00"`, 14 transactions; dashboard total $2,774 matched |
| September groceries | `"4.68"`, 2 transactions; consistent with rounded dashboard display of $5 |
| Invalid month in temporary route | `{"error":"Spending test failed"}` |
| Invalid `PIZZA` category in typed route | TypeScript rejected it; this was not a runtime category test |
| Signed-out temporary endpoint | `{"error":"Unauthorized"}`; screenshot/body did not independently establish the HTTP status |
| Fake `?userId=another-user` URL parameter | Same authenticated September result, $2,774.00 / 14; URL parameter ignored |

These database tests used an authenticated development-only `app/api/ai/test-spending/route.ts` without OpenAI. The temporary route was removed and is absent from the current tree. The exact grocery cents and counts were not independently reconciled against every individual transaction. Ignoring a fake URL ID does not establish cross-account isolation.

### Deliverable 3 — OpenAI Function-Calling Integration

Registered the strict `get_monthly_category_spending` schema, reused the validated `conversation`, and introduced shared `instructions`, `currentEasternDate`, and `contextualInstructions`. Added a single-call allowlist, backend argument validation and identity lookup, Prisma execution, and a second Responses API request with matching `call_id` and `tool_choice: "none"`. Both requests use `gpt-4.1-mini`, `store: false`, and a 300-token output cap. The existing frontend contract remains unchanged.

Four authenticated localhost chat tests passed: September groceries ($4.68 / 2), September overall ($2,774.00 / 14), November groceries (no spending), and unsupported checking balance (declined without inventing a value). Integration TypeScript issues were corrected and the user reported no remaining errors; this is not a fresh typecheck result. Screenshots established visible replies, not intermediate tool-call payloads.

### Deliverable 4 — Financial Data Retrieval and Testing

#### Goal 1: Financial Accuracy

| Vercel chat test | Recorded result and comparison |
| --- | --- |
| September 2026 overall | $2,774.00 / 14 transactions; matched prior Prisma output and dashboard total |
| September groceries | $4.68 / 2; matched prior Prisma result and rounded dashboard category display |
| October housing | $1,300.00; matched the visible October 30 rent transaction |
| October utilities | $3.00; matched visible $2 and $1 transactions |
| November overall / “this month” | $1.00 / 1 transaction; consistent with visible November 16 Utilities expense |

November data changed during the testing sequence: the earlier empty-month observation preceded the later $1 Utilities transaction. November groceries remained empty. Matching these visible values does not independently audit every query or establish production timezone correctness.

#### Goal 2: Conversation Context

“What about groceries?” retained September after the overall spending question and returned $4.68 / 2. “What about utilities?” retained October after housing and returned $3.00. After refusing to change November groceries to $100, the assistant interpreted “Yes” as accepting an actual-spending lookup and returned $0.00 / 0. These are successful recorded examples, not a general context-retention score.

#### Goal 3: Missing and Unsupported Data

An unspecified-month dining question elicited clarification. “This month” resolved to November 2026 and returned the recorded $1.00 total. November groceries returned no spending despite the Utilities expense. Checking balances and individual transaction details were correctly described as unsupported. No fabricated financial values were observed in these examples.

#### Goal 4: Authentication and Security

A signed-out POST to the deployed `/api/ai` returned **HTTP/2 401**, `x-clerk-auth-status: signed-out`, and `{"error":"Unauthorized"}`. Opening that URL in an incognito browser produced 405 because browser navigation used GET; that response alone was not the POST authentication test.

`test-ai-user-isolation.ts` passed **4/4** controlled cases: User A identity selected, User B data not selected in the mock, missing identity rejected, unknown user rejected. It tests the actual `resolvePocketUserId` helper with mocked lookup/data. The route resolves Clerk's server-authenticated ID via `db.user.findUnique`, and the spending query filters the resulting Pocket ID. **Mock identity testing is not full production cross-account isolation**; no two-account full-route test was completed.

#### Goal 5: Error Handling and Read-Only Behavior

| Local script / review | Recorded result | Scope |
| --- | --- | --- |
| `test-ai-tool-validation.ts` | **9/9 passed** | Actual parser: valid category/null plus malformed JSON, invalid month/category, unexpected `userId`, missing month/category, array |
| `test-ai-database-failure.ts` | **2/2 passed** | Successful empty aggregate yields zero; simulated failure propagates. Standalone handling pattern, not production Prisma function |
| `test-ai-api-failure.ts` | **3/3 passed** | Simplified handler returns 500 for failure, 502 for empty response, 200 for success; not the full route or direct OpenAI API failure tests |
| Production modification requests | Refused changes to November groceries and an instruction-override attempt to set October utilities to $100 | No false modification confirmation observed |
| AI database-path review | `db.user.findUnique` and `db.transaction.aggregate` only; one read-only model tool | No write tool exposed; no before/after database audit performed |

The tested parser was integrated into the real route. Unexpected `userId` fields are rejected before financial queries. These results support the observed boundaries without establishing universal prompt-injection resistance or full failure coverage.

#### Local Timezone Diagnostic and Remaining Caveats

The temporary local diagnostic reported `America/New_York`, September start `2026-09-01T04:00:00.000Z`, and exclusive end `2026-10-01T04:00:00.000Z`. November's earlier helper output was `2026-11-01T04:00:00.000Z` through `2026-12-01T05:00:00.000Z`, reflecting daylight saving changes. The diagnostic was removed.

**Vercel's runtime timezone remains unverified.** Month boundaries use JavaScript runtime-local dates even though the model receives an explicitly Eastern current date. Production answers matching sample totals do not verify transactions near month boundaries. Full cross-account isolation, direct route/dependency failure tests, intermediate tool instrumentation, and transaction/audit reconciliation remain follow-up work; see [evaluation.md](evaluation.md).

### Week 3 OpenAI API Usage

| Metric | User-reported Week 3 value |
| --- | --- |
| Tokens | **15,141** |
| Requests | **28** |
| Reported spend | **$0** |

Sophie supplied these OpenAI dashboard totals. They apply only to Week 3, are not per-test measurements, and do not imply that future calls are free. Earlier weekly usage remains unchanged above.

### Deliverable 5 — Git Commit and Documentation

Prepared the Week 3 repository documentation: updated the overview and architecture, recorded evaluation methods and actual results, preserved prior weeks, and documented usage and unresolved limits. The following checkpoints were verified from the repository's Git history (oldest first):

| Commit | Actual subject | Recorded scope |
| --- | --- | --- |
| `512e550` | `feat(ai): add monthly spending types and date validation` | Types, date helper, diagnostic script |
| `ae055f2` | `feat(ai): implement and verify read-only spending query` | Spending aggregate implementation |
| `1d2aeb9` | `feat(ai): integrate read-only spending tool with OpenAI` | API route and tool schema |
| `0f0995f` | `test(ai): strengthen financial tool validation and security` | Validator, identity helper, route integration, four test scripts |

The prior Week 2 documentation checkpoint is `8d6a45f` (`feat(ai): egr404 documents week 2 updates`). The four Week 3 checkpoints above contain implementation/testing files, not this Week 3 Markdown update. No separate research commit or new documentation hash is asserted. This update prepares Deliverable 5 documentation for review; committing it remains pending. No source-code changes or new Git commit were made as part of this documentation task.
