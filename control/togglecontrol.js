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
{	var element = $("<div>").addClass(options['class'] + ' ol-unselectable ol-control');
	var self = this;

	this.togglefn_ = function(e)
	{	element.toggleClass("ol-active");
		if (e && e.preventDefault) e.preventDefault();
		if (self.interaction_) self.interaction_.setActive (self.isOn());
		if (options.toggleFn) options.toggleFn.call (self, self.isOn());
		self.dispatchEvent({ type:'activate', active:self.isOn() });
	};

	this.interaction = this.interaction_ = options.interaction;
	this.title = options.title;

	$("<button>").html(options.html || "")
				.attr('title', options.title)
				.on("touchstart click", this.togglefn_)
				.appendTo(element);
	
	ol.control.Control.call(this, 
	{	element: element.get(0)
	});

	this.setActive (options.active);
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
{	if (this.isOn()) 
	{	if (!b) this.togglefn_();
	}
	else 
	{	if (b) this.togglefn_();
	}
}

/**
*/
ol.control.Toggle.prototype.setInteraction = function(i)
{	this.interaction_ = i;
}

/**
*/
ol.control.Toggle.prototype.getInteraction = function()
{	return this.interaction_;
}