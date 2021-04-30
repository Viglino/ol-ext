//TODO: rewrite exif2geojson module and export
/** Convert a list of image file or a list of image into geojson 
* reading location in the EXIF tags
* @constructor
* @param {Array<Image|File>} img the array to process
* @param {} options
*	  @param {boolean} camera true to get camera info
*	  @param {boolean} options.date true to get photo date
*	  @param {boolean} options.image true to get image info
*	  @param {function} options.loading a callback function that take the number of image to process
*	  @param {function} options.onLoad callback function that takes a geojson when loaded
* @require Exif-JS [https://github.com/exif-js/exif-js] 
*/
/* global EXIF */
var exif2geojson;
(function(){
// Get fractionnal number
function getNumber(n) { return n.numerator / n.denominator; }
// Convert to DMS
function getDMS(l) {
  if (l) return getNumber(l[0]) + getNumber(l[1]) /60 + getNumber(l[2]) /3600;
  else return null;
}
// Constructor
exif2geojson = function (img, options) {
  options = options || {};
  if (typeof(options.loading) !== "function") options.loading = function(){};
  if (typeof(options.onLoad) !== "function") options.onLoad = function(json){ console.log(json); };
  //
  var json = {
    "type": "FeatureCollection",
    "features": []
  };
  var nb = img.length;
  for (var i=0, f; f=img[i]; i++) {
    EXIF.getData(f, function() {
      // console.log(this);
      if (this.exifdata.GPSLongitudeRef) {
        // json feature
        var fjs = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": []
          }
        };
        json.features.push (fjs)
        fjs.geometry.coordinates = [
          (this.exifdata.GPSLongitudeRef=='E'? 1: -1) * getDMS(this.exifdata.GPSLongitude),
          (this.exifdata.GPSLatitudeRef=='N'? 1: -1) * getDMS(this.exifdata.GPSLatitude)
        ];
        if (this.exifdata.GPSAltitude) fjs.geometry.coordinates.push (getNumber(this.exifdata.GPSAltitude));
        fjs.properties.url = this.src || this.name;
        if (this.exifdata.ImageDescription) fjs.properties.description = this.exifdata.ImageDescription;
        if (options.date && this.exifdata.DateTime) fjs.properties.date = this.exifdata.DateTime;
        // Camera info
        if (options.camera) {
          if (this.exifdata.Make) fjs.properties.make = this.exifdata.Make;
          if (this.exifdata.Model) fjs.properties.model = this.exifdata.Model.replace(new RegExp(String.fromCharCode(0),'g'),"");
        }
        // Image info
        if (options.image) {
          fjs.properties.size = this.size;
          fjs.properties.type = this.type;
          if (this.exifdata.ImageHeight) fjs.properties.height = this.exifdata.ImageHeight;
          if (this.exifdata.ImageWidth) fjs.properties.width = this.exifdata.ImageWidth;
        }
      }
      nb--;
      options.loading(nb)
      if (!nb) options.onLoad(json);
    });
  }
}
})();
