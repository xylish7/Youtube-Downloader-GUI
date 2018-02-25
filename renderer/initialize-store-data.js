// Internal modules
const Store = require('./store')

var {downloadInfo, conversionInfo} = require('./app/app-actions')

// create persistent data storage
const store = new Store({
  configName: 'user-preferences',
  defaults: {}
});

// Get download path
const messagePath = $('#path-message')
const articlePath = $('#path-article')
var savePath = store.get('savePath')
if (savePath) {
  messagePath.html(`<i><strong>Save Path: </strong> ${savePath}</i>`)
  articlePath.show()
  downloadInfo.savePath = savePath
}

// Set general settings
const $settingsOptions = $('.settings-options')

$settingsOptions.on('change', function() {
  let storeId = $(this).attr('id').replace('-option','').replace('-','_')
  store.set(storeId, $(this).val())
})

// Get general settings
$settingsOptions.each(function () {
  // Get id of select
  let storeId = $(this).attr('id').replace('-option','').replace('-','_')
  // Get option from persistent data
  storeId = store.get(storeId)
  // Set new selected option
  if (storeId) {
    // Remove selected option
    $(this).find('option:selected').removeAttr('selected');
    // Add 'selected' atribute to the saved value
    $(this).find(`option[value="${storeId}"]`).attr('selected', 'selected')
  }
});
