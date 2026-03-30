use serde_json::Value;
use std::io::{self, Read, Write};
use sysinfo::System;

fn main() {
    let mut sys = System::new_all();

    loop {
        let mut len_bytes = [0u8; 4];
        if io::stdin().read_exact(&mut len_bytes).is_err() {
            break;
        }

        let len = u32::from_le_bytes(len_bytes) as usize;

        let mut buffer = vec![0u8; len];
        if io::stdin().read_exact(&mut buffer).is_err() {
            break;
        }

        sys.refresh_all();

        let mut is_vsc_running = false;

        for process in sys.processes().values() {
            let p_name = process.name().to_string_lossy().to_lowercase();
            if p_name.contains("code.exe") || p_name == "code" {
                is_vsc_running = true;
                break;
            }
        }

        let response = serde_json::json!({
            "status": "ok",
            "vsc_running": is_vsc_running
        });

        send_message(&response);
    }
}

fn send_message(msg: &Value) {
    let msg_str = msg.to_string();
    let msg_bytes = msg_str.as_bytes();
    let len = msg_bytes.len() as u32;

    io::stdout().write_all(&len.to_le_bytes()).unwrap();
    io::stdout().write_all(msg_bytes).unwrap();
    io::stdout().flush().unwrap();
}
