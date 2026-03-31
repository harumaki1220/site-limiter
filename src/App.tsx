import { useState, useEffect } from 'react'

function App() {
  const [urls, setUrls] = useState<string[]>([])
  const [inputUrl, setInputUrl] = useState('')

  // 画面が開かれたときに、保存済みのURLを読み込む
  useEffect(() => {
    chrome.storage.sync.get(['blockedUrls'], (result) => {
      if (Array.isArray(result.blockedUrls)) {
        setUrls(result.blockedUrls)
      }
    });
  }, [])

  // 保存処理
  const handleSave = () => {
    const targetUrl = inputUrl.trim();
    if (!targetUrl) return;

    if (targetUrl.startsWith('chrome://') || targetUrl.startsWith('chrome-extension://')) {
      alert('システム画面は封印できません。');
      return;
    }

    if (urls.includes(targetUrl)) {
      alert('すでに封印されています。');
      return;
    }

    const newUrls = [...urls, targetUrl];
    chrome.storage.sync.set({ blockedUrls: newUrls }, () => {
      setUrls(newUrls);
      setInputUrl('');
    });
  }

  // 削除処理
  const handleDelete = (urlToDelete: string) => {
    const newUrls = urls.filter(url => url !== urlToDelete);
    chrome.storage.sync.set({ blockedUrls: newUrls }, () => {
      setUrls(newUrls);
    });
  }

  // Rust通信テスト
  const handlePingRust = () => {
    const hostName = "com.site_limiter.vsc_watcher";
    chrome.runtime.sendNativeMessage(
      hostName,
      { text: "Ping from Dark Mode UI" },
      (response) => {
        if (chrome.runtime.lastError) {
          alert("通信失敗: " + chrome.runtime.lastError.message);
        } else {
          alert("開通成功!\n" + JSON.stringify(response, null, 2));
        }
      }
    );
  };

return (
  // 外側
  <div className="min-h-screen bg-[#1e1e1e] p-4 sm:p-8 font-sans text-[#cccccc] w-full">
    
    {/* 内側のカード */}
    <div className="max-w-2xl mx-auto bg-[#252526] rounded-lg shadow-2xl border border-[#333333] overflow-hidden">
      
      {/* ヘッダー */}
      <div className="bg-[#323233] px-6 py-4 border-b border-[#333333]">
        <h1 className="text-xl font-bold text-[#e1e1e1] flex items-center gap-2">
          Site Limiter
        </h1>
      </div>

        <div className="p-5 space-y-5">
          {/* 通信テストボタン */}
          <button
            onClick={handlePingRust}
            className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white py-2 px-4 rounded text-xs font-medium transition-colors shadow-sm"
          >
            Rust 接続テストを実行
          </button>

          {/* 入力エリア */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="例: youtube.com/shorts"
              className="flex-1 bg-[#3c3c3c] border border-[#333333] text-[#cccccc] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#007acc] placeholder-[#707070]"
            />
            <button
              onClick={handleSave}
              className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 rounded text-xs transition-colors"
            >
              追加
            </button>
          </div>

          {/* 封印リスト */}
          <div>
            <h3 className="text-[11px] font-bold text-[#858585] uppercase mb-3 tracking-widest">封印中のサイト</h3>
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {urls.length === 0 ? (
                <p className="text-[11px] text-[#707070] italic">リストは空です</p>
              ) : (
                urls.map((url) => (
                  <div key={url} className="flex justify-between items-center bg-[#2d2d2d] p-2 rounded border border-[#333333] group hover:bg-[#37373d] transition-colors">
                    <span className="text-xs font-mono text-[#dcdcaa] truncate mr-2">{url}</span>
                    <button
                      onClick={() => handleDelete(url)}
                      className="text-[#858585] hover:text-[#f48771] text-[10px] font-bold px-1 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;