console.log("HELLO! THE POPUP SCRIPT IS RUNNING!");
const API_KEY = "AIzaSyB6Op7DG8BsYcFHKW1f8za-pdtaSHT0KTk"; // Put your key here
const MODEL_NAME = "gemini-3-flash";   // The latest 2026 stable model

document.getElementById('sendBtn').addEventListener('click', async () => {
    const inputField = document.getElementById('userInput');
    const chatContainer = document.getElementById('chat-container');
    const userQuery = inputField.value;

    if (!userQuery) return;
    chatContainer.innerHTML += `<div><b>You:</b> ${userQuery}</div>`;
    inputField.value = "";

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 1. Ask content.js for the website data
        chrome.tabs.sendMessage(tab.id, { action: "get_page_data" }, async (response) => {
            if (chrome.runtime.lastError || !response) {
                chatContainer.innerHTML += `<div style="color:orange">AI: Please refresh the website you are on so I can see it.</div>`;
                return;
            }

            // 2. Prepare the request to Google Gemini
            const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
            
            const prompt = `You are an AI assistant on the website: ${response.title}. 
            Visible elements: ${JSON.stringify(response.elements)}. 
            User says: "${userQuery}".
            Provide a short answer or tell them which button to click.`;

            const apiRes = await fetch(apiURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await apiRes.json();

            // 3. Handle specific Google API errors
            if (data.error) {
                chatContainer.innerHTML += `<div style="color:red">Google Error: ${data.error.message}</div>`;
                return;
            }

            const aiResponse = data.candidates[0].content.parts[0].text;
            chatContainer.innerHTML += `<div><b>AI:</b> ${aiResponse}</div>`;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });

    } catch (error) {
        chatContainer.innerHTML += `<div style="color:red">System Error: Check your internet or API key.</div>`;
        console.error(error);
    }
});