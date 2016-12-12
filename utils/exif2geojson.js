/** Convert a list of image file or a list of image into geojson
* @param {Array<Image|File>} img the array to process
* @param {} options
*	- camera {boolean} true to get camera info
*	- date {boolean} true to get photo date
*	- image {boolean} true to get image info
*	- loading {function} a callback function that take the number of image to process
*	- onLoad {function} callback function that takes a geojson when loaded
* @require Exif-JS [https://github.com/exif-js/exif-js] 
*/
var exif2geojson;

(function(){

// Get fractionnal number
function getNumber(n) { return n.numerator / n.denominator; }

// Convert to DMS
function getDMS(l)
{	if (l) return getNumber(l[0]) + getNumber(l[1]) /60 + getNumber(l[2]) /3600;
	else return null;
}

//
exif2geojson = function (img, options)
{	options = options || {};
	if (typeof(options.loading) != "function") options.loading = function(){};
	if (typeof(options.onLoad) != "function") options.onLoad = function(json){ console.log(json); };
	//
	var json = 
	{	"type": "FeatureCollection",
		"features": []
	};

	var nb = img.length;
	for (var i=0, f; f=img[i]; i++)
	{	EXIF.getData(f, function() 
		{	// console.log(this);
			if (this.exifdata.GPSLongitudeRef) 
			{	// json feature
				fjs = 
				{	"type": "Feature",
					"properties": {},
					"geometry": 
					{	"type": "Point",
						"coordinates": []
					}
				};
				json.features.push (fjs)
				fjs.geometry.coordinates = 
				[	(this.exifdata.GPSLongitudeRef=='E'? 1: -1) * getDMS(this.exifdata.GPSLongitude),
					(this.exifdata.GPSLatitudeRef=='N'? 1: -1) * getDMS(this.exifdata.GPSLatitude)
				];
				if (this.exifdata.GPSAltitude) fjs.geometry.coordinates.push (getNumber(this.exifdata.GPSAltitude));
				fjs.properties.url = this.src || this.name;
				if (this.exifdata.ImageDescription) fjs.properties.description = this.exifdata.ImageDescription;
				if (options.date && this.exifdata.DateTime) fjs.properties.date = this.exifdata.DateTime;
				// Camera info
				if (options.camera)
				{	if (this.exifdata.Make) fjs.properties.make = this.exifdata.Make;
					if (this.exifdata.Model) fjs.properties.model = this.exifdata.Model.replace(new RegExp(String.fromCharCode(0),'g'),"");
				}
				// Image info
				if (options.image)
				{	fjs.properties.size = this.size;
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