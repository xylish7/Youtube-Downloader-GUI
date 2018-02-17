var fs = require('fs')
var path = require('path')
var spawn = require('cross-spawn-async');
var Output = require('./ffmpegOutput.js');

exports.childProcesses = []

var pendingProcesses = []
exports.convertVideo = (playlistInfo, downloadInfo) => {
  var spawnAttributes = {
    ffmpeg_path: path.resolve(__dirname, '..', '..', 'node_modules', 'youtube-dl', 'bin', 'ffmpeg.exe'),
    args: [
      '-i', 
      `${downloadInfo.savePath}\\${playlistInfo.dynamic.title}.webm`,
      '-map', '0:a:0',
      '-b:a', '96k',
      '-y',
      `${downloadInfo.savePath}\\${playlistInfo.dynamic.title}.mp3`
      ],
    options: {
      detached: false
    }
  }
  

  if (!checkAvailability()) {
    var processAttributes = {
      spawnAttributes,
      playlistInfo,
      downloadInfo
    }
    pendingProcesses.push(processAttributes)

  }
  else {
    if (!checkPending()) {
      spawnChild(spawnAttributes, playlistInfo, downloadInfo)
    }
    else {
      spawnChild(pendingProcesses.shift(), playlistInfo, downloadInfo)
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
    if (sendData.playlist_index == playlistInfo.static.n_entries) {
      sendData.conversionFinished = true;
    }
    
    if (code == 0)
      if (playlistInfo.static.keepFiles == 'false'){
        fs.unlinkSync(`${downloadInfo.savePath}\\${sendData.title}.webm`);
        playlistInfo.static.win.webContents.send('conversion-done', sendData)
      }

    // Remove pid from child array
    removeChild(ffmpeg.pid)

    // Start a pending process
    if (checkPending())  {
      var pendingProcess = pendingProcesses.shift()
      spawnChild(pendingProcess.spawnAttributes, pendingProcess.playlistInfo, pendingProcess.downloadInfo)
    }
    
  });
}

var removeChild = (childPid) => {
  this.childProcesses = this.childProcesses.filter(pid => pid != childPid)
}

var checkAvailability = (pendingVideo) => {
  if (this.childProcesses.length == 4) return false
  else return true
}

var checkPending = () => {
  if (pendingProcesses.length == 0) return false
  else return true
}
