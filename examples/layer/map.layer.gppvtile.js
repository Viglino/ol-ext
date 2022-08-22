// Get operations select
var operations = $('#operations').remove().html();

// Permalink
var perma = new ol.control.Permalink();
if (perma.getUrlParam('embed')) {
  $('body > a').hide();
  $('.info').hide();
  $('#map').css('top', 0);
  $('.options').css('top', 0);
}

// Color input
var onChangeColor = function() {}
$('#color input').spectrum({
  flat: true,
  localStorageKey: 'spectrum',
  showAlpha: false,
  showPalette: true,
  showInitial: true,
  showInput: true,
  chooseText: "choisir",
  cancelText: "annuler",
  preferredFormat: "hex3",
  clickoutFiresChange: true,
  change: function(color) {
    onChangeColor(color.toHexString());
    onChangeColor = function() {};
  }
});
$('#color .sp-choose').click(function() {
  onChangeColor($('#color input').val());
});

// The map
var map = new ol.Map({
  target: 'map',
  view: new ol.View ({
    zoom: 15,
    center: [261204.43490751847, 6250258.191535994]
  }),
  interactions: ol.interaction.defaults(),
  // layers: [ new ol.layer.Geoportail('ORTHOIMAGERY.ORTHOPHOTOS')]
});
map.addControl(perma);

// Vector layer
var vlayer = new ol.layer.VectorTile({
  title: "Plan IGN vecteur",
  renderMode: 'hybrid',
  source: new ol.source.VectorTile({
    tilePixelRatio: 1,
    tileGrid: ol.tilegrid.createXYZ({ maxZoom: 19 }),
    format: new ol.format.MVT(),
    projection: new ol.proj.Projection({code:"EPSG:3857"}),
    //url: "https://vectortiles.ign.fr/rok4server/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    //url : "https://wxs.ign.fr/choisirgeoportail/geoportail/tms/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    url : "https://wxs.ign.fr/essentiels/geoportail/tms/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    // url: "https://vectortiles.ign.fr/rok4server/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    attributions: '<a href="https://geoservices.ign.fr/blog/2018/07/08/nouveautes_vecteur.html">&copy; IGN-Géoportail</a>',
  }),
  declutter: true
});
map.addLayer(vlayer);

// Lecture du fichier de style
var currentStyle;
var config = {};
// IGN base style
var baseStyles = {};

ol.ext.Ajax.get({
  //url: './styles/planign.json',
  url: 'https://wxs.ign.fr/choisirgeoportail/static/vectorTiles/styles/PLAN.IGN/standard.json',
  // url: 'https://wxs.ign.fr/an7nvfzojv5wa96dsga5nk8w/static/vectorTiles/styles/PLAN.IGN/classique.json',
  // url: 'https://vectortiles.ign.fr/demonstrateur/styles/planign.json',
  //url: 'http://calac-4.ign.fr/pyramide_ecran/style_mapbox.json',
  // url: 'https://vectortiles.ign.fr/demonstrateur/styles/gris.json',
  // url: 'https://vectortiles.ign.fr/demonstrateur/styles/muet.json',
  success: function(style) {
    /* add sens circu * /
    style.layers.push(rdirect);
    style.layers.push(rinvers);
    /**/
    currentStyle = $.extend(true, {}, style);
    if (perma.getUrlParam('style')!=='0') olms.applyStyle(vlayer, style, 'plan_ign').then(function () {});
    showLayers();
  }
});

// Load base styles
['standard', 'gris', 'transparent', 'accentue', 'attenue', 'classique', 'epure'].forEach(function(s) {
  var sel = document.getElementById('styles');
  ol.ext.element.create('OPTION', {
    value: s,
    html: s,
    parent: sel
  })
  ol.ext.Ajax.get({
    //url: 'https://wxs.ign.fr/choisirgeoportail/static/vectorTiles/styles/PLAN.IGN/'+s+'.json',
    url: 'https://wxs.ign.fr/essentiels/static/vectorTiles/styles/PLAN.IGN/'+s+'.json',
    success: function(style) {
      baseStyles[s] = style;
    }
  })
});

