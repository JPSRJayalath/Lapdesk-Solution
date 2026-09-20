# Lapdesk Solution

A lightweight desktop inventory and stock management application built with **Tauri v2**, **Next.js**, **React**, **TypeScript**, **Rust**, and **SQLite**.

Lapdesk Solution is designed for small businesses that need a simple, fast, and reliable way to manage their inventory without depending on a web server or cloud database.

---

## 🚀 Features

### 📦 Inventory Management
- Add new inventory items
- Update existing items
- Remove items
- View all stored items
- Search items by name
- Display available stock
- Display item prices
- Automatically highlight low-stock items

### 🔎 Search
- Real-time item search
- Case-insensitive searching
- Displays `No Data Available` when no matching items exist

### ⚠️ Low Stock Detection
Items with **10 or fewer units** are automatically marked as low stock. This makes it easier to identify products that may need to be restocked.

### 💾 Local Database
The application uses **SQLite** for local data storage. The database is created automatically when the application starts. No external database server is required.

### 🖥️ Desktop Application
Built with Tauri, allowing the application to run as a native desktop application with optimized performance and a custom, borderless window frame design.

Supported platforms:
- macOS
- Windows
- Linux

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js / React | Frontend framework & User Interface |
| TypeScript | Frontend development |
| Tauri v2 | Desktop application framework |
| Rust | Backend / native application logic |
| SQLite | Local database |
| rusqlite | SQLite integration for Rust |
| CSS / Tailwind | Application styling |

---

## 📁 Project Structure

```text
Lapdesk-Solution/
│
├── src/
│   ├── app/                 # Next.js App Router (pages, layout)
│   ├── components/          # Reusable UI elements
│   ├── hooks/               # Custom React hooks
│   └── ...
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # Tauri entry point
│   │   └── lib.rs           # Core native logic & commands
│   ├── icons/
│   │   ├── icon.icns
│   │   ├── icon.ico
│   │   └── ...
│   ├── Cargo.toml
│   └── tauri.conf.json      # Window & security configurations
│
├── .gitignore
├── next.config.mjs          # Next.js configurations (SSG optimized)
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (Latest LTS recommended)
- **Rust** (via rustup)
- Platform-specific build tools (e.g., `build-essential` for Linux, Xcode Command Line Tools for macOS, or C++ build tools for Windows).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com
   cd Lapdesk-Solution
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the application in development mode with live reloading:
```bash
npm run tauri dev
```

### Build

Compile the production-ready standalone desktop binaries:
```bash
npm run tauri build
```

---

## ⚙️ Configuration Notes

### Next.js Static Export
Because Tauri apps run locally without a Node.js server environment, Next.js is configured for Static Site Generation (SSG). Ensure your `next.config.mjs` contains:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Outputs static files to out/
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Custom Window Design
This project uses **custom title bars and borders** instead of the native OS window borders. The decoration controls are disabled in `src-tauri/tauri.conf.json`:
```json
"app": {
  "windows": [
    {
      "title": "Lapdesk Solution",
      "width": 1000,
      "height": 700,
      "decorations": false,
      "transparent": true
    }
  ]
}
```
Window dragging and window controls (minimize, maximize, close) are handled custom-built directly in the React frontend via Tauri's `@tauri-apps/api/window` core module.
