---
mode: "agent"
tools: ["All Tools"]
description: "Review low confidence AI claims to ensure they are valid issues and implement fixes as needed"
---

# Low Confidence AI Claims Review Prompt

New claims to review, these are LOW confidence claims that need to be reviewed to ensure that they are:

1. Ensure real claims and not false positives
2. Check that the claim makes sense with our project standards and context
3. Document each claim in a document and detail the findings about the claim
4. If they are valid claims, plan to implement the proper fixes according to project standards in the document.

## Instructions

- Review each claim listed below.
- For each claim, read the source code to understand the context of the claim.
- For each claim, determine if it is a real issue or a false positive.
- Assess whether the claim is relevant and makes sense in the context of our project.
- If they are valid issues, proceed to plan a document outlining the proper fixes and actions to take according to project standards.
- Trace all data paths before making recommending changes to ensure we don't break anything, and that the changes are properly implemented.
- Backwards compatibility is not necessary as we are in a development phase - feel free to make breaking changes, as long as you update the entire data path properly. Never write backwards compatibility code.
- If you stumble upon any issues that are not related to the claims, add them to the document.

Proceed to review all low confidence claims below using the outline above:
