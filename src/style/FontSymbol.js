/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_style_RegularShape from 'ol/style/RegularShape'
import ol_style_Image from 'ol/style/Image'
import {asString as ol_color_asString} from 'ol/color'

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
 *  @param {number} [options.offsetX=0] default 0
 *  @param {number} [options.offsetY=0] default 0
 *  @param {_ol_style_Fill_} options.fill
 *  @param {_ol_style_Stroke_} options.stroke
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
var ol_style_FontSymbol = function(options) {
  options = options || {};
  var strokeWidth = 0;
  if (options.stroke) {
    strokeWidth = options.stroke.getWidth();
  }
  ol_style_RegularShape.call (this, { 
    radius: options.radius, 
    fill:options.fill,
    rotation:options.rotation, 
    rotateWithView: options.rotateWithView 
  });
  
  if (typeof(options.opacity)=="number") this.setOpacity(options.opacity);
  this.color_ = options.color;
  this.fontSize_ = options.fontSize || 1;
  this.fontStyle_ = options.fontStyle || '';
  this.stroke_ = options.stroke;
  this.fill_ = options.fill;
  this.radius_ = options.radius -strokeWidth;
  this.form_ = options.form || "none";
  this.gradient_ = options.gradient;
  this.offset_ = [options.offsetX ? options.offsetX :0, options.offsetY ? options.offsetY :0];

  if (options.glyph) this.glyph_ = this.getGlyph(options.glyph);
  else this.glyph_ = this.getTextGlyph(options.text||'', options.font);

  this.renderMarker_();
};
ol_ext_inherits(ol_style_FontSymbol, ol_style_RegularShape);

/** Cool stuff to get the image symbol for a style
 * @param {number} ratio pixelratio
 */
ol_style_Image.prototype.getImagePNG = function(ratio) {
  ratio = ratio || window.devicePixelRatio;
  var canvas = this.getImage(ratio);
  if (canvas) {
    try { return canvas.toDataURL("image/png"); }
    catch(e) { return false; }
  } else {
    return false;
  }
}

/** Font defs
 */
ol_style_FontSymbol.prototype.defs = { 'fonts':{}, 'glyphs':{} };

/** Static function : add new font defs 
 * @param {String|Object} font the font desciption
 * @param {} glyphs a key / value list of glyph definitions. 
 * 		Each key is the name of the glyph, 
 * 		the value is an object that code the font, the caracter code, 
 * 		the name and a search string for the glyph.
 */
ol_style_FontSymbol.addDefs = function(font, glyphs) {
  var thefont = font;
  if (typeof(font) == 'string') thefont = { font:font, name:font, copyright:'' };
  if (!thefont.font || typeof(thefont.font) !== 'string') {
    console.log('bad font def');
    return;
  }
  var fontname = thefont.font;
  ol_style_FontSymbol.prototype.defs.fonts[fontname] = thefont;
  for (var i in glyphs) {
    var g = glyphs[i];
    if (typeof(g) === 'string' && g.length==1) g = { char: g };
    ol_style_FontSymbol.prototype.defs.glyphs[i] = {
      font: thefont.font,
      char: g.char || ''+String.fromCharCode(g.code) || '',
      theme: g.theme || thefont.name,
      name: g.name || i,
      search: g.search || ''
    };
  }
};


/** Clones the style. 
 * @return {ol_style_FontSymbol}
 */
ol_style_FontSymbol.prototype.clone = function() {
  var g = new ol_style_FontSymbol({
    glyph: '',
    color: this.color_,
    fontSize: this.fontSize_,
    fontStyle: this.fontStyle_,
    stroke: this.stroke_,
    fill: this.fill_,
    radius: this.radius_ + (this.stroke_ ? this.stroke_.getWidth():0),
    form: this.form_,
    gradient: this.gradient_,
    offsetX: this.offset_[0],
    offsetY: this.offset_[1],
    opacity: this.getOpacity(),
    rotation: this.getRotation(),
    rotateWithView: this.getRotateWithView()
  });
  g.setScale(this.getScale());
  g.glyph_ = this.glyph_;
  g.renderMarker_();
  return g;
};

/** Get the fill style for the symbol.
 * @return {ol_style_Fill} Fill style.
 * @api
 */
ol_style_FontSymbol.prototype.getFill = function() {
  return this.fill_;
};

/** Get the stroke style for the symbol.
 * @return {_ol_style_Stroke_} Stroke style.
 * @api
 */
ol_style_FontSymbol.prototype.getStroke = function() {
  return this.stroke_;
};

/** Get the glyph definition for the symbol.
 * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
 * @return {*}
 * @api
 */
ol_style_FontSymbol.prototype.getGlyph = function(name) {
  if (name) return ol_style_FontSymbol.prototype.defs.glyphs[name] || { font:'sans-serif', char:name.charAt(0), theme:'none', name:'none', search:'' };
  else return this.glyph_;
};

/** Get glyph definition given a text and a font
 * @param {string|undefined} text
 * @param {string} [font] the font for the text
 * @return {*}
 * @api
 */
ol_style_FontSymbol.prototype.getTextGlyph = function(text, font) {
  return { font: font || 'sans-serif', char:String(text), theme:'none', name:'none', search:'' };
};

/**
 * Get the glyph name.
 * @return {string} the name
 * @api
 */
ol_style_FontSymbol.prototype.getGlyphName = function() {
  for (var i in ol_style_FontSymbol.prototype.defs.glyphs) {
    if (ol_style_FontSymbol.prototype.defs.glyphs[i] === this.glyph_) return i;
  }
  return '';
};

/**
 * Get the stroke style for the symbol.
 * @return {_ol_style_Stroke_} Stroke style.
 * @api
 */
ol_style_FontSymbol.prototype.getFontInfo = function(glyph) {
  return ol_style_FontSymbol.prototype.defs.fonts[glyph.font];
}

/** @private
 */
ol_style_FontSymbol.prototype.renderMarker_ = function(pixelratio) {
  if (!pixelratio) {
    if (this.getPixelRatio) {
      pixelratio = window.devicePixelRatio;
      this.renderMarker_(pixelratio);
      if (this.getPixelRatio && pixelratio!==1) this.renderMarker_(1); 
    } else {
      this.renderMarker_(1);
    }
    return;
  }
  var strokeStyle;
  var strokeWidth = 0;

  if (this.stroke_) {
    strokeStyle = ol_color_asString(this.stroke_.getColor());
    strokeWidth = this.stroke_.getWidth();
  }

  // get canvas
  var canvas = this.getImage(pixelratio);
  //console.log(this.getImage().width+" / "+(2 * (this.radius_ + strokeWidth) + 1));

  /** @type {ol_style_FontSymbol.RenderOptions} */
  var renderOptions = {
    strokeStyle: strokeStyle,
    strokeWidth: strokeWidth,
    size: canvas.width/pixelratio,
  };

  // draw the circle on the canvas
  var context = (canvas.getContext('2d'));
  context.clearRect(0, 0, canvas.width, canvas.height);
  this.drawMarker_(renderOptions, context, 0, 0, pixelratio);

  // Set anchor / displacement
  if (this.setDisplacement) {
    this.setDisplacement([this.offset_[0], -this.offset_[1]])
  } else {
    var a = this.getAnchor();
    a[0] = canvas.width / 2 - this.offset_[0];
    a[1] = canvas.width / 2 - this.offset_[1];
  }
};

/**
 * @private
 * @param {ol_style_FontSymbol.RenderOptions} renderOptions
 * @param {CanvasRenderingContext2D} context
 */
