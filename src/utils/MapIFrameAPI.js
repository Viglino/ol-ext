/** IFrame API 
 * @constructor 
 * @param {Window} win
 * @param {number} id
 * @param {string} targetOrigin
 * @internal
 */
var MapIFrameAPI = function(win, id, targetOrigin) {
  // IFrame
  this.win = win;
  // API id
  this.id = id;
  // 
  this.targetOrigin = targetOrigin;
  // Callback counter
  this.counter = 0;
  // List of function
  this.fn = {
    on: function(key, fn) {
      return this.addIFrameListener(key, fn);
    }.bind(this),
    un: function(listener) {
      return this.removeIFrameListener(listener);
    }.bind(this),
    mapInput: function(key, input, value) {
      if (!(input instanceof Element)) {
        input = document.getElementById(input);
      }
      if (input.tagName==='INPUT') {
        if (value) input.value = value;
        // Set change
        this.addIFrameListener(key, function(data) {
          input.value = data;
        }, value);
        // Get input change
        input.addEventListener('change', function() {
          this.call(key, input.value);
        }.bind(this));
      }
    }.bind(this)
  };
  // list of listener
  this.listener = {};
  // Get API fn
  window.addEventListener('message', function(e) {
    if (e.data.id === this.id && e.data.api === 'getAPI') {
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
    data = undefined;
  }
  if (typeof(fn) === 'function') {
    var n = this.counter++;
    var listener = function(e) {
      if (e.data.id === this.id && e.data.counter === n) {
        fn.call(this, e.data.data);
        window.removeEventListener('message', listener);
      }
    }.bind(this);
    window.addEventListener('message', listener, false);
    this.win.postMessage({
      api: key,
      id: this.id,
      counter: n,
      data: data
    }, this.targetOrigin);
  } else {
    this.win.postMessage({
      api: key,
      id: this.id,
      data: data
    }, this.targetOrigin);
  }
};

/** Add iframe listener
 * @param {string} key event key
 * @param {function} fn callback function
 * @return {function} IFrameListener
 */
MapIFrameAPI.prototype.addIFrameListener = function(key, fn, data) {
  var callback = function(e) {
    if (e.data.id === this.id && e.data.api === key) {
      fn.call(this, e.data.data);
    }
  }.bind(this)
  window.addEventListener('message', callback, false);
  if (!this.listener[key]) {
    this.listener[key] = data;
  }
  return callback;
};

/** Remove iframe listener
 * @param {function} listener IFrameListener
 */
 MapIFrameAPI.prototype.removeIFrameListener = function(listener) {
  window.removeEventListener('message', listener, false);
};

MapIFrameAPI.prototype.idAPI = 1;


/** Get API whenready
 * @param {string|Element} iframe the iframe or the iframe ID
 * @param {function} ready a function that takes an api as first argument
 * @param {string} targetOrigin
 */
MapIFrameAPI.ready = function(iframe, ready, targetOrigin) {
  console.log('ready')
  var idAPI = MapIFrameAPI.prototype.idAPI++;
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
    if (e.data.api==='ready') {
      if (!e.data.id)  {
        iframeWin.postMessage({
          api: 'ready',
          id: idAPI
        }, targetOrigin);
      } else if (e.data.id===idAPI) {
        var api = new MapIFrameAPI(iframeWin, idAPI, targetOrigin);
        window.removeEventListener('message', onready);
        api.call('getAPI', null,  function() {
          ready(api.fn);
          // register listeners
          for (let k in api.listener) {
            api.win.postMessage({
              listener: k,
              data: api.listener[k]
            }, targetOrigin);
          }
        });
      }
    }
  }
  window.addEventListener('message', onready, false);
  iframeWin.postMessage({
    api: 'ready'
  }, targetOrigin);
};

export default MapIFrameAPI
