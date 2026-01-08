document.getElementById('popBtn').onclick = () => {
    const goal = document.getElementById('popInput').value;
    chrome.storage.local.set({ "activeGoal": goal }, () => {
        document.getElementById('status').innerText = "Goal set! Check the website.";
    });
};

chrome.storage.local.get(['activeGoal'], (data) => {
    if (data.activeGoal) {
        document.getElementById('status').innerText = "Current Goal: " + data.activeGoal;
    }
});
