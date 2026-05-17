// Data constants are now imported from constants.js

// Authentication Manager
class AuthManager {
    constructor() {
        this.users = window.authSystem.users;
        this.sessionKey = window.authSystem.sessionKey;
        this.isLoggedIn = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
    }

    checkExistingSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            try {
                const userData = JSON.parse(session);
                if (userData && userData.username) {
                    this.currentUser = userData;
                    this.isLoggedIn = true;
                    return true;
                }
            } catch (e) {
                localStorage.removeItem(this.sessionKey);
            }
        }
        return false;
    }

    login(password) {
        const user = this.users.find(u => u.password === password);
        if (user) {
            this.currentUser = { username: user.username, role: user.role };
            this.isLoggedIn = true;
            localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }
        return { success: false, error: "Nieprawidłowe hasło" };
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem(this.sessionKey);
    }

    getUserInfo() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.isLoggedIn;
    }
}

// Removed Login Modal Component - now using only console login

// DateTime component
class DateTime {
    constructor() {
        this.dateTimeElement = null;
        this.timeElement = null;
        this.dateElement = null;
        this.intervalId = null;
        this.themeToggle = null;
        this.authManager = null;
        this.init();
    }

    init() {
        this.themeToggle = new ThemeToggle();
        this.authManager = new AuthManager();
        this.render();
        this.startClock();
    }

    formatTime(date) {
        return date.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    }

    formatDate(date) {
        return date.toLocaleDateString("pl-PL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    updateDateTime() {
        if (!this.timeElement || !this.dateElement) return;

        const now = new Date();
        this.timeElement.textContent = this.formatTime(now);
        this.dateElement.textContent = this.formatDate(now);
    }

    startClock() {
        this.updateDateTime();
        this.intervalId = setInterval(() => this.updateDateTime(), 1000);
    }

    stopClock() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    render() {
        const now = new Date();

        const container = document.createElement("div");
        container.className = "datetime-container";

        // Always show theme toggle and navigation - no authentication required
        const controlsInfo = `<div class="user-info">
            <button class="datetime-nav-button" onclick="toggleUserTheme()" id="userThemeToggle" title="Theme">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <span class="theme-toggle-icon icon-holder">
                    <img 
                        src="${this.themeToggle.isDark
                ? 'https://api.iconify.design/line-md:sunny-twotone-loop.svg'
                : 'https://api.iconify.design/line-md:sunny-outline-to-moon-loop-transition.svg'
            }"
                        alt="${this.themeToggle.isDark ? 'Tryb jasny' : 'Tryb ciemny'}"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i 
                        class="fas ${this.themeToggle.isDark ? 'fa-sun' : 'fa-moon'} hidden"
                        title="${this.themeToggle.isDark ? 'Tryb jasny (ikona awaryjna)' : 'Tryb ciemny (ikona awaryjna)'}"
                        style="font-size: 1.35em;"
                    ></i>
                </span>
            </button>
            <button class="datetime-nav-button" onclick="navigateToSubpage()" title="Narzędzia">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <span class="icon-holder">
                    <img 
                        src="https://api.iconify.design/material-icon-theme:folder-plugin-open.svg"
                        alt="Tools"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-tools hidden" title="Tools (FAS backup)" style="font-size: 1.2em;"></i>
                </span>
            </button>
            <button class="datetime-nav-button" onclick="showLoginConsole()" title="Open Login Console (Ctrl+L)">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <span class="icon-holder">
                    <img 
                        src="https://img.icons8.com/external-anggara-flat-anggara-putra/64/external-password-security-security-anggara-flat-anggara-putra.png"
                        alt="Console"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-user-lock hidden" title="Console (FAS backup)" style="font-size: 1.2em;"></i>
                </span>
            </button>
            <div class="vertical-separator orange"></div>
            <button type="button" class="datetime-nav-button" id="cyberRadioNavBtn" title="Cyber Radio V8">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <span class="icon-holder">
                    <img 
                        src="https://img.icons8.com/papercut/60/audio-wave2.png"
                        alt="Music"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-music hidden" title="Music (FAS backup)" style="font-size: 1.2em;"></i>
                </span>
            </button>
            <div class="vertical-separator orange"></div>
            <button class="datetime-nav-button" onclick="window.open('https://quip.com/mlWpALvnGSt5/Pliki', '_blank')" title="Linki Print">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <span class="icon-holder">
                    <img 
                        src="https://api.iconify.design/streamline-ultimate-color:print-text.svg"
                        alt="Linki Print"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-print hidden" title="Linki Print (FAS backup)" style="font-size: 1.2em;"></i>
                </span>
            </button>
            <div class="vertical-separator orange"></div>
            <button class="datetime-nav-button e" onclick="window.open('https://exd9.carrd.co/', '_blank')" title="Lista Ewakuacji">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <span class="icon-holder">
                    <img 
                        src="https://api.iconify.design/streamline-ultimate-color:multiple-users-1.svg"
                        alt="Users"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-users hidden" title="Users (FAS backup)" style="font-size: 1.2em;"></i>
                </span>
            </button>
        </div>
        `;

        container.innerHTML = `
           ${controlsInfo}
            <div class="datetime-content">
                <div class="datetime-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="datetime-info">
                    <div class="datetime-time">${this.formatTime(now)}</div>
                    <div class="datetime-date">${this.formatDate(now)}</div>
                </div>
            </div>
        `;

        this.dateTimeElement = container;
        this.timeElement = container.querySelector(".datetime-time");
        this.dateElement = container.querySelector(".datetime-date");

        return container;
    }

    destroy() {
        this.stopClock();
        if (this.dateTimeElement) {
            this.dateTimeElement.remove();
        }
    }
}

// Footer component
class Footer {
    constructor() {
        this.currentYear = new Date().getFullYear();
    }