// Upload custom style
onChangeColor = function() {};
var drop = new ol.interaction.DropFile({ formatConstructors: ['none'] });
map.addInteraction(drop);
drop.on('loadend', function(e) {
  try {
    var json = JSON.parse(e.result);
    reset();
    setBaseStyle(json);
  } catch(e) { /* ok */ }
})

// Set base style
function setBaseStyle(n) {
  if (typeof(n) === 'string') currentStyle = $.extend(true, {}, baseStyles[n]);
  else if (n.sprite) currentStyle = n;
  else return;
  $('#police select').val('Source Sans Pro').css('font-family', 'Source Sans Pro');
  // reset config
  for (var theme in config) {
    for (var s in config[theme].style) {
      config[theme].style[s].layers = [];
      config[theme].style[s].savePaintColor = [];
    }
  }
  currentStyle.layers.forEach(function(l) {
    var source = l['source-layer'];
    var theme = source.split('_')[0];
    config[theme].style[source].layers.push(l);
    config[theme].style[source].visible = l.layout.visibility!=='none';
    $('.options input.'+source).prop('checked', l.layout.visibility!=='none')
    // console.log(source,l.layout.visibility)
  })
  $('.options input.theme').each(function() {
    var checked = $('ul input:checked', $(this).parent().parent())
    $(this).attr('checked', checked.length>0);
  })
  applyStyle();
}

// Change font
function setFont(font0) {
  $('#police select').css('font-family', font0);
  currentStyle.layers.forEach(function(l) {
    if (l.layout['text-font']) {
      var italic = /Italic/.test(l.layout['text-font'][0]);
      var bold = /Bold/.test(l.layout['text-font'][0]);
      var font = font0.split(',');
      if (italic) font[0] += ' Italic';
      if (bold) font[0] += ' Bold';
      l.layout['text-font'] = font;
    }
  })
  applyStyle();
}


function getChromaColor(color) {
  var c = color.hex()
  if (c.length>7)  {
    c = color.css();
  }
  return c;
}
/** Apply current Style
 */
