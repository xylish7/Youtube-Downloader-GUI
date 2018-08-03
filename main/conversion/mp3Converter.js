var fs = require('fs')
var path = require('path')
var spawn = require('cross-spawn-async');
var Output = require('./ffmpegOutput.js');

exports.childProcesses = []

exports.pendingProcesses = []
exports.convertVideo = (playlistInfo, downloadInfo) => {
  var spawnAttributes = {
    ffmpeg_path: path.resolve(__dirname, '..', '..', 'node_modules', 'youtube-dl', 'bin', 'ffmpeg.exe'),
    args: [
      '-i', 
      `${downloadInfo.savePath}\\${playlistInfo.dynamic.title}.${downloadInfo.video_format}`,
      '-map', '0:a:0',
      '-b:a', `${downloadInfo.audio_quality}`,
      '-y',
      `${downloadInfo.savePath}\\${playlistInfo.dynamic.title}.${downloadInfo.audio_format}`
      ],
    options: {
      detached: false
    }
  }

  if (!checkAvailability(downloadInfo.no_processes)) {
    var processAttributes = {
      spawnAttributes,
      playlistInfo,
      downloadInfo
    }
    this.pendingProcesses.push(processAttributes)

  }
  else {
    if (!checkPending()) {
      spawnChild(spawnAttributes, playlistInfo, downloadInfo)
    }
    else {
      spawnChild(this.pendingProcesses.shift(), playlistInfo, downloadInfo)
    }
    
  } 
}

var spawnChild = (spawnAttributes, playlistInfo, downloadInfo) => {
  let ffmpegOutput = new Output()

  var sendData = {
    conversionFinished: false
  }

  // Spawn new child process
  var {ffmpeg_path, args, options} = spawnAttributes
  var ffmpeg = spawn(ffmpeg_path, args, options);
  this.childProcesses.push(ffmpeg.pid)

  sendData.playlist_index =  playlistInfo.dynamic.playlist_index
  sendData.isPlaylist = playlistInfo.static.isPlaylist
  sendData.title = playlistInfo.dynamic.title

  ffmpeg.stderr.on('data', (data) => {

    ffmpegOutput.string = data.toString()
    ffmpegOutput._raw_duration = playlistInfo.dynamic._raw_duration
    sendData.percent = ffmpegOutput.percent

    if (!isNaN(sendData.percent)) {
      playlistInfo.static.win.webContents.send('conversion-percent', sendData)
    }
      
  });

  ffmpeg.on('exit', (code) => {
    if (sendData.playlist_index == playlistInfo.static.n_entries || sendData.isPlaylist == null) {
      sendData.conversionFinished = true;
    }
    
    if (code == 0) 
      if (playlistInfo.static.keepFiles == 'false'){
        sendData.n_entries = playlistInfo.static.n_entries
        fs.unlinkSync(`${downloadInfo.savePath}\\${sendData.title}.${downloadInfo.video_format}`);
        playlistInfo.static.win.webContents.send('conversion-done', sendData)
      } else {
        sendData.n_entries = playlistInfo.static.n_entries
        playlistInfo.static.win.webContents.send('conversion-done', sendData)
      }

    // Remove pid from child array
    removeChild(ffmpeg.pid)

    // Start a pending process
    if (checkPending())  {
      var pendingProcess = this.pendingProcesses.shift()
      spawnChild(pendingProcess.spawnAttributes, pendingProcess.playlistInfo, pendingProcess.downloadInfo)
    }
    
  });

  ffmpeg.on('error', (err) => {
    if (err) console.log(err)
  })
}

var removeChild = (childPid) => {
  this.childProcesses = this.childProcesses.filter(pid => pid != childPid)
}

var checkAvailability = (noProcesses) => {
  if (this.childProcesses.length == noProcesses) return false
  else return true
}

var checkPending = () => {
  if (this.pendingProcesses.length == 0) return false
  else return true
}

// ------------- Convert ------------- //
// ----------------------------------- //
exports.convertFiles = (fileInfo) => {
  var spawnAttributes = {
    ffmpeg_path: path.resolve(__dirname, '..', '..', 'node_modules', 'youtube-dl', 'bin', 'ffmpeg.exe'),
    args: [
      '-i', 
      `${fileInfo.filePath}`,
      // '-map', '0:a:0',
      // '-b:a', `${fileInfo.audio_quality}`,
      '-y',
      `${fileInfo.savePath}\\${fileInfo.title}.${fileInfo.audio_or_video_format}`
      ],
    options: {
      detached: false
    }
  }

  if (!checkAvailability(fileInfo.no_processes)) {
    var processAttributes = {
      spawnAttributes,
      fileInfo
    }
    this.pendingProcesses.push(processAttributes)
  }
  else {
    if (!checkPending()) {
      spawnConvert(spawnAttributes, fileInfo)
    }
    else {
      spawnConvert(this.pendingProcesses.shift(), fileInfo)
    }  
  } 
}

var spawnConvert = (spawnAttributes, fileInfo) => {
  fileInfo.win.webContents.send('debug', 'Inside spawnConvert')
  let ffmpegOutput = new Output()
  
  var sendData = {
    conversionFinished: false,
    fileConverted: false
  }

  // Spawn new child process
  var {ffmpeg_path, args, options} = spawnAttributes
  var ffmpeg = spawn(ffmpeg_path, args, options);
  this.childProcesses.push(ffmpeg.pid)
  console.log('-------------------------------------------------------------------------------------------')
  console.log(ffmpeg)
  fileInfo.win.webContents.send('debug', ffmpeg)
  console.log('-------------------------------------------------------------------------------------------')
  sendData.index =  fileInfo.index

  ffmpeg.stderr.on('data', (data) => {
    fileInfo.win.webContents.send('debug', {'Inside data': data})
    ffmpegOutput.string = data.toString()
    ffmpegOutput.full_duration = ffmpegOutput.fullDuration

    // Get full duration of file
    if (!isNaN(ffmpegOutput.full_duration)) {
      ffmpegOutput._raw_duration = ffmpegOutput.fullDuration
    } 

    if (ffmpegOutput._raw_duration) {
      sendData.percent = ffmpegOutput.percent
      if (!isNaN(sendData.percent)) {
        fileInfo.win.webContents.send('convert-file-progress', sendData)
      }
    }
      
  });

  ffmpeg.on('exit', (code) => {
    fileInfo.win.webContents.send('debug', 'Inside exit')
    sendData.fileConverted = true
    sendData.percent = '100.00'

    if (sendData.index == fileInfo.n_entries) 
      sendData.conversionFinished = true;

    if (code == 0) 
      if (fileInfo.delete_files == 'true'){
        fs.unlinkSync(`${fileInfo.savePath}\\${fileInfo.title}${fileInfo.original_format}`);
        fileInfo.win.webContents.send('convert-file-progress', sendData)
      } else 
        fileInfo.win.webContents.send('convert-file-progress', sendData)

    // Remove pid from child array
    removeChild(ffmpeg.pid)

    // Start a pending process
    if (checkPending())  {
      var pendingProcess = this.pendingProcesses.shift()
      spawnConvert(pendingProcess.spawnAttributes, pendingProcess.fileInfo)
    }
    
  });

  ffmpeg.on('error', (err) => {
    fileInfo.win.webContents.send('debug', 'Inside error')
    if (err) console.log(err)
  })

  ffmpeg.stdout.on('data', (data) => {
    fileInfo.win.webContents.send('debug', data)
  });
  
}

