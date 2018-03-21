const {ipcRenderer, shell} = require('electron')

var appActions = require('./app-actions')
const appErrors = require('./app-errors')
var mp3Converter = require('../../main/conversion/mp3Converter')
var {killAllProcesses}= require('../../main/kill-processes/app-notifications')

// IDs
const $startConversion = $('#start-conversion')
const $openConvertFolder = $('#open-convert-folder')
const $convertAudioRadio = $('#convert-audio-radio')
const $convertVideoRadio = $('#convert-video-radio')
const $convertProgressFieldsName = $('#convert-progress-fields-name')
const $convertDivider = $('#convert-divider')
const $openConvertedFolder = $('#open-converted-folder')
const $buttonMessage = $('#button-message')
const $convertAudioFormatOption = $('#convert-audio-format-option') 

// Classes
const $convertNotification = $('.convert-notification')
const $convertLog = $('.convert-log')
const videoTitle = '.video-title'
const percentProgress = '.percent-progress'


// Add attribute checked to the radio button that was clicked
$('.is-checkradio').on('click', function () {
  if ($(this).attr('id') == 'convert-video-radio') {
    $convertAudioRadio.removeAttr('checked')
    $convertVideoRadio.attr('checked', 'checked')
  } else {
    $convertAudioRadio.attr('checked', 'checked')
    $convertVideoRadio.removeAttr('checked')
  }
})

// Filters for opening the files
var fileFilter = {
  video: {name: 'Video', extensions: ['mkv', 'avi', 'mp4', 'webm', '3gp']},
  audio: {name: 'Audio', extensions: ['mp3', 'm4a', 'ogg', 'wma', 'mkv', 'avi', 'mp4', 'webm', '3gp']}
}

// Used to stoe initial files to conver
var initialFiles
// Used to store files to convert
var convertFiles;
// Used to count badge progress
var conversionCount;

// Get files and show them in progress log
$openConvertFolder.on('click', () => {
  // Open files only if button is not disabled
  if (!$openConvertFolder.prop('disabled')) {
    // Check what radio button is checked
    initialFiles = ($convertAudioRadio.attr('checked') == 'checked') ?
    appActions.getConvertFiles(fileFilter.audio) : appActions.getConvertFiles(fileFilter.video)

    // Keep initial files if cancel button is pressed when selecting files
    if (initialFiles) {
      convertFiles = initialFiles
      // Keep a copy of original selection in case the convert format is 
      // changed from the convert setting after the files have already
      // been selected
      originalFiles = initialFiles

      // Remove files that have the same format as convert format
      convertFiles = appActions.removeSameFormat(convertFiles)
      if (convertFiles.length != originalFiles.length)
        // Send notification if some of files were removed
        // Send error
        appErrors.validateAll({files_removed: false}, 10000, 'convert-notification')
    }

    // Get files title
    // Do nothing to the front-end if conversion finished and no file was selected
    if (conversionCount > 0 && !initialFiles) {}
    // Empty log and set progress badge if files were selected 
    else 
      setNumberOfConversions()
  } 
})

// Filter convert files array if the format is changed form the general settings
$convertAudioFormatOption.on('change', function() {
  if (convertFiles.length > 0) {
    convertFiles = appActions.removeSameFormat(originalFiles)
    if (convertFiles.length != originalFiles.length)
        // Send notification if some of files were removed
        // Send error
        appErrors.validateAll({files_removed: false}, 10000, 'convert-notification')
    setNumberOfConversions()
  }
})

