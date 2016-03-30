/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc OpenLayers 3 Layer Switcher Control.
 * @require jQuery
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options.
 *		- step_opacity {Number} step for opacity, default 0.5
 *		- show_progress {boolean} show a progress bar on tile layers, default false
 *		- mouseover {boolean} show the panel on mouseover, default false
 *		- reordering {boolean} allow layer reordering, default true
 *		- trash {boolean} add a trash button to delete the layer
 *		- oninfo {function} callback on click on info button, if none no info button is shown
 *		- extent {boolean} add an extent button to zoom to the extent of the layer
 *		- onextent {function} callback when click on extent, default fit view to extent
 *
 * Layers attributes that control the switcher
 *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
 *	- displayInLayerSwitcher {boolean} display in switcher, default true
 *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option), default false
 */
ol.control.LayerSwitcher = function(opt_options) 
{	var options = opt_options || {};
	var self = this;
	this.dcount = 0;
	this.step_opacity = options.step_opacity || 0.5;
	this.show_progress = options.show_progress;
	this.oninfo = (typeof (options.oninfo) == "function" ? options.oninfo: null);
	this.onextent = (typeof (options.onextent) == "function" ? options.onextent: null);
	this.hasextent = options.extent || options.onextent;
	this.hastrash = options.trash;
	this.reordering = (options.reordering!==false);

	var element;
	if (options.target) 
	{	element = $("<div>").addClass(options.switcherClass || "ol-layerswitcher");
	}
	else
	{	element = $("<div>").addClass((options.switcherClass || 'ol-layerswitcher') +' ol-unselectable ol-control ol-collapsed');
	
		$("<button>").on("touchstart", function(e){ element.toggleClass("ol-collapsed"); e.preventDefault(); })
					.click (function(){ element.toggleClass("ol-forceopen").addClass("ol-collapsed"); })
					.appendTo(element);
		if (options.mouseover)
		{	$(element).mouseleave (function(){ element.addClass("ol-collapsed"); })
				.mouseover(function(){ element.removeClass("ol-collapsed"); });
		}
	}
	this.panel_ = $("<ul>").addClass("panel")
				.appendTo(element);

	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	// Enable jQuery dataTransfert
	$.event.props.push('dataTransfer');

};
ol.inherits(ol.control.LayerSwitcher, ol.control.Control);


/** List of tips
*/
ol.control.LayerSwitcher.prototype.tip =
{	up: "up",
	down: "down",
	info: "informations...",
	extent: "zoom to extent",
	trash: "remove layer",
	plus: "expand/shrink"
}

/**
 * Set the map instance the control is associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.LayerSwitcher.prototype.setMap = function(map) 
{   ol.control.Control.prototype.setMap.call(this, map);
	this.drawPanel();
	
	if (this.map_)
	{	this.map_.getLayerGroup().un('change', this.drawPanel, this);
		this.map_.un('moveend', this.viewChange, this);
		// console.log("remove");
	}

	this.map_ = map;
	// Get change (new layer added or removed)
	if (map) 
	{	map.getLayerGroup().on('change', this.drawPanel, this);
		map.on('moveend', this.viewChange, this);
	}

};


/**
 * On view change hide layer depending on resolution / extent
 * @param {ol.event} map The map instance.
 * @private
 */
ol.control.LayerSwitcher.prototype.viewChange = function(e) 
{	var map = this.map_;
	var res = this.map_.getView().getResolution();
	$("li", this.panel_).each(function()
	{	var l = $(this).data('layer');
		if (l)
		{	if (l.getMaxResolution()<=res || l.getMinResolution()>=res) $(this).addClass("ol-layer-hidden");
			else 
			{	var ex0 = l.getExtent();
				if (ex0)
				{	var ex = map.getView().calculateExtent(map.getSize());
					if (!ol.extent.intersects(ex, ex0)) 
					{	$(this).addClass("ol-layer-hidden");
					}
					else $(this).removeClass("ol-layer-hidden");
				}
				else $(this).removeClass("ol-layer-hidden");
			}
		}
	});
}

