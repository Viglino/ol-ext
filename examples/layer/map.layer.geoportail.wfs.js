
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var minZoom = 15;
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
map.addControl(new ol.control.Permalink({ visible: false }));
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

var loadLayer = new ol.layer.Vector({
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

var vectorSource;
var vectorLayer = new ol.layer.Vector({
  title: 'WFS-IGN',
  maxResolution: 10,  // prevent load on small zoom 
  declutter: true
})
map.addLayer(vectorLayer);

var style;
function setWFS() {
  loadLayer.getSource().clear();
  if (vectorSource) vectorSource.clear();
  popup.hide();
  var type = $('#typename').val();
  vectorLayer.set('title', type.split(':')[1].replace(/_/g,' ').capitalize());
  switcher.drawPanel();
  minZoom = /bati/.test(type) ? 16 : 15;
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
  var loading = 0, loaded = 0;
  var progressbar = document.getElementById('progressbar');
  var draw = function() {
    if (loading === loaded) {
      loading = loaded = 0;
      ol.ext.element.setStyle(progressbar, { width: 0 });// layer.layerswitcher_progress.width(0);
      $('#loading').hide();
    } else {
      ol.ext.element.setStyle(progressbar, { width: (loaded / loading * 100).toFixed(1) + '%' });// layer.layerswitcher_progress.css('width', (loaded / loading * 100).toFixed(1) + '%');
      $('#loading').show();
      $('#loading span').text(loaded+'/'+loading)
    }
  }
  var format = new ol.format.GeoJSON();
  var source = vectorSource = new ol.source.Vector({
    loader: function (extent, resolution, projection) {
      loading++;
      draw();
      $.ajax({
        url: 'https://wxs.ign.fr/choisirgeoportail/geoportail/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&' +
          'typename='+type+'&' +
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
              featureProjection: projection,
            });
            if (features.length > 0) {
              source.addFeatures(features);
            }
          }
        },
        complete: function () {
          loaded++;
          draw();
          var f = new ol.Feature(ol.geom.Polygon.fromExtent(extent));
          loadLayer.getSource().addFeature(f);
        }
      });
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({ minZoom: minZoom, maxZoom: minZoom, tileSize:512  }))
  });
  vectorLayer.setSource(vectorSource);
  vectorLayer.setMinZoom(minZoom);
  style = ol.style.geoportailStyle(type, { sens : true, section: true });
  vectorLayer.setStyle(style);
  testZoom();
}

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
  canFix: true,
  template: {
    title: function(feature) {
      return vectorLayer.get('title');
    },
    attributes: [
      'nature', 'nom_1_droite', 'code_postal_droit', 'etat_de_l_objet', 'urbain',
      'cpx_classement_administratif', 'cpx_numero',
      'usage_1', 'origine_du_batiment',
      'nom_com', 'code_insee', 'code_arr', 'section', 'numero'
    ]
  }
});
map.addOverlay(popup)

setWFS();

// Save Vector layer
function save(what) {
  var format;
  switch(what) {
    case 'kml':{
      format = new ol.format.KML({writeStyles: true})
      break;
    }
    default: {
      format = new ol.format.GeoJSON();
    }
  }
  var features = vectorSource.getFeatures();
  features.forEach(function(f) {
    f.setStyle(style(f));
  })
  if (features.length) {
    var data = format.writeFeatures(features, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.getView().getProjection()
    });
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, 'map.'+(what || 'geojson'));
  }
  // commune
  features = commune.getFeatures();
  if (features.length) {
    if (features.length === 1) {
      var geom = ol.geom.Polygon.fromExtent(ol.extent.buffer(features[0].getGeometry().getExtent(), 1000));
      geom = geom.getCoordinates();
      features[0].getGeometry().getCoordinates().forEach(function(p) {
        geom.push(p);
      });
      features.push(new ol.Feature(new ol.geom.Polygon(geom)))
    }
    var data = format.writeFeatures(features, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.getView().getProjection()
    });
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "commune.geojson");
  }
}
