
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var minZoom = 16;
var jstsParser = new jsts.io.OL3Parser();

// The map
var map = new ol.Map ({
  target: 'map',
  view: new ol.View ({
    zoom: minZoom,
    center: [261204.43490751847, 6250258.191535994]
  })
});

var switcher = new ol.control.LayerSwitcher();
map.addControl(switcher);
var plink = new ol.control.Permalink({ visible: false })
map.addControl(plink);
map.addControl(new ol.control.ScaleLine());
map.addControl(new ol.control.SearchBAN({
  zoomOnSelect: 15
}))
if (/cours_d_eau/.test(plink.getUrlParam('layer'))) {
  minZoom = 13;
  $('#typename option.standard').remove();
  plink.setUrlParam('layer', $('#typename').val());
} else {
  $('#typename option.hydro').remove();
}

map.addLayer(new ol.layer.Geoportail({
  layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
  visible: true
}));
map.addLayer (new ol.layer.Geoportail({
  layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 
  visible: false
}));

// Grid layer for loaded features
var loadLayer = new ol.layer.VectorImage({
  title: 'chargement',
  displayInLayerSwitcher: false,
  minZoom: minZoom - 5,
  source: new ol.source.Vector({
    loader: function (extent, resolution, projection) {
      var f = new ol.Feature(ol.geom.Polygon.fromExtent(extent));
      loadLayer.getSource().addFeature(f);
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({ minZoom: minZoom, maxZoom: minZoom, tileSize:512  }))
  }),
  style: ol.style.Style.defaultStyle({ fillColor: [0,0,0,.5]})
})
map.addLayer(loadLayer);

// WFS source / layer
var vectorSource = new ol.source.Vector();
var zFactor = 2.5;
var vectorLayer = new ol.layer.VectorImage({
  title: 'IGN',
  source: vectorSource,
  declutter: true
})
map.addLayer(vectorLayer);

var style, typeName;
function setWFS(type) {
  typeName = type;
  plink.setUrlParam('layer', type)
  minZoom = /bati|parcelle/.test(type) ? 16 : 15;
  // Load layer
/*
  selectTile.getFeatures().clear();
  var source = new ol.source.Vector({
    loader: function (extent, resolution, projection) {
      var f = new ol.Feature(ol.geom.Polygon.fromExtent(extent));
      source.addFeature(f);
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({ minZoom: minZoom, maxZoom: minZoom, tileSize:512  }))
  });
  loadLayer.setSource(source);
*/
  // Vecror layer
  vectorSource.clear();
  if (popup) popup.hide();
  vectorLayer.set('title', type.split(':')[1].replace(/_/g,' ').capitalize());
  switcher.drawPanel();
  // Change layer
  //vectorLayer.setMinZoom(minZoom);
  style = ol.style.geoportailStyle(type, { sens : true, section: true });
  vectorLayer.setStyle(style);
  sel.getFeatures().clear();
  showInfo();
}

// Select Tile to add Features
var selectTile = new ol.interaction.Select({
  layers: [loadLayer],
  condition: ol.events.condition.click,
  toggleCondition: ol.events.condition.click,
  style: new ol.style.Style({
    fill: new ol.style.Fill({ color: [0,0,0,.01] })
  })
});
map.addInteraction (selectTile);

// Progress bar
var progress = new ol.control.Dialog({
  target: document.body,
  content: 'Chargement',
  max: 1
});
map.addControl(progress);

// Dialogue de chargement d'une commune
var communeDialog = new ol.control.Dialog({
  target: document.body,
  title: 'Charger un commune',
  content: 'avec <a href="https://api.gouv.fr/documentation/api-geo" target="_new">l\'API Geo</a><br/>'
    +'<input class="commune" type="text" placeholder="INSEE" />',
    buttons:{ submit:'ok', cancel:'cancel' }
});
communeDialog.on('button', function(e) {
  if (e.button === 'submit') {
    console.log(e.inputs.commune.value)
    var code = e.inputs.commune.value;
    if (code) {
      $.ajax({
        url: 'https://geo.api.gouv.fr/communes?code='+code+'&fields=nom,code,contour&format=geojson&geometry=contour',
        success: function(data) {
          var f = new ol.format.GeoJSON().readFeatures(data, { featureProjection: map.getView().getProjection() });
          commune.addFeatures(f);
          map.getView().fit(f[0].getGeometry().getExtent())
          if (map.getView().getZoom()>15) map.getView().setZoom(15)
        }
      })
    }
  }
});
communeDialog.on('show', function() {
});
map.addControl(communeDialog);

