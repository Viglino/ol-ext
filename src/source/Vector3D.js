import ol_ext_inherits from '../util/ext'
import ol_layer_Image from 'ol/layer/Image'
import ol_source_ImageCanvas from 'ol/source/ImageCanvas'
import {easeOut as ol_easing_easeOut} from 'ol/easing'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'
import {asString as ol_color_asString} from 'ol/color'

/** 
 * @classdesc 3D vector layer rendering
 * @constructor
 * @extends {pl.layer.Image}
 * @param {Object} options
 *  @param {ol.layer.Vector} options.source the source to display in 3D
 *  @param {ol.style.Style} options.styler drawing style
 *  @param {number} options.maxResolution  max resolution to render 3D
 *  @param {number} options.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} options.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 *  @param {Array<number>} options.center center of the view, default [.5,1]
 */
var ol_layer_Vector3D = function (options) {
  options = options || {};

  this._source = options.source;
  this.height_ = this.getHfn (options.height);

  var canvas = document.createElement('canvas');
  ol_layer_Image.call (this, { 
    source: new ol_source_ImageCanvas({
      canvasFunction: function(extent, resolution, pixelRatio, size /*, projection*/ ) {
        canvas.width = size[0];
        canvas.height = size[1];
        return canvas;
      }
    }), 
    center: options.center || [.5,1],
    defaultHeight: options.defaultHeight || 0,
    maxResolution: options.maxResolution || Infinity 
  });
  this.setStyle(options.style);

  this.on (['postcompose', 'postrender'], this.onPostcompose_.bind(this));

}
ol_ext_inherits(ol_layer_Vector3D, ol_layer_Image);

/**
 * Set the height function for the layer
 * @param {function|string|Number} height a height function (returns height giving a feature) or a popertie name or a fixed value
 */
ol_layer_Vector3D.prototype.setHeight = function(height) {
  this.height_ = this.getHfn (height);
  this.changed();
};

/**
 * Set style associated with the layer
 * @param {ol.style.Style} s
 */
ol_layer_Vector3D.prototype.setStyle = function(s) {
  if (s instanceof ol_style_Style) this._style = s;
  else this._style = new ol_style_Style();
  if (!this._style.getStroke()) {
    this._style.setStroke(new ol_style_Stroke({
      width: 1,
      color: 'red'
    }));
  }
  if (!this._style.getFill()) {
    this._style.setFill( new ol_style_Fill({ color: 'rgba(0,0,255,0.5)'}) );
  }
  if (!this._style.getText()) {
    this._style.setText( new ol_style_Fill({ 
      color: 'red'}) 
    );
  }
  // Get the geometry
  if (s && s.getGeometry()) {
    var geom = s.getGeometry();
    if (typeof(geom)==='function') {
      this.set('geometry', geom);
    } else {
      this.set('geometry', function() { return geom; });
    }
  } else {
    this.set('geometry', function(f) { return f.getGeometry(); });
  }
};

/**
 * Get style associated with the layer
 * @return {ol.style.Style}
 */
ol_layer_Vector3D.prototype.getStyle = function() {
  return this._style;
};

/** Calculate 3D at potcompose
 * @private
 */
ol_layer_Vector3D.prototype.onPostcompose_ = function(e) {
  var res = e.frameState.viewState.resolution;
  if (res > this.get('maxResolution')) return;
  this.res_ = res*400;

  if (this.animate_) {
    var elapsed = e.frameState.time - this.animate_;
    if (elapsed < this.animateDuration_) {
      this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_);
      // tell OL3 to continue postcompose animation
      e.frameState.animate = true;
    } else {
      this.animate_ = false;
      this.height_ = this.toHeight_
    }
  }

  var ratio = e.frameState.pixelRatio;
  var ctx = e.context;
  var m = this.matrix_ = e.frameState.coordinateToPixelTransform;
  // Old version (matrix)
  if (!m) {
    m = e.frameState.coordinateToPixelMatrix,
    m[2] = m[4];
    m[3] = m[5];
    m[4] = m[12];
    m[5] = m[13];
  }
  this.center_ = [ 
    ctx.canvas.width*this.get('center')[0]/ratio, 
    ctx.canvas.height*this.get('center')[1]/ratio 
  ];

  var f = this._source.getFeaturesInExtent(e.frameState.extent);
    
  ctx.save();
    ctx.scale(ratio,ratio);
    var s = this.getStyle();
    ctx.lineWidth = s.getStroke().getWidth();
    ctx.lineCap = s.getStroke().getLineCap();
    ctx.strokeStyle = ol_color_asString(s.getStroke().getColor());
    ctx.fillStyle = ol_color_asString(s.getFill().getColor());
    var builds = [];
    for (var i=0; i<f.length; i++) {
      builds.push (this.getFeature3D_ (f[i], this._getFeatureHeight(f[i])));
    }
    this.drawFeature3D_ (ctx, builds);
  ctx.restore();
};

/** Create a function that return height of a feature
 * @param {function|string|number} h a height function or a popertie name or a fixed value
 * @return {function} function(f) return height of the feature f
 * @private
 */