    render() {
        const footer = document.createElement("footer");
        footer.className = "app-footer";

        footer.innerHTML = `
           
            
            <div class="footer-content">
                <div class="footer-section">
                    <span class="footer-title">DEV LABS R&S</span>
                    <span class="footer-version">v2.1.0 Dev</span>
                </div>
                <div class="footer-section">
                    <a href="#" class="footer-info" onclick="openCyberRadioModal(); return false;">
                        CYBER RADIO
                        <i class="fas fa-broadcast-tower ml-2"></i>
                    </a>
                    <a href="#" class="footer-info" onclick="openPrivacyModal()">
                        PRIVACY POLICY
                        <i class="fas fa-info-circle ml-2"></i>
                    </a>
                </div>
                
                <div class="footer-section">
                    <span class=" footer-info-copyright">© ${this.currentYear} All rights reserved</span>
                </div>
                <div class="footer-section">
                    <span class="footer-status">
                        SYSTEM ONLINE
                    </span>
                </div>
            </div>
        `;

        return footer;
    }
}

// Modal component
class Modal {
    constructor(title, content, isNavModal = false) {
        this.title = title;
        this.content = content;
        this.isNavModal = isNavModal;
        this.overlay = null;
        this.modalContent = null;
    }

    create() {
        // Create modal overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Create modal content
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'modal-content';
        if (this.isNavModal) {
            this.modalContent.classList.add('nav-options-modal');
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';

        const titleElement = document.createElement('h2');
        titleElement.className = 'modal-title';
        titleElement.textContent = this.title;

        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => this.close());

        header.appendChild(titleElement);
        header.appendChild(closeButton);

        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (this.isNavModal) {
            body.classList.add('nav-options-body');
        }

        if (this.isNavModal) {
            body.innerHTML = this.content;
        } else {
            body.innerHTML = this.content;
        }

        // Assemble modal
        this.modalContent.appendChild(header);
        this.modalContent.appendChild(body);
        this.overlay.appendChild(this.modalContent);

        return this.overlay;
    }

    open() {
        if (!this.overlay) {
            this.create();
        }

        document.body.appendChild(this.overlay);

        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlay.classList.add('active');
            });
        });

        // Add escape key listener
        document.addEventListener('keydown', this.handleEscKey.bind(this));
    }

    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');

            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
            }, 250);
        }

        // Remove escape key listener
        document.removeEventListener('keydown', this.handleEscKey.bind(this));
    }

    handleEscKey(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }
}

function applyThemeAttributes(isDarkMode) {
    if (isDarkMode) {
        document.body.setAttribute("data-theme", "dark");
        document.documentElement.setAttribute("dark-theme", "");
    } else {
        document.body.removeAttribute("data-theme");
        document.documentElement.removeAttribute("dark-theme");
    }
}

function withThemeTransitionLock(callback) {
    const root = document.documentElement;
    root.classList.add("theme-switch-lock");
    // Force reflow so the lock class takes effect immediately.
    void root.offsetWidth;
    callback();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            root.classList.remove("theme-switch-lock");
        });
    });
}

// Theme Toggle functionality
class ThemeToggle {
    constructor() {
        this.isDark = false;
        this.init();
    }

    init() {
        // Check localStorage first, then fallback to current attribute
        const savedTheme = localStorage.getItem("theme");
        let isDarkMode = false;

        if (savedTheme) {
            isDarkMode = savedTheme === "dark";
        } else {
            isDarkMode = document.body.getAttribute("data-theme") === "dark" ||
                document.documentElement.hasAttribute("dark-theme");
        }

        this.isDark = isDarkMode;

        // Apply the theme using new system
        this.applyTheme(isDarkMode);

        // Update theme color for mobile
        this.updateThemeColor(isDarkMode);
    }

    toggle() {
        this.isDark = !this.isDark;

        // Save to localStorage
        localStorage.setItem("theme", this.isDark ? "dark" : "light");

        // Apply the theme using new system
        this.applyTheme(this.isDark);

        // Update theme color for mobile
        this.updateThemeColor(this.isDark);

        // Update button content
        this.updateButton();
    }

    applyTheme(isDarkMode) {
        withThemeTransitionLock(() => {
            applyThemeAttributes(isDarkMode);
        });
    }

    updateThemeColor(isDarkMode) {
        // Update theme-color meta tag for mobile browsers
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }

        // Set theme color based on current theme
        const themeColor = isDarkMode ? '#1a1d23' : '#f0f2f5';
        themeColorMeta.content = themeColor;

        // Also update msapplication-TileColor if it exists
        const tileColorMeta = document.querySelector('meta[name="msapplication-TileColor"]');
        if (tileColorMeta) {
            tileColorMeta.content = themeColor;
        }
    }

    updateButton() {
        const iconElement = document.querySelector(".theme-toggle-icon i");
        const textElement = document.querySelector(".theme-toggle-text");

        if (iconElement && textElement) {
            iconElement.className = `fas ${this.isDark ? "fa-sun" : "fa-moon"}`;
            textElement.textContent = this.isDark ? "Light" : "Dark";
        }
    }

    render() {
        const button = document.createElement("button");
        button.className = "theme-toggle";
        button.setAttribute(
            "aria-label",
            this.isDark ? "Switch to light theme" : "Switch to dark theme"
        );

        button.innerHTML = `
      
      <span class="theme-toggle-icon">
        <i class="fas ${this.isDark ? "fa-sun" : "fa-moon"}"></i>
      </span>
      <span class="theme-toggle-text">
        ${this.isDark ? "Light" : "Dark"}
      </span>
    `;

        button.addEventListener("click", () => this.toggle());

        return button;
    }
}

