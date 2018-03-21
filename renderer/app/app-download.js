// Modules
const {ipcRenderer, clipboard} = require('electron')
const fs = require('fs')
const $ = require('jquery')

// Internal Modules
const appActions = require('./app-actions')
const appErrors = require('./app-errors')
const appNotifications = require('../../main/kill-processes/app-notifications')
const dataInitialization = require('../initialize-store-data')

// IDs
const downloadButton = $('#download-button')
const inputUrl = $('#input-url')
const keepFilesCheckbox = $('#keep-files')
const mp3Conversion = $('#mp3-conversion')
const openFolder = $('#open-download-folder')
const buttonIcon = $('#button-icon') 
const downloadProgressFieldsName = $('#download-progress-fields-name') 
const downloadDivider = $('#download-divider')

// Classes
const conversionNumber = $('.conversion-number')
const conversionBar = '.conversion-bar'
const downloadLog = $('.download-log')
const notification = $('.notification')
const progressBar = '.progress-bar'
const percentProgress = '.percent-progress'
const videoNumber = $('.video-number')
const videoTitle = '.video-title'

// Used to count badge progress
var conversionCount;

// Used to trigger conditional if one time
var alreadyTriggered = false;

// Open browse window to choose save path
openFolder.on('click', () => {
  appActions.getDownloadPath()
})


// Open 'Save Folder' in explorer
appActions.openSavePath()

// Paste URL on double click
inputUrl.on('dblclick', () => {
  inputUrl.val(clipboard.readText())
  appActions.disableButton()
})

// Disable download button if no URL is provided
inputUrl.on('input paste', () =>{
  appActions.disableButton()
})

