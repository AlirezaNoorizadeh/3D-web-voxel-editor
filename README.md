# 3D Web Voxel Editor

A modular 3D voxel modeling tool built with Three.js, featuring a clean separation of concerns with HTML, CSS, and JavaScript files. The editor defaults to English language interface and dark mode theme.

---

## 🚀 Getting Started

### Project Structure
```
voxel-editor/
├── index.html      # Main application structure
├── style.css       # All styling including theme definitions
└── script.js       # Core application logic (ES6 modules)
```

## Installation
### 1. Clone the repository:
```bash
git clone [https://github.com/AlirezaNoorizadeh/3D-web-voxel-editor.git]
```

### 2. Running the Editor:

#### Option 1: Using VS Code (Recommended)
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click on `index.html` in VS Code
3. Select **"Open with Live Server"**
4. The editor will automatically open in your default browser at `http://localhost:5500`

#### Option 2: Using Python
```bash
# Python 3.x
python -m http.server 8000
```
Then open your browser to:  
`http://localhost:8000`

#### Option 3: Using Node.js (http-server)
```bash
npx http-server
```
Access at:  
`http://localhost:8080`


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

| File          | Contents                                |
|---------------|-----------------------------------------|
| `index.html`  | DOM structure + Three.js dependencies   |
| `style.css`   | All visual styling including themes     |
| `script.js`   | Application logic and event handlers    |

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