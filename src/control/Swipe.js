/*
  Copyright (c) 2015 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Control from 'ol/control/Control.js'

/**
 * @classdesc Swipe Control.
 * @fires moving
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} Control options.
 *  @param {ol.layer|Array<ol.layer>} options.layers layers to swipe
 *  @param {ol.layer|Array<ol.layer>} options.rightLayers layers to swipe on right side
 *  @param {string} options.className control class name
 *  @param {number} options.position position property of the swipe [0,1], default 0.5
 *  @param {string} options.orientation orientation property (vertical|horizontal), default vertical
 */
var ol_control_Swipe = class olcontrolSwipe extends ol_control_Control {
  constructor(options) {
    options = options || {};

    var element = document.createElement('div');
    super({
      element: element
    });
    
    element.className = (options.className || 'ol-swipe') + ' ol-unselectable ol-control';
    var button = document.createElement('button');
    element.appendChild(button);

    element.addEventListener('mousedown', this.move.bind(this));
    element.addEventListener('touchstart', this.move.bind(this));

    // An array of listener on layer postcompose
    this.precomposeRight_ = this.precomposeRight.bind(this);
    this.precomposeLeft_ = this.precomposeLeft.bind(this);
    this.postcompose_ = this.postcompose.bind(this);

    this.layers = [];
    if (options.layers)
      this.addLayer(options.layers, false);
    if (options.rightLayers)
      this.addLayer(options.rightLayers, true);

    this.on('propertychange', function (e) {
      if (this.getMap()) {
        try { this.getMap().renderSync(); } catch (e) { /* ok */ }
      }
      if (this.get('orientation') === "horizontal") {
        this.element.style.top = this.get('position') * 100 + "%";
        this.element.style.left = "";
      } else {
        if (this.get('orientation') !== "vertical")
          this.set('orientation', "vertical");
        this.element.style.left = this.get('position') * 100 + "%";
        this.element.style.top = "";
      }
      if (e.key === 'orientation') {
        this.element.classList.remove("horizontal", "vertical");
        this.element.classList.add(this.get('orientation'));
      }
      // Force VectorImage to refresh
      if (!this.isMoving) {
        this.layers.forEach(function (l) {
          if (l.layer.getImageRatio)
            l.layer.changed();
        });
      }
    }.bind(this));

    this.set('position', options.position || 0.5);
    this.set('orientation', options.orientation || 'vertical');
  }
  /**
   * Set the map instance the control associated with.
   * @param {_ol_Map_} map The map instance.
   */
  setMap(map) {
    var i;
    var l;

    if (this.getMap()) {
      for (i = 0; i < this.layers.length; i++) {
        l = this.layers[i];
        if (l.right)
          l.layer.un(['precompose', 'prerender'], this.precomposeRight_);
        else
          l.layer.un(['precompose', 'prerender'], this.precomposeLeft_);
        l.layer.un(['postcompose', 'postrender'], this.postcompose_);
      }
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }

    super.setMap(map);

    if (map) {
      this._listener = [];
      for (i = 0; i < this.layers.length; i++) {
        l = this.layers[i];
        if (l.right)
          l.layer.on(['precompose', 'prerender'], this.precomposeRight_);
        else
          l.layer.on(['precompose', 'prerender'], this.precomposeLeft_);
        l.layer.on(['postcompose', 'postrender'], this.postcompose_);
      }
      try { map.renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** @private
  */
  isLayer_(layer) {
    for (var k = 0; k < this.layers.length; k++) {
      if (this.layers[k].layer === layer)
        return k;
    }
    return -1;
  }
  /** Add a layer to clip
   *	@param {ol.layer|Array<ol.layer>} layer to clip
   *	@param {bool} add layer in the right part of the map, default left.
   */
  addLayer(layers, right) {
    if (!(layers instanceof Array))
      layers = [layers];
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      if (this.isLayer_(l) < 0) {
        this.layers.push({ layer: l, right: right });
        if (this.getMap()) {
          if (right)
            l.on(['precompose', 'prerender'], this.precomposeRight_);
          else
            l.on(['precompose', 'prerender'], this.precomposeLeft_);
          l.on(['postcompose', 'postrender'], this.postcompose_);
          try { this.getMap().renderSync(); } catch (e) { /* ok */ }
        }
      }
    }
  }
  /** Remove all layers
   */
  removeLayers() {
    var layers = [];
    this.layers.forEach(function (l) { layers.push(l.layer); });
    this.removeLayer(layers);
  }
  /** Remove a layer to clip
   *	@param {ol.layer|Array<ol.layer>} layer to clip
   */
  removeLayer(layers) {
    if (!(layers instanceof Array))
      layers = [layers];
    for (var i = 0; i < layers.length; i++) {
      var k = this.isLayer_(layers[i]);
      if (k >= 0 && this.getMap()) {
        if (this.layers[k].right)
          layers[i].un(['precompose', 'prerender'], this.precomposeRight_);
        else
          layers[i].un(['precompose', 'prerender'], this.precomposeLeft_);
        layers[i].un(['postcompose', 'postrender'], this.postcompose_);
        this.layers.splice(k, 1);
      }
    }
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Get visible rectangle
   * @returns {ol.extent}
   */
  getRectangle() {
    var s;
    if (this.get('orientation') === 'vertical') {
      s = this.getMap().getSize();
      return [0, 0, s[0] * this.get('position'), s[1]];
    } else {
      s = this.getMap().getSize();
      return [0, 0, s[0], s[1] * this.get('position')];
    }
  }
  /** @private
   */
  move(e) {
    var self = this;
    var l;
    if (!this._movefn)
      this._movefn = this.move.bind(this);
    switch (e.type) {
      case 'touchcancel':
      case 'touchend':
      case 'mouseup': {
        self.isMoving = false;
        ["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
          .forEach(function (eventName) {
            document.removeEventListener(eventName, self._movefn);
          });
        // Force VectorImage to refresh
        this.layers.forEach(function (l) {
          if (l.layer.getImageRatio)
            l.layer.changed();
        });
        break;
      }
      case 'mousedown':
      case 'touchstart': {
        self.isMoving = true;
        ["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
          .forEach(function (eventName) {
            document.addEventListener(eventName, self._movefn);
          });
      }
      // fallthrough
      case 'mousemove':
      case 'touchmove': {
        if (self.isMoving) {
          if (self.get('orientation') === 'vertical') {
            var pageX = e.pageX
              || (e.touches && e.touches.length && e.touches[0].pageX)
              || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX);
            if (!pageX)
              break;
            pageX -= self.getMap().getTargetElement().getBoundingClientRect().left +
              window.pageXOffset - document.documentElement.clientLeft;

            l = self.getMap().getSize()[0];
            var w = l - Math.min(Math.max(0, l - pageX), l);
            l = w / l;
            self.set('position', l);
            self.dispatchEvent({ type: 'moving', size: [w, self.getMap().getSize()[1]], position: [l, 0] });
          } else {
            var pageY = e.pageY
              || (e.touches && e.touches.length && e.touches[0].pageY)
              || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
            if (!pageY)
              break;
            pageY -= self.getMap().getTargetElement().getBoundingClientRect().top +
              window.pageYOffset - document.documentElement.clientTop;

            l = self.getMap().getSize()[1];
            var h = l - Math.min(Math.max(0, l - pageY), l);
            l = h / l;
            self.set('position', l);
            self.dispatchEvent({ type: 'moving', size: [self.getMap().getSize()[0], h], position: [0, l] });
          }
        }
        break;
      }
      default: break;
    }
  }
  /** @private
   */
  _transformPt(e, pt) {
    var tr = e.inversePixelTransform;
    var x = pt[0];
    var y = pt[1];
    pt[0] = tr[0] * x + tr[2] * y + tr[4];
    pt[1] = tr[1] * x + tr[3] * y + tr[5];
    return pt;
  }
  /** @private
   */
  _drawRect(e, pts) {
    var tr = e.inversePixelTransform;
    if (tr) {
      var r = [
        [pts[0][0], pts[0][1]],
        [pts[0][0], pts[1][1]],
        [pts[1][0], pts[1][1]],
        [pts[1][0], pts[0][1]],
        [pts[0][0], pts[0][1]]
      ];
      e.context.save();
      // Rotate VectorImages 
      if (e.target.getImageRatio) {
        var rot = -Math.atan2(e.frameState.pixelToCoordinateTransform[1], e.frameState.pixelToCoordinateTransform[0]);
        e.context.translate(e.frameState.size[0] / 2, e.frameState.size[1] / 2);
        e.context.rotate(rot);
        e.context.translate(-e.frameState.size[0] / 2, -e.frameState.size[1] / 2);
      }
      r.forEach(function (pt, i) {
        pt = [
          (pt[0] * tr[0] - pt[1] * tr[1] + tr[4]),
          (-pt[0] * tr[2] + pt[1] * tr[3] + tr[5])
        ];
        if (!i) {
          e.context.moveTo(pt[0], pt[1]);
        } else {
          e.context.lineTo(pt[0], pt[1]);
        }
      });
      e.context.restore();
    } else {
      var ratio = e.frameState.pixelRatio;
      e.context.rect(pts[0][0] * ratio, pts[0][1] * ratio, pts[1][0] * ratio, pts[1][1] * ratio);
    }
  }
  /** @private
  */
  precomposeLeft(e) {
    var ctx = e.context;
    if (ctx instanceof WebGLRenderingContext) {
      if (e.type === 'prerender') {
        // Clear
        ctx.clearColor(0, 0, 0, 0);
        ctx.clear(ctx.COLOR_BUFFER_BIT);

        // Clip
        ctx.enable(ctx.SCISSOR_TEST);

        var mapSize = this.getMap().getSize(); // [width, height] in CSS pixels


        // get render coordinates and dimensions given CSS coordinates
        var bottomLeft = this._transformPt(e, [0, mapSize[1]]);
        var topRight = this._transformPt(e, [mapSize[0], 0]);

        var fullWidth = topRight[0] - bottomLeft[0];
        var fullHeight = topRight[1] - bottomLeft[1];
        var width, height;
        if (this.get('orientation') === "vertical") {
          width = Math.round(fullWidth * this.get('position'));
          height = fullHeight;
        } else {
          width = fullWidth;
          height = Math.round((fullHeight * this.get('position')));
          bottomLeft[1] += fullHeight - height;
        }
        ctx.scissor(bottomLeft[0], bottomLeft[1], width, height);
      }
    } else {
      var size = e.frameState.size;
      ctx.save();
      ctx.beginPath();
      var pts = [[0, 0], [size[0], size[1]]];
      if (this.get('orientation') === "vertical") {
        pts[1] = [
          size[0] * .5 + this.getMap().getSize()[0] * (this.get('position') - .5),
          size[1]
        ];
      } else {
        pts[1] = [
          size[0],
          size[1] * .5 + this.getMap().getSize()[1] * (this.get('position') - .5)
        ];
      }
      this._drawRect(e, pts);
      ctx.clip();
    }
  }
  /** @private
  */
  precomposeRight(e) {
    var ctx = e.context;
    if (ctx instanceof WebGLRenderingContext) {
      if (e.type === 'prerender') {
        // Clear
        ctx.clearColor(0, 0, 0, 0);
        ctx.clear(ctx.COLOR_BUFFER_BIT);

        // Clip
        ctx.enable(ctx.SCISSOR_TEST);

        var mapSize = this.getMap().getSize(); // [width, height] in CSS pixels


        // get render coordinates and dimensions given CSS coordinates
        var bottomLeft = this._transformPt(e, [0, mapSize[1]]);
        var topRight = this._transformPt(e, [mapSize[0], 0]);

        var fullWidth = topRight[0] - bottomLeft[0];
        var fullHeight = topRight[1] - bottomLeft[1];
        var width, height;
        if (this.get('orientation') === "vertical") {
          height = fullHeight;
          width = Math.round(fullWidth * (1 - this.get('position')));
          bottomLeft[0] += fullWidth - width;
        } else {
          width = fullWidth;
          height = Math.round(fullHeight * (1 - this.get('position')));
        }
        ctx.scissor(bottomLeft[0], bottomLeft[1], width, height);
      }
    } else {
      var size = e.frameState.size;
      ctx.save();
      ctx.beginPath();
      var pts = [[0, 0], [size[0], size[1]]];
      if (this.get('orientation') === "vertical") {
        pts[0] = [
          size[0] * .5 + this.getMap().getSize()[0] * (this.get('position') - .5),
          0
        ];
      } else {
        pts[0] = [
          0,
          size[1] * .5 + this.getMap().getSize()[1] * (this.get('position') - .5)
        ];
      }
      this._drawRect(e, pts);
      ctx.clip();
    }
  }
  /** @private
  */
  postcompose(e) {
    if (e.context instanceof WebGLRenderingContext) {
      if (e.type === 'postrender') {
        var gl = e.context;
        gl.disable(gl.SCISSOR_TEST);
      }
    } else {
      // restore context when decluttering is done (ol>=6)
      // https://github.com/openlayers/openlayers/issues/10096
      if (e.target.getClassName && e.target.getClassName() !== 'ol-layer' && e.target.get('declutter')) {
        setTimeout(function () {
          e.context.restore();
        }, 0);
      } else {
        e.context.restore();
      }
    }
  }
}

export default ol_control_Swipe
