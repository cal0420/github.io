"use strict";

/* ==========================================================================
   C4G Hub — shared website and dashboard JavaScript
   Requires api-config.js to load before this file.
   ========================================================================== */

const DISCORD_INVITE_URL = "https://discord.gg/c4ghub";
const C4G_API = (window.C4G_API_URL || "http://localhost:8000").replace(/\/$/, "");
const C4G_SELECTED_GUILD_KEY = "c4gSelectedGuildId";

/* ==========================================================================
   General website UI
   ========================================================================== */

document.querySelectorAll("[data-discord]").forEach((link) => {
    link.href = DISCORD_INVITE_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
});

document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
});

const nav = document.querySelector("[data-nav]");

function updateNavigationOnScroll() {
    nav?.classList.toggle("scrolled", window.scrollY > 20);
}

updateNavigationOnScroll();
window.addEventListener("scroll", updateNavigationOnScroll, { passive: true });

const menuToggle = document.querySelector(".menu-toggle");
const navigationLinks = document.querySelector(".nav-links");

menuToggle?.addEventListener("click", () => {
    const open = navigationLinks?.classList.toggle("open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
});

const currentFile = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === currentFile) {
        link.classList.add("active");
    }
});

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((element) => {
        revealObserver.observe(element);
    });

    document.querySelectorAll("[data-count]").forEach((element) => {
        let complete = false;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || complete) return;

                complete = true;
                const target = Number(element.dataset.count || 0);
                let value = 0;

                if (target <= 0) {
                    element.textContent = "0";
                    counterObserver.disconnect();
                    return;
                }

                const increment = Math.max(1, Math.ceil(target / 60));

                const timer = window.setInterval(() => {
                    value = Math.min(target, value + increment);
                    element.textContent = String(value);

                    if (value >= target) {
                        window.clearInterval(timer);
                    }
                }, 30);

                counterObserver.disconnect();
            });
        });

        counterObserver.observe(element);
    });
}

/* ==========================================================================
   Command search and filtering
   ========================================================================== */

const commandSearch = document.querySelector("#commandSearch");
const commandCards = [...document.querySelectorAll(".command-card")];
const commandEmptyState = document.querySelector(".empty-state");
const commandFilterButtons = [...document.querySelectorAll("[data-filter]")];
let selectedCommandCategory = "all";

function filterCommands() {
    const query = (commandSearch?.value || "").toLowerCase().trim();
    let visibleCount = 0;

    commandCards.forEach((card) => {
        const searchableText = (card.dataset.search || card.textContent || "").toLowerCase();
        const categoryMatches =
            selectedCommandCategory === "all" ||
            card.dataset.category === selectedCommandCategory;
        const queryMatches = searchableText.includes(query);
        const visible = categoryMatches && queryMatches;

        card.hidden = !visible;
        if (visible) visibleCount += 1;
    });

    if (commandEmptyState) {
        commandEmptyState.hidden = visibleCount !== 0;
    }
}

commandSearch?.addEventListener("input", filterCommands);

commandFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        commandFilterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        selectedCommandCategory = button.dataset.filter || "all";
        filterCommands();
    });
});

/* ==========================================================================
   Background particles
   ========================================================================== */

const particleCanvas = document.querySelector("#particles");

if (particleCanvas) {
    const context = particleCanvas.getContext("2d");
    let particles = [];

    function resizeParticles() {
        const ratio = window.devicePixelRatio || 1;

        particleCanvas.width = window.innerWidth * ratio;
        particleCanvas.height = window.innerHeight * ratio;
        particleCanvas.style.width = `${window.innerWidth}px`;
        particleCanvas.style.height = `${window.innerHeight}px`;

        context?.setTransform(ratio, 0, 0, ratio, 0, 0);

        particles = Array.from(
            { length: Math.min(70, Math.floor(window.innerWidth / 18)) },
            () => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 1.3 + 0.2,
                velocity: Math.random() * 0.18 + 0.04
            })
        );
    }

    function drawParticles() {
        if (!context) return;

        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.fillStyle = "rgba(218,177,255,.65)";

        particles.forEach((particle) => {
            particle.y -= particle.velocity;

            if (particle.y < 0) {
                particle.y = window.innerHeight;
            }

            context.beginPath();
            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );
            context.fill();
        });

        window.requestAnimationFrame(drawParticles);
    }

    window.addEventListener("resize", resizeParticles);
    resizeParticles();
    drawParticles();
}

/* ==========================================================================
   Existing dashboard UI
   ========================================================================== */

const dashboardMenu = document.querySelector(".dash-menu");
const dashboardSidebar = document.querySelector(".dash-sidebar");

dashboardMenu?.addEventListener("click", () => {
    dashboardSidebar?.classList.toggle("open");
});

const settingsSaveButton = document.querySelector("#saveSettings");
const settingsSaveState = document.querySelector("#saveState");