// LinkButton component
function createLinkButton(title, markerColor, icon, url) {
    const div = document.createElement("div");
    div.className = "link-button";
    if (markerColor) {
        div.classList.add(`marker-theme-${markerColor}`);
    }

    // Add fmc-button class for FMC buttons
    if (title.includes("FMC")) {
        div.classList.add("fmc-button");
    }

    // Add event-history-button class for EVENT HISTORY button
    if (title.includes("EVENT HISTORY")) {
        div.classList.add("event-history-button");
    }

    // Add fmc-track-button class for FMC TRACK button
    if (title.includes("FMC TRACK")) {
        div.classList.add("fmc-track-button");
    }

    // Add excel-in-button class for EXCEL IN button
    if (title.includes("EXCEL IN")) {
        div.classList.add("excel-in-button");
    }

    // Add specific classes for other buttons
    if (title.includes("CONSOLE HARMONY")) {
        div.classList.add("console-harmony-button");
    }

    if (title.includes("YARD 360")) {
        div.classList.add("yard-360-button");
    }

    if (title.includes("PANORAMA")) {
        div.classList.add("panorama-button");
    }

    if (title.includes("FCLM PORTAL")) {
        div.classList.add("fclm-portal-button");
    }

    if (title.includes("AAP")) {
        div.classList.add("aap-button");
    }
    if (title.includes("M365")) {
        div.classList.add("m365-button");
    }
    if (title.includes("OUTLOOK")) {
        div.classList.add("outlook-button");
    }
    if (title.includes("SLACK")) {
        div.classList.add("slack-button");
    }
    if (title.includes("Markdown")) {
        div.classList.add("markdown-button");
    }

    const markerClasses = markerColor ? `marker marker-${markerColor}` : "";

    // Special icon handling for custom SVG icons
    let iconHTML = "";
    if (icon) {
        if (title.includes("CHAT OPS")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-sharp-color:desktop-chat-flat.svg" alt="Chat Ops" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-comments\\'></i>');"></span>`;
        } else if (title.includes("QUIP")) {
            iconHTML = `<span class="link-button-icon"><img src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://quip.com&size=32" alt="Quip" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-clipboard\\'></i>');"></span>`;
        } else if (title.includes("EXCEL IN")) {
            iconHTML = `<span class="link-button-icon"><img src="https://img.icons8.com/fluency/48/microsoft-excel-2025.png" alt="Excel" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-file-excel\\'></i>');"></span>`;
        } else if (title.includes("OUTBOUND")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:shipment-tracking.svg" alt="Outbound" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-truck\\'></i>');"></span>`;
        } else if (title.includes("GTDR")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/emojione:mobile-phone.svg" alt="GTDR" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-mobile-alt\\'></i>');"></span>`;
        } else if (title.includes("DEVICE ACTIVATION")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/openmoji:mobile-info.svg" alt="Device Activation" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-mobile\\'></i>');"></span>`;
        } else if (title.includes("PASSWORD RESET")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:laptop-user.svg" alt="Password Reset" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-unlock-alt\\'></i>');"></span>`;
        } else if (title.includes("PANORAMA")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/noto:bar-chart.svg" alt="Panorama" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-chart-bar\\'></i>');"></span>`;
        } else if (title.includes("YARD 360")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:delivery-truck-clock.svg" alt="Yard 360" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-clock\\'></i>');"></span>`;
        } else if (title.includes("SEZAM")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:truck-empty-1.svg" alt="Sezam" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-truck-moving\\'></i>');"></span>`;
        } else if (title.includes("YARD MANAGEMENT")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:network-pin.svg" alt="Yard Management" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-map-marker-alt\\'></i>');"></span>`;
        } else if (title.includes("EVENT HISTORY")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:calendar-date.svg" alt="Event History" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-calendar-alt\\'></i>');"></span>`;
        } else if (title.includes("DOCKMASTER SEARCH")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:shipment-search.svg" alt="Dockmaster Search" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-search\\'></i>');"></span>`;
        } else if (title.includes("DOCKMASTER")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:shipment-clock.svg" alt="Dockmaster" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-clock\\'></i>');"></span>`;
        } else if (title.includes("ISSUES")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:professions-man-construction-2.svg" alt="Issues" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-exclamation-circle\\'></i>');"></span>`;
        } else if (title.includes("PERMISSIONS")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:multiple-neutral-2.svg" alt="Permissions" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-users-cog\\'></i>');"></span>`;
        } else if (title.includes("CONSOLE HARMONY")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/vscode-icons:file-type-ai2.svg" alt="Console Harmony" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-cogs\\'></i>');"></span>`;
        } else if (title.includes("FMC TRACK")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:delivery-truck-cargo.svg" alt="FMC Track" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-truck-loading\\'></i>');"></span>`;
        } else if (title.includes("FMC")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:antenna.svg" alt="FMC" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-broadcast-tower\\'></i>');"></span>`;
        } else if (title.includes("FCLM PORTAL")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/vscode-icons:file-type-befunge.svg" alt="FCLM Portal" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-warehouse\\'></i>');"></span>`;
        } else if (title.includes("AAP")) {
            iconHTML = `<span class="link-button-icon"><img src="https://api.iconify.design/streamline-ultimate-color:app-window-code.svg" alt="AAP" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fas fa-code\\'></i>');"></span>`;
        } else if (title.includes("M365")) {
            iconHTML = `<span class="link-button-icon"><img src="https://img.icons8.com/fluency/48/microsoft-copilot.png" alt="M365" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fab fa-microsoft\\'></i>');"></span>`;
        } else if (title.includes("OUTLOOK")) {
            iconHTML = `<span class="link-button-icon"><img src="https://img.icons8.com/fluency/48/microsoft-outlook-2025.png" alt="Outlook" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fab fa-microsoft\\'></i>');"></span>`;
        } else if (title.includes("SLACK")) {
            iconHTML = `<span class="link-button-icon"><img src="https://img.icons8.com/color-glass/48/slack-new.png" alt="Slack" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fab fa-slack\\'></i>');"></span>`;
        } else if (title.includes("Markdown")) {
            iconHTML = `<span class="link-button-icon"><img src="https://img.icons8.com/pulsar-color/96/markdown.png" alt="Markdown" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<i class=\\'fab fa-markdown\\'></i>');"></span>`;
        } else {
            iconHTML = `<span class="link-button-icon"><i class="fas ${icon}"></i></span>`;
        }
    }

    div.innerHTML = `
    <div class="corner top-left"></div>
    <div class="corner top-right"></div>
    <div class="corner bottom-left"></div>
    <div class="corner bottom-right"></div>
    <div class="link-button-left">
      ${markerColor ? `<div class="${markerClasses}"></div>` : ""}
      <span class="link-button-title">${title}</span>
    </div>
    ${iconHTML}
  `;

    // Check if it's a placeholder button
    if (title.includes("PLACEHOLDER")) {
        div.classList.add("placeholder-button");
        div.style.cursor = "default";
        div.style.opacity = "0.3";
    }

    // Add click handler if URL is provided
    if (url && url !== "#") {
        div.style.cursor = "pointer";

        // Left click - open in new tab
        div.addEventListener("click", () => {
            window.open(url, "_blank");
        });

        // Right click - show context menu
        div.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showLinkContextMenu(e, url, title);
        });
    }

    return div;
}

