/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Select from 'ol/interaction/Select'
import ol_source_Vector from 'ol/source/Vector'

/** A Select interaction to delete features on click.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires deletestart
 * @fires deleteend
 * @param {*} options ol.interaction.Select options
 */
var ol_interaction_Delete = function(options) {
  ol_interaction_Select.call(this, options);
  this.on('select', function(e) {
    this.getFeatures().clear();
    this.delete(e.selected);
  }.bind(this));
};
ol_ext_inherits(ol_interaction_Delete, ol_interaction_Select);

/** Get vector source of the map
 * @return {Array<ol.source.Vector>}
 */
ol_interaction_Delete.prototype._getSources = function(layers) {
  if (!this.getMap()) return [];
  if (!layers) layers = this.getMap().getLayers();
  var sources = [];
  layers.forEach(function (l) {
    // LayerGroup
    if (l.getLayers) {
      sources = sources.concat(this._getSources(l.getLayers()));
    } else {
      if (l.getSource && l.getSource() instanceof ol_source_Vector) {
        sources.push(l.getSource());
      }
    }
  }.bind(this));
  return sources;
};

/** Delete features: remove the features from the map (from all layers in the map)
 * @param {ol.Collection<ol.Feature>|Array<ol.Feature>} features The features to delete
 * @api
 */
ol_interaction_Delete.prototype.delete = function(features) {
  if (features && (features.length || features.getLength())) {
    this.dispatchEvent({ type: 'deletestart', features: features });
    var delFeatures = [];
    // Get the sources concerned
    this._getSources().forEach(function (source) {
      try {
        // Try to delete features in the source
        features.forEach(function(f) {
          source.removeFeature(f);
          delFeatures.push(f);
        });
      } catch(e) { /* ok */ }
    })
    this.dispatchEvent({ type: 'deleteend', features: delFeatures });
  }
};

export default ol_interaction_Delete