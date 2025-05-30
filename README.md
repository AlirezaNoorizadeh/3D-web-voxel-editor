# 3D Web Voxel Editor

This project is a browser-based 3D voxel editor built with Three.js that allows users to create and manipulate voxel models in a 3D space. It provides intuitive controls for building, selecting, and modifying voxel structures with various colors and grid sizes.

---

## 🚀 How to Use the Editor

### 1. Access the Editor
Simply open the HTML file in any modern web browser:
```bash
open 3d_web_voxel_editor.html
```

### 2. Basic Controls
- **Left Click**: Place a voxel
- **Right Click**: Remove a voxel
- **Shift + Left Click**: Draw a line of voxels
- **Alt + Left Click (Drag)**: Select multiple voxels
- **Arrow Keys**: Move selected voxels
- **PageUp/PageDown**: Move selected voxels vertically

### 3. UI Features
- Color palette selection
- Grid size adjustment (10-50)
- Undo/Redo functionality
- Import/Export options (JSON/OBJ)

---

## 🎯 Project Goal
This editor demonstrates how to:
- Create an interactive 3D environment with Three.js
- Implement voxel placement and manipulation
- Manage complex user interactions
- Support undo/redo functionality
- Handle multiple languages (English/Persian)
- Implement light/dark mode

---

## 📂 Project Structure
The project consists of a single HTML file with embedded JavaScript and CSS, organized into logical sections:

| Section                  | Description                                  |
|--------------------------|----------------------------------------------|
| **📁 HTML Structure**    | Contains the UI layout and controls         |
| **📁 CSS Styles**        | All styling for the editor                 |
| **📁 JavaScript**        | Core application logic                     |
| - Three.js Setup        | Scene, camera, renderer initialization     |
| - Voxel Management      | Placement, deletion, selection             |
| - History System        | Undo/Redo functionality                    |
| - UI Interactions       | Control panel and instruction handling      |
| - Import/Export         | JSON and OBJ file handling                  |

---

## 🔧 Key Features

### Voxel Editing
- Place and remove individual voxels
- Draw continuous lines of voxels
- Select multiple voxels for batch operations
- Copy/Delete selected voxels
- Clear the entire workspace

### UI Features
- Bilingual support (English/Persian)
- Light/Dark mode toggle
- Collapsible control panels
- Interactive color palette
- Custom color addition
- Grid size adjustment

### Advanced Functionality
- Undo/Redo stack (20 levels)
- Bounds checking for voxel placement
- Interactive preview of voxel placement
- Keyboard shortcuts for common operations

---

## 🌐 Language Support
The editor supports two languages:
1. English (default)
2. Persian/Farsi (فارسی)

Toggle between languages using the language switch button in the controls panel.

---

## 🎨 Color Management
The editor provides:
- 10 default colors
- Custom color addition
- Color palette persistence
- Active color highlighting

---

## 📁 File Operations

### Export Options
1. **JSON Export**:
   - Saves voxel positions and colors
   - Preserves grid size
   - Can be re-imported later

2. **OBJ Export**:
   - Standard 3D model format
   - Includes separate MTL file for materials
   - Compatible with most 3D software

### Import Options
- **JSON Import**:
  - Loads previously saved voxel layouts
  - Adjusts grid size automatically
  - Preserves all color information

---

## ⌨️ Keyboard Shortcuts

| Shortcut          | Action                          |
|-------------------|---------------------------------|
| Arrow Keys        | Move selected voxels           |
| PageUp/PageDown   | Move vertically                |
| Ctrl/Cmd + Z      | Undo                          |
| Ctrl/Cmd + Y      | Redo                          |
| Escape            | Clear selection               |
| Enter             | Confirm actions/close messages |

---

## 🛠️ Technologies Used
- **Three.js** for 3D rendering
- **HTML5/CSS3** for UI
- **JavaScript ES6** for application logic
- **Tailwind CSS** for utility classes
- **OrbitControls** for camera manipulation

---

## 📜 License [ [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) ]
This project is licensed under the MIT License.

---

## 🙏 Acknowledgments
Special thanks to:
- The Three.js community for their excellent documentation
- All contributors to the OrbitControls library
- The developers of Tailwind CSS for their utility-first framework

---

This voxel editor provides a simple yet powerful interface for creating 3D voxel art directly in the browser, with features that rival many desktop applications. The clean implementation demonstrates how to build complex interactive 3D applications using modern web technologies.
