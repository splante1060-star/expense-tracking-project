export function assertTestDatabase() {
  for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
    const url = new URL(process.env[name] ?? "");

    const valid =
      url.protocol === "postgresql:" &&
      url.hostname === "127.0.0.1" &&
      url.port === "5433" &&
      url.pathname === "/ele469_test" &&
      url.username === "ele469_user" &&
      url.password.length > 0 &&
      url.search === "" &&
      url.hash === "";

    if (!valid) {
      throw new Error(`${name}: Unsafe database connection.`);
    }
  }

  if (process.env.DATABASE_URL !== process.env.DIRECT_URL) {
    throw new Error("Database URLs do not match.");
  }

  console.log("ELE469 database safety check passed.");
}
