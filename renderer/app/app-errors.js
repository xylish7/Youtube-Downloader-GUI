const fs = require('fs')

// Messages
exports.messages = {
  save_folder_selected: 'Please select the Save Folder!',
  path_not_exist: 'The selected Save Folder does not exists!',
  url: 'The provided URL is not valid!',
  ytdl_error: 'Unsupported URL! / Connection timeout!',
  large_playlist: 'For large playlist, fetching data time is 1-2 min!',
  no_files_to_convert: 'Files already have the desired format!',
  no_files_selected: 'Please, first of all, select the files you want to convert.',
  files_removed: 'Some files were removed because they had the desired format.'
}

exports.notificationTime

// Test if Save Folder was selected
exports.validateSaveFolder = () => {
  const articlePath = $('#path-article')
  return (articlePath.css('display') != 'none') ? true : false
}

// Test path is valid
exports.validatePath = (path) => fs.existsSync(path)

// Test if url is valid
exports.validateURL = () => {
  const inputUrl = $('#input-url')
  var expression = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
  var urlRegex = new RegExp(expression);

  return (inputUrl.val().match(urlRegex)) ? true : false
}

// Show error
exports.showError = (message, duration, notificationPanel='download-notification') => {
  const notification = $(`.${notificationPanel}`)
  const notificationMessage = $(`.${notificationPanel}>.notification-message`)

  notificationMessage.html(message)
  notification.slideDown(250)

  this.notificationTime =  setTimeout(() => {
    notification.fadeOut(900)
  }, duration)
}

exports.validateAll = (validationResults, duration, notificationPanel='download-notification') => {
  if (this.notificationTime) clearTimeout(this.notificationTime)
  for (var key in validationResults) {
    if (validationResults.hasOwnProperty(key)) {
      if (!validationResults[key]) {
        this.showError(this.messages[key], duration, notificationPanel)
        return false
      }
    }
  }
  return true
}

exports.largePlaylistTime 

exports.largePlaylist = (condition = false) => {
  const notification = $('.notification')

  if (condition) {
    notification.fadeOut(900)
    clearTimeout(this.largePlaylistTime)
  } 
  else {
    this.largePlaylistTime = setTimeout(() => {
      this.showError(this.messages.large_playlist, 50000)
    }, 10000);
  }
}