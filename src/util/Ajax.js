import {inherits as ol_inherits} from 'ol'
import ol_Object from 'ol/Object'

/** Ajax request
 * @fires success
 * @fires error
 * @param {*} options
 *  @param {string} options.auth Authorisation as btoa("username:password");
 *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
 */
var ol_ext_Ajax = function(options) {
	ol_Object.call(this);

  this._auth = options.auth;
  this.set('dataType', 'JSON');
};
ol_inherits(ol_ext_Ajax, ol_Object);


/** Send an ajax request (GET)
 * @fires success
 * @fires error
 * @param {string} url
 * @param {*} data Data to send to the server as key / value
 */
ol_ext_Ajax.prototype.send = function (url, data){
	var self = this;
  // Url
  url = encodeURI(url);

  // Parameters
  var parameters = '';
	for (var index in data) {
		if (data.hasOwnProperty(index) && data[index]!==undefined) {
      parameters += (parameters ? '&' : '?') + index + '=' + data[index];
    }
	}

	// Abort previous request
	if (this._request) {
		this._request.abort();
	}

	// New request
	var ajax = this._request = new XMLHttpRequest();
	ajax.open('GET', url + parameters, true);
	if (this._auth) {
		ajax.setRequestHeader("Authorization", "Basic " + this._auth);
	}

  // Load complete
  this.dispatchEvent ({ type: 'loadstart' });
	ajax.onload = function() {
		self._request = null;
    self.dispatchEvent ({ type: 'loadend' });
    if (this.status >= 200 && this.status < 400) {
      var response;
      // Decode response
      try {
        switch (self.get('dataType')) {
          case 'JSON': {
            response = JSON.parse(this.response);
            break;
          }
          default: {
            response = this.response;
          }
        }
      } catch(e) {
        // Error
        self.dispatchEvent ({ 
          type: 'error',
          status: 0,
          statusText: 'parsererror',
          error: e,
          jqXHR: this
        });
        return;
      }
      // Success
      console.log('response',response)
      self.dispatchEvent ({ 
        type: 'success',
        response: response,
        status: this.status,
        statusText: this.statusText,
        jqXHR: this
      });
    } else {
      self.dispatchEvent ({ 
        type: 'error',
        status: this.status,
        statusText: this.statusText,
        jqXHR: this
      });
    }
	};

	// Oops
	ajax.onerror = function() {
    self._request = null;
    self.dispatchEvent ({ type: 'loadend' });
    self.dispatchEvent ({ 
      type: 'error',
      status: this.status,
      statusText: this.statusText,
      jqXHR: this
    });
  };

	// GO!
	ajax.send();
};

export default ol_ext_Ajax