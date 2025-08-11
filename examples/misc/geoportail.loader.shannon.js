var current = []
var shannon = false

function doShannon(value) {
  shannon = value;
}

var shanonAttr = document.getElementById('shannonAttr');
// Get the value to use for the Shannon index
function getShannonVal(feature) {
  if (shanonAttr.value === 'usage'){
    return feature.get('usage_1')
  } else {
    return Math.round(feature.get('hauteur') /4);
  }
}

/** Calculate shannon index using a buffer of 200m
 */
function calculateShannon() {
  // Not  active
  if (!shannon) return
  // Features in the vector source
  var sourceFeatures = vectorSource.getFeatures();
  if (sourceFeatures.length === 0) return;
  if (!sourceFeatures[0].get('usage_1')) {
    return;
  }
  console.log('Calculating Shannon index for', sourceFeatures.length, 'features');
  // Get JSTS geometry 
  sourceFeatures.forEach(function(feature) {
    feature._jstsGeometry = jstsParser.read(feature.getGeometry());
  })
  current = sourceFeatures.slice(0);
  progress.show('Calcul de l\'indice de Shannon');
  progress.setProgress(0, current.length);
  setTimeout(_calcShannon, 500);
}

// Do calculate shannon index
function _calcShannon() {
  // console.log(current.length, 'features to process');
  for (var i = 0; i < 100; i++) {
    // Calculate shannon index for each feature
    feature = current.pop();
    if (!feature) {
      // No more feature
      console.log('Shannon index calculation done');
      progress.hide();
      return
    }
    var res = ol.proj.getPointResolution(map.getView().getProjection(), 1, feature.getGeometry().getFirstCoordinate());
    // 200m buffer
    var buffer = feature._jstsGeometry.buffer(200/res);
    // Extent
    var extent = ol.extent.buffer(feature.getGeometry().getExtent(), 200/res);
    // get features in buffer
    var features = vectorSource.getFeaturesInExtent(extent);
    var shAttributes = {}
    shAttributes[getShannonVal(feature)] = 1;
    var count = 1;
    features.forEach(function(f) {
      if (f === feature) return;
      var g = f._jstsGeometry;
      if (g.intersects(buffer)) { // buffer.intersects(g) || 
        var attr = getShannonVal(f);
        if (!shAttributes[attr]) shAttributes[attr] = 0;
        shAttributes[attr]++;
        count++
      }
    });

    // Shannon index
    var shannonValue = 0;
    Object.keys(shAttributes).forEach(function(key) {
      var pi = shAttributes[key] / count;
      // shannonValue -= pi * Math.log2(pi);
      shannonValue -= pi * Math.log(pi);
    })
    // console.log(shAttributes, shannonValue)
    feature.set('shannon', Math.round(shannonValue*100)/100);
  }
  // Update progress
  progress.setProgress(progress.get('max') - current.length, null, current.length + ' objets à traiter');
  progress.show();
  // Continue processing
  setTimeout(_calcShannon, 100)
}