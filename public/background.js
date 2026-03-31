const POLLING_INTERVAL = 10000; 

function checkVscAndCleanTabs() {
  const hostName = "com.site_limiter.vsc_watcher";

  chrome.runtime.sendNativeMessage(hostName, { text: "polling" }, (response) => {
    if (chrome.runtime.lastError || !response || !response.vsc_running) {
      return;
    }

    chrome.tabs.query({}, (tabs) => {
      chrome.storage.sync.get(['blockedUrls'], (result) => {
        const blockedUrls = result.blockedUrls || [];
        
        tabs.forEach(tab => {
          if (!tab.url || !tab.url.startsWith('http')) return;

          const isBlocked = blockedUrls.some(url => {
            const cleanUrl = url.replace(/^https?:\/\//, '').trim();
            const [targetHost, ...pathParts] = cleanUrl.split('/');
            const targetPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
            
            const urlObj = new URL(tab.url);
            const hostMatches = urlObj.hostname === targetHost || urlObj.hostname.endsWith('.' + targetHost);
            const pathMatches = targetPath === '' || urlObj.pathname.startsWith(targetPath);
            
            return hostMatches && pathMatches;
          });

          if (isBlocked) {
            chrome.tabs.sendMessage(tab.id, { action: "url_changed" }).catch(() => {
            });
          }
        });
      });
    });
  });
}

setInterval(checkVscAndCleanTabs, POLLING_INTERVAL);

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

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.sync.set({
        blockedUrls: ['x.com', 'youtube.com/shorts']
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { action: "url_changed" }).catch(() => {});
  }
});