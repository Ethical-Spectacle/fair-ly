import { createElement, highlightEntities, ENTITY_COLORS, LIGHT_ENTITY_COLORS, DARK_ENTITY_COLORS, ASPECT_COLORS, UI_COLORS, LIGHT_THEME_COLORS, DARK_THEME_COLORS, applyStyles } from './helpers.js';
import { createDonutChart, createCircularFillChart, createRadarChart, createMiniDonutChart } from './charts.js';

// global variables
let activeTab = 'analyze';
let analysisData = null;
let entityCounts = null;
let isAnalyzing = false;
let pageTitle = "";
let pageUrl = "";
let progress = 0;
let totalSentences = 0;
let processedSentences = 0;

// for switching tabs
export function setActiveTab(tab) {
	activeTab = tab;
	renderTabs();
	if (tab === "analyze") {
		renderAnalyzeTab();
	} else {
		renderExploreTab();
	}
}

// for dark and light mode switch
export function applyTheme(isDarkMode) {
	const themeColors = isDarkMode ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
	const entityColors = isDarkMode ? DARK_ENTITY_COLORS : LIGHT_ENTITY_COLORS;

	// Update ENTITY_COLORS props instead of reassigning the object
	Object.keys(entityColors).forEach(key => {
		ENTITY_COLORS[key] = entityColors[key];
	});

	// update the ui colors for the new theme (all colors in helpers.js)
	Object.keys(themeColors).forEach(key => {
		UI_COLORS[key] = themeColors[key];
	});

	// apply the color to the "Fair-ly" text
	const h1Element = document.querySelector("#root h1");
	if (h1Element) {
		h1Element.style.color = UI_COLORS["veryDarkColor"];
	}	
	// apply the new background color to the body (bc it's in popup.html)
	document.body.style.backgroundColor = UI_COLORS["veryLightColor"];

	// re-render the whole thang
	renderTabs();
	renderAnalyzeTab();
	renderExploreTab();
	setActiveTab(activeTab);
}

// helper function to get the top counted aspect
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

// render the tabs at the top of the popup
function renderTabs() {
	const tabButtons = document.getElementById("tab-buttons");
	tabButtons.innerHTML = "";
	applyStyles(tabButtons, {
		display: "flex",
		marginBottom: "10px",
		width: "40%",
		backgroundColor: UI_COLORS["tabContainerBG"],
		padding: "10px",
		margin: "15px 10px 30px 10px",
		borderRadius: "10px"
	});

	// can add more tabs here
	["analyze", "explore"].forEach((tab) => {
		const button = createElement("button", { onclick: () => setActiveTab(tab) },
			tab.charAt(0).toUpperCase() + tab.slice(1)
		);

		applyStyles(button, {
			padding: '10px 15px',
			border: 'none',
			borderRadius: '10px',
			backgroundColor: activeTab === tab ? UI_COLORS["activeTabBG"] : UI_COLORS["inactiveTabBG"],
			color: activeTab === tab ? UI_COLORS['strongText'] : UI_COLORS['weakText'],
			fontSize: '16px',
			fontWeight: 'bold',
			cursor: 'pointer',
			width: '50%'
		});

		tabButtons.appendChild(button);
	});
}

