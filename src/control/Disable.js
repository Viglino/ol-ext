import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

/** A simple control to disable all actions on the map.
 * The control will create an invisible div over the map.
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *		@param {String} options.class class of the control
 *		@param {String} options.html html code to insert in the control
 *		@param {bool} options.on the control is on
 *		@param {function} options.toggleFn callback when control is clicked 
 */
var ol_control_Disable = function(options)
{	options = options||{};
	var element = document.createElement("div");
			element.className = (options.className||""+' ol-disable ol-unselectable ol-control').trim();
	var stylesOptions = { top:"0px", left:"0px", right:"0px", bottom:"0px", "zIndex":10000, background:"none", display:"none" };
	Object.keys(stylesOptions).forEach(function(styleKey) {
		element.style[styleKey] = stylesOptions[styleKey];
	});

	ol_control_Control.call(this,
	{	element: element
	});
}
ol_ext_inherits(ol_control_Disable, ol_control_Control);

/** Test if the control is on
 * @return {bool}
 * @api stable
 */
ol_control_Disable.prototype.isOn = function()
{	return this.element.classList.contains("ol-disable");
}

/** Disable all action on the map
 * @param {bool} b, default false
 * @api stable
 */
ol_control_Disable.prototype.disableMap = function(b)
{	if (b) 
	{	this.element.classList.add("ol-enable").show();
	}
	else 
	{	this.element.classList.remove("ol-enable").hide();
	}
}

export default ol_control_Disable