import { useState, useEffect } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats')
  const [urls, setUrls] = useState<string[]>([])
  const [inputUrl, setInputUrl] = useState('')
  const [todayStats, setTodayStats] = useState({ focusMinutes: 0 })
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading')

  const today = new Date().toLocaleDateString('sv-SE');

  // 画面が開かれたときに、保存済みのURLと統計を読み込む
  useEffect(() => {
    chrome.storage.sync.get(['blockedUrls'], (result) => {
      if (Array.isArray(result.blockedUrls)) {
        setUrls(result.blockedUrls)
      }
    });

    chrome.storage.local.get(['activityLog'], (result) => {
      const log = (result.activityLog || {}) as Record<string, { focusMinutes: number }>;
      
      if (log[today]) {
        setTodayStats(log[today]);
      }
    });

    // Rustプロセスの生存確認
    const hostName = "com.site_limiter.vsc_watcher";
    chrome.runtime.sendNativeMessage(hostName, { text: "ping" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        setStatus('error');
      } else {
        setStatus('active');
      }
    });
  }, [today]);

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    
    if (hours > 0) {
      return (
        <span>
          <span className="text-4xl text-blue-400">{hours}</span>
          <span className="text-sm text-[#858585] mx-1">h</span>
          <span className="text-4xl text-blue-400">{mins}</span>
          <span className="text-sm text-[#858585] ml-1">m</span>
        </span>
      );
    }
    return (
      <span>
        <span className="text-5xl text-blue-400">{mins}</span>
        <span className="text-lg text-[#858585] ml-2">min</span>
      </span>
    );
  };

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
      { text: "Ping from UI" },
      (response) => {
        if (chrome.runtime.lastError) {
          alert("通信失敗: " + chrome.runtime.lastError.message);
          setStatus('error');
        } else {
          alert("開通成功!\n" + JSON.stringify(response, null, 2));
          setStatus('active');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] p-4 sm:p-8 font-sans text-[#cccccc] w-full">
      <div className="max-w-2xl mx-auto bg-[#252526] rounded-lg shadow-2xl border border-[#333333] overflow-hidden">
        
        {/* ヘッダー */}
        <div className="bg-[#323233] px-6 py-4 border-b border-[#333333] flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#e1e1e1] flex items-center gap-2">
            Site Limiter
          </h1>
          {/* ステータスバッジ */}
          <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border transition-colors ${
            status === 'active' ? 'text-green-400 border-green-900 bg-green-900/20' : 
            status === 'error' ? 'text-red-400 border-red-900 bg-red-900/20' : 
            'text-yellow-400 border-yellow-900 bg-yellow-900/20'
          }`}>
            {status === 'active' ? 'Active' : status === 'error' ? 'Inactive' : 'Checking...'}
          </span>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b border-[#333333] bg-[#252526]">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'stats' 
                ? 'text-[#e1e1e1] border-b-2 border-blue-500 bg-[#2d2d2d]' 
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2a2d]'
            }`}
          >
            ダッシュボード
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'settings' 
                ? 'text-[#e1e1e1] border-b-2 border-blue-500 bg-[#2d2d2d]' 
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2a2d]'
            }`}
          >
            設定
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {activeTab === 'stats' && (
            <div className="space-y-6 text-center py-4">
              <h2 className="text-xs text-[#858585] uppercase tracking-widest mb-2">Today's Focus Time</h2>
              <div className="font-mono font-bold tracking-tight">
                {formatTime(todayStats.focusMinutes)}
              </div>
              <p className="text-[#858585] text-xs mt-4">
                ※ VSCodeを起動し、コードを書いた時間
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <button
                onClick={handlePingRust}
                className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white py-2 px-4 rounded text-xs font-medium transition-colors shadow-sm"
              >
                Rust 接続テストを実行
              </button>

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
                          className="text-[#858585] hover:text-[#f48771] text-[10px] font-bold px-2 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;