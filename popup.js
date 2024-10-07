// popup.js
import {
  createElement,
  escapeRegExp,
  highlightEntities,
  ENTITY_COLORS,
} from "./helpers.js";
import {
  createDonutChart,
  createCircularFillChart,
  createBubbleChart,
} from "./charts.js";
let activeTab = "analyze";
let analysisData = null;
let entityCounts = null;
let normalizedEntityCounts = null;
let isAnalyzing = false;
let pageTitle = "";
let pageUrl = "";
let progress = 0;
let totalSentences = 0;

const ASPECT_COLORS = {
    "racial": "#ff0000",
    "religious": "#8b4513",
    "gender": "#800080",
    "age": "#ffa500",
    "nationality": "#0000ff",
    "sexuality": "#ff69b4",
    "socioeconomic": "#006400",
    "educational": "#ffff00",
    "disability": "#87cefa",
    "political": "#ff6347",
    "physical": "#90ee90"
};

function applyStyles(element, styles) {
  Object.assign(element.style, styles);
}

function setActiveTab(tab) {
  activeTab = tab;
  renderTabs();
  if (tab === "analyze") {
    renderAnalyzeTab();
  } else {
    renderExploreTab();
  }
}

function renderTabs() {
  const tabButtons = document.getElementById("tab-buttons");
  tabButtons.innerHTML = "";
  applyStyles(tabButtons, {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
    width: "100%",
  });

  ["analyze", "explore"].forEach((tab) => {
    const button = createElement(
      "button",
      {
        onclick: () => setActiveTab(tab),
      },
      tab.charAt(0).toUpperCase() + tab.slice(1)
    );

        applyStyles(button, {
            margin: '0 0.5rem',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            backgroundColor: activeTab === tab ? '#2563eb' : '#e5e7eb',
            color: activeTab === tab ? '#ffffff' : '#1f2937',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            width: '45%'
        });

    button.onmouseover = () => {
      button.style.backgroundColor = activeTab === tab ? "#2563eb" : "#3b82f6";
    };
    button.onmouseout = () => {
      button.style.backgroundColor = activeTab === tab ? "#2563eb" : "#e5e7eb";
    };

    tabButtons.appendChild(button);
  });
}

function renderAnalyzeTab() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    applyStyles(content, {
        width: '500px',
        textAlign: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        margin: '0 auto'
    });

  if (!analysisData && !isAnalyzing) {
    const button = createElement(
      "button",
      {
        onclick: runAnalysis,
      },
      `Run Analysis on "${pageTitle || "current page"}"`
    );

    applyStyles(button, {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "0.375rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      margin: "1rem 0",
    });

    button.onmouseover = () => {
      button.style.backgroundColor = "#3b82f6";
    };
    button.onmouseout = () => {
      button.style.backgroundColor = "#2563eb";
    };

    content.appendChild(button);
  } else if (isAnalyzing) {
    const paragraph = createElement("p", {}, "Analysis in progress...");
    applyStyles(paragraph, { textAlign: "center", marginBottom: "1rem" });
    content.appendChild(paragraph);

    const progressBar = createElement("div", {});
    applyStyles(progressBar, {
      width: "100%",
      backgroundColor: "#e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
      height: "1rem",
      marginBottom: "1.5rem",
    });

    const progressFill = createElement("div", {});
    applyStyles(progressFill, {
      height: "100%",
      backgroundColor: "#2563eb",
      width: `${progress}%`,
      transition: "width 0.3s ease",
    });
    progressBar.appendChild(progressFill);

    content.appendChild(progressBar);
  } else if (analysisData && analysisData.length > 0) {
    const analysisContainer = createElement("div", {});
    applyStyles(analysisContainer, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "2rem",
      flexWrap: "wrap",
    });

        const biasScoreCanvas = document.createElement('canvas');
        biasScoreCanvas.id = 'biasScoreChart';
        biasScoreCanvas.width = 200;
        biasScoreCanvas.height = 200;
        applyStyles(biasScoreCanvas, {
            display: 'block',
            margin: '0 auto',
            maxWidth: '30%'
        });
        analysisContainer.appendChild(biasScoreCanvas);

        const summaryStats = createElement('div', {});
        const numBiasedSentences = analysisData.length;
        applyStyles(summaryStats, {
            textAlign: 'left',
            fontSize: '1rem',
            marginLeft: '2rem',
            flex: '1',
            lineHeight: '1.5rem',
            maxWidth: '250px',
        });

        const statsText = `
            <p><strong>Total Sentences:</strong> ${totalSentences}</p>
            <p><strong>Number of Biased Sentences:</strong> ${numBiasedSentences}</p>
            <p><strong>Percentage Biased:</strong> ${(numBiasedSentences / totalSentences * 100).toFixed(2)}%</p>
        `;
    summaryStats.innerHTML = statsText;
    analysisContainer.appendChild(summaryStats);

    content.appendChild(analysisContainer);

        const entityChartsContainer = createElement('div', {});
        applyStyles(entityChartsContainer, {
            display: 'flex',
            justifyContent: 'space-around',
            gap: '1rem',
            margin: '2rem 0',
            flexWrap: 'wrap'
        });
        content.appendChild(entityChartsContainer);

        ['genChart', 'unfairChart', 'stereoChart'].forEach((chartId) => {
            const canvas = document.createElement('canvas');
            canvas.id = chartId;
            applyStyles(canvas, {
                maxWidth: '30%',
                flex: '1 1 30%',
                boxSizing: 'border-box',
            });
            entityChartsContainer.appendChild(canvas);
        });

        const aspectsCanvas = document.createElement('canvas');
        aspectsCanvas.id = 'aspectsChart';
        aspectsCanvas.width = 250;
        aspectsCanvas.height = 250;
        applyStyles(aspectsCanvas, {
            display: 'block',
            margin: '2rem auto',
            maxWidth: '100%'
        });
        content.appendChild(aspectsCanvas);

        const averageBiasScore = analysisData.reduce((sum, item) => sum + item.biasScore, 0) / analysisData.length;
        const normalizedBiasScore = averageBiasScore * 100;

        createDonutChart('biasScoreChart', [normalizedBiasScore, 100 - normalizedBiasScore], ['Biased', 'Fair'], ['#FF6384', '#36A2EB']);
        createCircularFillChart('genChart', normalizedEntityCounts['GEN'], 1, 'Generalizations', ENTITY_COLORS['GEN']);
        createCircularFillChart('unfairChart', normalizedEntityCounts['UNFAIR'], 1, 'Unfairness', ENTITY_COLORS['UNFAIR']);
        createCircularFillChart('stereoChart', normalizedEntityCounts['STEREO'], 1, 'Stereotypes', ENTITY_COLORS['STEREO']);

        const aspectCounts = {};
        analysisData.forEach(sentence => {
            for (const [aspect, score] of Object.entries(sentence.aspects)) {
                if (aspectCounts[aspect]) {
                    aspectCounts[aspect] += 1;
                } else {
                    aspectCounts[aspect] = 1;
                }
            }
        });

        const aspectsData = Object.entries(aspectCounts).map(([aspect, count]) => ({
            aspect: aspect,
            value: count,
            color: ASPECT_COLORS[aspect] || '#000000'
        }));

        createBubbleChart('aspectsChart', aspectsData);
    } else {
        const paragraph = createElement('p', {}, "No analysis data available or an error occurred.");
        applyStyles(paragraph, { textAlign: 'center', marginBottom: '1rem' });
        content.appendChild(paragraph);
    }
}

