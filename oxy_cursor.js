/**
 * ES module — import w przeglądarce lub bundlerze:
 *   import initCustomCursor, { defaultCorporateMagneticFilter } from './oxy_cursor.js';
 *
 * Kursor z linijkami (crosshair), kropką i „magnesem” do środka elementów — port logiki z W5 / dashboard.
 *
 * Dom: możesz dodać ręcznie #custom-cursor + linie + #cursor-dot, albo zostawić puste —
 * przy `createDom: true` (domyślnie) moduł je utworzy i dołoży minimalny CSS.
 *
 * Corporate App Dashboard: `initCustomCursor({ preset: 'corporate' })` po `DOMContentLoaded`
 * (dashboard renderuje się w `initializeApp`; listener modułu jest rejestrowany po `script.js`).
 * Po dynamicznym dodaniu UI: `rebind()`. Przy `w5-theme.css`: `initCustomCursor({ cssLineState: true })`.
 */

const INJECTED_STYLE_ID = 'custom-cursor-injected-styles';

/**
 * Minimalny CSS, gdy strona nie ma własnych stylów kursora (np. tylko moduł w bundlerze).
 * @param {Document} doc
 * @returns {boolean} czy wstawiono nowy <style>
 */
function injectMinimalCursorStyles(doc) {
    if (doc.getElementById(INJECTED_STYLE_ID)) return false;
    const style = doc.createElement('style');
    style.id = INJECTED_STYLE_ID;
    style.textContent = `

    :root {
        --cursor-line-muted: rgba(255, 255, 255, 0.35);
        /* Spójne z Corporate dashboard (style.css: --kolor-primary) */
        --highlight-color: var(--kolor-primary, #ff6600);
        --cursor-mix-blend: normal;
        --cursor-hud-mix-blend: normal;
        --cursor-live-pick: var(--cursor-accent, var(--kolor-primary, #ff6600));
        --cursor-accent: var(--kolor-primary, #ff6600);
        --cursor-danger: #ff0000;
        --cursor-fg: #ffffff;
        --cursor-bg: #121212;
    }
/* Na stronie: --custom-cursor-mix-blend (normal = bez migotania przy backdrop-filter) */
#custom-cursor {
    position: fixed;
    width: 24px;
    height: 24px;
    border: 1px solid var(--cursor-line-muted);
    pointer-events: none;
    z-index: 100000;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    opacity: 0;
    left: 0;
    top: 0;
    mix-blend-mode: var(--custom-cursor-mix-blend, normal);
}
#custom-cursor.button-hover { border-color: var(--highlight-color, var(--kolor-primary, #ff6600)); border-width: 1px; }
#custom-cursor.active { transform: translate(-50%, -50%) scale(1.2); }
#custom-cursor.text-hover:not(.button-hover) {
    width: 4px !important;
    height: 40px !important;
    background: var(--cursor-line-muted);
    border: none !important;
}
.cursor-line {
    position: fixed;
    background: var(--cursor-line-muted);
    pointer-events: none;
    z-index: 99999;
    mix-blend-mode: var(--custom-cursor-line-mix-blend, normal);
}
.cursor-line.horizontal { left: 0; right: 0; height: 1px; top: 0; }
.cursor-line.vertical { top: 0; bottom: 0; width: 1px; left: 0; }
#cursor-dot {
    position: fixed;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cursor-line-muted);
    pointer-events: none;
    z-index: 100001;
    transform: translate(-50%, -50%);
    opacity: 0;
    left: 0;
    top: 0;
    mix-blend-mode: var(--custom-cursor-dot-mix-blend, normal);
}
#cursor-dot.active { background: var(--highlight-color, var(--kolor-primary, #ff6600)); }
`;
    doc.head.appendChild(style);
    return true;
}

/**
 * Tworzy brakujące węzły i dokleja do body.
 * @returns {{ cursor: HTMLElement, horizontal: HTMLElement, vertical: HTMLElement, dot: HTMLElement, created: { style: boolean, cursor: boolean, horizontal: boolean, vertical: boolean, dot: boolean } }}
 */
