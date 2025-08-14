# 3D Web Voxel Editor

A modular 3D voxel modeling tool built with Three.js, featuring a clean separation of concerns with HTML, CSS, and JavaScript files. The editor defaults to English language interface and dark mode theme.

---

## 🚀 Getting Started

### Project Structure
```
voxel-editor/
├── index.html          # Main application structure (modular version)
├── style.css           # All styling including theme definitions
├── script.js           # Core application logic (ES6 modules)
└── voxel-editor.html   # All-in-one standalone version (contains inline CSS/JS)
```

## Installation
### 1. Clone the repository:
```bash
git clone [https://github.com/AlirezaNoorizadeh/3D-web-voxel-editor.git]
```

### 2. Running the Editor:

#### 🔘 For Modular Version (`index.html`):
#### Option 1: Using VS Code (Recommended)
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click on `index.html` in VS Code
3. Select **"Open with Live Server"**
4. The editor will automatically open at `http://localhost:5500`

#### Option 2: Using Python
```bash
# Python 3.x
python -m http.server 8000
```
Then open: `http://localhost:8000`

#### Option 3: Using Node.js (http-server)
```bash
npx http-server
```
Access at: `http://localhost:8080`

#### 🔘 For Standalone Version (`voxel-editor.html`):
#### Option A: Direct File Access (Simplest)
1. Double-click the file in your file explorer
2. Opens directly in browser (file:// protocol)

##### Option B: With Local Server (Recommended for advanced features)
Use any of the above server methods - the file works the same way as `index.html` but has no external dependencies

##### Key Differences:
- No need for a server for basic functionality
- All assets are self-contained
- Perfect for offline use or quick sharing

---

## 🌟 Core Features

### Editor Functionality
- 🧊 Intuitive voxel placement/removal
- ↔️ Adjustable grid size (10-50 units)
- ⏮️ Robust undo/redo system (20 levels)
- 🎨 Custom color palette management

### UI Characteristics
- 🌓 Dual theme support (dark/light modes)
- 🌐 Bilingual interface (English/Persian)
- 🖥️ Responsive control panels

### Data Management
- 💾 Export to OBJ + JSON formats
- 📤 Import JSON voxel layouts

---

## 🛠️ Technical Implementation

### Architecture
- **Clean separation** of markup (HTML), presentation (CSS), and logic (JS)
- **ES6 modules** for maintainable JavaScript
- **Three.js** for 3D rendering (loaded via CDN)

### Default Configuration
- English language interface
- Dark mode visual theme
- Standard color palette pre-loaded

---

## 📂 File Breakdown  

| File                 | Contents                                | Usage Notes                          |
|----------------------|-----------------------------------------|--------------------------------------|
| `index.html`         | DOM structure + Three.js dependencies   | Modular version (requires server)    |
| `style.css`          | All visual styling including themes     | Shared by both versions              |
| `script.js`          | Application logic (ES6 modules)         | Modular version only                 |
| `voxel-editor.html`  | **All-in-one standalone version**       | Contains:                            |
|                      | • Inlined DOM structure                 | • Double-click to run                |
|                      | • Embedded CSS styles                   | • No server required                 |
|                      | • Bundled JS logic                      | • Portable/offline-friendly         |

---

### Key Differences:
- **Modular Version** (`index.html` + `script.js` + `style.css`):
  - Better for development
  - Requires local server
  - Supports hot-reloading

- **Standalone Version** (`voxel-editor.html`):
  - Single executable file
  - Zero dependencies
  - Ideal for sharing/distribution

> 💡 **Tip**: Use the modular version for development and generate the standalone version for releases/deployment.
---

## 🎨 Design Features

### Theme System
- Dark mode (default)
- Light mode option
- Theme-aware UI components

### Language Support
- English (default)
- Persian/Farsi

---

## 🛠️ Technology Stack

- **Three.js** (v0.160.0)
- **Vanilla JavaScript** (ES6 modules)
- **Modern CSS** (Flexbox, Grid)
- **HTML5** (Semantic structure)

---

## 📜 License [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

This project is licensed under the MIT License.

---

## 🙏 Credits

Thanks to:
- Three.js team for the powerful 3D engine
- Open source contributors for OrbitControls
- Web standards communities for ES6/CSS3

---

> The editor provides professional-grade voxel modeling capabilities in a clean, modular web implementation with sensible defaults for immediate productivity.