# Pocket AI Architecture

EGR404 | Status: November 16, 2026

## Decisions

- Extend the existing Pocket application and database.
- Reuse Clerk authentication and the internal Pocket user identity.
- Keep AI credentials, provider requests, and database access on the server in the application integration.
- Begin with a local Python connection test, then add the Next.js endpoint and interface incrementally.
- Week 3 introduces one controlled, read-only monthly spending tool. Pocket remains responsible for financial facts and calculations.
- Keep this work separate from ELE469 Pocket Cloud.

## Existing Pocket Architecture

| Layer                 | Existing implementation                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Application           | Next.js App Router, React, TypeScript                                                                                                |
| Signed-in layout      | `app/(main)/layout.tsx` checks Clerk authentication and redirects signed-out visitors to `/sign-in`; provides the sidebar and header |
| Clerk middleware      | `proxy.ts` runs Clerk middleware, including on API routes, without an explicit route protection rule                                 |
| Pocket user mapping   | `lib/checkUser.ts` finds or creates a database user using the Clerk user ID                                                          |
| Database              | `lib/prisma.ts` exports a shared Prisma client using the PostgreSQL adapter                                                          |
| Financial operations  | Server actions in `actions/` and application logic in `lib/`; financial records use the internal Pocket user ID                      |
| Background processing | `app/api/inngest/route.ts` serves recurring transaction and AutoPay jobs                                                             |

The main layout does not protect API endpoints. The AI route independently authenticates each request with `auth()`. Clerk IDs and internal Pocket user IDs are distinct.

## Week 1 Prototype

```text
VS Code terminal → scripts/test_openai.py → OpenAI Responses API → terminal output
```

The script uses `gpt-4.1-mini`, a simple role question, and instructions that financial tools are not connected and financial facts must not be invented. It reads `OPENAI_API_KEY` from the terminal environment, sets `store=False`, and limits output to 100 tokens.

The demonstrated run has no UI, Next.js endpoint, Clerk authentication, or financial database access. It proves local API connectivity rather than deployed backend integration. Python does not automatically load Pocket's `.env` file.

## Prompt Refinement Prototype

The active script remains `scripts/test_openai.py`, with the fixed input “What is your role as Pocket AI?” Each run is an independent request; interactive terminal input and multi-turn conversation history are not implemented in this script. Week 2 adds history in the web application.

The revised instructions define a warm, kind, helpful, nonjudgmental voice and a factual role: explain spending, upcoming bills, balance changes, category totals, and activity since the user's last visit. Pocket remains the source of truth. Missing information must be acknowledged rather than guessed, and the assistant must not offer unsolicited financial tips, recommend financial decisions, or provide personalized investment recommendations.

The prototype explicitly describes its current lack of data access and future approved read-only tools. These tools are planned, not connected. Prompt instructions express the intended boundaries; authorization and read-only restrictions must also be enforced in backend code when implemented.

## Pocket AI Application Paths

| Path                     | Responsibility                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| `app/(main)/ai/page.tsx` | AI page at `/ai`, using the existing application layout                        |
| `app/api/ai/route.ts`    | Authenticate requests, validate input, and coordinate server-side AI calls     |
| `components/ai/`         | Chat messages, input, and loading/error states                                 |
| `lib/ai/`                | Server-only provider integration, instructions, and controlled financial tools |

The page, route, and `components/ai/chat-interface.tsx` were implemented in Week 2. Week 3 adds the financial modules listed below; instructions and provider calls remain in the API route.

## Financial Request and Data Flow (Implemented Week 3)

1. A signed-in user submits a question through the AI interface.
2. The API route independently verifies Clerk authentication and validates the request.
3. For an approved tool call, the server resolves the authenticated user's internal Pocket ID.
4. Approved read-only tools retrieve only relevant records for that user and calculate values in Pocket.
5. The model receives the required structured information and produces an explanation.
6. The interface displays the response or a clear failure message.

## Security and Responsibility Boundaries

- The server supplies user identity to tools; neither the browser nor the model chooses whose records to query.
- Each financial query must be restricted to the authenticated Pocket user.
- Credentials and database access remain outside browser code. Financial context is limited to what the question needs.
- User text and retrieved descriptions are data, not authority to change tool permissions or system instructions.
- Missing data and failed lookups must be distinguished. `checkUser()` currently returns `null` for both unauthenticated users and caught provisioning/database errors; AI integration must handle those cases explicitly.
- Define date ranges, transaction statuses, and amount formatting for financial tools. Reuse existing financial logic where appropriate.
- Initial tools will not modify records or move money. Personalized investment recommendations are outside the initial scope.
- Week 2 enforces input limits and controlled errors. Week 3 adds server-resolved identity and runtime tool argument validation; full production cross-account testing remains outstanding.

## Incremental Implementation

1. Completed: local Python API connection test and fixed-prompt instruction refinement.
2. Completed Week 2: authenticated Next.js API integration without financial tools.
3. Completed Week 2: conversational interface with validation, friendly errors, request guard, and bounded multi-turn context.
4. Completed Week 3: one read-only monthly spending tool, checked against available Pocket data.

Verification and observations are tracked in [evaluation.md](evaluation.md) and [results.md](results.md).

## Week 2 Request Flow and Validation (Historical Implementation)

