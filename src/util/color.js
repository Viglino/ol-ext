import {asArray as ol_color_asArray} from 'ol/color'

/** Converts an RGB color value to HSL.
 * returns hsl as array h:[0,360], s:[0,100], l:[0,100]
 * @param {ol/color~Color|string} rgb
 * @returns {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 */
var ol_color_toHSL = function(rgb) {
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

  return [ 
    Math.round(h*6000)/100, 
    Math.round(s*10000)/100, 
    Math.round(l*10000)/100
  ];
}

/** Converts an HSL color value to RGB.
 * @param {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 * @returns {Array<number>} rgb
 */
var ol_color_fromHSL = function(hsl) {
  var h = hsl[0] / 360;
  var s = hsl[1] / 100;
  var l = hsl[2] / 100;
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
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

  return [ 
    Math.round(r * 255000) / 1000, 
    Math.round(g * 255000) / 1000, 
    Math.round(b * 255000) / 1000
  ];
}

export { ol_color_toHSL as toHSL }
export { ol_color_fromHSL as fromHSL }