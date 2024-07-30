mod shortcuts;
mod file;
use tauri::Manager;
use std::fs;
use std::env;
use std::path::Path;
use chrono::{DateTime, Utc};
use shortcuts::*;
use file::*;

#[derive(Debug, serde::Serialize)]
struct FDir {
    name: String,
    is_dir: i32,
    path: String,
    extension: String,
    size: String,
    last_modified: String,
    is_ftp: i32,
}

#[tauri::command]
async fn list_dirs(path: Option<String>) -> Vec<FDir> {
    let mut dir_list: Vec<FDir> = Vec::new();
    let dir_path = path.unwrap_or_else(|| ".".to_string());
    let current_dir = fs::read_dir(dir_path).unwrap();

    for item in current_dir {
        let temp_item = item.unwrap();
        let name = temp_item.file_name().to_string_lossy().to_string();
        let path = temp_item.path().to_string_lossy().replace("\\", "/");
        let file_ext = temp_item.path()
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_string();

        let metadata = fs::metadata(&temp_item.path()).unwrap();
        let size = metadata.len();
        let file_date: DateTime<Utc> = metadata.modified().unwrap_or_else(|_| std::time::SystemTime::now()).into();
        
        dir_list.push(FDir {
            name: name,
            is_dir: if temp_item.path().is_dir() { 1 } else { 0 },
            path: path,
            extension: file_ext,
            size: size.to_string(),
            last_modified: file_date.to_rfc3339(),
            is_ftp: 0, 
        });
    }

    dir_list.sort_by_key(|a| a.name.to_lowercase());
    dir_list
}


#[tauri::command]
async fn get_current_dir() -> String {
    match env::current_dir() {
        Ok(path) => {path.display().to_string()},
        Err(_) => String::from("Hata: Dizin alınamadı"),
    }
}

#[tauri::command]
fn get_shortcuts() -> Shortcuts{
    let config_path = "/Users/muammer/Desktop/ema/src-tauri/ema.toml";
    let shortcuts = load_shortcuts(config_path);
    shortcuts

}


fn main() {
    let mut path_arg = std::env::args().nth(1).expect("Can't Read Path");
    let path = Path::new(&path_arg);
    if let Err(e) = env::set_current_dir(&path) {
        eprintln!("Failed to set current directory: {}", e);
        std::process::exit(1);
    }
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_dirs,get_current_dir,get_shortcuts,read_file,write_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
