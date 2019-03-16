/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Do nothing for a given duration
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationShowOptions} options
 * 
 */
var ol_featureAnimation_None = function(options)
{	ol_featureAnimation.call(this, options);
};
ol_ext_inherits(ol_featureAnimation_None, ol_featureAnimation);

/** Animate: do nothing during the laps time
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_None.prototype.animate = function (e)
{	
	return (e.time <= this.duration_);
};

export default ol_featureAnimation_None
