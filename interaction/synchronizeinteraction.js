/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires drawstart, drawing, drawend
 * @param {olx.interaction.TransformOptions} 
 *  - source {Array<ol.Layer>} Destination source for the drawn features
 *  - features {ol.Collection<ol.Feature>} Destination collection for the drawn features 
 *	- style {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style for the sketch
 *	- sides {integer} nimber of sides, default 0 = circle
 *	- squareCondition { ol.events.ConditionType | undefined } A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features.
 *	- centerCondition { ol.events.ConditionType | undefined } A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features.
 *	- canRotate { bool } Allow rotation when centered + square, default: true
 */
ol.interaction.Synchronize = function(options) 
{	if (!options) options={};
	var self = this;

	ol.interaction.Interaction.call(this, 
	{	handleEvent: function(e){ if (e.type=="pointermove") { self.handleMove_(e); }; return true; }
	});

	this.maps = options.maps;

};
ol.inherits(ol.interaction.Synchronize, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.Synchronize.prototype.setMap = function(map) 
{	ol.interaction.Interaction.prototype.setMap.call (this, map);

	map.getView().on('change:center', this.syncMaps, this);
    map.getView().on('change:rotation', this.syncMaps, this);
    map.getView().on('change:resolution', this.syncMaps, this);
	this.syncMaps();
};

/** Synchronize the maps
*/
ol.interaction.Synchronize.prototype.syncMaps = function(e) 
{	var map = this.getMap();
	if (map)
	{	for (var i=0; i<this.maps.length; i++)
		{	this.maps[i].getView().setCenter(map.getView().getCenter());
			this.maps[i].getView().setRotation(map.getView().getRotation());
			this.maps[i].getView().setResolution(map.getView().getResolution());
		}
	}
}

/** Cursor move > tells other maps to show the cursor
* @param {ol.event} e "move" event
*/
ol.interaction.Synchronize.prototype.handleMove_ = function(e) 
{	for (var i=0; i<this.maps.length; i++)
	{	this.maps[i].showTarget(e.coordinate);
	}
	this.getMap().showTarget();
}

/** Show a target overlay at coord
* @param {ol.coordinate} coord
*/
ol.Map.prototype.showTarget = function(coord)
{	if (!this.targetOverlay_)
	{	var elt = $("<div>").addClass("ol-target");
		this.targetOverlay_ = new ol.Overlay({ element: elt.get(0) });
		this.targetOverlay_.setPositioning('center-center');
		this.addOverlay(this.targetOverlay_);
		elt.parent().addClass("ol-target-overlay")
	}
	this.targetOverlay_.setPosition(coord);
}