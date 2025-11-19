#!/usr/bin/env node
// Quick test script to validate our remark configuration

import { readFile } from "fs/promises";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import validateUptimeWatcherDocs from "./config/linting/remark/validate-uptime-watcher-docs.mjs";

async function testRemarkConfig() {
    console.log("🧪 Testing remark configuration...\n");

    try {
        // Test with a sample markdown file
        const testContent = `---
title: "Test Document"
summary: "This is a test"
author: "Test Author"
category: "guide"
created: "2024-01-01"
last_reviewed: "2024-01-01"
tags: ["test"]
---

# Test Document

This is a **test** document with some content.

## Section 1

Here's some content with javascript code:

\`\`\`
const test = "hello world";
\`\`\`

## Section 2

More content here.
`;

        const processor = remark()
            .use(remarkFrontmatter)
            .use(remarkGfm)
            .use(validateUptimeWatcherDocs);

        const result = await processor.process(testContent);

        console.log("✅ Remark configuration is working!");

        if (result.messages.length > 0) {
            console.log("\n📝 Validation messages:");
            result.messages.forEach((msg) => {
                console.log(`   ${msg.severity}: ${msg.message}`);
            });
        } else {
            console.log("✅ No validation issues found!");
        }
    } catch (error) {
        console.error("❌ Remark configuration error:", error);
        process.exit(1);
    }
}

testRemarkConfig();
