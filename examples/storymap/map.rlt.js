// Demo
// https://seikichi.github.io/tiff.js/

//
const format = new ol.format.GeoJSON();
const defaultStyle = ol.style.Style.createDefaultStyle();
defaultStyle[0].getFill().setColor('rgba(0,0,255,0)');

// Layer to show cliches extents
const layer = new ol.layer.Vector({
  title: 'clichés',
  source: new ol.source.Vector(),
  style: defaultStyle
}); 

// The map
var map = new ol.Map ({
  target: 'map',
  view: new ol.View({
    zoom: 16,
    center: [270092, 6248487]
  }),
  layers: [ 
    new ol.layer.Geoportail({ layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2' }),
    layer,
    new ol.layer.Geoportail({ layer: 'TRANSPORTNETWORKS.ROADS', opacity: 0.7 }),
  ]
});
map.addControl(new ol.control.Permalink({ visible: false, geohash: true }));
// Set the search control
map.addControl (new ol.control.SearchGeoportail({
  zoomOnSelect: 12
}));

// Layer switcher control
var switcher = new ol.control.LayerShop({
  counter: true,
  minibar: true,
  extent: true,
  oninfo: (layer) => {
    const canvas = layer.getSource().getGeoImage()
    canvas.toBlob(function(blob) {
      saveAs(blob, layer.get('id') + '.jpg');
    }, 'image/jpeg', 0.8);
    /*
    const jpg = canvas.toDataURL("image/jpeg", .8);
    saveAs(jpg, layer.get('id') + '.jpg');
    */
    //      document.getElementById('download').download = prop.image_identifier + '.jpg';
  },
  collapsed: false,
});
map.addControl(switcher);
  
const dlg = new ol.control.Dialog();
map.addControl(dlg);

// Actions
document.getElementById('rlt').addEventListener('click', function() {
  if (currentCoord && !running) {
    load(currentCoord);
  }
});

const overlay = new ol.layer.Vector({
  title: 'overlay',
  source: new ol.source.Vector(),
  style: [ 
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({ color: 'red' }), 
      })
    }),
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: 'red' }), 
        stroke: new ol.style.Stroke({ color: 'white', width: 3 })
      })
    }),
  ]
}); 
overlay.setMap(map)

let currentCoord = null;
let running = false;
map.on('click', (e => {
  if (running) {
    return;
  }
  overlay.getSource().clear();
  currentCoord = e.coordinate;
  const feature = new ol.Feature(new ol.geom.Point(currentCoord));
  overlay.getSource().addFeature(feature);
}))

/** Load PVA info 
 * @param {string} type 'image' or 'dataset'
 * @param {ol.Coordinate} coord coordinate to search
 * @return {Promise<Array.<ol.Feature>>|Promise<Object>} cliches or missions
 */
async function loadPVA(type, coord) {
  const url = 'https://data.geopf.fr/wfs?service=WFS&request=GetFeature&version=2.0.0&typename=pva:'
    + type + '&outputFormat=application/json&srsname=EPSG:3857&bbox='
    + coord.join(',')+','+coord.join(',')
  const resp = await fetch(url)
  const json = await resp.json()
  switch (type) {
    case 'image': {
      return format.readFeatures(json)
    }
    case 'dataset': {
      const tabMissions = {};
      json.features.forEach(p => {
        tabMissions[p.properties.dataset_identifier] = p.properties;
      })
      return tabMissions;
    }
  }
}

/** Load layers at point
 * @param {ol.MapBrowserEvent|ol.Coordinate} e
 */
