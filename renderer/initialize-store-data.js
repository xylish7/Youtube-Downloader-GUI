// Modules
const $ = require('jquery')

// Internal modules
const Store = require('./store')

var {downloadInfo, conversionInfo} = require('./app/app-actions')

// create persistent data storage
const store = new Store({
  configName: 'user-preferences',
  defaults: {}
});

// Set download path
const messagePath = $('#path-message')
const articlePath = $('#path-article')
var savePath = store.get('savePath')
if (savePath) {
  messagePath.html(`<i><strong>Save Path: </strong> ${savePath}</i>`)
  articlePath.show()
  downloadInfo.savePath = savePath
}
