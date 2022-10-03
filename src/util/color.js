import {asArray as ol_color_asArray} from 'ol/color.js'

/** Converts an RGB color value to HSL.
 * returns hsl as array h:[0,360], s:[0,100], l:[0,100]
 * @param {ol/color~Color|string} rgb
 * @param {number} [round=100]
 * @returns {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 */
var ol_color_toHSL = function(rgb, round) {
  if (round===undefined) round = 100;
  if (!Array.isArray(rgb)) rgb = ol_color_asArray(rgb);
  var r = rgb[0] / 255;
  var g = rgb[1] / 255;
  var b = rgb[2] / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
  }

  var hsl = [ 
    Math.round(h*60*round)/round, 
    Math.round(s*100*round)/round, 
    Math.round(l*100*round)/round
  ];
  if (rgb.length>3) hsl[3] = rgb[3];
  return hsl;
}

/** Converts an HSL color value to RGB.
 * @param {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 * @param {number} [round=1000]
 * @returns {Array<number>} rgb
 */
var ol_color_fromHSL = function(hsl, round) {
  if (round===undefined) round = 1000
  var h = hsl[0] / 360;
  var s = hsl[1] / 100;
  var l = hsl[2] / 100;
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  var rgb = [ 
    Math.round(r * 255*round) / round, 
    Math.round(g * 255*round) / round, 
    Math.round(b * 255*round) / round
  ];
  if (hsl.length>3) rgb[3] = hsl[3];
  return rgb;
}

/** Converts an HSL color value to RGB.
 * @param {ol/color~Color|string} rgb
 * @param {number} [round=100]
 * @returns {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 */
var ol_color_toHSV = function(rgb, round) {
  if (round===undefined) round = 100;
  if (!Array.isArray(rgb)) rgb = ol_color_asArray(rgb);
  var r = rgb[0] / 255;
  var g = rgb[1] / 255;
  var b = rgb[2] / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
  }

  var hsv = [ 
    Math.round(h*60*round)/round, 
    Math.round(s*100*round)/round, 
    Math.round(v*100*round)/round
  ];
  if (rgb.length>3) hsv[3] = rgb[3];
  return hsv;
}

/** Converts an HSV color value to RGB.
 * @param {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 * @param {number} [round=1000]
 * @returns {Array<number>} rgb
 */
var ol_color_fromHSV = function(hsv, round) {
  if (round===undefined) round = 1000
  var h = hsv[0] / 360;
  var s = hsv[1] / 100;
  var v = hsv[2] / 100;
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  var rgb = [ 
    Math.round(r * 255*round) / round, 
    Math.round(g * 255*round) / round, 
    Math.round(b * 255*round) / round
  ];
  if (hsv.length>3) rgb[3] = hsv[3];
  return rgb;
}

/** Converts an HSL color value to RGB.
 * @param {ol/color~Color|string} rgb
 * @returns {string} 
 */
var ol_color_toHexa = function(rgb) {
  return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

export { ol_color_toHSL as toHSL }
export { ol_color_fromHSL as fromHSL }
export { ol_color_toHSV as toHSV }
export { ol_color_fromHSV as fromHSV }
export { ol_color_toHexa as toHexa }
