/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element'

/** Print control to get an image of the map
 *
 * @constructor
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {string} options.imageType A string indicating the image format, default image/jpeg
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
 */
var ol_control_Print = function(options) {
  if (!options) options = {};
  
  var element = ol_ext_element.create('DIV', {
    className: (options.className || 'ol-print')
  });

  if (!options.target) {
    element.classList.add('ol-unselectable', 'ol-control');
    ol_ext_element.create('BUTTON', {
      type: 'button',
      click: function() { this.print(); }.bind(this),
      parent: element
    });
  }

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  this.set('imageType', options.imageType || 'image/jpeg');
  this.set('quality', options.quality || .8);
  this.set('orientation', options.orientation);
};
ol_ext_inherits(ol_control_Print, ol_control_Control);

/** Print the map
 * @param {function} cback a callback function that take a string containing the requested data URI.
 * @param {Object} options
 *	@param {string} options.imageType A string indicating the image format, default the control one
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *  @param {boolean} options.immediate true to prevent delay for printing
 *  @param {*} options.any any options passed to the print event when fired
 * @api
 */
ol_control_Print.prototype.print = function(options) {
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
      setTimeout (function () {
        options = Object.assign({}, options);
        options.immediate = 'silent';
        this.print(options);
      }.bind(this), 200);
      return;
    }
    // Run printing
    this.getMap().once('rendercomplete', function(event) {
      var canvas, ctx;
      // ol <= 5 : get the canvas
      if (event.context) {
        canvas = event.context.canvas;
      } else {
        // ol6+ : create canvas using layer canvas
        this.getMap().getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-fixedoverlay').forEach(function(c) {
          if (c.width) {
            // Create a canvas if none
            if (!canvas) {
              canvas = document.createElement('canvas');
              var size = this.getMap().getSize();
              canvas.width = size[0];
              canvas.height = size[1];
              ctx = canvas.getContext('2d');
              if (/jp.*g$/.test(imageType)) {
                ctx.fillStyle = this.get('bgColor') || 'white';
                ctx.fillRect(0,0,canvas.width,canvas.height);		
              }
            }
            ctx.save();
            // opacity
            if (c.parentNode.style.opacity==='0') return;
            ctx.globalAlpha = parseFloat(c.parentNode.style.opacity) || 1;
            // transform
            var tr = ol_ext_element.getStyle(c,'transform') || ol_ext_element.getStyle(c,'-webkit-transform');
            if (/^matrix/.test(tr)) {
              tr = tr.replace(/^matrix\(|\)$/g,'').split(',');
              tr.forEach(function(t,i) { tr[i] = parseFloat(t); });
              ctx.transform(tr[0],tr[1],tr[2],tr[3],tr[4],tr[5]);
              ctx.drawImage(c, 0, 0);
            } else {
              ctx.drawImage(c, 0, 0, ol_ext_element.getStyle(c,'width'), ol_ext_element.getStyle(c,'height'));
            }
            ctx.restore();
          }
        }.bind(this));
      }
      // Calculate print format
      var size = [210,297], format = 'a4';
      var w, h, position;
      var orient = options.orient || this.get('orientation');
      var margin = options.margin || 10;
      if (canvas) {
        // Calculate size
        if (orient!=='landscape' && orient!=='portrait') {
          orient = (canvas.width > canvas.height) ? 'landscape' : 'portrait';
        }
        if (orient === 'landscape') size = [size[1],size[0]];
        var sc = Math.min ((size[0]-2*margin)/canvas.width,(size[1]-2*margin)/canvas.height);
        w = sc * canvas.width;
        h = sc * canvas.height;
        // Image position
        position = [(size[0] - w)/2, (size[1] - h)/2];
      }
      // get the canvas image
      var image;
      try { 
        image = canvas ? canvas.toDataURL(imageType, quality) : null;
      } catch(e) {
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
        canvas: canvas
      }, options);
      this.dispatchEvent(e);
    }.bind(this));
    this.getMap().render();
  }
};

export default ol_control_Print