// GroupCard component
function createGroupCard(data) {
    const { columns, markerColor } = data;

    const div = document.createElement("div");
    div.className = "group-card";
    if (markerColor) {
        div.classList.add(`group-theme-${markerColor}`);
    }

    const gridClasses = ["group-card-grid"];
    if (columns.length > 1) {
        gridClasses.push("two-columns");
    }

    div.innerHTML = `
    <div class="${gridClasses.join(" ")}">
      ${columns
            .map(
                (_column) => `
        <div class="group-column">
        </div>
      `
            )
            .join("")}
    </div>
  `;

    // Add buttons with event listeners
    const columnElements = div.querySelectorAll('.group-column');
    columns.forEach((column, columnIndex) => {
        let fmcButtons = [];
        let otherButtons = [];

        // Separate FMC buttons from others
        column.forEach((item) => {
            if (item.title.includes("FMC")) {
                fmcButtons.push(item);
            } else {
                otherButtons.push(item);
            }
        });

        // Add non-FMC buttons first
        otherButtons.forEach((item) => {
            const button = createLinkButton(item.title, markerColor, item.icon, item.url);
            columnElements[columnIndex].appendChild(button);
        });

        // Add FMC buttons in a horizontal container if there are any
        if (fmcButtons.length > 0) {
            const fmcContainer = document.createElement('div');
            fmcContainer.className = 'fmc-buttons-container';

            fmcButtons.forEach((item) => {
                const button = createLinkButton(item.title, markerColor, item.icon, item.url);
                fmcContainer.appendChild(button);
            });

            columnElements[columnIndex].appendChild(fmcContainer);
        }
    });

    return div;
}

// Main App initialization
function initializeApp() {
    const root = document.getElementById("root");
    if (!root) return;

    // Initialize theme first (before anything else)
    initializeTheme();

    // Always create dashboard - authentication through console only
    createDashboard();
}

// Initialize theme system
function initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    let isDarkMode = false;

    if (savedTheme) {
        isDarkMode = savedTheme === "dark";
    } else {
        isDarkMode = document.body.getAttribute("data-theme") === "dark" ||
            document.documentElement.hasAttribute("dark-theme");
    }

    // Apply the theme using new system
    applyThemeAttributes(isDarkMode);

    // Update theme color for mobile
    updateThemeColor(isDarkMode);
}

// Removed showLoginModal function - now using only console login

function createDashboard() {
    const root = document.getElementById("root");
    if (!root) return;

    // Create datetime component (includes theme toggle)
    const dateTime = new DateTime();

    // Create footer component
    const footer = new Footer();

    // Create app container
    const appContainer = document.createElement("div");
    appContainer.className = "app-container";

    // Create content wrapper
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "content-wrapper";

    // Add decorative corners
    contentWrapper.innerHTML = `
    <div class="decorative-corner decorative-corner-tl" aria-hidden="true"></div>
    <div class="decorative-corner decorative-corner-br" aria-hidden="true"></div>
  `;

    // Add datetime component to content wrapper
    contentWrapper.appendChild(dateTime.render());

    // Create main grid
    const mainGrid = document.createElement("main");
    mainGrid.className = "main-grid";

    // Create left section
    const leftSection = document.createElement("div");
    leftSection.className = "left-section";

    leftGroups.forEach((group, _index) => {
        leftSection.appendChild(createGroupCard(group));
    });

    // Create right section
    const rightSection = document.createElement("div");
    rightSection.className = "right-section";

    rightGroups.forEach((group, _index) => {
        rightSection.appendChild(createGroupCard(group));
    });

    // Add additional groups to right section
    if (window.additionalGroups) {
        window.additionalGroups.forEach((group, _index) => {
            rightSection.appendChild(createGroupCard(group));
        });
    }

    // Assemble the app
    mainGrid.appendChild(leftSection);
    mainGrid.appendChild(rightSection);
    contentWrapper.appendChild(mainGrid);

    // Add footer to content wrapper
    contentWrapper.appendChild(footer.render());

    appContainer.appendChild(contentWrapper);

    // Add to root
    root.appendChild(appContainer);
}

