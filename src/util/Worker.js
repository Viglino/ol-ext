
/** Worker helper to create a worker from code
 * @constructor
 * @param {function} mainFn main worker function
 * @param {object} options
 *  @param {function} [options.onMessage] a callback function to get worker result
 */
var ol_ext_Worker = class olextWorker {
  constructor(mainFn, options) {
    // Convert to function
    var mainStr = mainFn.toString().replace(/^.*\(/, 'function(');
    // Code
    var lines = ['var mainFn = ' + mainStr + `
    self.addEventListener("message", function(event) {
      var result = mainFn(event);
      self.postMessage(result);
    });`
    ];
    this.code_ = URL.createObjectURL(new Blob(lines, { type: 'text/javascript' }));
    this.onMessage_ = options.onMessage;
    this.start();
  }
  /** Terminate current worker and start a new one
   */
  start() {
    if (this.worker)
      this.worker.terminate();
    this.worker = new Worker(this.code_);
    this.worker.addEventListener('message', function (e) {
      this.onMessage_(e.data);
    }.bind(this));
  }
  /** Terminate a worker */
  terminate() {
    this.worker.terminate();
  }
  /** Post a new message to the worker
   * @param {object} message
   * @param {boolean} [restart=false] stop the worker and restart a new one
   */
  postMessage(message, restart) {
    if (restart)
      this.start();
    this.worker.postMessage(message);
  }
  /** Set onMessage callback
   * @param {function} fn a callback function to get worker result
   */
  onMessage(fn) {
    this.onMessage_ = fn;
  }
}

export default ol_ext_Worker
