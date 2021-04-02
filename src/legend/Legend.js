import ol_ext_inherits from '../util/ext'
import ol_Object from 'ol/Object'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_Collection from 'ol/Collection'
import {DEVICE_PIXEL_RATIO as ol_has_DEVICE_PIXEL_RATIO} from 'ol/has'
import {toContext as ol_render_toContext} from 'ol/render'
import ol_Feature from 'ol/Feature'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString';
import ol_geom_Polygon from 'ol/geom/Polygon'
import {extend as ol_extent_extend} from 'ol/extent'
import ol_legend_Item from './Item'
import ol_ext_element from '../util/element'
import ol_style_Text from 'ol/style/Text'

/** @namespace  ol.legend
 */
/*global ol*/
if (window.ol && !ol.legend) {
  ol.legend = {};
}

/** Legend class to draw features in a legend element
 * @constructor
 * @fires select
 * @param {*} options
 *  @param {String} options.title Legend title
 *  @param {ol.size | undefined} options.size Size of the symboles in the legend, default [40, 25]
 *  @param {number | undefined} options.margin Size of the symbole's margin, default 10
 *  @param { ol.style.Text | undefined } options.textStyle a text style for the legend, default 16px sans-serif
 *  @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} options.style a style or a style function to use with features
 */
var ol_legend_Legend = function(options) {
  options = options || {};
  ol_Object.call(this);

  this._items = new ol_Collection();
  var listeners = [];
  this._items.on('add', function(e) {
    listeners.push({
      item: e.element,
      on: e.element.on('change', function() {
        this.refresh();
      }.bind(this))
    });
    this.refresh();
  }.bind(this));
  this._items.on('remove', function(e) {
    for (var i=0; i<listeners; i++) {
      if (e.element === listeners[i].item) {
        ol_Observable_unByKey(listeners[i].on);
        listeners.splice(i, 1);
        break;
      }
    }
    this.refresh();
  }.bind(this));
  this._listElement = ol_ext_element.create('UL', {
    className: 'ol-legend'
  });
  this._canvas = document.createElement('canvas');

  this.set('size', options.size || [40, 25], true);
  this.set('margin', options.margin===0 ? 0 : options.margin || 10, true);
  this._font = options.font || new ol_style_Text({ font: '16px sans-serif' });
  this._title = new ol_legend_Item({ title: options.title || '', className: 'ol-title' });

  this.setStyle(options.style);

  this.refresh();
};
ol_ext_inherits(ol_legend_Legend, ol_Object);

/** Set legend title
 * @param {string} title
 */
ol_legend_Legend.prototype.setTitle = function(title) {
  this._title.setTitle(title);
  this.refresh();
};

/** Get legend title
 * @returns {string}
 */
ol_legend_Legend.prototype.getTitle = function() {
  return this._title.get('title');
};

/** Set legend size
 * @param {ol.size} size
 */
 ol_legend_Legend.prototype.set = function(key, value, opt_silent) {
  ol_Object.prototype.set.call(this, key, value, opt_silent);
  if (!opt_silent) this.refresh();
};

/** Get legend list element
 * @returns {Element}
 */
ol_legend_Legend.prototype.getListElement = function() {
  return this._listElement;
};

/** Get legend canvas
 * @returns {HTMLCanvasElement}
 */
ol_legend_Legend.prototype.getCanvas = function() {
  return this._canvas;
};

/** Set the style
 * @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} style a style or a style function to use with features
 */
 ol_legend_Legend.prototype.setStyle = function(style) {
  this._style = style;
  this.refresh();
};

/** Add a new item to the legend
 * @param {import('./legend/Item').LegendItemOptions|ol_legend_Item} item 
 */
 ol_legend_Legend.prototype.addItem = function(item) {
  if (item instanceof ol_legend_Item) {
    this._items.push(item);
  } else {
    this._items.push(new ol_legend_Item(item));
  }
};

