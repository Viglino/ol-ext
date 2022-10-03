/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
  
*/

import ol_featureAnimation from './FeatureAnimation.js'

/** Do nothing 
 * @constructor
 * @extends {ol_featureAnimation}
 */
var ol_featureAnimation_Null = class olfeatureAnimationNull extends ol_featureAnimation {
	constructor() {
    super({ duration:0 });
  }
};

export default ol_featureAnimation_Null