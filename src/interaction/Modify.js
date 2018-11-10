import ol_interaction_Modify from 'ol/interaction/Modify'
import {getUid as ol_getUid} from 'ol/util'

/* Extent the ol/interaction/Modify with a getModifyFeatures
 * Get the features modified by the interaction
 * @return {Array<ol.Feature>} the modified features
 */
ol_interaction_Modify.prototype.getModifiedFeatures = function() {
  var featuresById = {};
  this.dragSegments_.forEach( function(s) {
    var feature = s[0].feature;
    featuresById[ol_getUid(feature)] = feature;
  });
  var features = [];
  for (var i in featuresById) features.push(featuresById[i]);
  return features;
};

export default ol_interaction_Modify