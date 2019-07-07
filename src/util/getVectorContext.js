/* Export getVector context for backward compatibility ol5 / ol6
 * using ol5: export-> undefined
 * using ol6: export-> getVectorContext
 */
import * as render from 'ol/render';

export default render.getVectorContext;
