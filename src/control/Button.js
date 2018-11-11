/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'

/** A simple push button control
* @constructor
* @extends {ol_control_Control}
* @param {Object=} options Control options.
*	@param {String} options.className class of the control
*	@param {String} options.title title of the control
*	@param {String} options.html html to insert in the control
*	@param {function} options.handleClick callback when control is clicked (or use change:active event)
*/
var ol_control_Button = function(options)
{	options = options || {};

	var element = document.createElement("div");
	element.className = (options.className || '') + " ol-button ol-unselectable ol-control";
	var self = this;

	var bt = document.createElement(/ol-text-button/.test(options.className) ? "div": "button");
	bt.type = "button";
	if (options.title) bt.title = options.title;
	if (options.html instanceof Element) bt.appendChild(options.html)
	else bt.innerHTML = options.html || "";
	var evtFunction = function(e) {
		if (e && e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (options.handleClick) {
			options.handleClick.call(self, e);
		};
	};
	bt.addEventListener("click", evtFunction);
	bt.addEventListener("touchstart", evtFunction);
	element.appendChild(bt);

	// Try to get a title in the button content
	if (!options.title && bt.firstElementChild) {
		bt.title = bt.firstElementChild.title;
	};

	ol_control_Control.call(this,
	{	element: element,
		target: options.target
	});

	if (options.title) {
		this.set("title", options.title);
	}
	if (options.title) this.set("title", options.title);
};
ol_inherits(ol_control_Button, ol_control_Control);


export default ol_control_Button
