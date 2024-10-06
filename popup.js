// create and append elements
function createElement(tag, attributes = {}, textContent = '') {
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

let activeTab = 'analyze';
let analysisData = null;
let entityCounts = null;
let normalizedEntityCounts = null;
let isAnalyzing = false;
let pageTitle = '';
let pageUrl = '';
let progress = 0;

const ENTITY_COLORS = {
    GEN: '#FFB3BA',  // pink
    UNFAIR: '#BAFFC9', // green
    STEREO: '#BAE1FF'  // blue
};

// donut chart
function createDonutChart(canvasId, data, labels, colors) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const total = data.reduce((sum, value) => sum + value, 0);
    let startAngle = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const innerRadius = radius * 0.6;

    // segment drawing
    data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        startAngle += sliceAngle;
    });

    // labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    labels.forEach((label, index) => {
        const angle = startAngle - (data[index] / total) * Math.PI;
        const labelRadius = radius + 20;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        ctx.fillText(label, x, y);
    });
}

// circular fill chart
function createCircularFillChart(canvasId, value, maxValue, label, color) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();

    const fillAngle = (value / maxValue) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, fillAngle - Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(label, centerX, centerY - 15);
    ctx.font = '12px Arial';
    ctx.fillText(`${(value * 100).toFixed(2)}%`, centerX, centerY + 15);
}

// create bubble chart of bias aspects
function createBubbleChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.4;

    // Sort data by value so the largest bubbles are drawn first
    data.sort((a, b) => b.value - a.value);

    const bubbles = [];

    // Helper function to check if a bubble overlaps with existing bubbles
    function isOverlapping(x, y, radius) {
        for (const bubble of bubbles) {
            const dx = bubble.x - x;
            const dy = bubble.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bubble.radius + radius) {
                return true;
            }
        }
        return false;
    }

    // Place each bubble in a non-overlapping position
    data.forEach((item) => {
        const radius = maxRadius * Math.sqrt(item.value / Math.max(...data.map(d => d.value)));

        let angle = Math.random() * 2 * Math.PI; // Start at a random angle
        let distance = 0;

        let x, y;
        let foundPosition = false;

        while (!foundPosition) {
            x = centerX + distance * Math.cos(angle);
            y = centerY + distance * Math.sin(angle);

            if (!isOverlapping(x, y, radius) && x - radius > 0 && x + radius < canvas.width && y - radius > 0 && y + radius < canvas.height) {
                foundPosition = true;
            } else {
                angle += Math.PI / 8; // Increment angle to try a new position
                if (angle >= 2 * Math.PI) {
                    angle = 0;
                    distance += 5; // Increase the distance from the center
                }
            }
        }

        bubbles.push({ x, y, radius });

        // Draw the bubble
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        // Draw the label (aspect name and count)
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.aspect, x, y - 10); // Draw the aspect name above the count
        ctx.fillText(item.value, x, y + 10); // Draw the count below the aspect name
    });
}

