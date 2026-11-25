# Pocket Cloud: Reliable Financial Processing

**Author:** Sophie Plante  
**Course:** ELE 469 – Computer Systems for Modern Cloud Computing  
**University:** University of Rhode Island  
**Semester:** Fall 2026

## Project Overview

Pocket is a cloud-based personal finance application that supports account management, transaction tracking, recurring transactions, budgeting, and savings goals.

This project evaluates the reliability and performance of Pocket's existing recurring transaction processing system through controlled experiments. The primary objective is to determine whether the processor maintains consistent financial records under repeated executions, concurrent executions, processing failures, and increasing workload sizes.

The experimental framework operates independently of Pocket's production environment and does not modify the existing recurring transaction processing logic.

## Research Objectives

- Evaluate idempotency under repeated processor executions.
- Evaluate concurrency control under overlapping processor executions.
- Verify transactional atomicity and recovery following a controlled database failure.
- Measure processor execution time and throughput under increasing workloads.
- Identify limitations and opportunities for future improvements.

## Experimental Environment

The experiments were conducted locally on a MacBook Air using an isolated PostgreSQL database.

| Component            | Configuration |
| -------------------- | ------------- |
| Node.js              | 24.17.0       |
| npm                  | 11.13.0       |
| PostgreSQL           | 17.12         |
| Prisma               | 7.9.1         |
| TypeScript execution | tsx 4.23.15   |
| Database host        | 127.0.0.1     |
| Database port        | 5433          |
| Database name        | ele469_test   |
| Database user        | ele469_user   |

The experimental database was initialized using Pocket's existing Prisma migrations to reproduce the application's database schema, indexes, relationships, and uniqueness constraints.

All experiments use synthetic financial records and directly invoke Pocket's existing recurring transaction processor.

## Database Safety and Isolation

The experimental framework includes multiple safeguards to prevent accidental access to production data:

- A dedicated local PostgreSQL cluster.
- A separate experimental database and non-superuser database role.
- Explicitly configured DATABASE_URL and DIRECT_URL environment variables.
- Connection string validation before experimental execution.
- Verification of the actual connected database, database user, server address, and port.
- Synthetic user identifiers and email addresses.
- Automatic removal of synthetic records following each trial.

Production environment configuration files remain unchanged.

## Directory Structure

```text
experiments/ele469/
├── guard.mjs
├── setup.ts
├── baseline.ts
├── experiment1.ts
├── failure-injection.ts
├── experiment2.ts
├── experiment3.ts
├── README.md
└── results/
    ├── experimental-session.txt
    ├── experiment3-trials.csv
    └── experiment3-summary.csv
```

## Experimental Components

| File                 | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| guard.mjs            | Validates experimental database connection strings.                               |
| setup.ts             | Provides database verification, synthetic data generation, and cleanup utilities. |
| baseline.ts          | Verifies normal recurring transaction processing.                                 |
| experiment1.ts       | Evaluates repeated and concurrent executions.                                     |
| failure-injection.ts | Implements controlled PostgreSQL failure injection.                               |
| experiment2.ts       | Evaluates transactional rollback and recovery.                                    |
| experiment3.ts       | Evaluates execution time, throughput, and correctness under increasing workloads. |
| results/             | Contains preserved experimental output and performance measurements.              |

## Reproducing the Experiments

### 1. Install Dependencies

From the Pocket project root:

```bash
npm ci
```

Ensure PostgreSQL 17 is installed and a dedicated local PostgreSQL cluster is configured to listen on port 5433.

Create an experimental database named ele469_test and a non-superuser login role named ele469_user that owns the database.

### 2. Configure the Experimental Database Connection

Open a dedicated terminal session from the Pocket project root. Configure the experimental connection strings without modifying production environment files.

For zsh:

```bash
read -rs "TEST_DB_PASSWORD?Enter ELE469 database password: "
echo

ENCODED_PASSWORD=$(printf '%s' "$TEST_DB_PASSWORD" | node -e 'process.stdout.write(encodeURIComponent(require("fs").readFileSync(0, "utf8")))')

export DATABASE_URL="postgresql://ele469_user:${ENCODED_PASSWORD}@127.0.0.1:5433/ele469_test"

export DIRECT_URL="$DATABASE_URL"

unset TEST_DB_PASSWORD ENCODED_PASSWORD
```

### 3. Initialize the Database Schema

Validate the experimental database connection strings:

```bash
node --input-type=module -e 'import { assertTestDatabase } from "./experiments/ele469/guard.mjs"; assertTestDatabase();'
```

Verify the actual database connection:

```bash
./node_modules/.bin/tsx -e 'import { verifyTestDatabase } from "./experiments/ele469/setup.ts"; verifyTestDatabase().catch(error => { console.error(error); process.exitCode = 1; });'
```

Only after both checks succeed, apply Pocket's existing database migrations:

```bash
./node_modules/.bin/prisma migrate deploy
```

Verify migration status:

```bash
./node_modules/.bin/prisma migrate status
```

### 4. Execute the Baseline Test

```bash
./node_modules/.bin/tsx experiments/ele469/baseline.ts
```

### 5. Execute the Reliability Experiments

```bash
./node_modules/.bin/tsx experiments/ele469/experiment1.ts
```

```bash
./node_modules/.bin/tsx experiments/ele469/experiment2.ts
```

### 6. Execute the Performance Experiment

```bash
./node_modules/.bin/tsx experiments/ele469/experiment3.ts
```

Experiment 3 generates individual trial measurements and aggregated performance statistics as CSV files in the experimental directory. The original measured results are preserved separately in the results directory.

## Experimental Methodology

### Baseline Test

A synthetic debit account is initialized with a balance of $1,000 and one overdue recurring expense of $50. The processor is executed once to verify transaction creation, account balance adjustment, and recurring schedule advancement.

### Experiment 1: Repeated and Concurrent Executions

Experiment 1 evaluates two execution scenarios:

- Five sequential processor invocations per trial.
- Five concurrent processor invocations per trial.

Each scenario consists of ten independent trials. Every trial begins with one eligible recurring transaction series and one due occurrence.

The persisted database state is evaluated to determine whether repeated or overlapping executions introduce duplicate records, incorrect account balances, or scheduling inconsistencies.

### Experiment 2: Failure Handling and Recovery

Experiment 2 consists of ten independent trials containing two overdue occurrences within a single recurring transaction series.

A PostgreSQL trigger deliberately introduces a database exception during the second occurrence's account balance update.

The database state is examined immediately following the failure to verify rollback of incomplete changes and preservation of previously committed work.

The failure condition is subsequently removed, and the processor is executed again to evaluate recovery.

### Experiment 3: Performance Evaluation

Experiment 3 evaluates six workload sizes: 1, 10, 50, 100, 500, and 1,000 eligible recurring transaction series.

Each series is associated with an independent synthetic account and exactly one due occurrence.

One warm-up trial is performed for each workload size, followed by ten measured trials per workload. Workload execution order is rotated between trial rounds to reduce systematic ordering bias.

Execution time is measured using Node.js performance.now(). Synthetic data generation, database state validation, and cleanup are excluded from the measured execution time.

## Experimental Results

### Reliability Results

| Scenario               | Successful Trials | Duplicate Records | Maximum Balance Error | Schedule Errors |
| ---------------------- | ----------------: | ----------------: | --------------------: | --------------: |
| Repeated executions    |             10/10 |                 0 |                 $0.00 |               0 |
| Concurrent executions  |             10/10 |                 0 |                 $0.00 |               0 |
| Failure and recovery   |             10/10 |                 0 |                 $0.00 |               0 |
| Performance evaluation |             60/60 |                 0 |                 $0.00 |               0 |
| Total                  |             90/90 |                 0 |                 $0.00 |               0 |

All ten failure recovery trials successfully preserved previously committed work, rolled back incomplete changes, and recovered the remaining overdue occurrence.

### Performance Results

| Workload | Mean Time (ms) | Standard Deviation (ms) | Throughput (occurrences/s) |
| -------: | -------------: | ----------------------: | -------------------------: |
|        1 |          2.075 |                   0.566 |                    481.918 |
|       10 |         11.660 |                   0.528 |                    857.614 |
|       50 |         61.228 |                  16.454 |                    816.624 |
|      100 |        108.876 |                   7.873 |                    918.477 |
|      500 |        529.951 |                  35.736 |                    943.484 |
|    1,000 |       1084.675 |                  67.420 |                    921.936 |

The performance experiment processed 16,610 occurrences across 60 measured trials. Execution time increased approximately linearly with workload size, while correctness was maintained across all tested workloads.

## Limitations

The experimental evaluation is limited to a controlled local environment using synthetic financial records.

The experiments directly invoke the recurring transaction processor rather than executing through Inngest's deployed scheduling infrastructure. Failure recovery is evaluated through controlled database exceptions and manual processor re-execution rather than automatic cloud-based retries.

Measured execution times characterize local processor performance and do not include production network latency, serverless initialization overhead, or external infrastructure variability.

The results demonstrate reliability under the evaluated conditions but do not establish correctness under every possible workload or failure scenario.

## Conclusion

The experimental results demonstrate that Pocket's existing recurring transaction processor maintained consistent financial records across all evaluated scenarios.

Database transactions, conditional schedule updates, and occurrence-level uniqueness constraints collectively supported reliable processing under repeated executions, concurrent executions, and controlled failures.

The performance evaluation additionally demonstrated approximately linear execution time scaling across the tested workload sizes.

This project contributes a reproducible experimental framework for evaluating the reliability and performance of Pocket's existing cloud-based financial processing system.
