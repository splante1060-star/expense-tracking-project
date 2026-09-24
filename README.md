# Pocket

**Track • Plan • Save**

Pocket is a personal finance web application designed to make everyday money management simple, organized, and easy to understand.

The application brings accounts, transactions, recurring activity, bills, budgets, savings goals, and financial insights together in one place. Pocket is being actively developed with a focus on creating a clean user experience while building reliable financial workflows behind the scenes.

## Features

Pocket currently includes or is actively developing:

- Account management for checking, savings, and credit accounts
- Income and expense transaction tracking
- Recurring transactions
- Bill tracking and recurring bills
- Automatic recording of AutoPay bills
- Upcoming and overdue bill management
- In-app notification center
- Budgets and spending tracking
- Savings goals
- Financial reports and dashboard insights

Additional features and improvements continue to be added as Pocket develops.

## Tech Stack

Pocket is build using a modern full-stack TypeScript architecture.

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Prisma**
- **PostgreSQL / Supabase**
- **Clerk** for authentication
- **Inngest** for scheduled and background processing
- **Vercel** for deployment

## Development Approach

Pocket is an independently developed project created through an iterative, AI-assisted software development workflow.

Generative AI tools are used collaboratively throughout development for brainstorming, implementation assistance, debugging, code review, and exploring alternative approaches.

AI-generated suggestions are manually typed, reviewed, tested, debugged, and adapted before being incorporated into the application. Feature decisions, application direction, integration, testing, and continued development remain part of the hands-on development process.

This approach also provides an opportunity to explore how AI-assisted development can be used responsibly as part of a modern software engineering workflow while maintaining an understanding of the application's architecture and code.

## Inspiration & References

Early inspiration and reference material for Pocket included RoadsideCoder's **Full Stack React Project (AI Finance Platform) — Next JS, Tailwind, Gemini AI, Prisma, Shadcn UI** tutorial:

https://youtu.be/egS6fnZAdzk?si=ecADL3EfHxgHZqJp

Pocket has continued to evolve beyond the tutorial concepts with its own application architecture, features, workflows, design decisions, and ongoing development.

## EGR404 - Pocket AI

Pocket is also being used as the foundation for a project in **EGR404: Building Tools with Generative AI**.

Pocket existed prior to the EGR404 project. The course project will introduce a new generative AI layer that allows users to interact with their own structured Pocket financial data using natural language.

Planned capabilities include:

- Asking questions about personal spending and financial activity
- Retrieving relevant Pocket data through AI tool/function calling
- Generating explanations grounded in actual Pocket data
- Summarizing important financial activity
- A **While You Were Away** summary of recent activity and items requiring attention
- Evaluating response accuracy and reducing hallucinated financial information

The EGR404-specific implementation, documentation, evaluation, and results are being maintained separately within the Pocket repository.

See [`docs/egr404/README.md`](docs/egr404/README.md) for the EGR404 project documentation.

## Project Status

Pocket is currently under active development.

Features, architecture, and documentation will continue to evolve as the application grows.
