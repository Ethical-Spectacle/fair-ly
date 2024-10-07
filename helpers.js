// Define ENTITY_COLORS
export const ENTITY_COLORS = {
    GEN: '#BAE1FF',   // blue
    UNFAIR: '#FFB3BA', // red
    STEREO: '#D3B3FF'  // purple
};

// Create and append elements
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

// Escape special characters in a string for use in a regular expression
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight entities in a sentence
export function highlightEntities(sentence, entities) {
    if (!entities || Object.keys(entities).length === 0) {
        return sentence;
    }

    let highlightedSentence = sentence;
    const entityMap = new Map();

    // Map words to entity types
    Object.entries(entities).forEach(([entityType, entityList]) => {
        entityList.forEach(entity => {
            const entityText = entity.words.map(w => w.word.replace(/^##/, '')).join(' ');
            entityMap.set(entityText, entityType);
        });
    });

    const sortedEntityTexts = Array.from(entityMap.keys()).sort((a, b) => b.length - a.length);

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
