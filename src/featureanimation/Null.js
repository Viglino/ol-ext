/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
  
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Do nothing 
 * @constructor
 * @extends {ol_featureAnimation}
 */
var ol_featureAnimation_Null = function() {
  ol_featureAnimation.call(this, { duration:0 });
};
ol_ext_inherits(ol_featureAnimation_Null, ol_featureAnimation);
