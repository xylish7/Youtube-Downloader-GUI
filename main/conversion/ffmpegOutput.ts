class Output {
  string: string = "";
  _raw_duration: number = 0;
  seconds: number = 0;
  full_duration: number | null = null;

  get searchTime(): number {
    return this.string.search("time=");
  }

  get duration(): string {
    return this.string.substring(this.searchTime + 5, this.searchTime + 13);
  }

  rawDuration(): number {
    const hms = this.duration.split(":");
    return (this.seconds = +hms[0] * 60 * 60 + +hms[1] * 60 + +hms[2]);
  }

  get percent(): string {
    return ((100 * this.rawDuration()) / this._raw_duration).toFixed(2);
  }

  get fullDuration(): number {
    const startIndex = this.string.search("Duration:");
    const fileDuration = this.string.substring(
      startIndex + 10,
      startIndex + 18,
    );
    const hms = fileDuration.split(":");
    return +hms[0] * 60 * 60 + +hms[1] * 60 + +hms[2];
  }
}

export default Output;
