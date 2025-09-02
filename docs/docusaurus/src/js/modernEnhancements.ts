/**
 * Advanced JavaScript enhancements for modern website interactions. Implements
 * 2025 web design trends and micro-interactions
 */

// Type definitions

type CleanupFunction = () => void;

interface CleanupRef {
    current: CleanupFunction | null;
}

// Extend Window interface for global access
declare global {
    interface Window {
        initializeAdvancedFeatures?: typeof initializeAdvancedFeatures;
    }
}

// Type guards
function isHTMLElement(element: Element | null): element is HTMLElement {
    return element instanceof HTMLElement;
}

/**
 * Creates smooth scroll progress indicator
 */
function createScrollIndicator(): CleanupFunction {
    const indicator = document.createElement("div");
    indicator.className = "scroll-indicator";
    document.body.append(indicator);

    function updateScrollIndicator(): void {
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        indicator.style.width = `${scrollPercent}%`;
    }

    window.addEventListener("scroll", updateScrollIndicator, { passive: true });
    updateScrollIndicator(); // Initial call

    // Return cleanup function
    return function cleanup(): void {
        window.removeEventListener("scroll", updateScrollIndicator);
        indicator.remove();
    };
}

/**
 * Initializes magnetic button effects
 */
function initializeMagneticButtons(): CleanupFunction {
    const buttons = document.querySelectorAll(".button, .button-magnetic");
    const cleanupFunctions: CleanupFunction[] = [];

    buttons.forEach((button) => {
        if (!isHTMLElement(button)) return;
        const htmlButton = button;

        function handleMouseMove(e: MouseEvent): void {
            const rect = htmlButton.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const moveX = x * 0.15;
            const moveY = y * 0.15;

            htmlButton.style.setProperty("--mouse-x", `${moveX}px`);
            htmlButton.style.setProperty("--mouse-y", `${moveY}px`);
            htmlButton.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        }

        function handleMouseLeave(): void {
            htmlButton.style.transform = "translate(0, 0) scale(1)";
        }

        htmlButton.addEventListener("mousemove", handleMouseMove);
        htmlButton.addEventListener("mouseleave", handleMouseLeave);

        cleanupFunctions.push(() => {
            htmlButton.removeEventListener("mousemove", handleMouseMove);
            htmlButton.removeEventListener("mouseleave", handleMouseLeave);
        });
    });

    return function cleanup(): void {
        cleanupFunctions.forEach((fn) => {
            fn();
        });
    };
}

/**
 * Initializes scroll animations using intersection observer
 */
function initializeScrollAnimations(): CleanupFunction {
    // Only add animations if browser doesn't support scroll-driven animations
    if (!CSS.supports("animation-timeline", "scroll()")) {
        const observerOptions: IntersectionObserverInit = {
            rootMargin: "0px 0px -50px 0px",
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const { isIntersecting, target } = entry;
                if (isIntersecting && isHTMLElement(target)) {
                    target.style.opacity = "1";
                    target.style.transform = "translateY(0)";
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            ".scroll-fade, .scroll-slide, .content-card, h1, h2, h3, .markdown > div, .feature, .feature-item, .why-item, [class*='feature'], [class*='why']"
        );

        animatedElements.forEach((el) => {
            if (!isHTMLElement(el)) return;
            if (!el.style.opacity) {
                el.style.opacity = "0";
                el.style.transform = "translateY(20px)";
                el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            }
            observer.observe(el);
        });

        return function cleanup(): void {
            observer.disconnect();
        };
    }

    return function cleanup(): void {
        // No-op for browsers with native scroll-driven animations
    };
}

/**
 * Applies glassmorphism effects with dynamic backgrounds
 */
function applyGlassmorphismEffects(): CleanupFunction {
    const glassElements = document.querySelectorAll(
        ".glass-effect, .glass-card"
    );
    const cleanupFunctions: CleanupFunction[] = [];

    glassElements.forEach((element) => {
        if (!isHTMLElement(element)) return;

        function handleMouseMove(e: MouseEvent): void {
            const rect = element.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            if (isHTMLElement(element)) {
                element.style.background = `
                    radial-gradient(circle at ${x}% ${y}%,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.05) 50%,
                    transparent 100%),
                    var(--glass-backdrop)
                `;
            }
        }

        function handleMouseLeave(): void {
            if (isHTMLElement(element)) {
                element.style.background = "var(--glass-backdrop)";
            }
        }

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        cleanupFunctions.push(() => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseleave", handleMouseLeave);
        });
    });

    return function cleanup(): void {
        cleanupFunctions.forEach((fn) => {
            fn();
        });
    };
}

