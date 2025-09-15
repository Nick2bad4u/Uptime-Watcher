/**
 * Cross-Browser Compatibility Tests Comprehensive tests covering
 * browser-specific behaviors, features, and compatibility issues
 *
 * @file Tests to ensure the Uptime Watcher Electron app works correctly across
 *   different browser engines and device types.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization } from "../utils/ui-helpers";

test.describe("cross-Browser Compatibility", () => {
    test.describe("core Browser Features", () => {
        test("should support modern JavaScript features @compatibility @javascript @features", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test modern JavaScript features
            const jsFeatures = await page.evaluate(() => {
                return {
                    asyncAwait: typeof (async () => {})().then === "function",
                    arrow: (() => true)(),
                    destructuring: (() => {
                        const [a, b] = [1, 2];
                        return a === 1 && b === 2;
                    })(),
                    templateLiterals: `test` === "test",
                    spread: (() => {
                        const arr = [
                            1,
                            2,
                            3,
                        ];
                        return [...arr].length === 3;
                    })(),
                    map: typeof Map !== "undefined",
                    set: typeof Set !== "undefined",
                    promise: typeof Promise !== "undefined",
                    symbol: typeof Symbol !== "undefined",
                    weakMap: typeof WeakMap !== "undefined",
                    proxy: typeof Proxy !== "undefined",
                };
            });

            // All modern JS features should be supported
            // Check core language features
            expect(jsFeatures.asyncAwait).toBe(true);
            expect(jsFeatures.arrow).toBe(true);
            expect(jsFeatures.destructuring).toBe(true);
            expect(jsFeatures.templateLiterals).toBe(true);
            expect(jsFeatures.spread).toBe(true);

            // Check built-in objects
            expect(jsFeatures.map).toBe(true);
            expect(jsFeatures.set).toBe(true);
            expect(jsFeatures.promise).toBe(true);
            expect(jsFeatures.symbol).toBe(true);

            // Check advanced features
            expect(jsFeatures.weakMap && jsFeatures.proxy).toBe(true);

            await electronApp.close();
        });

        test("should support modern CSS features @compatibility @css @features", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test CSS feature support
            const cssFeatures = await page.evaluate(() => {
                const testElement = document.createElement("div");
                document.body.appendChild(testElement);

                const style = testElement.style;

                document.body.removeChild(testElement);
                return {
                    flexbox: "flex" in style,
                    grid: "grid" in style,
                    customProperties: CSS.supports("color", "var(--test)"),
                    calc: CSS.supports("width", "calc(100% - 50px)"),
                    transform: "transform" in style,
                    transition: "transition" in style,
                    animation: "animation" in style,
                    boxShadow: "boxShadow" in style,
                    borderRadius: "borderRadius" in style,
                    gradients: CSS.supports(
                        "background",
                        "linear-gradient(to right, red, blue)"
                    ),
                };
            });

            // Modern CSS features should be supported
            expect(cssFeatures.flexbox).toBe(true);
            expect(cssFeatures.grid).toBe(true);
            expect(cssFeatures.customProperties).toBe(true);
            expect(cssFeatures.calc).toBe(true);
            expect(cssFeatures.transform).toBe(true);
            expect(cssFeatures.transition).toBe(true);
            expect(cssFeatures.animation).toBe(true);
            expect(cssFeatures.boxShadow).toBe(true);
            expect(cssFeatures.borderRadius).toBe(true);
            expect(cssFeatures.gradients).toBe(true);

            await electronApp.close();
        });

        test("should handle DOM APIs correctly @compatibility @dom @apis", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test DOM API support
            const domFeatures = await page.evaluate(() => {
                return {
                    querySelector: typeof document.querySelector === "function",
                    querySelectorAll:
                        typeof document.querySelectorAll === "function",
                    addEventListener:
                        typeof document.addEventListener === "function",
                    removeEventListener:
                        typeof document.removeEventListener === "function",
                    createElement: typeof document.createElement === "function",
                    getElementById:
                        typeof document.getElementById === "function",
                    getElementsByClassName:
                        typeof document.getElementsByClassName === "function",
                    classList: (() => {
                        const el = document.createElement("div");
                        return (
                            typeof el.classList !== "undefined" &&
                            typeof el.classList.add === "function"
                        );
                    })(),
                    dataset: (() => {
                        const el = document.createElement("div");
                        return typeof el.dataset !== "undefined";
                    })(),
                    customElements: typeof customElements !== "undefined",
                    intersectionObserver:
                        typeof IntersectionObserver !== "undefined",
                    mutationObserver: typeof MutationObserver !== "undefined",
                };
            });

            // DOM APIs should be available
            // Core DOM selection and manipulation
            expect(domFeatures.querySelector).toBe(true);
            expect(domFeatures.querySelectorAll).toBe(true);
            expect(domFeatures.createElement).toBe(true);
            expect(domFeatures.getElementById).toBe(true);
            expect(domFeatures.getElementsByClassName).toBe(true);

            // Event handling
            expect(domFeatures.addEventListener).toBe(true);
            expect(domFeatures.removeEventListener).toBe(true);

            // Modern DOM features
            expect(domFeatures.classList && domFeatures.dataset).toBe(true);
            expect(domFeatures.customElements).toBe(true);
            expect(
                domFeatures.intersectionObserver && domFeatures.mutationObserver
            ).toBe(true);

            await electronApp.close();
        });
    });

    test.describe("storage and Data Persistence", () => {
        test("should support modern storage APIs @compatibility @storage @persistence", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test storage API support
            const storageFeatures = await page.evaluate(() => {
                return {
                    localStorage: typeof localStorage !== "undefined",
                    sessionStorage: typeof sessionStorage !== "undefined",
                    indexedDB: typeof indexedDB !== "undefined",
                    cookies: typeof document.cookie !== "undefined",
                };
            });

            expect(storageFeatures.localStorage).toBe(true);
            expect(storageFeatures.sessionStorage).toBe(true);
            expect(storageFeatures.indexedDB).toBe(true);
            expect(storageFeatures.cookies).toBe(true);

            // Test storage functionality
            await page.evaluate(() => {
                // Test localStorage
                localStorage.setItem("test", "value");
                const retrieved = localStorage.getItem("test");
                localStorage.removeItem("test");

                if (retrieved !== "value") {
                    throw new Error("localStorage not working");
                }

                // Test sessionStorage
                sessionStorage.setItem("test", "value");
                const sessionRetrieved = sessionStorage.getItem("test");
                sessionStorage.removeItem("test");

                if (sessionRetrieved !== "value") {
                    throw new Error("sessionStorage not working");
                }
            });

            await electronApp.close();
        });

        test("should handle JSON data correctly @compatibility @json @data", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test JSON handling
            const jsonResult = await page.evaluate(() => {
                const testData = {
                    string: "test",
                    number: 123,
                    boolean: true,
                    null: null,
                    array: [
                        1,
                        2,
                        3,
                    ],
                    object: { nested: "value" },
                };

                const jsonString = JSON.stringify(testData);
                const parsed = JSON.parse(jsonString);

                return {
                    originalType: typeof testData,
                    stringified: typeof jsonString,
                    parsedType: typeof parsed,
                    dataIntegrity:
                        parsed.string === "test" && parsed.number === 123,
                };
            });

            expect(jsonResult.originalType).toBe("object");
            expect(jsonResult.stringified).toBe("string");
            expect(jsonResult.parsedType).toBe("object");
            expect(jsonResult.dataIntegrity).toBe(true);

            await electronApp.close();
        });
    });

    test.describe("network and Communication", () => {
        test("should support fetch API @compatibility @network @fetch", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test fetch API support
            const fetchSupport = await page.evaluate(() => {
                return {
                    fetch: typeof fetch === "function",
                    request: typeof Request !== "undefined",
                    response: typeof Response !== "undefined",
                    headers: typeof Headers !== "undefined",
                    url: typeof URL !== "undefined",
                    urlSearchParams: typeof URLSearchParams !== "undefined",
                };
            });

            expect(fetchSupport.fetch).toBe(true);
            expect(fetchSupport.request).toBe(true);
            expect(fetchSupport.response).toBe(true);
            expect(fetchSupport.headers).toBe(true);
            expect(fetchSupport.url).toBe(true);
            expect(fetchSupport.urlSearchParams).toBe(true);

            await electronApp.close();
        });

        test("should handle WebSocket connections @compatibility @websocket @network", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test WebSocket support
            const wsSupport = await page.evaluate(() => {
                return {
                    webSocket: typeof WebSocket !== "undefined",
                    messageEvent: typeof MessageEvent !== "undefined",
                    closeEvent: typeof CloseEvent !== "undefined",
                    errorEvent: typeof ErrorEvent !== "undefined",
                };
            });

            expect(wsSupport.webSocket).toBe(true);
            expect(wsSupport.messageEvent).toBe(true);
            expect(wsSupport.closeEvent).toBe(true);
            expect(wsSupport.errorEvent).toBe(true);

            await electronApp.close();
        });
    });

    test.describe("security and Compatibility", () => {
        test("should support security features @compatibility @security @crypto", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test security features
            const securityFeatures = await page.evaluate(() => {
                return {
                    crypto: typeof crypto !== "undefined",
                    cryptoSubtle: typeof crypto?.subtle !== "undefined",
                    secureContext:
                        location.protocol === "https:" ||
                        location.hostname === "localhost",
                };
            });

            expect(securityFeatures.crypto).toBe(true);
            expect(securityFeatures.cryptoSubtle).toBe(true);

            await electronApp.close();
        });

        test("should handle origin context correctly @compatibility @security @origin", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test origin and security context
            const originInfo = await page.evaluate(() => {
                return {
                    origin: location.origin,
                    protocol: location.protocol,
                    host: location.host,
                    pathname: location.pathname,
                    sameOrigin: location.origin === window.origin,
                };
            });

            expect(originInfo.sameOrigin).toBe(true);
            expect(originInfo.origin).toBeTruthy();
            expect(originInfo.protocol).toBeTruthy();

            await electronApp.close();
        });
    });
});
