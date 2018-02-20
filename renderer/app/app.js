// Modules
const {ipcRenderer, clipboard} = require('electron')
const fs = require('fs')
const $ = require('jquery')

// Internal Modules
const jqueryActions = require('./app-actions')
const appErrors = require('./app-errors')
const appNotifications = require('../../main/kill-processes/app-notifications')

// IDs
const downloadButton = $('#download-button')
const inputUrl = $('#input-url')
const keepFilesCheckbox = $('#keep-files')
const mp3Conversion = $('#mp3-conversion')
const openFolder = $('#open-folder')
const buttonIcon = $('#button-icon') 

// Classes
const conversionNumber = $('.conversion-number')
const conversionBar = '.conversion-bar'
const log = $('.log')
const notification = $('.notification')
const progressBar = '.progress-bar'
const percentProgress = '.percent-progress'
const videoNumber = $('.video-number')
const videoTitle = '.video-title'

// Open browse window to choose save path
openFolder.on('click', () => {
  jqueryActions.downloadInfo.savePath = jqueryActions.getDownloadPath()
})

// Paste URL on double click
inputUrl.on('dblclick', () => {
  inputUrl.val(clipboard.readText())
  jqueryActions.disableButton()
})

// Disable download button if no URL is provided
inputUrl.on('input paste', () =>{
  jqueryActions.disableButton()
})

// Start download
downloadButton.on('click', () => {

  // Reset notification values
  appNotifications.resetValues()

  if (!downloadButton.prop('disabled') && !downloadButton.hasClass('fetch-data')) {
    // Object containg the results of validations
    var validationResults = {}

    validationResults.path = appErrors.validatePath(jqueryActions.downloadInfo.savePath)

    if (inputUrl.val() != '') {
      validationResults.url = appErrors.validateURL()
    }
    
    // If all validation passed start the downoload
    if (appErrors.validateAll(validationResults, 10000) && validationResults.url) {

      // If there is no download in progress, starts one
      if (downloadButton.hasClass('not-downloading')){
        // Popup notification if playlist is to large
        appErrors.largePlaylist()

        // Delete all progress messages if button is pressed again
        log.empty()
        conversionNumber.empty()
        
        // Disable button and input
        jqueryActions.buttonState('fetch-data')
      
        videoNumber.html(`Download starting...`)
        // Get the value of checkboxes and inputs
        jqueryActions.getFieldValues()
        // Emit event with download info as argumnets
        ipcRenderer.send('new-playlist', jqueryActions.downloadInfo)
        
        // Condition when Stop download is pressed
      } else {    
          ipcRenderer.send('stop-download')
          jqueryActions.buttonState('static')
          log.empty()
          ipcRenderer.on('response', () => {
            conversionNumber.empty()
            videoNumber.html('Process stoped!')
          }) 
      }
    }
  } 
})

// Disable Keep files checkbox if convert to mp3 is not checked
mp3Conversion.on('click', () => {
  mp3Conversion.is(":checked") ? 
  keepFilesCheckbox.removeAttr('disabled') : 
  keepFilesCheckbox
    .prop( "checked", false )
    .attr('disabled', true)
})

// Close notification
$('.delete').on('click', () => {
  notification.css('display', 'none')
})

// Get progress for playlist
ipcRenderer.on('playlist-progress', (event, playlistInfo) => {
  // Change button from feth-data to download
  if (downloadButton.hasClass('fetch-data')) {
    jqueryActions.buttonState('downloading')
    // Remove notification
    appErrors.largePlaylist(true)
  }

  // Append new title, progress bar and percentage
  if (playlistInfo.static.appendColumns) {
    (jqueryActions.downloadInfo.mp3Conversion == 'true') ?
      log.append(`${jqueryActions.dynamicContent(playlistInfo.dynamic.playlist_index, 'convert')}`) :
      log.append(`${jqueryActions.dynamicContent(playlistInfo.dynamic.playlist_index, 'download')}`)     
  }

  // Show how many videos were downloaded for playlist
  (playlistInfo.static.isPlaylist != null) ?
  videoNumber.html(`${playlistInfo.dynamic.playlist_index}/${playlistInfo.static.n_entries}`) :
  videoNumber.empty()
    
  // Update the value of the progress bar
  jqueryActions.showProgress(playlistInfo.dynamic)

  // Write when download is finished
  if (playlistInfo.static.downloadFinished) {
    (playlistInfo.static.isPlaylist != null) ?
    videoNumber.html(`Download finished!`) : videoNumber.html('Download finished!')
    appNotifications.exitMessages.download = 'download'

    // Make button available again only if conversion was not selected
    if (jqueryActions.downloadInfo.mp3Conversion == 'false') {
      jqueryActions.buttonState('static')
    }
  }
})

// Conversion Progress
ipcRenderer.on('conversion-percent', (event, receivedData) => {

  $(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val(receivedData.percent)
  // Show the procent in clear text
  $(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html(`${receivedData.percent}%`)

})

// Conversion finished
ipcRenderer.on('conversion-done', (event, receivedData) => {
  if (receivedData.isPlaylist == null) {
    conversionNumber.html('| Conversion finished!')
  }

  if (receivedData.conversionFinished && downloadButton.hasClass('is-downloading')) {
    conversionNumber.html('| Conversion finished!')
    jqueryActions.buttonState('static')
    appNotifications.exitMessages.conversion = 'conversion'
  }

  $(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val('100')
  $(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html('100%')
})

// Youtube download errors
ipcRenderer.on('ytdl-errors', (event, err) => {
  // Remove notification
  appErrors.largePlaylist(true)

  jqueryActions.buttonState('static')
  videoNumber.empty()

  // Send error
  appErrors.validateAll({ytdl_error: false}, 10000)
})

// Close window event
ipcRenderer.on('close-window', (event) => {
  var exitMessages = appNotifications.exitMessages

  // Check which value has null
  for (const key in exitMessages) {
    if (exitMessages.hasOwnProperty(key)) {
      if(!exitMessages[key] && (downloadButton.hasClass('is-downloading') || downloadButton.hasClass('fetch-data'))) {
        event.sender.send('close-window-response', key)
        appNotifications.noProcessActive = null
        break
      } else {
        appNotifications.noProcessActive = true
      }
    }
  }
  if (appNotifications.noProcessActive) event.sender.send('close-window-response', 'done')
})