const {ipcRenderer} = require('electron')

// ------------------ For convert page ------------------ //

// Activate page loader if the is a conversion on the 'Download' tab
const $pageLoaderContainer = $('#page-loader-container')
const $convertContent = $('#convert-content')
const $downloadButton = $('#download-button')

// Hide page loader 
ipcRenderer.on('hide-download-pageloader-response', () =>{
  $convertContent.show()
  $pageLoaderContainer.hide()
})

// Show pageloader
ipcRenderer.on('show-download-pageloader-response', () =>{
  $convertContent.hide()
  $pageLoaderContainer.show()
})

// ------------------ For download page ------------------ //

const $downloadPageloader = $('#download-pageloader')
const mp3Conversion = $('#mp3-conversion')
const keepFilesCheckbox = $('#keep-files')

// Hide pageloader
ipcRenderer.on('hide-convert-pageloader-response', () =>{
  $downloadPageloader.hide()
  mp3Conversion.removeAttr('disabled')
})

// Show pageloader
ipcRenderer.on('show-convert-pageloader-response', () =>{
  $downloadPageloader.show()
  mp3Conversion.prop( "checked", false ).attr('disabled', true)
  keepFilesCheckbox.prop( "checked", false ).attr('disabled', true)
})