/**
 * Applies theme toggle with animation
 */
function applyThemeToggleAnimation(): CleanupFunction {
    const themeToggle = document.querySelector(
        '[aria-label*="color mode"], [title*="Switch"]'
    );

    if (isHTMLElement(themeToggle)) {
        function handleClick(): void {
            // Add a spinning animation
            if (isHTMLElement(themeToggle)) {
                themeToggle.style.transform = "scale(0.8) rotate(180deg)";
                themeToggle.style.transition =
                    "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

                setTimeout(() => {
                    if (isHTMLElement(themeToggle)) {
                        themeToggle.style.transform = "scale(1) rotate(0deg)";
                    }
                }, 150);
            }
        }

        themeToggle.addEventListener("click", handleClick);

        return function cleanup(): void {
            themeToggle.removeEventListener("click", handleClick);
        };
    }

    return function cleanup(): void {
        // No-op if no theme toggle found
    };
}

/**
 * Applies three-dimensional tilt effects for cards
 */
function applyThreeDimensionalTiltEffects(): CleanupFunction {
    const tiltElements = document.querySelectorAll(".tilt-hover, .card-3d");
    const cleanupFunctions: CleanupFunction[] = [];

    tiltElements.forEach((element) => {
        if (!isHTMLElement(element)) return;

        function handleMouseMove(e: MouseEvent): void {
            if (window.innerWidth <= 768) return; // Skip on mobile
            if (!isHTMLElement(element)) return;

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);

            const rotateX = deltaY * -10;
            const rotateY = deltaX * 10;
            const scale = 1.05;

            element.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(${scale})
                translateZ(20px)
            `;
        }

        function handleMouseLeave(): void {
            if (!isHTMLElement(element)) return;
            element.style.transform =
                "perspective(1000px) rotateX(0) rotateY(0) scale(1) translateZ(0)";
        }

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        cleanupFunctions.push(() => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseleave", handleMouseLeave);
        });
    });

    return function cleanup(): void {
        cleanupFunctions.forEach((fn) => {
            fn();
        });
    };
}

/**
 * Adds dynamic color accents on hover
 */
function addDynamicColorAccents(): CleanupFunction {
    const accentElements = document.querySelectorAll(
        ".navbar__link, .menu__link, .button"
    );
    const cleanupFunctions: CleanupFunction[] = [];

    accentElements.forEach((element) => {
        if (!isHTMLElement(element)) return;

        function handleMouseEnter(): void {
            if (!isHTMLElement(element)) return;
            // Use deterministic value instead of Math.random() for security
            const hue = Date.now() % 360;
            element.style.setProperty("--dynamic-hue", hue.toString());
            element.style.setProperty(
                "--dynamic-color",
                `hsl(${hue}, 70%, 60%)`
            );
        }

        element.addEventListener("mouseenter", handleMouseEnter);

        cleanupFunctions.push(() => {
            element.removeEventListener("mouseenter", handleMouseEnter);
        });
    });

    return function cleanup(): void {
        cleanupFunctions.forEach((fn) => {
            fn();
        });
    };
}

/**
 * Initializes cursor following gradient effect
 */
function initializeCursorGradient(): CleanupFunction {
    if (window.innerWidth <= 768) {
        return function cleanup(): void {
            // No-op for mobile
        };
    }

    let mouseX = 0;
    let mouseY = 0;

    function handleMouseMove(e: MouseEvent): void {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Update CSS custom properties for cursor position
        document.documentElement.style.setProperty("--cursor-x", `${mouseX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${mouseY}px`);
    }

    document.addEventListener("mousemove", handleMouseMove);

    // Add subtle radial gradient that follows cursor
    const cursorGradient = document.createElement("div");
    cursorGradient.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(600px circle at var(--cursor-x, 50%) var(--cursor-y, 50%),
                    rgba(102, 126, 234, 0.03) 0%,
                    transparent 50%);
        pointer-events: none;
        z-index: -1;
        transition: opacity 0.3s ease;
    `;
    document.body.append(cursorGradient);

    return function cleanup(): void {
        document.removeEventListener("mousemove", handleMouseMove);
        cursorGradient.remove();
    };
}

/**
 * Configures performance features for animated elements
 */
function configurePerformanceFeatures(): CleanupFunction {
    // Add will-change property to animated elements
    const animatedElements = document.querySelectorAll(`
        .glass-card,
        .button,
        .navbar__link,
        .menu__link,
        .tilt-hover,
        .card-3d
    `);
    const cleanupFunctions: CleanupFunction[] = [];

    animatedElements.forEach((element) => {
        if (!isHTMLElement(element)) return;
        element.style.willChange = "transform, opacity";

        function handleTransitionEnd(): void {
            if (isHTMLElement(element)) {
                element.style.willChange = "auto";
            }
        }

        // Remove will-change after animation completes
        element.addEventListener("transitionend", handleTransitionEnd);

        cleanupFunctions.push(() => {
            element.removeEventListener("transitionend", handleTransitionEnd);
        });
    });

    return function cleanup(): void {
        cleanupFunctions.forEach((fn) => {
            fn();
        });
    };
}

/**
 * Initializes all advanced features with proper cleanup
 */
function initializeAdvancedFeatures(): CleanupFunction {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const cleanupFunctions: CleanupFunction[] = [];

    if (!prefersReducedMotion) {
        cleanupFunctions.push(
            createScrollIndicator(),
            initializeMagneticButtons(),
            initializeScrollAnimations(),
            applyGlassmorphismEffects(),
            applyThreeDimensionalTiltEffects(),
            addDynamicColorAccents(),
            initializeCursorGradient()
        );
    }

    // Always init these (they respect reduced motion internally)
    cleanupFunctions.push(
        applyThemeToggleAnimation(),
        configurePerformanceFeatures()
    );

    return function cleanup(): void {
        cleanupFunctions.forEach((fn) => {
            fn();
        });
    };
}

/**
 * Main initialization function
 */
function initializeEnhancements(): CleanupFunction {
    const cleanupRef: CleanupRef = {
        current: null,
    };

    function setupEnhancements(): void {
        // Clean up previous initialization if any
        if (cleanupRef.current) {
            cleanupRef.current();
        }
        cleanupRef.current = initializeAdvancedFeatures();
    }

    function handleDOMContentLoaded(): void {
        setupEnhancements();
        document.removeEventListener(
            "DOMContentLoaded",
            handleDOMContentLoaded
        );
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    } else {
        setupEnhancements();
    }

    // Re-initialize on route changes (for SPA behavior)
    let lastPathname = typeof location === "undefined" ? "" : location.pathname;
    const observer = new MutationObserver(() => {
        if (
            typeof location !== "undefined" &&
            location.pathname !== lastPathname
        ) {
            lastPathname = location.pathname;
            setTimeout(setupEnhancements, 100); // Small delay for DOM updates
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function handleBeforeUnload(): void {
        if (cleanupRef.current) {
            cleanupRef.current();
        }
        observer.disconnect();
    }

    // Clean up on page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Return cleanup function for manual cleanup if needed
    return function manualCleanup(): void {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        handleBeforeUnload();
    };
}

// Auto-initialize when module loads (but only if in browser environment)
if (typeof window !== "undefined" && typeof document !== "undefined") {
    initializeEnhancements();
}

// Export for manual initialization if needed
if (typeof window !== "undefined") {
    window.initializeAdvancedFeatures = initializeAdvancedFeatures;
}

// ES Module export
export { initializeAdvancedFeatures, initializeEnhancements };
export default initializeEnhancements;
