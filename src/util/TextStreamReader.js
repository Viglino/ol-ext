/** Text file reader (chunk by chunk, line by line). 
 * Large files are read in chunks and returned line by line 
 * to handle read progress and prevent memory leaks.
 * @param {Object} options
 *  @param {File} [options.file]
 *  @param {number} [options.chunkSize=1E6]
 */
var ol_ext_TextStreamReader = function(options) {
  options = options || {};
  this.setChunkSize(options.chunkSize);
  this.setFile(options.file);
  this.reader_ = new FileReader();
};

/** Set file to read
 * @param {File} file
 */
ol_ext_TextStreamReader.prototype.setFile = function(file) {
  this.file_ = file;
  this.fileSize_ = (this.file_.size - 1);
  this.rewind();
}

/** Sets the file position indicator to the beginning of the file stream.
 */
ol_ext_TextStreamReader.prototype.rewind = function() {
  this.chunk_ = 0;
  this.residue_ = '';
};

/** Set reader chunk size
 * @param {number} [chunkSize=1E6]
 */
ol_ext_TextStreamReader.prototype.setChunkSize = function(s) {
  this.chunkSize_ = s || 1E6;
};

/** Get progress
 * @return {number} progress [0,1]
 */
ol_ext_TextStreamReader.prototype.getProgress = function() {
  return this.chunk_ / this.fileSize_;
};

/** Read a text file line by line from the start
 * @param {function} getLine a function that gets the current line as argument. Return false to stop reading
 * @param {function} [progress] a function that gets the progress on each chunk (beetween 0,1) and a boolean set to true on end
 */
ol_ext_TextStreamReader.prototype.readLines = function(getLine, progress) {
  this.rewind();
  this.readChunk(function(lines) {
    // getLine by line
    for (var i=0; i<lines.length; i++) {
      if (getLine(lines[i]) === false) {
        // Stop condition
        if (progress) progress(this.chunk_ / this.fileSize_, true);
        return;
      }
    }
    if (progress) progress(this.chunk_ / this.fileSize_, false);
    // Red next chunk
    if (!this.nexChunk_() && progress)  {
      // EOF
      progress(1, true);
    }
  }.bind(this), progress);
};

/** Read a set of line chunk from the stream
 * @param {function} getLines a function that gets lines read as an Array<String>.
 * @param {function} [progress] a function that gets the progress (beetween 0,1) and a boolean set to true on end of file
 */
ol_ext_TextStreamReader.prototype.readChunk = function(getLines) {
  // Parse chunk line by line
  this.reader_.onload = function(e) {
    // Get lines
    var lines = e.target.result.replace(/\r/g,'').split('\n')
    lines[0] = this.residue_ +  lines[0] || '';
    // next
    this.chunk_ += this.chunkSize_;
    // more to read?
    if (this.chunk_ < this.fileSize_) {
      this.residue_ = lines.pop();
    } else {
      this.residue_ = '';
    }
    // Get lines
    getLines(lines);
  }.bind(this)

  // Read next chunk
  this.nexChunk_();
};

/** Read next chunk
 * @private
 */
ol_ext_TextStreamReader.prototype.nexChunk_ = function() {
  if (this.chunk_ < this.fileSize_) {
    var blob = this.file_.slice(this.chunk_, this.chunk_ + this.chunkSize_);
    this.reader_.readAsText(blob);
    return true;
  }
  return false;
};

export default ol_ext_TextStreamReader