function ensureCursorDom(doc) {
    /** @type {{ style: boolean, cursor: boolean, horizontal: boolean, vertical: boolean, dot: boolean }} */
    const created = {
        style: false,
        cursor: false,
        horizontal: false,
        vertical: false,
        dot: false,
    };

    const parent = doc.body || doc.documentElement;

    let cursor = doc.getElementById('custom-cursor');
    if (!cursor) {
        cursor = doc.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        parent.appendChild(cursor);
        created.cursor = true;
    }

    let horizontal = doc.querySelector('.cursor-line.horizontal');
    if (!horizontal) {
        horizontal = doc.createElement('div');
        horizontal.className = 'cursor-line horizontal';
        horizontal.setAttribute('aria-hidden', 'true');
        parent.appendChild(horizontal);
        created.horizontal = true;
    }

    let vertical = doc.querySelector('.cursor-line.vertical');
    if (!vertical) {
        vertical = doc.createElement('div');
        vertical.className = 'cursor-line vertical';
        vertical.setAttribute('aria-hidden', 'true');
        parent.appendChild(vertical);
        created.vertical = true;
    }

    let dot = doc.getElementById('cursor-dot');
    if (!dot) {
        dot = doc.createElement('div');
        dot.id = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        parent.appendChild(dot);
        created.dot = true;
    }

    if (created.cursor || created.horizontal || created.vertical || created.dot) {
        created.style = injectMinimalCursorStyles(doc);
    }

    return { cursor, horizontal, vertical, dot, created };
}

/** Uniwersalnie: typowe elementy interaktywne na dowolnej stronie. */
const UNIVERSAL_MAGNETIC_SELECTOR =
    'a, button, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="switch"], ' +
    'input[type="button"], input[type="submit"], input[type="reset"], input[type="image"], ' +
    'label[for], select, summary, textarea';

/** Tekst — kursor „pionowy” (.text-hover); pusty string wyłącza. */
const UNIVERSAL_TEXT_HOVER_SELECTOR =
    'p, h1, h2, h3, h4, h5, h6, blockquote, pre, code, figcaption, li, td, th, dt, dd, cite, address';

/** Dashboard W5 — druga grupa selektorów (deduplikacja w setupInteractionListeners). */
const W5_PANEL_SELECTOR =
    '.section-item, .addons-close, .reset-settings-button, .bg-style-close, .bg-style-button';
const W5_MAGNETIC_SELECTOR =
    'a.info-card, .theme-switcher, .glassy-button, button, [role="button"]';
const W5_TEXT_HOVER_SELECTOR =
    '.bg-clock-time, .bg-clock-date, .card-title, .card-subtitle, .section-title';

/** Corporate App Dashboard (`index.html` + `script.js`) — linki, siatka, modale, addony. */
const CORPORATE_MAGNETIC_SELECTOR =
    'a.link-button, .link-button, button, .theme-toggle, .datetime-nav-button, .modal-nav-item, ' +
    '.browser-badge, .modal-close, .btn, .console-btn, .logout-btn, .login-theme-toggle, [role="button"]';

const CORPORATE_PANEL_SELECTOR = '.addon-item, .ctrl-toggle-button';

const CORPORATE_TEXT_HOVER_SELECTOR =
    '.datetime-time, .datetime-date, .link-button-title, .footer-title, .modal-title, .group-card';

/**
 * Dowolna strona: wyłącz poddrzewo `[data-no-custom-cursor]` i elementy nieaktywne.
 * @param {Element} el
 */
export function defaultUniversalMagneticFilter(el) {
    if (el.closest('[data-no-custom-cursor]')) return false;
    if ('disabled' in el && /** @type {HTMLButtonElement & HTMLInputElement} */ (el).disabled) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    return true;
}

/**
 * Wyklucza placeholdery kart i przyciski w panelach (z wyjątkiem np. .addons-close).
 * @param {Element} el
 */
export function defaultW5MagneticFilter(el) {
    if (el.classList?.contains('info-card') && el.tagName !== 'A') return false;

    if (el.closest('.bg-style-panel') && el.tagName === 'BUTTON') {
        return el.classList.contains('bg-style-close') || el.classList.contains('bg-style-button');
    }

    if (el.closest('.addons-panel') && el.tagName === 'BUTTON') {
        return el.classList.contains('addons-close') || el.classList.contains('reset-settings-button');
    }

    return true;
}

/**
 * Corporate dashboard: placeholdery linków + reguły uniwersalne.
 * @param {Element} el
 */
export function defaultCorporateMagneticFilter(el) {
    if (!defaultUniversalMagneticFilter(el)) return false;
    if (el.classList?.contains('link-button') && el.classList.contains('placeholder-button')) return false;
    return true;
}

/** @type {Record<string, { magneticSelector: string, panelSelector: string, textHoverSelector: string, magneticFilter: (el: Element) => boolean }>} */
const PRESETS = {
    universal: {
        magneticSelector: UNIVERSAL_MAGNETIC_SELECTOR,
        panelSelector: '',
        textHoverSelector: UNIVERSAL_TEXT_HOVER_SELECTOR,
        magneticFilter: defaultUniversalMagneticFilter,
    },
    w5: {
        magneticSelector: W5_MAGNETIC_SELECTOR,
        panelSelector: W5_PANEL_SELECTOR,
        textHoverSelector: W5_TEXT_HOVER_SELECTOR,
        magneticFilter: defaultW5MagneticFilter,
    },
    corporate: {
        magneticSelector: CORPORATE_MAGNETIC_SELECTOR,
        panelSelector: CORPORATE_PANEL_SELECTOR,
        textHoverSelector: CORPORATE_TEXT_HOVER_SELECTOR,
        magneticFilter: defaultCorporateMagneticFilter,
    },
};

