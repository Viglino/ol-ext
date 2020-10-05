/** IFrame API 
 * @internal
 */
var MapIFrameAPI = function(win) {
  this.win = win;
  this.counter = 0;
};
/** 
 * @param {string} key api function
 * @param {Object|function} fn argumnets list for setter or a getter function
 * @param {Object} data data sen dwith a getter
 */
 MapIFrameAPI.prototype.call = function(key, fn, data) {
  if (typeof(fn) === 'function') {
    var n = this.counter++;
    function listener(e) {
      if (e.data.counter === n) {
        fn.call(this, e.data.data);
        window.removeEventListener("message", listener);
      }
    }
    window.addEventListener("message", listener, false);
    this.win.postMessage({
      api: key,
      counter: n,
      data: data
    }, "*");
  } else {
    this.win.postMessage({
      api: key,
      data: fn
    }, "*");
  }
};
/** Add iframe listener
 * @param {string} key event key
 * @param {function} fn callback function
 * @return {function} IFrameListener
 */
 MapIFrameAPI.prototype.addIFrameListener = function(key, fn) {
  var callback = function(e) {
    if (e.data.api === key) {
      fn.call(this, e.data.data);
    }
  }.bind(this)
  window.addEventListener("message", callback, false);
  return callback;
};
/** Remove iframe listener
 * @param {function} listener IFrameListener
 */
 MapIFrameAPI.prototype.removeIFrameListener = function(listener) {
  window.removeEventListener("message", listener, false);
};
/** Get API whenready
 * @param {string|Element} iframe the iframe or the iframe ID
 * @param {function} ready a function that takes an api as first argument
 */
MapIFrameAPI.ready = function(iframe, ready) {
  var iframeWin;
  if (typeof(iframe)==='string') {
    iframeWin = document.getElementById(iframe).contentWindow;
  } else {
    iframeWin = iframe.contentWindow;
  }
  if (!iframeWin) {
    console.error('ERROR: Can\'t access iframe content');
    return;
  }
  function onready(e) {
    if (e.data.api==='ready') {
      ready(new MapIFrameAPI(iframeWin));
      window.removeEventListener("message", onready);
    }
  }
  window.addEventListener("message", onready, false);
  iframeWin.postMessage({
    api: 'ready'
  }, "*");
};
