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

// インストール時の初期リスト設定
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.sync.set({
        blockedUrls: ['x.com', 'youtube.com/shorts']
      });
      console.log("初期の封印リストをセットしました。");
    }
  });
});

// ブラウザのタブのURLが変更されたことを検知する
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // URLの変更があった時だけ発動
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { action: "url_changed" }).catch(() => {
    });
  }
});