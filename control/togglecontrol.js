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
	var self = this;

	this.togglefn_ = function(e)
	{	element.toggleClass("ol-active");
		if (e && e.preventDefault) e.preventDefault();  
		if (options.toggleFn) options.toggleFn.call(self, element.hasClass("ol-active"));
		self.dispatchEvent({ type:'activate', active:self.isOn() });
	};

	$("<button>").html(options.html || "")
				.on("touchstart click", this.togglefn_)
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
{	return $(this.element).hasClass("ol-active");
}

/**
*/
ol.control.Toggle.prototype.Toggle = function()
{	this.togglefn_();
}

/**
*/
ol.control.Toggle.prototype.setActive = function(b)
{	if (this.isOn() !== b ) this.togglefn_();
}