```text
/ai → ChatInterface → POST /api/ai → Clerk auth → input validation
    → OpenAI Responses API → output validation → chat response or friendly error
```

- The browser sends `{ messages: conversation }`, taking `[...messages, newMessage].slice(-10)` and forwarding only `role` and `content`. The visible conversation remains in React state; the 10-message cap applies to submitted context, not displayed history. Refresh clears state.
- The route checks Clerk authentication (401 if absent), then server-side key configuration (503 if absent). The API key stays on the server.
- History must be an array of 1–10 objects, each with role `user` or `assistant`, nonblank string content, and raw content length at most 1,000 characters. The final role must be `user`. Invalid history returns 400 with `Invalid conversation history`. Accepted content is trimmed and only role/content are forwarded. Role alternation is not enforced.
- The route supplies its own instructions, uses `gpt-4.1-mini`, `input: conversation`, `store: false`, and `max_output_tokens: 100`. It does not use stored response IDs. `store: false` controls response storage; it is not a claim of zero provider retention.
- Missing or blank `output_text` returns 502. Caught failures, including malformed JSON, return a generic 500. Server logging records the error name rather than the full provider error.
- The frontend rejects unsuccessful HTTP responses and missing/blank `data.message`. It displays “Sorry, Pocket AI couldn't respond right now. Please try again.” in a separate `role="alert"` element, without adding an assistant error message to history. The submitted user message remains.
- A `useRef` request guard tracks an in-flight request synchronously. The Send button is disabled for blank input or loading; `finally` resets the guard and loading state. The guard currently precedes `preventDefault()` in the handler; repeated nonempty submissions were not independently tested.
- No Prisma query, financial tool definition, or function-calling execution is present in the AI route. Weeks 3–4 will add narrowly scoped read-only server functions that resolve the authenticated Pocket user and query only that user's records. The model will not receive direct database access.

History count/length boundaries and truncation behavior are implemented but not separately tested. See [results.md](results.md) for the observed role rejection and context-follow-up results.

## Week 3 — Current Financial Tool Architecture

Deliverable 1 reviewed the Prisma schema, transaction/reporting patterns, `lib/prisma.ts`, `lib/checkUser.ts`, and the AI route. Transactions use internal Pocket `User.id`, not Clerk IDs. `checkUser()` can provision users, so the read-only AI path instead uses `db.user.findUnique`. No schema migration was needed. The researched function-calling design keeps database execution on Pocket's server.

```text
Validated conversation → OpenAI tool request → allowlist + runtime validation
    → Clerk identity mapped to Pocket ID → Prisma aggregate
    → function_call_output → OpenAI explanation → existing chat UI
```

| Module | Responsibility |
| --- | --- |
| `lib/ai/date-utils.ts` | Validate `YYYY-MM` and year 100–9998; construct runtime-local first-of-month boundaries |
| `lib/ai/financial-tools.ts` | Server-only `getMonthlyCategorySpending`; user-scoped completed expense aggregate |
| `lib/ai/tool-definitions.ts` | Strict `get_monthly_category_spending` schema; required month/category, no extra fields or user ID |
| `lib/ai/tool-validation.ts` | Parse JSON; reject arrays, missing/extra fields, invalid categories/months before querying |
| `lib/ai/user-context.ts` | Resolve Clerk identity using injected lookup; reject missing/unknown identities |

The spending function accepts `{ month, category }` and a separately supplied trusted Pocket ID. It filters `userId`, `type: "EXPENSE"`, `status: "COMPLETED"`, `date.gte` and `date.lt`; `category: null` includes all expense categories. Prisma performs `_sum.amount` and `_count._all`. Decimal `toFixed(2)` produces a string; a successful empty aggregate yields `"0.00"` and count 0. A thrown query error remains a failure. Results include month, category, total, count, runtime timezone, and ISO boundaries. Only user lookup and transaction aggregation are exposed in this AI path; the function itself trusts its server caller's ID.

Deliverable 3 extracted trimmed messages into the reusable `conversation` constant and shared prompt text into `instructions`. `currentEasternDate` uses `America/New_York`; `contextualInstructions` appends that date and is reused for both OpenAI calls. This date context does not change the database helper's runtime-local boundaries.

The first Responses API call uses `gpt-4.1-mini`, `tools: financialTools`, `store: false`, and `max_output_tokens: 300`. The route allows at most one call, checks its name, validates arguments, resolves identity, and executes the aggregate. A second request includes the conversation, selected function-call item, and JSON `function_call_output` linked by `call_id`; `tool_choice: "none"` prevents another call. Without a tool call, the first response is used. The existing `{ message: answer }` UI contract and Week 2 conversation limits remain.

Missing authentication returns 401; missing key 503; invalid history 400; unknown Pocket user 404; multiple/unsupported calls or invalid arguments 502; empty output 502; caught failures 500. These are current code paths, not a claim that every status was exercised against production. The current route checks falsy output text and logs the caught error object; the Week 2 notes above describe the earlier implementation.

Balances, bills, individual transactions, budgets, savings goals, and write operations are unsupported. The temporary development spending endpoint and timezone diagnostic were removed. Vercel's runtime timezone and full cross-account API isolation remain unverified; see [results.md](results.md).
