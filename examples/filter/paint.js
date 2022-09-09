var photoLayer = new ol.layer.Geoportail({ layer: 'ORTHOIMAGERY.ORTHOPHOTOS', visible: false, baseLayer:true });
var layers = [ 
  new ol.layer.Geoportail({ 
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 
    visible: false, 
    baseLayer:true 
  }),
  photoLayer
];

// The map
var map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: center ? center[2] : 8,
    center: center || [247044, 6549736]
  }),
  layers: layers
});

// Handle hover
$('body').addClass('out');
$("#map").on('mouseenter', function() {
  $('body').removeClass('out');
})
$("#map").on('mouseleave', function() {
  $('body').addClass('out');
})

// Permalink
var plink = new ol.control.Permalink({ visible: false });
map.addControl(plink);

$('.frame h2').click(function() {
  var name = prompt('Title', $(this).text());
  plink.setUrlParam('title', name || '');
  $(this).text(name || 'ol-ext');
});

// Info
map.addControl(new ol.control.Button({
  html: '?',
  className: 'help',
  handleClick: function() {
    $('.options').toggleClass('visible');
  }
}));

// Bookmarks
var bmark = new ol.control.GeoBookmark({	
  namespace: 'paint',
  marks: {
    "Baie de l'Authie":{"pos":[178343,6510825],"zoom":14.4,"permanent":true},
    "Honfleur":{"pos":[25944,6346465],"zoom":19.5,"permanent":true},
    "jardins de Villandry":{"pos":[57211,5997720],"zoom":19.1,"permanent":true},
    "Montagne Sainte-Victoire":{"pos":[625817,5392910],"zoom":13.8,"permanent":true},
    "Collioure":{"pos":[343599,5240060],"zoom":16.8,"permanent":true},
    "Cathédrale de Rouen":{"pos":[121894,6349901],"zoom":19.1,"permanent":true,"rot":3.14},
    "Port Grimaud":{"pos":[732138,5353219],"zoom":19.3,"permanent":true},
    "La Réunion":{"pos":[6182310,-2407847],"zoom":10.9,"permanent":true},
    "Neuf-Brisach":{"pos":[838014,6109780],"zoom":16.5,"permanent":true},
    "Le Crotoy":{"pos":[179282,6484201],"zoom":12.9,"permanent":true},
    "Bazoches-les-Gallerandes":{"pos":[229523,6130842],"zoom":13.1,"permanent":true},
    "Salin de Giraud":{"pos":[525309,5371750],"zoom":13,"permanent":true},
  }
});
map.addControl(bmark);
bmark.on(['add','select'], function(e) {
  $('.frame h2').text(e.name);
  plink.setUrlParam('title', e.name);
});

// Print control
var print = new ol.control.Print();
map.addControl(print);
print.on('print', function(e) {
  e.canvas.toBlob(function(blob) {
    saveAs(blob, 'map.'+e.imageType.replace('image/',''));
  }, e.imageType);
})

// Search control
var search = new ol.control.SearchGeoportail();
// var search = new ol.control.SearchBAN();
map.addControl(search);
search.on('select', function(e) {
  map.getView().setCenter(e.coordinate);
  if (map.getView().getZoom()<14) map.getView().setZoom(14);
})

// Switcher
map.addControl(new ol.control.LayerSwitcherImage());

// Geooc
map.addControl(new ol.control.GeolocationButton());
