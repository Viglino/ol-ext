/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_style_RegularShape from 'ol/style/RegularShape.js'
import {asString as ol_color_asString} from 'ol/color.js'

/**
 * @classdesc
 * A marker style to use with font symbols.
 *
 * @constructor
 * @param {} options Options.
 *  @param {string} [options.color] default #000
 *  @param {string} options.glyph the glyph name or a char to display as symbol. 
 *    The name must be added using the {@link ol.style.FontSymbol.addDefs} function.
 *  @param {string} [options.text] a text to display as a glyph
 *  @param {string} [options.font] font to use with the text option
 *  @param {string} options.form 
 * 	  none|circle|poi|bubble|marker|coma|shield|blazon|bookmark|hexagon|diamond|triangle|sign|ban|lozenge|square
 * 	  a form that will enclose the glyph, default none
 *  @param {number} options.radius
 *  @param {number} options.rotation
 *  @param {boolean} options.rotateWithView
 *  @param {number} [options.opacity=1]
 *  @param {number} [options.fontSize=1] size of the font compare to the radius, fontSize greater than 1 will exceed the symbol extent
 *  @param {string} [options.fontStyle] the font style (bold, italic, bold italic, etc), default none
 *  @param {boolean} options.gradient true to display a gradient on the symbol
 *  @param {Array<number>} [options.displacement] to use with ol > 6
 * 	@param {number} [options.offsetX=0] Horizontal offset in pixels, deprecated use displacement with ol>6
 * 	@param {number} [options.offsetY=0] Vertical offset in pixels, deprecated use displacement with ol>6
 *  @param {_ol_style_Fill_} options.fill
 *  @param {_ol_style_Stroke_} options.stroke
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
var ol_style_FontSymbol = class olstyleFontSymbol extends ol_style_RegularShape {
  constructor(options) {
    options = options || {};
    var strokeWidth = 0;
    if (options.stroke) {
      strokeWidth = options.stroke.getWidth();
    }
    if (!options.displacement) {
      options.displacement = [options.offsetX || 0, -options.offsetY || 0];
    }
    
    super ({
      radius: options.radius,
      fill: options.fill,
      rotation: options.rotation,
      displacement: options.displacement,
      rotateWithView: options.rotateWithView
    });

    if (typeof (options.opacity) == "number")
      this.setOpacity(options.opacity);
    this._color = options.color;
    this._fontSize = options.fontSize || 1;
    this._fontStyle = options.fontStyle || '';
    this._stroke = options.stroke;
    this._fill = options.fill;
    this._radius = options.radius - strokeWidth;
    this._form = options.form || "none";
    this._gradient = options.gradient;
    this._offset = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];

    if (options.glyph)
      this._glyph = this.getGlyph(options.glyph);
    else
      this._glyph = this.getTextGlyph(options.text || '', options.font);

    if (!this.getDisplacement)
      this.getImage();
  }
  /** Static function : add new font defs
   * @param {String|Object} font the font name or a description ({ font: font_name, name: font_name, copyright: '', prefix })
   * @param {Object} glyphs a key / value list of glyph definitions.
   * 		Each key is the name of the glyph,
   * 		the value is an object that code the font, the caracter code,
   * 		the name and a search string for the glyph.
   *    { char: the char, code: the char code (if no char), theme: a theme for search puposes, name: the symbol name, search: a search string (separated with ',') }
   */
  static addDefs(font, glyphs) {
    var thefont = font;
    if (typeof (font) == 'string') {
      thefont = { font: font, name: font, copyright: '' };
    }
    if (!thefont.font || typeof (thefont.font) !== 'string') {
      console.log('bad font def');
      return;
    }
    var fontname = thefont.font;
    ol_style_FontSymbol.defs.fonts[fontname] = thefont;
    for (var i in glyphs) {
      var g = glyphs[i];
      if (typeof (g) === 'string' && (g.length == 1 || g.length == 2)) {
        g = { char: g };
      }
      ol_style_FontSymbol.defs.glyphs[i] = {
        font: thefont.font,
        char: g.char || '' + String.fromCharCode(g.code) || '',
        theme: g.theme || thefont.name,
        name: g.name || i,
        search: g.search || ''
      };
    }
  }
  /** Clones the style.
   * @return {ol_style_FontSymbol}
   */
  clone() {
    var g = new ol_style_FontSymbol({
      //glyph: this._glyph,
      text: this._glyph.char,
      font: this._glyph.font,
      color: this._color,
      fontSize: this._fontSize,
      fontStyle: this._fontStyle,
      stroke: this._stroke,
      fill: this._fill,
      radius: this._radius + (this._stroke ? this._stroke.getWidth() : 0),
      form: this._form,
      gradient: this._gradient,
      offsetX: this._offset[0],
      offsetY: this._offset[1],
      opacity: this.getOpacity(),
      rotation: this.getRotation(),
      rotateWithView: this.getRotateWithView()
    });
    g.setScale(this.getScale());
    return g;
  }
  /** Get the fill style for the symbol.
   * @return {ol_style_Fill} Fill style.
   * @api
   */
  getFill() {
    return this._fill;
  }
  /** Get the stroke style for the symbol.
   * @return {_ol_style_Stroke_} Stroke style.
   * @api
   */
  getStroke() {
    return this._stroke;
  }
  /** Get the glyph definition for the symbol.
   * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
   * @return {*}
   * @api
   */
  getGlyph(name) {
    if (name)
      return ol_style_FontSymbol.defs.glyphs[name] || { font: 'sans-serif', char: name.charAt(0), theme: 'none', name: 'none', search: '' };
    else
      return this._glyph;
  }
  /** Get glyph definition given a text and a font
   * @param {string|undefined} text
   * @param {string} [font] the font for the text
   * @return {*}
   * @api
   */
  getTextGlyph(text, font) {
    return { font: font || 'sans-serif', char: String(text), theme: 'none', name: 'none', search: '' };
  }
  /**
   * Get the glyph name.
   * @return {string} the name
   * @api
   */
  getGlyphName() {
    for (var i in ol_style_FontSymbol.defs.glyphs) {
      if (ol_style_FontSymbol.defs.glyphs[i] === this._glyph)
        return i;
    }
    return '';
  }
  /**
   * Get the stroke style for the symbol.
   * @return {_ol_style_Stroke_} Stroke style.
   * @api
   */
  getFontInfo(glyph) {
    return ol_style_FontSymbol.defs.fonts[glyph.font];
  }
  /**
   * Get the image icon.
   * @param {number} pixelRatio Pixel ratio.
   * @return {HTMLCanvasElement} Image or Canvas element.
   * @api
   */
  getImage(pixelratio) {
    pixelratio = pixelratio || 1;
    // get canvas
    var canvas = super.getImage(pixelratio);

    var strokeStyle;
    var strokeWidth = 0;

    if (this._stroke) {
      strokeStyle = ol_color_asString(this._stroke.getColor());
      strokeWidth = this._stroke.getWidth();
    }

    /** @type {ol_style_FontSymbol.RenderOptions} */
    var renderOptions = {
      strokeStyle: strokeStyle,
      strokeWidth: strokeWidth,
      size: canvas.width / pixelratio,
    };

    // draw the circle on the canvas
    var context = (canvas.getContext('2d'));
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawMarker_(renderOptions, context, 0, 0, pixelratio);

    // Set anchor / displacement
    if (!this.getDisplacement) {
      var a = this.getAnchor();
      a[0] = canvas.width / 2 - this._offset[0];
      a[1] = canvas.width / 2 - this._offset[1];
    }

    return canvas;
  }
  /**
   * @private
   * @param {ol_style_FontSymbol.RenderOptions} renderOptions
   * @param {CanvasRenderingContext2D} context
   */
  drawPath_(renderOptions, context) {
    var s = 2 * this._radius + renderOptions.strokeWidth;
    var w = renderOptions.strokeWidth / 2;
    var c = renderOptions.size / 2;
    // Transfo to place the glyph at the right place
    var transfo = { fac: 1, posX: renderOptions.size / 2, posY: renderOptions.size / 2 };
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();

    // Draw the path with the form
    switch (this._form) {
      case "none": {
        transfo.fac = 1;
        break;
      }
      case "circle":
      case "ban": {
        context.arc(c, c, s / 2, 0, 2 * Math.PI, true);
        break;
      }
      case "poi": {
        context.arc(c, c - 0.4 * this._radius, 0.6 * this._radius, 0.15 * Math.PI, 0.85 * Math.PI, true);
        context.lineTo(c - 0.89 * 0.05 * s, (0.95 + 0.45 * 0.05) * s + w);
        context.arc(c, 0.95 * s + w, 0.05 * s, 0.85 * Math.PI, 0.15 * Math.PI, true);
        transfo = { fac: 0.45, posX: c, posY: c - 0.35 * this._radius };
        break;
      }
      case "bubble": {
        context.arc(c, c - 0.2 * this._radius, 0.8 * this._radius, 0.4 * Math.PI, 0.6 * Math.PI, true);
        context.lineTo(0.5 * s + w, s + w);
        transfo = { fac: 0.7, posX: c, posY: c - 0.2 * this._radius };
        break;
      }
      case "marker": {
        context.arc(c, c - 0.2 * this._radius, 0.8 * this._radius, 0.25 * Math.PI, 0.75 * Math.PI, true);
        context.lineTo(0.5 * s + w, s + w);
        transfo = { fac: 0.7, posX: c, posY: c - 0.2 * this._radius };
        break;
      }
      case "coma": {
        context.moveTo(c + 0.8 * this._radius, c - 0.2 * this._radius);
        context.quadraticCurveTo(0.95 * s + w, 0.75 * s + w, 0.5 * s + w, s + w);
        context.arc(c, c - 0.2 * this._radius, 0.8 * this._radius, 0.45 * Math.PI, 0, false);
        transfo = { fac: 0.7, posX: c, posY: c - 0.2 * this._radius };
        break;
      }
      default: {
        var pts;
        switch (this._form) {
          case "shield": {
            pts = [0.05, 0, 0.95, 0, 0.95, 0.8, 0.5, 1, 0.05, 0.8, 0.05, 0];
            transfo.posY = 0.45 * s + w;
            break;
          }
          case "blazon": {
            pts = [0.1, 0, 0.9, 0, 0.9, 0.8, 0.6, 0.8, 0.5, 1, 0.4, 0.8, 0.1, 0.8, 0.1, 0];
            transfo.fac = 0.8;
            transfo.posY = 0.4 * s + w;
            break;
          }
          case "bookmark": {
            pts = [0.05, 0, 0.95, 0, 0.95, 1, 0.5, 0.8, 0.05, 1, 0.05, 0];
            transfo.fac = 0.9;
            transfo.posY = 0.4 * s + w;
            break;
          }
          case "hexagon": {
            pts = [0.05, 0.2, 0.5, 0, 0.95, 0.2, 0.95, 0.8, 0.5, 1, 0.05, 0.8, 0.05, 0.2];
            transfo.fac = 0.9;
            transfo.posY = 0.5 * s + w;
            break;
          }
          case "diamond": {
            pts = [0.25, 0, 0.75, 0, 1, 0.2, 1, 0.4, 0.5, 1, 0, 0.4, 0, 0.2, 0.25, 0];
            transfo.fac = 0.75;
            transfo.posY = 0.35 * s + w;
            break;
          }
          case "triangle": {
            pts = [0, 0, 1, 0, 0.5, 1, 0, 0];
            transfo.fac = 0.6;
            transfo.posY = 0.3 * s + w;
            break;
          }
          case "sign": {
            pts = [0.5, 0.05, 1, 0.95, 0, 0.95, 0.5, 0.05];
            transfo.fac = 0.7;
            transfo.posY = 0.65 * s + w;
            break;
          }
          case "lozenge": {
            pts = [0.5, 0, 1, 0.5, 0.5, 1, 0, 0.5, 0.5, 0];
            transfo.fac = 0.7;
            break;
          }
          case "square":
          default: {
            pts = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0];
            break;
          }
        }
        for (var i = 0; i < pts.length; i += 2)
          context.lineTo(pts[i] * s + w, pts[i + 1] * s + w);
      }
    }

    context.closePath();
    return transfo;
  }
  /**
   * @private
   * @param {ol_style_FontSymbol.RenderOptions} renderOptions
   * @param {CanvasRenderingContext2D} context
   * @param {number} x The origin for the symbol (x).
   * @param {number} y The origin for the symbol (y).
   */
  drawMarker_(renderOptions, context, x, y, pixelratio) {
    var fcolor = this._fill ? this._fill.getColor() : "#000";
    var scolor = this._stroke ? this._stroke.getColor() : "#000";
    if (this._form == "none" && this._stroke && this._fill) {
      scolor = this._fill.getColor();
      fcolor = this._stroke.getColor();
    }
    // reset transform
    context.setTransform(pixelratio, 0, 0, pixelratio, 0, 0);

    // then move to (x, y)
    context.translate(x, y);

    var tr = this.drawPath_(renderOptions, context, pixelratio);

    if (this._fill) {
      if (this._gradient && this._form != "none") {
        var grd = context.createLinearGradient(0, 0, renderOptions.size / 2, renderOptions.size);
        grd.addColorStop(1, ol_color_asString(fcolor));
        grd.addColorStop(0, ol_color_asString(scolor));
        context.fillStyle = grd;
      } else {
        context.fillStyle = ol_color_asString(fcolor);
      }
      context.fill();
    }
    if (this._stroke && renderOptions.strokeWidth) {
      context.strokeStyle = renderOptions.strokeStyle;
      context.lineWidth = renderOptions.strokeWidth;
      context.stroke();
    }

    // Draw the symbol
    if (this._glyph.char) {
      context.font = this._fontStyle + ' '
        + (2 * tr.fac * (this._radius) * this._fontSize) + "px "
        + this._glyph.font;
      context.strokeStyle = context.fillStyle;
      context.lineWidth = renderOptions.strokeWidth * (this._form == "none" ? 2 : 1);
      context.fillStyle = ol_color_asString(this._color || scolor);
      context.textAlign = "center";
      context.textBaseline = "middle";
      var t = this._glyph.char;
      if (renderOptions.strokeWidth && scolor != "transparent")
        context.strokeText(t, tr.posX, tr.posY);
      context.fillText(t, tr.posX, tr.posY);
    }

    if (this._form == "ban" && this._stroke && renderOptions.strokeWidth) {
      context.strokeStyle = renderOptions.strokeStyle;
      context.lineWidth = renderOptions.strokeWidth;
      var r = this._radius + renderOptions.strokeWidth;
      var d = this._radius * Math.cos(Math.PI / 4);
      context.moveTo(r + d, r - d);
      context.lineTo(r - d, r + d);
      context.stroke();
    }
  }
  /**
   * @inheritDoc
   */
  getChecksum() {
    var strokeChecksum = (this._stroke !== null) ? this._stroke.getChecksum() : '-';
    var fillChecksum = (this._fill !== null) ? this._fill.getChecksum() : '-';

    var recalculate = (this.checksums_ === null)
      || (strokeChecksum != this.checksums_[1]
        || fillChecksum != this.checksums_[2]
        || this._radius != this.checksums_[3]
        || this._form + "-" + this.glyphs_ != this.checksums_[4]
      );

    if (recalculate) {
      var checksum = 'c' + strokeChecksum + fillChecksum
        + ((this._radius !== void 0) ? this._radius.toString() : '-')
        + this._form + "-" + this.glyphs_;
      this.checksums_ = [checksum, strokeChecksum, fillChecksum, this._radius, this._form + "-" + this.glyphs_];
    }

    return this.checksums_[0];
  }
}

/** Font defs
 */
ol_style_FontSymbol.defs = { 'fonts':{}, 'glyphs':{} };

/* Cool stuff to get the image symbol for a style
 * @param {number} ratio pixelratio
 * /
import ol_style_Image from 'ol/style/Image.js'
ol_style_Image.prototype.getImagePNG = function(ratio) {
  ratio = ratio || window.devicePixelRatio;
  var canvas = this.getImage(ratio);
  if (canvas) {
    try { return canvas.toDataURL('image/png'); }
    catch(e) { return false; }
  } else {
    return false;
  }
}
/* */

export default ol_style_FontSymbol
