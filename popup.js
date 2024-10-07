import { createElement, escapeRegExp, highlightEntities, ENTITY_COLORS } from './helpers.js';
import { createDonutChart, createCircularFillChart, createBubbleChart } from './charts.js';

let activeTab = 'analyze';
let analysisData = null;
let entityCounts = null;
let normalizedEntityCounts = null;
let isAnalyzing = false;
let pageTitle = "";
let pageUrl = "";
let progress = 0;
let totalSentences = 0;
let processedSentences = 0;

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
      margin: '0 auto',
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
      const paragraph = createElement("p", {}, `${processedSentences} of ${totalSentences} sentences processed.`);
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
      // Container for both the bias score chart and the summary text, displayed side by side
      const analysisSummaryContainer = createElement("div", {});
      applyStyles(analysisSummaryContainer, {
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'space-around',
          width: '100%',
          padding: '10px',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.3s ease',
          marginBottom: '1.5rem',
          boxSizing: 'border-box',
      });

      analysisSummaryContainer.onmouseover = () => {
          analysisSummaryContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
      };
      analysisSummaryContainer.onmouseout = () => {
          analysisSummaryContainer.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
      };

      // Bias score chart
      const biasScoreCanvas = document.createElement('canvas');
      biasScoreCanvas.id = 'biasScoreChart';
      applyStyles(biasScoreCanvas, {
          display: 'block',
          maxWidth: "200px",
          height: "200px", // Set a fixed height
      });
      analysisSummaryContainer.appendChild(biasScoreCanvas);

      // Summary text
      const summaryStats = createElement('div', {});
      const numBiasedSentences = analysisData.length;
      const biasedPercentage = Math.round((numBiasedSentences / totalSentences) * 100);
      applyStyles(summaryStats, {
          textAlign: 'left',
          fontSize: '1rem',
          lineHeight: '1.5rem',
          marginLeft: '1rem',
          flexGrow: 1, // Allow the summary text to take up remaining space
      });

      const statsText = `
          <p><strong>${numBiasedSentences}</strong> of ${totalSentences} sentences were classified as biased.</p>
          <p>Take <strong>${getTopCountedAspect()}</strong> statements with a grain of salt.</p>
      `;
      summaryStats.innerHTML = statsText;
      analysisSummaryContainer.appendChild(summaryStats);

      content.appendChild(analysisSummaryContainer);

      // Add entity charts container with card style
      const entityChartsContainer = createElement('div', {});
      applyStyles(entityChartsContainer, {
          display: 'flex',
          justifyContent: 'space-around',
          margin: '1.5rem 0',
          flexWrap: 'wrap',
          width: '100%',
      });

      // Append the entity canvases with fixed aspect ratio and max width
      const entities = [
          { id: 'genChart', label: 'Generalizations', color: ENTITY_COLORS['GEN'], count: entityCounts['GEN'] },
          { id: 'unfairChart', label: 'Unfairness', color: ENTITY_COLORS['UNFAIR'], count: entityCounts['UNFAIR'] },
          { id: 'stereoChart', label: 'Stereotypes', color: ENTITY_COLORS['STEREO'], count: entityCounts['STEREO'] },
      ];

      entities.forEach(({ id, label, color, count }) => {
          const canvasContainer = createElement("div", {});
          applyStyles(canvasContainer, {
              width: '30%', // Set fixed width
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'box-shadow 0.3s ease',
              marginBottom: '1.5rem',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Align items in the center
          });

          // Create a wrapper for the canvas to maintain aspect ratio
          const canvasWrapper = createElement("div", {});
          applyStyles(canvasWrapper, {
              position: 'relative',
              width: '100%',
              paddingBottom: '66.67%', // Maintain 3:2 aspect ratio (height = width * 2/3)
          });

          const canvas = document.createElement('canvas');
          canvas.id = id;
          applyStyles(canvas, {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
          });
          canvasWrapper.appendChild(canvas);
          canvasContainer.appendChild(canvasWrapper);

          // Create and append the entity label below the canvas
          const labelElement = createElement('p', {}, label);
          applyStyles(labelElement, {
              marginTop: '7px',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#4a4a4a',
              textAlign: 'center', // Ensure the text is centered
          });
          canvasContainer.appendChild(labelElement);

          entityChartsContainer.appendChild(canvasContainer);
      });

      content.appendChild(entityChartsContainer);

      // Now create the charts after they are appended to the DOM
      entities.forEach(({ id, label, color, count }) => {
          createCircularFillChart(id, count, totalSentences, count, color);
      });

    // Add aspects bubble chart with card style
    const bubbleChartContainer = createElement("div", {});
    applyStyles(bubbleChartContainer, {
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.3s ease',
        marginBottom: '1.5rem',
        width: '100%',
        boxSizing: 'border-box',
        height: '200px' // Specify the height explicitly
    });

    bubbleChartContainer.onmouseover = () => {
        bubbleChartContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
    };
    bubbleChartContainer.onmouseout = () => {
        bubbleChartContainer.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
    };

    const aspectsCanvas = document.createElement('canvas');
    aspectsCanvas.id = 'aspectsChart';
    applyStyles(aspectsCanvas, {
        display: 'block',
        width: '100%',
        height: '100%' // Ensure the canvas fills the container height
    });
    bubbleChartContainer.appendChild(aspectsCanvas);
    content.appendChild(bubbleChartContainer);

    // Create charts
    createDonutChart('biasScoreChart', numBiasedSentences, totalSentences, ['#ff6164', '#A2E09B']);

    // Aspects bubble chart data
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
        color: ASPECT_COLORS[aspect] || '#000000',
    }));

    createBubbleChart('aspectsChart', aspectsData);

  } else {
      const paragraph = createElement('p', {}, "No analysis data available or an error occurred.");
      applyStyles(paragraph, { textAlign: 'center', marginBottom: '1rem' });
      content.appendChild(paragraph);
  }
}