function applyStyle() {
  for (var theme in config) {
    var vis = config[theme].visible;
    var color0 = config[theme].color;
    for (var st in config[theme].style) {
      var color = color0;
      if (config[theme].useTheme) {
        var th2 = st.split('_')[1];
        if (config[th2]) {
          color = config[th2].color;
        }
      }
      style = config[theme].style[st];
      if (!style.savePaintColor) style.savePaintColor = [];
      style.layers.forEach(function(l, i) {
        l.layout.visibility = (vis && style.visible) ? 'visible' : 'none';
        ['text-color', /*'text-halo-color',*/ 'fill-color', 'fill-outline-color', 'line-color', 'circle-color', 'circle-stroke-color', 'icon-color'].forEach(function(c) {
          if (!l.paint[c]) return;
          if (!style.savePaintColor[i]) style.savePaintColor[i] = {};
          var savePaintColor = style.savePaintColor[i];
          // Init
          if (!savePaintColor[c]) {
            if (l.paint[c] && l.paint[c].stops) savePaintColor[c] = $.extend(true, {}, l.paint[c]);
            else savePaintColor[c] = l.paint[c];
          }
          // Reset
          if (savePaintColor[c]) {
            if (savePaintColor[c].stops) l.paint[c] = $.extend(true, {}, savePaintColor[c]);
            else l.paint[c] = savePaintColor[c];
          }
          if (color && l.paint) {
            switch(color) {
              case 'brighten':
              case 'darken':
              case 'brighten2':
              case 'darken2':
              case 'saturate':
              case 'desaturate':
              case 'saturate2':
              case 'desaturate2':
              case 'gray': {
                var opt = parseInt(color.replace(/([^0-9])/g,'')) || .5;
                var operation = color.replace(/[0-9]$/, '');
                if (color==='gray') {
                  console.log('gray')
                  opt = 4;
                  operation = 'desaturate';
                }
                // console.log(operation, opt, l.paint[c])
                try {
                  if (l.paint[c].stops) {
                    l.paint[c].stops.forEach(function (s) {
                      if (!(/#ffffff/i.test(s[1]) && /^saturate/.test(operation))) {
                        s[1] = getChromaColor(chroma(s[1])[operation](opt)); 
                      }
                      // console.log('STOP:',s)
                    })
                  } else {
                    // bug on saturate white gets red
                    if (!(/#ffffff/i.test(l.paint[c]) && /^saturate/.test(operation))) {
                      l.paint[c] = getChromaColor(chroma(l.paint[c])[operation](opt));
                    }
                  }
                } catch(e){};
                break; //'#cccccc'; break;
              }
              case 'red':
              case 'green':
              case 'blue':
              default: {
                try {
                  if (l.paint[c].stops) {
                    l.paint[c].stops.forEach(function (s) {
                      s[1] = getChromaColor(chroma.mix(s[1],color)); 
                    })
                  } else {
                    l.paint[c] = getChromaColor(chroma.mix(l.paint[c],color)); 
                  }
                } catch(e) {};
                break; 
              }
            }
          }
        });
      })
    }
  }
  olms.applyStyle(vlayer, currentStyle, "plan_ign");
}

/** Show layers
 */
function showLayers() {
  config = {};
  var sources = {};
  currentStyle.layers.forEach(function(l) {
    var name = l['source-layer'];
    if (name) {
      var theme = name.split('_').shift();
      if (!sources[theme]) sources[theme] = [];
      if (!sources[theme][name]) sources[theme][name] = [];
      sources[theme][name].push(l);
    }
  });
  var ul = $('.options ul');
  console.log(sources)
  Object.keys(sources).forEach(function(s) {
    config[s] = {
      visible: true,
      color: undefined,
      style: {}
    }
    var li = $('<li>').addClass('collapse').appendTo(ul);
    var label = $('<label>').text(s).appendTo(li);
    $('<input type="checkbox">')
      .addClass('theme')
      .prop('checked', true)
      .on('change', function() {
        var vis = config[s].visible = $(this).prop('checked');
        $('input', ul2).each(function() {
          $(this).prop('disabled', !vis);//.change();
        })
        applyStyle()
      })
      .prependTo(label);
    $('<i>').addClass('fa fa-carret-down')
      .click(function() {
        $(this).parent().toggleClass('collapse');
      })
      .appendTo(li);
    $('<select>').html(operations)
      .on('change', function(){
        if ($(this).val()==='color') {
          $('#color').show();
          $("#color .sp-cancel").off();
          $("#color .sp-cancel").on('click', function() { $('#color').hide(); })
          $(this).val('color');
          setTimeout(function() {
            onChangeColor = function(c) {
              config[s].color = c;
              applyStyle();
              $('#color').hide();
            }
          })
          return;
        } else {
          config[s].color = $(this).val();
          applyStyle();
        }
      })
      .appendTo(li);
    if (/toponyme/.test(s)) {
      label = $('<label>').addClass('toponyme')
        .html('couleur du thème')
        .appendTo(li);
      $('<input type="checkbox">')
        .change(function() {
          config[s].useTheme = $(this).prop('checked');
          applyStyle();
        })
        .prependTo(label);
    }
    var ul2 = $("<ul>").appendTo(li);
    Object.keys(sources[s]).forEach(function(i) {
      var li = $('<li>').appendTo(ul2);
      var source = sources[s][i][0];
      var label = $('<label>').text(i.replace(/toponyme_|routier_|ocs_|hydro_|parcellaire_/, '')).attr('title', i).appendTo(li);
      config[s].style[i] = {
        visible: source.layout.visibility!=='none',
        layers: sources[s][i]
      };
      $('<input type="checkbox">')
        .prop('checked', source.layout.visibility!=='hidden' ? 'checked':'')
        .addClass(i)
        .data('layer', i)
        .on('change', function() {
          config[s].style[i].visible = $(this).prop('checked');
          applyStyle();
        })
        .prependTo(label);
    });
  });
}

// Selection
var selStyle = ol.style.Style.defaultStyle(true)
selStyle.push(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({ color: '#f00' })
  }),
  geometry: function(f) {
    return new ol.geom.Point(f.getGeometry().getFirstCoordinate())
  }
}))
var select = new ol.layer.Vector({ 
  source: new ol.source.Vector(),
  style: selStyle
});
map.addLayer(select);

// Log properties
map.on('click', function() {
  var f = select.getSource().getFeatures()[0];
  if (f) console.log(f.getProperties())
})

