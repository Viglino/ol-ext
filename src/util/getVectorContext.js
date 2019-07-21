/* Export getVector context for backward compatibility ol5 / ol6
 * using ol5: export-> null
 * using ol6: export-> getVectorContext
 */
import * as ol_render from 'ol/render';

if (!ol_render.hasOwnProperty('getVectorContext')) {
  ol_render.getVectorContext = null;
}

export default ol_render.getVectorContext;
