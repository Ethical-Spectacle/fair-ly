const API_ENDPOINTS = {
    binaryClassification: "https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud",
    nerClassification: "https://mo5fr3ll9qufbwuy.us-east-1.aws.endpoints.huggingface.cloud",
    aspectsClassification: "https://t41xs75wejr14zht.us-east-1.aws.endpoints.huggingface.cloud"
};

async function makeApiCall(endpoint, data) {
    console.log(`Making API call to ${endpoint}`, data);
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log(`API response:`, result);
    return result;
}

function parseEntities(nerOutput) {
    if (!Array.isArray(nerOutput)) {
        console.error("Unexpected NER output format:", nerOutput);
        return { entities: [], entityCounts: { GEN: 0, UNFAIR: 0, STEREO: 0 } };
    }

    const entities = {
        GEN: [],
        UNFAIR: [],
        STEREO: []
    };
    const entityCounts = {
        GEN: 0,
        UNFAIR: 0,
        STEREO: 0
    };

    let currentEntity = null;

    nerOutput.forEach((token, index) => {
        const labels = Array.isArray(token.labels) ? token.labels : [token.labels];

        labels.forEach(label => {
            if (typeof label !== 'string') {
                console.error("Unexpected label format:", label);
                return;
            }

            if (label.startsWith('B-')) {
                if (currentEntity) {
                    entities[currentEntity.type].push(currentEntity);
                    entityCounts[currentEntity.type]++;
                }
                currentEntity = {
                    type: label.slice(2),
                    words: [{ word: token.token, index }],
                    count: 1
                };
            } else if (label.startsWith('I-') && currentEntity && label.slice(2) === currentEntity.type) {
                currentEntity.words.push({ word: token.token, index });
                currentEntity.count++;
            } else if (label.startsWith('I-') && (!currentEntity || label.slice(2) !== currentEntity.type)) {
                console.log("Ignoring orphaned I- tag:", token);
            } else if (currentEntity) {
                entities[currentEntity.type].push(currentEntity);
                entityCounts[currentEntity.type]++;
                currentEntity = null;
            }
        });
    });

    if (currentEntity) {
        entities[currentEntity.type].push(currentEntity);
        entityCounts[currentEntity.type]++;
    }

    return { entities, entityCounts };
}

async function parseAspects(aspectsOutput) {
    const aspects = {};
    for (const aspect of aspectsOutput) {
        if (aspect.score > 0.5) {
            if (!aspects[aspect.label]) {
                aspects[aspect.label] = []; 
            }
            aspects[aspect.label].push(aspect.score); 
        }
    }
    return aspects;
}

async function processSentence(sentence) {
    console.log("Processing sentence:", sentence);

    const binaryClassification = await makeApiCall(API_ENDPOINTS.binaryClassification, {
        "inputs": sentence
    });

    if (binaryClassification[0]?.label === "BIASED" && binaryClassification[0]?.score > 0.5) {
        const nerClassification = await makeApiCall(API_ENDPOINTS.nerClassification, {
            "inputs": sentence,
            "parameters": {
                "top_k": 2
            }
        });
        const { entities, entityCounts } = parseEntities(nerClassification);

        const aspectsScores = await makeApiCall(API_ENDPOINTS.aspectsClassification, {
            "inputs": sentence,
            "parameters": {
                "top_k": 11
            }
        });
        const aspects = await parseAspects(aspectsScores);

        return {
            sentence,
            biasScore: binaryClassification[0].score,
            entities: entities,
            entityCounts: entityCounts,
            aspects: aspects
        };
    }

    return null;
}