// Show tooltip on hover
var tooltip  = new ol.Overlay.Tooltip({ className: 'default', positioning: 'bottom-center' });
map.addOverlay(tooltip);

var hover = new ol.interaction.Hover({ 
  cursor: "pointer",
  layers: [vlayer]
});
hover.setActive(false);
map.addInteraction(hover);
function showPopup(b) {
  tooltip.setInfo('');
  hover.setActive(b);
}
hover.on("enter", function(e) {
  var showGeom = $('#showSel').prop('checked');
  // hover.setCursor("pointer");
  var feature = e.feature;
  if (select.getSource().getFeatures().length) select.getSource().clear();
  var info = '';
  if (feature && feature.get('layer')!=='fond_opaque') {
    info = '<h2>'+feature.get('layer').replace(/_/g,' ')+'</h2>';
    ['symbo', 'nature', 'rond_point', 'sens_circu', 'texte', 'nom_desabrege', 'numero', 'hauteur'].forEach(function(a) {
      if (feature.get(a)) info += '<br/>'+a.replace(/_/g,' ')+': '+feature.get(a);
    })
  }
  tooltip.setInfo(info);
  //console.log(feature.getProperties());
  // Select feature 
  if (showGeom) {
    var coords = [];
    if (feature instanceof ol.Feature) {
      select.getSource().addFeature(feature);
    } else {
      var c = feature.getFlatCoordinates();
      for (var i=0; i<c.length; i+=2) {
        coords.push ([c[i],c[i+1]]);
      }
      // console.log(feature.getType())
      switch (feature.getType()) {
        case 'Point': {
          coords = coords.pop();
          break;
        }
        case 'LineString' : {
          coords = coords;
          break;
        }
        case 'MultiLineString' : 
        case 'Polygon' : {
          coords = [coords];
          break;
        }
      }
      var geom = new ol.geom[feature.getType()](coords)
      var f2 = new ol.Feature(geom);
      f2.setProperties(feature.getProperties())
      select.getSource().addFeature(f2);
    }
  }
});
hover.on("leave", function(e) {
  tooltip.setInfo('');
  select.getSource().clear();
});

// Reset styles
function reset() {
  $('.options input').prop('checked', true);
  $('.options input').prop('disabled', false);
  $('.options .toponyme input').prop('checked', false);
  for (theme in config) {
    config[theme].color = '';
    config[theme].visible = true;
    if (/toponyme/.test(theme)) config[theme].useTheme = false;
    for (i in config[theme].style) {
      config[theme].style[i].visible = true;
    }
  }
  $('.options ul select').val('');
  applyStyle();
}

/** [Debug] get layer style
 * @param {string} lanyer layer name
 */
function getLayerStyle(layer) {
  var styles = [];
  currentStyle.layers.forEach(function(style) {
    if (style['source-layer']===layer) {
      styles.push(style);
    }
  })
  return styles;
}

// Save to JSON file
function save() {
  var data = JSON.stringify(currentStyle, null, ' ');
  data = data.replace(/an7nvfzojv5wa96dsga5nk8w/g, 'essentiels')
  var blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
  saveAs(blob, 'custom.json');
}

// Add sens de circulation
var sens = {
  "id": "Routier - sens direct",
  "type": "symbol",
  "source": "plan_ign",
  "source-layer": "routier_route",
  "minzoom": 15,
  "filter": [
    "==",
    "sens_circu",
    "Sens direct"
  ],
  "layout": {
    "visibility": "visible",
    "text-field": "→",
    "symbol-placement": "line-center",
    "text-size": 15,
    "text-anchor": "center",
	  "text-offset": [0, -0.2],
    "text-keep-upright": false,
    "text-rotation-alignment":"map",
    "text-pitch-alignment": "viewport",
  },
  "paint": {
    "text-color": "#000000"
  }
}
var rdirect = $.extend(true, {}, sens);
rdirect.id = 'Routier - sens direct';
rdirect.layout['text-field'] = '→';
rdirect.filter[2] = "Sens direct";
var rinvers = $.extend(true, {}, sens);
rinvers.id = 'Routier - sens inverse'
rinvers.layout['text-field'] = '←'
rinvers.filter[2] = "Sens inverse";
