import ol_ext_inherits from '../util/ext'
import {DEVICE_PIXEL_RATIO as ol_has_DEVICE_PIXEL_RATIO} from 'ol/has'
import ol_control_Control from 'ol/control/Control'
import {toContext as ol_render_toContext} from 'ol/render'
import ol_Feature from 'ol/Feature'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString';
import ol_geom_Polygon from 'ol/geom/Polygon'
import {extend as ol_extent_extend} from 'ol/extent'

/** Create a legend for styles
 * @constructor
 * @fires select
 * @param {*} options
 *  @param {String} options.className class of the control
 *  @param {String} options.title Legend title
 *  @param {ol.size | undefined} options.size Size of the symboles in the legend, default [40, 25]
 *  @param {int | undefined} options.margin Size of the symbole's margin, default 10
 *  @param {boolean | undefined} options.collapsed Specify if attributions should be collapsed at startup. Default is true.
 *  @param {boolean | undefined} options.collapsible Specify if attributions can be collapsed, default true.
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} options.style a style or a style function to use with features
 * @extends {ol_control_Control}
 */
var ol_control_Legend = function(options) {
  options = options || {};

  var element = document.createElement('div');
  if (options.target) {
    element.className = options.className || "ol-legend";
  } else {
    element.className = (options.className || "ol-legend")
      +" ol-unselectable ol-control ol-collapsed"
      +(options.collapsible===false ? ' ol-uncollapsible': '');
    // Show on click
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.addEventListener('click', function() {
      element.classList.toggle('ol-collapsed');
    });
    element.appendChild(button);
    // Hide on click
    button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.className = 'ol-closebox';
    button.addEventListener('click', function() {
      element.classList.toggle('ol-collapsed');
    });
    element.appendChild(button);
  }
  // The legend
  this._imgElement = document.createElement('div');
  this._imgElement.className = 'ol-legendImg';
  element.appendChild(this._imgElement);
  this._tableElement = document.createElement('ul');
  element.appendChild(this._tableElement);

	ol_control_Control.call(this, {
    element: element,
		target: options.target
	});

  this._rows = [];

  this.set('size', options.size || [40, 25]);
  this.set('margin', options.margin===0 ? 0 : options.margin || 10);
  this.set('title', options.title || '');
  // Set the style
  this._style = options.style;

  if (options.collapsed===false) this.show();

  this.refresh();
};
ol_ext_inherits(ol_control_Legend, ol_control_Control);


/** Set the style
 * @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} style a style or a style function to use with features
 */
ol_control_Legend.prototype.setStyle = function(style) {
  this._style = style;
  this.refresh();
};

/** Add a new row to the legend
 *  * You can provide in options:
 * - a feature width a style 
 * - or a feature that will use the legend style function
 * - or properties ans a geometry type that will use the legend style function
 * - or a style and a geometry type
 * @param {*} options a list of parameters 
 *  @param {ol.Feature} options.feature a feature to draw
 *  @param {ol.style.Style} options.style the style to use if no feature is provided
 *  @param {*} options.properties properties to use with a style function
 *  @param {string} options.typeGeom type geom to draw with the style or the properties
 */
ol_control_Legend.prototype.addRow = function(row) {
  this._rows.push(row||{});
  this.refresh();
};

/** Remove a row from the legend
 *  @param {int} index
 */
ol_control_Legend.prototype.removeRow = function(index) {
  this._rows.splice(index,1);
  this.refresh();
};

/** Get a legend row
 * @param {int} index
 * @return {*}
 */
ol_control_Legend.prototype.getRow = function(index) {
  return this._rows[index];
};

/** Get a legend row
 * @return {int}
 */
ol_control_Legend.prototype.getLength = function() {
  return this._rows.length;
};

/** Refresh the legend
 */
ol_control_Legend.prototype.refresh = function() {
  var self = this;
  var table = this._tableElement
  table.innerHTML = '';
  var width = this.get('size')[0] + 2*this.get('margin');
  var height = this.get('size')[1] + 2*this.get('margin');

  // Add a new row
  function addRow(str, title, r, i){
    var row = document.createElement('li');
    row.style.height = height + 'px';
    row.addEventListener('click', function() {
      self.dispatchEvent({ type:'select', title: str, row: r, index: i });
    });

    var col = document.createElement('div');
    row.appendChild(col);
    col.style.height = height + 'px';

    col = document.createElement('div');
    if (title) {
      row.className = 'ol-title';
    } else {
      col.style.paddingLeft = width + 'px';
    }
    col.innerHTML = str || '';
    row.appendChild(col);
    table.appendChild(row);
  }
  if (this.get('title')) {
    addRow(this.get('title'), true, {}, -1);
  }
  var canvas = document.createElement('canvas');
  canvas.width = 5*width;
  canvas.height = (this._rows.length+1) * height * ol_has_DEVICE_PIXEL_RATIO;
  this._imgElement.innerHTML = '';
  this._imgElement.append(canvas);
  this._imgElement.style.height = (this._rows.length+1)*height + 'px';
  for (var i=0, r; r = this._rows[i]; i++) {
    addRow(r.title, false, r, i);
    canvas = this.getStyleImage(r, canvas, i+(this.get('title')?1:0));
  }
};

/** Show control
 */
ol_control_Legend.prototype.show = function() {
  this.element.classList.remove('ol-collapsed');
};
/** Hide control
 */
ol_control_Legend.prototype.hide = function() {
  this.element.classList.add('ol-collapsed');
};
/** Toggle control
 */
ol_control_Legend.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
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
ol_control_Legend.prototype.getStyleImage = function(options, theCanvas, row) {
  options = options || {};
  var size = this.get('size');
  var width = size[0] + 2*this.get('margin');
  var height = size[1] + 2*this.get('margin');
  var canvas = theCanvas;
  var ratio = ol_has_DEVICE_PIXEL_RATIO;
  if (!canvas) {
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
      if (img && img.getAnchor) {
        var anchor = img.getAnchor();
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
    if (extent) {
      cx = cx + (extent[2] + extent[0])/2;
      cy = cy + (extent[3] + extent[1])/2;
    }
  }

  // Draw image
  cy += (theCanvas ? row*height : 0);
  for (i=0; s= style[i]; i++) {
    vectorContext.setStyle(s);
    switch (typeGeom) {
      case ol_geom_Point:
      case 'Point':
        vectorContext.drawGeometry(new ol_geom_Point([cx, cy]));
        break;
      case ol_geom_LineString:
      case 'LineString':
        ctx.save();
          ctx.rect(this.get('margin') * ratio, 0, size[0] *  ratio, canvas.height);
          ctx.clip();
          vectorContext.drawGeometry(new ol_geom_LineString([[cx-sx, cy], [cx+sx, cy]]));
        ctx.restore();
        break;
      case ol_geom_Polygon:
      case 'Polygon':
        vectorContext.drawGeometry(new ol_geom_Polygon([[[cx-sx, cy-sy], [cx+sx, cy-sy], [cx+sx, cy+sy], [cx-sx, cy+sy], [cx-sx, cy-sy]]]));
        break;
    }
  }

  ctx.restore();

  return canvas;
};

export default ol_control_Legend
