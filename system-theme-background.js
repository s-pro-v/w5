const SYSTEM_BACKGROUND_LOW_POWER = true;

function ensureBackgroundStyles() {
    const styleId = "systemThemeBackgroundStyles";
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
            .system-theme-background {
                --bg-color: #ffffff;
                --data-primary: #4b4b4b;
                --data-secondary: #ff6600;
                --alert-color: #ff6600;
                --inactive-color: #6b6b6b;
                position: fixed;
                inset: 0;
                z-index: 0;
                pointer-events: none;
                background: var(--bg-color);
            }

            .system-theme-background.low-power {
                background:
                    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                    var(--bg-color);
                background-size: 32px 32px, 32px 32px, auto;
            }

            .system-theme-background.low-power .fui-svg {
                opacity: 0.85;
                shape-rendering: crispEdges;
            }

            .system-theme-background.low-power .fui-svg .fui-grid-layer {
                display: none;
            }

            .system-theme-background.low-power .fui-svg [style*="animation"] {
                animation: none !important;
            }

            body[data-theme="dark"] .system-theme-background {
                --bg-color: #292929;
                --data-primary: #ffffff;
                --data-secondary: #ff6600;
                --alert-color: #ff6600;
                --inactive-color: #555555;
            }

            .system-theme-background .fui-svg {
                width: 100%;
                height: 100%;
                display: block;
                shape-rendering: geometricPrecision;
            }

            .system-theme-background.low-power .fui-svg {
                shape-rendering: auto;
            }

            .system-theme-background .fui-hud-text {
                position: absolute;
                color: var(--data-primary);
                font-size: 10px;
                letter-spacing: 0.1rem;
                text-transform: uppercase;
                line-height: 1.6;
                opacity: 0.6;
                font-family: "JetBrains Mono", monospace, sans-serif;
            }

            .system-theme-background .fui-hud-text .fui-hud-value-online {
                color: #22c55e;
                opacity: 0.95;
            }

            .system-theme-background .fui-hud-text .fui-hud-value-offline {
                color: #ef4444;
                opacity: 0.95;
            }

            .system-theme-background .fui-hud-text .fui-hud-value-orange {
                color: #ff8a00;
                opacity: 0.95;
            }

            .system-theme-background .fui-hud-text .fui-hud-value-green {
                color: #22c55e;
                opacity: 0.95;
            }

            .system-theme-background .fui-status-label {
                position: absolute;
                bottom: 36px;
                right: 48px;
                background: var(--bg);
                color: var(--color-primary);
                padding: 8px 16px;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 0.15rem;
                text-transform: uppercase;
                border-left: 6px solid var(--data-primary);
                box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.15);
                font-family: "JetBrains Mono", monospace, sans-serif;
            }

            

            @media (max-width: 768px) {
                .system-theme-background .fui-hud-text {
                    font-size: 9px;
                    letter-spacing: 0.07rem;
                }

                .system-theme-background .fui-status-label {
                    right: 16px;
                    bottom: 16px;
                    padding: 6px 10px;
                    font-size: 9px;
                    letter-spacing: 0.08rem;
                    border-left-width: 4px;
                }
            }
        `;

    document.head.appendChild(style);
}

function syncSystemThemeBackgroundShadow() {
    const lineGroup = document.querySelector("#systemThemeBackground .line-group");
    if (!lineGroup) return;

    const isDark = document.body.getAttribute("data-theme") === "dark" ||
        document.documentElement.hasAttribute("dark-theme");
    lineGroup.setAttribute(
        "filter",
        isDark ? "url(#fui-line-shadow-dark)" : "url(#fui-line-shadow-light)"
    );
}

function observeSystemThemeBackgroundShadow() {
    if (window.__systemThemeBackgroundShadowObserver) return;

    const observer = new MutationObserver(() => syncSystemThemeBackgroundShadow());
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dark-theme"] });
    window.__systemThemeBackgroundShadowObserver = observer;
}

function mountSystemThemeBackground() {
    const existing = document.getElementById("systemThemeBackground");
    if (existing) existing.remove();

    ensureBackgroundStyles();
    document.body.setAttribute("data-performance", "low");

    const container = document.createElement("div");
    container.id = "systemThemeBackground";
    container.className = "system-theme-background";
    container.setAttribute("aria-hidden", "true");

    container.innerHTML = `
            <svg class="fui-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="crossgrid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <line x1="50" y1="45" x2="50" y2="55" stroke="var(--inactive-color)" stroke-width="1" opacity="0.3" />
                        <line x1="45" y1="50" x2="55" y2="50" stroke="var(--inactive-color)" stroke-width="1" opacity="0.3" />
                    </pattern>
                    <filter id="fui-line-shadow-light" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
                        <feOffset in="SourceAlpha" dx="8" dy="4" result="offset" />
                        <feFlood flood-color="#000000" flood-opacity="0.35" result="color" />
                        <feComposite in="color" in2="offset" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="fui-line-shadow-dark" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
                        <feOffset in="SourceAlpha" dx="8" dy="4" result="offset" />
                        <feFlood flood-color="#000000" flood-opacity="0.55" result="color" />
                        <feComposite in="color" in2="offset" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect class="fui-grid-layer" width="100%" height="100%" fill="url(#crossgrid)" />

                <g class="fui-shapes line-group" fill="none" fill-rule="evenodd" filter="url(#fui-line-shadow-light)">
                <polyline points="100,300 100,100 600,100 650,150" stroke="var(--data-primary)" stroke-width="2" fill="none" stroke-dasharray="200 10 10 10 500" />
                <line x1="100" y1="150" x2="120" y2="150" stroke="var(--data-primary)" stroke-width="2" />
                <line x1="100" y1="200" x2="110" y2="200" stroke="var(--data-primary)" stroke-width="2" />
                <line x1="300" y1="100" x2="300" y2="120" stroke="var(--data-primary)" stroke-width="2" />

                <g>
                    <rect x="80" y="700" width="80" height="8" fill="var(--data-primary)" />
                    <rect x="80" y="720" width="120" height="3" fill="var(--data-primary)" />
                    <rect x="80" y="735" width="120" height="8" fill="var(--data-primary)" />
                    <rect x="80" y="750" width="120" height="8" fill="var(--data-primary)" />
                    <rect x="80" y="765" width="80" height="3" fill="var(--data-primary)" />
                </g>

                <polyline points="80,550 400,550 480,630 650,630" stroke="var(--data-primary)" stroke-width="4" fill="none" />
                <polygon points="600,600 900,600 850,680 550,680" fill="var(--data-primary)" />
                <rect x="1400" y="300" width="70" height="50" stroke="var(--data-primary)" stroke-width="10" fill="none" />
                <polyline points="950,600 950,680 1300,680 1450,830 1700,830" stroke="var(--data-primary)" stroke-width="4" fill="none" />

                <polyline points="760,570 820,510 820,380 1080,120" stroke="var(--data-secondary)" stroke-width="2" fill="none" />
                <polyline points="840,360 1070,130 1500,130" stroke="var(--data-secondary)" stroke-width="2" fill="none" />
                <polyline points="500,750 1320,750 1520,950 1700,950" stroke="var(--data-secondary)" stroke-width="2" fill="none" />
                <line x1="200" y1="850" x2="250" y2="850" stroke="var(--inactive-color)" stroke-width="2" />
                <line x1="270" y1="850" x2="400" y2="850" stroke="var(--inactive-color)" stroke-width="2" />
                <polyline points="400,850 450,800 650,800" stroke="var(--inactive-color)" stroke-width="2" fill="none" />

                <g stroke="var(--data-primary)" stroke-width="4" fill="none">
                    <polygon points="1600,100 1500,200 1500,300 1600,400 1920,400 1920,100" />
                    <polygon points="1600,450 1500,550 1500,650 1600,750 1920,750 1920,450" />
                    <polygon points="1600,800 1500,900 1500,1000 1600,1060 1920,1060 1920,800" />
                </g>

                <g stroke="var(--inactive-color)" stroke-width="1" fill="none">
                    <polygon points="1610,120 1520,210 1520,290 1610,380 1900,380 1900,120" />
                    <polygon points="1610,470 1520,560 1520,640 1610,730 1900,730 1900,470" />
                </g>

                <circle cx="1050" cy="200" r="6" fill="var(--alert-color)" />
                <circle cx="1500" cy="900" r="6" fill="var(--alert-color)" />
                <rect x="1400" y="820" width="20" height="20" fill="none" stroke="var(--data-secondary)" stroke-width="2" />
                <line x1="1400" y1="820" x2="1420" y2="840" stroke="var(--data-secondary)" stroke-width="2" />
                </g>
            </svg>

            <div class="fui-hud-text" data-fui-left style="bottom: 60px; left: 80px;">
                SYS.REQ: <span class="fui-hud-value-orange">TRUE</span><br>
                SEC.LOCK: <span class="fui-hud-value-green">ACTIVE</span><br>
                MEM.ALLOC: <span class="fui-hud-value-orange">0x8F9B2</span>
            </div>

            <div class="fui-hud-text" data-fui-right style="top: 80px; right: 80px; text-align: right;">
                NET.NODE: <span class="fui-hud-value-online">ONLINE</span><br>
                UPLINK: <span class="fui-hud-value-online">CONNECTED</span>
            </div>

            <div class="fui-status-label" data-fui-status>
                &gt;&gt; SYSTEM LINK ACTIVE
            </div>
        `;

    document.body.prepend(container);
    syncSystemThemeBackgroundShadow();
    observeSystemThemeBackgroundShadow();

    if (SYSTEM_BACKGROUND_LOW_POWER) {
        container.classList.add("low-power");
        container.querySelectorAll(".fui-svg [style*='animation']").forEach((node) => {
            node.style.animation = "none";
        });
    }
}

function getHeapHexSnapshot() {
    const usedBytes = window.performance?.memory?.usedJSHeapSize;
    if (!Number.isFinite(usedBytes) || usedBytes <= 0) return "N/A";
    return `0x${Math.round(usedBytes).toString(16).toUpperCase()}`;
}

function getCachedHeapHexSnapshot() {
    if (!window.__systemThemeBackgroundState) {
        window.__systemThemeBackgroundState = {
            tickerId: null,
            leftHtml: "",
            rightHtml: "",
            statusText: "",
            lastHeapUpdateAt: 0,
            lastHeapValue: "N/A"
        };
    }

    const state = window.__systemThemeBackgroundState;
    const now = Date.now();
    if (!state.lastHeapUpdateAt || now - state.lastHeapUpdateAt >= 50) {
        state.lastHeapValue = getHeapHexSnapshot();
        state.lastHeapUpdateAt = now;
    }
    return state.lastHeapValue;
}

function getAppVersionLabel() {
    const footerVersion = document.querySelector(".footer-version")?.textContent?.trim();
    if (footerVersion) return footerVersion;
    return "v2.1.0 Dev";
}

function updateSystemThemeBackgroundHUD() {
    const container = document.getElementById("systemThemeBackground");
    if (!container) return;

    const leftHud = container.querySelector("[data-fui-left]");
    const rightHud = container.querySelector("[data-fui-right]");
    const statusLabel = container.querySelector("[data-fui-status]");
    const state = window.__systemThemeBackgroundState;
    if (!state) return;
    const isDarkMode = document.body.getAttribute("data-theme") === "dark" ||
        document.documentElement.hasAttribute("dark-theme");
    const isOnline = state.snapshot?.isOnline ?? navigator.onLine;
    const appVersion = state.snapshot?.appVersion ?? getAppVersionLabel();

    const leftHtml = `
            SYS.REQ: <span class="fui-hud-value-orange">TRUE</span><br>
            SEC.LOCK: <span class="fui-hud-value-green">ACTIVE</span><br>
            MEM.ALLOC: <span class="fui-hud-value-orange">${getCachedHeapHexSnapshot()}</span>
        `;
    if (leftHud && state.leftHtml !== leftHtml) {
        leftHud.innerHTML = leftHtml;
        state.leftHtml = leftHtml;
    }

    const nodeClass = isOnline ? "fui-hud-value-online" : "fui-hud-value-offline";
    const uplinkClass = isOnline ? "fui-hud-value-online" : "fui-hud-value-offline";
    const rightHtml = `
            NET.NODE: <span class="${nodeClass}">${isOnline ? "ONLINE" : "OFFLINE"}</span><br>
            UPLINK: <span class="${uplinkClass}">${isOnline ? "CONNECTED" : "DISCONNECTED"}</span>
        `;
    if (rightHud && state.rightHtml !== rightHtml) {
        rightHud.innerHTML = rightHtml;
        state.rightHtml = rightHtml;
    }

    const statusClass = isOnline ? "fui-hud-value-online" : "fui-hud-value-offline";
    const statusHtml = `>> <span class="${statusClass}">${isOnline ? "SYSTEM LINK ACTIVE" : "AWAITING SYSTEM RESPONSE"}</span> - ${appVersion} - ${isDarkMode ? "DARK" : "LIGHT"}`;
    if (statusLabel && state.statusText !== statusHtml) {
        statusLabel.innerHTML = statusHtml;
        state.statusText = statusHtml;
    }
}

function startSystemThemeBackgroundTicker() {
    const state = window.__systemThemeBackgroundState;
    if (!state || state.tickerId) return;
    state.tickerId = window.setInterval(updateSystemThemeBackgroundHUD, 100);
}

function stopSystemThemeBackgroundTicker() {
    const state = window.__systemThemeBackgroundState;
    if (!state || !state.tickerId) return;
    window.clearInterval(state.tickerId);
    state.tickerId = null;
}

function connectSystemThemeBackground() {
    if (window.__systemThemeBackgroundConnected) return;
    window.__systemThemeBackgroundConnected = true;
    window.__systemThemeBackgroundState = {
        tickerId: null,
        leftHtml: "",
        rightHtml: "",
        statusText: "",
        lastHeapUpdateAt: 0,
        lastHeapValue: "N/A",
        snapshot: {
            isOnline: navigator.onLine,
            isDarkMode: document.body.getAttribute("data-theme") === "dark" ||
                document.documentElement.hasAttribute("dark-theme"),
            appVersion: getAppVersionLabel()
        }
    };

    updateSystemThemeBackgroundHUD();
    // Aktualizacja tylko przy odswiezeniu strony.
    const themeObserver = new MutationObserver(() => {
        updateSystemThemeBackgroundHUD();
        syncSystemThemeBackgroundShadow();
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["dark-theme"] });
    window.updateSystemThemeBackgroundHUD = updateSystemThemeBackgroundHUD;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSystemThemeBackground);
} else {
    mountSystemThemeBackground();
}
