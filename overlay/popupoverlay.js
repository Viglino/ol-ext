/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location.  Like {@link ol.control.Control}, Overlays are visible widgets.
 * Unlike Controls, they are not in a fixed position on the screen, but are tied
 * to a geographical coordinate, so panning the map will move an Overlay but not
 * a Control.
 *
 * Example:
 *
 *     var popup = new ol.Overlay.Popup();
 *     map.addOverlay(popup);
 *     popup.show(coordinate, "Hello!");
 *     popup.hide();
 *
 * @constructor
 * @extends {ol.Overlay}
 * @param {olx.OverlayOptions} options Overlay options 
 *		+ popupClass: the a class for the overlay.
 *		+ closeBox: popup has a close box.
 *		+ onclose: callback when close box is clicked.
 *		+ positionning: add 'auto' to let the popup choose a good positioning.
 * @api stable
 */
ol.Overlay.Popup = function (options)
{	var self = this;
	var elt = $("<div>");
	this.element = options.element = elt.get(0);
	this.offsetBox = options.offsetBox;
	// Anchor div
	$("<div>").addClass("anchor").appendTo(elt);
	var d = $("<div>").addClass('ol-overlaycontainer-stopevent').appendTo(elt);
	// Content
	this.content = $("<div>").addClass("content").appendTo(d).get(0);
	// Closebox
	this.closeBox = options.closeBox;
	$("<button>").addClass("closeBox").addClass(options.closeBox?"hasclosebox":"")
				.prependTo(d)
				.click(function()
				{	self.hide();
					if (typeof (options.onclose) == 'function') options.onclose();
				});
	// Stop event
	options.stopEvent=false;
	d.on("mousedown touchstart", function(e){ e.stopPropagation(); })

	ol.Overlay.call(this, options);
	
	this.setPopupClass(options.popupClass);
	this.setPositioning(options.positioning);
}
ol.inherits(ol.Overlay.Popup, ol.Overlay);

/**
 * Get CSS class of the popup according to its positioning.
 * @private
 */
ol.Overlay.Popup.prototype.getClassPositioning = function ()
{	var c = "";
	var pos = this.getPositioning();
	if (/bottom/.test(pos)) c += "ol-popup-bottom ";
	if (/top/.test(pos)) c += "ol-popup-top ";
	if (/left/.test(pos)) c += "ol-popup-left ";
	if (/right/.test(pos)) c += "ol-popup-right ";
	if (/^center/.test(pos)) c += "ol-popup-middle ";
	if (/center$/.test(pos)) c += "ol-popup-center ";
	return c;
}

/**
 * Set CSS class of the popup.
 * @param {string} class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.setClosebox = function (b)
{	this.closeBox = b;
	if (b) $(this.element).addClass("hasclosebox");
	else $(this.element).removeClass("hasclosebox");
}

/**
 * Set the CSS class of the popup.
 * @param {string} class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.setPopupClass = function (c)
{	$(this.element).removeClass()
		.addClass("ol-popup "+(c||"default")+" "+this.getClassPositioning()+(this.closeBox?" hasclosebox":""));
}

/**
 * Add a CSS class to the popup.
 * @param {string} class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.addPopupClass = function (c)
{	$(this.element).addClass(c);
}

/**
 * Remove a CSS class to the popup.
 * @param {string} class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.removePopupClass = function (c)
{	$(this.element).removeClass(c);
}

/**
 * Remove a CSS class to the popup.
 * @param {string} class name.
 * @api stable
 */
ol.Overlay.Popup.prototype.setPositioning = function (pos)
{	if (/auto/.test(pos))
	{	this.autoPositioning = pos.split('-');
		if (this.autoPositioning.length==1) this.autoPositioning[1]="auto";
	}
	else this.autoPositioning = false;
	pos = pos.replace(/auto/g,"center");
	if (pos=="center") pos = "bottom-center";
	this.setPositioning_(pos);
}
ol.Overlay.Popup.prototype.setPositioning_ = function (pos)
{	ol.Overlay.prototype.setPositioning.call(this, pos);
	$(this.element).removeClass("ol-popup-top ol-popup-bottom ol-popup-left ol-popup-right ol-popup-center ol-popup-middle");
	$(this.element).addClass(this.getClassPositioning());
}

/**
 * Set the position and the content of the popup.
 * @param {ol.Coordinate|string} the coordinate of the popup or the HTML content.
 * @param {string|undefined} the HTML content (undefined = previous content).
 * @api stable
 */
ol.Overlay.Popup.prototype.show = function (coordinate, html)
{	if (!html && typeof(coordinate)=='string') 
	{	html = coordinate; 
		coordinate = null;
	}
	
	var self = this;
	var map = this.getMap();
	if (html) 
	{	// this.content.innerHTML = html;
		$(this.content).html("").append(html);
		// Refresh when loaded (img)
		$("*", this.content).load(function()
		{	map.renderSync(); 
		})
	}

	if (coordinate) 
	{	// Auto positionning
		if (this.autoPositioning)
		{	var p = map.getPixelFromCoordinate(coordinate);
			var s = map.getSize();
			var pos=[];
			if (this.autoPositioning[0]=='auto')
			{	pos[0] = (p[1]<s[1]/3) ? "top" : "bottom";
			}
			else pos[0] = this.autoPositioning[0];
			pos[1] = (p[0]<2*s[0]/3) ? "left" : "right";
			this.setPositioning_(pos[0]+"-"+pos[1]);
			if (this.offsetBox)
			{	this.setOffset([this.offsetBox[pos[1]=="left"?2:0], this.offsetBox[pos[0]=="top"?3:1] ]);
			}
		}
		// Show
		this.setPosition(coordinate);
		// Set visible class (wait to compute the size/position first)
		$(this.element).parent().show();
		this._tout = setTimeout (function()
		{	$(self.element).addClass("visible"); 
		}, 0);
	}
}

/**
 * Hide the popup
 * @api stable
 */
ol.Overlay.Popup.prototype.hide = function ()
{	this.setPosition(undefined);
	if (this._tout) clearTimeout(this._tout)
	$(this.element).removeClass("visible");
}