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
    })
  }, [])

  // 封印するボタンを押したときの保存処理
  const handleSave = () => {
    if (!inputUrl.trim()) return;

    const newUrls = [...urls, inputUrl.trim()];
    
    // Chromeのストレージに保存
    chrome.storage.sync.set({ blockedUrls: newUrls }, () => {
      setUrls(newUrls);
      setInputUrl('');
    });
  }

  return (
    <div className="p-5 font-sans w-80 min-h-[300px] bg-gray-50">
      <h2 className="text-xl font-bold mb-4 text-red-600 border-b-2 border-red-200 pb-2">
        命を削る設定画面
      </h2>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="例: youtube.com"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
        <button
          onClick={handleSave}
          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition font-bold text-sm shadow"
        >
          封印
        </button>
      </div>

      <h3 className="text-md font-bold mb-3 text-gray-700">封印中のサイト</h3>
      <ul className="space-y-2">
        {urls.length === 0 ? (
          <p className="text-sm text-gray-500 italic">まだ封印されたサイトはありません。</p>
        ) : (
          urls.map((url, index) => (
            <li key={index} className="bg-white p-2 rounded shadow-sm text-gray-700 text-sm border-l-4 border-red-500 break-all">
              {url}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default App