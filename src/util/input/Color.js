import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_PopupBase from './PopupBase'
import ol_Collection from 'ol/Collection';
import { toHSV as ol_color_toHSV, fromHSV as ol_color_fromHSV } from '../color'
import { toHexa as ol_color_toHexa } from '../color'
import { asArray as ol_color_asArray } from 'ol/color'

/** Color picker
 * @constructor
 * @extends {ol_ext_input_PopupBase}
 * @fires change:color
 * @fires color
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {ol.colorLike} [options.color] default color
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {boolean} [options.hastab=false] use tabs for palette / picker
 *  @param {string} [options.paletteLabel="palette"] label for the palette tab
 *  @param {string} [options.pickerLabel="picker"] label for the picker tab
 *  @param {string} [options.position='popup'] fixed | static | popup | inline (no popup)
 *  @param {boolean} [options.opacity=true] enable opacity
 *  @param {boolean} [options.autoClose=true] close when click on color
 *  @param {boolean} [options.hidden=true] display the input
 */
var ol_ext_input_Color = function(options) {
  options = options || {};

  options.hidden = options.hidden!==false;
  options.className = ('ol-ext-colorpicker ' + (options.hastab ? 'ol-tab ' : '') + (options.className || '')).trim();
  ol_ext_input_PopupBase.call(this, options);

  if (options.opacity===false) {
    this.element.classList.add('ol-nopacity');
  }

  this._cursor = {};
  var hsv = this._hsv = {};
  // Vignet
  this._elt.vignet = ol_ext_element.create('DIV', { className: 'ol-vignet', parent: this.element });

  // Bar 
  var bar = ol_ext_element.create('DIV', { className: 'ol-tabbar', parent: this._elt.popup });
  ol_ext_element.create('DIV', { 
    className: 'ol-tab', 
    html: options.paletteLabel || 'palette',
    click: function() {
      this.element.classList.remove('ol-picker-tab');
    }.bind(this),
    parent: bar
  });
  ol_ext_element.create('DIV', { 
    className: 'ol-tab', 
    html: options.pickerLabel || 'picker',
    click: function() {
      this.element.classList.add('ol-picker-tab');
    }.bind(this),
    parent: bar
  });

  // Popup container
  var container = ol_ext_element.create('DIV', { className: 'ol-container', parent: this._elt.popup });

  // Color picker
  var picker = this._elt.picker = ol_ext_element.create('DIV', { className: 'ol-picker', parent: container });
  var pickerCursor = this._cursor.picker = ol_ext_element.create('DIV', { className: 'ol-cursor', parent: picker });
  this._listenDrag(picker, function(e) {
    var tx = Math.max(0, Math.min(e.offsetX / picker.clientWidth, 1));
    var ty = Math.max(0, Math.min(e.offsetY / picker.clientHeight, 1));
    pickerCursor.style.left = Math.round(tx*100) + '%';
    pickerCursor.style.top = Math.round(ty*100) + '%';
    hsv.s = tx * 100;
    hsv.v = 100 - ty * 100;
    this.setColor();
  }.bind(this));

  // Opacity cursor
  var slider = ol_ext_element.create('DIV', { className: 'ol-slider', parent: container });
  this._elt.slider = ol_ext_element.create('DIV', { parent: slider });
  var sliderCursor = this._cursor.slide = ol_ext_element.create('DIV', { className: 'ol-cursor', parent: slider });
  this._listenDrag(slider, function(e) {
    var t = Math.max(0, Math.min(e.offsetX / slider.clientWidth, 1));
    hsv.a = t*100;
    sliderCursor.style.left = Math.round(t*100) + '%';
    this.setColor();
  }.bind(this));
  
  // Tint cursor
  var tint = ol_ext_element.create('DIV', { className: 'ol-tint', parent: container });
  var tintCursor = this._cursor.tint = ol_ext_element.create('DIV', { className: 'ol-cursor', parent: tint });
  this._listenDrag(tint, function(e) {
    var t = Math.max(0, Math.min(e.offsetY / tint.clientHeight, 1));
    hsv.h = t*360;
    tintCursor.style.top = Math.round(t*100) + '%';
    this.setColor();
  }.bind(this));

  // Clear button
  ol_ext_element.create('DIV', { 
    className: 'ol-clear', 
    click: function() {
      this.setColor([0,0,0,0]);
    }.bind(this),
    parent: container
  });

  // RVB input
  var rgb = ol_ext_element.create('DIV', { 
    className: 'ol-rgb', 
    parent: container
  });
  var changergb = function() {
    var r = Math.max(0, Math.min(255, parseInt(this._elt.r.value)));
    var g = Math.max(0, Math.min(255, parseInt(this._elt.g.value)));
    var b = Math.max(0, Math.min(255, parseInt(this._elt.b.value)));
    var a = Math.max(0, Math.min(1, parseFloat(this._elt.a.value)));
    this.setColor([r, g, b, a]);
  }.bind(this);
  this._elt.r = ol_ext_element.create('INPUT', { type: 'number', lang:'en-GB', change: changergb, min:0, max:255, parent: rgb });
  this._elt.g = ol_ext_element.create('INPUT', { type: 'number', lang:'en-GB', change: changergb, min:0, max:255, parent: rgb });
  this._elt.b = ol_ext_element.create('INPUT', { type: 'number', lang:'en-GB', change: changergb, min:0, max:255, parent: rgb });
  this._elt.a = ol_ext_element.create('INPUT', { type: 'number', lang:'en-GB', change: changergb, min:0, max:1, step:.1, parent: rgb });
  
  // Text color input
  this._elt.txtColor = ol_ext_element.create('INPUT', { 
    type: 'text', 
    className: 'ol-txt-color',
    change: function(){
      var color;
      this._elt.txtColor.classList.remove('ol-error')
      try {
        color = ol_color_asArray(this._elt.txtColor.value);
      } catch(e) {
        this._elt.txtColor.classList.add('ol-error');
      }
      if (color) this.setColor(color)
    }.bind(this), 
    parent: container
  });
  ol_ext_element.create('BUTTON', { 
    html: 'OK',
    click: function() {
      this._addCustomColor(this.getColor());
      this.collapse(true);
    }.bind(this),
    parent: container
  });

  var i;

  // Color palette
  this._paletteColor = {};
  this._elt.palette = ol_ext_element.create('DIV', {
    className: 'ol-palette',
    parent: this._elt.popup
  })
  for (i=0; i<8; i++) {
    var c = Math.round(255 - 255*i/7);
    this.addPaletteColor([c,c,c], c);//ol_color_toHexa([c,c,c]));
  }
  var colors = ['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#48e', '#00f', '#f0f']
  colors.forEach(function(c){
    this.addPaletteColor(c, ol_color_toHexa(ol_color_asArray(c)));
  }.bind(this));
  for (i=0; i<5; i++) {
    colors.forEach(function(c){
      c = ol_color_toHSV(ol_color_asArray(c));
      c = [c[0], i/4*80+20, 100 - i/4*60];
      c = ol_color_fromHSV(c,1)
      this.addPaletteColor(c, ol_color_toHexa(c));
    }.bind(this));
  }
  // Custom colors
  ol_ext_element.create('HR', { parent: this._elt.palette });

  // Create custom color list
  if (!ol_ext_input_Color.customColorList) {
    ol_ext_input_Color.customColorList = new ol_Collection();
    var ccolor = JSON.parse(localStorage.getItem('ol-ext@colorpicker') || '[]');
    ccolor.forEach(function(c) {
      ol_ext_input_Color.customColorList.push(c);
    })
    ol_ext_input_Color.customColorList.on(['add','remove'], function(){
      localStorage.setItem('ol-ext@colorpicker', JSON.stringify(ol_ext_input_Color.customColorList.getArray()));
    });
  }
  // Handle custom color
  ol_ext_input_Color.customColorList.on('add', function(e) {
    this.addPaletteColor(this.getColorFromID(e.element));
  }.bind(this));
  ol_ext_input_Color.customColorList.on('remove', function(e) {
    if (this._paletteColor[e.element]) this._paletteColor[e.element].element.remove();
    delete this._paletteColor[e.element];
  }.bind(this));
  // Add new one
  ol_ext_input_Color.customColorList.forEach(function(c) {
    this._addCustomColor(this.getColorFromID(c));
  }.bind(this));

  // Current color
  this.setColor(options.color || [0,0,0,0]);
  this._currentColor = this.getColorID(this.getColor());

  // Add new palette color
  this.on('color', function() {
    this._addCustomColor(this.getColor());
    this._currentColor = this.getColorID(this.getColor());
    this.setColor();
  }.bind(this));

  // Update color on hide
  this.on('collapse', function(e) {
    if (!e.visible) {
      var c = this.getColor();
      if (this._currentColor !== this.getColorID(c)) {
        this.dispatchEvent({ type: 'color', color: c });
      }
    } else {
      this._currentColor = this.getColorID(this.getColor());
    }
  }.bind(this));
};
ol_ext_inherits(ol_ext_input_Color, ol_ext_input_PopupBase);