// render the Analyze tab
function renderAnalyzeTab() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!analysisData && !isAnalyzing) {
        const button = createElement('button', {
            class: "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300",
            onclick: runAnalysis
        }, `Run Analysis on "${pageTitle || 'current page'}"`);
        content.appendChild(button);
    } else if (isAnalyzing) {
        content.appendChild(createElement('p', { class: 'mb-4 text-lg text-center text-gray-700' }, 'Analysis in progress...'));
        const progressBar = createElement('div', { class: 'w-full bg-gray-300 rounded-full h-4 mb-6 overflow-hidden' });
        const progressFill = createElement('div', {
            class: 'bg-blue-500 h-full rounded-full transition-all duration-300',
            style: `width: ${progress}%`
        });
        progressBar.appendChild(progressFill);
        content.appendChild(progressBar);
    } else if (analysisData && analysisData.length > 0) {
        content.appendChild(createElement('h2', { class: "text-2xl font-bold mb-6 text-blue-600" }, "Analysis Results"));

        // create bias score canvas
        const biasScoreCanvas = createElement('canvas', { id: 'biasScoreChart', width: '200', height: '200', class: 'mb-8 mx-auto' });
        content.appendChild(biasScoreCanvas);

        // create entity charts container/canvases
        const entityChartsContainer = createElement('div', { class: 'grid grid-cols-3 gap-4 mb-8' });
        const genCanvas = createElement('canvas', { id: 'genChart', width: '150', height: '150' });
        const unfairCanvas = createElement('canvas', { id: 'unfairChart', width: '150', height: '150' });
        const stereoCanvas = createElement('canvas', { id: 'stereoChart', width: '150', height: '150' });
        entityChartsContainer.appendChild(genCanvas);
        entityChartsContainer.appendChild(unfairCanvas);
        entityChartsContainer.appendChild(stereoCanvas);
        content.appendChild(entityChartsContainer);

        // create aspects bubble chart canvas
        const aspectsCanvas = createElement('canvas', { id: 'aspectsChart', width: '300', height: '300', class: 'mx-auto' });
        content.appendChild(aspectsCanvas);

        // calculate Fair-ly score (right now, it's just avg bias score of biased sentences, not even helpful)
        const averageBiasScore = analysisData.reduce((sum, item) => sum + item.biasScore, 0) / analysisData.length;
        const normalizedBiasScore = averageBiasScore * 100;

        // render bias aspects bubble chart
        createDonutChart('biasScoreChart',
            [normalizedBiasScore, 100 - normalizedBiasScore],
            ['Biased', 'Fair'],
            ['#FF6384', '#36A2EB']
        );

        // change this to something smarter
        const maxNormalizedEntityCount = Math.max(
            normalizedEntityCounts['GEN'],
            normalizedEntityCounts['UNFAIR'],
            normalizedEntityCounts['STEREO']
        );

        // render GUS-Net charts
        createCircularFillChart('genChart', normalizedEntityCounts['GEN'], maxNormalizedEntityCount, 'Generalizations', ENTITY_COLORS['GEN']);
        createCircularFillChart('unfairChart', normalizedEntityCounts['UNFAIR'], maxNormalizedEntityCount, 'Unfairness', ENTITY_COLORS['UNFAIR']);
        createCircularFillChart('stereoChart', normalizedEntityCounts['STEREO'], maxNormalizedEntityCount, 'Stereotypes', ENTITY_COLORS['STEREO']);

        // render aspects bubble chart
        const aspectCounts = {};
        analysisData.forEach(sentence => {
            const aspects = sentence.aspects;
            for (const [aspect, score] of Object.entries(aspects)) {
                if (aspectCounts[aspect]) {
                    aspectCounts[aspect] += 1;
                } else {
                    aspectCounts[aspect] = 1;
                }
            }
        });
        const ASPECT_COLORS = {
            "racial": "#ff0000", // Red
            "religious": "#8b4513", // Brown
            "gender": "#800080", // Purple
            "age": "#ffa500", // Orange
            "nationality": "#0000ff", // Blue
            "sexuality": "#ff69b4", // Pink
            "socioeconomic": "#006400", // Dark Green
            "educational": "#ffff00", // Yellow
            "disability": "#87cefa", // Light Blue
            "political": "#ff6347", // Light Red
            "physical": "#90ee90" // Light Green
        };

        const aspectsData = Object.entries(aspectCounts).map(([aspect, count]) => ({
            aspect: aspect,
            value: count,
            color: ASPECT_COLORS[aspect] || '#000000', // Default color if not specified
        }));
        createBubbleChart('aspectsChart', aspectsData);

        // Display summary
        content.appendChild(createElement('p', { class: 'mt-8 text-lg text-center' }, `Average Bias Score: ${averageBiasScore.toFixed(2)}`));
        content.appendChild(createElement('p', { class: 'mt-2 text-center' }, `Total Biased Sentences: ${analysisData.length}`));
        content.appendChild(createElement('p', { class: 'text-center' }, `Generalizations: ${entityCounts['GEN']}`));
        content.appendChild(createElement('p', { class: 'text-center' }, `Unfairness: ${entityCounts['UNFAIR']}`));
        content.appendChild(createElement('p', { class: 'text-center' }, `Stereotypes: ${entityCounts['STEREO']}`));
    } else {
        content.appendChild(createElement('p', {}, "No analysis data available or an error occurred."));
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightEntities(sentence, entities) {
    if (!entities || Object.keys(entities).length === 0) {
        return sentence;
    }

    let highlightedSentence = sentence;
    const entityMap = new Map();

    // map words to entity types
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
        const regex = new RegExp(`\b${escapedEntityText}\b`, 'gi');
        highlightedSentence = highlightedSentence.replace(regex, match =>
            `<span class="highlighted-entity" data-entity-type="${entityType}" style="background-color: ${ENTITY_COLORS[entityType]};">${match}</span>`
        );
    });

    return highlightedSentence;
}