// Global logout function
function handleLogout() {
    const authManager = new AuthManager();
    authManager.logout();
    location.reload();
}

// Removed toggleLoginTheme function - no longer needed

// Global theme toggle function for user info
function toggleUserTheme() {
    const currentTheme = localStorage.getItem("theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    const isDarkMode = newTheme === "dark";

    // Save to localStorage
    localStorage.setItem("theme", newTheme);

    // Apply the theme using new system (without visible transition)
    withThemeTransitionLock(() => {
        applyThemeAttributes(isDarkMode);
    });

    // Update theme color for mobile
    updateThemeColor(isDarkMode);

    // Update all theme toggle buttons
    updateAllThemeButtons(newTheme);
}

// Update theme color helper function
function updateThemeColor(isDarkMode) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
    }

    const themeColor = isDarkMode ? '#1a1d23' : '#f0f2f5';
    themeColorMeta.content = themeColor;

    const tileColorMeta = document.querySelector('meta[name="msapplication-TileColor"]');
    if (tileColorMeta) {
        tileColorMeta.content = themeColor;
    }
}

function bindModalToMainSize(modal, className = "") {
    const mainContainer = document.querySelector('.content-wrapper');
    if (!modal || !modal.modalContent || !mainContainer) return () => { };

    const modalElement = modal.modalContent;
    if (className) {
        modalElement.classList.add(className);
    }

    const applySize = () => {
        const mainRect = mainContainer.getBoundingClientRect();
        if (mainRect.width <= 0 || mainRect.height <= 0) return;

        const viewportWidth = window.visualViewport?.width || window.innerWidth;
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const isMobile = viewportWidth <= 767;
        const gutter = isMobile ? 8 : 16;

        const width = Math.min(Math.round(mainRect.width), viewportWidth - gutter * 2);
        const height = Math.min(Math.round(mainRect.height), viewportHeight - gutter * 2);

        modalElement.style.width = `${width}px`;
        modalElement.style.maxWidth = `${width}px`;
        modalElement.style.height = `${height}px`;
        modalElement.style.maxHeight = `${height}px`;
        modalElement.style.minHeight = '0';
        modalElement.style.margin = isMobile ? `${gutter}px auto 0` : 'auto';
    };

    requestAnimationFrame(applySize);
    window.addEventListener('resize', applySize);

    return () => window.removeEventListener('resize', applySize);
}

// Update all theme toggle buttons
function updateAllThemeButtons(theme) {
    const isDark = theme === "dark";

    // Update login theme button (fallback icon is always FAS)
    const loginButton = document.getElementById("loginThemeToggle");
    if (loginButton) {
        const icon = loginButton.querySelector("i");
        if (icon) {
            icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
        }
    }

    // Update user theme button with SVG icons and FAS fallback
    const userButton = document.getElementById("userThemeToggle");
    if (userButton) {
        const iconContainer = userButton.querySelector(".theme-toggle-icon");
        if (iconContainer) {
            iconContainer.innerHTML =
                isDark
                    ? `
                    <img 
                        src="https://api.iconify.design/line-md:sunny-twotone-loop.svg" 
                        alt="Light Mode"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-sun hidden" title="Awaryjna ikona jasnego motywu" style="font-size: 1.35em;"></i>
                  `
                    : `
                    <img 
                        src="https://api.iconify.design/line-md:sunny-outline-to-moon-loop-transition.svg" 
                        alt="Dark Mode"
                        class="nav-img"
                        onerror="this.style.display='none';this.parentElement.querySelector('.fas')?.classList.remove('hidden');"
                    >
                    <i class="fas fa-moon hidden" title="Awaryjna ikona ciemnego motywu" style="font-size: 1.35em;"></i>
                  `;
        }
    }
}

