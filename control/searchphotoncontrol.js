/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search places using the photon API.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options. 
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string|undefined} options.lang Force preferred language, default none
 *	@param {boolean} options.position Search, with priority to geo position, default false
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return street + name + contry 
 */
ol.control.SearchPhoton = function(options) 
{	options = options || {};
	delete options.autocomplete;
	options.minLength = options.minLength || 3;
	options.typing = options.typing || 800;

	ol.control.Search.call(this, options);
	this.set('lang', options.lang);
	this.set('position', options.position);
};
ol.inherits(ol.control.SearchPhoton, ol.control.Search);

/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchPhoton.prototype.getTitle = function (f)
{	var p = f.properties;
	return (p.housenumber||"")
		+ " "+(p.street || p.name || "")
		+ "<i>"
		+ " "+(p.postcode||"")
		+ " "+(p.city||"")
		+ " ("+p.country
		+ ")</i>";
};

/** Autocomplete function11
* @param {string} s search string
* @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete fielad
* @api
*/
ol.control.SearchPhoton.prototype.autocomplete = function (s, cback)
{	var data = 
	{	q: s,
		lang: this.get('lang'),
		limit: this.get('maxItems')
	}
	if (this.get('position'))
	{	var view = this.getMap().getView();
		var pt = new ol.geom.Point(view.getCenter());
		pt = (pt.transform (view.getProjection(), "EPSG:4326")).getCoordinates();
		
		data.lon = pt[0];
		data.lat = pt[1];
	}
	$.ajax("http://photon.komoot.de/api/",
		{	dataType: "json",
			data: data,
			success: function(r) { cback(r.features); }
		});
};

/** A ligne has been clicked in the menu > dispatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol.control.Search.prototype.select = function (f)
{	var c = f.geometry.coordinates;
	// Add coordinate to the event
	try {
		c = ol.proj.transform (f.geometry.coordinates, 'EPSG:4326', this.getMap().getView().getProjection());
	} catch(e) {};
	this.dispatchEvent({ type:"select", search:f, coordinate: c });
};