/** Custom color list
 * @private
 */
ol_ext_input_Color.customColorList = null;

/** Add color to palette
 * @param {ol.colorLike} color
 * @param {string} title
 * @param {boolean} select
 */
ol_ext_input_Color.prototype.addPaletteColor = function(color, title, select) {
  // Get color id
  try {
    color = ol_color_asArray(color);
  } catch(e) {
    return;
  }
  var id = this.getColorID(color);
  // Add new one
  if (!this._paletteColor[id] && color[3]) {
    this._paletteColor[id] = {
      color: color,
      element: ol_ext_element.create('DIV', {
        title: title || '',
        className: (color[3]<1 ? 'ol-alpha' : ''),
        style: {
          color: 'rgb('+(color.join(','))+')'
        },
        click: function() {
          this.setColor(color);
          if (this.get('autoClose')) this.collapse(true);
        }.bind(this),
        parent: this._elt.palette
      })
    }
  }
  if (select) {
    this._selectPalette(color);
  }
};

/** Show palette or picker tab
 * @param {string} what palette or picker
 */
ol_ext_input_Color.prototype.showTab = function(what) {
  if (what==='palette') this.element.classList.remove('ol-picker-tab');
  else this.element.classList.add('ol-picker-tab');
};

/** Show palette or picker tab
 * @returns {string} palette or picker
 */