// Helper function to get the top counted aspect
function getTopCountedAspect() {
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

  const sortedAspects = Object.entries(aspectCounts).sort((a, b) => b[1] - a[1]);
  return sortedAspects.length > 0 ? sortedAspects[0][0].toLowerCase() : 'any';
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

        sortedData.forEach((item) => {
            const listItem = createElement('li', {});
            applyStyles(listItem, {
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'box-shadow 0.3s ease',
                marginBottom: '1rem'
            });
            listItem.onmouseover = () => {
                listItem.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
            };
            listItem.onmouseout = () => {
                listItem.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
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

async function runAnalysis() {
  isAnalyzing = true;
  progress = 0;
  processedSentences = 0;

  try {
      // Get the current tab
      const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

      // Send a message to the background script to start the analysis
      chrome.runtime.sendMessage({ action: 'runAnalysis', tabId: tab.id }, (response) => {
          if (chrome.runtime.lastError || response.error) {
              console.error("Error during analysis:", chrome.runtime.lastError || response.error);
              isAnalyzing = false;
              progress = 0;
              renderAnalyzeTab();
              alert("An error occurred during analysis. Make sure you're on a valid webpage.");
              return;
          }

          // Update the data and render the results
          analysisData = response.data;
          entityCounts = response.entityCounts;
          normalizedEntityCounts = response.normalizedEntityCounts;
          pageTitle = response.pageTitle;
          pageUrl = response.pageUrl;
          totalSentences = response.totalSentences;
          isAnalyzing = false;
          progress = 100;
          renderAnalyzeTab();
      });

      // Set an interval to update the progress every second
      const progressInterval = setInterval(() => {
          chrome.storage.local.get(['processedSentences', 'totalSentences'], (result) => {
              if (result.totalSentences > 0) {
                  processedSentences = result.processedSentences || 0;
                  totalSentences = result.totalSentences;
                  progress = Math.min((processedSentences / totalSentences) * 100, 100);
                  renderAnalyzeTab();
              }

              // Clear interval if analysis is complete
              if (progress === 100) {
                  clearInterval(progressInterval);
              }
          });
      }, 1000);

  } catch (error) {
      console.error("Error during analysis:", error);
      isAnalyzing = false;
      progress = 0;
      renderAnalyzeTab();
      alert("An error occurred during analysis. Make sure you're on a valid webpage.");
  }
}




document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        pageTitle = currentTab.title;
        pageUrl = currentTab.url;
        renderTabs();
        renderAnalyzeTab();

        chrome.storage.local.get(['analysisData', 'entityCounts', 'normalizedEntityCounts', 'totalSentences', 'analysisTimestamp', 'pageTitle', 'pageUrl'], (result) => {
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
