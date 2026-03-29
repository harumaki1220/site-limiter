chrome.storage.sync.get(['blockedUrls'], (result) => {
  const blockedUrls = result.blockedUrls || [];
  
  // 現在のページのホスト名（例: "www.google.com" や "x.com"）を取得
  const currentHost = new URL(window.location.href).hostname;

  // 登録されたURLが、現在のホスト名と一致するか（またはサブドメインか）を厳密に判定
  const isBlocked = blockedUrls.some(url => {
    // 登録された文字列から余計な空白や / を取り除く
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    // ホスト名が完全に一致するか、そのドメインのサブドメインならブロックする
    return currentHost === cleanUrl || currentHost.endsWith('.' + cleanUrl);
  });

  if (isBlocked) {
    document.body.innerHTML = `
      <div style="
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height: 100vh; width: 100vw; background-color: #000; color: #fff;
        font-family: sans-serif; text-align: center;
        position: fixed; top: 0; left: 0; z-index: 999999;
      ">
        <h1 style="font-size: 4rem; margin-bottom: 20px; color: #ff4444;">命を削ってコードを書け</h1>
        <p style="font-size: 1.5rem; color: #888;">このサイトは封印されている。</p>
      </div>
    `;
    document.body.style.overflow = 'hidden';
  }
});