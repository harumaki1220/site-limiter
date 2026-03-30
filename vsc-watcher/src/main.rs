use serde_json::Value;
use std::io::{self, Read, Write};

fn main() {
    // Chromeが起動している間、延々とメッセージを待ち受けるループ
    loop {
        // Chromeから送られてくる4バイトの長さ情報を読み取る
        let mut len_bytes = [0u8; 4];
        if io::stdin().read_exact(&mut len_bytes).is_err() {
            break;
        }

        // 4バイトのバイナリを、リトルエンディアンとして32ビットの整数に変換
        let len = u32::from_le_bytes(len_bytes) as usize;

        // 指定された長さの分だけ、JSONの本体を読み取る
        let mut buffer = vec![0u8; len];
        if io::stdin().read_exact(&mut buffer).is_err() {
            break;
        }

        // 受け取ったデータを文字列（JSON）として解釈
        if let Ok(msg_str) = String::from_utf8(buffer) {
            let response = serde_json::json!({
                "status": "ok",
                "message": "Rust host received your message!",
                "received_data": msg_str
            });

            send_message(&response);
        }
    }
}

// Chromeへ掟通りのフォーマットでメッセージを送る関数
fn send_message(msg: &Value) {
    let msg_str = msg.to_string();
    let msg_bytes = msg_str.as_bytes();

    // JSONの長さをu32で取得
    let len = msg_bytes.len() as u32;

    // 長さを「4バイトのリトルエンディアン」のバイナリに変換して標準出力へ書き込む
    io::stdout().write_all(&len.to_le_bytes()).unwrap();

    // JSON本体を標準出力へ書き込む
    io::stdout().write_all(msg_bytes).unwrap();

    // バッファに溜まっているデータを強制的にChromeへ押し出す
    io::stdout().flush().unwrap();
}
