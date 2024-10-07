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
    console.log("Parsing entities from:", nerOutput);
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
        // Ignore orphaned I- tags
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

    console.log("Parsed entities:", entities);
    console.log("Entity counts:", entityCounts);
    return { entities, entityCounts };
}

async function parseAspects(aspectsOutput) {
    // apply 0.5 threshold
    // we could setup individual thresholds for each aspect
    const aspects = {};
    for (const aspect of aspectsOutput) {
        if (aspect.score > 0.5) {
            aspects[aspect.label] = aspect.score;
        }
    }
    return aspects;
}
  
async function processSentence(sentence) {
    console.log("Processing sentence:", sentence);

    // run through binary classification model
    const binaryClassification = await makeApiCall(API_ENDPOINTS.binaryClassification, {
    "inputs": sentence
    });

    if (binaryClassification[0]?.label === "BIASED" && binaryClassification[0]?.score > 0.5) {
        
        // run through GUS-Net model
        const nerClassification = await makeApiCall(API_ENDPOINTS.nerClassification, {
            "inputs": sentence,
            "parameters": {
                "top_k": 2
            }
        });
        const { entities, entityCounts } = parseEntities(nerClassification);

        // run through aspects model
        const aspectsScores = await makeApiCall(API_ENDPOINTS.aspectsClassification, {
            "inputs": sentence,
            "parameters": {
                "top_k": 11
            }
        });
        const aspects = await parseAspects(aspectsScores);

        // assemble return dict for sentence
        const result = {
            sentence,
            biasScore: binaryClassification[0].score,
            entities: entities,
            entityCounts: entityCounts,
            aspects: aspects // list of dicts with aspect:score
        };

        console.log("Processed sentence result:", result);
        return result;
    }

    console.log("Sentence not biased");
    return null;
}
  
function normalizeEntityCounts(entityCounts, totalSentences) {
    const normalized = {};
    for (const [key, value] of Object.entries(entityCounts)) {
    normalized[key] = value / totalSentences;
    }
    return normalized;
}

async function analyzeText(text) {
    console.log("Analyzing text:", text);
    if (!text) return { results: [], entityCounts: { GEN: 0, UNFAIR: 0, STEREO: 0 }, normalizedEntityCounts: { GEN: 0, UNFAIR: 0, STEREO: 0 }, totalSentences: 0 };
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const totalSentences = sentences.length;
    const results = [];
    const totalEntityCounts = {
        GEN: 0,
        UNFAIR: 0,
        STEREO: 0
    };

    for (let sentence of sentences) {
        const result = await processSentence(sentence.trim());
        if (result) {
            results.push(result);
            Object.keys(result.entityCounts).forEach(key => {
                totalEntityCounts[key] += result.entityCounts[key];
            });
        }
    }

    console.log(totalSentences)

    const normalizedEntityCounts = normalizeEntityCounts(totalEntityCounts, totalSentences);

    console.log("Analysis results:", { results, totalEntityCounts, normalizedEntityCounts, totalSentences });
    return { results, entityCounts: totalEntityCounts, normalizedEntityCounts, totalSentences };
}


async function getPageText(tab) {
    if (chrome.scripting) {
    try {
        const [injectionResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText || document.body.textContent || ""
        });
        console.log("Got page text:", injectionResult.result);
        return injectionResult.result;
    } catch (error) {
        console.error("Error executing script:", error);
        throw error;
    }
    } else {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: "getText" }, response => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
        } else {
            console.log("Got page text:", response.text);
            resolve(response.text);
        }
        });
    });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runAnalysis") {
        console.log("Received runAnalysis request");
        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            const tab = tabs[0];
            try {
                const text = await getPageText(tab);
                const { results, entityCounts, normalizedEntityCounts, totalSentences } = await analyzeText(text);
                
                // Set the analysis data including total sentences
                chrome.storage.local.set({
                    analysisData: results,
                    entityCounts: entityCounts,
                    normalizedEntityCounts: normalizedEntityCounts,
                    totalSentences: totalSentences,  // Store total sentences here
                    analysisTimestamp: Date.now(),
                    pageTitle: tab.title,
                    pageUrl: tab.url,
                });
                
                console.log("Sending response:", { results, entityCounts, normalizedEntityCounts, pageTitle: tab.title, pageUrl: tab.url, totalSentences });
                sendResponse({
                    data: results,
                    entityCounts: entityCounts,
                    normalizedEntityCounts: normalizedEntityCounts,
                    pageTitle: tab.title,
                    pageUrl: tab.url,
                    totalSentences: totalSentences
                });
            } catch (error) {
                console.error("Error during analysis:", error);
                sendResponse({error: "An error occurred during analysis. Make sure you're on a web page."});
            }
        });
        return true; // Indicate async response
    }
});

chrome.alarms.create("cleanupAlarm", { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cleanupAlarm") {
    chrome.storage.local.get(["analysisTimestamp"], (result) => {
        if (result.analysisTimestamp && Date.now() - result.analysisTimestamp > 30 * 60 * 1000) {
        chrome.storage.local.remove(["analysisData", "entityCounts", "normalizedEntityCounts", "analysisTimestamp", "pageTitle", "pageUrl"]);
        }
    });
    }
});