import pg from "pg";
import { verifyTestDatabase } from "./setup";

async function executeTestSQL(sql: string) {
  await verifyTestDatabase();

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await client.query(sql);
  } finally {
    await client.end();
  }
}

export async function installFailureTrigger(accountId: string) {
  // Validate the synthetic account identifier.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(accountId)) {
    throw new Error("Invalid test account identifier.");
  }

  await executeTestSQL(`
        BEGIN;

        CREATE FUNCTION ele469_simulated_failure()
        RETURNS TRIGGER AS $$
        BEGIN
            IF OLD.id = '${accountId}'
                AND OLD.balance = 950
                AND NEW.balance = 900
            THEN
                RAISE EXCEPTION
                    'ELE469_SIMULATED_FAILURE';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER ele469_failure_trigger
        BEFORE UPDATE OF balance ON public.accounts
        FOR EACH ROW
        EXECUTE FUNCTION ele469_simulated_failure();

        COMMIT;
    `);

  console.log("Failure injection trigger installed.");
}

export async function removeFailureTrigger() {
  await executeTestSQL(`
        BEGIN;

        DROP TRIGGER IF EXISTS ele469_failure_trigger
        ON public.accounts;

        DROP FUNCTION IF EXISTS
            ele469_simulated_failure();

        COMMIT;
    `);

  console.log("Failure injection trigger removed.");
}
