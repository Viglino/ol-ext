import {inherits as ol_inherits} from 'ol'
import {shiftKeyOnly as ol_events_condition_shiftKeyOnly} from 'ol/events/condition'
import ol_control_Bar from './Bar'

/** Control bar for editing in a layer
 * @constructor
 * @extends {ol_control_Bar}
 * @fires info
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {Array<string>} options.interactions Interactions to add to the bar 
 *    ie. Select, Delete, Info, DrawPoint, DrawLine, DrawPolygon
 *	@param {ol.source.Vector} options.source Source for the drawn features. 
 */
var ol_control_EditBar = function(options) {
  options = options || {};
  options.interactions = options.interactions || {};

  // New bar
	ol_control_Bar.call(this, {
    className: (options.className ? options.className+' ': '') + 'ol-editbar',
    toggleOne: true,
		target: options.target
  });

  this._source = options.source;
  // Add buttons / interaction
  this._interactions = {};
  this._setSelectInteraction(options);
  this._setEditInteraction(options);
  this._setModifyInteraction(options);
};
ol_inherits(ol_control_EditBar, ol_control_Bar);

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_EditBar.prototype.setMap = function (map) {
  if (this.getMap()) {
    if (this._interactions.Delete) this.getMap().removeInteraction(this._interactions.Delete);
    if (this._interactions.ModifySelect) this.getMap().removeInteraction(this._interactions.ModifySelect);
  }
  
  ol_control_Bar.prototype.setMap.call(this, map);

  if (this.getMap()) {
    if (this._interactions.Delete) this.getMap().addInteraction(this._interactions.Delete);
    if (this._interactions.ModifySelect) this.getMap().addInteraction(this._interactions.ModifySelect);

  }
};

/** Get an interaction associated with the bar
 * @param {string} name 
 */
ol_control_EditBar.prototype.getInteraction = function (name) {
  return this._interactions[name];
};

/** Get the option title */
ol_control_EditBar.prototype._getTitle = function (option) {
  return (option && option.title) ? option.title : option;
};

/** Add selection tool:
 * 1. a toggle control with a select interaction
 * 2. an option bar to delete / get information on the selected feature
 * @private
 */
ol_control_EditBar.prototype._setSelectInteraction = function (options) {
  var self = this;
  
  // Sub bar
  var sbar = new ol.control.Bar();
  var selectCtrl;

  // Delete button
  if (options.interactions.Delete !== false) {
    var del = this._interactions.Delete = new ol.interaction.Delete();
    del.setActive(false);
    if (this.getMap()) this.getMap().addInteraction(del);
    sbar.addControl (new ol.control.Button({
      className: 'ol-delete',
      title: this._getTitle(options.interactions.Delete) || "Delete",
      handleClick: function() {
        // Delete selection
        del.delete(selectCtrl.getInteraction().getFeatures());
        selectCtrl.getInteraction().getFeatures().clear();
      }
    }));
  }

  // Info button
  if (options.interactions.Info !== false) {
    sbar.addControl (new ol.control.Button({
      className: 'ol-info',
      title: this._getTitle(options.interactions.Info) || "Show informations",
      handleClick: function() {
        self.dispatchEvent({ 
          type: 'info', 
          features: selectCtrl.getInteraction().getFeatures() 
        });
      }
    }));
  }

  // Select button
  if (options.interactions.Select !== false) {
    var sel = new ol.interaction.Select({
      condition: ol.events.condition.click
    });
    selectCtrl = new ol.control.Toggle({
      className: 'ol-selection',
      title: this._getTitle(options.interactions.Select) || "Select",
      interaction: sel,
      bar: sbar.getControls().length ? sbar : undefined,
      autoActivate:true,
      active:true
    });

    this.addControl(selectCtrl);
    this._interactions.Select = sel;
    sel.on('change:active', function() {
      sel.getFeatures().clear();
    });
  }
};


/** Add editing tools
 * @private
 */ 
