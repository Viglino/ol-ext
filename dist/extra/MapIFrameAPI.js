/** IFrame API 
 * @internal
 */
var MapIFrameAPI = function(win, targetOrigin) {
  this.win = win;
  this.targetOrigin = targetOrigin;
  this.counter = 0;
  this.fn = {};
  window.addEventListener("message", function(e) {
    if (e.data.api === 'getAPI') {
      var name = e.data.data;
      name.forEach(function(n) {
        this.fn[n] = function(data, fn) {
          this.call(n, data, fn);
        }.bind(this)
      }.bind(this));
    }
  }.bind(this), false);
};
/** 
 * @param {string} key api function
 * @param {Object|function} data argments or a callback function to get returned Transferable
 * @param {function} fn callback function to get returned Transferable
 */
 MapIFrameAPI.prototype.call = function(key, data, fn) {
  if (typeof(data)==='function') { 
    fn = data;
    data = {};
  }
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
    }, this.targetOrigin);
  } else {
    this.win.postMessage({
      api: key,
      data: data
    }, this.targetOrigin);
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
 * @param {string} targetOrigin
 */
MapIFrameAPI.ready = function(iframe, ready, targetOrigin) {
  targetOrigin = targetOrigin || '*';
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
    var api = new MapIFrameAPI(iframeWin, targetOrigin);
    window.removeEventListener('message', onready);
    api.call('getAPI', null,  function() {
      ready(api);
    });
  }
  window.addEventListener('message', onready, false);
  iframeWin.postMessage({
    api: 'ready'
  }, '*');
};
