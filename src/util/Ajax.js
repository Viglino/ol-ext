import ol_Object from 'ol/Object.js'

/** Ajax request
 * @fires success
 * @fires error
 * @param {*} options
 *  @param {string} options.auth Authorisation as btoa("username:password");
 *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
 */
var ol_ext_Ajax = class olextAjax extends ol_Object {
  constructor(options) {
    options = options || {};

    super();

    this._auth = options.auth;
    this.set('dataType', options.dataType || 'JSON');
  }
  /** Helper for get
   * @param {*} options
   *  @param {string} options.url
   *  @param {string} options.auth Authorisation as btoa("username:password");
   *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
   *  @param {string} options.success
   *  @param {string} options.error
   *  @param {*} options.options get options
   */
  static get(options) {
    var ajax = new ol_ext_Ajax(options);
    if (options.success)
      ajax.on('success', function (e) { options.success(e.response, e); });
    if (options.error)
      ajax.on('error', function (e) { options.error(e); });
    ajax.send(options.url, options.data, options.options);
  }
  /** Helper to get cors header
   * @param {string} url
   * @param {string} callback
   */
  static getCORS(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send();
    request.onreadystatechange = function () {
      if (this.readyState == this.HEADERS_RECEIVED) {
        callback(request.getResponseHeader('Access-Control-Allow-Origin'));
      }
    };
  }
  /** Send an ajax request (GET)
   * @fires success
   * @fires error
   * @param {string} url
   * @param {*} data Data to send to the server as key / value
   * @param {*} options a set of options that are returned in the
   *  @param {boolean} options.abort false to prevent aborting the current request, default true
   */
  send(url, data, options) {
    options = options || {};
    var self = this;
    // Url
    var encode = (options.encode !== false);
    if (encode)
      url = encodeURI(url);

    // Parameters
    var parameters = '';
    for (var index in data) {
      if (data.hasOwnProperty(index) && data[index] !== undefined) {
        parameters += (parameters ? '&' : '?') + index + '=' + (encode ? encodeURIComponent(data[index]) : data[index]);
      }
    }

    // Abort previous request
    if (this._request && options.abort !== false) {
      this._request.abort();
    }

    // New request
    var ajax = this._request = new XMLHttpRequest();
    ajax.open('GET', url + parameters, true);
    if (options.timeout)
      ajax.timeout = options.timeout;
    if (this._auth) {
      ajax.setRequestHeader("Authorization", "Basic " + this._auth);
    }

    // Load complete
    this.dispatchEvent({ type: 'loadstart' });
    ajax.onload = function () {
      self._request = null;
      self.dispatchEvent({ type: 'loadend' });
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
        } catch (e) {
          // Error
          self.dispatchEvent({
            type: 'error',
            status: 0,
            statusText: 'parsererror',
            error: e,
            options: options,
            jqXHR: this
          });
          return;
        }
        // Success
        //console.log('response',response)
        self.dispatchEvent({
          type: 'success',
          response: response,
          status: this.status,
          statusText: this.statusText,
          options: options,
          jqXHR: this
        });
      } else {
        self.dispatchEvent({
          type: 'error',
          status: this.status,
          statusText: this.statusText,
          options: options,
          jqXHR: this
        });
      }
    };

    // Oops
    ajax.ontimeout = function () {
      self._request = null;
      self.dispatchEvent({ type: 'loadend' });
      self.dispatchEvent({
        type: 'error',
        status: this.status,
        statusText: 'Timeout',
        options: options,
        jqXHR: this
      });
    };
    ajax.onerror = function () {
      self._request = null;
      self.dispatchEvent({ type: 'loadend' });
      self.dispatchEvent({
        type: 'error',
        status: this.status,
        statusText: this.statusText,
        options: options,
        jqXHR: this
      });
    };

    // GO!
    ajax.send();
  }
}

export default ol_ext_Ajax