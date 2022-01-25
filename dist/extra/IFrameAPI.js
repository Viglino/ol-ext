/*global ol*/
if (window.ol && !ol.ext) {
  ol.ext = {};
}
/** IFrame API create an api and wait the target ready
 * @constructor 
 * @param {string} targetOrigin, default '*'
 */
ol.ext.IFrameAPI = function(targetOrigin) {
  this.targetOrigin = targetOrigin || '*';
  this.id = -1;
  this.properties = {};
  // Setter api
  this.setter = {};
  // Listener api
  this.listener = {};
  // Nothing to do there
  if (window.parent === window) return;
  // Wait for target ready
  window.addEventListener('message', function(e) {
    if (e.data.listener) {
      if (this.listener[e.data.listener]) {
        this.listener[e.data.listener].call(e.data.data);
      }
    } else {
      switch (e.data.api) {
        case 'ready': {
          this.ready = true;
          this.id = e.data.id;
          window.parent.postMessage(e.data, this.targetOrigin);
          break;
        }
        case 'getAPI': {
          e.data.data = Object.keys(this.setter);
          e.data.id = this.id;
          window.parent.postMessage(e.data, this.targetOrigin);
          break;
        }
        default: {
          if (this.setter[e.data.api]) {
            var data = this.setter[e.data.api].call(this, e.data.data);
            if (data !== undefined) {
              e.data.data = data;
              e.data.id = this.id;
              window.parent.postMessage(e.data, this.targetOrigin);
            }
          }
          break;
        }
      }
    }
  }.bind(this), false);
  // ready
  window.parent.postMessage({
    api: 'ready'
  }, this.targetOrigin);
}
/** Add properties
 * @param {string} key
 * @param {*} value
 */
ol.ext.IFrameAPI.prototype.set = function(key, value) {
  this.properties[key] = value;
};
/** Get properties
 * @param {string} key
 * @return {*}
 */
ol.ext.IFrameAPI.prototype.get = function(key) {
  return this.properties[key];
};
/** 
 * @typedef {Object} TemplateAPI
 * @property {string} name api name
 * @property {function} function if return a Transferable it will be send to the iFrame
 */
/** Add functions to the API 
 * @param {Array<TemplateAPI>} list of functions to add to the api
 */
ol.ext.IFrameAPI.prototype.setAPI = function(api) {
  if (/\bready\b|\bgetAPI\b|\bon\b|\bun\b|\baddInput\b/.test(api)) {
    console.error('Bad API key: '+api);
  } else {
    for (var k in api) {
      this.setter[k] = api[k];
      window.parent.postMessage({
        api: 'getAPI',
        id: this.id,
        data: [k]
      }, this.targetOrigin);
    }
  }
};
/** Post a message to the iframe
 * @param {string} name api name
 * @param {Transferable } data object to transfer to the iframe
 */
ol.ext.IFrameAPI.prototype.postMessage = function(name, data) {
  window.parent.postMessage({ 
    api: name,
    id: this.id,
    data: data
  }, this.targetOrigin);
};
ol.ext.IFrameAPI.prototype.addListener = function(name, listener) {
  this.listener[name] = listener;
};