// ------------------------------------ ANALYZE TAB (default) ------------------------------------ //
function renderAnalyzeTab() {
	// renders in content div of popup.html
	const content = document.getElementById('content');
	content.innerHTML = '';
	applyStyles(content, {
		width: '500px',
		textAlign: 'center',
		padding: '0 15px 0px 15px',
		boxSizing: 'border-box',
		margin: '0 auto'
	});

	////////////////// UNSEEN PAGE //////////////////// if user is on a page that hasn't been analyzed in the last 30mins
	if (!analysisData && !isAnalyzing) {
		// button to run analysis
		const button = createElement(
			"button",
			{ onclick: runAnalysis },
			`📊 Run Bias Analysis on "${pageTitle || "current page"}"`
		);
		// Run button styles
		applyStyles(button, {
			padding: "20px 30px",
			backgroundColor: UI_COLORS["sortaLightColor"],
			color: UI_COLORS["veryDarkColor"],
			border: "none",
			borderRadius: "10px",
			cursor: "pointer",
			transition: "background-color 0.3s ease",
			margin: "30px"
		});

		content.appendChild(button);

	/////////////////// PROGRESS BAR /////////////////
	} else if (isAnalyzing) {
		// progress text
		const paragraph = createElement(
			"p", {},
			`${processedSentences} of ${totalSentences} sentences processed.`
		);
		// progress text styles
		applyStyles(paragraph, {
			color: UI_COLORS["sortaDarkColor"],
			fontSize: "14pt",
			textAlign: "center",
			marginBottom: "10px"
		});
		content.appendChild(paragraph);

		// progress bar bg
		const progressBar = createElement("div", {});
		applyStyles(progressBar, {
			width: "100%",
			backgroundColor: UI_COLORS["sortaLightColor"],
			borderRadius: "5px",
			overflow: "hidden",
			height: "30px",
			marginBottom: "1.5rem"
		});

		// progress bar fill
		const progressFill = createElement("div", {});
		applyStyles(progressFill, {
			height: "100%",
			backgroundColor: UI_COLORS["progressBarBG"],
			width: `${progress}%`,
			transition: "width 0.3s ease"
		});
		progressBar.appendChild(progressFill);

		content.appendChild(progressBar);

	//////////////////// DATA AVAILABLE ////////////////////
	} else if (analysisData && analysisData.length > 0) {
		// show the tabs (hidden by default)
		const tabButtons = document.getElementById("tab-buttons");
		if (tabButtons) {
			tabButtons.style.display = "flex";
		}

		//---------------------------------------------------------//
		////////////////// start of hero card //////////////////

		// container for hero chart and summary
		const analysisSummaryContainer = createElement("div", {});
		applyStyles(analysisSummaryContainer, {
			display: 'flex',
			alignItems: 'start',
			justifyContent: 'space-around',
			width: '100%',
			padding: '20px 10px',
			border: `1px solid ${UI_COLORS['sortaLightColor']}`,
			borderRadius: '10px',
			backgroundColor: UI_COLORS["cardBG"],
			boxShadow: '0 1px 2px rrgba(0, 0, 0, 0.1)',
			transition: 'box-shadow 0.3s ease',
			marginBottom: '15px',
			boxSizing: 'border-box'
		});

		// card shadow annimation (only really visible in light mode)
		analysisSummaryContainer.onmouseover = () => {
			analysisSummaryContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)';
		};
		analysisSummaryContainer.onmouseout = () => {
			analysisSummaryContainer.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
		};

		// Fair-ly Score Chart
		// This will be a "Fairness Score" not a biased score.
		// I want to add a custom function (will need to declare it in the docs)
		// for now it's just the percent of sentences that are biased (backwards)
		const biasScoreCanvas = document.createElement('canvas');
		biasScoreCanvas.id = 'biasScoreChart';
		// bias score chart styles
		applyStyles(biasScoreCanvas, {
			display: 'block',
			maxWidth: "200px",
			height: "200px"
		});
		analysisSummaryContainer.appendChild(biasScoreCanvas);

		// 2 sentence summary of the page's bias
		const summaryStats = createElement('div', {});
		const numBiasedSentences = analysisData.length;
		const biasedPercentage = Math.round((numBiasedSentences / totalSentences) * 100);
		applyStyles(summaryStats, {
			color: UI_COLORS['veryDarkColor'],
			textAlign: 'left',
			fontSize: '16pt',
			lineHeight: '1.5',
			marginLeft: '10px',
			flexGrow: 1 // summary text fills the space next to the chart
		});

		// summary text
		const statsText = `
			<p><strong>${numBiasedSentences}</strong> of ${totalSentences} sentences were classified as biased.</p>
			<p>Take <strong>${getTopCountedAspect()}</strong> statements with a grain of salt.</p>
		`;
		summaryStats.innerHTML = statsText;
		analysisSummaryContainer.appendChild(summaryStats);

		// add while summary container to the content
		content.appendChild(analysisSummaryContainer);

		////////////////// end of hero card //////////////////
		//---------------------------------------------------------//
		////////////////// start of entity cards //////////////////

		// add entity charts containers
		const entityChartsContainer = createElement('div', {});
		applyStyles(entityChartsContainer, {
			display: 'flex',
			justifyContent: 'space-between',
			margin: '15px 0',
			flexWrap: 'wrap',
			width: '100%'
		});

		// parse data into list of dicts for entity charts
		const entities = [
			{ id: 'genChart', label: 'Generalizations', color: ENTITY_COLORS['GEN'], count: entityCounts['GEN'] },
			{ id: 'unfairChart', label: 'Unfairness', color: ENTITY_COLORS['UNFAIR'], count: entityCounts['UNFAIR'] },
			{ id: 'stereoChart', label: 'Stereotypes', color: ENTITY_COLORS['STEREO'], count: entityCounts['STEREO'] }
		];

		// make a chart for each item in the list
		entities.forEach(({ id, label, color, count }) => {
			// container for each chart and text
			const canvasContainer = createElement("div", {});
			applyStyles(canvasContainer, {
				width: '31%',
				padding: '10px 10px 0px 10px',
				border: `1px solid ${UI_COLORS['sortaLightColor']}`,
				borderRadius: '10px',
				backgroundColor: UI_COLORS["cardBG"],
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center'
			});

			// had to make this because they were going really tall and couldn't control it
			const canvasWrapper = createElement("div", {});
			applyStyles(canvasWrapper, {
				position: 'relative',
				width: '100%',
				paddingBottom: '50%'
			});

			// create the canvas to hold the chart
			const canvas = document.createElement('canvas');
			canvas.id = id;
			applyStyles(canvas, {
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			});
			canvasWrapper.appendChild(canvas);
			canvasContainer.appendChild(canvasWrapper);

			// entity text
			const labelElement = createElement('p', {}, label);
			applyStyles(labelElement, {
				marginTop: '7px',
				fontWeight: 'bold',
				fontSize: '14px',
				color: UI_COLORS['strongText'],
				textAlign: 'center'
			});
			canvasContainer.appendChild(labelElement);

			// card shadow annimation (only really visible in light mode)
			canvasContainer.onmouseover = () => {
				canvasContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
			};
			canvasContainer.onmouseout = () => {
				canvasContainer.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
			};

			entityChartsContainer.appendChild(canvasContainer);
		});

		content.appendChild(entityChartsContainer);

		//////////////// end of entity cards /////////////////
		//---------------------------------------------------------//
		//////////////// start of aspects radar chart /////////////////

		// create container to hold aspects radar chart
		const radarChartContainer = createElement("div", {});
		applyStyles(radarChartContainer, {
			padding: '10px',
			border: `1px solid ${UI_COLORS['sortaLightColor']}`,
			borderRadius: '10px',
			backgroundColor: UI_COLORS["cardBG"],
			boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
			transition: 'box-shadow 0.3s ease',
			marginBottom: '15px',
			width: '100%',
			boxSizing: 'border-box',
			height: '300px'
		});

		const radarCanvas = document.createElement('canvas');
		radarCanvas.id = 'aspectsChart';
		applyStyles(radarCanvas, {
			display: 'flex',
			width: '100%'
		});
		radarChartContainer.appendChild(radarCanvas);
		content.appendChild(radarChartContainer);

		// card shadow annimation (only really visible in light mode)
		radarChartContainer.onmouseover = () => {
			radarChartContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
		};
		radarChartContainer.onmouseout = () => {
			radarChartContainer.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
		};

		////////////// end of aspects radar chart /////////////////
		//---------------------------------------------------------//
		////////////// start of rendering the charts (functions in charts.js) /////////////////

		// render hero score chart
		createDonutChart('biasScoreChart', numBiasedSentences, totalSentences, ['#ff6164', '#A2E09B']);

		// render entity charts
		entities.forEach(({ id, label, color, count }) => {
			createCircularFillChart(id, count, numBiasedSentences, count, color);
		});

		// render aspects radar chart
		// count the aspect occurrences
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

		// create the data for the radar chart
		const aspectsData = Object.entries(aspectCounts).map(([aspect, count]) => ({
			aspect: aspect,
			value: count,
			color: ASPECT_COLORS[aspect] || '#000000'
		}));

		createRadarChart('aspectsChart', aspectsData);

		////////////// end of rendering the charts /////////////////
		//---------------------------------------------------------//

	} else {
		const paragraph = createElement('p', {}, "No analysis data available or an error occurred.");
		applyStyles(paragraph, { textAlign: 'center', marginBottom: '1rem' });
		content.appendChild(paragraph);
	}
}

