# 命を削るサイトブロッカー (Site Limiter)

VSCodeが開かれている間だけ、指定したWebサイト（XやYouTube Shortsなど）へのアクセスを遮断し、命を削って開発や学習に没頭するためのChrome拡張機能です。

## 特徴
- **VS Code監視連動**: OSのプロセスを監視し、`code.exe` が起動している時のみブロックが発動。閉じた瞬間、平和なブラウジングに戻ります。
- **SPA（Single Page Application）対応**: YouTubeなどのページ遷移（リロードなしのURL変更）もBackground Service Workerが完全に捕捉し、逃げ道を塞ぎます。
- **パスベースの厳密な判定**: `youtube.com/shorts` のように、特定のディレクトリのみを狙撃可能。有益なチュートリアル動画（`youtube.com/watch`）の学習は妨げません。

## 技術スタック
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend (Native Host)**: Rust (`sysinfo` クレートによるプロセス監視)
- **Bridge**: Chrome Native Messaging API

## 動作環境
- Windows 11

## セットアップ手順

### 1. フロントエンドのビルド (WSL側)
```bash
# パッケージのインストール
pnpm install

# Chrome拡張機能として dist/ にビルド
pnpm run build
```

### 2. Rust監視ホストのクロスコンパイル (WSL側)
Windows側のChromeから呼び出されるため、WSL内でWindows用の .exe を錬成します。
```bash
cd vsc-watcher

# Windows向けビルドターゲットとC言語リンカ(MinGW)の準備
rustup target add x86_64-pc-windows-gnu
sudo apt update && sudo apt install mingw-w64

# ビルド実行（target/x86_64-pc-windows-gnu/debug/vsc-watcher.exe が生成される）
cargo build --target x86_64-pc-windows-gnu
```

### 拡張機能IDの設定 (重要)
Native Messagingを動作させるには、ブラウザが発行する一意の「拡張機能ID」を許可リストに登録する必要があります。

1. Chromeで chrome://extensions/ を開き、本拡張機能の「ID」をコピーします（例: kemdgainlj...）。
2. vsc-watcher/host_manifest.json を開き、allowed_origins の中のIDを、自分のIDに書き換えて保存します。
```json
"allowed_origins": [
  "chrome-extension://ここにコピーしたID/"
]
```

### 3. レジストリへの住民票登録 (Windows側)
ChromeにRustアプリの存在を教えるため、Windowsのレジストリに書き込みます。

※**この作業は必ずWindows側から実行してください。**

1. WSLのターミナルで `explorer.exe .` を実行し、Windowsのエクスプローラーを開く。
2. `vsc-watcher` フォルダの中にある `install.bat` をダブルクリックして実行。
3. 一瞬黒い画面が出て消えれば登録完了。

### 4. Chromeへのインストール
1. Chromeで [chrome://extensions/](chrome://extensions) を開く。
2. 右上の「デベロッパー モード」をONにする。
3. 「パッケージ化されていない拡張機能を読み込む」をクリックし、このプロジェクトの dist フォルダを選択。

## 使い方
1. インストール直後はデフォルトで x.com と youtube.com/shorts が封印リストに入ります。
2. 拡張機能のアイコンをクリックし、オプション画面から自由に封印したいURLを追加・削除できます。
3. VS Codeを立ち上げ、対象サイトにアクセスして画面が黒に染まれば成功です。命を削ってコードを書いてください。