ol_control_EditBar.prototype._setEditInteraction = function (options) {
  if (options.interactions.DrawPoint !== false) {
    this._interactions.DrawPoint = new ol.interaction.Draw({
      type: 'Point',
      source: this._source
    });
    var pedit = new ol.control.Toggle({
      className: 'ol-drawpoint',
      title: this._getTitle(options.interactions.DrawPoint) || 'Point',
      interaction: this._interactions.DrawPoint
    });
    this.addControl ( pedit );
  }

  if (options.interactions.DrawLine !== false) {
    this._interactions.DrawLine = new ol.interaction.Draw ({
      type: 'LineString',
      source: this._source,
      // Count inserted points
      geometryFunction: function(coordinates, geometry) {
        if (geometry) geometry.setCoordinates(coordinates);
        else geometry = new ol.geom.LineString(coordinates);
        this.nbpts = geometry.getCoordinates().length;
        return geometry;
      }
    });
    var ledit = new ol.control.Toggle({
      className: 'ol-drawline',
      title: this._getTitle(options.interactions.DrawLine) || 'LineString',
      interaction: this._interactions.DrawLine,
      // Options bar associated with the control
      bar: new ol.control.Bar ({
        controls:[ 
          new ol.control.TextButton({
            html: this._getTitle(options.interactions.UndoDraw) || 'undo',
            title: this._getTitle(options.interactions.UndoDraw) || "delete last point",
            handleClick: function() {
              if (ledit.getInteraction().nbpts>1) ledit.getInteraction().removeLastPoint();
            }
          }),
          new ol.control.TextButton ({
            html: this._getTitle(options.interactions.FinishDraw) || 'finish',
            title: this._getTitle(options.interactions.FinishDraw) || "finish",
            handleClick: function() {
              // Prevent null objects on finishDrawing
              if (ledit.getInteraction().nbpts>2) ledit.getInteraction().finishDrawing();
            }
          })
        ]
      }) 
    });

    this.addControl ( ledit );
  }

  if (options.interactions.DrawPolygon !== false) {
    this._interactions.DrawPolygon = new ol.interaction.Draw ({
      type: 'Polygon',
      source: this._source,
      // Count inserted points
      geometryFunction: function(coordinates, geometry) {
        this.nbpts = coordinates[0].length;
        if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
        else geometry = new ol.geom.Polygon(coordinates);
        return geometry;
      }
    });
    this._setDrawPolygon(
      'ol-drawpolygon', 
      this._interactions.DrawPolygon, 
      this._getTitle(options.interactions.DrawPolygon) || 'Polygon', 
      options
    );
  }

  if (options.interactions.DrawHole !== false) {
    this._interactions.DrawHole = new ol.interaction.DrawHole ();
    this._setDrawPolygon(
      'ol-drawhole', 
      this._interactions.DrawHole, 
      this._getTitle(options.interactions.DrawHole) || 'Hole', 
      options
    );
  }

  if (options.interactions.DrawRegular !== false) {
    var regular = this._interactions.DrawRegular = new ol.interaction.DrawRegular ({
      source: this._source,
      sides: 4
    });

    var div = document.createElement('DIV');
    var text = document.createTextNode('4 pts');
    var up = document.createElement('DIV');
    up.addEventListener('click', function() {
      var sides = regular.getSides() +1;
      if (sides<3) sides=3;
      regular.setSides(sides);
      text.textContent = sides+' pts';
    }.bind(this));
    var down = document.createElement('DIV');
    down.addEventListener('click', function() {
      var sides = regular.getSides() -1;
      if (sides < 2) sides = 2;
      regular.setSides (sides);
      text.textContent = sides>2 ? sides+' pts' : 'circle';
    }.bind(this));

    div.appendChild(down);
    div.appendChild(text);
    div.appendChild(up);

    var ctrl = new ol.control.Toggle({
      className: 'ol-drawregular',
      title: this._getTitle(options.interactions.DrawRegular) || 'Regular',
      interaction: this._interactions.DrawRegular,
      // Options bar associated with the control
      bar: new ol.control.Bar ({
        controls:[ 
          new ol.control.TextButton({
            html: div
          })
        ]
      }) 
    });
    this.addControl (ctrl);
  }

};

/**
 * @private
 */
ol_control_EditBar.prototype._setDrawPolygon = function (className, interaction, title, options) {
  var fedit = new ol.control.Toggle ({
    className: className,
    title: title,
    interaction: interaction,
    // Options bar associated with the control
    bar: new ol.control.Bar({
      controls:[ 
        new ol.control.TextButton ({
          html: this._getTitle(options.interactions.UndoDraw) || 'undo',
          title: this._getTitle(options.interactions.UndoDraw) || 'undo last point',
          handleClick: function(){
            if (fedit.getInteraction().nbpts>1) fedit.getInteraction().removeLastPoint();
          }
        }),
        new ol.control.TextButton({
          html: this._getTitle(options.interactions.FinishDraw) || 'finish',
          title: this._getTitle(options.interactions.FinishDraw) || 'finish',
          handleClick: function() {
            // Prevent null objects on finishDrawing
            if (fedit.getInteraction().nbpts>3) fedit.getInteraction().finishDrawing();
          }
        })
      ]
    }) 
  });
  this.addControl (fedit);
};

/** Add modify tools
 * @private
 */ 
ol_control_EditBar.prototype._setModifyInteraction = function (options) {
  // Modify on selected features
  if (options.interactions.ModifySelect !== false && options.interactions.Select !== false) {
    this._interactions.ModifySelect = new ol.interaction.ModifyFeature({
      features: this.getInteraction('Select').getFeatures()
    })
    if (this.getMap()) this.getMap().addInteraction(this._interactions.ModifySelect);
    // Activate with select
    this._interactions.ModifySelect.setActive(this._interactions.Select.getActive());
    this._interactions.Select.on('change:active', function(e) {
      this._interactions.ModifySelect.setActive(this._interactions.Select.getActive());
    }.bind(this));
  }

  if (options.interactions.Transform !== false) {
    this._interactions.Transform = new ol.interaction.Transform ({
      addCondition: ol_events_condition_shiftKeyOnly
    });
    var transform = new ol.control.Toggle ({
      html: '<i></i>',
      className: 'ol-transform',
      title: this._getTitle(options.interactions.Transform) || 'Transform',
      interaction: this._interactions.Transform
    });
    this.addControl (transform);
  }

  if (options.interactions.Split !== false) {
    this._interactions.Split = new ol.interaction.Split ({
        sources: this._source
    });
    var split = new ol.control.Toggle ({
      className: 'ol-split',
      title: this._getTitle(options.interactions.Split) || 'Split',
      interaction: this._interactions.Split
    });
    this.addControl (split);
  }

  if (options.interactions.Offset !== false) {
    this._interactions.Offset = new ol.interaction.Offset ({
        source: this._source
    });
    var offset = new ol.control.Toggle ({
      html: '<i></i>',
      className: 'ol-offset',
      title: this._getTitle(options.interactions.Offset) || 'Offset',
      interaction: this._interactions.Offset
    });
    this.addControl (offset);
  }

};

export default ol_control_EditBar