ol_ext_input_Color.prototype.getTab = function() {
  return this.element.classList.contains('ol-picker-tab') ? 'picker' : 'palette';
};

/** Select a color in the palette
 * @private
 */
ol_ext_input_Color.prototype._selectPalette = function(color) {
  var id = this.getColorID(color);
  Object.keys(this._paletteColor).forEach(function(c) {
    this._paletteColor[c].element.classList.remove('ol-select')
  }.bind(this))
  if (this._paletteColor[id]) {
    this._paletteColor[id].element.classList.add('ol-select');
  }
}

/** Set Color 
 * @param { Array<number> }
 */
ol_ext_input_Color.prototype.setColor = function(color) {
  var hsv = this._hsv;
  if (color) {
    color = ol_color_asArray(color);
    var hsv2 = ol_color_toHSV(color);
    hsv.h = hsv2[0];
    hsv.s = hsv2[1];
    hsv.v = hsv2[2];
    if (hsv2.length > 3) hsv.a = hsv2[3]*100;
    else hsv.a = 100;
    this._cursor.picker.style.left = hsv.s + '%';
    this._cursor.picker.style.top = (100-hsv.v) + '%';
    this._cursor.tint.style.top = (hsv.h / 360 * 100) + '%';
    this._cursor.slide.style.left = hsv.a + '%';
    if (this.isCollapsed()) {
      this.dispatchEvent({ type: 'color', color: color });
    }
  } else {
    /*
    hsv.h = Math.round(hsv.h) % 360;
    hsv.s = Math.round(hsv.s);
    hsv.v = Math.round(hsv.v);
    */
    hsv.a = Math.round(hsv.a);
    color = this.getColor();
  }

  var val = 'rgba('+color.join(', ')+')';

  // Show color
  this._elt.picker.style.color = 'hsl(' + hsv.h + ', 100%, 50%)';
  this._elt.slider.style.backgroundImage = 'linear-gradient(45deg, transparent, rgba('+this.getColor(false).join(',')+'))';
  this._elt.vignet.style.color = val;

  // RGB
  this._elt.r.value = color[0];
  this._elt.g.value = color[1];
  this._elt.b.value = color[2];
  this._elt.a.value = color[3];

  // Txt color
  this._elt.txtColor.classList.remove('ol-error')
  if (color[3]===1) {
    this._elt.txtColor.value = ol_color_toHexa(color);
  } else {
    this._elt.txtColor.value = val;
  }

  this._selectPalette(color);

  // Set input value
  if (this.input.value !== val) {
    this.input.value = val;
    this.input.dispatchEvent(new Event('change'));
  }
};

/** Get current color
 * @param {boolean} [opacity=true]
 * @return {Array<number>}
 */
ol_ext_input_Color.prototype.getColor = function(opacity) {
  return ol_color_fromHSV([this._hsv.h, this._hsv.s, this._hsv.v, (opacity !== false) ? this._hsv.a/100 : 1], 1);
}

/** 
 * @private
 */
ol_ext_input_Color.prototype._addCustomColor = function(color) {
  var id = this.getColorID(color);
  if (this._paletteColor[id]) return;
  if (!color[3]) return;
  if (ol_ext_input_Color.customColorList.getArray().indexOf(id) < 0) {
    ol_ext_input_Color.customColorList.push(id);
    if (ol_ext_input_Color.customColorList.getLength() > 24) {
      ol_ext_input_Color.customColorList.removeAt(0)
    }
  }
  this.addPaletteColor(color);
};

ol_ext_input_Color.prototype.clearCustomColor = function() {
  ol_ext_input_Color.customColorList.clear();
};

/** Convert color to id
 * @param {ol.colorLike} Color
 * @returns {number}
 */
ol_ext_input_Color.prototype.getColorID = function(color) {
  color = ol_color_asArray(color);
  if (color[3]===undefined) color[3] = 1;
  return color.join('-');
};

/** Convert color to id
 * @param {number} id
 * @returns {Array<number>} Color
 */
 ol_ext_input_Color.prototype.getColorFromID = function(id) {
  var c = id.split('-');
  return ([parseFloat(c[0]), parseFloat(c[1]), parseFloat(c[2]), parseFloat(c[3])]);
};

export default ol_ext_input_Color