/**
 *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
 */
ol.control.LayerSwitcher.prototype.drawPanel = function(e) 
{	if (!this.getMap()) return;
	var self = this;
	// Multiple event simultaneously / draw once => put drawing in the event queue
	this.dcount++;
	setTimeout (function(){ self.drawPanel_(); }, 0);
}

/** Delayed draw panel control 
 * @private
 */
ol.control.LayerSwitcher.prototype.drawPanel_ = function(e) 
{	if (--this.dcount) return;
	this.panel_.html("");
	this.drawList (this.panel_, this.getMap().getLayers());
}

/** Change layer visibility
 * @param {ol.layer}
 * @param {Array{ol.layer}} related layers
 */
ol.control.LayerSwitcher.prototype.switchLayerVisibility = function(l, layers)
{	if (!l.get('baseLayer')) l.setVisible(!l.getVisible());
	else 
	{	if (!l.getVisible()) l.setVisible(true);
		layers.forEach(function(li)
		{	if (l!==li && li.get('baseLayer') && li.getVisible()) li.setVisible(false);
		});
	}
}

/** Check if layer is on the map (depending on zoom and extent)
 * @param {ol.layer}
 * @return {boolean}
 */
ol.control.LayerSwitcher.prototype.testLayerVisibility = function(layer)
{	if (this.map_)
	{	var res = this.map_.getView().getResolution();
		if (layer.getMaxResolution()<=res || layer.getMinResolution()>=res) return false;
		else 
		{	var ex0 = layer.getExtent();
			if (ex0)
			{	var ex = this.map_.getView().calculateExtent(this.map_.getSize());
				return ol.extent.intersects(ex, ex0);
			}
			return true;
		}
	}
	return true;
}

/** Render a list of layer
 * @param {elt} element to render
 * @layers {Array{ol.layer}} list of layer to show
 * @api stable
 */
