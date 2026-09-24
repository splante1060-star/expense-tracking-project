# EGR404 — Pocket AI

## Building Tools with Generative AI

Pocket AI is the generative AI component being developed for **EGR404: Building Tools with Generative AI**.

The project extends **Pocket**, an existing personal finance web application, with a generative AI layer designed to help users better understand and interact with their own financial information.

> Pocket existed prior to the EGR404 project. The work documented here represents the new AI-specific development, experimentation, evaluation, and documentation completed for EGR404.

---

## Project Overview

Traditional personal finance applications are effective at displaying balances, transactions, bills, and budgets, but users still have to interpret much of that information themselves.

Pocket AI explores whether generative AI can make structured personal financial data easier to understand through natural-language interaction.

Instead of functioning as a general financial chatbot, Pocket AI will use information stored within Pocket to generate responses grounded in the user's actual financial data.

Example questions may include:

- "Where did most of my money go this month?"
- "What bills do I have coming up?"
- "Why is my checking balance lower than last month?"
- "How much have I spent on dining this month?"
- "What has changed since I last logged in?"

The goal is not for the AI model to become the source of financial truth. Pocket's database and application logic remain responsible for financial records and calculations. Generative AI is used to retrieve, interpret, summarize, and explain that information in a more natural way.

---

## Project Goals

The primary goals of Pocket AI are to:

- Integrate generative AI into an existing full-stack application.
- Allow users to ask natural-language questions about their Pocket data.
- Provide the AI with relevant structured financial information through controlled tools or functions.
- Generate responses grounded in actual Pocket data.
- Reduce hallucinated or unsupported financial information.
- Explore multi-turn interaction within a personal finance application.
- Evaluate the accuracy and reliability of AI-generated financial explanations.

---

## Planned Architecture

Pocket AI will build on Pocket's existing application and database rather than creating a separate application.

A planned interaction may look like:

```text
User Question
     ↓
Pocket AI
     ↓
Determine what information is needed
     ↓
Pocket Tools / Functions
     ↓
Transactions • Bills • Accounts • Budgets • Notifications
     ↓
Structured Pocket Data
     ↓
Generative AI
     ↓
Grounded Natural-Language Response
```

The exact architecture may evolve as concepts and tools are introduced throughout EGR404.

---

## Planned Repository Organization

The EGR404 project will remain inside the existing Pocket repository because the AI functionality depends directly on Pocket's application and financial data.

The planned organization is:

```text
Pocket/
│
├── app/
│   └── ai/                    # Pocket AI interface
│
├── components/
│   └── ai/                    # AI-specific UI components
│
├── lib/
│   └── ai/                    # AI logic, prompts, and tools
│       └── tools/
│
├── docs/
│   └── egr404/
│       ├── README.md          # EGR404 project overview
│       ├── architecture.md    # Architecture and design decisions
│       ├── evaluation.md      # Evaluation methodology
│       └── results.md         # Testing results and findings
│
└── README.md                  # Main Pocket documentation
```

These directories will be created as they become necessary during implementation rather than creating unused project structure in advance.

---

## Planned Features

### Pocket AI Assistant

Users will be able to ask questions about their own financial activity using natural language.

Rather than sending the entire Pocket database to the AI model, the system will explore using controlled tools or functions to retrieve only the information relevant to a user's question.

Potential tools may include:

```text
getAccountBalances()
getTransactions()
getSpendingSummary()
getUpcomingBills()
getBudgetStatus()
getRecentNotifications()
```

The final tool set will depend on the needs of the project and concepts covered during EGR404.

### While You Were Away

A planned feature is a **While You Were Away** summary.

When a user returns to Pocket after a period of inactivity, Pocket AI could summarize meaningful financial activity that occurred while the user was away.

For example:

> While you were away, two automatic bill payments were recorded, your upcoming car insurance payment is due soon, and one overdue payment still needs confirmation.

The underlying events and financial values will come from Pocket. Generative AI will be responsible for turning those events into a concise, understandable summary.

