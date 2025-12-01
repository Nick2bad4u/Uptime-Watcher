---
name: "Low-Confidence-AI-Review"
agent: "BeastMode"
description: "Review low confidence AI claims to ensure they are valid issues and implement fixes as needed"
argument-hint: "Review low confidence AI claims to ensure they are valid issues and implement fixes as needed"
---

# Low Confidence AI Claims Review Prompt

New claims to review, these are LOW confidence claims that need to be reviewed to ensure that they are:

1. Ensure these are real claims and not false positives
2. Check that the claim makes sense with our project standards, context, and codebase architecture
3. If they are valid claims, plan to implement the proper fixes according to project standards in the document.

## Instructions

- Review each claim listed below.
- For each claim, read the source code to understand the context of the claim.
- For each claim, determine if it is a real issue or a false positive.
- Assess whether the claim is relevant and makes sense in the context of our project.
- If they are valid issues, proceed to plan a document outlining the proper fixes and actions to take according to project standards.
- Trace all data paths before making recommending changes to ensure we don't break anything, and that the changes are properly implemented.
- Backwards compatibility is not necessary as we are in a development phase - feel free to make breaking changes, as long as you update the entire data path properly. Never write backwards compatibility code without approval.
- If you stumble upon any issues that are not related to the claims, add them to the document.
- If you find any inadequate or missing TSDoc comments, create and/or add to them to improve the documentation of the codebase.

## Proceed to review all low confidence claims below using the outline above:

- Once finished, do your own source code review of the file, including checking for claims similar to the ones you just reviewed, and new claims that may have emerged during your review. Make sure you trace data paths and ensure all changes make sense for the project. Never assume anything about the code without verifying it.