/** Get item collection
 * @param {ol_Collection} 
 */
ol_legend_Legend.prototype.getItems = function() {
  return this._items;
};

/** Draw legend text
 * @private
 */
ol_legend_Legend.prototype._drawText = function(ctx, text, x, y) {
  ctx.save();
    ctx.scale(ol_has_DEVICE_PIXEL_RATIO, ol_has_DEVICE_PIXEL_RATIO);
    text = text || '';
    var txt = text.split('\n');
    if (txt.length===1) {
      ctx.fillText(text, x, y);
    } else {
      ctx.textBaseline = 'bottom';
      ctx.fillText(txt[0], x, y);
      ctx.textBaseline = 'top';
      ctx.fillText(txt[1], x, y);
    }
  ctx.restore();
};

/** Draw legend text 
 * @private
 */
ol_legend_Legend.prototype._measureText = function(ctx, text) {
  var txt = (text || '').split('\n');
  if (txt.length===1) {
    return ctx.measureText(text);
  } else {
    var m1 = ctx.measureText(txt[0]);
    var m2 = ctx.measureText(txt[1]);
    return { width: Math.max(m1.width, m2.width), height: m1.height + m2.height }
  }
};

/** Refresh the legend
 */
ol_legend_Legend.prototype.refresh = function() {
  var table = this._listElement;
  table.innerHTML = '';
  var margin = this.get('margin');
  var width = this.get('size')[0] + 2 * margin;
  var height = this.get('size')[1] + 2 * margin;

  var canvas = this.getCanvas();
  var ctx = canvas.getContext('2d');
  ctx.font = this._font.getFont();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  var ratio = ol_has_DEVICE_PIXEL_RATIO;

  // Calculate width
  var textWidth = this._measureText(ctx, this.get('title')).width;
  this._items.forEach(function(r) {
    var w = this._measureText(ctx, r.get('title')).width;
    textWidth = Math.max(textWidth, width + w);
  }.bind(this));
  canvas.width = (textWidth + 2*margin) * ratio;
  canvas.height = (this._items.getLength()+1) * height * ratio;
  canvas.style.height = ((this._items.getLength()+1) * height) + 'px';

  ctx.textBaseline = 'middle';
  
  // Add Title
  if (this.getTitle()) {
    table.appendChild(this._title.getElement([width, height], function(b) {
      this.dispatchEvent({
        type: 'select', 
        index: -1,
        symbol: b,
        item: this._title
      });
    }.bind(this)));
    ctx.font = 'bold ' + this._font.getFont();
    ctx.textAlign = 'center';
    this._drawText(ctx, this.getTitle(), canvas.width/ratio/2, height/2);
  }
  // Add items
  ctx.font = this._font.getFont();
  ctx.textAlign = 'left';
  this._items.forEach(function(r,i) {
    var index = i + (this.getTitle() ? 1 : 0);
    table.appendChild(r.getElement([width, height], function(b) {
      this.dispatchEvent({
        type: 'select', 
        index: i,
        symbol: b,
        item: r
      });
    }.bind(this)));
    canvas = this.getLegendImage(r.getProperties(), canvas, index);
    this._drawText(ctx, r.get('title'), width + margin, (i+1.5)*height);
  }.bind(this));

  // Done
  this.dispatchEvent({
    type: 'refresh',
    width: width,
    height: (this._items.length+1)*height
  });
};

