/*
* Copyright (c) 2015 Jean-Marc VIGLINO, 
* released under the CeCILL-B license (French BSD license)
* (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_style_Style from 'ol/style/Style'
import ol_style_Text from 'ol/style/Text';
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Style_defaultStyle from '../style/defaultStyle'

/**
 * Get a style for Geoportail WFS features
 *
 * @param {String} options.typeName 
 * @param {any} options
 *  @param {boolean|number} options.sens true show flow direction or a max resolution to show it, default false
 *  @param {boolean} options.vert 'vert' road section (troncon_de_route) style, default false
 *  @param {boolean} options.symbol show symbol on buildings (batiment), default false
 * @return {Array<ol.style.Style>}
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
  return function (feature, res) {
    var useSens = (options.sens === true || res < options.sens);
    var id = styleId
      + feature.get('nature') + '-'
      + feature.get('position_par_rapport_au_sol') + '-'
      + (useSens ? feature.get('sens_de_circulation') : 'Sans objet') + '-'
      + feature.get('position_par_rapport_au_sol') + '-'
      + feature.get('importance') + '-'
      + feature.get('largeur_de_chaussee') + '-'
      + feature.get('itineraire_vert');
    var style = cache[id];
    if (!style) {
      style = cache[id] = [	
        new ol_style_Style ({
          text: useSens ? getSens(feature) : null,
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

/** Style for batiments */
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
}

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
}

// Corine Land Cover Style
var clcColors = {
  111: { color: [230,0,77,255], title: 'Continuous urban fabric'},
  112: { color: [255,0,0,255], title: 'Discontinuous urban fabric'},
  121: { color: [204,77,242,255], title: 'Industrial or commercial units'},
  122: { color: [204,0,0,255], title: 'Road and rail networks and associated land'},
  123: { color: [230,204,204,255], title: 'Port areas'},
  124: { color: [230,204,230,255], title: 'Airports'},
  131: { color: [166,0,204,255], title: 'Mineral extraction sites'},
  132: { color: [166,77,0,255], title: 'Dump sites'},
  133: { color: [255,77,255,255], title: 'Construction sites'},
  141: { color: [255,166,255,255], title: 'Green urban areas'},
  142: { color: [255,230,255,255], title: 'Sport and leisure facilities'},
  211: { color: [255,255,168,255], title: 'Non-irrigated arable land'},
  212: { color: [255,255,0,255], title: 'Permanently irrigated land'},
  213: { color: [230,230,0,255], title: 'Rice fields'},
  221: { color: [230,128,0,255], title: 'Vineyards'},
  222: { color: [242,166,77,255], title: 'Fruit trees and berry plantations'},
  223: { color: [230,166,0,255], title: 'Olive groves'},
  231: { color: [230,230,77,255], title: 'Pastures'},
  241: { color: [255,230,166,255], title: 'Annual crops associated with permanent crops'},
  242: { color: [255,230,77,255], title: 'Complex cultivation patterns'},
  243: { color: [230,204,77,255], title: 'Land principally occupied by agriculture with significant areas of natural vegetation'},
  244: { color: [242,204,166,255], title: 'Agro-forestry areas'},
  311: { color: [128,255,0,255], title: 'Broad-leaved forest'},
  312: { color: [0,166,0,255], title: 'Coniferous forest'},
  313: { color: [77,255,0,255], title: 'Mixed forest'},
  321: { color: [204,242,77,255], title: 'Natural grasslands'},
  322: { color: [166,255,128,255], title: 'Moors and heathland'},
  323: { color: [166,230,77,255], title: 'Sclerophyllous vegetation'},
  324: { color: [166,242,0,255], title: 'Transitional woodland-shrub'},
  331: { color: [230,230,230,255], title: 'Beaches dunes sands'},
  332: { color: [204,204,204,255], title: 'Bare rocks'},
  333: { color: [204,255,204,255], title: 'Sparsely vegetated areas'},
  334: { color: [0,0,0,255], title: 'Burnt areas'},
  335: { color: [166,230,204,255], title: 'Glaciers and perpetual snow'},
  411: { color: [166,166,255,255], title: 'Inland marshes'},
  412: { color: [77,77,255,255], title: 'Peat bogs'},
  421: { color: [204,204,255,255], title: 'Salt marshes'},
  422: { color: [230,230,255,255], title: 'Salines'},
  423: { color: [166,166,230,255], title: 'Intertidal flats'},
  511: { color: [0,204,242,255], title: 'Water courses'},
  512: { color: [128,242,230,255], title: 'Water bodies'},
  521: { color: [0,255,166,255], title: 'Coastal lagoons'},
  522: { color: [166,255,230,255], title: 'Estuaries'},
  523: { color: [230,242,255,255], title: 'Sea and ocean'},
};

function corineLandCover (options) {
  return function(feature) {
    var code = feature.get('code_'+options.date);
    var style = cache['CLC-'+code];
    if (!style) {
      var color = clcColors[code].color.slice();
      color[3] = options.opacity || 1;
      style = cache['CLC-'+code] = new ol_style_Style({
        fill: new ol_style_Fill({
          color: color || [255,255,255,.5]
        })
      })
    }
    return style;
  }
}

/** Get ol style for an IGN WFS layer
 * @param {string} typeName
 * @param {Object} options
 */
ol_style_geoportailStyle = function(typeName, options) {
  options = options || {};
  switch (typeName) {
    // Troncons de route
    case 'BDTOPO_V3:troncon_de_route': return troncon_de_route(options);
    // Bati
    case 'BDTOPO_V3:batiment': return batiment(options);
    // Parcelles
    case 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle': return parcelle(options);
    default: {
      // CLC
      if (/LANDCOVER/.test(typeName)) {
        options.date = typeName.replace(/[^\d]*(\d*).*/,'$1');
        return (corineLandCover(options));
      } else {
        // Default style
        console.warn('[ol/style/geoportailStyle] no style defined for type: ' + typeName)
        return ol_style_Style_defaultStyle(); 
      }
    }
  }
};

/** List of clc colors */
ol_style_geoportailStyle.clcColors = JSON.parse(JSON.stringify(clcColors));

})();

export default ol_style_geoportailStyle
