// background.js
const API_KEY = "";
const MODEL = "gemini-1.5-flash"; // Switch to 1.5 for better free-tier luck

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "call_ai") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
        
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: request.prompt }] }] })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                sendResponse({ success: false, error: "QUOTA_LIMIT" });
            } else if (data.candidates && data.candidates[0]) {
                sendResponse({ success: true, text: data.candidates[0].content.parts[0].text });
            } else {
                sendResponse({ success: false, error: "UNKNOWN" });
            }
        })
        .catch(() => sendResponse({ success: false, error: "NETWORK" }));
        return true; 
    }

});
