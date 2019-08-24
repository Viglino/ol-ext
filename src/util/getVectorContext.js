/* Export getVector context for backward compatibility ol5 / ol6
 * Create a brand new function for ol5 copy of ol6 function.
 */
import { multiply as multiplyTransform } from 'ol/transform.js';
import CanvasImmediateRenderer from 'ol/render/canvas/Immediate.js';

/**
 * Gets a vector context for drawing to the event's canvas.
 * @param {import("./render/Event.js").default} event Render event.
 * @returns {CanvasImmediateRenderer} Vector context.
 * @api
 */
function getVectorContext(event) {
  const frameState = event.frameState;
  const transform = multiplyTransform(event.inversePixelTransform.slice(), frameState.coordinateToPixelTransform);
  return new CanvasImmediateRenderer(
    event.context, frameState.pixelRatio, frameState.extent, transform,
    frameState.viewState.rotation);
}

export default getVectorContext
