/*
* Copyright (c) 2015 Jean-Marc VIGLINO, 
* released under the CeCILL-B license (French BSD license)
* (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_style_Style from 'ol/style/Style'
import ol_style_Text from 'ol/style/Text';
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'

/**
 * Get a style for Geoportail WFS features
 *
 * @param {String} options.typeName 
 * @param {any} options
 *  @param {boolean} options.sens
 *  @param {boolean} options.symbol
 * @return {Array<ol.style.Style}
 */
var ol_style_geoportailStyle;

(function(){
var cache = {};
var styleCount = 0;

// Troncon de route
function troncon_de_route(options) {
  // Get color according to road properties
  var getColor = function (feature) {
    if (options.vert && feature.get('itineraire_vert')) {
      if (feature.get('position_par_rapport_au_sol') < 0) return [0, 128, 0, .7];
      else if (feature.get('position_par_rapport_au_sol') > 0) return [0, 100, 0, 1];
      else return [0, 128, 0, 1];
    }
    if (!feature.get('importance')) return "magenta";
    if (feature.get('nature') === 'Piste cyclable') {
      return [27,177,27,.5]
    }
    if (feature.get('position_par_rapport_au_sol') != "0") {
      var col;
      switch(feature.get('importance')) {
        case "1": col = [177, 27, 177, 1]; break;
        case "2": col = [177, 27, 27, 1]; break;
        case "3": col = [217, 119, 0, 1]; break;
        case "4": col = [255, 225, 0, 1]; break;
        case "5": col = [204, 204, 204, 1]; break;
        default: col = [211, 211, 211, 1]; break;
      }
      if (feature.get('position_par_rapport_au_sol') < 0) col[3] = .7;
      return col;
    } else {
      switch(feature.get('importance')) {
        case "1": return [255,0,255,1]; 
        case "2": return [255,0,0,1]; 
        case "3": return [255, 165, 0, 1];
        case "4": return [255,255,0,1]; 
        case "5": return [255,255,255,1]; 
        default: return [211, 211, 211, 1];
      }
    }
    // return "#808080";
  }

  // Get Width
  var getWidth = function (feature) {
    return Math.max ( feature.get('largeur_de_chaussee')||2 , 2 );
  }

  // Zindex
  var getZindex = function (feature) {
    if (!feature.get('position_par_rapport_au_sol')) return 100;
    var pos = Number(feature.get('position_par_rapport_au_sol'));
    if (pos>0) return 10 + pos*10 - (Number(feature.get('importance')) || 10);
    else if (pos<0) return Math.max(4 + pos, 0);
    else return 10 - (Number(feature.get('importance')) || 10);
    // return 0;
  }

  // Get rotation on the center of the line
  var lrot = function (geom) {
    //if (sens != options.direct && sens != options.inverse) return 0;
    var geo = geom.getCoordinates();
    var x, y, dl=0, l = geom.getLength();
    for (var i=0; i<geo.length-1; i++) {
      x = geo[i+1][0]-geo[i][0];
      y = geo[i+1][1]-geo[i][1];
      dl += Math.sqrt(x*x+y*y);
      if (dl>=l/2) break;
    }
    return -Math.atan2(y,x);
  }
  // Sens circulation
  var getSens = function (feature) {
    if (options.sens && !/double|sans/i.test(feature.get('sens_de_circulation'))) {
      return new ol_style_Text({
        text: (feature.get('sens_de_circulation') == 'Sens direct' ? '→' : '←'),
        font: 'bold 12px sans-serif',
        placement: 'point',
        textAlign: 'center',
        fill: new ol_style_Fill({ color: [0,0,0,.3] }),
        stroke: new ol_style_Stroke({ color: [0,0,0,.3], width: 1.5 }),
        rotateWithView: true
      })
    }
    return null;
  }
  var getDash = function(feature) {
    switch (feature.get('nature')) {
      case 'Escalier': {
        return [1,4]
      }
      case 'Sentier': {
        return [8,10]
      }
    }
  }

  var styleId = 'ROUT-'+(styleCount++)+'-'
  return function (feature) {
    var id = styleId
      + feature.get('nature') + '-'
      + feature.get('position_par_rapport_au_sol') + '-'
      + feature.get('sens_de_circulation') + '-'
      + feature.get('position_par_rapport_au_sol') + '-'
      + feature.get('importance') + '-'
      + feature.get('largeur_de_chaussee') + '-'
      + feature.get('itineraire_vert');
    var style = cache[id];
    if (!style) {
      style = cache[id] = [	
        new ol_style_Style ({
          text: getSens(feature),
          stroke: new ol_style_Stroke({
            color: getColor(feature),
            width: getWidth(feature),
            lineDash: getDash(feature)
          }),
          zIndex: getZindex(feature)-100
        })
      ];
    }
    // Rotation
    if (style[0].getText()) style[0].getText().setRotation(lrot(feature.getGeometry()));
    return style;
  };
}

function batiment(options) {
  var getBatiColor = function (feature) {
    switch (feature.get('nature')) {
      case "Industriel, agricole ou commercial": return [51, 102, 153,1];
      case "Remarquable": return [0,192,0,1];
      default: 
        switch ( feature.get('usage_1') ) {
          case 'Résidentiel':
          case 'Indifférencié': 
            return [128,128,128,1];
          case 'Industriel':
          case 'Commercial et services': 
            return [51, 102, 153,1];
          case "Sportif": 
            return [51,153,102,1];
          case "Religieux": 
            return [153,102,51,1];
          default: return [153,51,51,1];
        }
    }
  }

  var getSymbol = function (feature) {
    switch ( feature.get('usage_1') ) {
      case "Commercial et services": return "\uf217";
      case "Sportif": return "\uf1e3";
      default: return null;
    }
  }
  
  var styleId = 'BATI-'+(styleCount++)+'-'
  return function (feature) {
    if (feature.get('detruit')) return [];
    var id = styleId 
      + feature.get('usage_1') + '-'
      + feature.get('nature') + '-'
      + feature.get('etat_de_l_objet');
    var style = cache[id];
    if (!style) {
      var col = getBatiColor(feature);
      var colfill = [col[0], col[1], col[1], .5]
      var projet = !/en service/i.test(feature.get('etat_de_l_objet'));
      if (projet) colfill[3] = .1;
      var symbol = (options.symbol ? getSymbol(feature): null);
      return [
        new ol_style_Style({
          text: symbol ? new ol_style_Text({
            text: symbol,
            font: '12px FontAwesome',
            fill: new ol_style_Fill({
              color: [0,0,0, .6] //col
            })
          }) : null,
          fill: new ol_style_Fill({
            color: colfill
          }),
          stroke: new ol_style_Stroke ({
            color: col,
            width: 1.5,
            lineDash: projet ? [5,5] : null
          })
        })
      ]
    }
    return style
  }
};

// Parcelle / cadastre
function parcelle(options) {
  var style = new ol_style_Style({
    text: new ol_style_Text({
      text: '0000',
      font: 'bold 12px sans-serif',
      fill: new ol_style_Fill({
        color: [100, 0, 255, 1]
      }),
      stroke: new ol_style_Stroke ({
        color: [255,255,255, .8],
        width: 3
      })
    }),
    stroke: new ol_style_Stroke ({
      color: [255, 165, 0, 1],
      width: 1.5
    }),
    fill: new ol_style_Fill({
      color: [100, 0, 255, .1]
    })
  })

  return function(feature, resolution) {
    if (resolution < .8) style.getText().setFont('bold 12px sans-serif');
    else style.getText().setFont('bold 10px sans-serif');
    if (options.section) {
      style.getText().setText(feature.get('section') +'-'+ (feature.get('numero')||'').replace(/^0*/,''));
    } else {
      style.getText().setText((feature.get('numero')||'').replace(/^0*/,''));
    }
    return style;
  }
};

ol_style_geoportailStyle = function(typeName, options) {
  options = options || {};
  switch (typeName) {
    // Troncons de route
    case 'BDTOPO_V3:troncon_de_route': return troncon_de_route(options);
    // Bati
    case 'BDTOPO_V3:batiment': return batiment(options);
    // Parcelles
    case 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle': return parcelle(options);
  }
};

})();

export default ol_style_geoportailStyle