ol_style_FontSymbol.prototype.drawPath_ = function(renderOptions, context) {
  var s = 2*this.radius_+renderOptions.strokeWidth+1;
  var w = renderOptions.strokeWidth/2;
  var c = renderOptions.size / 2;
  // Transfo to place the glyph at the right place
  var transfo = { fac:1, posX:renderOptions.size / 2, posY:renderOptions.size / 2 };
  context.lineJoin = 'round';
  context.beginPath();

  // Draw the path with the form
  switch (this.form_) {
    case "none": {
      transfo.fac=1;  
      break;
    }
    case "circle":
    case "ban": {
      context.arc ( c, c, s/2, 0, 2 * Math.PI, true);
      break;
    }
    case "poi": {
      context.arc ( c, c -0.4*this.radius_, 0.6*this.radius_, 0.15*Math.PI, 0.85*Math.PI, true);
      context.lineTo ( c-0.89*0.05*s, (0.95+0.45*0.05)*s+w);
      context.arc ( c, 0.95*s+w, 0.05*s, 0.85*Math.PI, 0.15*Math.PI, true);
      transfo = { fac:0.45, posX:c, posY:c -0.35*this.radius_ };
      break;
    }
    case "bubble": {
      context.arc ( c, c -0.2*this.radius_, 0.8*this.radius_, 0.4*Math.PI, 0.6*Math.PI, true);
      context.lineTo ( 0.5*s+w, s+w);
      transfo = { fac:0.7, posX:c, posY:c -0.2*this.radius_ };
      break;
    }
    case "marker": {
      context.arc ( c, c -0.2*this.radius_, 0.8*this.radius_, 0.25*Math.PI, 0.75*Math.PI, true);
      context.lineTo ( 0.5*s+w, s+w);
      transfo = { fac:0.7, posX: c, posY: c -0.2*this.radius_ };
      break;
    }
    case "coma": {
      context.moveTo ( c + 0.8*this.radius_, c -0.2*this.radius_);
      context.quadraticCurveTo ( 0.95*s+w, 0.75*s+w, 0.5*s+w, s+w);
      context.arc ( c, c -0.2*this.radius_, 0.8*this.radius_, 0.45*Math.PI, 0, false);
      transfo = { fac:0.7, posX: c, posY: c -0.2*this.radius_ };
      break;
    }
    default: {
      var pts;
      switch (this.form_) {
        case "shield": {
          pts = [ 0.05,0, 0.95,0, 0.95,0.8, 0.5,1, 0.05,0.8, 0.05,0 ]; 
          transfo.posY = 0.45*s+w ;
          break;
        }
        case "blazon": {
          pts = [ 0.1,0, 0.9,0, 0.9,0.8, 0.6,0.8, 0.5,1, 0.4,0.8, 0.1,0.8, 0.1,0 ]; 
          transfo.fac = 0.8;
          transfo.posY = 0.4*s+w ;
          break;
        }
        case "bookmark": {
          pts = [ 0.05,0, 0.95,0, 0.95,1, 0.5,0.8, 0.05,1, 0.05,0 ]; 
          transfo.fac = 0.9;
          transfo.posY = 0.4*s+w ;
          break;
        }
        case "hexagon": {
          pts = [ 0.05,0.2, 0.5,0, 0.95,0.2, 0.95,0.8, 0.5,1, 0.05,0.8, 0.05,0.2 ]; 
          transfo.fac = 0.9;
          transfo.posY = 0.5*s+w ;
          break;
        }
        case "diamond": {
          pts = [ 0.25,0, 0.75,0, 1,0.2, 1,0.4, 0.5,1, 0,0.4, 0,0.2, 0.25,0 ]; 
          transfo.fac = 0.75 ;
          transfo.posY = 0.35*s+w ;
          break;
        }
        case "triangle": {
          pts = [ 0,0, 1,0, 0.5,1, 0,0 ]; 
          transfo.fac = 0.6 ;
          transfo.posY = 0.3*s+w ;
          break;
        }
        case "sign": {
          pts = [ 0.5,0.05, 1,0.95, 0,0.95, 0.5,0.05 ]; 
          transfo.fac = 0.7 ;
          transfo.posY = 0.65*s+w ;
          break;
        }
        case "lozenge": {
          pts = [ 0.5,0, 1,0.5, 0.5,1, 0,0.5, 0.5,0 ]; 
          transfo.fac = 0.7;
          break;
        }
        case "square": 
        default: {
          pts = [ 0,0, 1,0, 1,1, 0,1, 0,0 ]; 
          break;
        }
      }
      for (var i=0; i<pts.length; i+=2) context.lineTo ( pts[i]*s+w, pts[i+1]*s+w);
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
ol_style_FontSymbol.prototype.drawMarker_ = function(renderOptions, context, x, y, pixelratio) {
  var fcolor = this.fill_ ? this.fill_.getColor() : "#000";
  var scolor = this.stroke_ ? this.stroke_.getColor() : "#000";
  if (this.form_ == "none" && this.stroke_ && this.fill_) {
    scolor = this.fill_.getColor();
    fcolor = this.stroke_.getColor();
  }
  // reset transform
  context.setTransform(pixelratio, 0, 0, pixelratio, 0, 0);

  // then move to (x, y)
  context.translate(x, y);

  var tr = this.drawPath_(renderOptions, context, pixelratio);

  if (this.fill_) {
    if (this.gradient_ && this.form_!="none") {
      var grd = context.createLinearGradient(0,0,renderOptions.size/2,renderOptions.size);
      grd.addColorStop (1, ol_color_asString(fcolor));
      grd.addColorStop (0, ol_color_asString(scolor));
      context.fillStyle = grd;
    } else {
      context.fillStyle = ol_color_asString(fcolor);
    }
    context.fill();
  }
  if (this.stroke_ && renderOptions.strokeWidth) {
    context.strokeStyle = renderOptions.strokeStyle;
    context.lineWidth = renderOptions.strokeWidth;
    context.stroke();
  }

  // Draw the symbol
  if (this.glyph_.char) {
    context.font = this.fontStyle_ +' '
      + (2*tr.fac*(this.radius_)*this.fontSize_)+"px "
      + this.glyph_.font;
    context.strokeStyle = context.fillStyle;
    context.lineWidth = renderOptions.strokeWidth * (this.form_ == "none" ? 2:1);
    context.fillStyle = ol_color_asString(this.color_ || scolor);
    context.textAlign = "center";
    context.textBaseline = "middle";
    var t = this.glyph_.char;
    if (renderOptions.strokeWidth && scolor!="transparent") context.strokeText(t, tr.posX, tr.posY);
    context.fillText(t, tr.posX, tr.posY);
  }

  if (this.form_=="ban" && this.stroke_ && renderOptions.strokeWidth) {
    context.strokeStyle = renderOptions.strokeStyle;
    context.lineWidth = renderOptions.strokeWidth;
    var r = this.radius_ + renderOptions.strokeWidth;
    var d = this.radius_ * Math.cos(Math.PI/4);
    context.moveTo(r + d, r - d);
    context.lineTo(r - d, r + d);
    context.stroke();
  }
};

/**
 * @inheritDoc
 */
ol_style_FontSymbol.prototype.getChecksum = function() {
  var strokeChecksum = (this.stroke_!==null) ? this.stroke_.getChecksum() : '-';
  var fillChecksum = (this.fill_!==null) ? this.fill_.getChecksum() : '-';

  var recalculate = (this.checksums_===null)
    || (strokeChecksum != this.checksums_[1] 
    || fillChecksum != this.checksums_[2] 
    || this.radius_ != this.checksums_[3] 
    || this.form_+"-"+this.glyphs_ != this.checksums_[4]
  );

  if (recalculate) {
    var checksum = 'c' + strokeChecksum + fillChecksum 
      + ((this.radius_ !== void 0) ? this.radius_.toString() : '-')
      + this.form_+"-"+this.glyphs_;
    this.checksums_ = [checksum, strokeChecksum, fillChecksum, this.radius_, this.form_+"-"+this.glyphs_];
  }

  return this.checksums_[0];
};

export default ol_style_FontSymbol
