var perma = new ol.control.Permalink();
if (perma.getUrlParam('embed')) {
  $('body > a').hide();
  $('.info').hide();
  $('#map').css('top', 0);
  $('.options').css('top', 0);
}

// Color
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
    console.log('change')
    onChangeColor(color.toHexString());
    onChangeColor = function() {};
  }
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

var vlayer = new ol.layer.VectorTile({
  title: "Plan IGN vecteur",
  renderMode: 'hybrid',
  source: new ol.source.VectorTile({
    tilePixelRatio: 1,
    tileGrid: ol.tilegrid.createXYZ({ maxZoom: 19 }),
    format: new ol.format.MVT(),
    projection: new ol.proj.Projection({code:"EPSG:3857"}),
    //url: "https://vectortiles.ign.fr/rok4server/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    url : "https://wxs.ign.fr/an7nvfzojv5wa96dsga5nk8w/geoportail/tms/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    // url: "https://vectortiles.ign.fr/rok4server/1.0.0/PLAN.IGN/{z}/{x}/{y}.pbf",
    attributions: '<a href="https://geoservices.ign.fr/blog/2018/07/08/nouveautes_vecteur.html">&copy; IGN-Géoportail</a>',
  }),
  declutter: true
});
map.addLayer(vlayer);

// Lecture du fichier de style
var globalStyle, baseStyles={}, currentStyle;
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
    globalStyle = currentStyle = style;
    olms.applyStyle(vlayer, style, 'plan_ign').then(function () {});
    showLayers();
  }
});

// Load base styles
['standard', 'gris', 'accentue', 'attenue', 'classique'].forEach(function(s) {
  ol.ext.Ajax.get({
    url: 'https://wxs.ign.fr/choisirgeoportail/static/vectorTiles/styles/PLAN.IGN/'+s+'.json',
    success: function(style) {
      baseStyles[s] = style;
      var sel = document.getElementById('styles');
      ol.ext.element.create('OPTION', {
        value: s,
        html: s,
        parent: sel
      })
    }
  })
});
// Set base style
function setBaseStyle(n) {
  globalStyle = currentStyle = baseStyles[n];
  $('.options .theme').change();
  //olms.applyStyle(vlayer, currentStyle, "plan_ign")
}

// Apply color
function setStyleColor(l, vis, color) {
  l.layout.visibility = vis;
  ['text-color', /*'text-halo-color',*/ 'fill-color', 'fill-outline-color', 'line-color', 'circle-color', 'circle-stroke-color', 'icon-color'].forEach(function(c) {
    if (!l.paint[c]) return;
    if (!l.savePaintColor) l.savePaintColor = {};
    if (l.savePaintColor[c]) {
      if (l.savePaintColor[c].stops) l.paint[c] = $.extend(true, {}, l.savePaintColor[c]);
      else l.paint[c] = l.savePaintColor[c];
    }
    if (color && l.paint) {
      if (!l.savePaintColor[c]) {
        if (l.paint[c] && l.paint[c].stops) l.savePaintColor[c] = $.extend(true, {}, l.paint[c]);
        else l.savePaintColor[c] = l.paint[c];
      }
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
            opt = 4;
            operation = 'desaturate';
          }
          //console.log(operation,opt)
          try {
            if (l.paint[c].stops) {
              l.paint[c].stops.forEach(function (s) {
                s[1] = chroma(s[1])[operation](opt).hex(); 
                // console.log('STOP:',s)
              })
            } else {
              l.paint[c] = chroma(l.savePaintColor[c])[operation](opt).hex(); 
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
                s[1] = chroma.mix(s[1],color).hex(); 
              })
            } else {
              l.paint[c] = chroma.mix(l.savePaintColor[c],color).hex(); 
            }
          } catch(e){};
          break; 
        }
      }
      // console.log(l.savePaintColor, l.paint[l.type+'-color']);
    }
  })
}

function getVisibleStyle(check, color) {
  var vis = $(check).prop('checked') ? 'visible' : 'hidden';
  var style = currentStyle = $.extend({}, globalStyle);
  style.layers = [];
  var layer = $(check).data('layer');
  globalStyle.layers.forEach(function(l) {
    if (l.layout) {
      if (l['source-layer'] === layer) setStyleColor(l, vis, color);
      if (l.layout.visibility !== 'hidden') style.layers.push(l);
    }
  });
  return style;
}