// Function to navigate to subpage
function navigateToSubpage() {
    // Get addons from addons.js
    const addons = window.addonsUtils.getRecommendations();

    // Generate browser icons mapping
    // SVG (Iconify) + fallback FAS classes for browser icons
    const browserIcons = {
        firefox: {
            svg: 'https://api.iconify.design/devicon:firefox.svg',
            fas: 'fa-firefox-browser'
        },
        edge: {
            svg: 'https://api.iconify.design/logos:microsoft-edge.svg',
            fas: 'fa-edge'
        },
        chrome: {
            svg: 'https://api.iconify.design/devicon:chrome.svg',
            fas: 'fa-chrome'
        }
    };

    const formatBrowserName = (browser) =>
        browser.charAt(0).toUpperCase() + browser.slice(1);

    // Generate addon items HTML
    let addonsHTML = '';
    addons.forEach((addon, addonIndex) => {
        const browserCount = addon.browsers ? Object.keys(addon.browsers).length : 0;
        // Generate complete addon item
        addonsHTML += `
            <div class="modal-nav-item addon-item" data-addon-index="${addonIndex}">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <div class="modal-nav-item-title">
                    <img src="${addon.icon}" alt="${addon.name}" width="20" height="20" style="margin-right: 8px;">
                    ${addon.name}
                </div>
                <div class="modal-nav-item-description">
                    ${addon.description}
                </div>
                <button type="button" class="nav-addon-open">
                    Wybierz przegladarke (${browserCount})
                </button>
            </div>`;
    });

    const modalContent = `
        <div class="nav-options-shell">
            <div class="nav-options-intro">
                <h3>Nawigacja dodatkow</h3>
                <p>Wybierz dodatek i kliknij przegladarke, aby przejsc do instalacji.</p>
            </div>
            <div class="modal-nav-grid nav-options-grid">
                ${addonsHTML}
            </div>
            <div class="nav-browser-picker" id="navBrowserPicker" hidden>
                <div class="nav-browser-picker-card">
                    <div class="nav-browser-picker-header">
                        <span id="navBrowserPickerTitle">Wybierz przegladarke</span>
                        <button type="button" class="nav-browser-picker-close" id="navBrowserPickerClose" aria-label="Zamknij">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="nav-browser-picker-options" id="navBrowserPickerOptions"></div>
                </div>
            </div>
        </div>
    `;

    const modal = new Modal("Navigation Options", modalContent, true);
    modal.open();
    const unbindModalSize = bindModalToMainSize(modal, 'nav-options-modal');
    const originalClose = modal.close.bind(modal);
    modal.close = () => {
        unbindModalSize();
        originalClose();
    };

    setTimeout(() => {
        const modalElement = modal.modalContent;
        if (!modalElement) return;

        const picker = modalElement.querySelector('#navBrowserPicker');
        const pickerTitle = modalElement.querySelector('#navBrowserPickerTitle');
        const pickerOptions = modalElement.querySelector('#navBrowserPickerOptions');
        const pickerClose = modalElement.querySelector('#navBrowserPickerClose');
        const addonCards = modalElement.querySelectorAll('.addon-item');

        if (!picker || !pickerTitle || !pickerOptions || !pickerClose) return;

        let pickerCloseTimeoutId = null;

        const closePicker = () => {
            picker.classList.remove('active');
            if (pickerCloseTimeoutId) {
                clearTimeout(pickerCloseTimeoutId);
            }
            pickerCloseTimeoutId = setTimeout(() => {
                picker.hidden = true;
                pickerOptions.innerHTML = '';
                pickerCloseTimeoutId = null;
            }, 220);
        };

        const buildBrowserOption = (browser, url) => {
            const iconInfo = browserIcons[browser];
            const browserName = formatBrowserName(browser);
            return `
                <a href="${url}" class="browser-badge ${browser}" target="_blank" rel="noopener" title="${browserName}">
                    ${iconInfo
                    ? `<img src="${iconInfo.svg}" alt="${browserName}" width="24" height="24"
                               onerror="this.style.display='none';this.parentElement.querySelector('i')?.classList.remove('hidden');">`
                    : ''
                }
                    ${iconInfo
                    ? `<i class="fab ${iconInfo.fas} hidden" title="${browserName} (ikona zapasowa)" style="font-size:1.1em;"></i>`
                    : ''
                }
                    <span class="browser-badge-label">${browserName}</span>
                </a>
            `;
        };

        addonCards.forEach((card) => {
            card.addEventListener('click', (event) => {
                if (event.target.closest('a')) return;

                const addonIndex = Number(card.dataset.addonIndex);
                const addon = addons[addonIndex];
                if (!addon) return;

                pickerTitle.textContent = `Wybierz przegladarke: ${addon.name}`;

                if (addon.browsers && Object.keys(addon.browsers).length > 0) {
                    pickerOptions.innerHTML = Object.entries(addon.browsers)
                        .map(([browser, url]) => buildBrowserOption(browser, url))
                        .join('');
                } else {
                    pickerOptions.innerHTML = '<span class="nav-empty">Brak dostepnych przegladarek dla tego dodatku</span>';
                }

                picker.hidden = false;
                requestAnimationFrame(() => {
                    picker.classList.add('active');
                });
            });
        });

        pickerClose.addEventListener('click', closePicker);
        picker.addEventListener('click', (event) => {
            if (event.target === picker) {
                closePicker();
            }
        });
    }, 0);
}

// Function to open service in new tab
function openService(url, serviceName) {
    console.log(`Opening ${serviceName} at ${url}`);
    window.open(url, "_blank");
}

