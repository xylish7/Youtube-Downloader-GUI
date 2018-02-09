class Output  {
  constructor () {
    this.string
    this._raw_duration
    this.seconds
  }

  get searchTime () {
    return this.string.search("time=")
  }

  get duration () {
    return this.string.substring(this.searchTime + 5, this.searchTime + 13)
  } 
  
  rawDuration () {
    var hms = this.duration.split(':')
    return this.seconds = (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2]);
  }

  get percent () {
    return (100*this.rawDuration()/this._raw_duration).toFixed(2)
  }
}

module.exports = Output