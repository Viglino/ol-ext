/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple push button control 
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		title {String} title of the control
 *		html {String} html to insert in the control
 *		handleClick {function} callback when control is clicked (or use change:active event)
 */
ol.control.Button = function(options) 
{	options = options || {};
	var element = $("<div>").addClass((options.className||"") + ' ol-button ol-unselectable ol-control');
	var self = this;

	$("<button>").html(options.html || "")
				.attr('title', options.title)
				.on("touchstart click", function(e)
				{	if (e && e.preventDefault) e.preventDefault();
					if (options.handleClick) options.handleClick.call(self, e);
				})
				.appendTo(element);
	
	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	if (options.title) this.set("title", options.title);
};
ol.inherits(ol.control.Button, ol.control.Control);

/** A simple push button control drawn as text
*/
ol.control.TextButton = function(options) 
{	options = options || {};
	options.className = (options.className||"") + " ol-text-button";
	ol.control.Button.call(this, options);
};
ol.inherits(ol.control.TextButton, ol.control.Button);
