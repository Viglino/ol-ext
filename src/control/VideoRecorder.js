/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_Control from 'ol/control/Control'
import ol_ext_inherits from '../util/ext'
import ol_ext_element from '../util/element'
import ol_control_Print from './Print'

/** Print control to get an image of the map
 * @constructor
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {number} [options.framerate=30] framerate for the video
 *	@param {number} [options.videoBitsPerSecond=5000000] bitrate for the video
 */
var ol_control_VideoRecorder = function(options) {
  if (!options) options = {};

  var element = ol_ext_element.create('DIV', {
    className: (options.className || 'ol-videorec') + ' ol-unselectable ol-control'
  });
  // buttons
  ol_ext_element.create('BUTTON', {
    type: 'button',
    className: 'ol-start',
    title: 'start',
    click: function() { 
      this.start();
    }.bind(this),
    parent: element
  });
  ol_ext_element.create('BUTTON', {
    type: 'button',
    className: 'ol-stop',
    title: 'stop',
    click: function() { 
      this.stop();
    }.bind(this),
    parent: element
  });
  ol_ext_element.create('BUTTON', {
    type: 'button',
    className: 'ol-pause',
    title: 'pause',
    click: function() { 
      this.pause();
    }.bind(this),
    parent: element
  });
  ol_ext_element.create('BUTTON', {
    type: 'button',
    className: 'ol-resume',
    title: 'resume',
    click: function() {
      this.resume();
    }.bind(this),
    parent: element
  });

  // Start
  ol_control_Control.call(this, {
    element: element
  });
  this.set('framerate', 30);
  this.set('videoBitsPerSecond', 5000000);

  // Print control
  this._printCtrl = new ol_control_Print({
    target: ol_ext_element.create('DIV')
  });
}
ol_ext_inherits(ol_control_VideoRecorder, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
 ol_control_VideoRecorder.prototype.setMap = function (map) {
  if (this.getMap()) {
    this.getMap().removeControl(this._printCtrl);
  }
  ol_control_Control.prototype.setMap.call(this, map);
  if (this.getMap()) {
    this.getMap().addControl(this._printCtrl);
  }
};

/** Start recording */
ol_control_VideoRecorder.prototype.start = function () {
  var print = this._printCtrl;
  var stop = false;
  function capture(canvas) {
    if (stop) return;
    print.fastPrint({
      canvas: canvas
    }, capture);
  }
  print.fastPrint({}, function(canvas) {
    var videoStream = canvas.captureStream(this.get('framerate') || 30); // the parameter is the desired framerate, see the MDN doc for more info
    this._mediaRecorder = new MediaRecorder(videoStream, {
      videoBitsPerSecond : this.get('videoBitsPerSecond') || 5000000
    });
    var chunks = [];
    this._mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };
    this._mediaRecorder.onstop = function() {
      stop = true;
      var blob = new Blob(chunks, { 'type' : 'video/mp4' }); // other types are available such as 'video/webm' for instance, see the doc for more info
      chunks = [];
      this.dispatchEvent({ type: 'stop', videoURL: URL.createObjectURL(blob) });
    }.bind(this);
    this._mediaRecorder.onpause = function() {
      stop = true;
      this.dispatchEvent({ type: 'pause' });
    }.bind(this);
    this._mediaRecorder.onresume = function() {
      stop = false;
      capture(canvas);
      this.dispatchEvent({ type: 'resume' });
    }.bind(this);
    this._mediaRecorder.onerror = function(e) {
      this.dispatchEvent({ type: 'error', error: e });
    }.bind(this);

    stop = false;
    capture(canvas);
    this._mediaRecorder.start();
    this.dispatchEvent({ type: 'start' });
  }.bind(this))
  this.element.setAttribute('data-state', 'rec');
};

/** Stop recording */
ol_control_VideoRecorder.prototype.stop = function () {
  if (this._mediaRecorder) {
    this._mediaRecorder.stop();
    this._mediaRecorder = null;
    this.element.setAttribute('data-state', 'inactive');
  }
};

/** Pause recording */
ol_control_VideoRecorder.prototype.pause = function () {
  if (this._mediaRecorder) {
    this._mediaRecorder.pause();
    this.element.setAttribute('data-state', 'pause');
  }
};

/** Resume recording after pause */
ol_control_VideoRecorder.prototype.resume = function () {
  if (this._mediaRecorder) {
    this._mediaRecorder.resume();
    this.element.setAttribute('data-state', 'rec');
  }
};

export default ol_control_VideoRecorder
