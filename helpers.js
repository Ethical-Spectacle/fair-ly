////////////////// COLORS /////////////////////

// Define ENTITY_COLORS
export const ENTITY_COLORS = {
    GEN: '#BAE1FF',   // blue
    UNFAIR: '#FFB3BA', // red
    STEREO: '#D3B3FF'  // purple
};

// used in explore tab tags
export const ASPECT_COLORS = {
    "racial": "#ff9999",       // Soft Red
    "religious": "#b0806f",    // Soft Brown
    "gender": "#d1a3d1",       // Soft Purple
    "age": "#ffd280",          // Soft Orange
    "nationality": "#8080ff",  // Soft Blue
    "sexuality": "#ffb6c1",    // Soft Pink
    "socioeconomic": "#8bc08b",// Soft Green
    "educational": "#fff7a0",  // Soft Yellow
    "disability": "#b0e0e6",   // Soft Light Blue
    "political": "#ff9b80",    // Soft Coral
    "physical": "#b4e4b4"      // Soft Light Green
};

////////////////////////////////////////////////////////
// How to style the popup with these colors:
// Design LIGHT MODE FIRST
// so when you assign colors to elements in popup.js, you use the colors that would apply in light mode
// for example, the background color is set to veryLightColor (white), and the text color is set to veryDarkColor (black)
// the dark mode switch will automatically reassign these to the colors in the DARK_THEME_COLORS dict

export const UI_COLORS = {
    // tabs
    "tabContainerBG":"#dadada", // light grey
    "activeTabBG": "#9A9A9A", // dark grey
    "inactiveTabBG": "#dadada", // light grey
    "progressBarBG": "#6cd27a", // green
    "cardBG": "#ffffff", // white

    // charts
    "semicircleBG": "#dadada", // light grey

    // text
    "strongText": "#ffffff", // white
    "weakText": "dadada", // light grey

    //pallette
    "veryLightColor":"#ffffff", // white
    "sortaLightColor":"dadada", // white-grey
    "veryDarkColor":"#000000", // black
    "sortaLightColor": "#1a1a1a", // black-grey
}
export const LIGHT_THEME_COLORS = {
    // tabs
    "tabContainerBG": "#dadada", // light grey
    "activeTabBG": "#9A9A9A", // dark grey
    "inactiveTabBG": "#dadada", // light grey
    "progressBarBG": "#6cd27a", // green
    "cardBG": "#ffffff", // white

    // charts
    "semicircleBG": "#dadada", // light grey

    // text
    "strongText": "#000000", // black
    "weakText": "#4a4a4a", // dark grey

    // palette
    "veryLightColor": "#ffffff", // white
    "sortaLightColor": "#dadada", // light-grey
    "veryDarkColor": "#000000", // black
    "sortaDarkColor": "#1a1a1a" // black-grey
};
export const DARK_THEME_COLORS = {
    // tabs
    "tabContainerBG": "#2a2a2a", // darker grey
    "activeTabBG": "#444444", // darker grey for active
    "inactiveTabBG": "#1a1a1a", // very dark grey
    "progressBarBG": "#6cd27a", // green remains the same
    "cardBG": "#2a2a2a", // dark grey for cards

    // charts
    "semicircleBG": "#1a1a1a", // dark grey

    // text
    "strongText": "#ffffff", // white text
    "weakText": "#aaaaaa", // light grey

    // palette
    "veryLightColor": "#1a1a1a", // dark background
    "sortaLightColor": "#2a2a2a", // darker background
    "veryDarkColor": "#ffffff", // white text
    "sortaDarkColor": "#dadada" // lighter grey for text
};
////////////////////////////////////////////////////////


/////////////////////////// HELPER FUNCTIONS //////////////////////////////

// applying styles with js throughout lmao
export function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

// for appending an element to the DOM
export function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    if (textContent) element.textContent = textContent;
    return element;
}

// don't think this is used anymore, but it was used for cleaning sentence splits, might be good to use
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// highlight the GUS entities in a sentence
export function highlightEntities(sentence, entities) {
    if (!entities || Object.keys(entities).length === 0) {
        return sentence;
    }

    let highlightedSentence = sentence;
    const entityMap = new Map();

    // map words to their entitiy types
    Object.entries(entities).forEach(([entityType, entityList]) => {
        entityList.forEach(entity => {
            const entityText = entity.words.map(w => w.word.replace(/^##/, '')).join(' ');
            entityMap.set(entityText, entityType);
        });
    });

    const sortedEntityTexts = Array.from(entityMap.keys()).sort((a, b) => b.length - a.length);

    // replace each entity text with a span highlighting it
    sortedEntityTexts.forEach(entityText => {
        const entityType = entityMap.get(entityText);
        const escapedEntityText = escapeRegExp(entityText);
        const regex = new RegExp(`\\b${escapedEntityText}\\b`, 'gi');
        highlightedSentence = highlightedSentence.replace(regex, match =>
            `<span class="highlighted-entity" data-entity-type="${entityType}" style="background-color: ${ENTITY_COLORS[entityType]};">${match}</span>`
        );
    });

    return highlightedSentence;
}
