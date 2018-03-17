var mp3Converter = require('../conversion/mp3Converter')

var kill = require('tree-kill')

// Variables for wich notification message should be shown
exports.exitMessages = {
  download: null,
  conversion: null,
}

// Value to show that now process is active
exports.noProcessActive = null

// Messages to show when closing the apliction if any process is active
exports.messages = {
  download: 'Download in progress. Are you sure you want to quit?',
  conversion: 'Conversion in progress. Are you sure you want to quit?'
}

// Notification options
exports.options = {
  type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: ''
}

// Reset notification variables 
exports.resetValues = () => {
  this.exitMessages.download = null,
  this.exitMessages.conversion = null,
  this.noProcessActive = null
}

exports.killAllProcesses = (callback) => {
  
  if (mp3Converter.childProcesses.length == 0) {
    if (callback && typeof(callback) === "function") callback();
  } else {
    mp3Converter.pendingProcesses = []
    var initialLength = mp3Converter.childProcesses.length
    var index = mp3Converter.childProcesses.length
    var conditionLength = 0

    while (index--) {

      kill(mp3Converter.childProcesses[index], () => {
        mp3Converter.childProcesses.splice(index, 1);
        conditionLength++

        if (conditionLength == initialLength) 
          if (callback && typeof(callback) === "function") callback();
      })
    }  
  } 
}

