// Addons functionality for the Corporate Dashboard
// This file contains utility functions and configurations for browser addons

const addonsConfig = {
    recommendations: [
        {
            name: "uBlock Origin Lite",
            description: "Wydajny bloker reklam i elementów śledzących",
            icon: "https://addons.mozilla.org/user-media/addon_icons/607/607454-64.png",
            browsers: {
                firefox: "https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/",
                edge: "https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak",
                chrome: "https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh"
            }
        },
        {
            name: "Dark Reader",
            description: "Ciemny motyw dla każdej strony internetowej",
            icon: "https://addons.mozilla.org/user-media/addon_icons/855/855413-64.png",
            browsers: {
                firefox: "https://addons.mozilla.org/pl/firefox/addon/darkreader/",
                edge: "https://microsoftedge.microsoft.com/addons/detail/dark-reader/ifoakfbpdcdoeenechcleahebpibofpc",
                chrome: "https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh"
            }
        },
        {
            name: "Stylus",
            description: "Menedżer stylów do modyfikacji wyglądu stron",
            icon: "https://addons.mozilla.org/user-media/addon_icons/814/814814-64.png",
            browsers: {
                firefox: "https://addons.mozilla.org/pl/firefox/addon/styl-us/",
                chrome: "https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne"
            }
        },
        {
            name: "Tampermonkey",
            description: "Menedżer skryptów użytkownika",
            icon: "https://addons.mozilla.org/user-media/addon_icons/683/683490-64.png",
            browsers: {
                firefox: "https://addons.mozilla.org/pl/firefox/addon/tampermonkey/",
                edge: "https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd",
                chrome: "https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
            }
        },
        {
            name: "Inspecta",
            description: "Narzędzie do inspekcji wizualnej i CSS",
            icon: "https://lh3.googleusercontent.com/MPJhtkHft6R0lif80U0D4eUFmAXCptpOqoY1EplfgYTyd-uwTIiLlxVL6-K0EbhiupcO4miOgIzcRnZDWctvxDWyVyg=s60",
            browsers: {
                chrome: "https://chromewebstore.google.com/detail/inspecta-visual-qa-and-cs/pjcfmgokdbdffkcldahbehpemeejglhh"
            }
        },
        {
            name: "Inspect CSS",
            description: "Zaawansowane narzędzie do inspekcji i analizy CSS",
            icon: "https://lh3.googleusercontent.com/ERE_ftuLadDgzU3bOKpfIlTbTZbnmwWgHDCwkabGekx66uh4hJb8RRG40VPcFBrW9YoUfAnO42iv2PI86ztCd1lNXAk=s60",
            browsers: {
                chrome: "https://chromewebstore.google.com/detail/inspect-css/fbopfffegfehobgoommphghohinpkego"
            }
        },
        {
            name: "BezPrzerwy YouTube™",
            description: "Automatyczne odtwarzanie YouTube bez przerw",
            icon: "https://store-images.s-microsoft.com/image/apps.55837.bc0f414d-b052-417a-aa07-747b03ec4d36.a46ee379-698f-47f0-a8a5-e89b160d317e.c6cbc653-4a8d-47f4-8a5c-4efd9321e251?mode=scale&h=100&q=90&w=100",
            browsers: {
                edge: "https://microsoftedge.microsoft.com/addons/detail/bezprzerwy-youtube%E2%84%A2/klfgmbgpidpnfkpjmpdlegfcjilgkcec"
            }
        },
        {
            name: "ToolCopy Side Panel",
            description: "Panel boczny z narzędziami do kopiowania 8.1.3",
            icon: "https://lh3.googleusercontent.com/nQq__yCwHmnPnPqgOVUgfEKsXyF-fdp5OA-amuPGh_zHEN2_jQIOUl5Cu0fxsJUVmkXxKoDeEOVldX1vN_ygcFuziiU=s60",
            browsers: {
                chrome: "https://chrome.google.com/webstore/detail/kjlnnfcikdiekpiojcgoapcbhonafffk"
            }
        },
        {
            name: "Strona Startowa",
            description: "Strona Startowa Zakładek",
            icon: "https://lh3.googleusercontent.com/5aTghBPfzMIL6kcaGIVwY-b5slN19PQ_GEgBqzaky8l42dIOsi5iX_jDQwxdNrsMCyouuk-De48Qvmx1KTlD32xb-g=s60",
            browsers: {
                chrome: "https://chromewebstore.google.com/detail/moja-strona-startowa-zak%C5%82/kadencjogjklfnjkomahdhmmencknabl"
            }
        },
        {
            name: "LinkVideo",
            description: "Linki steam",
            icon: "https://lh3.googleusercontent.com/Nkq1gJcgopBBFH17uCt81NIJpUi85vrj7Q69r1eI16ZijrFP4TQHpAdTWLSDHklyre8zXL8mthOrnfwkLBFoDAScPQ=s60",
            browsers: {
                chrome: "https://chromewebstore.google.com/detail/przechwytywanie-adres%C3%B3w-w/fgdpldbeojbiilkaegoibbgegcgcaomk"

            }
        }

    ]
};

// Utility functions for addons
const addonsUtils = {
    getBrowserName() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Firefox')) return 'firefox';
        if (userAgent.includes('Edg')) return 'edge';
        if (userAgent.includes('Chrome')) return 'chrome';
        return 'unknown';
    },

    openAddon(addonName, browser) {
        const addon = addonsConfig.recommendations.find(a => a.name === addonName);
        if (addon && addon.browsers[browser]) {
            window.open(addon.browsers[browser], '_blank');
        }
    },

    getRecommendations() {
        return addonsConfig.recommendations;
    }
};

// Make available globally
window.addonsConfig = addonsConfig;
window.addonsUtils = addonsUtils;

