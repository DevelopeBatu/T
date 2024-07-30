use std::fs;

#[tauri::command]
pub fn read_file(path: &str) -> String{
    let file = fs::read_to_string(path)
        .expect("Failed to read configuration file");;
    file
}

#[tauri::command]
pub fn write_file(path: &str, contents: String) -> String {
    match fs::write(path, contents) {
        Ok(_) => "Başarıyla yazıldı".to_string(), 
        Err(e) => format!("Yazma hatası: {}", e), 
    }
}
