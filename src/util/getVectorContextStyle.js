import {VERSION as ol_util_VERSION} from 'ol/util.js'
import ol_style_Icon from 'ol/style/Icon.js'

var ol_ext_olVersion = ol_util_VERSION.split('.');
ol_ext_olVersion = parseInt(ol_ext_olVersion[0])*100 + parseInt(ol_ext_olVersion[1]);

/** Get style to use in a VectorContext
 * @param {} e
 * @param {ol.style.Style} s
 * @return {ol.style.Style}
 */
var ol_ext_getVectorContextStyle = function(e, s) {
  var ratio = e.frameState.pixelRatio;

  // Bug with Icon images
  if (ol_ext_olVersion > 605 && ratio !== 1 && (s.getImage() instanceof ol_style_Icon)) {
    s = s.clone();
    var img = s.getImage();
    img.setScale(img.getScale()*ratio);
    /* BUG anchor don't use ratio */
    var anchor = img.getAnchor();
    if (img.setDisplacement) {
      var disp = img.getDisplacement();
      if (disp) {
        disp[0] -= anchor[0]/ratio;
        disp[1] += anchor[1]/ratio;
        img.setAnchor([0,0]);
      }
    } else {
      if (anchor) {
        anchor[0] /= ratio;
        anchor[1] /= ratio;
      }
    }
    /**/
  }
  return s;
}

export { ol_ext_olVersion }
export default ol_ext_getVectorContextStyle
