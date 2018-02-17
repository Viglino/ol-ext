/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol from 'ol'
import ol_featureAnimation from './FeatureAnimation'

/** Do nothing 
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationShowOptions} options
 */
var ol_featureAnimation_Null = function(options)
{	ol_featureAnimation.call(this, { duration:0 });
};
ol.inherits(ol_featureAnimation_Null, ol_featureAnimation);