async function load(e) {
  const layers = map.getLayers().getArray();
  // Remove previous images
  for (let i=layers.length-1; i>=0; i--) {
    if (layers[i] instanceof ol.layer.Group) {
      map.removeLayer(layers[i]);
    }
  }
  let cancelOperation = false;
  overlay.getSource().clear();
  running = true;

  dlg.show({
    content: 'Chargement...', 
    progress: 0, 
    max: 10, 
    closeBox: false, 
    buttons: { cancel: 'annuler' },
    onButton: function(name) {
      if (name === 'cancel') {
        dlg.show('Annulation en cours...');
        cancelOperation = true;
      }
    }
  });
  
  // Find feature under the click
  if (!e) {
    e = JSON.parse(localStorage.rlt_position);
  }
  const coord = e.coordinate || e;
  // Save last position (debug)
  localStorage.rlt_position = JSON.stringify(coord);
  console.log(coord)
  // Load cliches
  const features = await loadPVA('image', coord)
  // LoadMissions
  const pva = await loadPVA('dataset', coord);

  // One cliche per mission
  const missions = {};
  features.forEach(cliche => {
    // Out
    if (!cliche.getGeometry().intersectsCoordinate(coord)) {
      return;
    }
    // most centered cliche
    if (!missions[cliche.get('dataset_identifier')]) {
      missions[cliche.get('dataset_identifier')] = cliche;
    } else {
      /*
      const center = missions[cliche.get('dataset_identifier')].getGeometry().getInteriorPoint().getCoordinates();
      const ccliche = cliche.getGeometry().getInteriorPoint().getCoordinates();
      */
      // Far from the photo border
      const center = missions[cliche.get('dataset_identifier')].getGeometry().getClosestPoint(coord);
      const ccliche = cliche.getGeometry().getClosestPoint(coord);
      if (ol.coordinate.dist2d(center, coord) < ol.coordinate.dist2d(ccliche, coord)) {
        missions[cliche.get('dataset_identifier')] = cliche;
      }
    }
  });
  // Get Features array + refine mission
  let cliches = [];
  Object.keys(missions).forEach(m => {
    if (pva[m] && !pva[m].oblique && !/^IR/.test(pva[m].couleur)) {
      missions[m].set('id_mission', m);
      missions[m].set('couleur', pva[m].couleur);
      missions[m].set('oblique', pva[m].oblique);
      missions[m].set('resolution', pva[m].resolution);
      missions[m].set('support', pva[m].support);
      missions[m].set('date', parseInt(missions[m].get('date_cliche')));
      cliches.push(missions[m]);
    }
    // console.log(missions[m].get('date_cliche'))
  })
  cliches.sort((a,b) => {
    return a.get('date') - b.get('date');
  });
  // Add bbox
  layer.getSource().clear();
  /* debug * /
  cliches = [cliches[0]];
  layer.getSource().addFeature(new ol.Feature(new ol.geom.Point(coord)))
  layer.getSource().addFeature(new ol.Feature(new ol.geom.Point(cliches[0].getGeometry().getFirstCoordinate())))
  /**/
  layer.getSource().addFeatures(cliches)
  // cliches = [cliches[0]];
  /** /
  var data = format.writeFeatures(cliches, {
    dataProjection: 'EPSG:4326',
    featureProjection: map.getView().getProjection()
  });
  var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "cliches.geojson");
  /**/
  // Get Image layer
  // for (let i=0; i<cliches.length; i++) {
  const nb = cliches.length;
  // console.log(i, cliches[i].get('orientation'))
  let current = cliches.pop()
  while (current) {
    dlg.setProgress(nb-cliches.length, nb, 'Chargement image '+(nb-cliches.length)+'/'+nb+'...')
    try {
      const layer = window.image = await getLayerCliche(current);
      const lextent = new ol.layer.Vector({
        title: 'extent',
        source: new ol.source.Vector({
          features: [current, new ol.Feature(new ol.geom.Point(current.getGeometry().getFirstCoordinate()))]
        }),
        style: defaultStyle
      });
      const group = new ol.layer.Group({
        layers: [layer, lextent],
        title: current.get('date') + ' - ' + current.get('id_mission') ,
        description: 'Cliché '+current.get('image_identifier')+' ('+current.get('couleur')+', '+(current.get('resolution')/100)+'m/pixel)'
      });
      // map.getLayers().insertAt(1,group);
      // map.addLayer(group);
      map.getLayers().insertAt(map.getLayers().getLength() -1, group);
      // cancel or go on
      if (cancelOperation) {
        current = null;
      } else {
        current = cliches.pop();
      }
    } catch (e) {
      dlg.setContentMessage('Chargement impossible du cliché '+(nb-cliches.length))
      if (cancelOperation) {
        current = null;
      } else {
        current = cliches.pop();
      }
    }
  }
  dlg.hide();
  running = false;
}

/** Get GeoImage layer from cliche feature
 * @param {ol.Feature} cliche 
 * @return {Promise<ol.layer.GeoImage>} layer
 */
function getLayerCliche(cliche) {
  return new Promise(function(resolve, reject){
    const prop = cliche.getProperties()
    const geom = cliche.getGeometry()
    const dx = ol.coordinate.dist2d(geom.getCoordinates()[0][0], geom.getCoordinates()[0][2]);
    const extent = geom.getExtent();
    const center = [(extent[0]+extent[2])/2, (extent[1]+extent[3])/2];
    const rotation = -Math.atan2(
      geom.getCoordinates()[0][2][1]-geom.getCoordinates()[0][0][1],
      geom.getCoordinates()[0][2][0]-geom.getCoordinates()[0][0][0]
    );
    // console.log(prop);
    // chunk / telechargement
    const url = 'https://data.geopf.fr/chunk/telechargement/download/pva/' + prop.id_mission + '/' + prop.image_identifier + '.tif'
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', url);
    document.body.className = 'loading';
    xhr.onload = function (e) {
      // Canvas from tiff
      let canvas;
      try {
        var tiff = new Tiff({buffer: xhr.response});
        canvas = tiff.toCanvas();
      } catch(e) {
        reject();
      }
      // Too big
      if (canvas.width > 6000 || canvas.height > 6000) {
        const cv = document.createElement('canvas');
        const scale = 6000 / Math.max(canvas.width, canvas.height);
        cv.width = canvas.width * scale;
        cv.height = canvas.height * scale;
        const ctx = cv.getContext('2d');
        ctx.drawImage(canvas, 0, 0, cv.width, cv.height);
        canvas = cv;
      }
      // Mimic naturalWidth / naturalHeight
      canvas.naturalWidth = canvas.width 
      canvas.naturalHeight = canvas.height
      // console.log(rotation * 180 / Math.PI, prop.orientation);
      const layer = new ol.layer.GeoImage({
        title: prop.orientation + ' ' + prop.image_identifier,
        source:  new ol.source.GeoImage({
          image: canvas,
          imageCenter: center,
          imageScale: dx / canvas.width,
          imageRotate: rotation // prop.orientation * Math.PI / 180,
        })
      })
      layer.set('id', prop.image_identifier);
      resolve(layer);
    };
    xhr.send();
    // console.log(prop);
  })
}