ol_layer_Vector3D.prototype.getHfn= function(h) {
  switch (typeof(h)) {
    case 'function': return h;
    case 'string': {
      var dh = this.get('defaultHeight');
        return (function(f) {
          return (Number(f.get(h)) || dh); 
        });
      }
    case 'number': return (function(/*f*/) { return h; });
    default: return (function(/*f*/) { return 10; });
  }
};

/** Animate rendering
 * @param {*} options
 *  @param {string|function|number} options.height an attribute name or a function returning height of a feature or a fixed value
 *  @param {number} options.duration the duration of the animatioin ms, default 1000
 *  @param {ol.easing} options.easing an ol easing function
 *	@api
 */
ol_layer_Vector3D.prototype.animate = function(options) {
  options = options || {};
  this.toHeight_ = this.getHfn(options.height);
  this.animate_ = new Date().getTime();
  this.animateDuration_ = options.duration ||1000;
  this.easing_ = options.easing || ol_easing_easeOut;
  // Force redraw
  this.changed();
};

/** Check if animation is on
*	@return {bool}
*/
ol_layer_Vector3D.prototype.animating = function() {
  if (this.animate_ && new Date().getTime() - this.animate_ > this.animateDuration_) {
    this.animate_ = false;
  }
  return !!this.animate_;
}

/** Get height for a feature
 * @param {ol.Feature} f
 * @return {number}
 * @private
 */
ol_layer_Vector3D.prototype._getFeatureHeight = function (f) {
  if (this.animate_) {
    var h1 = this.height_(f);
    var h2 = this.toHeight_(f);
    return (h1*(1-this.elapsedRatio_)+this.elapsedRatio_*h2);
  }
  else return this.height_(f);
};

/** Get hvector for a point
 * @private
 */
ol_layer_Vector3D.prototype.hvector_ = function (pt, h) {
  var p0 = [
    pt[0]*this.matrix_[0] + pt[1]*this.matrix_[1] + this.matrix_[4],
    pt[0]*this.matrix_[2] + pt[1]*this.matrix_[3] + this.matrix_[5]
  ];
  return {
    p0: p0, 
    p1: [
      p0[0] + h/this.res_ * (p0[0]-this.center_[0]),
      p0[1] + h/this.res_ * (p0[1]-this.center_[1])
    ]
  };
};

/** Get a vector 3D for a feature
 * @private
 */
ol_layer_Vector3D.prototype.getFeature3D_ = function (f, h) {
  var geom = this.get('geometry')(f);
  var c = geom.getCoordinates();
  switch (geom.getType()) {
    case "Polygon":
      c = [c];
    // fallthrough
    case "MultiPolygon":
      var build = [];
      for (var i=0; i<c.length; i++) {
        for (var j=0; j<c[i].length; j++) {
          var b = [];
          for (var k=0; k<c[i][j].length; k++) {
            b.push( this.hvector_(c[i][j][k], h) );
          }
          build.push(b);
        }
      }
      return { type:"MultiPolygon", feature: f, geom: build };
    case "Point":
      return { type:"Point", feature: f, geom: this.hvector_(c,h) };
    default: return {};
  }
};

/** Draw 3D feature
 * @private
 */
ol_layer_Vector3D.prototype.drawFeature3D_ = function(ctx, build) {
  var i,j, b, k;
  // Construct
  for (i=0; i<build.length; i++) {	
    switch (build[i].type) {
      case "MultiPolygon": {
        for (j=0; j<build[i].geom.length; j++) {
          b = build[i].geom[j];
          for (k=0; k < b.length; k++) {
            ctx.beginPath();
            ctx.moveTo(b[k].p0[0], b[k].p0[1]);
            ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            ctx.stroke();
          }
        }
        break;
      }
      case "Point": {
        var g = build[i].geom;
          ctx.beginPath();
          ctx.moveTo(g.p0[0], g.p0[1]);
          ctx.lineTo(g.p1[0], g.p1[1]);
          ctx.stroke();
          break;
        }
      default: break;
    }
  }
  // Roof
  for (i=0; i<build.length; i++) {
    switch (build[i].type) {
      case "MultiPolygon": {
        ctx.beginPath();
        for (j=0; j<build[i].geom.length; j++) {
          b = build[i].geom[j];
          if (j==0) {
            ctx.moveTo(b[0].p1[0], b[0].p1[1]);
            for (k=1; k < b.length; k++) {
              ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            }
          } else {
            ctx.moveTo(b[0].p1[0], b[0].p1[1]);
            for (k=b.length-2; k>=0; k--) {
              ctx.lineTo(b[k].p1[0], b[k].p1[1]);
            }
          }
          ctx.closePath();
        }
        ctx.fill("evenodd");
        ctx.stroke();
        break;
      }
      case "Point": {
        b = build[i];
        var t = b.feature.get('label');
        if (t) {
          var p = b.geom.p1;
          var m = ctx.measureText(t);
          var h = Number (ctx.font.match(/\d+(\.\d+)?/g).join([]));
          ctx.fillRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
          ctx.strokeRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
          ctx.save()
            ctx.fillStyle = ol_color_asString(this._style.getText().getFill().getColor());
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText ( t, p[0], p[1] );
          ctx.restore();
        }
        break;
      }
      default: break;
    }
  }
};

export default ol_layer_Vector3D