function renderExploreTab() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!analysisData || analysisData.length === 0) {
    const paragraph = createElement(
      "p",
      {},
      "No analysis data available. Please run an analysis first."
    );
    applyStyles(paragraph, { textAlign: "center" });
    content.appendChild(paragraph);
    return;
  }

  try {
    const sortedData = [...analysisData].sort(
      (a, b) => b.biasScore - a.biasScore
    );

    const list = createElement("ul", {});
    applyStyles(list, {
      listStyleType: "none",
      padding: "0",
      margin: "0",
    });

        // cards for each sentence
    sortedData.forEach((item) => {
      const listItem = createElement("li", {});
      applyStyles(listItem, {
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.375rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        transition: "box-shadow 0.3s ease",
        marginBottom: "1rem",
      });
      listItem.onmouseover = () => {
        listItem.style.boxShadow =
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
      };
      listItem.onmouseout = () => {
        listItem.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
      };

      if (item.sentence) {
        const highlightedSentence = highlightEntities(
          item.sentence,
          item.entities
        );
        const sentenceElem = createElement("p", {});
        applyStyles(sentenceElem, {
          marginBottom: "0.5rem",
          fontSize: "1.125rem",
          lineHeight: "1.75rem",
        });
        sentenceElem.innerHTML = highlightedSentence;
        listItem.appendChild(sentenceElem);
      } else {
        const errorElem = createElement("p", {}, "Error: Missing sentence");
        applyStyles(errorElem, {
          marginBottom: "0.5rem",
          color: "#f87171",
        });
        listItem.appendChild(errorElem);
      }

      const biasScoreElem = createElement(
        "p",
        {},
        `Bias score: ${item.biasScore.toFixed(2)}`
      );
      applyStyles(biasScoreElem, {
        fontSize: "0.875rem",
        color: "#6b7280",
        marginBottom: "0.5rem",
      });
      listItem.appendChild(biasScoreElem);

      list.appendChild(listItem);
    });

    content.appendChild(list);
  } catch (error) {
    const errorElem = createElement(
      "p",
      {},
      `An error occurred: ${error.message}`
    );
    applyStyles(errorElem, { color: "#f87171" });
    content.appendChild(errorElem);
  }
}

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
            totalSentences = response.totalSentences;
            isAnalyzing = false;
            progress = 100;
        }
        renderAnalyzeTab();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        pageTitle = currentTab.title;
        pageUrl = currentTab.url;
        renderTabs();
        renderAnalyzeTab();

        chrome.storage.local.get(['analysisData', 'entityCounts', 'normalizedEntityCounts', 'totalSentences', 'analysisTimestamp', 'pageTitle', 'pageUrl'], (result) => {
            // console.log(totalSentences);
            if (result.analysisData &&
                result.pageUrl === pageUrl &&
                Date.now() - result.analysisTimestamp < 30 * 60 * 1000) {
                analysisData = result.analysisData;
                entityCounts = result.entityCounts;
                normalizedEntityCounts = result.normalizedEntityCounts;
                pageTitle = result.pageTitle;
                totalSentences = result.totalSentences;
                renderAnalyzeTab();
            }
        });
    });
});
