use serde::Deserialize;
use serde::Serialize;
use std::fs;
use toml;

#[derive(Debug, Deserialize)]
pub struct Config {
    #[allow(dead_code)]
    pub shortcuts: Shortcuts,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Shortcuts {
    #[allow(dead_code)]
    pub toggle_sidebar: String,
}

pub fn load_shortcuts(path: &str) -> Shortcuts {
    let toml_str = fs::read_to_string(path)
        .expect("Failed to read configuration file");

    let config: Config = toml::de::from_str(&toml_str)
        .expect("Failed to deserialize configuration file");

    config.shortcuts
}