// Execute when start conversion button is clicked
$startConversion.on('click', () => {
  // Start converstion if button state is static
  if ($startConversion.hasClass('not-converting') && !$startConversion.attr('disabled')) {
    // Change divider message
    $convertDivider.attr('data-content', 'CONVERTING ...')
    // Disable open files
    $openConvertFolder.prop('disabled', true).attr('disabled', true)
    // Change the state of the conversion button
    appActions.convertButtonState('converting')

    // Initialize conversion count 
    conversionCount = 0
    // Get convert options
    var fileInfo = appActions.getConvertOptions()
    // Get number of files:
    fileInfo.n_entries = convertFiles.length;
    // Get save path
    fileInfo.savePath = appActions.getConvertPath(convertFiles[0])
    // For each file launch conversion
    convertFiles.forEach((file, index) => {
      
      fileInfo.filePath = file
      fileInfo.title = file.substring(file.lastIndexOf("\\") + 1, file.lastIndexOf("."))
      fileInfo.index = index + 1
      fileInfo.original_format = file.substring(file.lastIndexOf("."))
     
      // Append the title, progress bar, and progress value
      appActions.emptyProgressBars(index, fileInfo.title);
      // Start conversion
      ipcRenderer.send('send-convert-file', fileInfo)
    })
  } else { // Execute when button is pressed while converting
    // Kill all convert processes
    if ($startConversion.hasClass('is-converting')) {
        ipcRenderer.send('stop-convert')
        ipcRenderer.on('stop-convert-response', () => {
          // Change divider message
          $convertDivider.attr('data-content', 'PROCESS STOPPED!')
          // Empty process log
          $convertLog.empty()
          // Empty convertFiles variable
          convertFiles = []
          // Remove badge
          appActions.setConvertBadge('start-conversion', 'remove-badge')
          // Disable start conversion button
          $startConversion.attr('disabled', true)
          // Change button state to static
          appActions.convertButtonState('static')
          // Enable open files button
          $openConvertFolder.removeProp('disabled').removeAttr('disabled')
      })
    }
  }
})

// Fill progress bar, change progress perg. andd change badge status
ipcRenderer.on('convert-file-progress', (event, receivedData) => {
  $(`#convert-${receivedData.index}>.is-6>.progress-bar`).val(receivedData.percent)
  // Show the procent in clear text
  $(`#convert-${receivedData.index}>.is-2>.percent-progress`).html(`${receivedData.percent} %`)
  if (receivedData.fileConverted) {
    conversionCount++;
    appActions.setConvertBadge('start-conversion', convertFiles.length, conversionCount)
  }   

  // Execute when conversion is done
  if (conversionCount == convertFiles.length) {

    // Change divider message
    $convertDivider.attr('data-content', 'CONVERT FINISHED!')
    // Enable open files button
    $openConvertFolder.removeProp('disabled').removeAttr('disabled')
    // Change button state to static 
    appActions.convertButtonState('static')
    // Disable start conversion button
    $startConversion.attr('disabled', true)
  }
})

//

// Close notifications
$('.delete').on('click', () => {
  $convertNotification.css('display', 'none')
})

// Open the path to the converted files
$('#open-converted-folder').on('click', () => {
  if (convertFiles) {
    if (convertFiles.length > 0) {
      let path = convertFiles[0].substring(0, convertFiles[0].lastIndexOf('\\'))
      shell.openItem(path)
    }
  } else {
    // Rise error if there were no files opened
    appErrors.validateAll({no_files_selected: false}, 10000, 'convert-notification')
  }
})

// Activate page loader if the is a conversion on the 'Download' tab
const $pageLoaderContainer = $('#page-loader-container')
const $convertContent = $('#convert-content')

exports.showPageLoader = () => {
  console.log($convertContent.html(), $pageLoaderContainer.html())
  $convertContent.hide()
  $pageLoaderContainer.show()
}

function setNumberOfConversions () {
  if (convertFiles.length > 0) {
    // Clean last log 
    $convertLog.empty()
    // Show progress field names
    $convertProgressFieldsName.html(appActions.progressFieldNames('convert'))
    // Enable button
    $startConversion.removeAttr('disabled')
    // Set Badge number
    appActions.setConvertBadge('start-conversion', convertFiles.length)
  } else { // 
    if (!(conversionCount > 0) && initialFiles.length > 0)
      appActions.setConvertBadge('start-conversion', 'remove-badge')
    // Disable start conversion button
    $startConversion.attr('disabled', true)
    // Send error
    appErrors.validateAll({no_files_to_convert: false}, 10000, 'convert-notification')
  }
}