/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	@classdesc
	ol.source.WikiCommons is a source that load Wikimedia Commons content in a vector layer.
	
	@require jQuery
	
	Inherits from:
	<ol.source.Vector>
*/

/**
* @constructor ol.source.WikiCommons
* @extends {ol.source.Vector}
* @param {olx.source.WikiCommons=} options
* @todo 
*/
ol.source.WikiCommons = function(opt_options)
{	var options = opt_options || {};
	var self = this; 

	options.loader = this._loaderFn;
	
	/** Url for DBPedia SPARQL */
	this._url = options.url || "http://fr.dbpedia.org/sparql";

	/** Max resolution to load features  */
	this._maxResolution = options.maxResolution || 100;
	
	/** Result language */
	this._lang = options.lang || "fr";

	/** Query limit */
	this._limit = options.limit || 100;
	
	/** Default attribution */
	if (!options.attributions) options.attributions = [ new ol.Attribution({ html:"&copy; <a href='https://commons.wikimedia.org/'>Wikimedia Commons</a>" }) ];

	// Bbox strategy : reload at each move
    if (!options.strategy) options.strategy = ol.loadingstrategy.bbox;

	ol.source.Vector.call (this, options);	
};
ol.inherits (ol.source.WikiCommons, ol.source.Vector);


/** Decode wiki attributes and choose to add feature to the layer
* @param {feature} the feature
* @param {attributes} wiki attributes
* @return {boolean} true: add the feature to the layer
* @API stable
*/
ol.source.WikiCommons.prototype.readFeature = function (feature, attributes)
{	feature.set("descriptionurl", attributes.descriptionurl);
	feature.set("url", attributes.url);
	feature.set("title", attributes.title.replace(/^file:|.jpg$/ig,""));
	feature.set("thumbnail", attributes.url.replace(/^(.+wikipedia\/commons)\/([a-zA-Z0-9]\/[a-zA-Z0-9]{2})\/(.+)$/,"$1/thumb/$2/$3/200px-$3"));
	feature.set("user", attributes.user);
	if (attributes.extmetadata && attributes.extmetadata.LicenseShortName) feature.set("copy", attributes.extmetadata.LicenseShortName.value);
	return true;
};


/** Loader function used to load features.
* @private
*/
ol.source.WikiCommons.prototype._loaderFn = function(extent, resolution, projection) 
{	if (resolution > this._maxResolution) return;
	var self = this;
	var bbox = ol.proj.transformExtent(extent, projection, "EPSG:4326");
	// Commons API: for more info @see https://commons.wikimedia.org/wiki/Commons:API/MediaWiki
	var url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=coordinates|imageinfo"
		+ "&generator=geosearch&iiprop=timestamp|user|url|extmetadata|metadata|size&iiextmetadatafilter=LicenseShortName"
		+ "&ggsbbox=" + bbox[3] + "|" + bbox[0] + "|" + bbox[1] + "|" + bbox[2]
		+ "&ggslimit="+this._limit
		+ "&iilimit="+(this._limit-1)
		+ "&ggsnamespace=6";

	// Ajax request to get the tile
	$.ajax(
	{	url: url,
		dataType: 'jsonp', 
		success: function(data) 
		{	//console.log(data);
			var features = [];
			var att, pt, feature, lastfeature = null;
			if (!data.query || !data.query.pages) return;
			for ( var i in data.query.pages)
			{	att = data.query.pages[i];
				if (att.coordinates && att.coordinates.length ) 
				{	pt = [att.coordinates[0].lon, att.coordinates[0].lat];
				}
				else
				{	var meta = att.imageinfo[0].metadata;
					if (!meta)
					{	//console.log(att);
						continue;
					}
					pt = [];
					var found=0;
					for (var k=0; k<meta.length; k++)
					{	if (meta[k].name=="GPSLongitude") 
						{	pt[0] = meta[k].value;
							found++;
						}
						if (meta[k].name=="GPSLatitude") 
						{	pt[1] = meta[k].value;
							found++;
						}
					}
					if (found!=2) 
					{	//console.log(att);
						continue;
					}
				}
				feature = new ol.Feature(new ol.geom.Point(ol.proj.transform (pt,"EPSG:4326",projection)));
				att.imageinfo[0].title = att.title;
				if (self.readFeature(feature, att.imageinfo[0]))
				{	features.push(feature);
				}
			}
			self.addFeatures(features);
    }});
};
