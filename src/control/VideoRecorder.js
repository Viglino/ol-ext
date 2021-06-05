/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_Control from 'ol/control/Control'
import ol_ext_inherits from '../util/ext'
import ol_ext_element from '../util/element'
import ol_control_Print from './Print'
import ol_control_Dialog from './Dialog'

/** Record map canvas as video
 * @constructor
 * @fire start
 * @fire error
 * @fire stop
 * @fire pause
 * @fire resume
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {number} [options.framerate=30] framerate for the video
 *	@param {number} [options.videoBitsPerSecond=5000000] bitrate for the video
 *	@param {DOMElement|string} [options.videoTarget] video element or the container to add the video when finished or 'DIALOG' to show it in a dialog, default none
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
    element: element,
    target: options.target
  });
  this.set('framerate', 30);
  this.set('videoBitsPerSecond', 5000000);
  if (options.videoTarget === 'DIALOG') {
    this._dialog = new ol_control_Dialog({ 
      className: 'ol-fullscreen-dialog', 
      target: document.body, 
      closeBox: true 
    });
    this._videoTarget = this._dialog.getContentElement();
  } else {
    this._videoTarget = options.videoTarget;
  }

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
    if (this._dialog) this.getMap().removeControl(this._dialog);
  }
  ol_control_Control.prototype.setMap.call(this, map);
  if (this.getMap()) {
    this.getMap().addControl(this._printCtrl);
    if (this._dialog) this.getMap().addControl(this._dialog);
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
    var videoStream;
    try {
      videoStream = canvas.captureStream(this.get('framerate') || 30);
    } catch(e) {
      this.dispatchEvent({
        type: 'error',
        error: e
      });
      // console.warn(e);
      return;
    }
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
      if (this._videoTarget instanceof Element) {
        var video;
        if (this._videoTarget.tagName === 'VIDEO') {
          video = this._videoTarget;
        } else {
          video = this._videoTarget.querySelector('video');
          if (!video) {
            video = ol_ext_element.create('VIDEO', {
              controls: '',
              parent: this._videoTarget
            });
          }
        }
        if (this._dialog) this._dialog.show();
        video.src = URL.createObjectURL(blob);
        this.dispatchEvent({ type: 'stop', videoURL: video.src });
      } else {
        this.dispatchEvent({ type: 'stop', videoURL: URL.createObjectURL(blob) });
      }
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
    this.dispatchEvent({ type: 'start', canvas: canvas });
    this.element.setAttribute('data-state', 'rec');
  }.bind(this))
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
