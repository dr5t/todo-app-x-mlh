# FlowTask — Modern Productivity & Task Manager ⚡️

FlowTask is a fast, responsive, and aesthetically refined task management web application built entirely with vanilla web technologies — **zero dependencies**, **zero build steps**, and immediate local persistence.

---

## ✨ Features

- **🎯 Smart Views**: Instantly switch between **All Tasks**, **Due Today**, **Starred**, **Upcoming**, and **Completed**.
- **🏷️ Categories & Priorities**: Classify tasks across Work, Personal, Projects, and Health with High, Medium, or Low priority badges.
- **📋 Subtasks & Checklists**: Add structured checklist items with live progress tracking and percentage indicators.
- **🎉 Celebrations & Audio**: Real-time canvas particle confetti and synthesized musical chords via the native Web Audio API upon completing tasks.
- **🌗 Dark & Light Themes**: Curated glassmorphic design system with seamless switching and theme persistence.
- **💾 Local Storage & Portability**: Automatically saves all changes to `localStorage`, with one-click **JSON Backup Export** and **JSON Restore**.
- **⌨️ Keyboard First**: Full shortcut support to create, search, and manage tasks without lifting your fingers from the keyboard.
- **📱 Fully Responsive**: Adaptive interface with a mobile drawer navigation bar for small screens.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| <kbd>N</kbd> | Open the New Task modal dialog |
| <kbd>/</kbd> | Jump to and focus the search bar |
| <kbd>T</kbd> | Toggle between Dark and Light mode |
| <kbd>?</kbd> | View the Keyboard Shortcuts reference sheet |
| <kbd>Esc</kbd> | Dismiss open dialogs or clear the active search |

---

## 📂 Project Structure

```text
todo app/
├── index.html     # Semantic markup & accessible <dialog> modals
├── style.css      # CSS variables, glassmorphic layout & dark/light themes
├── app.js         # State machine, confetti engine, audio synthesis & storage
└── README.md      # Project documentation
```

---

## 🚀 Getting Started

### Option 1: Direct File Open
Simply double-click [`index.html`](file:///Users/shauryatiwari/todo%20app/index.html) to open it in your default web browser.

### Option 2: Local HTTP Server (Recommended)
From this project directory, run a lightweight static server:

```bash
# Using Python 3:
python3 -m http.server 8080

# Or using Node.js:
npx serve .
```

Then visit **`http://localhost:8080`** in your browser.

---

## 📦 Data Backup & Transfer

1. Click the **Settings (gear)** icon in the lower sidebar.
2. Select **Export JSON** to save a complete `.json` copy of all your tasks and checklists.
3. Use **Import JSON** on any device to restore your workspace instantly.

---

## 🛠️ Built With

- **HTML5**: Semantic elements, native `<dialog>` modals, and ARIA roles for accessibility.
- **Vanilla CSS3**: CSS Custom Properties, backdrop filters, flexbox, grid, and CSS animations.
- **Vanilla JavaScript**: ES6+ modules, Web Audio API, and HTML5 Canvas API.
