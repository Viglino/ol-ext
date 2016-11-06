/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple toggle control 
 * The control can be created with an interaction to control its activation.
 *
 * @constructor
 * @extends {ol.control.Button}
 * @fires change:active
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		title {String} title of the control
 *		html {String} html to insert in the control
 *		interaction {ol.interaction} interaction associated with the control 
 *		active {bool} the control is created active, default false
 *		autoActive {bool} the control will activate when shown in an ol.control.Bar, default false
 *		onToggle {function} callback when control is clicked (or use change:active event)
 */
ol.control.Toggle = function(options) 
{	options = options || {};
	var self = this;

	this.interaction_ = options.interaction;
	if (this.interaction_)
	{	this.interaction_.on("change:active", function(e)
		{	self.setActive(!e.oldValue);
		});
	}

	if (options.toggleFn) options.onToggle = options.toggleFn; // compat old version
	options.handleClick = function()
				{	self.toggle();
					if (options.onToggle) options.onToggle.call(self, self.getActive());
				};
	options.className = options.className||"" + " ol-toggle";
	ol.control.Button.call(this, options);

	this.setActive (options.active);
	this.set ("autoActivate", options.autoActivate);
}
ol.inherits(ol.control.Toggle, ol.control.Button);

/**
 * Test if the control is active.
 * @return {bool}.
 * @api stable
 */
ol.control.Toggle.prototype.getActive = function()
{	return $(this.element).hasClass("ol-active");
}

/**
*/
ol.control.Toggle.prototype.toggle = function()
{	if (this.getActive()) this.setActive(false);
	else this.setActive(true);
}

/**
*/
ol.control.Toggle.prototype.setActive = function(b)
{	if (this.getActive()==b) return;
	if (b) $(this.element).addClass("ol-active");
	else $(this.element).removeClass("ol-active");
	if (this.interaction_) this.interaction_.setActive (b);
	this.dispatchEvent({ type:'change:active', key:'active', oldValue:!b, active:b });
}

/**
*/
ol.control.Toggle.prototype.setMap = function(map)
{	ol.control.Control.prototype.setMap.call(this, map);
	if (this.interaction_) map.addInteraction (this.interaction_);
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