// Start download
downloadButton.on('click', () => {

  // Reset notification values
  appNotifications.resetValues()

  if (!downloadButton.prop('disabled') && !downloadButton.hasClass('fetch-data')) {
    // Object containg the results of validations
    var validationResults = {}

    // Check if save folder was selected
    validationResults.save_folder_selected = appErrors.validateSaveFolder()

    // Check if selected save folder exists
    validationResults.path_not_exist = appErrors.validatePath(appActions.downloadInfo.savePath)

    if (inputUrl.val() != '') {
      validationResults.url = appErrors.validateURL()
    }
    
    // If all validation passed start the downoload
    if (appErrors.validateAll(validationResults, 10000) && validationResults.url) {

      // If there is no download in progress, starts one
      if (downloadButton.hasClass('not-downloading')){
        // Reset varable
        alreadyTriggered = false

        // Change divider message
        downloadDivider.attr('data-content', 'GET VIDEO/PLAYLIST INFO ...')
        
        // Initialize count for badge progress
        conversionCount = 0

        // Set progress field names
        if (mp3Conversion.is(":checked"))
        downloadProgressFieldsName.html(appActions.progressFieldNames('download-convert'))
        else 
        downloadProgressFieldsName.html(appActions.progressFieldNames('download'))

        // Popup notification if playlist is to large
        appErrors.largePlaylist()

        // Delete all progress messages if button is pressed again
        downloadLog.empty()
        conversionNumber.empty()
        appActions.setConvertBadge('download-button','remove-badge')
        
        // Disable button and input
        appActions.buttonState('fetch-data')
      
        // Get the value of checkboxes and inputs
        appActions.getFieldValues()
        // Emit event with download info as argumnets
        ipcRenderer.send('new-playlist', appActions.downloadInfo)
        
        // Condition when Stop download is pressed
      } else {        
        // Remove fields name
        downloadProgressFieldsName.empty()
        // Remove badge
        appActions.setConvertBadge('download-button','remove-badge')
        // Change button to static
        appActions.buttonState('static')
        // Empty progress log
        downloadLog.empty()
        // Kill processes
        ipcRenderer.send('stop-download')      
        ipcRenderer.on('response', () => {
          // Change divider message
          downloadDivider.attr('data-content', 'PROCESS STOPED!')
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
  // Initialize badge progress and change 
  if (playlistInfo.dynamic.playlist_index == 1) {
    appActions.setConvertBadge('download-button', playlistInfo.static.n_entries, 0)
  }
    
  // Change button from fetch-data to download
  if (downloadButton.hasClass('fetch-data')) {
    appActions.buttonState('downloading')
    // Remove notification
    appErrors.largePlaylist(true)
    // Change divider message
    downloadDivider.attr('data-content', 'DOWNLOADING ...')
  }

  // Append new title, progress bar and percentage
  if (playlistInfo.static.appendColumns) {
    (appActions.downloadInfo.mp3Conversion == 'true') ?
      downloadLog.append(`${appActions.dynamicContent(playlistInfo.dynamic.playlist_index, 'download-convert')}`) :
      downloadLog.append(`${appActions.dynamicContent(playlistInfo.dynamic.playlist_index, 'download')}`)  
    }

  // Set download badge progress
  if (playlistInfo.dynamic.percent == "100.00" && 
      appActions.downloadInfo.mp3Conversion == 'false' &&
      playlistInfo.static.isPlaylist != null 
      ) {
    appActions.setConvertBadge('download-button', playlistInfo.static.n_entries, playlistInfo.dynamic.playlist_index)
  }
    
  // Update the value of the progress bar
  appActions.showProgress(playlistInfo.dynamic)
  // Write when download is finished
  if (playlistInfo.static.downloadFinished) {
    // Set error-notification that download is completed
    appNotifications.exitMessages.download = 'download'
    
    // Make button available again only if conversion was not selected
    // For single videos
    if (appActions.downloadInfo.mp3Conversion == 'false' && playlistInfo.static.isPlaylist == null ) {
      // Change button state
      appActions.buttonState('static')
      // Change divider message
      downloadDivider.attr('data-content', 'DOWNLOAD FINISHED!')     
    }  else 
      // Change divider message
      downloadDivider.attr('data-content', 'DOWNLOAD FINISHED! || CONVERTING ...') 

    // For playlists
    if (playlistInfo.dynamic.playlist_index == playlistInfo.static.n_entries && appActions.downloadInfo.mp3Conversion == 'false') {
      // Change button state
       appActions.buttonState('static')
      // Change divider message
      downloadDivider.attr('data-content', 'DOWNLOAD FINISHED!') 
    }   
  }
})

// Conversion Progress
ipcRenderer.on('conversion-percent', (event, receivedData) => {
  if (receivedData.playlist_index == 1 && !alreadyTriggered) {
    // Change divider message
    downloadDivider.attr('data-content', 'DOWNLOADING ... || CONVERTING ...')
    alreadyTriggered = true
  }
      
  $(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val(receivedData.percent)
  // Show the procent in clear text
  $(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html(`${receivedData.percent}%`)

})

// Conversion finished
ipcRenderer.on('conversion-done', (event, receivedData) => {
  if (receivedData.conversionFinished && downloadButton.hasClass('is-downloading')) {
    downloadDivider.attr('data-content', 'DOWNLOAD FINISHED! || CONVRERT FINISHED!') 
    appActions.buttonState('static')
    appNotifications.exitMessages.conversion = 'conversion'
  }

  $(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val('100')
  $(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html('100.00%')

  // Set download + convert progress
  if (receivedData.isPlaylist != null) {
    conversionCount++ 
    appActions.setConvertBadge('download-button', receivedData.n_entries, conversionCount)
  }
})

// Youtube download errors
ipcRenderer.on('ytdl-errors', (event, err) => {
  // Remove notification
  appErrors.largePlaylist(true)

  appActions.buttonState('static')
  videoNumber.empty()

  // Send error
  appErrors.validateAll({ytdl_error: false}, 10000)
  downloadDivider.attr('data-content', 'ERROR!')
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