// Function to open privacy modal
function openPrivacyModal() {
    const modalContent = `
        <h3>Polityka Prywatności</h3>
        <p>Niniejsza polityka prywatności określa zasady funkcjonowania korporacyjnej aplikacji pulpitu nawigacyjnego.</p>
        
        <div class="info-section">
            <h3>Informacje ogólne:</h3>
            <p>Serwis nie zbiera ani nie przetwarza żadnych danych osobowych użytkowników, co zapewnia pełną ochronę prywatności.</p>
        </div>
        
        <div class="info-section">
            <h3>Pliki cookies:</h3>
            <p>Serwis wykorzystuje wyłącznie niezbędne pliki cookies techniczne, które są wymagane do prawidłowego działania strony. Te pliki cookies nie służą do zbierania żadnych danych osobowych ani do śledzenia użytkowników.</p>
        </div>
        
        <div class="info-section">
            <h3>Brak zbierania danych:</h3>
            <p>Serwis:</p>
            <ul>
                <li><span class="highlight">Nie zbiera</span> danych osobowych</li>
                <li><span class="highlight">Nie wymaga</span> rejestracji</li>
                <li><span class="highlight">Nie prowadzi</span> newslettera</li>
                <li><span class="highlight">Nie śledzi</span> zachowań użytkowników</li>
                <li><span class="highlight">Nie wykorzystuje</span> narzędzi analitycznych</li>
            </ul>
        </div>

        <div class="warning-section">
            <p>Wszystkie dane są przechowywane lokalnie w przeglądarce i nie są przekazywane do żadnych zewnętrznych serwisów.</p>
        </div>
        
        <div class="info-section">
            <h3>Zmiany w polityce prywatności:</h3>
            <p>Administrator zastrzega sobie prawo do zmiany niniejszej polityki prywatności w dowolnym czasie. O wszelkich zmianach użytkownicy będą informowani z odpowiednim wyprzedzeniem.</p>
        </div>
        
        <p class="modal-date"><strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
    `;
    const modal = new Modal("Privacy Policy", modalContent, true);
    modal.open();
    const unbindModalSize = bindModalToMainSize(modal, 'privacy-modal');
    const originalClose = modal.close.bind(modal);
    modal.close = () => {
        unbindModalSize();
        originalClose();
    };
}

// Function to open help modal
function openHelpModal() {
    const modalContent = `
        <h3>Pomoc - Logowanie</h3>
        <p>Witamy w sekcji pomocy Corporate App Dashboard. Znajdziesz tutaj informacje dotyczące logowania do systemu.</p>
        
        <div class="info-section">
            <h3>Jak się zalogować:</h3>
            <ul>
                <li><strong>Nazwa użytkownika:</strong> Wprowadź swoją nazwę użytkownika w pierwszym polu</li>
                <li><strong>Hasło:</strong> Wprowadź hasło w drugim polu</li>
                <li><strong>Logowanie:</strong> Kliknij przycisk <span class="highlight">"Zaloguj się"</span> lub naciśnij Enter</li>
                <li><strong>Motyw:</strong> Użyj przycisku <i class="fas fa-moon"></i>/<i class="fas fa-sun"></i> aby zmienić motyw</li>
            </ul>
        </div>

        <div class="info-section">
            <h3>Problemy z logowaniem:</h3>
            <ul>
                <li>Sprawdź czy <span class="highlight">caps lock</span> nie jest włączony</li>
                <li>Upewnij się, że używasz prawidłowych danych logowania</li>
                <li>Odśwież stronę (F5 lub Ctrl+R) i spróbuj ponownie</li>
                <li>Wyczyść pamięć podręczną przeglądarki</li>
                <li>Skontaktuj się z administratorem systemu</li>
            </ul>
        </div>

        <div class="warning-section">
            <p>Dane logowania są przechowywane lokalnie w przeglądarce i nie są wysyłane do żadnych stron trzecich.</p>
        </div>
        
        <div class="info-section">
            <h3>Bezpieczeństwo:</h3>
            <ul>
                <li>Nie udostępniaj swoich danych logowania innym osobom</li>
                <li>Wyloguj się po zakończeniu pracy</li>
                <li>Zgłoś podejrzane aktywności administratorowi</li>
            </ul>
        </div>
        
        <p><strong>Wersja systemu:</strong> 2.1.0</p>
        <p class="modal-date"><strong>Data:</strong> 7.05.2026</p>
    `;
    const modal = new Modal("Pomoc - Logowanie", modalContent, true);
    modal.open();
}

// Console Login System
let loginConsole = null;

function createLoginConsole() {
    if (loginConsole) return;

    loginConsole = document.createElement('div');
    loginConsole.className = 'login-console hidden';
    loginConsole.innerHTML = `
        <div class="modal-header">
            <span class="modal-title">
                <i class="fas fa-terminal"></i>
                Access
            </span>
            <button type="button" class="modal-close" onclick="hideLoginConsole()" aria-label="Zamknij">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="console-body">
            <div class="console-prompt">
                <span class="prompt-symbol">$</span>
                <span class="prompt-text">Please enter password to access Link Hub</span>
            </div>
            <form class="console-form" id="consoleLoginForm">
                <div class="console-input-group">
                    <span class="input-label">Pass:</span>
                    <div class="console-input-wrap">
                        <input type="password" id="consolePassword" placeholder="Enter your password" name="password" required autocomplete="current-password" autofocus>
                        <button type="button" class="console-input-clear" id="consoleClearBtn" title="Wyczyść hasło i komunikaty">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>
                </div>
                <div class="console-actions">
                    <button type="submit" class="console-btn">
                        <i class="fas fa-arrow-right"></i>
                         Login
                    </button>
                </div>
            </form>
            <div class="console-output" id="consoleOutput"></div>
            <div class="console-help">
                <div class="help-line">Available commands:</div>
                <div class="help-line">• Pass - authenticate user</div>
                <div class="help-line">• clear - clear console output</div>
                <div class="help-line">• exit - close console (Esc)</div>
            </div>
        </div>
    `;

    document.body.appendChild(loginConsole);

    // Setup form handler
    const form = loginConsole.querySelector('#consoleLoginForm');
    form.addEventListener('submit', handleConsoleLogin);

    loginConsole.addEventListener('click', (e) => {
        if (e.target.closest('#consoleClearBtn')) {
            clearConsoleOutput(e);
        }
    });

    // Setup keyboard shortcuts
    setupConsoleKeyboardShortcuts();
}

