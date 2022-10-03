/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_interaction_Select from 'ol/interaction/Select.js'
import ol_source_Vector from 'ol/source/Vector.js'

/** A Select interaction to delete features on click.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires deletestart
 * @fires deleteend
 * @param {Object} options ol.interaction.Select options
 */
var ol_interaction_Delete = class olinteractionDelete extends ol_interaction_Select {
  constructor(options) {
    super(options);
    this.on('select', function (e) {
      this.getFeatures().clear();
      this.delete(e.selected);
    }.bind(this));
  }
  /** Get vector source of the map
   * @return {Array<ol.source.Vector>}
   */
  _getSources(layers) {
    if (!this.getMap())
      return [];
    if (!layers)
      layers = this.getMap().getLayers();
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
  }
  /** Delete features: remove the features from the map (from all layers in the map)
   * @param {ol.Collection<ol.Feature>|Array<ol.Feature>} features The features to delete
   * @api
   */
  delete(features) {
    if (features && (features.length || features.getLength())) {
      this.dispatchEvent({ type: 'deletestart', features: features });
      var delFeatures = [];
      // Get the sources concerned
      this._getSources().forEach(function (source) {
        try {
          // Try to delete features in the source
          features.forEach(function (f) {
            source.removeFeature(f);
            delFeatures.push(f);
          });
        } catch (e) { /* ok */ }
      });
      this.dispatchEvent({ type: 'deleteend', features: delFeatures });
    }
  }
}

export default ol_interaction_Delete