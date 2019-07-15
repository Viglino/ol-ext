/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	@classdesc
	ol_source_Mapillary is a source that load Mapillary's geotagged photos in a vector layer.
	
	Inherits from:
	<ol.source.Vector>
*/

import ol_ext_inherits from '../util/ext'
import {bbox as ol_loadingstrategy_bbox} from 'ol/loadingstrategy'
import ol_source_Vector from 'ol/source/Vector'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj'
import ol_ext_Ajax from '../util/Ajax';

/**
* @constructor ol_source_Mapillary
* @extends {ol_source_Vector}
* @param {olx.source.Mapillary=} options
*/
var ol_source_Mapillary = function(opt_options)
{	var options = opt_options || {};

	options.loader = this._loaderFn;
	
	/** Max resolution to load features  */
	this._maxResolution = options.maxResolution || 100;
	
	/** Query limit */
	this._limit = options.limit || 100;
	
	/** Default attribution */
	if (!options.attributions) options.attributions = [ "&copy; <a href='https://www.mapillary.com/'>Mapillary</a>" ];

	// Bbox strategy : reload at each move
    if (!options.strategy) options.strategy = ol_loadingstrategy_bbox;

	// Init parent
	ol_source_Vector.call (this, options);

	// Client ID
	// this.set("clientId", options.clientId);
};
ol_ext_inherits(ol_source_Mapillary, ol_source_Vector);


/** Decode wiki attributes and choose to add feature to the layer
* @param {feature} the feature
* @param {attributes} wiki attributes
* @return {boolean} true: add the feature to the layer
* @API stable
*/
ol_source_Mapillary.prototype.readFeature = function (/*feature, attributes*/)
{	// Allways read feature (no filter)
	return true;
};


/** Loader function used to load features.
* @private
*/
ol_source_Mapillary.prototype._loaderFn = function(extent, resolution, projection)
{	if (resolution > this._maxResolution) return;
	var bbox = ol_proj_transformExtent(extent, projection, "EPSG:4326");
	// Commons API: for more info @see https://www.mapillary.com/developer
	var date = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
	var url = "https://a.mapillary.com/v2/search/im?client_id="
		+ this.get('clientId')
		+ "&max_lat=" + bbox[3]
		+ "&max_lon=" + bbox[2]
		+ "&min_lat=" + bbox[1]
		+ "&min_lon=" + bbox[0]
		+ "&limit="+(this._limit-1)
		+ "&start_time=" + date;
	// Ajax request to get the tile
	ol_ext_Ajax.get(
	{	url: url,
		dataType: 'jsonp', 
		success: function(data) 
		{	console.log(data);
			/*
			var features = [];
			var att, pt, feature, lastfeature = null;
			if (data.query && data.query.pages) return;
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
					for (var k=0; k<meta.length; k++)
					{	if (meta[k].name=="GPSLongitude") pt[0] = meta[k].value;
						if (meta[k].name=="GPSLatitude") pt[1] = meta[k].value;
					}
					if (!pt.length) 
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
			*/
    }});
};

export default ol_source_Mapillary
