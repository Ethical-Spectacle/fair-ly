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

// render the Analyze tab
function renderAnalyzeTab() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!analysisData && !isAnalyzing) {
        const button = createElement('button', {
            class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
            onclick: runAnalysis
        }, `Run Analysis on "${pageTitle || 'current page'}"`);
        content.appendChild(button);
    } else if (isAnalyzing) {
        content.appendChild(createElement('p', { class: 'mb-2' }, 'Analysis in progress...'));
        const progressBar = createElement('div', { class: 'w-full bg-gray-200 rounded-full h-2.5 mb-4' });
        const progressFill = createElement('div', {
            class: 'bg-blue-600 h-2.5 rounded-full',
            style: `width: ${progress}%`
        });
        progressBar.appendChild(progressFill);
        content.appendChild(progressBar);
    } else if (analysisData && analysisData.length > 0) {
        content.appendChild(createElement('h2', { class: "text-xl font-bold mb-4" }, "Analysis Results"));
        
        const biasScoreCanvas = createElement('canvas', { id: 'biasScoreChart', width: '200', height: '200', class: 'mb-4' });
        content.appendChild(biasScoreCanvas);

        const entityChartsContainer = createElement('div', { class: 'flex justify-between mb-4' });
        const genCanvas = createElement('canvas', { id: 'genChart', width: '150', height: '150' });
        const unfairCanvas = createElement('canvas', { id: 'unfairChart', width: '150', height: '150' });
        const stereoCanvas = createElement('canvas', { id: 'stereoChart', width: '150', height: '150' });
        entityChartsContainer.appendChild(genCanvas);
        entityChartsContainer.appendChild(unfairCanvas);
        entityChartsContainer.appendChild(stereoCanvas);
        content.appendChild(entityChartsContainer);

        const averageBiasScore = analysisData.reduce((sum, item) => sum + item.biasScore, 0) / analysisData.length;
        const normalizedBiasScore = averageBiasScore * 100;

        createDonutChart('biasScoreChart',
            [normalizedBiasScore, 100 - normalizedBiasScore],
            ['Biased', 'Neutral'],
            ['#FF6384', '#36A2EB']
        );

        const maxNormalizedEntityCount = Math.max(
            normalizedEntityCounts['GEN'],
            normalizedEntityCounts['UNFAIR'],
            normalizedEntityCounts['STEREO']
        );

        createCircularFillChart('genChart', normalizedEntityCounts['GEN'], maxNormalizedEntityCount, 'Generalizations', '#FF6384');
        createCircularFillChart('unfairChart', normalizedEntityCounts['UNFAIR'], maxNormalizedEntityCount, 'Unfairness', '#36A2EB');
        createCircularFillChart('stereoChart', normalizedEntityCounts['STEREO'], maxNormalizedEntityCount, 'Stereotypes', '#FFCE56');

        // Display summary
        content.appendChild(createElement('p', { class: 'mt-4' }, `Average Bias Score: ${averageBiasScore.toFixed(2)}`));
        content.appendChild(createElement('p', {}, `Total Biased Sentences: ${analysisData.length}`));
        content.appendChild(createElement('p', {}, `Generalizations: ${entityCounts['GEN']}`));
        content.appendChild(createElement('p', {}, `Unfairness: ${entityCounts['UNFAIR']}`));
        content.appendChild(createElement('p', {}, `Stereotypes: ${entityCounts['STEREO']}`));
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
        const regex = new RegExp(`\\b${escapedEntityText}\\b`, 'gi');
        highlightedSentence = highlightedSentence.replace(regex, match =>
            `<span class="highlighted-entity" data-entity-type="${entityType}" style="background-color: ${ENTITY_COLORS[entityType]};">${match}</span>`
        );
    });

    return highlightedSentence;
}

function renderExploreTab() {
    console.log("Entering renderExploreTab function");
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!analysisData || analysisData.length === 0) {
        console.log("No analysis data available");
        content.appendChild(createElement('p', {}, "No analysis data available. Please run an analysis first."));
        return;
    }

    console.log("Analysis data:", analysisData);

    try {
        const sortedData = [...analysisData].sort((a, b) => b.biasScore - a.biasScore);
        console.log("Sorted data:", sortedData);

        const list = createElement('ul', { class: "space-y-4" });

        sortedData.forEach((item, index) => {
            console.log(`Processing item ${index}:`, item);

            const listItem = createElement('li', { class: "p-4 border rounded shadow-sm hover:shadow-md transition-shadow duration-200" });

            if (item.sentence) {
                console.log(`Sentence for item ${index}:`, item.sentence);
                const highlightedSentence = highlightEntities(item.sentence, item.entities);
                console.log(`Highlighted sentence for item ${index}:`, highlightedSentence);
                const sentenceElem = createElement('p', { class: "mb-2 text-lg leading-relaxed" });
                sentenceElem.innerHTML = highlightedSentence;
                listItem.appendChild(sentenceElem);
            } else {
                console.error(`Missing sentence for item ${index}:`, item);
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

        console.log("Finished rendering explore tab");
    } catch (error) {
        console.error("Error in renderExploreTab:", error);
        content.appendChild(createElement('p', { class: "text-red-500" }, `An error occurred: ${error.message}`));
    }
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
            class: `mr-2 ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'} px-4 py-2 rounded`,
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