import { strict as assert } from "node:assert";

async function handleAIRequest(callOpenAI: () => Promise<string>) {
  try {
    const answer = await callOpenAI();

    if (!answer) {
      return {
        status: 502,
        body: { error: "No response generated" },
      };
    }

    return {
      status: 200,
      body: { message: answer },
    };
  } catch {
    return {
      status: 500,
      body: { error: "Failed to generate AI response" },
    };
  }
}

async function main() {
  // Test 1 — OpenAI request fails
  const failedRequest = await handleAIRequest(async () => {
    throw new Error("Simulated OpenAI API failure");
  });

  assert.deepEqual(failedRequest, {
    status: 500,
    body: { error: "Failed to generate AI response" },
  });

  console.log("PASS: OpenAI failure returns an error");

  // Test 2 — OpenAI returns an empty response
  const emptyResponse = await handleAIRequest(async () => "");

  assert.deepEqual(emptyResponse, {
    status: 502,
    body: { error: "No response generated" },
  });

  console.log("PASS: Empty response is rejected");

  // Test 3 — OpenAI returns a valid response
  const successfulResponse = await handleAIRequest(
    async () => "Verified response",
  );

  assert.deepEqual(successfulResponse, {
    status: 200,
    body: { message: "Verified response" },
  });

  console.log("PASS: Valid response is returned");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