ol.control.LayerSwitcher.prototype.drawList = function(ul, collection)
{	var self = this;
	var layers = collection.getArray();
	var setVisibility = function(e) 
	{	e.stopPropagation();
		var l = $(this).parent().data("layer");
		self.switchLayerVisibility(l,collection);
	};
	var setOpacity = function(e)
	{	e.stopPropagation();
		var l = $(this).parent().parent().data("layer");
		l.setOpacity($(this).data('val')); 
	};
	function moveLayer (l, layers, inc)
	{	for (var i=0; i<layers.getLength(); i++)
		{	if (layers.item(i) === l) 
			{	layers.remove(l);
				layers.insertAt(i+inc, l);
				return true;
			}
			if (layers.item(i).getLayers && moveLayer (l, layers.item(i).getLayers(), inc)) return true;
		}
		return false;
	};
	function moveLayerUp(e) 
	{	e.preventDefault(); 
		moveLayer($(this).closest('li').data("layer"), self.map_.getLayers(), +1); 
	};
	function moveLayerDown(e) 
	{	e.preventDefault(); 
		moveLayer($(this).closest('li').data("layer"), self.map_.getLayers(), -1); 
	};
	function onInfo(e) 
	{	e.preventDefault(); 
		self.oninfo($(this).closest('li').data("layer")); 
	};
	function zoomExtent(e) 
	{	e.preventDefault(); 
		if (self.onextent) self.onextent($(this).closest('li').data("layer")); 
		else self.map_.getView().fit ($(this).closest('li').data("layer").getExtent(), self.map_.getSize()); 
	};
	function removeLayer(e) 
	{	e.preventDefault();
		var li = $(this).closest("ul").parent();
		if (li.data("layer")) 
		{	li.data("layer").getLayers().remove($(this).closest('li').data("layer"));
			if (li.data("layer").getLayers().getLength()==0) removeLayer.call($(".layerTrash", li), e);
		}
		else self.map_.removeLayer($(this).closest('li').data("layer"));
	};
	
	// Drag'n'drop
	function drag(e)
	{	// Reset drag
		var li = $(e.target);
		var sw = li.addClass("drag").parents(".ol-layerswitcher");
		$("ul", sw).data("drag",false);
		// New drag
		li.parent().data("drag",e.target);
		e.dataTransfer.setData("text", "switcher");
	}
	function dragend(e)
	{	// Reset drag
		var sw = $(e.target).removeClass("drag").parents(".ol-layerswitcher");
		$("li", sw).removeClass("dropover");
	}
	function drop(e)
	{	e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.getData("text") == "switcher") 
		{	// Get current position
			var li = $(e.currentTarget);
			if (!li.hasClass("dropover")) return;
			//if (!li.is("li")) li = li.closest("li");
			// Get drag on parent
			var drop = $(li.parent("ul").data("drag")).data("layer");
			var target = li.data("layer");
			if (!drop || !target) return;
			// switch layers
			for (var i=0; i<layers.length; i++) 
			{	if (layers[i]==drop) 
				{	collection.removeAt (i);
					break;
				}
			}
			for (var j=0; j<layers.length; j++) 
			{	if (layers[j]==target) 
				{	if (i>j) collection.insertAt (j,drop);
					else collection.insertAt (j+1,drop);
					break;
				}
			}
		}
	}
	function dragleave(e) 
	{	var li = $(e.currentTarget);
		// if (!li.is("li")) li = $(e.target).closest("li");
		li.removeClass("dropover");
	}
	function dragover(e) 
	{	var li = $(e.target);
		if (!li.is("li")) li = li.closest("li");
		var d = li.parents("ul").data("drag");
		if (d && li.get(0)!=d)
		{	var drop = $(d).data("layer");
			var target = li.data("layer");
			// Don't mix layer level
			if (!target.get("allwaysOnTop") == !drop.get("allwaysOnTop"))
			{	e.preventDefault();
				li.addClass("dropover");
			}
		}
	}
	
	// Add the layer list
	//for (var i=0; i<layers.length; i++)
	for (var i=layers.length-1; i>=0; i--)
	{	var layer = layers[i];
		if (layer.get("displayInLayerSwitcher")===false) continue;

		var d = $("<li>").addClass(layer.getVisible()?"visible":"")
						.attr("draggable", this.reordering)
						.on ("dragstart", drag)
						.on ("dragend", dragend)
						.on ("dragover", dragover)
						.on ("dragleave", dragleave)
						.on ("drop", drop)
						.data("layer",layer); //.appendTo(ul);
		if (!this.testLayerVisibility(layer)) d.addClass("ol-layer-hidden");
		
		// Visibility
		$("<input>")
			.attr('type', layer.get('baseLayer') ? 'radio' : 'checkbox')
			.attr("checked",layer.getVisible())
			//.on ('change', setVisibility)
			.click (setVisibility)
			.on ('touchstart', setVisibility)
			.appendTo(d);
		// Label
		$("<label>").text(layer.get("title") || layer.get("name"))
			.attr('title', layer.get("title") || layer.get("name"))
			.click(function(e){ $(this).prev().click(); })
			.attr('unselectable', 'on')
			.css('user-select', 'none')
			.on('selectstart', false)
			.appendTo(d);

		var layer_buttons = $("<div>").addClass("ol-layerswitcher-buttons").appendTo(d);

		// Show/hide sub layers
		if (layer.getLayers) 
		{	$("<div>").addClass(layer.get("openInLayerSwitcher") ? "collapse-layers" : "expend-layers" )
					.click(function()
					{	var l = $(this).closest('li').data("layer");
						l.set("openInLayerSwitcher", !l.get("openInLayerSwitcher") )
					})
					.attr("title", this.tip.plus)
					.appendTo(layer_buttons);
		}

		//  up/down
		if (this.reordering)
		{	if (i<layers.length-1) 
			{	if (layer.get("allwaysOnTop") || !layers[i+1].get("allwaysOnTop"))
				{	$("<div>").addClass("layerup")
						.on ('click touchstart', moveLayerUp)
						.attr("title", this.tip.up)
						.appendTo(layer_buttons);
				}
			}
			if (i>0) 
			{	if (!layer.get("allwaysOnTop") || layers[i-1].get("allwaysOnTop"))
				{	$("<div>").addClass("layerdown")
						.on ('click touchstart', moveLayerDown)
						.attr("title", this.tip.down)
						.appendTo(layer_buttons);
				}
			}
		}

		$("<div>").addClass("ol-separator").appendTo(layer_buttons);

		// Info button
		if (this.oninfo)
		{	$("<div>").addClass("layerInfo")
					.on ('click touchstart', onInfo)
					.attr("title", this.tip.info)
					.appendTo(layer_buttons);
		}
		// Layer remove
		if (this.hastrash && !layer.get("noSwitcherDelete"))
		{	$("<div>").addClass("layerTrash")
					.on ('click touchstart', removeLayer)
					.attr("title", this.tip.trash)
					.appendTo(layer_buttons);
		}
		// Layer extent
		if (this.hasextent && layers[i].getExtent())
		{	$("<div>").addClass("layerExtent")
					.on ('click touchstart', zoomExtent)
					.attr("title", this.tip.extent)
					.appendTo(layer_buttons);
		}

		// Progress
		if (this.show_progress && layer instanceof ol.layer.Tile)
		{	var p = $("<div>")
				.addClass("layerswitcher-progress")
				.appendTo(d);
			this.setprogress_(layer);
			layer.layerswitcher_progress = $("<div>").appendTo(p);
		}

		// Opacity
		var opacity = $("<div>")
			.addClass("layerswitcher-opacity")
			.addClass(("layerswitcher-opacity-"+this.step_opacity).replace(".","_"))
			.appendTo(d);
		var op = true;
		for (var k=0; k<=10; k+=this.step_opacity) 
		{	var opi = $("<div>").append($("<div>").css('opacity',k/10))
				.addClass("opacity-"+(10*k))
				.data("val",k/10)
				.click(setOpacity)
				.on('mouseup',setOpacity)
				.on('touchstart',setOpacity)
				.appendTo(opacity);
			if (op && k/10 >= layer.getOpacity())
			{	opi.addClass('select');
				op=false;
			}
		}
		/*
		$("<input>").attr({type:"range", min:0, max:1, step:0.1, draggable:false })
			.val(layer.getOpacity())
			.on('change', function(){ $(this).closest('li').data('layer').setOpacity(this.value); })
			.appendTo(d);
		*/

		// Layer group
		if (layer.getLayers)
		{	if (layer.get("openInLayerSwitcher")===true) 
			{	this.drawList ($("<ul>").appendTo(d), layer.getLayers());
			}
		}
		// Add to the list
		d.appendTo(ul);
	}
};

/** @private
*/
ol.control.LayerSwitcher.prototype.setprogress_ = function(layer)
{	if (!layer.layerswitcher_progress)
	{	var loaded = 0;
		var loading = 0;
		function draw()
		{	if (loading === loaded) 
			{	loading = loaded = 0;
				layer.layerswitcher_progress.width(0);
			}
			else 
			{	layer.layerswitcher_progress.css('width', (loaded / loading * 100).toFixed(1) + '%');
			}
		}
		layer.getSource().on('tileloadstart', function()
		{	loading++;
			draw();
		});
		layer.getSource().on('tileloadend', function()
		{	loaded++;
			draw();
		});
		layer.getSource().on('tileloaderror', function()
		{	loaded++;
			draw();
		});
	}
}
