const {dialog} = require('electron').remote

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

  // Show path
  messagePath.html(`<i><strong>Save Path: </strong> ${savePath[0]}</i>`)
  articlePath.show()

  // If input has value enable it
  if (inputUrl.val() != '') {
    downloadButton.removeAttr('disabled')
  }

  return savePath[0]
}

// Get all values from inputs, checkboxes, selects etc.
exports.getFieldValues = () => {
  const mp3Conversion = $('#mp3-conversion')
  const keepFilesCheckbox = $('#keep-files')
  const inputUrl = $('#input-url')

  this.downloadInfo.mp3Conversion = mp3Conversion.is(":checked") ? 
    mp3Conversion.val() : 'false'
  this.downloadInfo.keepFilesCheckbox = keepFilesCheckbox.is(":checked") ? 
    keepFilesCheckbox.val() : 'false'
  this.downloadInfo.url = inputUrl.val()
}

// Add  dynamicaly progress bar for every video
exports.dynamicContent = (data, caseName) => {
  switch(caseName) {
    case 'convert':
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
  }
}

// Update progress bar, and percent value
exports.showProgress = (data) => {
  const log = $('.log')
  const progressBar = '.progress-bar'
  const videoTitle = '.video-title'
  const percentProgress = '.percent-progress'

  // Fill progress bar
  log.find(progressBar).last().val(data.percent)
  // Show the procent in clear text
  log.find(percentProgress).last().html(`${data.percent}%`)
  // Show the title of the video
  log.find(videoTitle).last().html(`${data.title}`)
}

// Disable download button if no input or save path is provided
exports.disableButton = () => {
  const articlePath = $('#path-article')
  const inputUrl = $('#input-url')
  const downloadButton = $('#download-button')

  inputUrl.on('input', () =>{
    (articlePath.css('display') != 'none' && inputUrl.val() != '') ?
      downloadButton.removeAttr('disabled') : downloadButton.attr('disabled', true)
  })
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