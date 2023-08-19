/** @namespace ol 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol.html}
 */
/* @namespace olx
* @see {@link https://openlayers.org/en/master/apidoc/olx.html}
*/
/** @namespace ol.coordinate
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html}
 */
/** Layers are lightweight containers that get their data from sources.
 * @namespace ol.layer
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_layer_Base.html}
 */
/** Layers are lightweight containers that get their data from sources.
 * @namespace ol.layer.Base
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_layer_Base.html}
 */
/** A Collection of layers that are handled together.
 * @namespace ol.layer.Group
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html}
 */
/** Vector data that is rendered client-side. 
 * @namespace ol.layer.Vector 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector.html}
 */
/** @namespace ol.source 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_source_Source-Source.html}
 */
/** Provides a source of features for vector layers. Vector features provided by this source are suitable for editing. See module:ol/source/VectorTile~VectorTile for vector data that is optimized for rendering.
 * @namespace ol.source.Vector 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html}
 */
/** Abstract base class; normally only used for creating subclasses and not instantiated in apps. Base class for vector geometries.
 * @namespace ol.geom
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_geom_Geometry-Geometry.html}
 */
/** Abstract base class; normally only used for creating subclasses and not instantiated in apps. Base class for vector geometries.
 * @namespace ol.geom.Geometry 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_geom_Geometry-Geometry.html}
 */
/** Point geometry.
 * @namespace ol.geom.Point 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_geom_Point.html}
 */
/** Linestring geometry.
 * @namespace ol.geom.LineString 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString.html}
 */
/** Polygon geometry.
 * @namespace ol.geom.Polygon 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_geom_Polygon.html}
 */
/** Multi Polygon geometry.
 * @namespace ol.geom.MultiPolygon 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_geom_MultiPolygon.html}
 */
/** A control is a visible widget with a DOM element in a fixed position on the screen. 
 * They can involve user input (buttons), or be informational only; 
 * the position is determined using CSS. B
 * y default these are placed in the container with CSS class name ol-overlaycontainer-stopevent, 
 * but can use any outside DOM element.
 * @namespace ol.control 
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_control.html}
 */
/** User actions that change the state of the map. Some are similar to controls,
 * but are not associated with a DOM element.
 * @namespace ol.interaction 
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_interaction.html}
 */
/** Filters are effects that render over a map or a layer.
 * Use the map methods to add or remove filter on a map 
 * ({@link ol.Map#addFilter}, {@link ol.Map#removeFilter}, {@link ol.Map#getFilters}).
 * Use the layer methods to add or remove filter on a layer 
 * ({@link ol.layer.Base#addFilter}, {@link ol.layer.Base#removeFilter}, {@link ol.layer.Base#getFilters}).
 * @namespace ol.filter 
 */
/** Algorithms to on a graph (shortest path).
 * @namespace ol.graph
 */
/** Vector feature rendering styles. 
 * @namespace ol.style
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html}
 */
/** Vector feature rendering styles. 
 * @namespace ol.style.Style
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html}
 */
/** A base class used for creating subclasses and not instantiated in apps (Icons, Circcle, RegularShape...) 
 * @namespace ol.style.Image
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_style_Image-ImageStyle.html}
 */

/** The map is the core component of OpenLayers. 
 * For a map to render, a view, one or more layers, and a target container are needed:
 * @namespace ol.Map 
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Map.html}
 */
/** A View object represents a simple 2D view of the map.
 * @namespace ol.View
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View.html}
 */
/** Openlayers Overlay.    
 * An element to be displayed over the map and attached to a single map location. 
 * @namespace ol.Overlay
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Overlay.html}
 */
/** Openlayers base class for controls.    
 * A control is a visible widget with a DOM element in a fixed position on the screen. 
 * They can involve user input (buttons), or be informational only; the position is determined using CSS. 
 * @namespace ol.control.Control
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_control_Control.html}
 */

/**
 * Easing functions.
 * @namespace ol.easing
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_easing.html}
 */

/** 2D rendering context for the Canvas API
  * @namespace CanvasRenderingContext2D
  * @see {@link https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D}
  */