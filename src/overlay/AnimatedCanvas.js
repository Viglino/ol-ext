/*	Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_Overlay from 'ol/Overlay.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_ext_element from '../util/element.js';
import ol_particule_Base from '../particule/Base.js';

/** An overlay to play animations on top of the map
 * The overlay define a set of particules animated on top of the map.
 * Particules are objects with coordinates.
 * They are dawn in a canvas using the draw particule method. 
 * The update particule method updates the particule position according to the timelapse
 *
 * @constructor
 * @extends {ol_Overlay}
 * @param {*} options
 *  @param {String} options.className class of the Overlay
 *  @param {number} option.density particule density, default .5
 *  @param {number} option.speed particule speed, default 4
 *  @param {number} option.angle particule angle in radian, default PI/4
 *  @param {boolean} options.animate start animation, default true
 *  @param {number} options.fps frame per second, default 25
 */
var ol_Overlay_AnimatedCanvas = class olOverlayAnimatedCanvas extends ol_Overlay {
  constructor(options) {
    options = options || {};

    var canvas = ol_ext_element.create('CANVAS', {
      className: ((options.className || '') + ' ol-animated-overlay').trim()
    });
    super({
      element: canvas,
      stopEvent: false
    });
    
    this._canvas = canvas;
    this._ctx = this._canvas.getContext('2d');

    this._listener = [];
    this._time = 0;
    this._particuleClass = options.particule || ol_particule_Base;
    if (options.createParticule)
      this._createParticule = options.createParticule;
    // 25fps
    this._fps = 1000 / (options.fps || 25);

    // Default particules properties
    var p = this._createParticule();
    this._psize = p.get('size') || [50, 50];
    this.set('density', options.density || .5);
    this.set('speed', options.speed || 4);
    this.set('angle', typeof (options.angle) === 'number' ? options.angle : Math.PI / 4);

    if (options.animate !== false)
      this.setAnimation(true);

    // Prevent animation when window on background
    document.addEventListener("visibilitychange", function () {
      this._pause = true;
    }.bind(this));
  }
  /** Set the visibility
   * @param {boolean} b
   */
  setVisible(b) {
    this.element.style.display = b ? 'block' : 'none';
    if (b)
      this.setAnimation(this.get('animation'));
  }
  /** Get the visibility
   * @return {boolean} b
   */
  getVisible() {
    return this.element.style.display != 'none';
  }
  /** No update for this overlay
   */
  updatePixelPosition() { }
  /**
   * Set the map instance the overlay is associated with
   * @param {ol.Map} map The map instance.
   */
  setMap(map) {
    if (this.getMap()) {
      this.getMap().getViewport().querySelector('.ol-overlaycontainer').removeChild(this._canvas);
    }
    this._listener.forEach(function (l) {
      ol_Observable_unByKey(l);
    });
    this._listener = [];

    super.setMap(map);

    if (map) {
      var size = map.getSize();
      this._canvas.width = size[0];
      this._canvas.height = size[1];
      this.draw();
      this._listener.push(map.on('change:size', function () {
        var size = map.getSize();
        if (this._canvas.width !== size[0] || this._canvas.height !== size[1]) {
          this._canvas.width = size[0];
          this._canvas.height = size[1];
          this.draw();
        }
      }.bind(this)));
    }
  }
  /** Create particules or return exiting ones
   */
  getParticules() {
    var w = this._psize[0];
    var h = this._psize[1];
    var d = (this.get('density') * this._canvas.width * this._canvas.height / w / h) << 0;
    if (!this._particules)
      this._particules = [];
    if (d > this._particules.length) {
      for (var i = this._particules.length; i < d; i++) {
        this._particules.push(this._createParticule(this, this.randomCoord()));
      }
    } else {
      this._particules.length = d;
    }
    return this._particules;
  }
  /** Create a particule
   * @private
   */
  _createParticule(overlay, coordinate) {
    return new this._particuleClass({
      overlay: overlay,
      coordinate: coordinate
    });
  }
  /** Get random coordinates on canvas
   */
  randomCoord() {
    return [
      Math.random() * (this._canvas.width + this._psize[0]) - this._psize[0] / 2,
      Math.random() * (this._canvas.height + this._psize[1]) - this._psize[1] / 2
    ];
  }
  /** Draw canvas overlay (draw each particules)
   * @param {number} dt timelapes since last call
   */
  draw(dt) {
    var ctx = this._ctx;
    this.clear();
    ctx.beginPath();

    this.getParticules().forEach(function (p) {
      if (dt) {
        p.update(dt);
        this.testExit(p);
      }
      p.draw(this._ctx);
    }.bind(this));
  }
  /** Test if particule exit the canvas and add it on other side
   * @param {*} p the point to test
   * @param {ol.size} size size of the overlap
   */
  testExit(p) {
    var size = this._psize;
    if (p.coordinate[0] < -size[0]) {
      p.coordinate[0] = this._canvas.width + size[0];
      p.coordinate[1] = Math.random() * (this._canvas.height + size[1]) - size[1] / 2;
    } else if (p.coordinate[0] > this._canvas.width + size[0]) {
      p.coordinate[0] = -size[0];
      p.coordinate[1] = Math.random() * (this._canvas.height + size[1]) - size[1] / 2;
    } else if (p.coordinate[1] < -size[1]) {
      p.coordinate[0] = Math.random() * (this._canvas.width + size[0]) - size[0] / 2;
      p.coordinate[1] = this._canvas.height + size[1];
    } else if (p.coordinate[1] > this._canvas.height + size[1]) {
      p.coordinate[0] = Math.random() * (this._canvas.width + size[0]) - size[0] / 2;
      p.coordinate[1] = -size[1];
    }
  }
  /** Clear canvas
   */
  clear() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
  /** Get overlay canvas
   * @return {CanvasElement}
   */
  getCanvas() {
    return this._canvas;
  }
  /** Set canvas animation
   * @param {boolean} anim, default true
   * @api
   */
  setAnimation(anim) {
    anim = (anim !== false);
    this.set('animation', anim);
    if (anim) {
      this._pause = true;
      requestAnimationFrame(this._animate.bind(this));
    } else {
      this.dispatchEvent({ type: 'animation:stop', time: this._time });
    }
  }
  /**
   * @private
   */
  _animate(time) {
    if (this.getVisible() && this.get('animation')) {
      if (this._pause) {
        // reset time
        requestAnimationFrame(function (time) {
          this._time = time;
          requestAnimationFrame(this._animate.bind(this));
        }.bind(this));
      } else {
        // Test fps
        if (time - this._time > this._fps) {
          this.draw(time - this._time);
          this._time = time;
        }
        requestAnimationFrame(this._animate.bind(this));
      }
    }
    this._pause = false;
  }
}

export default ol_Overlay_AnimatedCanvas
