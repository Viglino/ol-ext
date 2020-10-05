/*global ol*/
if (window.ol && !ol.ext) {
  ol.ext = {};
}

var ol_ext_IFrameAPI = function(map) {
  this.map = map;
  // Setter api
  this.setter = {};
  // Getter api (with a callback)
  this.getter = {};
  window.addEventListener("message", function(e) {
    switch (e.data.api) {
      case 'ready': {
        window.parent.postMessage({ api: 'ready' }, '*');
        break;
      }
      default: {
        if (this.setter[e.data.api]) {
          this.setter[e.data.api].call(this, e.data.data);
        } else if (this.getter[e.data.api]) {
          this.getter[e.data.api].call(this, e.data.data);
          window.parent.postMessage(e.data, '*');
        }
        break;
      }
    }
  }.bind(this), false);
  // ready
  window.parent.postMessage({
    api: 'ready'
  }, '*');
}
ol_ext_IFrameAPI.prototype.addSetter = function(key, fn) {
  this.setter[key] = fn;
}
ol_ext_IFrameAPI.prototype.addGetter = function(key, fn) {
  this.getter[key] = fn;
}
ol_ext_IFrameAPI.prototype.postMessage = function(key, data) {
  window.parent.postMessage({ 
    api: key,
    data: data
  }, '*');
}

export default ol_ext_IFrameAPI