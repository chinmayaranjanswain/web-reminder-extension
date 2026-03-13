# ⏰ Task Island

A premium Chrome extension that helps you set reminders with a sleek **Dynamic Island**-style notification — inspired by the iPhone's Dynamic Island.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-gold?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Set Reminders** — Title, optional note, and date/time picker
- **Dynamic Island Notifications** — A floating pill-shaped banner animates in on your active tab when a reminder fires
- **System Notifications** — Standard Chrome notifications as a fallback
- **Upcoming List** — View, manage, and delete your upcoming reminders
- **Premium Dark UI** — Elegant black & gold theme with smooth animations
- **Persistent Storage** — Reminders survive browser restarts via `chrome.storage.local`

---

## 📸 How It Works

1. Click the extension icon → popup opens with the reminder form
2. Enter a title, optional note, and pick a time
3. Click **"Set Reminder"**
4. When the time arrives:
   - A **Dynamic Island** overlay animates onto your current tab
   - A **system notification** pops up
5. Manage upcoming reminders in the list below the form

---

## 🛠️ Installation

1. **Clone this repo**
   ```bash
   git clone https://github.com/chinmayaranjanswain/web-reminder-extension.git
   ```

2. **Open Chrome** and go to `chrome://extensions/`

3. **Enable Developer mode** (toggle in the top-right)

4. Click **"Load unpacked"** and select the cloned folder

5. The Task Island icon will appear in your toolbar — you're ready! 🎉

---

## 📁 Project Structure

```
web-reminder-extension/
├── manifest.json       # Extension config (Manifest V3)
├── popup.html          # Popup UI — dark theme with gold accents
├── popup.js            # Popup logic — create, list, delete reminders
├── background.js       # Service worker — alarms, notifications, Dynamic Island injection
├── icon16.png          # Toolbar icon (16×16)
├── icon48.png          # Extension page icon (48×48)
├── icon128.png         # Store/notification icon (128×128)
├── LICENSE             # MIT License
└── README.md           # You're here
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|---|---|
| **Manifest V3** | Chrome's latest extension standard |
| **chrome.alarms** | Schedule timed reminder events |
| **chrome.notifications** | Show system notifications |
| **chrome.storage.local** | Persist reminders locally |
| **chrome.scripting** | Inject Dynamic Island into web pages |
| **Inter (Google Fonts)** | Premium typography |

---

## 🚀 How to Build This Extension from Scratch

Want to build something similar? Here are the key steps:

1. **Create `manifest.json`** — Define permissions (`alarms`, `notifications`, `storage`, `scripting`), popup file, background service worker, and icons
2. **Create `popup.html`** — Build the form UI with dark theme CSS and Dynamic Island markup
3. **Create `popup.js`** — Handle form submission, save reminders to `chrome.storage.local`, create `chrome.alarms`, and render the reminder list
4. **Create `background.js`** — Listen for `chrome.alarms.onAlarm`, fire notifications, and inject a Dynamic Island overlay into the active tab using `chrome.scripting.executeScript`
5. **Add icons** — 16×16, 48×48, and 128×128 PNG files
6. **Load in Chrome** — `chrome://extensions/` → Developer mode → Load unpacked

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Made with ☕ by [Chinmaya Ranjan Swain](https://github.com/chinmayaranjanswain)**