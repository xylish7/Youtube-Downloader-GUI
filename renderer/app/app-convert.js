const appActions = require('./app-actions')
var mp3Converter = require('../../main/conversion/mp3Converter')

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
  audio: {name: 'Audio', extensions: ['mp3', 'm4a', 'ogg', 'wma']}
}

var convertFiles;

// Get files and show them in progress log
const $openConvertFolder = $('#open-convert-folder')
const $convertAudioRadio = $('#convert-audio-radio')
const $convertVideoRadio = $('#convert-video-radio')
const $convertLog = $('.convert-log')
const videoTitle = '.video-title'
const percentProgress = '.percent-progress'

$openConvertFolder.on('click', () => {
  $convertLog.empty()
  // Check what radio button is checked
  convertFiles = ($convertAudioRadio.attr('checked') == 'checked') ?
    appActions.getConvertFiles(fileFilter.audio) : appActions.getConvertFiles(fileFilter.video)

  // Get file title
  if (convertFiles) {
     // Set Badge number
    appActions.setConvertBadge(convertFiles.length)

    convertFiles.forEach((title, index) => {
      title = title.substring(title.lastIndexOf("\\") + 1);

      $convertLog.append(`${appActions.dynamicContent(`convert-${index + 1}`, 'convert')}`)
      $convertLog.find(videoTitle).last().html(`${title}`)
      $convertLog.find(percentProgress).last().html('0%')
    });
  } else { 
    // remove badge if not files are selected
    appActions.setConvertBadge('remove-badge')
  }
})

// Get conversion options


// Start conversion
$startConversion = $('#start-conversion')

$startConversion.on('click', () => {

  // Get convert options
  var fileInfo = appActions.getConvertOptions()
  // Get number of files:
  fileInfo.n_entries = convertFiles.length;
  // Get save path
  fileInfo.savePath = appActions.getConvertPath(convertFiles[0])
  // For each file launch conversion
  convertFiles.forEach((file, index) => {
    console.log(fileInfo)
    fileInfo.title = file.substring(file.lastIndexOf("\\") + 1)
    fileInfo.index = index + 1
    console.log(fileInfo.title, fileInfo.index)
    
    
  })
})