// Zone circulaire
function circularZone(r) {
  var center = map.getView().getCenter();
  var res = ol.proj.getPointResolution(map.getView().getProjection(), 1, map.getView().getCenter())
  var p = ol.geom.Polygon.fromCircle(new ol.geom.Circle(center, 1000 * r / res));
  commune.addFeature(new ol.Feature(p));
}

// Drag'n'drop commune
var drop = new ol.interaction.DropFile();
drop.on('addfeatures', function(e) {
  e.features.forEach(function(f) {
    if (/polygon/i.test(f.getGeometry().getType())) {
      commune.addFeature(f);
    } else {
      commune.addFeature(f);
    }
  })
  map.getView().fit(commune.getExtent());
});
map.addInteraction(drop);

// Load tiles
var maxlimit = 800;
function loadTiles() {
  var tiles = selectTile.getFeatures().getArray().slice();
  if (tiles.length > maxlimit) {
    showAlert('Trop de tuiles à charger ('+tiles.length+'/'+maxlimit+')...<br/>Diminuer la zone à charger...')
    return;
  }
  // Loading bar
  var loading = 0;
  var draw = function() {
    if (!tiles.length) {
      loading = 0;
      progress.hide();
    } else {
      progress.setContent('Chargement ('+(loading-tiles.length)+'/'+loading+')')
      progress.setProgress((loading-tiles.length), loading);
    }
    showInfo();
  }
  if (tiles.length) {
    loading = tiles.length;
    vectorSource.clear();
    progress.show();
    draw();
    var format = new ol.format.GeoJSON();
    // Load next tile
    function load() {
      draw();
      var f = tiles.pop();
      // No more tile
      if (!f) return;
      // Read tile
      var extent = f.getGeometry().getExtent();
      $.ajax({
        url: 'https://wxs.ign.fr/'+(/eau/.test(typeName) ? 'h1osiyvfm7c4wu976jv6gpum' : 'choisirgeoportail')+'/geoportail/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&' +
          'typename='+typeName+'&' +
          'outputFormat=application/json&srsname=EPSG:3857&' +
          'bbox=' + extent.join(',') + ',EPSG:3857',
        dataType: 'json',
        success: function (response) {
          if (response.error) {
            alert(
              response.error.message + '\n' + response.error.details.join('\n')
            );
          } else {
            var features = format.readFeatures(response, {
              featureProjection: map.getView().getProjection(),
            });
            if (features.length > 0) {
              vectorSource.addFeatures(features);
            }
          }
        },
        complete: function () {
          draw();
          load();
        }
      });
    }
    // Start loading
    load();
  }
}

// Selection tool
var selectCtrl = new ol.control.Select({
  source: vectorSource
});
map.addControl (selectCtrl);
selectCtrl.on('select', function(e) {
  sel.getFeatures().clear();
  for (var i=0, f; f=e.features[i]; i++) {
    sel.getFeatures().push(f);
  }
  showInfo();
});

// Chargement d'une commune
var commune = new ol.source.Vector();
map.addLayer(new ol.layer.Vector({
  title: 'Communes',
  source: commune,
  style: ol.style.Style.defaultStyle()
  /*new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({ color: [0,153,255,0.4] }),
      radius: 5
    }),
    stroke: new ol.style.Stroke({
      color: [255,0,255,.7],
      width: 5,
      lineDash: [0, 15, 15, 15]
    })
  })
  */
}));

// Save Vector layer
function save() {
  $('.dialog').addClass('hidden');
  $('#save').removeClass('hidden');
  $('#save input.select').prop('disabled', !sel.getFeatures().getLength());
  $('#save input.clip').prop('disabled', commune.getFeatures().length < 1);
  $('#save .commune').css('display', commune.getFeatures().length ? '' : 'none');
}

