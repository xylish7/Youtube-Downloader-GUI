// Modules
require ('hazardous') // module required when creating installed
const {app, ipcMain} = require('electron')
const ytdl = require('youtube-dl')
const path = require('path')
const fs   = require('fs')



// Internal Modules
const mainWindow = require('./main/windows/main-window')
const mp3converter = require('./main/conversion/mp3Converter')
const dlPlaylist = require('./main/ytdl/download-playlist')
const menuBar = require('./main/menu/menu-bar')
const onExit = require('./main/kill-processes/on-exit')
const updater = require('./main/update/updater')

// require('electron-reload')(__dirname);
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Create windows
  var windows = {
    mainWindow: mainWindow.createWindow()
  }

  // Check for update after x seconds
  setTimeout(updater.check, 2000);

  // Create context menu
  windows.mainWindow.webContents.on('context-menu', (e, params) => {
    menuBar.contextMenu.popup(windows.mainWindow, params.x, params.y)
  })

  // Send window object to download video
  dlPlaylist.staticInfo.win = windows.mainWindow

  // Show notification if processes are in progress
  windows.mainWindow.on('close', (e) => {
    e.preventDefault()

    windows.mainWindow.webContents.send('close-window')

  })
  ipcMain.on('close-window-response', (event, messageKey) => {
    onExit.confirmExit(windows.mainWindow, messageKey)
  })

  // Start new download
  ipcMain.on('new-playlist', (event, downloadInfo) =>{
    dlPlaylist.ipcEvent.downloadInfo = downloadInfo
    dlPlaylist.ipcEvent.event = event
    dlPlaylist.staticInfo.downloadFinished = false
    dlPlaylist.playlist(downloadInfo.url)
  }); 

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) mainWindow.createWindow()
})




