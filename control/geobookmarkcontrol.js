/** GeoBookmarks
 *
 * @constructor
 * @extends {ol.control.Control}
 * @trigger add|remove when a bookmark us added or deleted
 * @param {Object=} Control options.
 *	- className {string} default ol-bookmark
 *	- placeholder {string} input placeholder, default Add a new geomark...
 *	- editable {bool} enable modification, default true
 *  - marks a list of default bookmarks : { BM1:{pos:ol.coordinates, zoom: integer, permanent: true}, BM2:{pos:ol.coordinates, zoom: integer} }
 */
ol.control.GeoBookmark = function(options) 
{	options = options || {};
	var self = this;

	var element;
	if (options.target) 
	{	element = $("<div>").addClass(options.className || "ol-bookmark");
	}
	else
	{	element = $("<div>").addClass((options.className || 'ol-bookmark') +' ol-unselectable ol-control ol-collapsed')
						.on("mouseleave", function()
						{	if (!input.is(":focus")) menu.hide();
						});
		// Show bookmarks on clik
		this.button = $("<button>")
					.attr('type','button')
					.click(function(e)
					{	menu.toggle();
					})
					.appendTo(element);
	}
	// The menu
	var menu = $("<div>")
				.appendTo(element);
	var ul = $("<ul>")
				.appendTo(menu);
	var input = $("<input>")
			.attr('placeholder', options.placeholder || "Add a new geomark...")
			.on('change', function(e)
			{	var title = $(this).val();
				if (title) 
				{	self.addBookmark(title);
					$(this).val("");
					self.dispatchEvent({ type:"add", name: title })
				}
				menu.hide();
			})
			.on('blur', function(){ menu.hide(); });
	if (options.editable!==false) input.appendTo(menu);

	// Init
	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	this.set('editable', options.editable!==false);
	// Set default bmark
	this.setBookmarks(options.marks);
}
ol.inherits(ol.control.GeoBookmark, ol.control.Control);


/** Set bookmarks
* @param {} bmark a list of bookmarks : { BM1:{pos:ol.coordinates, zoom: integer}, BM2:{pos:ol.coordinates, zoom: integer} }
* @param [boolean} modify, default false
*/
ol.control.GeoBookmark.prototype.setBookmarks = function (bmark)
{	if (!bmark) bmark = JSON.parse(localStorage['ol@bookmark'] || "{}");
	var modify = this.get('editable');
	var ul = $("ul", this.element);
	var menu = $("> div", this.element);
	var self = this;

	localStorage['ol@bookmark'] = JSON.stringify(bmark);
	ul.html("");
	for (var b in bmark)
	{	var li = $("<li>").text(b)
			.data('bookmark', bmark[b])
			.click(function()
			{	var bm = $(this).data('bookmark');
				self.getMap().getView().setCenter(bm.pos);
				self.getMap().getView().setZoom(bm.zoom);
				menu.hide();
			})
		li.appendTo(ul);
		if (modify && !bmark[b].permanent)
		{	$("<button>")
				.data('name', b)
				.attr('title', "Suppr.")
				.click(function(e)
				{	self.removeBookmark($(this).data('name'));
					self.dispatchEvent({ type:"add", name: $(this).data('name') })
					e.stopPropagation()
				})
				.appendTo(li);
		}
	}
};

/** Get Geo bookmarks
* @return a list of bookmarks : { BM1:{pos:ol.coordinates, zoom: integer}, BM2:{pos:ol.coordinates, zoom: integer} }
*/
ol.control.GeoBookmark.prototype.getBookmarks = function ()
{	return JSON.parse(localStorage['ol@bookmark'] || "{}");
};

/** Remove a Geo bookmark
* @param {string} name
*/
ol.control.GeoBookmark.prototype.removeBookmark = function (name)
{	if (!name) return;
	bmark = JSON.parse(localStorage['ol@bookmark'] || "{}");
	delete bmark[name];
	this.setBookmarks(bmark);
};

/** Add a new Geo bookmark
* @param {string} name
* @param {ol.Coordintes} position, default current position
* @param {number} zoom, default default map zoom
* @param {bool} permanent: prevent from deletion, default false
*/
ol.control.GeoBookmark.prototype.addBookmark = function (name, position, zoom, permanent)
{	if (!name) return;
	bmark = JSON.parse(localStorage['ol@bookmark'] || "{}");
	bmark[name] = 
		{	pos: position || this.getMap().getView().getCenter(), 
			zoom: zoom || this.getMap().getView().getZoom()
		};
	if (permanent) bmark[name].permanent = true;
	this.setBookmarks(bmark);
};