$('#save form').on('submit', function(e) {
  e.preventDefault();
  $('#save').addClass('hidden');
  $('body').addClass('wait');

  setTimeout(function() {
    var ext = $('#save select').val();

    var format;
    switch(ext) {
      case 'kml': {
        format = new ol.format.KML({writeStyles: true})
        break;
      }
      case 'esrijson': {
        format = new ol.format.EsriJSON()
        break;
      }
      default: {
        format = new ol.format.GeoJSON();
      }
    }

    // Clip geometry
    var com = [];
    if ($('#save .clip').prop('checked')) {
      commune.getFeatures().forEach(function(c){
        com.push(jstsParser.read(c.getGeometry()));
      })
    }
    // Features to export
    var featureList = ($('#save .select').prop('checked') ? sel.getFeatures() : vectorSource.getFeatures());
    // remove null props
    var nonull = $('#save .null').prop('checked');
    // filter attributes
    var limit = $('#options .limit').prop('checked');
    // filter geom
    var geom = $('#options .filter').prop('checked') ? Number($('#options input.geom').val())||.01 : false;
    var options = params[$('.options option:selected').text()];
    // export features
    var features = [];
    featureList.forEach(function(f) {
      var g = jstsParser.read(f.getGeometry());
      intersect = (com.length === 0);
      for (var i=0, c; c = com[i]; i++) {
        if (c.intersects(g) || g.intersects(c)) {
          intersect = true;
          break;
        }
      }
      if (intersect) {
        if (typeof(style)==='function') f.setStyle(style(f));
        if (geom || limit || nonull) {
          f = f.clone();
          var prop = f.getProperties();
          for (p in prop) {
            if (nonull && !prop[p]) {
              f.unset(p);
            } else if (limit && options[p]) {
              f.unset(p);
              if (options[p].checked) {
                if (options[p].integer) {
                  if (prop[p]===null) f.set(options[p].name, -1);
                  else f.set(options[p].name, parseFloat(prop[p]) || 0);
                } else {
                  f.set(options[p].name, prop[p]);
                }
              }
            }
          }
          if (geom) f.setGeometry(f.getGeometry().simplify(geom));
        }
        features.push(f)
      }
    })
    // save as
    if (features.length) {
      var data = format.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection()
      });
      var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      var fileName = typeName.replace(/(.*)\:(.*)/,'$2').replace(/^(.*)_/,'');
      saveAs(blob, (fileName||'map')+'.'+(ext || 'geojson'));
    }
    $('body').removeClass('wait');
  },300);
});

// Save commune feature
function saveCommune() {
  $('.dialog').addClass('hidden');
  var format = new ol.format.GeoJSON();

  // commune
  features = commune.getFeatures();
  if (features.length) {
    // Get outer 
    if (features.length === 1) {
      var geom = ol.geom.Polygon.fromExtent(ol.extent.buffer(features[0].getGeometry().getExtent(), 1000));
      geom = geom.getCoordinates();
      features[0].getGeometry().getCoordinates().forEach(function(p) {
        geom.push(p);
      });
      features.push(new ol.Feature(new ol.geom.Polygon(geom)))
    }
    // save as
    var data = format.writeFeatures(features, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.getView().getProjection()
    });
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "commune.geojson");
  }
}

/* Gestion des options */
var params = JSON.parse(localStorage.dataOptions||'{}');
if (!params.route) params.route = {};
if (!params.batiments) params.batiments = {};
if (!params.parcelle) params.parcelle = {};

$('#options .limit').on('change', function() {
  if ($(this).prop('checked')) {
    $('#options ul').removeClass('disabled');
  } else {
    $('#options ul').addClass('disabled');
  }
});

$('#options .valid').click(function() {
  var options = params[$('.options option:selected').text()];
  $('#options ul li').each(function() {
    var p = $(this).data('prop');
    if (p) {
      options[p] = {
        checked: $('input.check', this).prop('checked'),
        integer: $('input.int', this).prop('checked'),
        name: $('input[type="text"]', this).val()
      }
    }
  })
  localStorage.dataOptions = JSON.stringify(params);
  $('#options').addClass('hidden');
});

function showOptions() {
  var options = params[$('.options option:selected').text()];
  if (!options) {
    options = params[$('.options option:selected').text()] = {};
  }
  $('#options').removeClass('hidden');
  var f = vectorSource.getFeatures()[0];
  var label, ul = $('ul', $('#options')).html('');
  if (!f) {
    $('<li>').html('<i>Aune données à charger...</i>').appendTo(ul);
    $('#options .valid').hide();
    return;
  }
  $('#options .valid').show();
  var prop = f.getProperties()
  var li = $('<li>').addClass('small').appendTo(ul);
  $('<a>').text('aucun')
    .click(function() {
      $('input[type="checkbox"]', ul).prop('checked', false);
    })
    .appendTo(li)
  $('<span>').text('/').appendTo(li);
  $('<a>').text('tous')
    .click(function() {
      $('input[type="checkbox"]', ul).prop('checked', true);
    })
    .appendTo(li)
  var options = params[$('.options option:selected').text()];
  li = $('<li>')
    .append($('<label>').text('Attribut'))
    .append($('<span>').text('Nom exporté'))
    .append($('<span>').text('toInt').css('float','right').attr('title','tranformer en nombre...'))
    .appendTo(ul);
  for (p in prop) if (p!=='geometry') {
    var o = options[p];
    li = $('<li>').data('prop', p).appendTo(ul);
    label = $('<label>').attr('title',p).text(p).appendTo(li);
    $('<input type="checkbox">').addClass('check').prop('checked', o ? o.checked : true).prependTo(label);
    $('<input type="text">').val(o ? o.name : p).appendTo(li);
    $('<input type="checkbox">').addClass('int').prop('checked', o ? o.integer : false).appendTo(li);
  }
}

