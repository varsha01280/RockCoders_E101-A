// This function scans the website for clickable items
function getClickableElements() {
    const clickable = [];
    // We look for buttons and links
    const elements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
    
    elements.forEach((el, index) => {
        const text = el.innerText || el.value || el.ariaLabel || "";
        if (text.trim().length > 0 && el.offsetParent !== null) { // Only visible items
            clickable.push({
                index: index,
                tagName: el.tagName,
                text: text.trim().substring(0, 50), // Get first 50 chars of text
                path: getQuerySelector(el) // Unique way to find this element again
            });
        }
    });
    return clickable.slice(0, 50); // Send top 50 elements to keep it fast
}

// Helper to create a CSS selector for an element
function getQuerySelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ').join('.')}`;
    return el.tagName.toLowerCase();
}

// Listen for requests from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_page_data") {
        sendResponse({
            title: document.title,
            elements: getClickableElements()
        });
    }
});