function renderExploreTab() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!analysisData || analysisData.length === 0) {
        content.appendChild(createElement('p', {}, "No analysis data available. Please run an analysis first."));
        return;
    }

    const sortedData = [...analysisData].sort((a, b) => b.biasScore - a.biasScore);
    const list = createElement('ul', { class: "space-y-4" });

    sortedData.forEach((item) => {
        const listItem = createElement('li', { class: "p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-300" });

        if (item.sentence) {
            const highlightedSentence = highlightEntities(item.sentence, item.entities);
            const sentenceElem = createElement('p', { class: "mb-2 text-lg leading-relaxed" });
            sentenceElem.innerHTML = highlightedSentence;
            listItem.appendChild(sentenceElem);
        } else {
            listItem.appendChild(createElement('p', { class: "mb-2 text-red-500" }, "Error: Missing sentence"));
        }

        listItem.appendChild(createElement('p', { class: "text-sm text-gray-600 mb-2" }, `Bias score: ${item.biasScore.toFixed(2)}`));

        list.appendChild(listItem);
    });

    content.appendChild(list);

    // Add CSS for hover effect and tooltip
    const style = document.createElement('style');
    style.textContent = `
        .highlighted-entity {
            padding: 2px 4px;
            border-radius: 2px;
            transition: all 0.2s;
            position: relative;
        }
        .highlighted-entity:hover {
            filter: brightness(90%);
        }
        .highlighted-entity:hover::after {
            content: attr(data-entity-type);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);
}

// switch tabs
function setActiveTab(tab) {
    activeTab = tab;
    renderTabs();
    if (tab === 'analyze') {
        renderAnalyzeTab();
    } else {
        renderExploreTab();
    }
}

// tab buttons
function renderTabs() {
    const tabButtons = document.getElementById('tab-buttons');
    tabButtons.innerHTML = '';
    ['analyze', 'explore'].forEach(tab => {
        const button = createElement('button', {
            class: `mr-2 px-4 py-2 rounded-md transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`,
            onclick: () => setActiveTab(tab)
        }, tab.charAt(0).toUpperCase() + tab.slice(1));
        tabButtons.appendChild(button);
    });
}

// run analysis
function runAnalysis() {
    isAnalyzing = true;
    progress = 0;
    renderAnalyzeTab();

    const progressInterval = setInterval(() => {
        progress += 10;
        if (progress > 90) {
            clearInterval(progressInterval);
        }
        renderAnalyzeTab();
    }, 500);

    chrome.runtime.sendMessage({ action: 'runAnalysis' }, (response) => {
        clearInterval(progressInterval);
        if (response.error) {
            isAnalyzing = false;
            progress = 0;
            const content = document.getElementById('content');
            content.innerHTML = `<p class="text-red-500">${response.error}</p>`;
        } else {
            analysisData = response.data;
            entityCounts = response.entityCounts;
            normalizedEntityCounts = response.normalizedEntityCounts;
            pageTitle = response.pageTitle;
            pageUrl = response.pageUrl;
            isAnalyzing = false;
            progress = 100;
        }
        renderAnalyzeTab();
    });
}

// init the popup
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        pageTitle = currentTab.title;
        pageUrl = currentTab.url;
        renderTabs();
        renderAnalyzeTab();

        // Load data from storage
        chrome.storage.local.get(['analysisData', 'entityCounts', 'normalizedEntityCounts', 'analysisTimestamp', 'pageTitle', 'pageUrl'], (result) => {
            if (result.analysisData &&
                result.pageUrl === pageUrl &&
                Date.now() - result.analysisTimestamp < 30 * 60 * 1000) {
                analysisData = result.analysisData;
                entityCounts = result.entityCounts;
                normalizedEntityCounts = result.normalizedEntityCounts;
                pageTitle = result.pageTitle;
                renderAnalyzeTab();
            }
        });
    });
});