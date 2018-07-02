import {inherits as ol_inherits} from 'ol'
import ol_interaction_DragAndDrop from 'ol/interaction/draganddrop'
import ol_interaction_Interaction from 'ol/interaction/interaction'
import ol_format_GPX from 'ol/format/gpx'
import ol_format_GeoJSON from 'ol/format/geojson'
import ol_format_IGC from 'ol/format/igc'
import ol_format_KML from 'ol/format/kml'
import ol_format_TopoJSON from 'ol/format/topojson'

/** Extend DragAndDrop choose drop zone + fires loadstart, loadend
 * @require jQuery
 * 
 * @constructor
 * @extends {ol_interaction_DragAndDrop}
 *	@fires loadstart, loadend, addfeatures
 *	@param {ol.dropfile.options} flashlight options param
 *		- zone {string} selector for the drop zone, default document
 *		- projection {ol.projection} default projection of the map
 *		- formatConstructors {Array<function(new:ol.format.Feature)>|undefined} Format constructors, default [ ol.format.GPX, ol.format.GeoJSON, ol.format.IGC, ol.format.KML, ol.format.TopoJSON ]
 *		- accept {Array<string>|undefined} list of eccepted format, default ["gpx","json","geojson","igc","kml","topojson"]
 */
var ol_interaction_DropFile = function(options)
{	options = options||{};

	ol_interaction_DragAndDrop.call(this, {});
	
	var zone = options.zone || document;
	$(zone).on('dragenter', this.onstop );
	$(zone).on('dragover', this.onstop );
	$(zone).on('dragleave', this.onstop );

	// Options
	this.formatConstructors_ = options.formatConstructors || [ ol_format_GPX, ol_format_GeoJSON, ol_format_IGC, ol_format_KML, ol_format_TopoJSON ];
	this.projection_ = options.projection;
	this.accept_ = options.accept || ["gpx","json","geojson","igc","kml","topojson"];

	var self = this;
	$(zone).on('drop', function(e){ return self.ondrop(e.originalEvent); });
};
ol_inherits(ol_interaction_DropFile, ol_interaction_DragAndDrop);

/** Set the map 
*/
ol_interaction_DropFile.prototype.setMap = function(map)
{	ol_interaction_Interaction.prototype.setMap.call(this, map);
};

/** Do somthing when over
*/
ol_interaction_DropFile.prototype.onstop = function(e)
{	e.preventDefault();
	e.stopPropagation();
	return false;
}

/** Do somthing when over
*/
ol_interaction_DropFile.prototype.ondrop = function(e)
{	if (e.dataTransfer && e.dataTransfer.files.length)
	{	var self = this;
		e.preventDefault();
		e.stopPropagation();
		// fetch FileList object
		var files = e.dataTransfer.files; // e.originalEvent.target.files ?
		// process all File objects
		var file;
		var pat = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/;
		for (var i=0; file=files[i]; i++) 
		{	var ex = file.name.match(pat)[0];
			self.dispatchEvent({ type:'loadstart', file: file, filesize: file.size, filetype: file.type, fileextension: ex, projection: projection, target: self });
						
			// Load file
			features = [];
			var reader = new FileReader();
			var projection = this.projection_ || this.getMap().getView().getProjection();
			var formatConstructors = this.formatConstructors_

			if (!projection) return;
			function tryReadFeatures (format, result, options)
			{	try 
				{	return format.readFeatures(result, options);
				} catch (e) {}
			}
			var theFile = file;
			reader.onload = function(e)
			{	var result = e.target.result;
				
				var features = [];
				var i, ii;
				for (i = 0, ii = formatConstructors.length; i < ii; ++i) 
				{	var formatConstructor = formatConstructors[i];
					var format = new formatConstructor();
					features = tryReadFeatures(format, result, { featureProjection: projection });
					if (features && features.length > 0) 
					{	self.dispatchEvent({ type:'addfeatures', features: features, file: theFile, projection: projection, target: self });
						self.dispatchEvent({ type:'loadend', features: features, file: theFile, projection: projection, target: self });
						return;
					}
				}
				self.dispatchEvent({ type:'loadend', file: theFile, target: self });
			};
			reader.readAsText(file);
		};
	}
    else {}
    return false;
};

export default ol_interaction_DropFile