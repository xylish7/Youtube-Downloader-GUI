const {ipcRenderer} = require('electron')

// ------------------ For convert page ------------------ //

// Activate page loader if the is a conversion on the 'Download' tab
const $pageLoaderContainer = $('#page-loader-container')
const $convertContent = $('#convert-content')
const $downloadButton = $('#download-button')

// Hide/show page loader on download button click
$downloadButton.on('click', () => {
  if (pageloaderShowed) {
    $convertContent.hide()
    $pageLoaderContainer.show()
  } else {
    $convertContent.show()
    $pageLoaderContainer.hide()
  }
})

// Hide pageloader when covnersion is done
ipcRenderer.on('hide-pageloader-response', () =>{
  $convertContent.show()
  $pageLoaderContainer.hide()
})

// ------------------ For download page ------------------ //