/**
 * @param {object} [options]
 * @param {Document} [options.document]
 * @param {string} [options.highlightColor] — np. 'var(--highlight-color)'
 * @param {number} [options.defaultSize=24]
 * @param {number} [options.pad=8]
 * @param {string} [options.magneticSelector]
 * @param {string} [options.panelSelector] — druga grupa (łączona z pierwszą, bez podwójnych listenerów)
 * @param {string} [options.textHoverSelector]
 * @param {(el: Element) => boolean} [options.magneticFilter]
 * @param {boolean} [options.cssLineState=false] — true: `html[data-custom-cursor-active]` + style z `w5-theme.css` (bez inline opacity na liniach)
 * @param {boolean} [options.createDom=true] — jeśli brak markupu w HTML, utwórz elementy + minimalny CSS
 * @param {'universal'|'w5'|'corporate'} [options.preset='universal'] — `corporate`: ten dashboard (index.html)
 * @returns {{ rebind: () => void, destroy: () => void }}
 */
export function initCustomCursor(options = {}) {
    const { preset = 'universal', ...userOpts } = options;
    const base = PRESETS[preset] ?? PRESETS.universal;
    const opts = { ...base, ...userOpts };

    const doc = opts.document ?? document;
    const highlightColor =
        opts.highlightColor ??
        (preset === 'corporate' ? 'var(--kolor-primary, #ff6600)' : 'var(--highlight-color, #ff7300)');
    const defaultSize = opts.defaultSize ?? 24;
    const pad = opts.pad ?? 8;
    const cssLineState = opts.cssLineState === true;
    const createDom = opts.createDom !== false;

    const magneticSelector = opts.magneticSelector;
    const panelSelector = opts.panelSelector ?? '';
    const textHoverSelector = opts.textHoverSelector ?? '';

    const magneticFilter = opts.magneticFilter ?? defaultUniversalMagneticFilter;

    /** @type {HTMLElement} */
    let cursor;
    /** @type {{ horizontal: HTMLElement, vertical: HTMLElement }} */
    let cursorLines;
    /** @type {HTMLElement} */
    let cursorDot;
    /** @type {{ style: boolean, cursor: boolean, horizontal: boolean, vertical: boolean, dot: boolean }} */
    let domCreated = {
        style: false,
        cursor: false,
        horizontal: false,
        vertical: false,
        dot: false,
    };

    if (createDom) {
        const ensured = ensureCursorDom(doc);
        cursor = ensured.cursor;
        cursorLines = { horizontal: ensured.horizontal, vertical: ensured.vertical };
        cursorDot = ensured.dot;
        domCreated = ensured.created;
    } else {
        cursor = doc.getElementById('custom-cursor');
        cursorLines = {
            horizontal: doc.querySelector('.cursor-line.horizontal'),
            vertical: doc.querySelector('.cursor-line.vertical'),
        };
        cursorDot = doc.getElementById('cursor-dot');
        if (!cursor || !cursorLines.horizontal || !cursorLines.vertical || !cursorDot) {
            console.warn(
                '[custom-cursor] Brak #custom-cursor / .cursor-line / #cursor-dot — ustaw createDom: true albo dodaj markup.',
            );
            return { rebind: () => { }, destroy: () => { } };
        }
    }

    const htmlEl = doc.documentElement;

    let mouseX = 0;
    let mouseY = 0;
    let cursorVisible = false;
    /** @type {{ el: Element } | null} */
    let magneticElement = null;

    let abortMagnetic = new AbortController();
    let abortText = new AbortController();

    function setCursorActive(on) {
        if (cssLineState) {
            if (on) htmlEl.setAttribute('data-custom-cursor-active', 'true');
            else htmlEl.removeAttribute('data-custom-cursor-active');
        }
    }

    function updateCursorPosition(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        let targetX = mouseX;
        let targetY = mouseY;

        if (magneticElement) {
            const rect = magneticElement.el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const isOverElement =
                mouseX >= rect.left &&
                mouseX <= rect.right &&
                mouseY >= rect.top &&
                mouseY <= rect.bottom;
            if (isOverElement) {
                targetX = centerX;
                targetY = centerY;
            }
        }

        cursor.style.left = `${targetX}px`;
        cursor.style.top = `${targetY}px`;
        cursorLines.horizontal.style.top = `${mouseY}px`;
        cursorLines.vertical.style.left = `${mouseX}px`;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        if (!cursorVisible) {
            cursor.style.opacity = '1';
            if (cssLineState) {
                cursorLines.horizontal.style.opacity = '';
                cursorLines.vertical.style.opacity = '';
                setCursorActive(true);
            } else {
                cursorLines.horizontal.style.opacity = '0.3';
                cursorLines.vertical.style.opacity = '0.3';
            }
            cursorDot.style.opacity = '1';
            cursorVisible = true;
        }
    }

    function onDocMouseEnter() {
        cursorVisible = false;
    }

    function onDocMouseLeave() {
        cursor.style.opacity = '0';
        if (cssLineState) {
            cursorLines.horizontal.style.opacity = '';
            cursorLines.vertical.style.opacity = '';
            setCursorActive(false);
        } else {
            cursorLines.horizontal.style.opacity = '0';
            cursorLines.vertical.style.opacity = '0';
        }
        cursorDot.style.opacity = '0';
        cursorDot.classList.remove('active');
        cursorVisible = false;
    }

    function bindOneMagnetic(el, signal) {
        el.addEventListener(
            'mouseenter',
            () => {
                const rect = el.getBoundingClientRect();
                magneticElement = { el };
                cursor.style.width = `${rect.width + pad}px`;
                cursor.style.height = `${rect.height + pad}px`;
                cursor.classList.add('button-hover');
                cursorLines.horizontal.style.backgroundColor = highlightColor;
                cursorLines.vertical.style.backgroundColor = highlightColor;
                cursorDot.classList.add('active');
            },
            { signal },
        );

        el.addEventListener(
            'mouseleave',
            () => {
                magneticElement = null;
                cursor.style.width = `${defaultSize}px`;
                cursor.style.height = `${defaultSize}px`;
                cursor.classList.remove('button-hover', 'active');
                cursorLines.horizontal.style.backgroundColor = '';
                cursorLines.vertical.style.backgroundColor = '';
                cursorDot.classList.remove('active');
            },
            { signal },
        );

        el.addEventListener('mousedown', () => cursor.classList.add('active'), { signal });
        el.addEventListener('mouseup', () => cursor.classList.remove('active'), { signal });
    }

    function setupInteractionListeners() {
        abortMagnetic.abort();
        abortMagnetic = new AbortController();
        const signal = abortMagnetic.signal;

        const seen = new Set();
        /** @type {string[]} */
        const groups = [magneticSelector, panelSelector].filter(Boolean);
        groups.forEach((sel) => {
            doc.querySelectorAll(sel).forEach((el) => {
                if (seen.has(el)) return;
                seen.add(el);
                if (!magneticFilter(el)) return;
                bindOneMagnetic(el, signal);
            });
        });

        abortText.abort();
        abortText = new AbortController();
        const ts = abortText.signal;
        if (textHoverSelector) {
            doc.querySelectorAll(textHoverSelector).forEach((el) => {
                el.addEventListener(
                    'mouseenter',
                    () => {
                        if (!cursor.classList.contains('button-hover')) {
                            cursor.classList.add('text-hover');
                        }
                    },
                    { signal: ts },
                );
                el.addEventListener('mouseleave', () => cursor.classList.remove('text-hover'), { signal: ts });
            });
        }
    }

    /** Ogranicza przerysowania backdrop-filter (migotanie) przy ruchu myszy */
    let moveRaf = 0;
    let lastMoveEvent = null;
    function onPointerMove(e) {
        lastMoveEvent = e;
        if (moveRaf) return;
        moveRaf = requestAnimationFrame(() => {
            moveRaf = 0;
            if (lastMoveEvent) updateCursorPosition(lastMoveEvent);
        });
    }

    doc.addEventListener('mousemove', onPointerMove);
    doc.addEventListener('mouseenter', onDocMouseEnter);
    doc.addEventListener('mouseleave', onDocMouseLeave);

    setupInteractionListeners();

    function destroy() {
        if (moveRaf) cancelAnimationFrame(moveRaf);
        moveRaf = 0;
        lastMoveEvent = null;
        doc.removeEventListener('mousemove', onPointerMove);
        doc.removeEventListener('mouseenter', onDocMouseEnter);
        doc.removeEventListener('mouseleave', onDocMouseLeave);
        abortMagnetic.abort();
        abortText.abort();
        htmlEl.removeAttribute('data-custom-cursor-active');

        if (domCreated.cursor) cursor.remove();
        if (domCreated.horizontal) cursorLines.horizontal.remove();
        if (domCreated.vertical) cursorLines.vertical.remove();
        if (domCreated.dot) cursorDot.remove();
        if (domCreated.style) doc.getElementById(INJECTED_STYLE_ID)?.remove();
    }

    return {
        rebind: setupInteractionListeners,
        destroy,
    };
}

export default initCustomCursor;
