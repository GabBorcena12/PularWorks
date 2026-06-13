const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-site-header]");
const revealItems = [...document.querySelectorAll(".reveal")];
const counters = [...document.querySelectorAll("[data-count-to]")];
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
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
