/**
 * UNIVERSAL AI AGENT PRO - 2026 HACKATHON EDITION
 * Features: Floating UI, Multi-Page Persistence, Hybrid AI/Local Reasoning, 
 * Actions: Auto-Click, Auto-Type, and Red-Highlighting.
 */

console.log("AI Agent: Eyes and Hands are active.");

// --- 1. UI INJECTION (Floating FAB + Sidebar) ---
function injectAgentUI() {
    if (document.getElementById('ai-agent-root')) return;

    const root = document.createElement('div');
    root.id = 'ai-agent-root';
    root.innerHTML = `
        <div id="ai-fab-logo" style="position:fixed; bottom:20px; right:20px; width:65px; height:65px; background:#007bff; border-radius:50%; cursor:pointer; z-index:2147483647; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(0,0,0,0.4); font-size:35px;">🤖</div>
        
        <div id="ai-sidebar" style="position:fixed; top:0; right:-400px; width:380px; height:100vh; background:white; z-index:2147483646; box-shadow:-5px 0 25px rgba(0,0,0,0.2); transition: right 0.4s ease; display:flex; flex-direction:column; font-family: 'Segoe UI', Tahoma, sans-serif; border-left:1px solid #ddd;">
            <div style="background:#007bff; color:white; padding:20px; font-weight:bold; font-size:18px; display:flex; justify-content:space-between; align-items:center;">
                <span>AI Agent Workspace</span>
                <span id="ai-close-sidebar" style="cursor:pointer; font-size:24px;">✕</span>
            </div>
            
            <div id="ai-chat-body" style="flex:1; padding:15px; overflow-y:auto; background:#f4f7f6; display:flex; flex-direction:column; gap:12px; font-size:14px;">
                <div style="background:white; padding:10px; border-radius:10px; border:1px solid #eee; color:#333;">
                    <b>Agent:</b> I am ready to navigate. Type your goal (e.g., "Create a Gmail account").
                </div>
            </div>

            <div style="padding:20px; background:white; border-top:1px solid #eee;">
                <textarea id="ai-input-text" placeholder="Type your goal here..." style="width:100%; height:70px; padding:10px; border:1px solid #ddd; border-radius:8px; resize:none; outline:none; box-sizing:border-box; margin-bottom:10px; font-family:inherit;"></textarea>
                <button id="ai-execute-btn" style="width:100%; padding:12px; background:#007bff; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.3s;">START NAVIGATION</button>
                <button id="ai-reset-btn" style="width:100%; margin-top:10px; background:none; border:none; color:#dc3545; font-size:12px; cursor:pointer; text-decoration:underline;">Stop & Clear Goal</button>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // Toggle Logic
    const sidebar = document.getElementById('ai-sidebar');
    const logo = document.getElementById('ai-fab-logo');
    
    logo.onclick = () => { sidebar.style.right = '0'; };
    document.getElementById('ai-close-sidebar').onclick = () => { sidebar.style.right = '-400px'; };
    
    // Action Logic
    document.getElementById('ai-execute-btn').onclick = () => {
        const goal = document.getElementById('ai-input-text').value.trim();
        if (goal) {
            chrome.storage.local.set({ "activeGoal": goal }, () => {
                location.reload(); // Refresh triggers the automation
            });
        }
    };

    document.getElementById('ai-reset-btn').onclick = () => {
        chrome.storage.local.remove(['activeGoal'], () => location.reload());
    };
}

// --- 2. LOGGING LOGIC ---
function addLog(role, text, color = "#333") {
    const body = document.getElementById('ai-chat-body');
    if (!body) return;
    const msg = document.createElement('div');
    const isUser = role === "You";
    msg.style.cssText = `padding:10px; border-radius:10px; font-size:13px; line-height:1.5; ${isUser ? 'align-self:flex-end; background:#007bff; color:white;' : 'align-self:flex-start; background:white; border:1px solid #eee; color:' + color}`;
    msg.innerHTML = `<b>${role}:</b> ${text}`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
}

// --- 3. THE HYBRID BRAIN (AI + LOCAL FALLBACK) ---
async function runStep(goal) {
    console.log("Agent processing goal:", goal);
    
    // Capture all visible interactive elements
    const rawEls = Array.from(document.querySelectorAll('button, a, input, [role="button"], [onclick]'))
        .filter(el => el.getBoundingClientRect().width > 0);

    const elements = rawEls.map((el, i) => ({
        index: i,
        text: (el.innerText || el.value || el.placeholder || "Item").toLowerCase().trim().substring(0, 35),
    })).filter(e => e.text.length > 0).slice(0, 70);

    // Define the AI Prompt
    const prompt = `Goal: "${goal}". Current Page: "${document.title}". 
    Interactive Elements: ${JSON.stringify(elements)}.
    Rules:
    - To navigate: ACTION: CLICK [Index] REASON: [Sentence]
    - To enter data (Name, Search, Email): ACTION: HIGHLIGHT [Index] REASON: [Instructions]
    Format strictly: ACTION: [Type] [Index] REASON: [Description]`;

    // Try calling the Cloud API (Background.js)
    chrome.runtime.sendMessage({ action: "call_ai", prompt: prompt, goal: goal }, (response) => {
        if (response && response.success) {
            processAction(response.text, rawEls);
        } else {
            // IF API FAILS (Quota 0) -> ACTIVATE LOCAL HEURISTIC ENGINE
            addLog("System", "⚠️ Cloud AI Throttled. Switching to Local Semantic Reasoning...", "orange");
            performLocalLogic(goal, elements, rawEls);
        }
    });
}

// --- 4. ACTION EXECUTION (The Hands) ---
function processAction(aiText, rawEls) {
    addLog("Agent", aiText);
    
    const match = aiText.match(/(CLICK|HIGHLIGHT|TYPE)\s*(\d+)/);
    if (match) {
        const actionType = match[1];
        const index = parseInt(match[2]);
        const target = rawEls[index];

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            if (actionType === "CLICK") {
                target.style.outline = "5px solid #007bff";
                target.style.boxShadow = "0 0 15px #007bff";
                setTimeout(() => target.click(), 2000);
            } else {
                // HIGHLIGHT or TYPE
                target.style.outline = "5px solid #dc3545";
                target.style.boxShadow = "0 0 20px #dc3545";
            }
        }
    }
}

// --- 5. LOCAL SMART SEARCH (Emergency Demo Saver) ---
function performLocalLogic(goal, elements, rawEls) {
    const goalLower = goal.toLowerCase();
    
    // Logic: Look for exact goal match first, then navigation keywords
    const navKeywords = ["next", "create", "account", "personal", "sign", "continue", "agree", "accept", "submit"];
    
    let targetMatch = elements.find(el => el.text.includes(goalLower));
    
    if (!targetMatch) {
        targetMatch = elements.find(el => navKeywords.some(k => el.text.includes(k)));
    }

    if (targetMatch) {
        const el = rawEls[targetMatch.index];
        addLog("Agent", `(Local Mode) Target Identified: "${targetMatch.text}". Executing action...`, "#28a745");
        
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = "5px solid #28a745";
        
        // If it's a text input, just highlight it; if it's a button/link, click it
        if (el.tagName === "INPUT" && (el.type === "text" || el.type === "email")) {
            el.style.boxShadow = "0 0 20px #dc3545";
            addLog("System", "Input field detected. Please enter details to proceed.", "#dc3545");
        } else {
            setTimeout(() => el.click(), 2000);
        }
    } else {
        addLog("Agent", "I am scanning the page. Please manually click the next step if I missed it.");
    }
}

// --- 6. INITIALIZATION ---
injectAgentUI();

chrome.storage.local.get(['activeGoal'], (data) => {
    if (data.activeGoal) {
        // Open the workspace and show progress
        const sidebar = document.getElementById('ai-sidebar');
        if (sidebar) sidebar.style.right = '0';
        
        addLog("System", "Resuming active goal: " + data.activeGoal, "#007bff");
        
        // Wait for page to finish rendering
        setTimeout(() => {
            runStep(data.activeGoal);
        }, 2500);
    }
});

// Watch for storage changes (to support multi-tab synchronization)
chrome.storage.onChanged.addListener((changes) => {
    if (changes.activeGoal && changes.activeGoal.newValue) {
        location.reload();
    }
});