async function analyzeText(text, sendResponse) {
    console.log("Analyzing text:", text);
    if (!text) return sendResponse({ error: "No text found for analysis." });

    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const totalSentences = sentences.length;
    const results = [];
    const totalEntityCounts = {
        GEN: 0,
        UNFAIR: 0,
        STEREO: 0
    };

    let processedSentences = 0;

    for (let sentence of sentences) {
        const result = await processSentence(sentence.trim());
        if (result) {
            results.push(result);
            Object.keys(result.entityCounts).forEach(key => {
                totalEntityCounts[key] += result.entityCounts[key];
            });
        }
        processedSentences++;

        // Update progress
        chrome.runtime.sendMessage({
            action: 'updateProgress',
            progress: Math.round((processedSentences / totalSentences) * 100),
            processedSentences,
            totalSentences
        });
    }

    chrome.storage.local.set({
        analysisData: results,
        entityCounts: totalEntityCounts,
        totalSentences: totalSentences,
        analysisTimestamp: Date.now(),
    });

    sendResponse({
        data: results,
        entityCounts: totalEntityCounts,
        totalSentences: totalSentences
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runAnalysis") {
        console.log("Received runAnalysis request");
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            try {
                const text = await getPageText(tab);
                analyzeText(text, sendResponse);
            } catch (error) {
                console.error("Error during analysis:", error);
                sendResponse({ error: "An error occurred during analysis. Make sure you're on a web page." });
            }
        });
        return true; // Indicate async response
    }
});

async function getPageText(tab) {
    if (chrome.scripting) {
        try {
            const [injectionResult] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText || document.body.textContent || ""
            });
            return injectionResult.result;
        } catch (error) {
            console.error("Error executing script:", error);
            throw error;
        }
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageText') {
        const tabId = request.tabId;
        getPageText({ id: tabId }).then((text) => {
            sendResponse({ text });
        }).catch((error) => {
            console.error("Error getting page text:", error);
            sendResponse({ error: error.message });
        });
        return true; // Indicate that response is asynchronous
    }

    if (request.action === "runAnalysis") {
        console.log("Received runAnalysis request");
        const tabId = request.tabId;

        getPageText({ id: tabId }).then(async (text) => {
            const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
            const totalSentences = sentences.length;
            let processedSentences = 0;

            const results = [];
            const totalEntityCounts = {
                GEN: 0,
                UNFAIR: 0,
                STEREO: 0,
            };

            // Set total sentences in storage
            chrome.storage.local.set({ totalSentences, processedSentences });

            for (let i = 0; i < sentences.length; i++) {
                const sentence = sentences[i].trim();
                const result = await processSentence(sentence);
                if (result) {
                    results.push(result);
                    Object.keys(result.entityCounts).forEach((key) => {
                        totalEntityCounts[key] += result.entityCounts[key];
                    });
                }
                processedSentences++;

                // Update progress in local storage
                chrome.storage.local.set({ processedSentences });
            }

            // Get tab information to save analysis data
            chrome.tabs.get(tabId, (tab) => {
                if (chrome.runtime.lastError || !tab) {
                    console.error("Error getting tab information:", chrome.runtime.lastError);
                    sendResponse({ error: "Failed to get tab information." });
                    return;
                }

                // Store the analysis data
                chrome.storage.local.set({
                    analysisData: results,
                    entityCounts: totalEntityCounts,
                    totalSentences: totalSentences,
                    analysisTimestamp: Date.now(),
                    pageTitle: tab.title,
                    pageUrl: tab.url,
                });

                console.log("Analysis complete. Sending response.");

                // Send response back to popup.js
                sendResponse({
                    data: results,
                    entityCounts: totalEntityCounts,
                    pageTitle: tab.title,
                    pageUrl: tab.url,
                    totalSentences: totalSentences
                });
            });

        }).catch((error) => {
            console.error("Error during analysis:", error);
            sendResponse({ error: "An error occurred during analysis. Make sure you're on a web page." });
        });

        return true; // Indicate async response
    }
});



chrome.alarms.create("cleanupAlarm", { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cleanupAlarm") {
        chrome.storage.local.get(["analysisTimestamp"], (result) => {
            if (result.analysisTimestamp && Date.now() - result.analysisTimestamp > 30 * 60 * 1000) {
                chrome.storage.local.remove(["analysisData", "entityCounts", "analysisTimestamp"]);
            }
        });
    }
});
