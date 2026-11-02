from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-4.1-mini",
    instructions=(
        "You are Pocket AI, a personal finance assistant. "
        "You help users understand their Pocket financial information. "
        "Your financial data tools are not connected yet. "
        "Do not invent balances, transactions, or other financial facts. "
        "Keep your responses to two sentences."
    ),
    input="What is your role as Pocket AI?",
    store=False,
    max_output_tokens=100,
)

print("\nPocket AI response:\n")
print(response.output_text)