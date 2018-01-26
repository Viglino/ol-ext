/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol from 'ol'
import ol_control_Control from 'ol/control/control'
/**
 * Search Control.
 * This is the base class for search controls. You can use it for simple custom search or as base to new class.
 * @see ol_control_SearchFeature
 * @see ol_control_SearchPhoton
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
 */
var ol_control_Search = function(options)
{	var self = this;
	if (!options) options = {};
	if (options.typing == undefined) options.typing = 300;

	var element;
	if (options.target)
	{	element = $("<div>").addClass((options.className||"")+ " ol-search");
	}
	else
	{	element = $("<div>").addClass((options.className||"") + ' ol-search ol-unselectable ol-control ol-collapsed');
		this.button = $("<button>")
					.attr('type','button')
					.attr('title',options.label||"search")
					.click (function()
					{	element.toggleClass("ol-collapsed");
						if (!element.hasClass("ol-collapsed"))
						{	$("input.search", element).focus();
							$('li', element).removeClass('select');
						}
					})
					.appendTo(element);
	}
	// Search input
	var tout, cur="";
	$("<input>").attr('type','search')
		.addClass("search")
		.attr('placeholder', options.placeholder||"Search...")
		.on('change', function(e)
		{ 	self.dispatchEvent({ type:"change:input", input:e, value:$(this).val()  });
		})
		.on('keyup search cut paste input', function(e)
		{	// console.log(e.type+" "+e.key)
			var li  = $("ul.autocomplete li.select", element);
			var	val = $(this).val();
			// move up/down
			if (e.key=='ArrowDown' || e.key=='ArrowUp' || e.key=='Down' || e.key=='Up')
			{	li.removeClass('select');
				li = (/Down/.test(e.key)) ? li.next() : li.prev();
				if (li.length) li.addClass('select');
				else $("ul.autocomplete li",element).first().addClass('select');
			}
			// Clear input
			else if (e.type=='input' && !val)
			{	self.drawList_();
			}
			// Select in the list
			else if (li.length && (e.type=="search" || e.key =='Enter'))
			{	if (element.hasClass("ol-control")) $(this).blur();
				li.removeClass('select');
				cur = val;
				self.select(li.data('search'));
			}
			// Search / autocomplete
			else if ( (e.type=="search" || e.key =='Enter')
					|| (cur!=val && options.typing>=0))
			{	// current search
				cur = val;
				if (cur)
				{	// prevent searching on each typing
					if (tout) clearTimeout(tout);
					tout = setTimeout(function()
					{	if (cur.length >= self.get("minLength"))
						{	var s = self.autocomplete (cur, function(auto) { self.drawList_(auto); });
							if (s) self.drawList_(s);
						}
						else self.drawList_();
					}, options.typing);
				}
				else self.drawList_();
			}
			// Clear list selection
			else
			{	$("ul.autocomplete li", element).removeClass('select');
			}
		})
		.blur(function()
		{	setTimeout(function(){ element.addClass('ol-collapsed') }, 200);
		})
		.focus(function()
		{	element.removeClass('ol-collapsed')
		})
		.appendTo(element);
	// Autocomplete list
	$("<ul>").addClass('autocomplete').appendTo(element);

	ol_control_Control.call(this,
		{	element: element.get(0),
			target: options.target
		});

	if (typeof (options.getTitle)=='function') this.getTitle = options.getTitle;
	if (typeof (options.autocomplete)=='function') this.autocomplete = options.autocomplete;

	// Options
	this.set('minLength', options.minLength || 1);
	this.set('maxItems', options.maxItems || 10);

};
ol.inherits(ol_control_Search, ol_control_Control);

/** Returns the text to be displayed in the menu
*	@param {any} f feature to be displayed
*	@return {string} the text to be displayed in the index, default f.name
*	@api
*/
ol_control_Search.prototype.getTitle = function (f)
{	return f.name || "No title";
};

/** Force search to refresh
*/
ol_control_Search.prototype.search = function ()
{	$("input.search", this.element).trigger('search');
};

/** Set the input value in the form (for initialisation purpose)
*	@param {string} value
*	@param {boolean} search to start a search
*	@api
*/
ol_control_Search.prototype.setInput = function (value, search)
{	$("input.search",this.element).val(value);
	if (search) $("input.search",this.element).trigger("keyup");
};

/** A ligne has been clicked in the menu > dispatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol_control_Search.prototype.select = function (f)
{	this.dispatchEvent({ type:"select", search:f });
};

/** Autocomplete function
* @param {string} s search string
* @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
* @return {Array|false} an array of search solutions or false if the array is send with the cback argument
* @api
*/
ol_control_Search.prototype.autocomplete = function (s, cback)
{	cback ([]);
	return false;
};

/** Draw the list
* @param {Array} auto an array of search result
*/
ol_control_Search.prototype.drawList_ = function (auto)
{	var ul = $("ul.autocomplete", this.element).html("");
	if (!auto) return;
	var self = this;
	var max = Math.min (self.get("maxItems"),auto.length);
	for (var i=0; i<max; i++)
	{	if (!i || !self.equalFeatures(auto[i], auto[i-1])) {
			$("<li>").html(self.getTitle(auto[i]))
			.data('search', auto[i])
			.click(function(e)
			{	self.select($(this).data('search'));
			})
			.appendTo(ul);
		}
	}
};

export default ol_control_Search
