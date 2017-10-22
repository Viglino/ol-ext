/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search features.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options. 
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string | undefined} options.property a property to display in the index, default 'name'.
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property 
 *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
 */
ol.control.SearchFeature = function(options) 
{	if (!options) options = {};
		
	ol.control.Search.call(this, options);

	if (typeof(options.getSearchString)=="function") this.getSearchString = options.getSearchString;
	this.set('property', options.property||'name');

	this.source_ = options.source;
};
ol.inherits(ol.control.SearchFeature, ol.control.Search);

/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchFeature.prototype.getTitle = function (f)
{	return f.get(this.get('property')||'name');
};

/** Return the string to search in
*	@param {ol.Feature} f the feature
*	@return {string} the text to be used as search string
*	@api
*/
ol.control.SearchFeature.prototype.getSearchString = function (f)
{	return this.getTitle(f);
}

/** Autocomplete function
* @param {string} s search string
* @param {int} max max 
* @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete fielad
* @api
*/
ol.control.SearchFeature.prototype.autocomplete = function (s, cback)
{	var result = [];
	// regexp
	s = s.replace(/^\*/,'');
	var rex = new RegExp(s, 'i');
	// The source
	var features = this.source_.getFeatures();
	var max = this.get('maxItems')
	for (var i=0, f; f=features[i]; i++)
	{	if (rex.test(this.getSearchString(f)))
		{	result.push(f);
			if ((--max)<=0) break;
		}
	}
	return result;
};
