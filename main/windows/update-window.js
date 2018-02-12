const { BrowserWindow } = require('electron')

exports.win

// create update window
exports.createWindow = () => {

  this.win = new BrowserWindow({
    width: 586,
    height: 133,
    useContentSize: true,
    autoHideMenuBar: true,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    resizable: false
  })
  
  // Load main window content
  this.win.loadURL(`file://${__dirname}/../../renderer/html/update.html`)

  // Handle window closed
  this.win.on('closed', () => {
    this.win = null
  })
  
  // Return window object
  return this.win
}