import ol_interaction_Modify from 'ol/interaction/Modify'
import {getUid as ol_util_getUid} from 'ol/util'

/* Extent the ol/interaction/Modify with a getModifyFeatures to get the features modified by the interaction
 * @return {Array<ol.Feature>} the modified features
 */
ol_interaction_Modify.prototype.getModifiedFeatures = function() {
  var featuresById = {};
  this.dragSegments_.forEach( function(s) {
    var feature = s[0].feature;
    featuresById[ol_util_getUid(feature)] = feature;
  });
  var features = [];
  for (var i in featuresById) features.push(featuresById[i]);
  return features;
};

(function() {
  var cou = ol_interaction_Modify.prototype.createOrUpdateVertexFeature_
  ol_interaction_Modify.prototype.createOrUpdateVertexFeature_ = function(coordinates) {
    console.log('START',this.modified_)
    cou.call(this, coordinates);
  }
})();
