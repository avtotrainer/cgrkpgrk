import json
import random
import hashlib


# Function to create a single question with its options and hashed answer
def generate_question(i):
    a = random.randint(1, 50)
    b = random.randint(1, 50)
    op = random.choice(["+", "-", "*", "/"])
    if op == "+":
        result = a + b
    elif op == "-":
        result = a - b
    elif op == "*":
        result = a * b
    else:
        b = random.randint(1, 10)  # simplify division
        result = round(a / b, 2)

    question = f"რამდენია {a} {op} {b}?"
    correct_answer = str(result)
    options = [correct_answer]

    # Generate 3 plausible incorrect options
    while len(options) < 4:
        delta = random.randint(1, 10)
        wrong = str(result + random.choice([-delta, delta]))
        if wrong not in options:
            options.append(wrong)

    random.shuffle(options)

    return {
        "question": question,
        "options": options,
        "answer_hash": hashlib.md5(correct_answer.encode()).hexdigest(),
    }


# Generate 100 questions
questions = [generate_question(i) for i in range(100)]

# Save to a JSON file
file_path = "/mnt/data/123456.json"
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
