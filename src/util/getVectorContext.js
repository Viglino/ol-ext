/** Export getVector context for backward compatibility ol5 / ol6
 * Create a brand new function for ol5 copy of ol6 function.
 * Will be ignored using openlayers-ext package or ol5
 */
import { multiply as multiplyTransform } from 'ol/transform';
import CanvasImmediateRenderer from 'ol/render/canvas/Immediate';

function getVectorContext(event) {
  const frameState = event.frameState;
  const transform = multiplyTransform(event.inversePixelTransform.slice(), frameState.coordinateToPixelTransform);
  return new CanvasImmediateRenderer(
    event.context, frameState.pixelRatio, frameState.extent, transform,
    frameState.viewState.rotation
  );
}

export default getVectorContext
