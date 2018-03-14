// Modules
const {dialog} = require('electron').remote
const {shell} = require('electron')

// Internal modules
const Store = require('../store')

// create persistent variable
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {}
});


// --------------------------- Download -------------------- //

// Informations regarding the download
exports.downloadInfo = {
  mp3Conversion: null,
  keepFilesCheckbox: null,
  url: null,
  savePath: null,
  downloadFinished: false
}

// Iformations regarding the conversion
exports.conversionInfo = {
  conversionFinished: false
}

// Get the path where to save the videos
exports.getDownloadPath = () => {
  const messagePath = $('#path-message')
  const articlePath = $('#path-article')
  const inputUrl = $('#input-url')
  const downloadButton = $('#download-button')

  var savePath = dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  if (savePath) {
  // Store savePath
  store.set('savePath', savePath[0])

  // Show path
  messagePath.html(`<i><strong>Save Path: </strong> ${savePath[0]}</i>`)
  articlePath.show()

  // If input has value enable it
  if (inputUrl.val() != '') {
    downloadButton.removeAttr('disabled')
  }

  this.downloadInfo.savePath = savePath[0]
  }
}

// Open 'Save Folder' in explorer
exports.openSavePath = () => {
  const pathMessage = $('#path-message')
  pathMessage.on('click', function() {
    let path = $(this).text().replace('Save Path: ','').trim()
    shell.openItem(path)
  })
}

// Get all values from inputs, checkboxes, selects etc.
exports.getFieldValues = () => {
  const mp3Conversion = $('#mp3-conversion')
  const keepFilesCheckbox = $('#keep-files')
  const inputUrl = $('#input-url')
  const settingsOptions = $('.settings-options')

  this.downloadInfo.mp3Conversion = mp3Conversion.is(":checked") ? 
    mp3Conversion.val() : 'false'
  this.downloadInfo.keepFilesCheckbox = keepFilesCheckbox.is(":checked") ? 
    keepFilesCheckbox.val() : 'false'
  this.downloadInfo.url = inputUrl.val()

  // Get general settings values
  var downloadInfoCopy = this.downloadInfo
  settingsOptions.each(function () {
    let id = $(this).attr('id').replace('-option','').replace('-','_')
    downloadInfoCopy[id] = $(this).val()
  })
  this.downloadInfo = downloadInfoCopy
}

// Add  dynamicaly progress bar for every video
exports.dynamicContent = (data, caseName) => {
  switch(caseName) {
    case 'download-convert':
      return `<div id='${data}' class="columns is-mobile is-gapless">
          <div class="column is-4">
            <p class="video-title"></p>
          </div>
          <div  class="column is-3">
            <progress class="progress progress-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div  class="column is-3">
            <progress class="progress conversion-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div class="column is-2">
            <p class="percent-progress"></p>
          </div>
        </div>`
      break;
    case 'download':
      return `<div id='${data}' class="columns is-mobile is-gapless">
          <div class="column is-4">
            <p class="video-title"></p>
          </div>
          <div  class="column is-6">
            <progress class="progress progress-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div class="column is-2">
            <p class="percent-progress"></p>
          </div>
        </div>`
      break;
    case 'convert':
      return `<div id='${data}' class="columns is-mobile is-gapless">
          <div class="column is-4">
            <p class="video-title"></p>
          </div>
          <div  class="column is-6">
            <progress class="progress progress-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div class="column is-2">
            <p class="percent-progress"></p>
          </div>
        </div>`
      break;
  }
}

// Update progress bar, and percent value
exports.showProgress = (data) => {
  const downloadLog = $('.download-log')
  const progressBar = '.progress-bar'
  const videoTitle = '.video-title'
  const percentProgress = '.percent-progress'

  // Fill progress bar
  downloadLog.find(progressBar).last().val(data.percent)
  // Show the procent in clear text
  downloadLog.find(percentProgress).last().html(`${data.percent}%`)
  // Show the title of the video
  downloadLog.find(videoTitle).last().html(`${data.title}`)
}

// Disable download button if no input or save path is provided
exports.disableButton = () => {
  const articlePath = $('#path-article')
  const inputUrl = $('#input-url')
  const downloadButton = $('#download-button')
  
  if (articlePath.css('display') != 'none' && inputUrl.val() != '') downloadButton.removeAttr('disabled')
    else downloadButton.attr('disabled', true)

}

// Change the state of the Download button
exports.buttonState = (state) => {
  const downloadButton = $('#download-button')
  const inputUrl = $('#input-url')
  const buttonMessage = $('#button-message')
  const buttonIcon = $('#button-icon')

  switch (state) {
    case 'static':
      downloadButton.addClass('not-downloading').removeClass('is-downloading fetch-data')
      inputUrl.removeAttr('disabled')
      buttonMessage.html('Start-download')
      buttonIcon.removeClass('fas fa-spinner fa-sync fa-spin fa-pulse').addClass('fa fa-download')
      break;
  
    case 'fetch-data':
      downloadButton.removeClass('not-downloading').addClass('fetch-data')
      inputUrl.attr('disabled', true)
      buttonMessage.html('Fetching data...')
      buttonIcon.removeClass('fa fa-download').addClass('fas fa-sync fa-spin')
      break;

    case 'downloading':
      downloadButton.addClass('is-downloading').removeClass('fetch-data')
      inputUrl.attr('disabled', true)
      buttonMessage.html('Stop-download!')
      buttonIcon.removeClass('fas fa-sync fa-spin').addClass('fas fa-spinner fa-pulse')
      break;
  }
}

// ---------------- Convert ---------------- //

// Get paths for every file
exports.getConvertFiles = (filter) => {
  let convertFiles= dialog.showOpenDialog({
    properties: [
      'openFile',  
      'multiSelections'
    ],
    filters: [ filter ]
  })

  return convertFiles
}

// Get options for conversion
exports.getConvertOptions = () => {
  $deleteFiles = $('#delete-convert-files')
  $deleteFiles = $deleteFiles.is(":checked") ? 
    $deleteFiles.val() : 'false'

  return {
    video_format: $('#convert-video-format-option').val(),
    audio_quality: $('#convert-audio-quality-option').val() ,
    audio_format: $('#convert-audio-format-option').val(),
    no_processes: $('#convert-no-processes-option').val(),
    delete_files: $deleteFiles
  }
}

// Get save path
exports.getConvertPath = (pathWithTitle) => {
  return pathWithTitle.substring(0, pathWithTitle.lastIndexOf('\\'));
}

exports.setConvertBadge = (number) => {
  $startConversion = $('#start-conversion')
  $startConversion.attr('data-badge', `0/${number}`)
  if (number == 'remove-badge') {
    $startConversion.removeAttr('data-badge')
  }
}