document
    .querySelectorAll(".settings-panel input, .settings-panel select, .settings-panel textarea")
    .forEach((field) => {
        field.addEventListener("input", () => {
            if (!settingsSaveState) return;

            settingsSaveState.textContent = "Unsaved changes";
            settingsSaveState.style.color = "var(--amber)";
        });
    });

settingsSaveButton?.addEventListener("click", () => {
    settingsSaveButton.textContent = "Saved ✓";

    if (settingsSaveState) {
        settingsSaveState.textContent = "All changes saved";
        settingsSaveState.style.color = "var(--green)";
    }

    window.setTimeout(() => {
        settingsSaveButton.textContent = "Save changes";
    }, 1400);
});

/* ==========================================================================
   API helpers
   ========================================================================== */

class C4GApiError extends Error {
    constructor(message, status, payload = null) {
        super(message);
        this.name = "C4GApiError";
        this.status = status;
        this.payload = payload;
    }
}

async function c4gFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${C4G_API}${path}`, {
        ...options,
        credentials: "include",
        headers
    });

    if (!response.ok) {
        let payload = null;

        try {
            payload = await response.json();
        } catch {
            payload = null;
        }

        const message =
            payload?.detail ||
            payload?.message ||
            `Request failed with status ${response.status}`;

        throw new C4GApiError(message, response.status, payload);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function c4gLogin() {
    window.location.assign(`${C4G_API}/auth/login`);
}

async function c4gLogout() {
    document.querySelectorAll("[data-c4g-logout]").forEach((button) => {
        button.disabled = true;
    });

    try {
        await c4gFetch("/auth/logout", { method: "POST" });
    } catch (error) {
        console.warn("C4G logout request failed", error);
    } finally {
        localStorage.removeItem(C4G_SELECTED_GUILD_KEY);
        window.location.assign("index.html");
    }
}

/* ==========================================================================
   Profile
   ========================================================================== */

function createInitialAvatar(name) {
    const initial = (name || "C").trim().charAt(0).toUpperCase() || "C";
    return initial;
}

function updateProfileElements(user) {
    const displayName = user.global_name || user.username || "Discord user";

    document.querySelectorAll("[data-c4g-username]").forEach((element) => {
        element.textContent = displayName;
    });

    document.querySelectorAll("[data-c4g-user-id]").forEach((element) => {
        element.textContent = user.id || "";
    });

    document.querySelectorAll("[data-c4g-avatar]").forEach((image) => {
        if (!(image instanceof HTMLImageElement)) return;

        image.alt = `${displayName}'s Discord avatar`;

        if (user.avatar_url) {
            image.src = user.avatar_url;
            image.hidden = false;
        }
    });

    document.querySelectorAll(".avatar-fallback").forEach((element) => {
        element.textContent = createInitialAvatar(displayName);

        if (user.avatar_url) {
            element.style.backgroundImage = `url("${user.avatar_url}")`;
            element.style.backgroundSize = "cover";
            element.style.backgroundPosition = "center";
            element.style.color = "transparent";
        }
    });

    document.querySelectorAll("[data-c4g-status]").forEach((element) => {
        element.textContent = "Discord connected";
    });
}

async function loadC4GProfile() {
    try {
        const user = await c4gFetch("/api/me");
        updateProfileElements(user);
        return user;
    } catch (error) {
        if (error instanceof C4GApiError && error.status === 401) {
            document.querySelectorAll("[data-c4g-status]").forEach((element) => {
                element.textContent = "Not signed in";
            });
        }

        throw error;
    }
}

/* ==========================================================================
   Managed Discord server selector
   ========================================================================== */

function guildIconUrl(guild) {
    return guild.icon_url || "";
}

function selectedGuildId() {
    return localStorage.getItem(C4G_SELECTED_GUILD_KEY);
}

function storeSelectedGuild(guildId) {
    if (guildId) {
        localStorage.setItem(C4G_SELECTED_GUILD_KEY, guildId);
    } else {
        localStorage.removeItem(C4G_SELECTED_GUILD_KEY);
    }
}

function updateSelectedGuildElements(guild) {
    if (!guild) return;

    document.querySelectorAll("[data-c4g-server-name]").forEach((element) => {
        element.textContent = guild.name;
    });

    document.querySelectorAll("[data-c4g-server-id]").forEach((element) => {
        element.textContent = guild.id;
    });

    document.querySelectorAll("[data-c4g-server-icon]").forEach((image) => {
        if (!(image instanceof HTMLImageElement)) return;

        const icon = guildIconUrl(guild);
        image.alt = `${guild.name} icon`;

        if (icon) {
            image.src = icon;
            image.hidden = false;
        } else {
            image.hidden = true;
        }
    });

    window.dispatchEvent(
        new CustomEvent("c4g:guild-changed", {
            detail: { guild }
        })
    );
}