const CONSOLE_REDIRECT_SEC = 3;
const CONSOLE_REDIRECT_URL = 'https://linkosi.carrd.co/#';
let consoleRedirectTimer = null;

function clearConsoleRedirectTimer() {
    if (consoleRedirectTimer) {
        clearInterval(consoleRedirectTimer);
        consoleRedirectTimer = null;
    }
}

function startConsoleRedirectCountdown(onDone) {
    clearConsoleRedirectTimer();

    const countdownEl = document.getElementById('consoleCountdown');
    let remaining = CONSOLE_REDIRECT_SEC;

    const render = () => {
        if (countdownEl) countdownEl.textContent = String(remaining);
    };

    render();
    consoleRedirectTimer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearConsoleRedirectTimer();
            onDone();
            return;
        }
        render();
    }, 1000);
}

function clearConsoleOutput(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!loginConsole) return;

    clearConsoleRedirectTimer();

    const output = loginConsole.querySelector('#consoleOutput');
    const password = loginConsole.querySelector('#consolePassword');

    if (output) output.innerHTML = '';
    if (password) {
        password.value = '';
        password.focus();
    }
}

function showLoginConsole() {
    if (!loginConsole) createLoginConsole();

    loginConsole.classList.remove('hidden');
    loginConsole.classList.add('active');

    // Focus on password input
    const passwordInput = loginConsole.querySelector('#consolePassword');
    if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 100);
    }

    clearConsoleOutput();
}

function hideLoginConsole() {
    clearConsoleRedirectTimer();
    if (loginConsole) {
        loginConsole.classList.remove('active');
        loginConsole.classList.add('hidden');
    }
}

function handleConsoleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const password = formData.get('password');
    const output = document.getElementById('consoleOutput');

    // Simulate authentication
    const authManager = new AuthManager();
    const result = authManager.login(password);

    if (result.success) {
        output.innerHTML = `
            <div class="output-line success"><i class="fas fa-check-circle"></i> Zalogowano</div>
       
            <div class="output-line">Otwieranie za <span id="consoleCountdown">${CONSOLE_REDIRECT_SEC}</span>s…</div>
        `;

        startConsoleRedirectCountdown(() => {
            window.open(CONSOLE_REDIRECT_URL, '_blank');
            hideLoginConsole();
        });

    } else {
        output.innerHTML = `
            <div class="output-line error"><i class="fas fa-times-circle"></i> ${result.error}</div>
        `;
    }
}

function setupConsoleKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+L to open login console
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            showLoginConsole();
        }

        // Escape to close console
        if (e.key === 'Escape' && loginConsole && loginConsole.classList.contains('active')) {
            hideLoginConsole();
        }
    });
}

// Link Context Menu System
let linkContextMenu = null;

function createLinkContextMenu() {
    if (linkContextMenu) return;

    linkContextMenu = document.createElement('div');
    linkContextMenu.className = 'link-context-menu hidden';
    linkContextMenu.innerHTML = `
        <div class="context-menu-item" data-action="open-foreground">
            <i class="fas fa-external-link-alt"></i>
            Otwórz w nowej karcie
        </div>
        <div class="context-menu-item" data-action="open-background">
            <i class="fas fa-clone"></i>
            Otwórz w tle
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" data-action="copy-link">
            <i class="fas fa-copy"></i>
            Kopiuj link
        </div>
    `;

    document.body.appendChild(linkContextMenu);

    // Hide menu when clicking outside
    document.addEventListener('click', hideLinkContextMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideLinkContextMenu();
    });
}

function showLinkContextMenu(event, url, title) {
    if (!linkContextMenu) createLinkContextMenu();

    // Store current URL and title for actions
    linkContextMenu.dataset.url = url;
    linkContextMenu.dataset.title = title;

    // Position menu at cursor
    const x = event.clientX;
    const y = event.clientY;

    linkContextMenu.style.left = x + 'px';
    linkContextMenu.style.top = y + 'px';

    // Show menu
    linkContextMenu.classList.remove('hidden');

    // Add click handlers for menu items
    const menuItems = linkContextMenu.querySelectorAll('.context-menu-item[data-action]');
    menuItems.forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            handleContextMenuAction(item.dataset.action, url, title);
            hideLinkContextMenu();
        };
    });

    // Adjust position if menu goes off screen
    setTimeout(() => {
        const rect = linkContextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (rect.right > windowWidth) {
            linkContextMenu.style.left = (windowWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > windowHeight) {
            linkContextMenu.style.top = (windowHeight - rect.height - 10) + 'px';
        }
    }, 0);
}

function hideLinkContextMenu() {
    if (linkContextMenu) {
        linkContextMenu.classList.add('hidden');
    }
}

function handleContextMenuAction(action, url, _title) {
    switch (action) {
        case 'open-foreground':
            window.open(url, '_blank');
            break;

        case 'open-background':
            // Create temporary link for background opening
            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.target = '_blank';
            tempLink.rel = 'noopener noreferrer';

            // Add to DOM temporarily
            document.body.appendChild(tempLink);

            // Simulate Ctrl+Click for background opening
            const clickEvent = new MouseEvent('click', {
                ctrlKey: true,
                metaKey: true, // For Mac
                bubbles: true,
                cancelable: true
            });

            tempLink.dispatchEvent(clickEvent);
            document.body.removeChild(tempLink);
            break;

        case 'copy-link':
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link skopiowany do schowka');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Link skopiowany do schowka');
            });
            break;
    }
}

function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);