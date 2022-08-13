/** Text file reader. 
 * Large files are read in chunks and returned line by line to and progress and prevent ùemory leaks.
 * @param {Object} options
 *  @param {number} [options.chunkSize=1E6]
 */
ol_ext_TextStreamReader = function(options) {
  options = options || {};
  this.chunkSize_ = options.chunkSize || 1E6;
}

/** Set reader chunk size
 * @param {number} [chunkSize=1E6]
 */
ol_ext_TextStreamReader.prototype.setChunkSize = function(s) {
  this.chunkSize_ = s || 1E6;
}

/** Read a text file line by line
 * @param {File} file
 * @param {function} getLine a function that gets the current line as argument. Return false to stop reading
 * @param {function} [progress] a function that gets the progress (beetween 0,1) and a boolean set to true on end
 */
ol_ext_TextStreamReader.prototype.read = function(file, getLine, progress) {
  var fileSize = (file.size - 1);
  var chunkSize = this.chunkSize_;
  var chunk = 0;
  var residue = '';

  // New reader
  var reader = new FileReader();
  // Parse chunk line by line
  reader.onload = function(e) {
    // Get lines
    var lines = e.target.result.replace(/\r/g,'').split('\n')
    lines[0] = residue +  lines[0] || '';
    residue = lines.pop();
    // getLine by line
    for (var i=0; i<lines.length; i++) {
      if (getLine(lines[i]) === false) {
        // Stop condition
        if (progress) progress(chunk / fileSize, true);
        return;
      };
    }
    if (progress) progress(chunk / fileSize, false);

    // Red next chunk
    chunk += chunkSize;
    if (chunk < fileSize) {
      readChunk();
    } else {
      if (residue) getLine(residue, 1);
      if (progress) progress(1, true);
    }
  }

  // Read chunk
  function readChunk() {
    var blob = file.slice(chunk, chunk + chunkSize);
    reader.readAsText(blob);
  }

  // Start
  readChunk();
}

export default ol_ext_TextStreamReader
