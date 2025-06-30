/**
 * Test setup file for Vitest.
 * Configures testing environment for React components.
 */

import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Global test configuration can go here
