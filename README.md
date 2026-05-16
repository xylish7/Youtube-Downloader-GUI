<p align="center">
  <img src="readme-assets/icon.png"> 
</p>
<h1 align="center">
  Youtube-Downloader-GUI  
</h1>

A modern GUI for downloading YouTube videos and playlists. Built with **Electron 34** and **yt-dlp**.

Features:
- 📥 Download single videos or entire playlists
- 🎵 Convert to MP3 or other formats
- ⚙️ Customize video quality, format, and audio quality
- 🔄 Auto-update yt-dlp binary on startup
- 💾 Remember settings and download paths

---

## Installation & Setup

### Prerequisites
- **Node.js** 16+ ([download](https://nodejs.org/))
- **FFmpeg** is bundled (via `ffmpeg-static`), no separate install needed
- **yt-dlp** is auto-downloaded on first run to `%APPDATA%\yt-downloader\bin\`

### Quick Start

```bash
# Clone or download the repository
cd Youtube-Downloader-GUI

# Install dependencies
npm install

# Run in development mode
npm start dev

# Or use the npm script
npm run dev
```

---

## Development

### Development Mode with Hot Reload
```bash
npm run dev
```
Automatically reloads the app when you modify files.

### Build for Production
```bash
npm run win
```
Creates an installer `.exe` in `dist/` (Windows only).

---

## How to Use

1. **Download**
   - Paste a YouTube URL (video or playlist) into the input field
   - Click "Save Folder" to choose a download location
   - Check "Convert to audio" if you want MP3 conversion
   - Click "Start-download"

2. **Convert** (for existing media files)
   - Click "Open files" to select video/audio files
   - Choose output format (MP3, M4A, OGG, WMA)
   - Adjust audio quality and number of parallel processes
   - Click "Start-conversion"

3. **Settings**
   - Adjust video quality, format, and audio quality
   - View release notes and version history

---

## Project Structure

```
.
├── main.js                    # Electron main process entry
├── package.json               # Dependencies & build config
├── main/
│   ├── windows/               # BrowserWindow creation
│   ├── ytdl/                  # Download logic (yt-dlp wrapper)
│   ├── update/                # yt-dlp binary management & app updates
│   ├── conversion/            # FFmpeg-based audio/video conversion
│   ├── kill-processes/        # Process management & exit handlers
│   └── menu/                  # Context menu setup
├── renderer/
│   ├── app/                   # Frontend app logic
│   ├── templates/             # HTML templates for tabs
│   ├── windows/               # HTML window files
│   └── imports.js             # Template loader
└── assets/                    # CSS, icons, fonts
```

---

## Troubleshooting

### First Run: yt-dlp Download
On the first launch, the app downloads yt-dlp (~10 MB) to `%APPDATA%\yt-downloader\bin\`. The button will show **"Find updates…"** during this time. This is normal.

### "Cannot find yt-dlp"
- Ensure your antivirus isn't blocking the download
- Check that `%APPDATA%\yt-downloader\bin\yt-dlp.exe` exists
- Delete the entire `yt-downloader` folder from `%APPDATA%` and restart the app to re-download

### Download Fails
- **Blocked URL**: YouTube may have changed its structure. yt-dlp auto-updates; restart the app.
- **Network issues**: Check your internet connection and firewall settings.
- **Regional restriction**: Some videos are region-locked; try a VPN (at your own risk).

### Video Not Converting
- Ensure FFmpeg is not blocked by antivirus (it's bundled, so this is rare)
- Try reducing "No. processes" in settings (use 1–2 instead of higher numbers)
- Check available disk space

### App Won't Start
- Try deleting `node_modules/` and running `npm install` again
- On Windows, ensure you have .NET runtime or Microsoft Visual C++ runtime installed
- Check the app logs: `%APPDATA%\yt-downloader\logs\`

---

## Recent Modernization (2026)

This project was updated from a 7-year-old Electron 1.8 codebase to **Electron 34** with modern APIs:

- ✅ `youtube-dl` → **yt-dlp** (actively maintained)
- ✅ Electron Remote API → **@electron/remote** (compatible layer)
- ✅ HTML Imports → **fetch() + DOMParser** (Chromium 79+ compatible)
- ✅ Callback-based dialogs → **Promises** (Electron 9+)
- ✅ Sync IPC → **Async IPC** (better stability)
- ✅ `ffmpeg` binary → **ffmpeg-static** (no external dependency)

---

## Building a Release

```bash
npm run win
```

The NSIS installer will be created in `dist/`. Configure build options in `package.json` under the `"build"` key.

To sign and publish releases, configure:
```json
{
  "build": {
    "win": {
      "publisherName": "Your Name",
      "publish": ["github"]  // or other providers
    }
  }
}
```

---

## Updates

### Automatic App Updates
The app checks for updates on startup via `electron-updater` and GitHub releases. If a new version is available, you'll be prompted to download and install it.

### Manual yt-dlp Update
The yt-dlp binary automatically checks for updates each time you click "Start-download" (via `yt-dlp -U`). No manual action needed.

---

## License

CC0-1.0

---

## Contributing

This project was revived and modernized in 2026. Pull requests and issues welcome!
