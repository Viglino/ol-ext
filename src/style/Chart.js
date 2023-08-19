/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Add a chart style to display charts (pies or bars) on a map 
*/

import ol_style_RegularShape from 'ol/style/RegularShape.js'
import ol_style_Fill from 'ol/style/Fill.js'
import {asString as ol_color_asString} from 'ol/color.js'

/**
 * @classdesc
 * Set chart style for vector features.
 *
 * @constructor
 * @param {} options
 *	@param {String} options.type Chart type: pie,pie3D, donut or bar
 *	@param {number} options.radius Chart radius/size, default 20
 *	@param {number} options.rotation Rotation in radians (positive rotation clockwise). Default is 0.
 *	@param {bool} options.snapToPixel use integral numbers of pixels, default true
 *	@param {_ol_style_Stroke_} options.stroke stroke style
 *	@param {String|Array<ol_color>} options.colors predefined color set "classic","dark","pale","pastel","neon" / array of color string, default classic
 *	@param {Array<number>} options.displacement
 *	@param {number} options.offsetX X offset in px (deprecated, use displacement)
 *	@param {number} options.offsetY Y offset in px (deprecated, use displacement)
 *	@param {number} options.animation step in an animation sequence [0,1]
 *	@param {number} options.max maximum value for bar chart
 * @see [Statistic charts example](../../examples/style/map.style.chart.html)
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
var ol_style_Chart = class olstyleChart extends ol_style_RegularShape {
  constructor(opt_options) {
    var options = opt_options || {};
    var strokeWidth = 0;
    if (opt_options.stroke)
      strokeWidth = opt_options.stroke.getWidth();
    super({
      radius: options.radius + strokeWidth,
      fill: new ol_style_Fill({ color: [0, 0, 0] }),
      rotation: options.rotation,
      displacement: options.displacement,
      snapToPixel: options.snapToPixel
    });
    this.setScale(options.scale || 1);

    this._stroke = options.stroke;
    this._radius = options.radius || 20;
    this._donutratio = options.donutRatio || 0.5;
    this._type = options.type;
    this._offset = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];
    this._animation = (typeof (options.animation) == 'number') ? { animate: true, step: options.animation } : this._animation = { animate: false, step: 1 };
    this._max = options.max;

    this._data = options.data;
    if (options.colors instanceof Array) {
      this._colors = options.colors;
    } else {
      this._colors = ol_style_Chart.colors[options.colors];
      if (!this._colors)
        this._colors = ol_style_Chart.colors.classic;
    }

    this.renderChart_();
  }
  /**
   * Clones the style.
   * @return {ol_style_Chart}
   */
  clone() {
    var s = new ol_style_Chart({
      type: this._type,
      radius: this._radius,
      rotation: this.getRotation(),
      scale: this.getScale(),
      data: this.getData(),
      snapToPixel: this.getSnapToPixel ? this.getSnapToPixel() : false,
      stroke: this._stroke,
      colors: this._colors,
      offsetX: this._offset[0],
      offsetY: this._offset[1],
      animation: this._animation
    });
    s.setScale(this.getScale());
    s.setOpacity(this.getOpacity());
    return s;
  }
  /** Get data associatied with the chart
  */
  getData() {
    return this._data;
  }
  /** Set data associatied with the chart
  *	@param {Array<number>}
  */
  setData(data) {
    this._data = data;
    this.renderChart_();
  }
  /** Get symbol radius
  */
  getRadius() {
    return this._radius;
  }
  /** Set symbol radius
  *	@param {number} symbol radius
  *	@param {number} donut ratio
  */
  setRadius(radius, ratio) {
    this._radius = radius;
    this.donuratio_ = ratio || this.donuratio_;
    this.renderChart_();
  }
  /** Set animation step
  *	@param {false|number} false to stop animation or the step of the animation [0,1]
  */
  setAnimation(step) {
    if (step === false) {
      if (this._animation.animate == false)
        return;
      this._animation.animate = false;
    } else {
      if (this._animation.step == step)
        return;
      this._animation.animate = true;
      this._animation.step = step;
    }
    this.renderChart_();
  }
  /** @private
  */
  renderChart_(pixelratio) {
    if (!pixelratio) {
      if (this.getPixelRatio) {
        pixelratio = window.devicePixelRatio;
        this.renderChart_(pixelratio);
        if (this.getPixelRatio && pixelratio !== 1)
          this.renderChart_(1);
      } else {
        this.renderChart_(1);
      }
      return;
    }

    var strokeStyle;
    var strokeWidth = 0;

    if (this._stroke) {
      strokeStyle = ol_color_asString(this._stroke.getColor());
      strokeWidth = this._stroke.getWidth();
    }

    // no atlas manager is used, create a new canvas
    var canvas = this.getImage(pixelratio);

    // draw the circle on the canvas
    var context = (canvas.getContext('2d'));
    context.save();
    // reset transform
    context.setTransform(pixelratio, 0, 0, pixelratio, 0, 0);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineJoin = 'round';

    var sum = 0;
    var i, c;
    for (i = 0; i < this._data.length; i++) {
      sum += this._data[i];
    }

    // then move to (x, y)
    context.translate(0, 0);

    var step = this._animation.animate ? this._animation.step : 1;
    //console.log(this._animation.step)
    // Draw pie
    switch (this._type) {
      case "donut":
      case "pie3D":
      case "pie": {
        var a, a0 = Math.PI * (step - 1.5);
        c = canvas.width / 2 / pixelratio;
        context.strokeStyle = strokeStyle;
        context.lineWidth = strokeWidth;
        context.save();
        if (this._type == "pie3D") {
          context.translate(0, c * 0.3);
          context.scale(1, 0.7);
          context.beginPath();
          context.fillStyle = "#369";
          context.arc(c, c * 1.4, this._radius * step, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
        }
        if (this._type == "donut") {
          context.save();
          context.beginPath();
          context.rect(0, 0, 2 * c, 2 * c);
          context.arc(c, c, this._radius * step * this._donutratio, 0, 2 * Math.PI);
          context.clip("evenodd");
        }
        for (i = 0; i < this._data.length; i++) {
          context.beginPath();
          context.moveTo(c, c);
          context.fillStyle = this._colors[i % this._colors.length];
          a = a0 + 2 * Math.PI * this._data[i] / sum * step;
          context.arc(c, c, this._radius * step, a0, a);
          context.closePath();
          context.fill();
          context.stroke();
          a0 = a;
        }
        if (this._type == "donut") {
          context.restore();
          context.beginPath();
          context.strokeStyle = strokeStyle;
          context.lineWidth = strokeWidth;
          context.arc(c, c, this._radius * step * this._donutratio, Math.PI * (step - 1.5), a0);
          context.stroke();
        }
        context.restore();
        break;
      }
      case "bar":
      default: {
        var max = 0;
        if (this._max) {
          max = this._max;
        } else {
          for (i = 0; i < this._data.length; i++) {
            if (max < this._data[i])
              max = this._data[i];
          }
        }
        var s = Math.min(5, 2 * this._radius / this._data.length);
        c = canvas.width / 2 / pixelratio;
        var b = canvas.width / pixelratio - strokeWidth;
        var x, x0 = c - this._data.length * s / 2;
        context.strokeStyle = strokeStyle;
        context.lineWidth = strokeWidth;
        for (i = 0; i < this._data.length; i++) {
          context.beginPath();
          context.fillStyle = this._colors[i % this._colors.length];
          x = x0 + s;
          var h = this._data[i] / max * 2 * this._radius * step;
          context.rect(x0, b - h, s, h);
          //console.log ( x0+", "+(b-this._data[i]/max*2*this._radius)+", "+x+", "+b);
          context.closePath();
          context.fill();
          context.stroke();
          x0 = x;
        }
      }
    }

    context.restore();

    // Set Anchor
    if (!this.setDisplacement) {
      var anchor = this.getAnchor();
      anchor[0] = c - this._offset[0];
      anchor[1] = c - this._offset[1];
    }
  }
};

/** Default color set: classic, dark, pale, pastel, neon
*/
ol_style_Chart.colors = {
  "classic":	["#ffa500","blue","red","green","cyan","magenta","yellow","#0f0"],
  "dark":		["#960","#003","#900","#060","#099","#909","#990","#090"],
  "pale":		["#fd0","#369","#f64","#3b7","#880","#b5d","#666"],
  "pastel":	["#fb4","#79c","#f66","#7d7","#acc","#fdd","#ff9","#b9b"], 
  "neon":		["#ff0","#0ff","#0f0","#f0f","#f00","#00f"]
};

export default ol_style_Chart
