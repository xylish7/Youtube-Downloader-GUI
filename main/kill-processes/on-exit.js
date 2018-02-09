const {dialog, app} = require('electron')

var appNotification = require('./app-notifications')
var dlPlaylist = require('../ytdl/download-playlist')

exports.confirmExit = (windowObject, messageKey) => {

  if (messageKey == 'done') windowObject.destroy() 
  else {
    appNotification.options.message = appNotification.messages[messageKey]  
  
    dialog.showMessageBox(appNotification.options, (index) => {
        if (index == 0) {
          windowObject.hide()
          dlPlaylist.stopOnClose()
          appNotification.killAllProcesses(() => {
            windowObject.destroy()
            app.quit()
          })
        }
    })
  }
}
