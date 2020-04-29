import ol_style_Style from 'ol/style/Style'
import ol_style_Circle from 'ol/style/Circle'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'

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

var fill = new ol_style_Fill({
  color: 'rgba(255,255,255,0.4)'
});
var stroke = new ol_style_Stroke({
  color: '#3399CC',
  width: 1.25
});
var defaultStyle = new ol_style_Style({
  image: new ol_style_Circle({
    fill: fill,
    stroke: stroke,
    radius: 5
  }),
  fill: fill,
  stroke: stroke
});

/**
 * Get the default style
 * @param {boolean|*} [edit] true to get editing style or a { color, fillColor } object, default get default blue style
 * @return {Array<ol.style.Style>}
 */
ol_style_Style_defaultStyle = function(edit) {
  if (edit===true) {
    return defaultEditStyle;
  } else {
    var style = defaultStyle.clone();
    if (edit) {
      if (edit.color) {
        style.getImage().getStroke().setColor(edit.color);
        style.getStroke().setColor(edit.color);
      }
      if (edit.fillColor) {
        style.getImage().getFill().setColor(edit.fillColor);
        style.getFill().setColor(edit.fillColor);
      }
      style.getImage().render();
    }
    return [ style ];
  }
};

})();

export default ol_style_Style_defaultStyle
