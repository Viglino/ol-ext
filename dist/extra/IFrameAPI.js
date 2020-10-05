/*global ol*/
if (window.ol && !ol.ext) {
  ol.ext = {};
}
ol.ext.IFrameAPI = function(map) {
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
ol.ext.IFrameAPI.prototype.addSetter = function(key, fn) {
  this.setter[key] = fn;
}
ol.ext.IFrameAPI.prototype.addGetter = function(key, fn) {
  this.getter[key] = fn;
}
ol.ext.IFrameAPI.prototype.postMessage = function(key, data) {
  window.parent.postMessage({ 
    api: key,
    data: data
  }, '*');
}
