/** A simple toggle control with a callback function
 * OpenLayers 3 Layer Switcher Control.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *		class {String} class of the control
 *		html {String} html code to insert in the control
 *		on {bool} the control is on
 *		toggleFn {function} callback when control is clicked 
 */
ol.control.Toggle = function(options) 
{	var element = $("<div>").addClass(options['class'] + ' ol-unselectable ol-control'+ (options.on ? " ol-active":""));
	
	function toggle(e)
	{	element.toggleClass("ol-active");
		e.preventDefault();  
		options.toggleFn(element.hasClass("ol-active"));
	};
	
	$("<button>").html(options.html || "")
				.on("touchstart click", toggle)
				.appendTo(element);
	
	ol.control.Control.call(this, 
	{	element: element.get(0)
	});
}
ol.inherits(ol.control.Toggle, ol.control.Control);

/**
 * Test if the control is on.
 * @return {bool}.
 * @api stable
 */
ol.control.Toggle.prototype.isOn = function()
{	return this.element.hasClass("ol-active");
}