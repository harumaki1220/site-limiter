chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "check_vsc_status") {
    
    const hostName = "com.site_limiter.vsc_watcher";
    chrome.runtime.sendNativeMessage(hostName, { text: "ping" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Rust通信エラー:", chrome.runtime.lastError.message);
        sendResponse({ isRunning: false });
      } else {
        sendResponse({ isRunning: response.vsc_running });
      }
    });

    return true; 
  }
});