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
- The active test is `scripts/test_openai.py` with a fixed input. Interactive questions and conversation history are future work.
- $0 spent, 828 tokens used, 6 total requests. No further calls are needed to document this milestone.