function buildNativeGuildSelector(guilds) {
    const selectors = document.querySelectorAll("[data-server-select]");

    selectors.forEach((selector) => {
        if (!(selector instanceof HTMLSelectElement)) return;

        selector.innerHTML = "";

        if (!guilds.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No manageable servers";
            selector.appendChild(option);
            selector.disabled = true;
            return;
        }

        guilds.forEach((guild) => {
            const option = document.createElement("option");
            option.value = guild.id;
            option.textContent = guild.name;
            selector.appendChild(option);
        });

        const savedId = selectedGuildId();
        const selectedGuild =
            guilds.find((guild) => guild.id === savedId) || guilds[0];

        selector.value = selectedGuild.id;
        storeSelectedGuild(selectedGuild.id);
        updateSelectedGuildElements(selectedGuild);

        selector.addEventListener("change", () => {
            const guild = guilds.find((item) => item.id === selector.value);
            if (!guild) return;

            storeSelectedGuild(guild.id);
            updateSelectedGuildElements(guild);

            document.querySelectorAll("[data-server-select]").forEach((other) => {
                if (other instanceof HTMLSelectElement && other !== selector) {
                    other.value = guild.id;
                }
            });
        });
    });
}

function createInjectedGuildSelector(guilds) {
    if (
        document.querySelector("[data-server-select]") ||
        document.querySelector("[data-c4g-injected-server-picker]")
    ) {
        return;
    }

    const topActions = document.querySelector(".dash-top .top-actions");
    if (!topActions || !guilds.length) return;

    const wrapper = document.createElement("label");
    wrapper.dataset.c4gInjectedServerPicker = "";
    wrapper.className = "c4g-server-picker";
    wrapper.style.display = "inline-flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "0.5rem";

    const label = document.createElement("span");
    label.textContent = "Server";
    label.style.fontSize = "0.8rem";
    label.style.opacity = "0.75";

    const select = document.createElement("select");
    select.dataset.serverSelect = "";
    select.setAttribute("aria-label", "Select Discord server");
    select.style.maxWidth = "220px";

    wrapper.append(label, select);
    topActions.prepend(wrapper);

    buildNativeGuildSelector(guilds);
}

async function loadC4GGuilds() {
    const guilds = await c4gFetch("/api/guilds");

    if (!Array.isArray(guilds)) {
        throw new Error("The guild API returned an invalid response.");
    }

    createInjectedGuildSelector(guilds);
    buildNativeGuildSelector(guilds);

    if (!guilds.length) {
        document.querySelectorAll("[data-c4g-server-name]").forEach((element) => {
            element.textContent = "No manageable servers";
        });
        return [];
    }

    const savedId = selectedGuildId();
    const guild = guilds.find((item) => item.id === savedId) || guilds[0];

    storeSelectedGuild(guild.id);
    updateSelectedGuildElements(guild);

    window.C4G_GUILDS = guilds;
    window.C4G_SELECTED_GUILD = guild;

    return guilds;
}

/* ==========================================================================
   Dashboard authentication bootstrap
   ========================================================================== */

function isDashboardPage() {
    return (
        document.body.classList.contains("dashboard-page") ||
        Boolean(document.body.dataset.dashboardPage)
    );
}

function showDashboardError(message) {
    let notice = document.querySelector("[data-c4g-dashboard-notice]");

    if (!notice) {
        const content = document.querySelector(".dash-content");

        if (!content) return;

        notice = document.createElement("div");
        notice.dataset.c4gDashboardNotice = "";
        notice.setAttribute("role", "alert");
        notice.style.padding = "0.9rem 1rem";
        notice.style.marginBottom = "1rem";
        notice.style.border = "1px solid rgba(255, 190, 80, 0.35)";
        notice.style.borderRadius = "12px";
        notice.style.background = "rgba(255, 190, 80, 0.08)";
        content.prepend(notice);
    }

    notice.textContent = message;
}

async function initialiseDashboard() {
    if (!isDashboardPage()) return;

    try {
        await loadC4GProfile();
        await loadC4GGuilds();
    } catch (error) {
        console.warn("C4G dashboard could not initialise", error);

        if (error instanceof C4GApiError && error.status === 401) {
            showDashboardError("Your session has expired. Redirecting to Discord login…");

            window.setTimeout(() => {
                c4gLogin();
            }, 900);

            return;
        }

        showDashboardError(
            "The dashboard could not connect to the C4G API. Refresh the page in a moment."
        );
    }
}

/* ==========================================================================
   Event setup
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-c4g-login], #demoLogin").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            c4gLogin();
        });
    });

    document.querySelectorAll("[data-c4g-logout], #demoLogout").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            void c4gLogout();
        });
    });

    void initialiseDashboard();
});

/* Public helpers for page-specific scripts. */
window.C4G = Object.freeze({
    apiBaseUrl: C4G_API,
    fetch: c4gFetch,
    login: c4gLogin,
    logout: c4gLogout,
    loadProfile: loadC4GProfile,
    loadGuilds: loadC4GGuilds,
    getSelectedGuildId: selectedGuildId
});
