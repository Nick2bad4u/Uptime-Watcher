import { describe, expect, it, vi } from "vitest";

import { scrollToSiteCard } from "../../../utils/dom/scrollToSiteCard";

describe(scrollToSiteCard, () => {
    it("scrolls the matching element inside the site list container", () => {
        document.body.innerHTML = "";

        const sidebarButton = document.createElement("button");
        sidebarButton.dataset["siteIdentifier"] = "example.com";
        const sidebarScrollSpy = vi.fn();
        sidebarButton.scrollIntoView = sidebarScrollSpy;

        const siteList = document.createElement("div");
        siteList.dataset["testid"] = "site-list";

        const card = document.createElement("div");
        card.dataset["siteIdentifier"] = "example.com";
        const cardScrollSpy = vi.fn();
        card.scrollIntoView = cardScrollSpy;

        siteList.append(card);
        document.body.append(sidebarButton, siteList);

        scrollToSiteCard("example.com");

        expect(cardScrollSpy).toHaveBeenCalledTimes(1);
        expect(sidebarScrollSpy).not.toHaveBeenCalled();
    });

    it("does not throw when CSS.escape is missing and identifier contains quotes", () => {
        document.body.innerHTML = "";

        const originalCss = Reflect.get(globalThis, "CSS");
        Reflect.set(globalThis, "CSS", undefined);

        try {
            const siteList = document.createElement("div");
            siteList.dataset["testid"] = "site-list";

            const card = document.createElement("div");
            card.dataset["siteIdentifier"] = 'a"b';
            const cardScrollSpy = vi.fn();
            card.scrollIntoView = cardScrollSpy;

            siteList.append(card);
            document.body.append(siteList);

            expect(() => scrollToSiteCard('a"b')).not.toThrowError();
            expect(cardScrollSpy).toHaveBeenCalledTimes(1);
        } finally {
            Reflect.set(globalThis, "CSS", originalCss);
        }
    });

    it("is a no-op when the site list container is missing", () => {
        document.body.innerHTML = "";
        expect(() => scrollToSiteCard("example.com")).not.toThrowError();
    });
});
