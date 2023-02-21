/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js'

/** Print control to get an image of the map
 * @constructor
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.title button title
 *	@param {string} options.imageType A string indicating the image format, default image/jpeg
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
 *	@param {boolean} options.immediate force print even if render is not complete,  default false
 */
var ol_control_Print = class olcontrolPrint extends ol_control_Control {
  constructor(options) {
    options = options || {};

    var element = ol_ext_element.create('DIV', {
      className: (options.className || 'ol-print')
    });
    super({
      element: element,
      target: options.target
    });

    if (!options.target) {
      element.classList.add('ol-unselectable', 'ol-control');
      ol_ext_element.create('BUTTON', {
        type: 'button',
        title: options.title || 'Print',
        click: function () { this.print(); }.bind(this),
        parent: element
      });
    }

    this.set('immediate', options.immediate);
    this.set('imageType', options.imageType || 'image/jpeg');
    this.set('quality', options.quality || .8);
    this.set('orientation', options.orientation);
  }
  /** Helper function to copy result to clipboard
   * @param {Event} e print event
   * @return {boolean}
   * @private
   */
  toClipboard(e, callback) {
    try {
      e.canvas.toBlob(function (blob) {
        try {
          navigator.clipboard.write([
            new window.ClipboardItem(
              Object.defineProperty({}, blob.type, {
                value: blob,
                enumerable: true
              })
            )
          ]);
          if (typeof (callback) === 'function')
            callback(true);
        } catch (err) {
          if (typeof (callback) === 'function')
            callback(false);
        }
      });
    } catch (err) {
      if (typeof (callback) === 'function')
        callback(false);
    }
  }
  /** Helper function to copy result to clipboard
   * @param {any} options print options
   * @param {function} callback a callback function that takes a boolean if copy
   */
  copyMap(options, callback) {
    this.once('print', function (e) {
      this.toClipboard(e, callback);
    }.bind(this));
    this.print(options);
  }
  /** Get map canvas
   * @private
   */
  _getCanvas(event, imageType, canvas) {
    var ctx;
    // ol <= 5 : get the canvas
    if (event.context) {
      canvas = event.context.canvas;
    } else {
      // Create a canvas if none
      if (!canvas) {
        canvas = document.createElement('canvas');
        var size = this.getMap().getSize();
        canvas.width = size[0];
        canvas.height = size[1];
        ctx = canvas.getContext('2d');
        if (/jp.*g$/.test(imageType)) {
          ctx.fillStyle = this.get('bgColor') || 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx = canvas.getContext('2d');
      }
      // ol6+ : create canvas using layer canvas
      this.getMap().getViewport().querySelectorAll('.ol-layers canvas, canvas.ol-fixedoverlay').forEach(function (c) {
        if (c.width) {
          ctx.save();
          // opacity
          if (c.parentNode.style.opacity === '0')
            return;
          ctx.globalAlpha = parseFloat(c.parentNode.style.opacity) || 1;
          // Blend mode & filter
          ctx.globalCompositeOperation = ol_ext_element.getStyle(c.parentNode, 'mix-blend-mode');
          ctx.filter = ol_ext_element.getStyle(c.parentNode, 'filter');
          // transform
          var tr = ol_ext_element.getStyle(c, 'transform') || ol_ext_element.getStyle(c, '-webkit-transform');
          if (/^matrix/.test(tr)) {
            tr = tr.replace(/^matrix\(|\)$/g, '').split(',');
            tr.forEach(function (t, i) { tr[i] = parseFloat(t); });
            ctx.transform(tr[0], tr[1], tr[2], tr[3], tr[4], tr[5]);
            ctx.drawImage(c, 0, 0);
          } else {
            ctx.drawImage(c, 0, 0, ol_ext_element.getStyle(c, 'width'), ol_ext_element.getStyle(c, 'height'));
          }
          ctx.restore();
        }
      }.bind(this));
    }
    return canvas;
  }
  /** Fast print
   * @param {*} options print options
   *  @param {HTMLCanvasElement|undefined} [options.canvas] if none create one, only for ol@6+
   *  @parama {string} options.imageType
   */
  fastPrint(options, callback) {
    options = options || {};
    if (this._ol6) {
      requestAnimationFrame(function () {
        callback(this._getCanvas({}, options.imageType, options.canvas));
      }.bind(this));
    } else {
      this.getMap().once('postcompose', function (event) {
        if (!event.context)
          this._ol6 = true;
        callback(this._getCanvas(event, options.imageType, options.canvas));
      }.bind(this));
      this.getMap().render();
    }
  }
  /** Print the map
   * @param {Object} options
   *	@param {string} options.imageType A string indicating the image format, default the control one
   *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
   *  @param {boolean} options.immediate true to prevent delay for printing
   *  @param {boolean} [options.size=[210,297]]
   *  @param {boolean} [options.format=a4]
   *  @param {boolean} [options.orient] default control orientation
   *  @param {boolean} [options.margin=10]
   *  @param {*} options.any any options passed to the print event when fired
   * @api
   */
  print(options) {
    options = options || {};

    var imageType = options.imageType || this.get('imageType');
    var quality = options.quality || this.get('quality');
    if (this.getMap()) {
      if (options.immediate !== 'silent') {
        this.dispatchEvent(Object.assign({
          type: 'printing',
        }, options));
      }
      // Start printing after delay to let user show info in the DOM
      if (!options.immediate) {
        setTimeout(function () {
          options = Object.assign({}, options);
          options.immediate = 'silent';
          this.print(options);
        }.bind(this), 200);
        return;
      }
      // Run printing
      this.getMap().once(this.get('immediate') ? 'postcompose' : 'rendercomplete', function (event) {
        var canvas = this._getCanvas(event, imageType);
        // Calculate print format
        var size = options.size || [210, 297];
        var format = options.format || 'a4';
        var w, h, position;
        var orient = options.orient || this.get('orientation');
        var margin = typeof (options.margin) === 'number' ? options.margin : 10;
        if (canvas) {
          // Calculate size
          if (orient !== 'landscape' && orient !== 'portrait') {
            orient = (canvas.width > canvas.height) ? 'landscape' : 'portrait';
          }
          if (orient === 'landscape')
            size = [size[1], size[0]];
          var sc = Math.min((size[0] - 2 * margin) / canvas.width, (size[1] - 2 * margin) / canvas.height);
          w = sc * canvas.width;
          h = sc * canvas.height;
          // Image position
          position = [(size[0] - w) / 2, (size[1] - h) / 2];
        }
        // get the canvas image
        var image;
        try {
          image = canvas ? canvas.toDataURL(imageType, quality) : null;
        } catch (e) {
          // Fire error event
          this.dispatchEvent({
            type: 'error',
            canvas: canvas
          });
          return;
        }
        // Fire print event
        var e = Object.assign({
          type: 'print',
          print: {
            format: format,
            orientation: orient,
            unit: 'mm',
            size: size,
            position: position,
            imageWidth: w,
            imageHeight: h
          },
          image: image,
          imageType: imageType,
          quality: quality,
          canvas: canvas
        }, options);
        this.dispatchEvent(e);
      }.bind(this));
      this.getMap().render();
    }
  }
}

export default ol_control_Print
