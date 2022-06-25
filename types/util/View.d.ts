export default ol_View;
/**
 * Destination
 */
export type viewTourDestinations = {
    /**
     * animation type (flyTo, moveTo), default flyTo
     */
    type?: string;
    /**
     * animation duration
     */
    duration?: number;
    /**
     * destination coordinate, default current center
     */
    center?: ol_coordinate;
    /**
     * destination zoom, default current zoom
     */
    zoom?: number;
    /**
     * zoom to fly to, default min (current zoom, zoom) -2
     */
    zoomAt?: number;
    /**
     * easing function used during the animation, defaults ol/easing~inAndOut
     */
    easing?: Function;
    /**
     * The rotation of the view at the end of the animation
     */
    rotation?: number;
    /**
     * Optional anchor to remain fixed during a rotation or resolution animation.
     */
    anchor?: anchor;
};
import ol_View from "ol/View";
