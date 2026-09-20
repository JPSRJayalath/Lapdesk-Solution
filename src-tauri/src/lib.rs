use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Deserialize)]
struct NewItem {
    name: String,
    price: f64,
    stock: i64,
}

#[derive(Serialize)]
struct Item {
    id: i64,
    name: String,
    price: f64,
    stock: i64,
}

#[tauri::command]
fn add_item(app: tauri::AppHandle, item: NewItem) -> Result<(), String> {
    println!("Adding item: {}", item.name);

    let database_path = app
        .path()
        .app_data_dir()
        .map_err(|error| {
            println!("APP DATA DIR ERROR: {}", error);
            error.to_string()
        })?
        .join("lapdesk.sqlite3");

    println!("Database path: {:?}", database_path);

    let connection = Connection::open(&database_path)
        .map_err(|error| {
            println!("DATABASE OPEN ERROR: {}", error);
            error.to_string()
        })?;

    println!("Database opened successfully");

    connection
        .execute(
            "INSERT INTO items (name, price, stock) VALUES (?1, ?2, ?3)",
            params![item.name, item.price, item.stock],
        )
        .map_err(|error| {
            println!("INSERT ERROR: {}", error);
            error.to_string()
        })?;

    println!("Item inserted successfully");

    Ok(())
}

#[tauri::command]
fn remove_item(app: tauri::AppHandle, id: i64) -> Result<(), String> {
    let database_path = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("lapdesk.sqlite3");

    let connection = Connection::open(database_path)
        .map_err(|error| error.to_string())?;

    connection
        .execute(
            "DELETE FROM items WHERE id = ?1",
            params![id],
        )
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_items(app: tauri::AppHandle) -> Result<Vec<Item>, String> {
    let database_path = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("lapdesk.sqlite3");

    let connection = Connection::open(database_path)
        .map_err(|error| error.to_string())?;

    let mut statement = connection
        .prepare("SELECT id, name, price, stock FROM items ORDER BY id")
        .map_err(|error| error.to_string())?;

    let items = statement
        .query_map([], |row| {
            Ok(Item {
                id: row.get(0)?,
                name: row.get(1)?,
                price: row.get(2)?,
                stock: row.get(3)?,
            })
        })
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;

    Ok(items)
}

#[tauri::command]
fn update_item(
    app: tauri::AppHandle,
    id: i64,
    name: String,
    price: f64,
    stock: i64,
) -> Result<(), String> {
    let database_path = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("lapdesk.sqlite3");

    let connection = Connection::open(database_path)
        .map_err(|error| error.to_string())?;

    connection
        .execute(
            "UPDATE items
             SET name = ?1, price = ?2, stock = ?3
             WHERE id = ?4",
            params![name, price, stock, id],
        )
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;

            fs::create_dir_all(&app_data_dir)?;

            let database_path = app_data_dir.join("lapdesk.sqlite3");

            let connection = Connection::open(database_path)?;

            connection.execute_batch(
                r#"
                CREATE TABLE IF NOT EXISTS items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    price REAL NOT NULL,
                    stock INTEGER NOT NULL
                );
                "#,
            )?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            add_item,
            get_items
        ])
        .invoke_handler(tauri::generate_handler![
            greet,
            add_item,
            get_items,
            remove_item
        ])
        .invoke_handler(tauri::generate_handler![
            greet,
            add_item,
            get_items,
            remove_item,
            update_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}