---
mode: "agent"
tools: ["All Tools"]
description: "Review low confidence AI claims to ensure they are valid issues and implement fixes as needed"
---

# Low Confidence AI Claims Review Prompt

New claims to review, these are low confidence claims that need to be reviewed to ensure that they are:

1. Real and not false positives
2. Make sense with our project
3. If they are valid issues, proceed to implement the proper fixes according to project standards.

## Instructions

- Review each claim listed below.
- For each claim, determine if it is a real issue or a false positive.
- Assess whether the claim is relevant and makes sense in the context of our project.
- If they are valid issues, proceed to implement the proper fixes according to project standards.
- Trace all data paths before making changes to ensure we don't break anything.
- Backwards compatibility is not necessary as we are in a development phase - feel free to make breaking changes, as long as you update the entire data path properly. Never write backwards compatibility code.

Proceed to review all new low confidence claims using the outline above:
