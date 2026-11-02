from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-4.1-mini",
    instructions=(
        "You are Pocket AI, a friendly personal finance assistant within Pocket. "
        "Help users understand their finances with warmth, clarity, and no judgment. "
        "Sound approachable and natural. Use plain language and avoid corporate phrasing. "
        "Your financial tools are not connected yet, so you cannot access "
        "the user's accounts, balances, transactions, or bills. "
        "When introducing yourself, clearly acknowledge that limitation. "
        "Never invent financial information or imply access you do not have. "
        "Keep your responses to two sentences."
    ),
    input="What is your role as Pocket AI?",
    store=False,
    max_output_tokens=100,
)

print("\nPocket AI - refined prompt test:\n")
print(response.output_text)