import { Map as _ol_Map_, View, Overlay } from 'ol';
import { Options as OverlayOptions } from 'ol/Overlay';

import Collection from 'ol/Collection';
import { default as Attribution, default as ol_control_Attribution } from 'ol/control/Attribution';
import ol_control_Control from 'ol/control/Control';
import ol_control_ScaleLine from 'ol/control/ScaleLine';
import { Coordinate, CoordinateFormat } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import Feature, { FeatureLike } from 'ol/Feature';
import { FeatureLoader } from 'ol/featureloader';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import { Layer, Vector } from 'ol/layer';
import { ProjectionLike } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import { Size } from 'ol/size';
import { ImageCanvas, Vector as VectorSource, WMTS } from 'ol/source';
import { AttributionLike } from 'ol/source/Source';
import { LoadingStrategy, Options as VectorSourceOptions } from 'ol/source/Vector';
import { StyleLike, RenderFunction } from 'ol/style/Style';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Image, RegularShape } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType'
import { Pointer, Interaction, Draw, Modify, Select, DragAndDrop } from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Condition as EventsConditionType } from 'ol/events/condition'
import { Color } from 'ol/color';
import { ColorLike } from 'ol/colorlike';
import { Pixel } from 'ol/pixel';
import FeatureFormat from 'ol/format/Feature';
import Event from 'ol/events/Event';
import OverlayPositioning from 'ol/OverlayPositioning';


/** The map is the core component of OpenLayers.
 * For a map to render, a view, one or more layers, and a target container are needed:
 * @namespace Map
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Map.html}
 */
declare namespace Map {

    interface PulseOptions {
        projection: ProjectionLike | undefined;
        duration: number;
        easing: ((p0: number) => number);
        style: Stroke;
    }


    /** Animate feature on a map
     * @function
     * @fires animationstart, animationend
     * @param {Feature} feature Feature to animate
     * @param {featureAnimation|Array<featureAnimation>} fanim the animation to play
     * @return {olx.animationControler} an object to control animation with start, stop and isPlaying function
     */
    function animateFeature(feature: Feature, fanim: featureAnimation | featureAnimation[]): animationControler;

    /** Show a target overlay at coord
    * @param {Coordinate} coord
     */
    function showTarget(coord: Coordinate): void;
    /** Hide the target overlay
     */
    function hideTarget(): void;
    /** Pulse an Extent on postcompose
    *	@param {Coordinates} point to pulse
    *	@param {pulse.options} options pulse options param
    *	  @param {projectionLike|undefined} options.projection projection of coords, default no transform
    *	  @param {Number} options.duration animation duration in ms, default 2000
    *	  @param {easing} options.easing easing function, default easing.upAndDown
    *	  @param {style.Stroke} options.style stroke style, default 2px red
     */
    function animExtent(point: Coordinates, options: PulseOptions): void;
    /** Show a markup a point on postcompose
    *	@deprecated use map.animateFeature instead
    *	@param {Coordinates} point to pulse
    *	@param {markup.options} pulse options param
    *		- projection {projection|String|undefined} projection of coords, default none
    *		- delay {Number} delay before mark fadeout
    *		- maxZoom {Number} zoom when mark fadeout
    *		- style {style.Image|Style|Array<Style>} Image to draw as markup, default red circle
    *	@return Unique key for the listener with a stop function to stop animation
     */
    function markup(point: Coordinates, options: {
        projection: ProjectionLike,
        delay: number,
        maxZoom: number,
        style: Image | Style | Style[]
    }): any;
    /** Pulse a point on postcompose
    *	@deprecated use map.animateFeature instead
    *	@param {Coordinates} point to pulse
    *	@param {pulse.options} pulse options param
    *		- projection {projection||String} projection of coords
    *		- duration {Number} animation duration in ms, default 3000
    *		- amplitude {Number} movement amplitude 0: none - 0.5: start at 0.5*radius of the image - 1: max, default 1
    *		- easing {easing} easing function, default easing.easeOut
    *		- style {style.Image|Style|Array<Style>} Image to draw as markup, default red circle
     */
    function pulse(point: Coordinates, pulse: PulseOptions): void;
}



/** An animation controler object an object to control animation with start, stop and isPlaying function.
 * To be used with {@link olx.Map#animateFeature} or {@link layer.Vector#animateFeature}
 * @typedef {Object} animationControler
 * @property {function} start - start animation.
 * @property {function} stop - stop animation option arguments can be passed in animationend event.
 * @property {function} isPlaying - return true if animation is playing.
 */
type animationControler = {
    start: (...params: any[]) => any;
    stop: (...params: any[]) => any;
    isPlaying: (...params: any[]) => any;
};




