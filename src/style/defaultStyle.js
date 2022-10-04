import ol_style_Style from 'ol/style/Style.js'
import ol_style_Circle from 'ol/style/Circle.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_style_Fill from 'ol/style/Fill.js'

var ol_style_Style_defaultStyle;

(function() {

// Style
var white = [255, 255, 255, 1];
var blue = [0, 153, 255, 1];
var width = 3;

var defaultEditStyle = [
  new ol_style_Style({
    stroke: new ol_style_Stroke({ color: white, width: width + 2 })
  }),
  new ol_style_Style({
    image: new ol_style_Circle({
      radius: width * 2,
      fill: new ol_style_Fill({ color: blue }),
      stroke: new ol_style_Stroke({ color: white, width: width / 2 })
    }),
    stroke: new ol_style_Stroke({ color: blue, width: width }),
    fill: new ol_style_Fill({
      color: [255, 255, 255, 0.5]
    })
  })
];

/**
 * Get the default style
 * @param {boolean|*} [edit] true to get editing style or a { color, fillColor } object, default get default blue style
 * @return {Array<ol.style.Style>}
 */
ol_style_Style_defaultStyle = function(edit) {
  if (edit===true) {
    return defaultEditStyle;
  } else {
    edit = edit || {};
    var fill = new ol_style_Fill({
      color: edit.fillColor || 'rgba(255,255,255,0.4)'
    });
    var stroke = new ol_style_Stroke({
      color: edit.color || '#3399CC',
      width: 1.25
    });
    var style = new ol_style_Style({
      image: new ol_style_Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
      }),
      fill: fill,
      stroke: stroke
    });
    return [ style ];
  }
};

})();

export default ol_style_Style_defaultStyle