// Selection
var sel = new ol.interaction.Select({
  multi: true,
  layers: [vectorLayer],
  condition: ol.events.condition.click,
  hitTolerance: 3
})
map.addInteraction(sel);
sel.on('select', function(e) {
  var f = e.selected[0];
  if (f) console.log(f.getProperties());
  selectTile.setActive(false);
  setTimeout(function() { selectTile.setActive(true); });
  showInfo();
})

var del = false;
var draw = new ol.interaction.Draw({
  type: 'Polygon',
  condition: ol.events.condition.altKeyOnly,
  freehandCondition: function(e) { 
    del = e.originalEvent.shiftKey;
    return e.originalEvent.metakey || e.originalEvent.ctrlKey;
  },
  style: new ol.style.Style({
    fill: new ol.style.Fill({ color: [255,192,0,.5]})
  })
})
map.addInteraction(draw);
draw.on('drawend', function(e) {
  tilesIntersectGeom(e.feature.getGeometry(), del);
})

// Popup
var popup = new ol.Overlay.PopupFeature({
  popupClass: 'default anim',
  closeBox: true,
  select: sel,
  keepSelection: true,
  canFix: true,
  template: {
    title: function(feature) {
      return vectorLayer.get('title');
    },
    attributes: [
      'nature', 'nom_1_droite', 'code_postal_droit', 'etat_de_l_objet', 'urbain',
      'cpx_classement_administratif', 'cpx_numero',
      'usage_1', 'origine_du_batiment', 'hauteur', 'nombre_d_etages', 'nombre_de_logements', 'date_d_apparition',
      'nom_com', 'code_insee', 'code_arr', 'section', 'numero'
    ]
  }
});
map.addOverlay(popup)

function showDialog(d) {
  $('.dialog').addClass('hidden'); 
  $('#'+d).removeClass('hidden');
}
function showAlert(info) {
  $('#alert').removeClass('hidden');
  $('#alert .content').html(info);
}

function reset() {
  vectorSource.refresh(); 
  commune.clear(); 
  selectTile.getFeatures().clear();
}

function selScreen() {
  if (map.getView().getZoom()<13) {
    showAlert ('Zone trop importante...<br/>Zoomer pour charger des données.')
  }
  var x = $(map.getViewport()).width();
  var y = $(map.getViewport()).height();
  var topleft = map.getCoordinateFromPixel([0,0]);
  var topright = map.getCoordinateFromPixel([x,0]);
  var bottomleft = map.getCoordinateFromPixel([0,y]);
  var bottomright = map.getCoordinateFromPixel([x,y]);
  var extent = new ol.geom.Polygon([[topleft, topright, bottomright, bottomleft, topleft]]);
  tilesIntersectGeom(extent);
}

function tileCommune() {
  $('body').addClass('wait');
  setTimeout(function() {
    commune.getFeatures().forEach(function(c) {
      tilesIntersectGeom(c.getGeometry())
    });
    $('body').removeClass('wait');
  }, 300)
}

function tilesIntersectGeom(geom, del) {
  var g = jstsParser.read(geom);
  loadLayer.getSource().getFeatures().forEach(function(f) {
    if (g.intersects(jstsParser.read(f.getGeometry()))) {
      selectTile.getFeatures().remove(f);
      if (!del) selectTile.getFeatures().push(f);
    }
  });
}

function buffer() {
  var s = $('#buffer').val();
  commune.getFeatures().forEach(function(f) {
    var g = jstsParser.read(f.getGeometry())
    f.setGeometry(jstsParser.write(g.buffer(s)));
  });
  $('.dialog').addClass('hidden'); 
}

function showInfo() {
  var nsel = sel.getFeatures().getLength();
  var nb = vectorSource.getFeatures().length;
  $('.info').text((nsel?nsel+'/':'')+nb+' objet'+(nb>1?'s':''))
}

setWFS(plink.getUrlParam('layer') || 'BDTOPO_V3:troncon_de_route');
$('#typename').val(plink.getUrlParam('layer') || 'BDTOPO_V3:troncon_de_route')
