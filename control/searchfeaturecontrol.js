/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Search features.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @param {Object=} Control options. 
 *	- className {string} control class name
 *	- target {Element | string | undefined} Specify a target if you want the control to be rendered outside of the map's viewport.
 *	- placeholder {string | undefined} placeholder, default "search..."
 *	- typing {number | undefined} a delay on each typing to start searching (ms), default 300.
 *	- source {ol.source.Vector} source to search in
 *	- property {string | function | undefined} a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
 *	- getSearchString {function | undefined} a function that take a feature and return a text to be used as search string
 *	- minLength {integer | undefined} minimum length to start searching, default 1
 *	- maxItems {integer | undefined} maximum number of items to display in the list, default 10
 */
ol.control.SearchFeature = function(options) 
{	var self = this;
	if (!options) options = {};
	
	var element;
	if (options.target) 
	{	element = $("<div>").addClass((options.className||"")+ "ol-searchfeature");
	}
	else
	{	element = $("<div>").addClass((options.className||"") + 'ol-searchfeature ol-unselectable ol-control ol-collapsed');
		this.button = $("<button>")
					.attr('type','button')
					.click (function()
					{	element.toggleClass("ol-collapsed"); 
						if (!element.hasClass("ol-collapsed")) $("input", element).focus();
					})
					.appendTo(element);
	}
	// Search input
	var tout, cur="";
	$("<input>").attr('type','search')
		.attr('placeholder', options.placeholder||"search...")
		.on('keyup search', function(e) 
		{	if (cur != $(this).val())
			{	cur = $(this).val();
				// prevent searching on each typing
				if (tout) clearTimeout(tout);
				tout = setTimeout(function(){ self.search(cur)}, options.typing || 300);
			}
		})
		.blur(function()
		{	setTimeout(function(){ element.addClass('ol-collapsed') }, 200);
		})
		.focus(function()
		{	
		})
		.appendTo(element);
	// Autocomplete list
	$("<ul>").addClass('autocomplete').appendTo(element);
	
	ol.control.Control.call(this, 
		{	element: element.get(0),
			target: options.target
		});

	if (typeof (options.property)=='function') this.getFeatureName = options.property;
	if (typeof (options.getSearchString)=='function') this.getSearchString = options.getSearchString;
	
	this.source_ = options.source;

	// Options
	this.set('property', options.property || 'name');
	this.set('minLength', options.minLength || 1);
	this.set('maxItems', options.minLength || 10);

};
ol.inherits(ol.control.SearchFeature, ol.control.Control);

/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol.control.SearchFeature.prototype.getFeatureName = function (f)
{	return f.get(this.get('property')||'name');
};

/** Returns the text to be used as search string
*	@param {ol.Feature} f the feature
*	@return {string} the text to be used
*	@api
*/
ol.control.SearchFeature.prototype.getSearchString = function (f)
{	return this.getFeatureName(f);
};

/** Search a string in the features
*	@param {string} s the search string
*/
ol.control.SearchFeature.prototype.search = function (s)
{	var ul = $("ul", this.element).html("");
	if (s.length < this.get("minLength")) return;
	var self = this;
	var nb = this.get("maxItems");
	// regexp
	s = s.replace(/^\*/,'');
	var rex = new RegExp(s, 'i');
	// The source
	var features = this.source_.getFeatures();
	for (var i=0, f; f=features[i]; i++)
	{	if (rex.test(this.getSearchString(f)))
		{	$("<li>").text(this.getFeatureName(f))
					.data('feature', f)
					.click(function(e)
					{	self.dispatchEvent({ type:"select", feature:$(this).data('feature') });
					})
					.appendTo(ul);
			if ((--nb)<=0) break;;
		}
	}
};