// ------------------------------------ EXPLORE TAB ------------------------------------ //
// render the explore tab with delete buttons// render the explore tab with delete buttons
// render the explore tab with delete buttons
function renderExploreTab() {
	const content = document.getElementById("content");
	content.innerHTML = "";

	// redundant check for analysis data
	if (!analysisData || analysisData.length === 0) {
		const paragraph = createElement(
			"p", {},
			"No analysis data available. Please run an analysis first."
		);
		applyStyles(paragraph, { textAlign: "center" });
		content.appendChild(paragraph);
		return;
	}

	// render the cards
	try {
		// sort the data by biasScore (descending)
		const sortedData = [...analysisData].sort(
			(a, b) => b.biasScore - a.biasScore
		);

		// list to hold the cards
		const list = createElement("ul", {});
		applyStyles(list, {
			listStyleType: "none",
			padding: "0",
			margin: "0"
		});

		// create a card for each item in the list
		sortedData.forEach((item, index) => {
			const listItem = createElement('li', { id: `sentence-card-${index}` });
			applyStyles(listItem, {
				padding: '15px',
				border: `1px solid ${UI_COLORS['sortaLightColor']}`,
				borderRadius: '10px',
				backgroundColor: UI_COLORS["cardBG"],
				boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
				transition: 'box-shadow 0.3s ease',
				marginBottom: '15px',
				position: 'relative',
				overflow: 'hidden'
			});

			// card shadow animation (only really visible in light mode)
			listItem.onmouseover = () => {
				listItem.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
			};
			listItem.onmouseout = () => {
				listItem.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
			};

			if (item.sentence) {
				// parse sentence onto the card
				const highlightedSentence = highlightEntities(item.sentence, item.entities);
				const sentenceElem = createElement("p", {});
				applyStyles(sentenceElem, {
					color: UI_COLORS['sortaDarkColor'],
					marginBottom: "5px",
					fontSize: "14pt",
					lineHeight: "1.25"
				});
				sentenceElem.innerHTML = highlightedSentence;
				listItem.appendChild(sentenceElem);

				// delete button for misclassifications
				const deleteButton = createElement("button", { onclick: () => deleteSentence(item) }, "Not Biased");
				applyStyles(deleteButton, {
					padding: "10px",
					backgroundColor: "#ff4d4d",
					color: "#fff",
					border: "none",
					borderRadius: "5px",
					cursor: "pointer",
					fontSize: "12px",
					position: "absolute",
					bottom: "10px",
					right: "10px",
					width: "auto",
					height: "auto",
					zIndex: "10"
				});				
				listItem.appendChild(deleteButton);

				// container for bias score donut and aspect tags
				const tagsAndMiniChartContainer = createElement('div', {});
				applyStyles(tagsAndMiniChartContainer, {
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'left',
					marginTop: '10px',
					position: 'relative',
					gap: '5px'
				});

				// create container for aspect tags
				const aspectsContainer = createElement('div', {});
				applyStyles(aspectsContainer, {
					display: 'flex',
					flexWrap: 'wrap',
					gap: '5px'
				});

				// display any scores over 0.5
				Object.keys(item.aspects).forEach(aspect => {
					const scores = item.aspects[aspect];
					scores.forEach(score => {
						// create tag for the aspect
						const aspectTag = createElement('span', {}, `${aspect}: ${100 * score.toFixed(2)}%`);
						applyStyles(aspectTag, {
							backgroundColor: ASPECT_COLORS[aspect] || '#ccc',
							color: "#000000",
							padding: '8px 10px 5px 10px',
							borderRadius: '5px',
							fontSize: '12px'
						});
						aspectsContainer.appendChild(aspectTag);
					});
				});

				// mini donut for the bias score
				const miniDonutCanvas = createElement('canvas', { id: `mini-donut-${index}` });
				applyStyles(miniDonutCanvas, {
					width: '30px',
					height: '30px'
				});

				// append the mini donut and aspect tags to the card
				tagsAndMiniChartContainer.appendChild(miniDonutCanvas);
				tagsAndMiniChartContainer.appendChild(aspectsContainer);

				// append the mini donut and aspect tags to the card
				listItem.appendChild(tagsAndMiniChartContainer);
				// add the card to the list
				list.appendChild(listItem);

				// render the mini donut charts
				setTimeout(() => {
					const donutElement = document.getElementById(`mini-donut-${index}`);
					if (donutElement) {
						createMiniDonutChart(`mini-donut-${index}`, item.biasScore);
					}
				}, 0);

			} else {
				const errorElem = createElement("p", {}, "Error: Missing sentence");
				applyStyles(errorElem, {
					marginBottom: "10px",
					color: "#f87171"
				});
				listItem.appendChild(errorElem);
			}
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


// for deleting sentences in the explore tab
function deleteSentence(sentenceToDelete) {
	// remove from analysisData list
	analysisData = analysisData.filter(item => item !== sentenceToDelete);

	// update the entity counts (calculated based on analysis data so not automatic)
	updateEntityCounts();

	// update it in local storage so it's still there if the popup is closed
	chrome.storage.local.set({
		analysisData: analysisData,
		entityCounts: entityCounts
	}, () => {
		// rerender the tabs with the new data
		renderExploreTab();
	//	renderAnalyzeTab(); // redundant
	});
}

// updating the entity counts after deletion
function updateEntityCounts() {
    // init counts at 0
    entityCounts = {
        GEN: 0,
        UNFAIR: 0,
        STEREO: 0
    };

    // recalculate counts
    analysisData.forEach((item) => {
        if (item.entities && typeof item.entities === 'object') {
            Object.keys(item.entities).forEach((entityType) => {
                if (Array.isArray(item.entities[entityType])) {
                    entityCounts[entityType] += item.entities[entityType].length; // I'd rather count B- tags instead of the full number of tokens
                }
            });
        }
    });
}




// ------------------------------------ ANALYSIS FUNCTION ------------------------------------ // communicates with background.js to run the analysis
async function runAnalysis() {
	isAnalyzing = true;
	progress = 0;
	processedSentences = 0;

	try {
		// get the content from the active tab
		const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

		// send message to background.js to start the analysis (runs there for efficiency)
		chrome.runtime.sendMessage({ action: 'runAnalysis', tabId: tab.id }, (response) => {
			if (chrome.runtime.lastError || response.error) {
				console.error("Error during analysis:", chrome.runtime.lastError || response.error);
				isAnalyzing = false;
				progress = 0;
				renderAnalyzeTab();
				alert("An error occurred during analysis. Make sure you're on a valid webpage.");
				return;
			}

			// update the data and render the results
			analysisData = response.data;
			entityCounts = response.entityCounts;
			pageTitle = response.pageTitle;
			pageUrl = response.pageUrl;
			totalSentences = response.totalSentences;
			isAnalyzing = false;
			progress = 100;
			renderAnalyzeTab();
		});

		// runs every second to update the progress bar
		const progressInterval = setInterval(() => {
			chrome.storage.local.get(['processedSentences', 'totalSentences'], (result) => {
				if (result.totalSentences > 0) {
					processedSentences = result.processedSentences || 0;
					totalSentences = result.totalSentences;
					progress = Math.min((processedSentences / totalSentences) * 100, 100);
					renderAnalyzeTab();
				}

				// clear it when done
				if (progress === 100) { clearInterval(progressInterval); }
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

// ------------------------------------ EVENT LISTENERS ------------------------------------ //
// event listener for when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const currentTab = tabs[0];
		pageTitle = currentTab.title;
		pageUrl = currentTab.url;
		renderAnalyzeTab();
		renderTabs();

		chrome.storage.local.get(['analysisData', 'entityCounts', 'totalSentences', 'analysisTimestamp', 'pageTitle', 'pageUrl'], (result) => {
			if (result.analysisData &&
				result.pageUrl === pageUrl &&
				Date.now() - result.analysisTimestamp < 30 * 60 * 1000) {
				analysisData = result.analysisData;
				entityCounts = result.entityCounts;
				pageTitle = result.pageTitle;
				totalSentences = result.totalSentences;
				renderAnalyzeTab();
			}
		});
	});
});

// event listener for when the theme toggle is changed
document.getElementById('theme-toggle').addEventListener('change', (event) => {
	const isDarkMode = event.target.checked;
	applyTheme(isDarkMode);
	chrome.storage.local.set({ theme: isDarkMode ? 'dark' : 'light' });
});

// load saved theme from local storage
chrome.storage.local.get(['theme'], (result) => {
	const isDarkMode = result.theme === 'dark';
	const themeToggle = document.getElementById('theme-toggle');
	if (themeToggle) {
		themeToggle.checked = isDarkMode;
	}
	applyTheme(isDarkMode);
});