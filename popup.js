// popup.js
import { createElement, escapeRegExp, highlightEntities, ENTITY_COLORS } from './helpers.js';
import { createDonutChart, createCircularFillChart, createBubbleChart } from './charts.js';


// Global variables
let activeTab = 'analyze';
let analysisData = null;
let entityCounts = null;
let normalizedEntityCounts = null;
let isAnalyzing = false;
let pageTitle = '';
let pageUrl = '';
let progress = 0;

// ASPECT_COLORS
const ASPECT_COLORS = {
    "racial": "#ff0000",       // Red
    "religious": "#8b4513",    // Brown
    "gender": "#800080",       // Purple
    "age": "#ffa500",          // Orange
    "nationality": "#0000ff",  // Blue
    "sexuality": "#ff69b4",    // Pink
    "socioeconomic": "#006400",// Dark Green
    "educational": "#ffff00",  // Yellow
    "disability": "#87cefa",   // Light Blue
    "political": "#ff6347",    // Light Red
    "physical": "#90ee90"      // Light Green
};

// Switch tabs
function setActiveTab(tab) {
    activeTab = tab;
    renderTabs();
    if (tab === 'analyze') {
        renderAnalyzeTab();
    } else {
        renderExploreTab();
    }
}

// Tab buttons
function renderTabs() {
    const tabButtons = document.getElementById('tab-buttons');
    tabButtons.innerHTML = '';
    tabButtons.classList.add('tab-buttons-container');

    ['analyze', 'explore'].forEach(tab => {
        const button = createElement('button', {
            class: `tab-button ${activeTab === tab ? 'tab-button-active' : 'tab-button-inactive'}`,
            onclick: () => setActiveTab(tab)
        }, tab.charAt(0).toUpperCase() + tab.slice(1));
        tabButtons.appendChild(button);
    });
}

function renderAnalyzeTab() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.classList.add('popup-content');

    if (!analysisData && !isAnalyzing) {
        const button = createElement('button', {
            class: "analysis-button",
            onclick: runAnalysis
        }, `Run Analysis on "${pageTitle || 'current page'}"`);
        content.appendChild(button);
    } else if (isAnalyzing) {
        content.appendChild(createElement('p', { class: 'text-center' }, 'Analysis in progress...'));
        const progressBar = createElement('div', { class: 'progress-bar' });
        const progressFill = createElement('div', {
            class: 'progress-bar-fill',
            style: `width: ${progress}%`
        });
        progressBar.appendChild(progressFill);
        content.appendChild(progressBar);
    } else if (analysisData && analysisData.length > 0) {
        content.appendChild(createElement('h2', { class: "analysis-title" }, "Analysis Results"));

        // Bias score canvas
        const biasScoreCanvas = document.createElement('canvas');
        biasScoreCanvas.id = 'biasScoreChart';
        biasScoreCanvas.classList.add('chart-center');
        biasScoreCanvas.width = 200;
        biasScoreCanvas.height = 200;
        content.appendChild(biasScoreCanvas);

        // Entity charts container
        const entityChartsContainer = createElement('div', { class: 'entity-charts-container' });
        content.appendChild(entityChartsContainer);

        ['genChart', 'unfairChart', 'stereoChart'].forEach(chartId => {
            const canvas = document.createElement('canvas');
            canvas.id = chartId;
            canvas.classList.add('entity-chart');
            canvas.width = 120;
            canvas.height = 120;
            entityChartsContainer.appendChild(canvas);
        });

        // Aspects bubble chart
        const aspectsCanvas = document.createElement('canvas');
        aspectsCanvas.id = 'aspectsChart';
        aspectsCanvas.classList.add('chart-center');
        aspectsCanvas.width = 250;
        aspectsCanvas.height = 250;
        content.appendChild(aspectsCanvas);

        // Render charts
        const averageBiasScore = analysisData.reduce((sum, item) => sum + item.biasScore, 0) / analysisData.length;
        const normalizedBiasScore = averageBiasScore * 100;

        createDonutChart('biasScoreChart', [normalizedBiasScore, 100 - normalizedBiasScore], ['Biased', 'Fair'], ['#FF6384', '#36A2EB']);

        // Render entity half-donut charts
        createCircularFillChart('genChart', normalizedEntityCounts['GEN'], 1, 'Generalizations', ENTITY_COLORS['GEN']);
        createCircularFillChart('unfairChart', normalizedEntityCounts['UNFAIR'], 1, 'Unfairness', ENTITY_COLORS['UNFAIR']);
        createCircularFillChart('stereoChart', normalizedEntityCounts['STEREO'], 1, 'Stereotypes', ENTITY_COLORS['STEREO']);

        // Prepare data for aspects bubble chart
        const aspectCounts = {};

        analysisData.forEach(sentence => {
            for (const [aspect, score] of Object.entries(sentence.aspects)) {
                if (aspectCounts[aspect]) {
                    aspectCounts[aspect] += 1; // Increment count for each occurrence
                } else {
                    aspectCounts[aspect] = 1;
                }
            }
        });

        const aspectsData = Object.entries(aspectCounts).map(([aspect, count]) => ({
            aspect: aspect,
            value: count,
            color: ASPECT_COLORS[aspect] || '#000000'  // Default color if not specified
        }));

        // Render the bubble chart
        createBubbleChart('aspectsChart', aspectsData);
    } else {
        content.appendChild(createElement('p', { class: 'text-center' }, "No analysis data available or an error occurred."));
    }
}




// Render the Explore tab
function renderExploreTab() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!analysisData || analysisData.length === 0) {
        content.appendChild(createElement('p', {}, "No analysis data available. Please run an analysis first."));
        return;
    }

    try {
        const sortedData = [...analysisData].sort((a, b) => b.biasScore - a.biasScore);

        const list = createElement('ul', { class: "space-y-4" });

        sortedData.forEach((item) => {
            const listItem = createElement('li', { class: "p-4 border rounded shadow-sm hover:shadow-md transition-shadow duration-200" });

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
    } catch (error) {
        content.appendChild(createElement('p', { class: "text-red-500" }, `An error occurred: ${error.message}`));
    }
}

// Run analysis
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

// Initialize the popup
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
