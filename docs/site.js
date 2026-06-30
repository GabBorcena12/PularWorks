const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-site-header]");
const revealItems = [...document.querySelectorAll(".reveal")];
const counters = [...document.querySelectorAll("[data-count-to]")];
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const expandableSections = [...document.querySelectorAll("[data-expandable-section]")];
const contactDropdowns = [...document.querySelectorAll("[data-contact-dropdown]")];
const inquiryForm = document.querySelector(".inquiry-form");
const inquiryStatus = document.getElementById("form-success");
const inquiryModal = document.getElementById("thank-you-modal");
const inquiryModalCloseButtons = [...document.querySelectorAll(".thank-you-modal-close")];
const inquiryConfigData = document.getElementById("inquiry-config-data");
const navSections = navLinks
    .map((link) => document.getElementById(link.dataset.navLink))
    .filter(Boolean);

function updateHeader() {
    if (!header) {
        return;
    }

    header.classList.toggle("is-solid", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

function updateActiveNav() {
    if (!navLinks.length || !navSections.length) {
        return;
    }

    const marker = window.scrollY + 150;
    const current = navSections
        .filter((section) => section.offsetTop <= marker)
        .pop() || navSections[0];

    navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.navLink === current.id);
    });
}

updateActiveNav();
window.addEventListener("scroll", updateActiveNav, { passive: true });

expandableSections.forEach((section) => {
    const button = section.querySelector("[data-expand-toggle]");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        const expanded = section.classList.toggle("is-expanded");
        button.textContent = expanded ? "Show Less" : "Show More";
        button.setAttribute("aria-expanded", String(expanded));

        if (!expanded && window.matchMedia("(max-width: 640px)").matches) {
            section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        }
    });
});

function closeContactDropdown(dropdown) {
    const toggle = dropdown.querySelector("[data-contact-dropdown-toggle]");
    const menu = dropdown.querySelector("[data-contact-dropdown-menu]");

    if (!toggle || !menu) {
        return;
    }

    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
}

contactDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-contact-dropdown-toggle]");
    const menu = dropdown.querySelector("[data-contact-dropdown-menu]");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isExpanded = toggle.getAttribute("aria-expanded") === "true";

        contactDropdowns.forEach((item) => {
            if (item !== dropdown) {
                closeContactDropdown(item);
            }
        });

        toggle.setAttribute("aria-expanded", String(!isExpanded));
        menu.hidden = isExpanded;
    });
});

document.addEventListener("click", (event) => {
    contactDropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
            closeContactDropdown(dropdown);
        }
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        contactDropdowns.forEach(closeContactDropdown);
        closeThankYouModal();
    }
});

function setFormStatus(element, state, message) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("error", "success");

    if (state) {
        element.classList.add(state);
    }
}

function openThankYouModal() {
    if (!inquiryModal) {
        return;
    }

    inquiryModal.classList.add("is-open");
    inquiryModal.setAttribute("aria-hidden", "false");
}

function closeThankYouModal() {
    if (!inquiryModal) {
        return;
    }

    inquiryModal.classList.remove("is-open");
    inquiryModal.setAttribute("aria-hidden", "true");
}

function readInlineInquiryConfig() {
    if (!inquiryConfigData?.textContent) {
        return {};
    }

    try {
        return JSON.parse(inquiryConfigData.textContent);
    } catch (error) {
        console.error("Unable to parse inquiry config.", error);
        return {};
    }
}

async function loadInquiryConfig() {
    const inlineConfig = readInlineInquiryConfig();
    const configUrl = new URL("config/inquiry-config.json", document.baseURI);

    try {
        const response = await fetch(configUrl, {
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed with ${response.status}`);
        }

        const remoteConfig = await response.json();
        return { ...inlineConfig, ...remoteConfig };
    } catch (error) {
        console.warn("Falling back to inline inquiry config.", error);
        return inlineConfig;
    }
}

function applyInquiryConfig(form, config) {
    if (!form || !config) {
        return;
    }

    if (config.staticFormsEndpoint) {
        form.action = config.staticFormsEndpoint;
    }

    const apiKeyInput = form.querySelector('input[name="apiKey"]');
    if (apiKeyInput && config.apiKey) {
        apiKeyInput.value = config.apiKey;
    }
}

async function initializeInquiryForm() {
    if (!inquiryForm) {
        return;
    }

    const config = await loadInquiryConfig();
    applyInquiryConfig(inquiryForm, config);

    inquiryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (inquiryForm.dataset.submitting === "true") {
            return;
        }

        if (!inquiryForm.checkValidity()) {
            inquiryForm.reportValidity();
            return;
        }

        const formData = new FormData(inquiryForm);
        if (String(formData.get("honeypot") || "").trim()) {
            inquiryForm.reset();
            return;
        }

        const submitButton = inquiryForm.querySelector("button[type='submit']");
        const submitLabel = submitButton?.dataset.submitLabel || "Submit Inquiry";

        inquiryForm.dataset.submitting = "true";
        inquiryForm.classList.add("is-submitting");
        setFormStatus(inquiryStatus, "", "");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }

        try {
            const response = await fetch(inquiryForm.action, {
                method: inquiryForm.method || "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: formData
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "The inquiry could not be sent.");
            }

            inquiryForm.reset();
            setFormStatus(inquiryStatus, "success", "Your inquiry has been sent successfully.");
            openThankYouModal();
        } catch (error) {
            console.error(error);
            setFormStatus(inquiryStatus, "error", "Something went wrong. Please try again.");
        } finally {
            delete inquiryForm.dataset.submitting;
            inquiryForm.classList.remove("is-submitting");

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitLabel;
            }
        }
    });
}

inquiryModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeThankYouModal);
});

inquiryModal?.addEventListener("click", (event) => {
    if (event.target === inquiryModal) {
        closeThankYouModal();
    }
});

initializeInquiryForm();

function setCounterValue(counter, value) {
    counter.textContent = `${Math.round(value).toLocaleString()}${counter.dataset.countSuffix || ""}`;
}

function animateCounter(counter) {
    if (counter.dataset.counted === "true") {
        return;
    }

    counter.dataset.counted = "true";

    const target = Number(counter.dataset.countTo || 0);
    const duration = 1200;
    const start = reducedMotion ? duration : 0;
    const startedAt = performance.now() - start;

    function tick(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounterValue(counter, target * eased);

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            setCounterValue(counter, target);
        }
    }

    requestAnimationFrame(tick);
    window.setTimeout(() => setCounterValue(counter, target), duration + 120);
}

if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    counters.forEach(animateCounter);
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                entry.target.querySelectorAll("[data-count-to]").forEach(animateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
    });

    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
        observer.observe(item);
    });
}
