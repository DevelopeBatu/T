use std::fs;

#[tauri::command]
pub fn read_file(path: &str) -> String{
    let file = fs::read_to_string(path)
        .expect("Failed to read configuration file");;
    file
}

