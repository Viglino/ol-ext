/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction synchronize
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.SynchronizeOptions} 
 *  - maps {Array<ol.Map>} An array of maps to synchronize with the map of the interaction
 */
ol.interaction.Synchronize = function(options) 
{	if (!options) options={};
	var self = this;

	ol.interaction.Interaction.call(this, 
		{	handleEvent: function(e)
				{	if (e.type=="pointermove") { self.handleMove_(e); }
					return true; 
				}
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
{	
	if (this.getMap())
	{
		this.getMap().getView().un('change:center', this.syncMaps, this);
		this.getMap().getView().un('change:rotation', this.syncMaps, this);
		this.getMap().getView().un('change:resolution', this.syncMaps, this);
		ol.events.unlisten(this.getMap().getViewport(), ol.events.EventType.MOUSEOUT, this.handleMouseOut_, this);
	}
	
	ol.interaction.Interaction.prototype.setMap.call (this, map);

	if (map)
	{	this.getMap().getView().on('change:center', this.syncMaps, this);
		this.getMap().getView().on('change:rotation', this.syncMaps, this);
		this.getMap().getView().on('change:resolution', this.syncMaps, this);

		var me = this;
		$(this.getMap().getTargetElement()).mouseout(function() {
			for (var i=0; i<me.maps.length; i++)
			{	me.maps[i].hideTarget();
			}
			me.getMap().hideTarget();
    });
		this.syncMaps();
	}
};

/** Synchronize the maps
*/
ol.interaction.Synchronize.prototype.syncMaps = function(e) 
{	var map = this.getMap();
	if (!e) e = { type:'all' };
	if (map)
	{	for (var i=0; i<this.maps.length; i++)
		{	switch (e.type)
			{	case 'change:rotation': 
					if (this.maps[i].getView().getRotation() != map.getView().getRotation())
						this.maps[i].getView().setRotation(map.getView().getRotation()); 
					break;
				case 'change:center': 
					if (this.maps[i].getView().getCenter() != map.getView().getCenter())
						this.maps[i].getView().setCenter(map.getView().getCenter()); 
					break;
				case 'change:resolution': 
					if (this.maps[i].getView().getResolution() != map.getView().getResolution())
					{	/* old version prior to 1.19.1
						this.maps[i].beforeRender ( ol.animation.zoom(
							{	duration: 250, 
								resolution: this.maps[i].getView().getResolution() 
							}));
						*/
						this.maps[i].getView().setResolution(map.getView().getResolution());
					}
					break;
				default: 
					this.maps[i].getView().setRotation(map.getView().getRotation());
					this.maps[i].getView().setCenter(map.getView().getCenter());
					this.maps[i].getView().setResolution(map.getView().getResolution());
					break;
			}
		}
	}
};

/** Cursor move > tells other maps to show the cursor
* @param {ol.event} e "move" event
*/
ol.interaction.Synchronize.prototype.handleMove_ = function(e) 
{	for (var i=0; i<this.maps.length; i++)
	{	this.maps[i].showTarget(e.coordinate);
	}
	this.getMap().showTarget();
};


/** Cursor out of map > tells other maps to hide the cursor
* @param {event} e "mouseOut" event
*/
ol.interaction.Synchronize.prototype.handleMouseOut_ = function(e, scope)
{	for (var i=0; i<scope.maps.length; i++)
	{
		scope.maps[i].targetOverlay_.setPosition(undefined);
	}
};

/** Show a target overlay at coord
* @param {ol.coordinate} coord
*/
ol.Map.prototype.showTarget = function(coord)
{	if (!this.targetOverlay_)
	{	var elt = $("<div>").addClass("ol-target");
		this.targetOverlay_ = new ol.Overlay({ element: elt.get(0) });
		this.targetOverlay_.setPositioning('center-center');
		this.addOverlay(this.targetOverlay_);
		elt.parent().addClass("ol-target-overlay");
		// hack to render targetOverlay before positioning it
		this.targetOverlay_.setPosition([0,0]);
	}
	this.targetOverlay_.setPosition(coord);
};

/** Hide the target overlay
*/
ol.Map.prototype.hideTarget = function()
{
	this.removeOverlay(this.targetOverlay_);
	this.targetOverlay_ = undefined;
};