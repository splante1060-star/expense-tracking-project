# Pocket AI Architecture

EGR404 | Status: November 2, 2026

## Decisions

- Extend the existing Pocket application and database.
- Reuse Clerk authentication and the internal Pocket user identity.
- Keep AI credentials, provider requests, and database access on the server in the planned application integration.
- Begin with a local Python connection test, then add the Next.js endpoint and interface incrementally.
- Introduce controlled, read-only financial tools later. Pocket remains responsible for financial facts and calculations.
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

The main layout does not protect API endpoints. The planned AI route must independently authenticate each request. Clerk IDs and internal Pocket user IDs are distinct.

## Current Prototype

```text
VS Code terminal → scripts/test_openai.py → OpenAI Responses API → terminal output
```

The script uses `gpt-4.1-mini`, a simple role question, and instructions that financial tools are not connected and financial facts must not be invented. It reads `OPENAI_API_KEY` from the terminal environment, sets `store=False`, and limits output to 100 tokens.

The demonstrated run has no UI, Next.js endpoint, Clerk authentication, or financial database access. It proves local API connectivity rather than deployed backend integration. Python does not automatically load Pocket's `.env` file.

## Prompt Refinement Prototype

The active script remains `scripts/test_openai.py`, with the fixed input “What is your role as Pocket AI?” Each run is an independent request; interactive terminal input and multi-turn conversation history are not implemented yet.

The revised instructions define a warm, kind, helpful, nonjudgmental voice and a factual role: explain spending, upcoming bills, balance changes, category totals, and activity since the user's last visit. Pocket remains the source of truth. Missing information must be acknowledged rather than guessed, and the assistant must not offer unsolicited financial tips, recommend financial decisions, or provide personalized investment recommendations.

The prototype explicitly describes its current lack of data access and future approved read-only tools. These tools are planned, not connected. Prompt instructions express the intended boundaries; authorization and read-only restrictions must also be enforced in backend code when implemented.

## Planned Pocket AI Additions

| Path                     | Responsibility                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| `app/(main)/ai/page.tsx` | AI page at `/ai`, using the existing application layout                        |
| `app/api/ai/route.ts`    | Authenticate requests, validate input, and coordinate server-side AI calls     |
| `components/ai/`         | Chat messages, input, and loading/error states                                 |
| `lib/ai/`                | Server-only provider integration, instructions, and controlled financial tools |

These application additions are planned, not implemented by the Python test.

## Planned Request and Data Flow

1. A signed-in user submits a question through the AI interface.
2. The API route independently verifies Clerk authentication and validates the request.
3. When financial access is introduced, the server resolves the authenticated user's internal Pocket ID.
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
- Add input/output limits and controlled error handling when implementing the API endpoint.

## Incremental Implementation

1. Completed: local Python API connection test and fixed-prompt instruction refinement.
2. Planned: authenticated Next.js API integration without financial tools.
3. Planned: minimal conversational interface.
4. Planned: one read-only financial tool, checked against known Pocket data.

Verification and observations are tracked in [evaluation.md](evaluation.md) and [results.md](results.md).
