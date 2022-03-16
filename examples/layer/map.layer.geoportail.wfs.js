
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var minZoom = 15;
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
switcher.on('drawlist', function(li) {
  if (li.layer.get('title')==='Batiment') {
    $('<button>')
      .addClass('r3d')
      .attr('title', '2.5D')
      .click(function() {
        r3D.setActive(!r3D.getActive())
      })
      .appendTo($('.ol-layerswitcher-buttons', li.li));
  } else {
    r3D.setActive(false);
  }
})
var plink = new ol.control.Permalink({ visible: false })
map.addControl(plink);
map.addControl(new ol.control.ScaleLine());
map.addControl(new ol.control.SearchBAN({
  zoomOnSelect: 15
}))

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
  source: new ol.source.Vector(),
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: [0,192,255,.5],
      width: 1
    })
  })
})
map.addLayer(loadLayer);


// WFS source / layer
var vectorSource;
var zFactor = 2.5;
var vectorLayer = new ol.layer.Vector({
  title: 'WFS-IGN',
  maxResolution: 10,  // prevent load on small zoom 
  declutter: true
})
map.addLayer(vectorLayer);
var r3D = new ol.render3D({ 
  height: function(f) {
    return f.get('hauteur')/zFactor;
  }, 
  //ghost: true,
  active: false,
  maxResolution: 1.5, 
  defaultHeight: 3.5 
});
vectorLayer.setRender3D(r3D);

var style;
function setWFS(type) {
  plink.setUrlParam('layer', type)
  loadLayer.getSource().clear();
  if (vectorSource) vectorSource.clear();
  popup.hide();
  switcher.drawPanel();
  minZoom = /bati|parcelle/.test(type) ? 16 : /LANDCOVER/.test(type) ? 13 : 15;
  /* Standard WFS
  vectorSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function(extent) {
      return 'https://wxs.ign.fr/choisirgeoportail/geoportail/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&' +
        'typename='+type+'&' +
        'outputFormat=application/json&srsname=EPSG:3857&' +
        'bbox=' + extent.join(',') + ',EPSG:3857';
    },
    //strategy: ol.loadingstrategy.bbox
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({ minZoom: minZoom, maxZoom: minZoom, tileSize:512  }))
  });
  */
  // Loading bar
  var progressbar = document.getElementById('progressbar');
  var progress = function(e) {
    if (e.loading === e.loaded) {
      loading = loaded = 0;
      ol.ext.element.setStyle(progressbar, { width: 0 });// layer.layerswitcher_progress.width(0);
      $('#loading').hide();
    } else {
      ol.ext.element.setStyle(progressbar, { width: (e.loaded / e.loading * 100).toFixed(1) + '%' });// layer.layerswitcher_progress.css('width', (loaded / loading * 100).toFixed(1) + '%');
      $('#loading').show();
      $('#loading span').text(e.loaded+'/'+e.loading)
    }
  }
  var key = type.split('|')[0];
  type = type.split('|')[1];
  var title = (type.split(':')[1] || type).replace(/(_|\.)/g,' ').capitalize();
  vectorLayer.set('title', title);
  vectorSource = new ol.source.TileWFS({
    url: 'https://wxs.ign.fr/'+key+'/geoportail/wfs',
    typeName: type,
    tileZoom: minZoom,
    pagination: true
  });
  vectorSource.on(['tileloadstart','tileloadend','tileloaderror'], progress)
  vectorLayer.setSource(vectorSource);
  selectCtrl.setSources(vectorSource);
  vectorLayer.setMinZoom(minZoom);
  style = ol.style.geoportailStyle(type, { sens : true, section: true, opacity: .4 });
  vectorLayer.setStyle(style);
  testZoom();
}

// Selection tool
var selectCtrl = new ol.control.Select();
map.addControl (selectCtrl);
selectCtrl.on('select', function(e) {
  sel.getFeatures().clear();
  for (var i=0, f; f=e.features[i]; i++) {
    sel.getFeatures().push(f);
  }
});

// Show zoom info
map.on('moveend', testZoom)
function testZoom() {
  $('#curZoom').text(map.getView().getZoom().toFixed(1)+' / '+minZoom);
  if (map.getView().getZoom() <= minZoom) $('#zoomTo').show();
  else $('#zoomTo').hide();
}

// Chargement d'une commune
var commune = new ol.source.Vector();
map.addLayer(new ol.layer.Vector({
  title: 'Communes',
  source: commune,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: [255,0,255,.7],
      width: 5,
      lineDash: [0, 15, 15, 15]
    })
  })
}));
$('#commune form').on('submit', function(e) {
  e.preventDefault();
  $('#commune').addClass('hidden');
  var code = $('#commune input').val();
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
})

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
      'usage_1', 'origine_du_batiment', 'hauteur', 'nombre_d_etages', 'nombre_de_logements',
      'nom_com', 'code_insee', 'code_arr', 'section', 'numero',
      'id', 'area_ha', 'code_06', 'code_12'
    ]
  }
});
map.addOverlay(popup)

setWFS(plink.getUrlParam('layer') || 'BDTOPO_V3:troncon_de_route');
$('#typename').val(plink.getUrlParam('layer') || 'BDTOPO_V3:troncon_de_route')

// Save Vector layer
function save() {
  $('.dialog').addClass('hidden');
  $('#save').removeClass('hidden');
  $('#save input.select').prop('disabled', !sel.getFeatures().getLength());
  $('#save input.clip').prop('disabled', commune.getFeatures().length !== 1);
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
      case 'kml':{
        format = new ol.format.KML({writeStyles: true})
        break;
      }
      default: {
        format = new ol.format.GeoJSON();
      }
    }

    // Clip geometry
    var com;
    if ($('#save .clip').prop('checked')) com = jstsParser.read(commune.getFeatures()[0].getGeometry());
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
      if (!com || com.intersects(jstsParser.read(f.getGeometry()))) {
        f.setStyle(style(f));
        if (geom || limit || nonull) {
          f = f.clone();
          var prop = f.getProperties();
          for (p in prop) {
            if (nonull && !prop[p]) {
              f.unset(p);
            } else if (limit && options[p]) {
              f.unset(p);
              if (options[p].checked) {
                f.set(options[p].name, prop[p]);
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
      saveAs(blob, 'map.'+(ext || 'geojson'));
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
if (!params.batiment) params.batiments = {};
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
        checked: $('input[type="checkbox"]', this).prop('checked'),
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
      $('input[type="checkbox"]').prop('checked', false);
    })
    .appendTo(li)
  $('<span>').text('/').appendTo(li);
  $('<a>').text('tous')
    .click(function() {
      $('input[type="checkbox"]', ul).prop('checked', true);
    })
    .appendTo(li)
  var options = params[$('.options option:selected').text()];
  for (p in prop) if (p!=='geometry') {
    var o = options[p];
    li = $('<li>').data('prop', p).appendTo(ul);
    label = $('<label>').attr('title',p).text(p).appendTo(li);
    $('<input type="checkbox">').prop('checked', o ? o.checked : true).prependTo(label);
    $('<input type="text">').val(o ? o.name : p).appendTo(li);
  }
}