---
agent: "BeastMode"
argument-hint: "Fulfill All Prompts in Stryker Mutator Workflow"
name: "Stryker-Generate-Stryke-Mutator-Fixes"
description: "Fulfill All Prompts in Stryker Mutator Workflow"
---

# Stryker Mutator Prompt Fulfillment Workflow

## Workflow

1. **Run prompt generation first:**
   - Execute: `py .\scripts\generate_prompts.py`
   - Ensure prompt generation completes with no errors.
2. **Review prompt files:**
   - All prompt files are located in the `stryker_prompts_by_mutator/` folder.
   - Each prompt file is dedicated to a specific mutator.
3. **Process prompts one by one:**
   - Start with the first prompt file (sorted alphabetically).
   - Analyze the prompt requirements.
   - Fulfill all requirements described in the prompt.
   - Implement and test the solution for the prompt.
   - Run all necessary tests to verify the solution works as intended.
   - Once the prompt is fulfilled and tested, **delete the prompt file**.
   - Move to the next prompt and repeat until all prompts are processed.
4. **Testing and verification:**
   - Ensure all changes are tested.
   - Use comprehensive tests to confirm the requirements are met.
   - Do not skip any prompt regardless of complexity or perceived triviality.
5. **Do not stop until all prompt files are processed and deleted.**
6. **Use unlimited requests and time as needed.**
7. **Document any issues or bugs discovered during prompt fulfillment.**

## Prompt Fulfillment Rules

### General Guidelines

1. **Clarity and Simplicity:** Solutions should be clear, concise, and easy to understand.
2. **Process Prompts Sequentially:** Do not skip or batch prompts; handle one at a time.
3. **Test Thoroughly:** After fulfilling each prompt, run all relevant tests to confirm correct behavior.
4. **Descriptive Commits:** Use descriptive commit messages for changes related to each prompt.
5. **Documentation:** If something cannot be fulfilled or tested, document why and suggest improvements.

### Stryker Mutator Prompt Handling

- Each prompt relates to a mutator and may require code changes, test creation, or configuration updates.
- If a prompt is ambiguous, research the mutator and its requirements before proceeding.
- For each prompt, ensure you:
  - Implement the required mutation or feature.
  - Create or update tests to confirm the mutation works.
  - Run the Stryker workflow to verify effectiveness.
  - Delete the prompt file once done.

## Special Instructions

- **Ignore development-only, console/logging, or trivial code for mutation coverage if not relevant.**
- Focus on functional code, logical mutations, and edge cases.
- Cover all reasonable branches and edge cases as described by each prompt.
- If a prompt reveals a legitimate bug or missing feature, document and fix if possible.

## Requirements

- Complete every prompt file in `stryker_prompts_by_mutator/`.
- Do not stop until all prompt files are gone and requirements are met.
- All changes must be tested and verified.

## If Attachments Are Present

- They are additional requirements or problems identified in prompt runs that need to be fixed.
- If nothing is attached, start with running `py .\scripts\generate_prompts.py` and process the resulting prompts.

---

### Important AI Note

- **Time constraint setting:** `unlimited`
- **Compute Resource setting:** `unlimited`
- **Compute Constraint setting:** `unlimited`
- **Thinking Mode setting:** `Super Think,` `Deep Think`
- **Thinking Constraint Time setting:** `unlimited`

---

## All Possible Test API to Use

- Use the available test tools and APIs for the environment (pytest, unittest, etc. for Python).
- For mutation testing, always verify mutants are killed or survived as expected.

---

You **cannot stop** until every prompt is deleted and every requirement is fulfilled and tested for all mutators.

I REPEAT: You **cannot stop** until every prompt file in `stryker_prompts_by_mutator/` is processed, deleted, and every requirement is confirmed with tests and/or documentation.

---