/** Get the image for a style 
 * You can provide in options:
 * - a feature width a style 
 * - or a feature that will use the legend style function
 * - or properties and a geometry type that will use the legend style function
 * - or a style and a geometry type
 * @param {*} options
 *  @param {ol.Feature} options.feature a feature to draw
 *  @param {ol.style.Style} options.style the style to use if no feature is provided
 *  @param {*} options.properties properties to use with a style function
 *  @param {string} options.typeGeom type geom to draw with the style or the properties
 * @param {Canvas|undefined} canvas a canvas to draw in
 * @param {int|undefined} row row number to draw in canvas
 * @return {CanvasElement}
 */
 ol_legend_Legend.prototype.getLegendImage = function(options, canvas, row) {
  options = options || {};
  var size = this.get('size');
  var width = size[0] + 2*this.get('margin');
  var height = size[1] + 2*this.get('margin');
  var ratio = ol_has_DEVICE_PIXEL_RATIO;
  if (!canvas) {
    row = 0;
    canvas = document.createElement('canvas');
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }

  var ctx = canvas.getContext('2d');
  ctx.save();
  var vectorContext = ol_render_toContext(ctx);

  var typeGeom = options.typeGeom;
  var style;
  var feature = options.feature;
  if (!feature && options.properties && typeGeom) {
    if (/Point/.test(typeGeom)) feature = new ol_Feature(new ol_geom_Point([0,0]));
    else if (/LineString/.test(typeGeom)) feature = new ol_Feature(new ol_geom_LineString([0,0]));
    else feature = new ol_Feature(new ol_geom_Polygon([[0,0]]));
    feature.setProperties(options.properties);
  }
  if (feature) {
    style = feature.getStyle();
    if (typeof(style)==='function') style = style(feature);
    if (!style) {
      style = typeof(this._style) === 'function' ? this._style(feature) : this._style || [];
    }
    typeGeom = feature.getGeometry().getType();
  } else {
    style = options.style;
  }
  if (!(style instanceof Array)) style = [style];

  var cx = width/2;
  var cy = height/2;
  var sx = size[0]/2;
  var sy = size[1]/2;
  var i, s;
  // Get point offset
  if (typeGeom === 'Point') {
    var extent = null;
    for (i=0; s= style[i]; i++) {
      var img = s.getImage();
      // Refresh legend when loaded
      if (img) {
        var imgElt = img.getImage();
        // Check image is load
        if (imgElt && imgElt.complete && !imgElt.naturalWidth) {
          imgElt.addEventListener('load', function() {
            // Force refresh
            setTimeout(function() { this.refresh(); }.bind(this), 200);
          }.bind(this), 200);
          img.load();
        }
        // Check anchor to center the image
        if (img.getAnchor) {
          var anchor = img.getAnchor();
          if (anchor) {
            var si = img.getSize();
            var dx = anchor[0] - si[0];
            var dy = anchor[1] - si[1];
            if (!extent) {
              extent = [dx, dy, dx+si[0], dy+si[1]];
            } else {
              ol_extent_extend(extent, [dx, dy, dx+si[0], dy+si[1]]);
            }
          }
        }
      }
    }
    if (extent) {
      cx = cx + (extent[2] + extent[0])/2;
      cy = cy + (extent[3] + extent[1])/2;
    }
  }

  // Draw image
  cy += row*height || 0;
  for (i=0; s= style[i]; i++) {
    vectorContext.setStyle(s);
    switch (typeGeom) {
      case ol_geom_Point:
      case 'Point':
      case 'MultiPoint':
        vectorContext.drawGeometry(new ol_geom_Point([cx, cy]));
        break;
      case ol_geom_LineString:
      case 'LineString':
      case 'MultiLineString': 
        ctx.save();
          ctx.rect(this.get('margin') * ratio, 0, size[0] *  ratio, canvas.height);
          ctx.clip();
          vectorContext.drawGeometry(new ol_geom_LineString([[cx-sx, cy], [cx+sx, cy]]));
        ctx.restore();
        break;
      case ol_geom_Polygon:
      case 'Polygon':
      case 'MultiPolygon': 
        vectorContext.drawGeometry(new ol_geom_Polygon([[[cx-sx, cy-sy], [cx+sx, cy-sy], [cx+sx, cy+sy], [cx-sx, cy+sy], [cx-sx, cy-sy]]]));
        break;
    }
  }

  ctx.restore();

  return canvas;
};

export default ol_legend_Legend