---

## Grounding and Financial Accuracy

Financial information presents an important challenge for generative AI because a convincing but incorrect answer could mislead the user.

For this reason, Pocket will remain the **source of truth**.

The AI should not independently invent:

- Account balances
- Transactions
- Bill payments
- Due dates
- Budget amounts
- Spending totals
- Other financial activity

Where possible, calculations and financial state will be determined by Pocket's existing application logic before information is provided to the AI.

The AI's primary role will be to **interpret and explain**, rather than independently determine financial facts.

---

## Evaluation

Pocket AI will be evaluated using a set of financial questions where the correct answer can be verified directly against known Pocket data.

Evaluation may examine:

- **Financial accuracy** — Does the response correctly represent the underlying Pocket data?
- **Groundedness** — Are claims supported by information actually available in Pocket?
- **Tool selection** — Does the AI request the appropriate information for the user's question?
- **Hallucination** — Does the AI invent transactions, balances, bills, or other financial information?
- **Response usefulness** — Does the generated explanation make the underlying financial information easier to understand?

Testing may compare different prompting, context, or tool-calling approaches as the project develops.

---

## Technologies and Resources

Pocket currently uses:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL / Supabase
- Clerk
- Inngest
- Vercel

The EGR404 portion of the project is expected to use the **OpenAI API** along with concepts introduced throughout the course, potentially including:

- Prompt engineering
- Structured model responses
- Multi-turn interaction
- Tool/function calling
- Context management
- AI evaluation

### Technical References

The following open-source projects and documentation will be used as technical references while developing Pocket AI:

- **OpenAI Cookbook** — Examples and guides for working with the OpenAI API  
  https://github.com/openai/openai-cookbook

- **OpenAI Agents SDK for TypeScript** — Reference for tool/function calling, agents, guardrails, sessions, and tracing  
  https://github.com/openai/openai-agents-js

- **Vercel AI SDK** — Open-source TypeScript toolkit for building AI applications with Next.js and React  
  https://github.com/vercel/ai

- **Vercel AI Chatbot** — Open-source Next.js application demonstrating conversational AI, tool calling, persistence, and AI UI patterns  
  https://github.com/vercel/chatbot

- **EGR404 course materials and laboratory assignments**

These resources will serve as implementation references rather than fixed architectural requirements. Final technology and framework choices will be made as relevant techniques are explored throughout EGR404.

---

## Development Milestones

### Phase 1 — Foundation

- Define the Pocket AI architecture.
- Connect Pocket to the selected generative AI API.
- Create an initial AI interface.

### Phase 2 — Grounded Pocket Data

- Develop controlled access to selected Pocket financial data.
- Implement initial tools/functions.
- Allow the AI to answer questions using real Pocket data.

### Phase 3 — Intelligent Summaries

- Expand supported financial questions.
- Develop the While You Were Away feature.
- Improve multi-turn interaction and response grounding.

### Phase 4 — Evaluation

- Create a controlled evaluation dataset.
- Test financial accuracy and groundedness.
- Identify hallucinations and failure cases.
- Refine prompts, tools, and application behavior.

### Phase 5 — Final Project

- Document the final architecture.
- Record evaluation results.
- Complete the project report.
- Prepare the final EGR404 demonstration and presentation.

---

## Development Documentation

Additional documentation will be added as the project develops:

- `architecture.md` — system architecture and design decisions
- `evaluation.md` — testing and evaluation methodology
- `results.md` — experimental results, limitations, and findings

This README will also evolve throughout the semester to reflect the final implementation rather than only the original project plan.

---

## Academic Project Scope

Pocket is an ongoing personal software project and was not created specifically for EGR404.

The EGR404 contribution begins with the design and development of **Pocket AI**. AI-specific source code, Git commits, documentation, testing, and evaluation will be clearly identified so that the work completed for the course can be distinguished from Pocket's pre-existing functionality.

Pocket itself will continue to develop alongside the course project, while this documentation will specifically track the generative AI work completed for EGR404.
