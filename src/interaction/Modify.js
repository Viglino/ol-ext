import ol_interaction_Modify from 'ol/interaction/Modify'
import {getUid as ol_util_getUid} from 'ol/util'
// Use ol.getUid for Openlayers < v6
import {getUid as ol_getUid} from 'ol/util'

/** Extent the ol/interaction/Modify with a getModifyFeatures
 * Get the features modified by the interaction
 * @return {Array<ol.Feature>} the modified features
 * @deprecated
 */
ol_interaction_Modify.prototype.getModifiedFeatures = function() {
  var featuresById = {};
  this.dragSegments_.forEach( function(s) {
    var feature = s[0].feature;
    // Openlayers > v.6
    if (window.ol && window.ol.util) featuresById[ol_util_getUid(feature)] = feature;
    // old version of Openlayers (< v.6) or ol all versions
    else featuresById[ol_getUid(feature)] = feature;
  });
  var features = [];
  for (var i in featuresById) features.push(featuresById[i]);
  return features;
};

export default ol_interaction_Modify