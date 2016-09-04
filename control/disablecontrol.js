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
ol.control.Disable = function(options) 
{	var options = options||{};
	var element = $("<div>").addClass((options.calssName||"")+' ol-disable ol-unselectable ol-control');
	element.css({ top:0, left:0, right:0, bottom:0, "z-index":10000, background:"none", display:"none" });

	ol.control.Control.call(this, 
	{	element: element.get(0)
	});
}
ol.inherits(ol.control.Disable, ol.control.Control);

/**
 * @return {bool}.
 * @api stable
 */
ol.control.Disable.prototype.isOn = function()
{	return $(this.element).hasClass("ol-disable");
}

/**
 * @return {bool}.
 * @api stable
 */
ol.control.Disable.prototype.disableMap = function(b)
{	if (b) 
	{	$(this.element).addClass("ol-enable").show();
	}
	else 
	{	$(this.element).removeClass("ol-enable").hide();
	}
}