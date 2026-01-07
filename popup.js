
const API_KEY = "AIzaSyB6Op7DG8BsYcFHKW1f8za-pdtaSHT0KTk"; // Put your key here
const MODEL = "gemini-3-flash-preview";    // The latest 2026 stable model

document.getElementById('sendBtn').addEventListener('click', async () => {
    const chat = document.getElementById('chat-container');
    const input = document.getElementById('userInput');
    const query = input.value;

    if (!query) return;

     try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 2. Get data from the website (Title and Buttons)
        chrome.tabs.sendMessage(tab.id, { action: "get_page_data" }, async (response) => {
            if (chrome.runtime.lastError || !response) {
                chat.innerHTML += `<div style="color:orange">AI: Please refresh the website page!</div>`;
                return;
            }

            console.log("Sending website data to Gemini...");

            // 3. The Prompt - Tell Gemini what the page looks like
            const prompt = `You are a helpful web assistant.
            The user is looking at this website: ${response.title}
            The clickable elements are: ${JSON.stringify(response.elements)}
            User Question: "${query}"
            
            Answer the user's question based on the website content. If they want to find something, tell them which button to click.`;

            // 4. The API Call
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
            
            const apiRes = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await apiRes.json();
            console.log("Response from Google:", data);

            // 5. Check if Google sent an error
            if (data.error) {
                chat.innerHTML += `<div style="color:red">AI Error: ${data.error.message}</div>`;
                return;
            }

            // 6. Show the AI's response
            const aiText = data.candidates[0].content.parts[0].text;
            chat.innerHTML += `<div style="margin-bottom:10px; color:green;"><b>AI:</b> ${aiText}</div>`;
            chat.scrollTop = chat.scrollHeight; // Scroll to bottom
        });

    } catch (e) {
        console.error("Critical System Error:", e);
        chat.innerHTML += `<div style="color:red">System Error: Check the Console!</div>`;
    }
});