// Apply the layers style
function showLayers() {
  var sources = {};
  globalStyle.layers.forEach(function(l) {
    var name = l['source-layer'];
    if (name) {
      var theme = name.split('_').shift();
      if (!sources[theme]) sources[theme] = [];
      sources[theme][name] = l;
    }
  });
  var ul = $('.options ul');
  console.log(sources)
  Object.keys(sources).forEach(function(s) {
    var li = $('<li>').appendTo(ul);
    var label = $('<label>').text(s).appendTo(li);
    $('<input type="checkbox">')
      .addClass('theme')
      .prop('checked', true)
      .on('change', function() {
        var vis = $(this).prop('checked');
        var style;
        $('input', ul2).each(function() {
          $(this).prop('checked', vis);//.change();
          style = getVisibleStyle(this, color);
        })
        olms.applyStyle(vlayer, style, "plan_ign");
      })
      .prependTo(label);
    var color;
    $('<select>').html(`
      <option value="">normal</option>
      <option value="gray">gray</option>
      <option value="saturate">saturate</option>
      <option value="saturate2">saturate2</option>
      <option value="desaturate">desaturate</option>
      <option value="desaturate2">desaturate2</option>
      <option value="darken">darken</option>
      <option value="darken2">darken2</option>
      <option value="brighten">brighten</option>
      <option value="brighten2">brighten2</option>
      <option value="red">red</option>
      <option value="green">green</option>
      <option value="blue">blue</option>
      <option value="color" style="display: none;">user color</option>
      <option value="color">user color</option>
      `)
      .on('change', function(){
        color = $(this).val();
        if (color==='color') {
          /*
          color = prompt('Enter a color code (#rrggbb):') || '';
          if (color.charAt(0)!=='#') color = '#'+color;
          if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
            color = '';
          }
          $(this).val('color');
          */
          var self = this;
          $(this).val('color');
          console.log('ok')
          $('#color').show();
          $("#color .sp-cancel").off();
          $("#color .sp-cancel").on('click', function() { $('#color').hide(); })
          setTimeout(function() {
            onChangeColor = function(c) {
              color = c;
              $(self).data('color', color);
              $('input', ul2).each(function() {
                $(this).change();
              })
              $('#color').hide();
            }
          })

          /*
          $("#color .sp-choose").off('click');
          $("#color .sp-choose").on('click', function() { 
            color = $('#color input').spectrum('get').toHexString();
            $(self).data('color', color);
            $('input', ul2).each(function() {
              $(this).change();
            })
            $('#color').hide();
          })
          */
          return;
        }
        $(this).data('color', color);
        $('input', ul2).each(function() {
          $(this).change();
        })
      })
      .appendTo(li);
    var ul2 = $("<ul>").appendTo(li);
    Object.keys(sources[s]).forEach(function(i) {
      var li = $('<li>').appendTo(ul2);
      var source = sources[s][i];
      var label = $('<label>').text(i.replace(/toponyme_|routier_|ocs_|hydro_|parcellaire_/, '')).attr('title', i).appendTo(li);
      $('<input type="checkbox">')
        .prop('checked', source.layout.visibility!=='hidden' ? 'checked':'')
        .data('layer', i)
        .on('change', function() {
          var style = getVisibleStyle(this, color);
          olms.applyStyle(vlayer, style, "plan_ign");
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

map.on('click', function() {
  var f = select.getSource().getFeatures()[0];
  if (f) console.log(f.getProperties())
})

var tooltip  = new ol.Overlay.Tooltip({ className: 'default', positioning: 'bottom-center' });
map.addOverlay(tooltip);

var hover = new ol.interaction.Hover({ 
  cursor: "pointer",
  layers: [vlayer]
  });
map.addInteraction(hover);
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
  /* Select feature */
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
  /**/
});
hover.on("leave", function(e) {
  tooltip.setInfo('');
  select.getSource().clear();
});


function getLayerStyle(layer) {
  var styles = [];
  currentStyle.layers.forEach(function(style) {
    if (style['source-layer']===layer) {
      styles.push(style);
    }
  })
  return styles;
}

// Reset styles
function reset() {
  $('.options ul select').val('').change();
  $('.options .theme').each(function() {
    $(this).prop('checked', true).change()
  });
}

function save() {
  var data = JSON.stringify(currentStyle);
  var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "custom.json");
}

var sens = {
  "id": "Routier - sens direct",
  "type": "symbol",
  "source": "plan_ign",
  "source-layer": "routier_route",
  "filter": [
    "==",
    "sens_circu",
    "Sens direct"
  ],
  "layout": {
    "visibility": "visible",
    "text-field": "→",
    "symbol-placement": "line",
    "text-size": 15,
    "text-anchor": "center",
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
