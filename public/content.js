chrome.storage.sync.get(['blockedUrls'], (result) => {
  const blockedUrls = result.blockedUrls || [];
  const currentUrl = window.location.href;

  const isBlocked = blockedUrls.some(url => currentUrl.includes(url));

  if (isBlocked) {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        background-color: #000;
        color: #fff;
        font-family: sans-serif;
        text-align: center;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 999999;
      ">
        <h1 style="font-size: 4rem; margin-bottom: 20px; color: #ff4444;">命を削ってコードを書け</h1>
        <p style="font-size: 1.5rem; color: #888;">このサイトは封印されている。</p>
      </div>
    `;
    document.body.style.overflow = 'hidden';
  }
});