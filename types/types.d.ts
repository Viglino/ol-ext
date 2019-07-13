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

declare namespace ol {

    /** Compute a convex hull using Andrew's Monotone Chain Algorithm
     * @param {Array<Point>} points an array of 2D points
     * @return {Array<Point>} the confvex hull vertices
     */
    function convexHull(points: Point[]): Point[];
    /** Convert coordinate to French DFCI grid
     * @param {Coordinate} coord
     * @param {number} level [0-3]
     * @param {Projection} projection of the coord, default EPSG:27572
     * @return {String} the DFCI index
     */
    function toDFCI(coord: Coordinate, level: number, projection: Projection): string;
    /** Get coordinate from French DFCI index
     * @param {String} index the DFCI index
     * @param {Projection} projection result projection, default EPSG:27572
     * @return {Coordinate} coord
     */
    function fromDFCI(index: string, projection: Projection): Coordinate;
    /** The string is a valid DFCI index
     * @param {string} index DFCI index
     * @return {boolean}
     */
    function validDFCI(index: string): boolean;
    /** Coordinate is valid for DFCI
     * @param {Coordinate} coord
     * @param {Projection} projection result projection, default EPSG:27572
     * @return {boolean}
     */
    function validDFCICoord(coord: Coordinate, projection: Projection): boolean;
    /** Distance beetween 2 points
    *	Usefull geometric functions
    * @param {Coordinate} p1 first point
    * @param {Coordinate} p2 second point
    * @return {number} distance
     */
    function dist2d(p1: Coordinate, p2: Coordinate): number;
    /** 2 points are equal
    *	Usefull geometric functions
    * @param {Coordinate} p1 first point
    * @param {Coordinate} p2 second point
    * @return {boolean}
     */
    function equal(p1: Coordinate, p2: Coordinate): boolean;
    /** Get center coordinate of a feature
    * @param {Feature} f
    * @return {Coordinate} the center
     */
    function getFeatureCenter(f: Feature): Coordinate;
    /** Get center coordinate of a geometry
    * @param {Feature} geom
    * @return {Coordinate} the center
     */
    function getGeomCenter(geom: Feature): Coordinate;
    /** Offset a polyline
     * @param {Array<Coordinate>} coords
     * @param {number} offset
     * @return {Array<Coordinate>} resulting coord
     * @see http://stackoverflow.com/a/11970006/796832
     * @see https://drive.google.com/viewerng/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxqa2dhZGdldHN0b3JlfGd4OjQ4MzI5M2Y0MjNmNzI2MjY
     */
    function offsetCoords(coords: Coordinate[], offset: number): Coordinate[];
    /** Find the segment a point belongs to
     * @param {Coordinate} pt
     * @param {Array<Coordinate>} coords
     * @return {} the index (-1 if not found) and the segment
     */
    function findSegment(pt: Coordinate, coords: Coordinate[]): any;
    /**
     * Split a Polygon geom with horizontal lines
     * @param {Array<Coordinate>} geom
     * @param {number} y the y to split
     * @param {number} n contour index
     * @return {Array<Array<Coordinate>>}
     */
    function splitH(geom: Coordinate[], y: number, n: number): Coordinate[][];
}
declare namespace source {
    /** Abstract base class; normally only used for creating subclasses. Bin collector for data
     * @constructor
     * @extends {VectorSource}
     * @param {Object} options VectorSourceOptions + grid option
     *  @param {VectorSource} options.source Source
     *  @param {boolean} options.listenChange listen changes (move) on source features to recalculate the bin, default true
     *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
     *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
     */
    class BinBase extends VectorSource {
        constructor(options: {
            source: VectorSource;
            listenChange: boolean;
        });
        /**
         * Get the bin that contains a feature
         * @param {Feature} f the feature
         * @return {Feature} the bin or null it doesn't exit
         */
        getBin(f: Feature): Feature;
        /** Get the grid geometry at the coord
         * @param {Coordinate} coord
         * @param {Object} attributes add key/value to this object to add properties to the grid feature
         * @returns {Polygon}
         * @api
         */
        getGridGeomAt(coord: Coordinate, attributes: any): Polygon;
        /** Get the bean at a coord
         * @param {Coordinate} coord
         * @param {boolean} create true to create if doesn't exit
         * @return {Feature} the bin or null it doesn't exit
         */
        getBinAt(coord: Coordinate, create: boolean): Feature;
        /** Clear all bins and generate a new one.
         */
        reset(): void;
        /**
         * Get features without circular dependencies (vs. getFeatures)
         * @return {Array<Feature>}
         */
        getGridFeatures(): Feature[];
        /** Create bin attributes using the features it contains when exporting
         * @param {Feature} bin the bin to export
         * @param {Array<Features>} features the features it contains
         */
        _flatAttributes(bin: Feature, features: Feature[]): void;
        /**
         * Get the orginal source
         * @return {VectorSource}
         */
        getSource(): VectorSource;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /**
    * @constructor source.DBPedia
    * @extends {VectorSource}
    * @param {olx.source.DBPedia=} opt_options
     */
    class DBPedia extends VectorSource {
        constructor(opt_options?: {
            loader: FeatureLoader
            url?: string;
            maxResolution?: number;
            lang?: string;
            limit: number;
            attributions?: AttributionLike;
            stragety: LoadingStrategy;

        });


        /** Decode RDF attributes and choose to add feature to the layer
        * @param {feature} the feature
        * @param {attributes} RDF attributes
        * @param {lastfeature} last feature added (null if none)
        * @return {boolean} true: add the feature to the layer
        * @API stable
         */
        readFeature(feature: Feature, attributes: any[], lastfeature: Feature): boolean;
        /** Set RDF query subject, default: select label, thumbnail, abstract and type
        * @API stable
         */
        querySubject(): void;
        /** Set RDF query filter, default: select language
        * @API stable
         */
        queryFilter(): void;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /** DFCI source: a source to display the French DFCI grid on a map
     * @see http://ccffpeynier.free.fr/Files/dfci.pdf
     * @constructor source.DFCI
     * @extends {Vector}
     * @param {any} options Vector source options
     *  @param {Array<Number>} resolutions a list of resolution to change the drawing level, default [1000,100,20]
     */
    class DFCI extends VectorSource {
        constructor(options: any, resolutions: Number[]);
        /** Cacluate grid according Extent/resolution
         */
        _calcGrid(): void;
        /** Get features
         *
         */
        _getFeatures(): void;
    }
    /** Delaunay source
     * Calculate a delaunay triangulation from points in a source
     * @param {*} options extend Vector options
     *  @param {Vector} options.source the source that contains the points
     */
    function Delaunay(options: {
        source: VectorSource;
    }): void;
    /** A source for INSEE grid
     * @constructor
     * @extends {VectorSource}
     * @param {Object} options VectorSourceOptions + grid option
     *  @param {VectorSource} options.source Source
     *  @param {number} [options.Size] Size of the grid in meter, default 200m
     *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
     *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
     */
    class FeatureBin extends VectorSource {
        constructor(options: {
            source: VectorSource;
            Size?: number;
        });
        /** Set grid Size
         * @param {Feature} features
         */
        setFeatures(features: Feature): void;
        /** Get the grid geometry at the coord
         * @param {Coordinate} coord
         * @returns {Polygon}
         * @api
         */
        getGridGeomAt(coord: Coordinate): Polygon;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /** Layer source with georeferencement to place it on a map
    * @constructor
    * @extends {source.ImageCanvas}
    * @param {olx.source.GeoImageOptions=} options
     */
    class GeoImage extends ImageCanvas {
        constructor(options?: {

        });
        /**
         * Get coordinate of the image center.
         * @return {Coordinate} coordinate of the image center.
         * @api stable
         */
        getCenter(): Coordinate;
        /**
         * Set coordinate of the image center.
         * @param {Coordinate} coordinate of the image center.
         * @api stable
         */
        setCenter(coordinate: Coordinate): void;
        /**
         * Get image scale.
         * @return {Size} image scale (along x and y axis).
         * @api stable
         */
        getScale(): Size;
        /**
         * Set image scale.
         * @param {Size|Number} image scale (along x and y axis or both).
         * @api stable
         */
        setScale(image: Size | number): void;
        /**
         * Get image rotation.
         * @return {Number} rotation in degre.
         * @api stable
         */
        getRotation(): number;
        /**
         * Set image rotation.
         * @param {Number} rotation in radian.
         * @api stable
         */
        setRotation(rotation: number): void;
        /**
         * Get the image.
         * @api stable
         */
        getGeoImage(): void;
        /**
         * Get image crop Extent.
         * @return {Extent} image crop Extent.
         * @api stable
         */
        getCrop(): Extent;
        /**
         * Set image mask.
         * @param {LineString} coords of the mask
         * @api stable
         */
        setMask(coords: LineString): void;
        /**
         * Get image mask.
         * @return {LineString} coords of the mask
         * @api stable
         */
        getMask(): LineString;
        /**
         * Set image crop Extent.
         * @param {Extent|Number} image crop Extent or a number to crop from original Size.
         * @api stable
         */
        setCrop(image: Extent | number): void;
    }
    /** IGN's Geoportail WMTS source
     * @constructor
     * @extends {WMTS}
     * @param {String=} layer Layer name.
     * @param {olx.source.OSMOptions=} options WMTS options
     *  @param {number} options.minZoom
     *  @param {number} options.maxZoom
     *  @param {string} options.server
     *  @param {string} options.gppKey api key, default 'choisirgeoportail'
     *  @param {string} options.authentication basic authentication associated with the gppKey as btoa("login:pwd")
     *  @param {string} options.format image format, default 'image/jpeg'
     *  @param {string} options.style layer style, default 'normal'
     *  @param {string} options.crossOrigin default 'anonymous'
     *  @param {string} options.wrapX default true
     */
   export class Geoportail extends WMTS {
        constructor(layer?: string, options?: {
            minZoom: number;
            maxZoom: number;
            server: string;
            gppKey: string;
            authentication: string;
            format: string;
            style: string;
            crossOrigin: string;
            wrapX: string;
        });
        /** Standard IGN-GEOPORTAIL attribution
         */
        attribution: any;
        /** Get service URL according to server url or standard url
         */
        serviceURL(): void;
        /**
         * Return the associated API key of the Map.
         * @function
         * @return the API key.
         * @api stable
         */
        getGPPKey(): any;
        /**
         * Set the associated API key to the Map.
         * @param {String} key the API key.
         * @param {String} authentication as btoa("login:pwd")
         * @api stable
         */
        setGPPKey(key: string, authentication: string): void;
        /** Return the GetFeatureInfo URL for the passed coordinate, resolution, and
         * projection. Return `undefined` if the GetFeatureInfo URL cannot be
         * constructed.
         * @param {Coordinate} coord
         * @param {Number} resolution
         * @param {Projection} projection default the source projection
         * @param {Object} options
         *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
         * @return {String|undefined} GetFeatureInfo URL.
         */
        getFeatureInfoUrl(coord: Coordinate, resolution: number, projection: Projection, options: {
            INFO_FORMAT: string;
        }): string | undefined;
        /** Get feature info
         * @param {Coordinate} coord
         * @param {Number} resolution
         * @param {Projection} projection default the source projection
         * @param {Object} options
         *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
         *  @param {function} options.callback a function that take the response as parameter
         *  @param {function} options.error function called when an error occurred
         */
        getFeatureInfo(coord: Coordinate, resolution: number, projection: Projection, options: {
            INFO_FORMAT: string;
            callback: (...params: any[]) => any;
            error: (...params: any[]) => any;
        }): void;
        /** Get a tile load function to load tiles with basic authentication
         * @param {string} authentication as btoa("login:pwd")
         * @param {string} format mime type
         * @return {function} tile load function to load tiles with basic authentication
         */
        static tileLoadFunctionWithAuthentication(authentication: string, format: string): (...params: any[]) => any;
    }
    /** A source for grid binning
     * @constructor
     * @extends {VectorSource}
     * @param {Object} options VectorSourceOptions + grid option
     *  @param {VectorSource} options.source Source
     *  @param {number} [options.Size] Size of the grid in meter, default 200m
     *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
     *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
     */
    class GridBin extends VectorSource {
        constructor(options: {
            source: VectorSource;
            Size?: number;
        });
        /** Set grid projection
         * @param {ProjectionLike} proj
         */
        setGridProjection(proj: ProjectionLike): void;
        /** Set grid Size
         * @param {number} Size
         */
        setSize(Size: number): void;
        /** Get the grid geometry at the coord
         * @param {Coordinate} coord
         * @returns {Polygon}
         * @api
         */
        getGridGeomAt(coord: Coordinate): Polygon;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /** A source for hexagonal binning
     * @constructor
     * @extends {VectorSource}
     * @param {Object} options VectorSourceOptions + HexGridOptions
     *  @param {VectorSource} options.source Source
     *  @param {number} [options.Size] Size of the hexagon in map units, default 80000
     *  @param {Coordinate} [options.origin] origin of the grid, default [0,0]
     *  @param {import('../render/HexGrid').HexagonLayout} [options.layout] grid layout, default pointy
     *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
     *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
     */
    class HexBin extends VectorSource {
        constructor(options: {
            source: VectorSource;
            Size?: number;
            origin?: Coordinate;
        });
        /** The HexGrid
         * 	@type {HexGrid}
         */
        _hexgrid: HexGrid;
        /** Get the hexagon geometry at the coord
         * @param {Coordinate} coord
         * @returns {Polygon}
         * @api
         */
        getGridGeomAt(coord: Coordinate): Polygon;
        /**	Set the inner HexGrid Size.
         * 	@param {number} newSize
         * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
         */
        setSize(newSize: number, noreset: boolean): void;
        /**	Get the inner HexGrid Size.
         * 	@return {number}
         */
        getSize(): number;
        /**	Set the inner HexGrid layout.
         * 	@param {import('../render/HexGrid').HexagonLayout} newLayout
         * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
         */
        setLayout(newLayout: any, noreset: boolean): void;
        /**	Get the inner HexGrid layout.
         * 	@return {import('../render/HexGrid').HexagonLayout}
         */
        getLayout(): any;
        /**	Set the inner HexGrid origin.
         * 	@param {Coordinate} newLayout
         * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
         */
        setOrigin(newLayout: Coordinate, noreset: boolean): void;
        /**	Get the inner HexGrid origin.
         * 	@return {Coordinate}
         */
        getOrigin(): Coordinate;
        /**
         * Get hexagons without circular dependencies (vs. getFeatures)
         * @return {Array<Feature>}
         */
        getHexFeatures(): Feature[];
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /** A source for INSEE grid
     * @constructor
     * @extends {VectorSource}
     * @param {Object} options VectorSourceOptions + grid option
     *  @param {VectorSource} options.source Source
     *  @param {number} [options.Size] Size of the grid in meter, default 200m
     *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
     *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
     */
    class InseeBin extends VectorSource {
        constructor(options: {
            source: VectorSource;
            Size?: number;
        });
        /** Set grid Size
         * @param {number} Size
         */
        setSize(Size: number): void;
        /** Get grid Size
         * @return {number} Size
         */
        getSize(): number;
        /** Get the grid geometry at the coord
         * @param {Coordinate} coord
         * @returns {Polygon}
         * @api
         */
        getGridGeomAt(coord: Coordinate): Polygon;
        /** Get grid Extent
         * @param {ProjectionLike} proj
         * @return {Extent}
         */
        getGridExtent(proj: ProjectionLike): Extent;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /**
    * @constructor source.Mapillary
    * @extends {VectorSource}
    * @param {olx.source.Mapillary=} options
     */
    class Mapillary extends VectorSource {
        constructor(options?: VectorSourceOptions);
        /** Max resolution to load features
         */
        _maxResolution: any;
        /** Query limit
         */
        _limit: any;
        /** Decode wiki attributes and choose to add feature to the layer
        * @param {feature} the feature
        * @param {attributes} wiki attributes
        * @return {boolean} true: add the feature to the layer
        * @API stable
         */
        readFeature(featue: Feature, attributes: AttributionLike): boolean;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /**
     * OSM layer using the Ovepass API
     * @constructor source.Overpass
     * @extends {VectorSource}
     * @param {any} options
     *  @param {string} options.url service url, default: https://overpass-api.de/api/interpreter
     *  @param {Array<string>} options.filter an array of tag filters, ie. ["key", "key=value", "key~value", ...]
     *  @param {boolean} options.node get nodes, default: true
     *  @param {boolean} options.way get ways, default: true
     *  @param {boolean} options.rel get relations, default: false
     *  @param {number} options.maxResolution maximum resolution to load Features
     *  @param {string|Attribution|Array<string>} options.attributions source attribution, default OSM attribution
     *  @param {LoadingStrategy} options.strategy loading strategy, default loadingstrategy.bbox
     */
    class Overpass extends VectorSource {
        constructor(options: {
            url: string;
            filter: string[];
            node: boolean;
            way: boolean;
            rel: boolean;
            maxResolution: number;
            attributions: string | Attribution | string[];
            strategy: LoadingStrategy;
        });
        /** Ovepass API Url
         */
        _url: any;
        /** Max resolution to load features
         */
        _maxResolution: any;
        /** Overwrite Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
    /**
    * @constructor source.WikiCommons
    * @extends {VectorSource}
    * @param {olx.source.WikiCommons=} options
     */
    class WikiCommons extends VectorSource {
        constructor(options?: VectorSourceOptions);
        /** Max resolution to load features
         */
        _maxResolution: any;
        /** Result language
         */
        _lang: any;
        /** Query limit
         */
        _limit: any;
        /** Decode wiki attributes and choose to add feature to the layer
        * @param {feature} the feature
        * @param {attributes} wiki attributes
        * @return {boolean} true: add the feature to the layer
        * @API stable
         */
        readFeature(featue: Feature, attibute: AttributionLike): boolean;
        /** Overwrite #Vector clear to fire clearstart / clearend event
         */
        clear(): void;
    }
}
/** A control is a visible widget with a DOM element in a fixed position on the screen.
 * They can involve user input (buttons), or be informational only;
 * the position is determined using CSS. B
 * y default these are placed in the container with CSS class name ol-overlaycontainer-stopevent,
 * but can use any outside DOM element.
 * @namespace control
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_contrhtml}
 */
declare namespace control {
    /** Openlayers base class for controls.
     * A control is a visible widget with a DOM element in a fixed position on the screen.
     * They can involve user input (buttons), or be informational only; the position is determined using CSS.
     * @namespace ol_control_Control
     * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_control_Contrhtml}
     */
    /**
     * @classdesc
     *   Attribution Control integrated in the canvas (for jpeg/png
     * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
     *
     * @constructor
     * @extends {ol_control_Control}
     * @param {Object=} options extend the control options.
     *  @param {Style} options.style style used to draw the title.
     */
    class CanvasBase extends ol_control_Control {
        constructor(options?: {
            style: Style;
        });
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Set Style
         * @api
         */
        setStyle(style: Style): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /**
     * This is the base class for Select controls on attributes values.
     * Abstract base class;
     * normally only used for creating subclasses and not instantiated in apps.
     *
     * @constructor
     * @extends {contrControl}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Collection<Feature>} options.features a collection of feature to search in, the collection will be kept in date while selection
     *  @param {Vector | Array<Vector>} options.source the source to search in if no features set
     */
    class SelectBase extends ol_control_Control {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            features: Collection<Feature>;
            source: VectorSource | VectorSource[];
        });
        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
        /** Select features by attributes
         * @param {*} options
         *  @param {Array<Vector|undefined} options.sources source to apply rules, default the select sources
         *  @param {bool} options.useCase case sensitive, default false
         *  @param {bool} options.matchAll match all conditions, default false
         *  @param {Array<conditions>} options.conditions array of conditions
         * @return {Array<Feature>}
         * @fires select
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];
    }
    /**
     * Search Contr
     * This is the base class for search controls. You can use it for simple custom search or as base to new class.
     * @see contrSearchFeature
     * @see contrSearchPhoton
     *
     * @constructor
     * @extends {ol_control_Control}
     * @fires select
     * @fires change:input
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {string | undefined} options.label Text label to use for the search button, default "search"
     *  @param {string | undefined} options.placeholder placeholder, default "Search..."
     *  @param {string | undefined} options.inputLabel label for the input, default none
     *  @param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
     *  @param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
     *  @param {number | undefined} options.minLength minimum length to start searching, default 1
     *  @param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *  @param {number | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
     *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index.
     *  @param {function} options.autocomplete a function that take a search string and callback function to send an array
     */
    class Search extends ol_control_Control {
        constructor(options?: {
            className: string;
            target: Element | string | undefined;
            label: string | undefined;
            placeholder: string | undefined;
            inputLabel: string | undefined;
            noCollapse: string | undefined;
            typing: number | undefined;
            minLength: number | undefined;
            maxItems: number | undefined;
            maxHistory: number | undefined;
            getTitle: (...params: any[]) => any;
            autocomplete: (...params: any[]) => any;
        });
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Returns the text to be displayed in the menu
        *	@param {any} f feature to be displayed
        *	@return {string} the text to be displayed in the index, default f.name
        *	@api
         */
        getTitle(f: any): string;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Autocomplete function
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
        * @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
        * @api
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * This is the base class for search controls that use a json service to search features.
     * You can use it for simple custom search or as base to new class.
     *
     * @constructor
     * @extends {Search}
     * @fires select
     * @param {any} options extend contrSearch options
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 3
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
     *
     *	@param {string|undefined} options.url Url of the search api
     *	@param {string | undefined} options.authentication: basic authentication for the search API as btoa("login:pwd")
     */
    class SearchJSON extends Search {
        constructor(options: {
            className: string;
            target: Element | string | undefined;
            label: string | undefined;
            placeholder: string | undefined;
            typing: number | undefined;
            minLength: number | undefined;
            maxItems: number | undefined;
            handleResponse: ((...params: any[]) => any) | undefined;
            url: string | undefined;
            authentication: string | undefined;
        });
        /** Autocomplete function (ajax request to the server)
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Send an ajax request (GET)
         * @param {string} url
         * @param {function} onsuccess callback
         * @param {function} onerror callback
         */
        ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
        /**
         * @param {string} s the search string
         * @return {Object} request data (as key:value)
         * @api
         */
        requestData(s: string): any;
        /**
         * Handle server response to pass the features array to the display list
         * @param {any} response server response
         * @return {Array<any>} an array of feature
         * @api
         */
        handleResponse(response: any): any[];
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Returns the text to be displayed in the menu
        *	@param {any} f feature to be displayed
        *	@return {string} the text to be displayed in the index, default f.name
        *	@api
         */
        getTitle(f: any): string;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search places using the photon API.
     *
     * @constructor
     * @extends {contrSearchJSON}
     * @fires select
     * @param {Object=} Control options.
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 3
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
     *
     *	@param {string|undefined} options.url Url to photon api, default "http://photon.komoot.de/api/"
     *	@param {string|undefined} options.lang Force preferred language, default none
     *	@param {boolean} options.position Search, with priority to geo position, default false
     *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return street + name + contry
     */
    class SearchPhoton extends SearchJSON {
        constructor(Control?: any);
        /** Returns the text to be displayed in the menu
        *	@param {Feature} f the feature
        *	@return {string} the text to be displayed in the index
        *	@api
         */
        getTitle(f: Feature): string;
        /**
         * @param {string} s the search string
         * @return {Object} request data (as key:value)
         * @api
         */
        requestData(s: string): any;
        /**
         * Handle server response to pass the features array to the list
         * @param {any} response server response
         * @return {Array<any>} an array of feature
         */
        handleResponse(response: any): any[];
        /** Prevent same feature to be drawn twice: test equality
         * @param {} f1 First feature to compare
         * @param {} f2 Second feature to compare
         * @return {boolean}
         * @api
         */
        equalFeatures(f1: any, f2: any): boolean;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Autocomplete function (ajax request to the server)
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Send an ajax request (GET)
         * @param {string} url
         * @param {function} onsuccess callback
         * @param {function} onerror callback
         */
        ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
    }
    type AddressType = 'StreetAddress' | 'PositionOfInterest' | 'CadastralParcel' | 'Commune';

    /**
     * Search places using the French National Base Address (BAN) API.
     *
     * @constructor
     * @extends {contrSearchJSON}
     * @fires select
     * @param {any} options extend contrSearchJSON options
     *	@param {string} options.className control class name
     *	@param {boolean | undefined} options.apiKey the service api key.
     *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 3
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *
     *	@param {StreetAddress|PositionOfInterest|CadastralParcel|Commune} options.type type of search. Using Commune will return the INSEE code, default StreetAddress,PositionOfInterest
     * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
     */
    class SearchGeoportail extends SearchJSON {
        constructor(options: {
            className: string;
            apiKey: boolean | undefined;
            authentication: string | undefined;
            target: Element | string | undefined;
            label: string | undefined;
            placeholder: string | undefined;
            typing: number | undefined;
            minLength: number | undefined;
            maxItems: number | undefined;
            type: AddressType;
        });
        /** Returns the text to be displayed in the menu
         *	@param {Feature} f the feature
         *	@return {string} the text to be displayed in the index
         *	@api
         */
        getTitle(f: Feature): string;
        /**
         * @param {string} s the search string
         * @return {Object} request data (as key:value)
         * @api
         */
        requestData(s: string): any;
        /**
         * Handle server response to pass the features array to the display list
         * @param {any} response server response
         * @return {Array<any>} an array of feature
         * @api
         */
        handleResponse(response: any): any[];
        /** A ligne has been clicked in the menu > dispatch event
         *	@param {any} f the feature, as passed in the autocomplete
         *	@api
         */
        select(f: any): void;
        /** Search if no position and get the INSEE code
         * @param {string} s le nom de la commune
         */
        searchCommune(s: string): void;
        /** Autocomplete function (ajax request to the server)
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Send an ajax request (GET)
         * @param {string} url
         * @param {function} onsuccess callback
         * @param {function} onerror callback
         */
        ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * @classdesc OpenLayers 3 Layer Switcher Contr
     * @fires drawlist
     * @fires toggle
     *
     * @constructor
     * @extends {ol_control_Control}
     * @param {Object=} options
     *  @param {function} options.displayInLayerSwitcher function that takes a layer and return a boolean if the layer is displayed in the switcher, default test the displayInLayerSwitcher layer attribute
     *  @param {boolean} options.show_progress show a progress bar on tile layers, default false
     *  @param {boolean} options.mouseover show the panel on mouseover, default false
     *  @param {boolean} options.reordering allow layer reordering, default true
     *  @param {boolean} options.trash add a trash button to delete the layer, default false
     *  @param {function} options.oninfo callback on click on info button, if none no info button is shown DEPRECATED: use on(info) instead
     *  @param {boolean} options.Extent add an Extent button to zoom to the Extent of the layer
     *  @param {function} options.onExtent callback when click on Extent, default fits view to Extent
     *  @param {number} options.drawDelay delay in ms to redraw the layer (usefull to prevent flickering when manipulating the layers)
     *  @param {boolean} options.collapsed collapse the layerswitcher at beginning, default true
     *
     * Layers attributes that control the switcher
     *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
     *	- displayInLayerSwitcher {boolean} display in switcher, default true
     *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
     */
    class LayerSwitcher extends ol_control_Control {
        constructor(options?: {
            displayInLayerSwitcher: (...params: any[]) => any;
            show_progress: boolean;
            mouseover: boolean;
            reordering: boolean;
            trash: boolean;
            oninfo: (...params: any[]) => any;
            Extent: boolean;
            onExtent: (...params: any[]) => any;
            drawDelay: number;
            collapsed: boolean;
        });
        /** List of tips for internationalization purposes
         */
        tip: any;
        /** Test if a layer should be displayed in the switcher
         * @param {layer} layer
         * @return {boolean} true if the layer is displayed
         */
        displayInLayerSwitcher(layer: Layer): boolean;
        /**
         * Set the map instance the control is associated with.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Show control
         */
        show(): void;
        /** Hide control
         */
        hide(): void;
        /** Toggle control
         */
        toggle(): void;
        /** Is control open
         * @return {boolean}
         */
        isOpen(): boolean;
        /** Add a custom header
         * @param {Element|string} html content html
         */
        setHeader(html: Element | string): void;
        /** Calculate overflow and add scrolls
         *	@param {Number} dir scroll direction -1|0|1|'+50%'|'-50%'
         */
        overflow(dir: number): void;
        /** Set the layer associated with a li
         * @param {Element} li
         * @param {layer} layer
         */
        _setLayerForLI(li: Element, layer: Layer): void;
        /** Get the layer associated with a li
         * @param {Element} li
         * @return {Layer}
         */
        _getLayerForLI(li: Element): Layer;
        /**
         *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
         */
        drawPanel(): void;
        /** Change layer visibility according to the baselayer option
         * @param {Layer}
         * @param {Array<layer>} related layers
         */
        switchLayerVisibility(l: Layer, related: Layer[]): void;
        /** Check if Layer is on the map (depending on zoom and Extent)
         * @param {Layer}
         * @return {boolean}
         */
        testLayerVisibility(layer: Layer): boolean;
        /** Render a list of layer
         * @param {Elemen} element to render
         * @layers {Array{layer}} list of layer to show
         * @api stable
         */
        drawList(element: Element): void;
    }
    type position = 'top' | 'left' | 'bottom' | 'right';

    /** Control bar for OL3
     * The control bar is a container for other controls. It can be used to create toolbars.
     * Control bars can be nested and combined with contrToggle to handle activate/deactivate.
     *
     * @constructor
     * @extends {contrControl}
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {bool} options.group is a group, default false
     *	@param {bool} options.toggleOne only one toggle control is active at a time, default false
     *	@param {bool} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
     *	@param {Array<_ol_control_>} options.controls a list of control to add to the bar
     */
    class Bar extends ol_control_Control {
        constructor(options?: {
            className: string;
            group: boolean;
            toggleOne: boolean;
            autoDeactivate: boolean;
            controls: ol_control_Control[];
        });
        /** Set the control visibility
        * @param {boolean} b
         */
        setVisible(b: boolean): void;
        /** Get the control visibility
        * @return {boolean} b
         */
        getVisible(): boolean;
        /**
         * Set the map instance the control is associated with
         * and add its controls associated to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get controls in the panel
        *	@param {Array<_ol_control_>}
         */
        getControls(): void;
        /** Set tool bar position
        *	@param {top|left|bottom|right} pos
         */
        setPosition(pos: position): void;
        /** Add a control to the bar
        *	@param {_ol_control_} c control to add
         */
        addControl(c: ol_control_Control): void;
        /** Deativate all controls in a bar
        * @param {_ol_control_} except a control
         */
        deactivateControls(except: ol_control_Control): void;
        /** Auto activate/deactivate controls in the bar
        * @param {boolean} b activate/deactivate
         */
        setActive(b: boolean): void;
        /** Post-process an activated/deactivated control
        *	@param {Event} e :an object with a target {ol_control_Control} and active flag {boolean}
         */
        onActivateControl_(e: Event): void;
        /**
         * @param {string} name of the control to search
         * @return {ol_control_Control}
         */
        getControlsByName(name: string): ol_control_Control;
    }
    /** A simple push button control
    * @constructor
    * @extends {contrControl}
    * @param {Object=} options Control options.
    *	@param {String} options.className class of the control
    *	@param {String} options.title title of the control
    *	@param {String} options.name an optional name, default none
    *	@param {String} options.html html to insert in the control
    *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
     */
    class Button extends ol_control_Control {
        constructor(options?: {
            className: string;
            title: string;
            name: string;
            html: string;
            handleClick: (...params: any[]) => any;
        });
        /** Set the control visibility
        * @param {boolean} b
         */
        setVisible(b: boolean): void;
        /**
         * Set the button title
         * @param {string} title
         * @returns {undefined}
         */
        setTitle(title: string): undefined;
        /**
         * Set the button html
         * @param {string} html
         * @returns {undefined}
         */
        setHtml(html: string): undefined;
    }
    /**
     * @classdesc
     *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png
     * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
     *
     * @constructor
     * @extends {contrAttribution}
     * @param {Object=} options extend the contrAttribution options.
     * 	@param {Style} options.style  option is usesd to draw the text.
     */
    class CanvasAttribution extends ol_control_Attribution {
        constructor(options?: {
            style: Style;
        });
        /**
         * Draw attribution on canvas
         * @param {boolean} b draw the attribution on canvas.
         */
        setCanvas(b: boolean): void;
        /**
         * Change the control style
         * @param {Style} style
         */
        setStyle(style: Style): void;
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
    }
    /**
     * @classdesc
     *    OpenLayers 3 Scale Line Control integrated in the canvas (for jpeg/png
     * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
     *
     * @constructor
     * @extends {contrScaleLine}
     * @param {Object=} options extend the contrScaleLine options.
     * 	@param {Style} options.style used to draw the scale line (default is black/white, 10px Arial).
     */

    class CanvasScaleLine extends ol_control_ScaleLine {
        constructor(options?: {
            style: Style;
        });
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Change the control style
         * @param {Style} style
         */
        setStyle(style: Style): void;
    }
    /**
     * A title Control integrated in the canvas (for jpeg/png
     *
     * @constructor
     * @extends {contrCanvasBase}
     * @param {Object=} options extend the control options.
     *  @param {string} options.title the title, default 'Title'
     *  @param {Style} options.style style used to draw the title.
     */
    class CanvasTitle extends CanvasBase {
        constructor(options?: {
            title: string;
            style: Style;
        });
        /**
         * Change the control style
         * @param {Style} style
         */
        setStyle(style: Style): void;
        /**
         * Set the map title
         * @param {string} map title.
         * @api stable
         */
        setTitle(map: string): void;
        /**
         * Get the map title
         * @param {string} map title.
         * @api stable
         */
        getTitle(map: string): void;
        /**
         * Set control visibility
         * @param {bool} b
         * @api stable
         */
        setVisible(b: boolean): void;
        /**
         * Get control visibility
         * @return {bool}
         * @api stable
         */
        getVisible(): boolean;
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /**
     * A title Control integrated in the canvas (for jpeg/png
     *
     * @constructor
     * @extends {contrCanvasBase}
     * @param {Object=} options extend the control options.
     *  @param {string} options.className CSS class name
     *  @param {Style} options.style style used to draw in the canvas
     *  @param {ProjectionLike} options.projection	Projection. Default is the view projection.
     *  @param {Coordinate.CoordinateFormat} options.coordinateFormat A function that takes a Coordinate and transforms it into a string.
     *  @param {boolean} options.canvas true to draw in the canvas
     */
    class CenterPosition extends CanvasBase {
        constructor(options?: {
            className: string;
            style: Style;
            projection: ProjectionLike;
            coordinateFormat: CoordinateFormat;
            canvas: boolean;
        });
        /**
         * Change the control style
         * @param {Style} style
         */
        setStyle(style: Style): void;
        /**
         * Draw on canvas
         * @param {boolean} b draw the attribution on canvas.
         */
        setCanvas(b: boolean): void;
        /**
         * Set control visibility
         * @param {bool} b
         * @api stable
         */
        setVisible(b: boolean): void;
        /**
         * Get control visibility
         * @return {bool}
         * @api stable
         */
        getVisible(): boolean;
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /**
     * Draw a compass on the map. The position/Size of the control is defined in the css.
     *
     * @constructor
     * @extends {contrCanvasBase}
     * @param {Object=} options Control options. The style {Stroke} option is usesd to draw the text.
     *  @param {string} options.className class name for the control
     *  @param {Image} options.image an image, default use the src option or a default image
     *  @param {string} options.src image src, default use the image option or a default image
     *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
     *  @param {style.Stroke} options.style style to draw the lines, default draw no lines
     */
    class Compass extends CanvasBase {
        constructor(options?: {
            className: string;
            image: Image;
            src: string;
            rotateVithView: boolean;
            style: Stroke;
        });
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Set Style
         * @api
         */
        setStyle(): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /** A simple control to disable all actions on the map.
     * The control will create an invisible div over the map.
     * @constructor
     * @extends {contrControl}
     * @param {Object=} options Control options.
     *		@param {String} options.class class of the control
     *		@param {String} options.html html code to insert in the control
     *		@param {bool} options.on the control is on
     *		@param {function} options.toggleFn callback when control is clicked
     */
    class Disable extends ol_control_Control {
        constructor(options?: {
            class: string;
            html: string;
            on: boolean;
            toggleFn: (...params: any[]) => any;
        });
        /** Test if the control is on
         * @return {bool}
         * @api stable
         */
        isOn(): boolean;
        /** Disable all action on the map
         * @param {bool} b, default false
         * @api stable
         */
        disableMap(b: boolean): void;
    }
    /** Control bar for editing in a layer
     * @constructor
     * @extends {contrBar}
     * @fires info
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {String} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {boolean} options.edition false to remove the edition tools, default true
     *	@param {Object} options.interactions List of interactions to add to the bar
     *    ie. Select, Delete, Info, DrawPoint, DrawLine, DrawPolygon
     *    Each interaction can be an interaction or true (to get the default one) or false to remove it from bar
     *	@param {VectorSource} options.source Source for the drawn features.
     */
    class EditBar extends Bar {
        constructor(options?: {
            className: string;
            target: string;
            edition: boolean;
            interactions: any;
            source: VectorSource;
        });
        /**
         * Set the map instance the control is associated with
         * and add its controls associated to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get an interaction associated with the bar
         * @param {string} name
         */
        getInteraction(name: string): void;
        /** Get the option title
         */
        _getTitle(): void;
        /** Set the control visibility
        * @param {boolean} b
         */
        setVisible(b: boolean): void;
        /** Get the control visibility
        * @return {boolean} b
         */
        getVisible(): boolean;
        /** Get controls in the panel
        *	@param {Array<_ol_control_>}
         */
        getControls(): void;
        /** Set tool bar position
        *	@param {top|left|bottom|right} pos
         */
        setPosition(pos: position): void;
        /** Add a control to the bar
        *	@param {_ol_control_} c control to add
         */
        addControl(c: ol_control_Control): void;
        /** Deativate all controls in a bar
        * @param {_ol_control_} except a control
         */
        deactivateControls(except: ol_control_Control): void;
        /** Auto activate/deactivate controls in the bar
        * @param {boolean} b activate/deactivate
         */
        setActive(b: boolean): void;
        /** Post-process an activated/deactivated control
        *	@param {event} e :an object with a target {_ol_control_} and active flag {bool}
         */
        onActivateControl_(e: Event): void;
        /**
         * @param {string} name of the control to search
         * @return {contrControl}
         */
        getControlsByName(name: string): ol_control_Control;
    }
    /** A simple gauge control to display level information on the map.
     *
     * @constructor
     * @extends {contrControl}
     * @param {Object=} options Control options.
     *		@param {String} options.className class of the control
     *		@param {String} options.title title of the control
     *		@param {number} options.max maximum value, default 100;
     *		@param {number} options.val the value, default 0
     */
    class Gauge extends ol_control_Control {
        constructor(options?: {
            className: string;
            title: string;
            max: number;
            val: number;
        });
        /** Set the control title
        * @param {string} title
         */
        setTitle(title: string): void;
        /** Set/get the gauge value
        * @param {number|undefined} v the value or undefined to get it
        * @return {number} the value
         */
        val(v: number | undefined): number;
    }
    /** Bookmark positions on ol maps.
     *
     * @constructor
     * @extends {contrControl}
     * @fires add
     * @fires remove
     * @param {} options Geobookmark's options
     *  @param {string} options.className default ol-bookmark
     *  @param {string} options.placeholder input placeholder, default Add a new geomark...
     *  @param {bool} options.editable enable modification, default true
     *  @param {string} options.namespace a namespace to save the boolmark (if more than one on a page), default ol
     *  @param {Array<any>} options.marks a list of default bookmarks:
     * @see [Geobookmark example](../../examples/map.contrgeobookmark.html)
     * @example
    var bm = new GeoBookmark ({
      marks: {
        "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
        "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
      }
    });
     */
    class GeoBookmark extends ol_control_Control {
        constructor(options: {
            className: string;
            placeholder: string;
            editable: boolean;
            namespace: string;
            marks: any[];
        });
        /** Set bookmarks
        * @param {} bmark a list of bookmarks, default retreave in the localstorage
        * @example
        bm.setBookmarks({
          "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
          "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
        });
         */
        setBookmarks(bmark: any): void;
        /** Get Geo bookmarks
        * @return {any} a list of bookmarks : { BM1:{pos:Coordinates, zoom: number}, BM2:{pos:Coordinates, zoom: number} }
         */
        getBookmarks(): any;
        /** Remove a Geo bookmark
        * @param {string} name
         */
        removeBookmark(name: string): void;
        /** Add a new Geo bookmark (replace existing one if any)
        * @param {string} name name of the bookmark (display in the menu)
        * @param {Coordinate} position default current position
        * @param {number} zoom default current map zoom
        * @param {bool} permanent prevent from deletion, default false
         */
        addBookmark(name: string, position: Coordinate, zoom: number, permanent: boolean): void;
    }
    /** Control bar for OL3
     * The control bar is a container for other controls. It can be used to create toolbars.
     * Control bars can be nested and combined with contrToggle to handle activate/deactivate.
     *
     * @constructor
     * @extends {contrBar}
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {String} options.centerLabel label for center button, default center
     */
    class GeolocationBar extends Bar {
        constructor(options?: {
            className: string;
            centerLabel: string;
        });
        /** Get the interaction.GeolocationDraw associatedwith the bar
         *
         */
        getInteraction(): void;
        /** Set the control visibility
        * @param {boolean} b
         */
        setVisible(b: boolean): void;
        /** Get the control visibility
        * @return {boolean} b
         */
        getVisible(): boolean;
        /**
         * Set the map instance the control is associated with
         * and add its controls associated to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get controls in the panel
        *	@param {Array<_ol_control_>}
         */
        getControls(): void;
        /** Set tool bar position
        *	@param {top|left|bottom|right} pos
         */
        setPosition(pos: position): void;
        /** Add a control to the bar
        *	@param {_ol_control_} c control to add
         */
        addControl(c: ol_control_Control): void;
        /** Deativate all controls in a bar
        * @param {_ol_control_} except a control
         */
        deactivateControls(except: ol_control_Control): void;
        /** Auto activate/deactivate controls in the bar
        * @param {boolean} b activate/deactivate
         */
        setActive(b: boolean): void;
        /** Post-process an activated/deactivated control
        *	@param {event} e :an object with a target {_ol_control_} and active flag {bool}
         */
        onActivateControl_(e: Event): void;
        /**
         * @param {string} name of the control to search
         * @return {contrControl}
         */
        getControlsByName(name: string): ol_control_Control;
    }

    interface options {
        follow?: boolean,
        align: 'top' | 'bottom-left' | 'right',
        layers: Layer[],
        style: Style | Style[] | undefined
    }

    /**
     * OpenLayers 3 lobe Overview Contr
     * The globe can rotate with map (follow.)
     *
     * @constructor
     * @extends {contrControl}
     * @param {Object=} options Control options.
     * 	@param {boolean} follow follow the map when center change, default false
     * 	@param {top|bottom-left|right} align position as top-left, etc.
     * 	@param {Array<layer>} layers list of layers to display on the globe
     * 	@param {Style | Array.<Style> | undefined} style style to draw the position on the map , default a marker
     */
    class Globe extends ol_control_Control {
        constructor(options?: options);
        /**
         * Set the map instance the control associated with.
         * @param {Map} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Set the globe center with the map center
         */
        setView(): void;
        /** Get globe map
        *	@return {Map}
         */
        getGlobe(): _ol_Map_;
        /** Show/hide the globe
         */
        show(): void;
        /** Set position on the map
        *	@param {top|bottom-left|right}  align
         */
        setPosition(align: 'top' | 'bottom-left' | 'right'): void;
        /** Set the globe center
        * @param {Coordinate} center the point to center to
        * @param {boolean} show show a pointer on the map, defaylt true
         */
        setCenter(center: Coordinate, show: boolean): void;
    }
    /**
     * Draw a graticule on the map.
     *
     * @constructor
     * @extends {contrCanvasBase}
     * @param {Object=} _ol_control_ options.
     *  @param {projectionLike} options.projection projection to use for the graticule, default EPSG:4326
     *  @param {number} options.maxResolution max resolution to display the graticule
     *  @param {Style} options.style Style to use for drawing the graticule, default black.
     *  @param {number} options.step step beetween lines (in proj units), default 1
     *  @param {number} options.stepCoord show a coord every stepCoord, default 1
     *  @param {number} options.spacing spacing beetween lines (in px), default 40px
     *  @param {number} options.borderWidthwidth of the border (in px), default 5px
     *  @param {number} options.marginmargin of the border (in px), default 0px
     */
    class Graticule extends CanvasBase {
        constructor(_ol_control_?: any);
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Set Style
         * @api
         */
        setStyle(): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /**
     * Draw a grid reference on the map and add an index.
     *
     * @constructor
     * @extends {contrCanvasBase}
     * @fires select
     * @param {Object=} Control options.
     *  @param {Style} options.style Style to use for drawing the grid (stroke and text), default black.
     *  @param {number} options.maxResolution max resolution to display the graticule
     *  @param {Extent} options.Extent Extent of the grid, required
     *  @param {Size} options.Size number of lines and cols, required
     *  @param {number} options.margin margin to display text (in px), default 0px
     *  @param {VectorSource} options.source source to use for the index, default none (use setIndex to reset the index)
     *  @param {string | function} options.property a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
     *  @param {function|undefined} options.sortFeatures sort function to sort 2 features in the index, default sort on property option
     *  @param {function|undefined} options.indexTitle a function that takes a feature and return the title to display in the index, default the first letter of property option
     *  @param {string} options.filterLabel label to display in the search bar, default 'filter'
     */
    class GridReference extends CanvasBase {
        constructor(Control?: any);
        /** Returns the text to be displayed in the index
         * @param {Feature} f the feature
         * @return {string} the text to be displayed in the index
         * @api
         */
        getFeatureName(f: Feature): string;
        /** Sort function
         * @param {Feature} a first feature
         * @param {Feature} b second feature
         * @return {Number} 0 if a==b, -1 if a<b, 1 if a>b
         * @api
         */
        sortFeatures(a: Feature, b: Feature): number;
        /** Get the feature title
         * @param {Feature} f
         * @return the first letter of the eature name (getFeatureName)
         * @api
         */
        indexTitle(f: Feature): any;
        /** Display features in the index
         * @param { Array<Feature> | Collection<Feature> } features
         */
        setIndex(features: Feature[] | Collection<Feature>): void;
        /** Get reference for a coord
        *	@param {Coordinate} coords
        *	@return {string} the reference
         */
        getReference(coords: Coordinate): string;
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Set Style
         * @api
         */
        setStyle(): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /** Image line control
     *
     * @constructor
     * @extends {contrControl}
     * @fires select
     * @fires collapse
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {VectorSource} options.source a vector source that contains the images
     *	@param {function} options.getImage a function that gets a feature and return the image url, default return the img propertie
     *	@param {function} options.getTitle a function that gets a feature and return the title, default return an empty string
     *	@param {boolean} options.collapsed the line is collapse, default false
     *	@param {boolean} options.collapsible the line is collapsible, default false
     *	@param {number} options.maxFeatures the maximum image element in the line, default 100
     *	@param {boolean} options.hover select image on hover, default false
     *	@param {string|boolean} options.linkColor link color or false if no link, default false
     */
    class Imageline extends ol_control_Control {
        constructor(options?: {
            className: string;
            source: VectorSource;
            getImage: (...params: any[]) => any;
            getTitle: (...params: any[]) => any;
            collapsed: boolean;
            collapsible: boolean;
            maxFeatures: number;
            hover: boolean;
            linkColor: string | boolean;
        });
        /**
         * Remove the control from its current map and attach it to the new map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Set useExtent param and refresh the line
         * @param {boolean} b
         */
        useExtent(b: boolean): void;
        /** Is the line collapsed
         * @return {boolean}
         */
        isCollapsed(): boolean;
        /** Collapse the line
         * @param {boolean} b
         */
        collapse(b: boolean): void;
        /** Collapse the line
         */
        toggle(): void;
        /**
         * Get features
         * @return {Array<Feature>}
         */
        getFeatures(): Feature[];
        /**
         * Refresh the imageline with new data
         */
        refresh(): void;
        /** Center image line on a feature
         * @param {feature} feature
         * @param {boolean} scroll scroll the line to center on the image, default true
         * @api
         */
        select(feature: Feature, scroll: boolean): void;
    }
    /**
     * Geoportail isochrone Contr
     * @see https://geoservices.ign.fr/documentation/geoservices/isochrones.html
     * @constructor
     * @extends {contrControl}
     * @fires isochrone
     * @fires error
     * @param {Object=} options
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {string | undefined} options.inputLabel label for the input, default none
     *	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 1
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *	@param {number | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
     *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
     *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
     *
     *  @param {string} options.exclusions Exclusion list separate with a comma 'Toll,Tunnel,Bridge'
     */
    class IsochroneGeoportail extends ol_control_Control {
        constructor(options?: {
            className: string;
            target: Element | string | undefined;
            label: string | undefined;
            placeholder: string | undefined;
            inputLabel: string | undefined;
            noCollapse: string | undefined;
            typing: number | undefined;
            minLength: number | undefined;
            maxItems: number | undefined;
            maxHistory: number | undefined;
            getTitle: (...params: any[]) => any;
            autocomplete: (...params: any[]) => any;
            exclusions: string;
        });
        /**
         * Set the map instance the control is associated with
         * and add its controls associated to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Set the travel method
         * @param [string] method The method (time or distance)
         */
        setMethod(string?: any): void;
        /** Set mode
         * @param {string} mode The mode: 'car' or 'pedestrian', default 'car'
         */
        setMode(mode: string): void;
        /** Set direction
         * @param {string} direction The direction: 'direct' or 'reverse', default direct
         */
        setDirection(direction: string): void;
        /** Calculate an isochrone
         * @param {Coordinate} coord
         * @param {number|string} option A number as time (in second) or distance (in meter), depend on method propertie
         * or a string with a unit (s, mn, h for time or km, m)
         */
        search(coord: Coordinate, option: number | string): void;
    }
    /**
     * OpenLayers Layer Switcher Contr
     *
     * @constructor
     * @extends {contrLayerSwitcher}
     * @param {Object=} options Control options.
     */
    class LayerPopup extends LayerSwitcher {
        constructor(options?: any);
        /** Disable overflow
         */
        overflow(): void;
        /** Render a list of layer
         * @param {elt} element to render
         * @layers {Array{layer}} list of layer to show
         * @api stable
         */
        drawList(element: Element): void;
        /** List of tips for internationalization purposes
         */
        tip: any;
        /** Test if a layer should be displayed in the switcher
         * @param {layer} layer
         * @return {boolean} true if the layer is displayed
         */
        displayInLayerSwitcher(layer: Layer): boolean;
        /**
         * Set the map instance the control is associated with.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Show control
         */
        show(): void;
        /** Hide control
         */
        hide(): void;
        /** Toggle control
         */
        toggle(): void;
        /** Is control open
         * @return {boolean}
         */
        isOpen(): boolean;
        /** Add a custom header
         * @param {Element|string} html content html
         */
        setHeader(html: Element | string): void;
        /** Set the Layer associated with a li
         * @param {Element} li
         * @param {Layer} layer
         */
        _setLayerForLI(li: Element, layer: Layer): void;
        /** Get the layer associated with a li
         * @param {Element} li
         * @return {layer}
         */
        _getLayerForLI(li: Element): Layer;
        /**
         *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
         */
        drawPanel(): void;
        /** Change layer visibility according to the baselayer option
         * @param {layer}
         * @param {Array<layer>} related layers
         */
        switchLayerVisibility(l: Layer, related: Layer[]): void;
        /** Check if layer is on the map (depending on zoom and Extent)
         * @param {layer}
         * @return {boolean}
         */
        testLayerVisibility(layer: Layer): boolean;
    }
    /**
     * @classdesc OpenLayers Layer Switcher Contr
     * @require layer.getPreview
     *
     * @constructor
     * @extends {contrLayerSwitcher}
     * @param {Object=} options Control options.
     */
    class LayerSwitcherImage extends LayerSwitcher {
        constructor(options?: any);
        /** Render a list of layer
         * @param {elt} element to render
         * @layers {Array{layer}} list of layer to show
         * @api stable
         */
        drawList(element: Element): void;
        /** Disable overflow
         */
        overflow(): void;
        /** List of tips for internationalization purposes
         */
        tip: any;
        /** Test if a layer should be displayed in the switcher
         * @param {layer} layer
         * @return {boolean} true if the layer is displayed
         */
        displayInLayerSwitcher(layer: Layer): boolean;
        /**
         * Set the map instance the control is associated with.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Show control
         */
        show(): void;
        /** Hide control
         */
        hide(): void;
        /** Toggle control
         */
        toggle(): void;
        /** Is control open
         * @return {boolean}
         */
        isOpen(): boolean;
        /** Add a custom header
         * @param {Element|string} html content html
         */
        setHeader(html: Element | string): void;
        /** Set the layer associated with a li
         * @param {Element} li
         * @param {layer} layer
         */
        _setLayerForLI(li: Element, layer: Layer): void;
        /** Get the layer associated with a li
         * @param {Element} li
         * @return {layer}
         */
        _getLayerForLI(li: Element): Layer;
        /**
         *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
         */
        drawPanel(): void;
        /** Change layer visibility according to the baselayer option
         * @param {layer}
         * @param {Array<layer>} related layers
         */
        switchLayerVisibility(l: Layer, related: Layer[]): void;
        /** Check if layer is on the map (depending on zoom and Extent)
         * @param {layer}
         * @return {boolean}
         */
        testLayerVisibility(layer: Layer): boolean;
    }
    /** Create a legend for styles
     * @constructor
     * @fires select
     * @param {*} options
     *  @param {String} options.className class of the control
     *  @param {String} options.title Legend title
     *  @param {Size | undefined} options.Size Size of the symboles in the legend, default [40, 25]
     *  @param {number | undefined} options.margin Size of the symbole's margin, default 10
     *  @param {boolean | undefined} options.collapsed Specify if attributions should be collapsed at startup. Default is true.
     *  @param {boolean | undefined} options.collapsible Specify if attributions can be collapsed, default true.
     *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param { Style | Array<Style> | StyleFunction | undefined	} options.style a style or a style function to use with features
     * @extends {contrControl}
     */
    class Legend extends ol_control_Control {
        constructor(options: {
            className: string;
            title: string;
            Size: Size | undefined;
            margin: number | undefined;
            collapsed: boolean | undefined;
            collapsible: boolean | undefined;
            target: Element | string | undefined;
            style: StyleLike
        });
        /** Set the style
         * @param { Style | Array<Style> | StyleFunction | undefined	} style a style or a style function to use with features
         */
        setStyle(style: StyleLike | undefined): void;
        /** Add a new row to the legend
         * * You can provide in options:
         * - a feature width a style
         * - or a feature that will use the legend style function
         * - or properties ans a geometry type that will use the legend style function
         * - or a style and a geometry type
         * @param {*} options a list of parameters
         *  @param {Feature} options.feature a feature to draw
         *  @param {Style} options.style the style to use if no feature is provided
         *  @param {*} options.properties properties to use with a style function
         *  @param {string} options.typeGeom type geom to draw with the style or the properties
         */
        addRow(options: {
            feature: Feature;
            style: Style;
            properties: any;
            typeGeom: string;
        }): void;

        /** Add a new row to the legend
         * @param {*} options a list of parameters
         *  @param {} options.
         */
        removeRow(index: number): void;

        /** Get a legend row
         * @param {number} index
         * @return {*}
         */
        getRow(index: number): any;
        /** Get a legend row
         * @return {number}
         */
        getLength(): number;
        /** Refresh the legend
         */
        refresh(): void;
        /** Show control
         */
        show(): void;
        /** Hide control
         */
        hide(): void;
        /** Toggle control
         */
        toggle(): void;
        /** Get the image for a style
         * You can provide in options:
         * - a feature width a style
         * - or a feature that will use the legend style function
         * - or properties and a geometry type that will use the legend style function
         * - or a style and a geometry type
         * @param {*} options
         *  @param {Feature} options.feature a feature to draw
         *  @param {Style} options.style the style to use if no feature is provided
         *  @param {*} options.properties properties to use with a style function
         *  @param {string} options.typeGeom type geom to draw with the style or the properties
         * @param {Canvas|undefined} canvas a canvas to draw in
         * @param {number|undefined} row row number to draw in canvas
         * @return {CanvasElement}
         */
        getStyleImage(options: {
            feature: Feature;
            style: Style;
            properties: any;
            typeGeom: string;
        }, canvas: HTMLCanvasElement | undefined, row: number | undefined): HTMLCanvasElement;
    }
    /** A control to jump from one zone to another.
     *
     * @constructor
     * @fires select
     * @extends {contrControl}
     * @param {Object=} options Control options.
     *	@param {string} options.className class name
     *	@param {layer.Layer} options.layer layer to display in the control
     *	@param {ProjectionLike} options.projection projection of the control, Default is EPSG:3857 (Spherical Mercator).
     *  @param {Array<any>} options.zone an array of zone: { name, Extent (in EPSG:4326) }
     *  @param {bolean} options.centerOnClick center on click when click on zones, default true
     */
    class MapZone extends ol_control_Control {
        constructor(options?: {
            className: string;
            layer: Layer;
            projection: ProjectionLike;
            zone: any[];
            centerOnClick: boolean;
        });
        /** Set the control visibility
        * @param {boolean} b
         */
        setVisible(b: boolean): void;
        /** Pre-defined zones
         */
        static zones: any;
    }
    /** Control overlay for OL3
     * The overlay control is a control that display an overlay over the map
     *
     * @constructor
     * @extends {contrControl}
     * @fire change:visible
     * @param {Object=} options Control options.
     *  @param {string} className class of the control
     *  @param {boolean} hideOnClick hide the control on click, default false
     *  @param {boolean} closeBox add a closeBox to the control, default false
     */
    class Notification extends ol_control_Control {
        constructor(options?: { className: string, hideOnClick: boolean, closeBox: boolean });
        /**
         * Display a notification on the map
         * @param {string|node|undefined} what the notification to show, default get the last one
         * @param {number} [duration=3000] duration in ms, if -1 never hide
         */
        show(what: string | Node | undefined, duration?: number): void;
        /**
         * Remove a notification on the map
         */
        hide(): void;
        /**
         * Toggle a notification on the map
         * @param {number} [duration=3000] duration in ms
         */
        toggle(duration?: number): void;
    }
    /** Control overlay for OL3
     * The overlay control is a control that display an overlay over the map
     *
     * @constructor
     * @extends {contrControl}
     * @fire change:visible
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {String|Element} options.content
     *	@param {bool} options.hideOnClick hide the control on click, default false
     *	@param {bool} options.closeBox add a closeBox to the control, default false
     */
    class Overlay extends ol_control_Control {
        constructor(options?: {
            className: string;
            content: string | Element;
            hideOnClick: boolean;
            closeBox: boolean;
        });
        /** Set the content of the overlay
        * @param {string|Element} html the html to display in the control
         */
        setContent(html: string | Element): void;
        /** Set the control visibility
        * @param {string|Element} html the html to display in the control
        * @param {Coordinate} coord coordinate of the top left corner of the control to start from
         */
        show(html: string | Element, coord: Coordinate): void;
        /** Set the control visibility hidden
         */
        hide(): void;
        /** Toggle control visibility
         */
        toggle(): void;
        /** Get the control visibility
        * @return {boolean} b
         */
        getVisible(): boolean;
        /** Change class name
        * @param {String} className a class name or a list of class names separated by a space
         */
        setClass(className: string): void;
    }
    /**
     * OpenLayers 3 Layer Overview Contr
     * The overview can rotate with map.
     * Zoom levels are configurable.
     * Click on the overview will center the map.
     * Change width/height of the overview trough css.
     *
     * @constructor
     * @extends {contrControl}
     * @param {Object=} options Control options.
     *  @param {ProjectionLike} options.projection The projection. Default is EPSG:3857 (Spherical Mercator).
     *  @param {Number} options.minZoom default 0
     *  @param {Number} options.maxZoom default 18
     *  @param {boolean} options.rotation enable rotation, default false
     *  @param {top|bottom-left|right} options.align position
     *  @param {Array<layer>} options.layers list of layers
     *  @param {Style | Array.<Style> | undefined} options.style style to draw the map Extent on the overveiw
     *  @param {bool|elastic} options.panAnimation use animation to center map on click, default true
     */
    class Overview extends ol_control_Control {
        constructor(options?: {
            projection: ProjectionLike;
            minZoom: number;
            maxZoom: number;
            rotation: boolean;
            align: 'top' | 'bottom-left' | 'right';
            layers: Layer[];
            style: Style | Style[] | undefined;
            panAnimation: boolean | 'elastic';
        });
        /** Elastic bounce
         *	@param {number} bounce number of bounce
         *	@param {Number} amplitude amplitude of the bounce [0,1]
         *	@return {Number}
         * /
          var bounceFn = function (bounce, amplitude){
            var a = (2*bounce+1) * Math.PI/2;
            var b = amplitude>0 ? -1/amplitude : -100;
            var c = - Math.cos(a) * Math.pow(2, b);
            return function(t) {
              t = 1-Math.cos(t*Math.PI/2);
              return 1 + Math.abs( Math.cos(a*t) ) * Math.pow(2, b*t) + c*t;
            }
          }
          /** Elastic bounce
         *	@param {number} bounce number of bounce
         *	@param {Number} amplitude amplitude of the bounce [0,1]
         *	@return {Number}
         */
        elasticFn(bounce: number, amplitude: number): void;
        /** Get overview map
        *	@return {Map}
         */
        getOverviewMap(): _ol_Map_;
        /** Toggle overview map
         */
        toggleMap(): void;
        /** Set overview map position
        *	@param {top|bottom-left|right}
         */
        setPosition(align: 'top' | 'bottom-left' | 'right'): void;
        /**
         * Set the map instance the control associated with.
         * @param {Map} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Calculate the Extent of the map and draw it on the overview
         */
        calcExtent_(): void;
    }
    /**
     * Permalink Contr
     *
     *	Add a `permalink`property to layers to be handled by the control (and added in the url).
     *  The layer's permalink property is used to name the layer in the url.
     *	The control must be added after all layer are inserted in the map to take them into acount.
     *
     * @constructor
     * @extends {contrControl}
     * @param {Object=} options
     *	@param {bool} options.urlReplace replace url or not, default true
     *	@param {number} options.fixed number of digit in coords, default 6
     *	@param {bool} options.anchor use "#" instead of "?" in href
     *	@param {bool} options.hidden hide the button on the map, default false
     *	@param {function} options.onclick a function called when control is clicked
     */
    class Permalink extends ol_control_Control {
        constructor(options?: {
            urlReplace: boolean;
            fixed: number;
            anchor: boolean;
            hidden: boolean;
            onclick: (...params: any[]) => any;
        });
        /**
         * Set the map instance the control associated with.
         * @param {Map} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get layer given a permalink name (permalink propertie in the layer)
        *	@param {string} the permalink to search for
        *	@param {Array<layer>|undefined} an array of layer to search in
        *	@return {layer|false}
         */
        getLayerByLink(the: string, an: Layer[] | undefined): Layer | false;
        /** Set map position according to the current link
         */
        setPosition(): void;
        /**
         * Get the parameters added to the url. The object can be changed to add new values.
         * @return {Object} a key value object added to the url as &key=value
         * @api stable
         */
        getUrlParams(): any;
        /**
         * Set a parameter to the url.
         * @param {string} key the key parameter
         * @param {string|undefined} value the parameter's value, if undefined or empty string remove the parameter
         * @api stable
         */
        setUrlParam(key: string, value: string | undefined): void;
        /**
         * Get a parameter url.
         * @param {string} key the key parameter
         * @return {string} the parameter's value or empty string if not set
         * @api stable
         */
        getUrlParam(key: string): string;
        /**
         * Has a parameter url.
         * @param {string} key the key parameter
         * @return {boolean}
         * @api stable
         */
        hasUrlParam(key: string): boolean;
        /**
         * Get the permalink
         * @return {permalink}
         */
        getLink(): string;
        /**
         * Enable / disable url replacement (replaceSate)
         *	@param {bool}
         */
        setUrlReplace(replace: boolean): void;
    }
    /** Print control to get an image of the map
     *
     * @constructor
     * @fire print
     * @fire error
     * @fire printing
     * @extends {contrControl}
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {string} options.imageType A string indicating the image format, default image/jpeg
     *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
     *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
     */
    class Print extends ol_control_Control {
        constructor(options?: {
            className: string;
            imageType: string;
            quality: number;
            orientation: string;
        });
        /** Print the map
         * @param {function} cback a callback function that take a string containing the requested data URI.
         * @param {Object} options
         *	@param {string} options.imageType A string indicating the image format, default the control one
         *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
         *  @param {boolean} options.immediate true to prevent delay for printing
         *  @param {*} options.any any options passed to the print event when fired
         * @api
         */
        print(cback: (...params: any[]) => any, options: {
            imageType: string;
            quality: number;
            immediate: boolean;
            any: any;
        }): void;
    }
    /**
     * @classdesc OpenLayers 3 Profil Contr
     *	Draw a profil of a feature (with a 3D geometry)
     *
     * @constructor
     * @extends {contrControl}
     * @fires  over, out, show
     * @param {Object=} _ol_control_ opt_options.
     *
     */
    class Profil extends ol_control_Control {
        constructor(_ol_control_?: any);
        /** Custom infos list
        * @api stable
         */
        info: any;
        /** Show popup info
        * @param {string} info to display as a popup
        * @api stable
         */
        popup(info: string): void;
        /** Mouse move over canvas
         */
        onMove(): void;
        /** Show panel
        * @api stable
         */
        show(): void;
        /** Hide panel
        * @api stable
         */
        hide(): void;
        /** Toggle panel
        * @api stable
         */
        toggle(): void;
        /** Is panel visible
         */
        isShown(): void;
        /**
         * Set the geometry to draw the profil.
         * @param {Feature|geom} f the feature.
         * @param {Object=} options
         *		- projection {ProjectionLike} feature projection, default projection of the map
         *		- zunit {m|km} default m
         *		- unit {m|km} default km
         *		- zmin {Number|undefined} default 0
         *		- zmax {Number|undefined} default max Z of the feature
         *		- graduation {Number|undefined} z graduation default 100
         *		- amplitude {number|undefined} amplitude of the altitude, default zmax-zmin
         * @api stable
         */
        setGeometry(f: Feature | Geometry, options?: any): void;
        /** Get profil image
        * @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
        * @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
        * @return {string} requested data uri
        * @api stable
         */
        getImage(type: string | undefined, encoderOptions: number | undefined): string;
    }
    /**
     * Geoportail routing Contr
     * @constructor
     * @extends {contrControl}
     * @fires select
     * @fires change:input
     * @param {Object=} options
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {string | undefined} options.inputLabel label for the input, default none
     *	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 1
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *	@param {number | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
     *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
     *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
     */
    class RoutingGeoportail extends ol_control_Control {
        constructor(options?: {
            className: string;
            target: Element | string | undefined;
            label: string | undefined;
            placeholder: string | undefined;
            inputLabel: string | undefined;
            noCollapse: string | undefined;
            typing: number | undefined;
            minLength: number | undefined;
            maxItems: number | undefined;
            maxHistory: number | undefined;
            getTitle: (...params: any[]) => any;
            autocomplete: (...params: any[]) => any;
        });
        /**
         * Set the map instance the control is associated with
         * and add its controls associated to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Calculate route
         *
         */
        calculate(): void;
        /** Send an ajax request (GET)
         * @param {string} url
         * @param {function} onsuccess callback
         * @param {function} onerror callback
         */
        ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
    }
    /**
     * Scale Contr
     * A control to display the scale of the center on the map
     *
     * @constructor
     * @extends {contrControl}
     * @fires select
     * @fires change:input
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {string} options.ppi screen ppi, default 96
     * 	@param {string} options.editable make the control editable, default true
     */
    class Scale extends ol_control_Control {
        constructor(options?: {
            className: string;
            ppi: string;
            editable: string;
        });
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Display the scale
         */
        _showScale(): void;
        /** Format the scale 1/d
         * @param {Number} d
         * @return {string} formated string
         */
        formatScale(d: number): string;
        /** Set the current scale (will change the scale of the map)
         * @param {Number} value the scale factor
         */
        setScale(value: number): void;
    }
    /**
     * Search places using the French National Base Address (BAN) API.
     *
     * @constructor
     * @extends {contrSearch}
     * @fires select
     * @param {Object=} Control options.
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 3
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *
     *	@param {string|undefined} options.url Url to BAN api, default "https://api-adresse.data.gouv.fr/search/"
     *	@param {boolean} options.position Search, with priority to geo position, default false
     *	@param {function} options.getTitle a function that takes a feature and return the text to display in the menu, default return label attribute
     * @see {@link https://adresse.data.gouv.fr/api/}
     */
    class SearchBAN extends Search {
        constructor(Control?: any);
        /** Returns the text to be displayed in the menu
         *	@param {Feature} f the feature
         *	@return {string} the text to be displayed in the index
         *	@api
         */
        getTitle(f: Feature): string;
        /** A ligne has been clicked in the menu > dispatch event
         *	@param {any} f the feature, as passed in the autocomplete
         *	@api
         */
        select(f: any): void;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Autocomplete function
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
        * @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
        * @api
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search on DFCI grid.
     *
     * @constructor
     * @extends {contrSearch}
     * @fires select
     * @param {Object=} Control options.
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 1
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *
     *	@param {string | undefined} options.property a property to display in the index, default 'name'.
     *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property
     *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
     */
    class SearchDFCI extends Search {
        constructor(Control?: any);
        /** Autocomplete function
        * @param {string} s search string
        * @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
        * @api
         */
        autocomplete(s: string): any[] | false;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Returns the text to be displayed in the menu
        *	@param {any} f feature to be displayed
        *	@return {string} the text to be displayed in the index, default f.name
        *	@api
         */
        getTitle(f: any): string;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search features.
     *
     * @constructor
     * @extends {contrSearch}
     * @fires select
     * @param {Object=} Control options.
     *	@param {string} options.className control class name
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 1
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *
     *	@param {string | undefined} options.property a property to display in the index, default 'name'.
     *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property
     *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
     */
    class SearchFeature extends Search {
        constructor(Control?: any);
        /** No history avaliable on features
         */
        restoreHistory(): void;
        /** No history avaliable on features
         */
        saveHistory(): void;
        /** Returns the text to be displayed in the menu
        *	@param {Feature} f the feature
        *	@return {string} the text to be displayed in the index
        *	@api
         */
        getTitle(f: Feature): string;
        /** Return the string to search in
        *	@param {Feature} f the feature
        *	@return {string} the text to be used as search string
        *	@api
         */
        getSearchString(f: Feature): string;
        /** Get the source
        *	@return {VectorSource}
        *	@api
         */
        getSource(): VectorSource;
        /** Get the source
        *	@param {VectorSource} source
        *	@api
         */
        setSource(source: VectorSource): void;
        /** Autocomplete function
        * @param {string} s search string
        * @param {number} max max
        * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
        * @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
        * @api
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search on GPS coordinate.
     *
     * @constructor
     * @extends {contrSearch}
     * @fires select
     * @param {Object=} Control options.
     *  @param {string} options.className control class name
     *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {string | undefined} options.label Text label to use for the search button, default "search"
     *  @param {string | undefined} options.placeholder placeholder, default "Search..."
     *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
     *  @param {number | undefined} options.minLength minimum length to start searching, default 1
     *  @param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     */
    class SearchGPS extends Search {
        constructor(Control?: any);
        /** Autocomplete function
        * @param {string} s search string
        * @return {Array<any>|false} an array of search solutions
        * @api
         */
        autocomplete(s: string): any[] | false;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Returns the text to be displayed in the menu
        *	@param {any} f feature to be displayed
        *	@return {string} the text to be displayed in the index, default f.name
        *	@api
         */
        getTitle(f: any): string;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search places using the French National Base Address (BAN) API.
     *
     * @constructor
     * @extends {contrSearchJSON}
     * @fires select
     * @param {any} options extend contrSearchJSON options
     *	@param {string} options.className control class name
     *	@param {boolean | undefined} options.apiKey the service api key.
     *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 3
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *
     *	@param {Number} options.pageSize item per page for parcelle list paging, use -1 for no paging, default 5
     * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
     */
    class SearchGeoportailParcelle extends SearchJSON {
        constructor(options: {
            className: string;
            apiKey: boolean | undefined;
            authentication: string | undefined;
            target: Element | string | undefined;
            label: string | undefined;
            placeholder: string | undefined;
            typing: number | undefined;
            minLength: number | undefined;
            maxItems: number | undefined;
            pageSize: number;
        });
        /** Set the input parcelle
         * @param {*} p parcel
         * 	@param {string} p.Commune
         * 	@param {string} p.CommuneAbsorbee
         * 	@param {string} p.Section
         * 	@param {string} p.Numero
         * @param {boolean} search start a search
         */
        setParcelle(p: {
            Commune: string;
            CommuneAbsorbee: string;
            Section: string;
            Numero: string;
        }, search: boolean): void;
        /** Activate parcelle inputs
         * @param {bolean} b
         */
        activateParcelle(b: boolean): void;
        /** Autocomplete function (ajax request to the server)
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Send an ajax request (GET)
         * @param {string} url
         * @param {function} onsuccess callback
         * @param {function} onerror callback
         */
        ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
        /**
         * @param {string} s the search string
         * @return {Object} request data (as key:value)
         * @api
         */
        requestData(s: string): any;
        /**
         * Handle server response to pass the features array to the display list
         * @param {any} response server response
         * @return {Array<any>} an array of feature
         * @api
         */
        handleResponse(response: any): any[];
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Returns the text to be displayed in the menu
        *	@param {any} f feature to be displayed
        *	@return {string} the text to be displayed in the index, default f.name
        *	@api
         */
        getTitle(f: any): string;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** A ligne has been clicked in the menu > dispatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search places using the Nominatim geocoder from the OpenStreetmap project.
     *
     * @constructor
     * @extends {contrSearch}
     * @fires select
     * @param {Object=} Control options.
     *	@param {string} options.className control class name
     *	@param {boolean | undefined} options.polygon To get output geometry of results (in geojson format), default false.
     *	@param {viewbox | undefined} options.viewbox The preferred area to find search results. Any two corner points of the box are accepted in any order as long as they span a real box, default none.
     *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *	@param {string | undefined} options.label Text label to use for the search button, default "search"
     *	@param {string | undefined} options.placeholder placeholder, default "Search..."
     *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
     *	@param {number | undefined} options.minLength minimum length to start searching, default 3
     *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *
     *	@param {string|undefined} options.url URL to Nominatim API, default "https://nominatim.openstreetmap.org/search"
     * @see {@link https://wiki.openstreetmap.org/wiki/Nominatim}
     */
    class SearchNominatim extends Search {
        constructor(Control?: any);
        /** Returns the text to be displayed in the menu
         *	@param {Feature} f the feature
         *	@return {string} the text to be displayed in the index
         *	@api
         */
        getTitle(f: Feature): string;
        /**
         * @param {string} s the search string
         * @return {Object} request data (as key:value)
         * @api
         */
        requestData(s: string): any;
        /** A ligne has been clicked in the menu > dispatch event
         *	@param {any} f the feature, as passed in the autocomplete
         *	@api
         */
        select(f: any): void;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Autocomplete function
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
        * @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
        * @api
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Search places using the MediaWiki API.
     * @see https://www.mediawiki.org/wiki/API:Main_page
     *
     * @constructor
     * @extends {contrSearchJSON}
     * @fires select
     * @param {Object=} Control options.
     *  @param {string} options.className control class name
     *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {string | undefined} options.label Text label to use for the search button, default "search"
     *  @param {string | undefined} options.placeholder placeholder, default "Search..."
     *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
     *  @param {number | undefined} options.minLength minimum length to start searching, default 3
     *  @param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
     *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
     *
     *  @param {string|undefined} options.lang API language, default none
     */
    class SearchWikipedia extends SearchJSON {
        constructor(Control?: any);
        /** Returns the text to be displayed in the menu
        *	@param {Feature} f the feature
        *	@return {string} the text to be displayed in the index
        *	@api
         */
        getTitle(f: Feature): string;
        /** Set the current language
         * @param {string} lang the current language as ISO string (en, fr, de, es, it, ja, ...)
         */
        setLang(lang: string): void;
        /**
         * @param {string} s the search string
         * @return {Object} request data (as key:value)
         * @api
         */
        requestData(s: string): any;
        /**
         * Handle server response to pass the features array to the list
         * @param {any} response server response
         * @return {Array<any>} an array of feature
         */
        handleResponse(response: any): any[];
        /** A ligne has been clicked in the menu query for more info and disatch event
        *	@param {any} f the feature, as passed in the autocomplete
        *	@api
         */
        select(f: any): void;
        /** Autocomplete function (ajax request to the server)
        * @param {string} s search string
        * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
         */
        autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
        /** Send an ajax request (GET)
         * @param {string} url
         * @param {function} onsuccess callback
         * @param {function} onerror callback
         */
        ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
        /** Get the input field
        *	@return {Element}
        *	@api
         */
        getInputField(): Element;
        /** Force search to refresh
         */
        search(): void;
        /** Set the input value in the form (for initialisation purpose)
        *	@param {string} value
        *	@param {boolean} search to start a search
        *	@api
         */
        setInput(value: string, search: boolean): void;
        /** Save history (in the localstorage)
         */
        saveHistory(): void;
        /** Restore history (from the localstorage)
         */
        restoreHistory(): void;
        /**
         * Remove previous history
         */
        clearHistory(): void;
        /**
         * Get history table
         */
        getHistory(): void;
        /** Test if 2 features are equal
         * @param {any} f1
         * @param {any} f2
         * @return {boolean}
         */
        equalFeatures(f1: any, f2: any): boolean;
    }
    /**
     * Select Contr
     * A control to select features by attributes
     *
     * @constructor
     * @extends {contrSelectBase}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Vector | Array<Vector>} options.source the source to search in
     *  @param {string} [options.selectLabel=select] select button label
     *  @param {string} [options.addLabel=add] add button label
     *  @param {string} [options.caseLabel=case sensitive] case checkbox label
     *  @param {string} [options.allLabel=match all] match all checkbox label
     *  @param {string} [options.attrPlaceHolder=attribute]
     *  @param {string} [options.valuePlaceHolder=value]
     */
    class Select extends SelectBase {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            source: VectorSource | VectorSource[];
            selectLabel?: string;
            addLabel?: string;
            caseLabel?: string;
            allLabel?: string;
            attrPlaceHolder?: string;
            valuePlaceHolder?: string;
        });
        /** Add a new condition
         * @param {*} options
         * 	@param {string} options.attr attribute name
         * 	@param {string} options.op	operator
         * 	@param {string} options.val attribute value
         */
        addCondition(options: {
            attr: string;
            op: string;
            val: string;
        }): void;
        /** Get the condition list
         */
        getConditions(): void;
        /** Set the condition list
         */
        setConditions(): void;
        /** Get the conditions as string
         */
        getConditionsString(): void;
        /** Remove the ith condition
         * @param {number} i condition index
         */
        removeCondition(i: number): void;
        /** Select features by attributes
         * @param {*} options
         *  @param {Array<Vector|undefined} options.sources source to apply rules, default the select sources
         *  @param {bool} options.useCase case sensitive, default checkbox state
         *  @param {bool} options.matchAll match all conditions, , default checkbox state
         *  @param {Array<conditions>} options.conditions array of conditions
         * @fires select
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];
        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
    }
    /**
     * Select features by property using a popup
     *
     * @constructor
     * @extends {contrSelectBase}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Vector | Array<Vector>} options.source the source to search in
     *  @param {string} options.property property to select on
     *  @param {string} options.label control label
     *  @param {number} options.max max feature to test to get the values, default 10000
     *  @param {number} options.selectAll select all features if no option selected
     *  @param {string} options.type check type: checkbox or radio, default checkbox
     *  @param {number} options.defaultLabel label for the default radio button
     *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
     */
    class SelectCheck extends SelectBase {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            source: VectorSource | VectorSource[];
            property: string;
            label: string;
            max: number;
            selectAll: number;
            type: string;
            defaultLabel: number;
            onchoice: ((...params: any[]) => any) | undefined;
        });
        /**
        * Set the map instance the control associated with.
        * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Select features by attributes
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];        /** Set the popup values
         * @param {Object} options
         *  @param {Object} options.values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
         *  @param {boolean} options.sort sort values
         */
        setValues(options: {
            values: any;
            sort: boolean;
        }): void;
        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
    }

    interface condition {
        attr: string,
        op: string,
        val: string;
    }
    /**
     * Select features by property using a condition
     *
     * @constructor
     * @extends {contrSelectBase}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Vector | Array<Vector>} options.source the source to search in
     *  @param {string} options.label control label, default 'condition'
     *  @param {number} options.selectAll select all features if no option selected
     *  @param {condition|Array<condition>} options.condition conditions
     *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
     */
    class SelectCondition extends SelectBase {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            source: VectorSource | VectorSource[];
            label: string;
            selectAll: number;
            condition: condition | condition[];
            onchoice: ((...params: any[]) => any) | undefined;
        });
        /** Set condition to select on
         * @param {condition, Array<condition>} condition
         *  @param {string} attr property to select on
         *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
         *  @param {*} val value to select on
         */
        setCondition(condition: condition | condition[], attr: string, op: string, val: any): void;
        /** Add a condition to select on
         * @param {condition} condition
         *  @param {string} attr property to select on
         *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
         *  @param {*} val value to select on
         */
        addCondition(condition: condition, attr: string, op: string, val: any): void;
        /** Select features by condition
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
    }
    /**
     * Select features by property using a simple text input
     *
     * @constructor
     * @extends {contrSelectBase}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Vector | Array<Vector>} options.source the source to search in
     *  @param {string} options.property property to select on
     *  @param {function|undefined} options.onchoice function triggered the text change, default nothing
     */
    class SelectFulltext extends SelectBase {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            source: VectorSource | VectorSource[];
            property: string;
            onchoice: ((...params: any[]) => any) | undefined;
        });
        /** Select features by condition
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
    }
    /**
     * A multiselect contr
     * A container that manage other control Select
     *
     * @constructor
     * @extends {contrSelectBase}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Vector | Array<Vector>} options.source the source to search in
     *  @param {Array<contrSelectBase>} options.controls an array of controls
     */
    class SelectMulti extends SelectBase {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            source: VectorSource | VectorSource[];
            controls: SelectBase[];
        });
        /**
        * Set the map instance the control associated with.
        * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Add a new control
         * @param {contrSelectBase} c
         */
        addControl(c: SelectBase): void;
        /** Get select controls
         * @return {Aray<contrSelectBase>}
         */
        getControls(): Array<SelectBase>;
        /** Select features by condition
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];
        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
    }
    /**
     * Select features by property using a popup
     *
     * @constructor
     * @extends {contrSelectBase}
     * @fires select
     * @param {Object=} options
     *  @param {string} options.className control class name
     *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
     *  @param {Vector | Array<Vector>} options.source the source to search in
     *  @param {string} options.property property to select on
     *  @param {number} options.max max feature to test to get the values, default 10000
     *  @param {number} options.selectAll select all features if no option selected
     *  @param {string} options.defaultLabel label for the default selection
     *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
     */
    class SelectPopup extends SelectBase {
        constructor(options?: {
            className: string;
            target: Element | undefined;
            source: VectorSource | VectorSource[];
            property: string;
            max: number;
            selectAll: number;
            defaultLabel: string;
            onchoice: ((...params: any[]) => any) | undefined;
        });
        /**
        * Set the map instance the control associated with.
        * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Select features by attributes
         */
        doSelect(options: {
            useCase: boolean;
            matchAll: boolean;
            conditions: condition[];
        }): Feature[];        /** Set the popup values
         * @param {Object} values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
         */
        setValues(values: any): void;
        /** Set the current sources
         * @param {VectorSource|Array<VectorSource>|undefined} source
         */
        setSources(source: VectorSource | VectorSource[] | undefined): void;
        /** Set feature collection to search in
         * @param {Collection<Feature>} features
         */
        setFeatures(features: Collection<Feature>): void;
        /** Get feature collection to search in
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /** List of operators / translation
         * @api
         */
        operationsList: any;
        /** Escape string for regexp
         * @param {string} search
         * @return {string}
         */
        _escape(search: string): string;
        /** Selection features in a list of features
         * @param {Array<Feature>} result the current list of features
         * @param {Array<Feature>} features to test in
         * @param {Object} condition
         *  @param {string} condition.attr attribute name
         *  @param {string} condition.op operator
         *  @param {any} condition.val value to test
         * @param {boolean} all all conditions must be valid
         * @param {boolean} usecase use case or not when testing strings
         */
        _selectFeatures(result: Feature[], features: Feature[], condition: {
            attr: string;
            op: string;
            val: any;
        }, all: boolean, usecase: boolean): void;
        /** Get vector source
         * @return {Array<VectorSource>}
         */
        getSources(): VectorSource[];
    }
    function Status(): void;
    function Storymap(): void;
    /**
     * @classdesc Swipe Contr
     *
     * @constructor
     * @extends {contrControl}
     * @param {Object=} Control options.
     *	@param {layer} options.layers layer to swipe
     *	@param {layer} options.rightLayer layer to swipe on right side
     *	@param {string} options.className control class name
     *	@param {number} options.position position propertie of the swipe [0,1], default 0.5
     *	@param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
     */
    class Swipe extends ol_control_Control {
        constructor(Control?: any);
        /**
         * Set the map instance the control associated with.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Add a layer to clip
         *	@param {layer|Array<layer>} layer to clip
        *	@param {bool} add layer in the right part of the map, default left.
         */
        addLayer(layer: Layer | Layer[], add: boolean): void;
        /** Remove a layer to clip
         *	@param {layer|Array<layer>} layer to clip
         */
        removeLayer(layer: Layer | Layer[]): void;
    }
    /** contrTarget draw a target at the center of the map.
     * @constructor
     * @extends {contrCanvasBase}
     * @param {Object} options
     *  @param {Style|Array<Style>} options.style
     *  @param {string} options.composite composite operation = difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
     */
    class Target extends CanvasBase {
        constructor(options: {
            style: Style | Style[];
            composite: string;
        });
        /** Set the control visibility
         * @paraam {boolean} b
         */
        setVisible(): void;
        /** Get the control visibility
         * @return {boolean} b
         */
        getVisible(): boolean;
        /**
         * Remove the control from its current map and attach it to the new map.
         * Subclasses may set up event handlers to get notified about changes to
         * the map here.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get canvas overlay
         */
        getCanvas(): void;
        /** Set Style
         * @api
         */
        setStyle(): void;
        /** Get style
         * @api
         */
        getStyle(): void;
        /** Get stroke
         * @api
         */
        getStroke(): void;
        /** Get fill
         * @api
         */
        getFill(): void;
        /** Get stroke
         * @api
         */
        getTextStroke(): void;
        /** Get text fill
         * @api
         */
        getTextFill(): void;
        /** Get text font
         * @api
         */
        getTextFont(): void;
    }
    /** A simple push button control drawn as text
     * @constructor
     * @extends {contrButton}
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {String} options.title title of the control
     *	@param {String} options.html html to insert in the control
     *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
     */
    class TextButton extends Button {
        constructor(options?: {
            className: string;
            title: string;
            html: string;
            handleClick: (...params: any[]) => any;
        });
        /** Set the control visibility
        * @param {boolean} b
         */
        setVisible(b: boolean): void;
        /**
         * Set the button title
         * @param {string} title
         * @returns {undefined}
         */
        setTitle(title: string): undefined;
        /**
         * Set the button html
         * @param {string} html
         * @returns {undefined}
         */
        setHtml(html: string): undefined;
    }
    /** Timeline control
     *
     * @constructor
     * @extends {contrControl}
     * @fires select
     * @fires scroll
     * @fires collapse
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {Array<Feature>} options.features Features to show in the timeline
     *	@param {SourceImageOptions.vector} options.source class of the control
     *	@param {Number} options.interval time interval length in ms or a text with a format d, h, mn, s (31 days = '31d'), default none
     *	@param {String} options.maxWidth width of the time line in px, default 2000px
     *	@param {String} options.minDate minimum date
     *	@param {String} options.maxDate maximum date
     *	@param {Number} options.minZoom Minimum zoom for the line, default .2
     *	@param {Number} options.maxZoom Maximum zoom for the line, default 4
     *	@param {boolean} options.zoomButton Are zoom buttons avaliable, default false
     *	@param {function} options.getHTML a function that takes a feature and returns the html to display
     *	@param {function} options.getFeatureDate a function that takes a feature and returns its date, default the date propertie
     *	@param {function} options.endFeatureDate a function that takes a feature and returns its end date, default no end date
     *	@param {String} options.graduation day|month to show month or day graduation, default show only years
     *	@param {String} options.scrollTimeout Time in milliseconds to get a scroll event, default 15ms
     */
    class Timeline extends ol_control_Control {
        constructor(options?: {
            className: string;
            features: Feature[];
            source: VectorSource;
            interval: number;
            maxWidth: string;
            minDate: string;
            maxDate: string;
            minZoom: number;
            maxZoom: number;
            zoomButton: boolean;
            getHTML: (...params: any[]) => any;
            getFeatureDate: (...params: any[]) => any;
            endFeatureDate: (...params: any[]) => any;
            graduation: string;
            scrollTimeout: string;
        });
        /**
         * Set the map instance the control is associated with
         * and add interaction attached to it to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Add a button on the timeline
         * @param {*} button
         *  @param {string} button.className
         *  @param {title} button.className
         *  @param {Element|string} button.html Content of the element
         *  @param {function} button.click a function called when the button is clicked
         */
        addButton(button: {
            title: string;
            html: Element | string;
            click: (...params: any[]) => any;
        }): void;
        /** Set an interval
         * @param {number|string} length the interval length in ms or a farmatted text ie. end with y, 1d, h, mn, s (31 days = '31d'), default none
         */
        setInterval(length: number | string): void;
        /** Is the line collapsed
         * @return {boolean}
         */
        isCollapsed(): boolean;
        /** Collapse the line
         * @param {boolean} b
         */
        collapse(b: boolean): void;
        /** Collapse the line
         */
        toggle(): void;
        /** Set the features to display in the timeline
         * @param {Array<Features>|VectorSource} features An array of features or a vector source
         * @param {number} zoom zoom to draw the line default 1
         */
        setFeatures(features: Feature[] | VectorSource, zoom: number): void;
        /**
         * Get features
         * @return {Array<Feature>}
         */
        getFeatures(): Feature[];
        /**
         * Refresh the timeline with new data
         * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
         */
        refresh(zoom: number): void;
        /** Center timeline on a date
         * @param {Date|String|feature} feature a date or a feature with a date
         * @param {Object} options
         *  @param {boolean} options.anim animate scroll
         *  @param {string} options.position start, end or middle, default middle
         */
        setDate(feature: Date | string | Feature, options: {
            anim: boolean;
            position: string;
        }): void;
        /** Get the date of the center
         * @param {string} position start, end or middle, default middle
         * @return {Date}
         */
        getDate(position: string): Date;
    }
    /** A simple toggle control
     * The control can be created with an interaction to control its activation.
     *
     * @constructor
     * @extends {contrControl}
     * @fires change:active, change:disable
     * @param {Object=} options Control options.
     *	@param {String} options.className class of the control
     *	@param {String} options.title title of the control
     *	@param {String} options.html html to insert in the control
     *	@param {interaction} options.interaction interaction associated with the control
     *	@param {bool} options.active the control is created active, default false
     *	@param {bool} options.disable the control is created disabled, default false
     *	@param {contrBar} options.bar a subbar associated with the control (drawn when active if control is nested in a contrBar)
     *	@param {bool} options.autoActive the control will activate when shown in an contrBar, default false
     *	@param {function} options.onToggle callback when control is clicked (or use change:active event)
     */
    class Toggle extends ol_control_Control {
        constructor(options?: {
            className: string;
            title: string;
            html: string;
            interaction: Interaction;
            active: boolean;
            disable: boolean;
            bar: Bar;
            autoActive: boolean;
            onToggle: (...params: any[]) => any;
        });
        /**
         * Set the map instance the control is associated with
         * and add interaction attached to it to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get the subbar associated with a control
        * @return {contrBar}
         */
        getSubBar(): Bar;
        /**
         * Test if the control is disabled.
         * @return {bool}.
         * @api stable
         */
        getDisable(): boolean;
        /** Disable the contr If disable, the control will be deactivated too.
        * @param {bool} b disable (or enable) the control, default false (enable)
         */
        setDisable(b: boolean): void;
        /**
         * Test if the control is active.
         * @return {bool}.
         * @api stable
         */
        getActive(): boolean;
        /** Toggle control state active/deactive
         */
        toggle(): void;
        /** Change control state
        * @param {bool} b activate or deactivate the control, default false
         */
        setActive(b: boolean): void;
        /** Set the control interaction
        * @param {_ol_interaction_} i interaction to associate with the control
         */
        setInteraction(i: Interaction): void;
        /** Get the control interaction
        * @return {_ol_interaction_} interaction associated with the control
         */
        getInteraction(): Interaction;
    }
}
/** User actions that change the state of the map. Some are similar to controls,
 * but are not associated with a DOM element.
 * @namespace interaction
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_interaction.html}
 */
declare namespace interaction {
    /** Handles coordinates on the center of the viewport.
     * It can be used as abstract base class used for creating subclasses.
     * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
     * Only pointermove pointerup are concerned with it.
     * @constructor
     * @extends {Interaction}
     * @param {olx.interaction.InteractionOptions} options Options
     *  - targetStyle {Style|Array<Style>} a style to draw the target point, default cross style
     *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
     */
    class CenterTouch extends Interaction {
        constructor(options: {
            targetSTyle: Style | Style[],
            composite: string
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Activate or deactivate the interaction.
         * @param {boolean} active Active.
         * @observable
         * @api
         */
        setActive(active: boolean): void;
        /** Get the position of the target
         * @return {Coordinate}
         */
        getPosition(): Coordinate;
    }
    /** Clip interaction to clip layers in a circle
     * @constructor
     * @extends {interaction.Pointer}
     * @param {interaction.Clip.options} options flashlight  param
     *  @param {number} options.radius radius of the clip, default 100
     *	@param {layer|Array<layer>} options.layers layers to clip
     */
    class Clip extends Pointer {
        constructor(options: {
            radius: number;
            layers: Layer | Layer[];
        });
        /** Set the map > start postcompose
         */
        setMap(): void;
        /** Set clip radius
         *	@param {number} radius
         */
        setRadius(radius: number): void;
        /** Add a layer to clip
         *	@param {layer|Array<layer>} layer to clip
         */
        addLayer(layer: Layer | Layer[]): void;
        /** Remove a layer to clip
         *	@param {layer|Array<layer>} layer to clip
         */
        removeLayer(layer: Layer | Layer[]): void;
        /** Set position of the clip
        *	@param {Pixel|MapBrowserEvent}
         */
        setPosition(e: Pixel | MapBrowserEvent): void;
        /**
         * Activate or deactivate the interaction.
         * @param {boolean} active Active.
         * @observable
         * @api
         */
        setActive(active: boolean): void;
    }
    /** An interaction to copy/paste features on a map
     * @constructor
     * @fires focus
     * @fires copy
     * @fires paste
     * @extends {Interaction}
     * @param {Object} options Options
     *  @param {function} options.condition a function that take a mapBrowserEvent and return the actio nto perform: 'copy', 'cut' or 'paste', default Ctrl+C / Ctrl+V
     *  @param {Collection<Feature>} options.features list of features to copy
     *  @param {VectorSource | Array<VectorSource>} options.sources the source to copy from (used for cut), if not defined, it will use the destination
     *  @param {VectorSource} options.destination the source to copy to
     */
    class CopyPaste extends Interaction {
        constructor(options: {
            condition: (...params: any[]) => any;
            features: Collection<Feature>;
            sources: VectorSource | VectorSource[];
            destination: VectorSource;
        });
        /** Sources to cut feature from
         * @param { VectorSource | Array<VectorSource> } sources
         */
        setSources(sources: VectorSource | VectorSource[]): void;
        /** Get sources to cut feature from
         * @return { Array<VectorSource> }
         */
        getSources(): VectorSource[];
        /** Source to paste features
         * @param { VectorSource } source
         */
        setDestination(source: VectorSource): void;
        /** Get source to paste features
         * @param { VectorSource }
         */
        getDestination(): void;
        /** Get current feature to copy
         * @return {Array<Feature>}
         */
        getFeatures(): Feature[];
        /** Set current feature to copy
         * @param {Object} options
         *  @param {Array<Feature> | Collection<Feature>} options.features feature to copy, default get in the provided collection
         *  @param {boolean} options.cut try to cut feature from the sources, default false
         *  @param {boolean} options.silent true to send an event, default true
         */
        copy(options: {
            features: Feature[] | Collection<Feature>;
            cut: boolean;
            silent: boolean;
        }): void;
        /** Paste features
         * @param {Object} options
         *  @param {Array<Feature> | Collection<Feature>} features feature to copy, default get current features
         *  @param {VectorSource} options.destination Source to paste to, default the current source
         *  @param {boolean} options.silent true to send an event, default true
         */
        paste(options: {
            destination: VectorSource;
            silent: boolean;
        }, features: Feature[] | Collection<Feature>): void;
    }
    /** A Select interaction to delete features on click.
     * @constructor
     * @extends {Interaction}
     * @fires deletestart
     * @fires deleteend
     * @param {*} options interaction.Select options
     */
    class Delete extends Interaction {
        constructor(options: any);
        /** Get vector source of the map
         * @return {Array<VectorSource}
         */
        _getSources(): any;
        /** Delete features: remove the features from the map (from all layers in the map)
         * @param {Collection<Feature>|Array<Feature>} features The features to delete
         * @api
         */
        delete(features: Collection<Feature> | Feature[]): void;
    }
    /** Drag an overlay on the map
     * @constructor
     * @extends {interaction.Pointer}
     * @fires dragstart
     * @fires dragging
     * @fires dragend
     * @param {any} options
     *  @param {Overlay|Array<Overlay} options.overlays the overlays to drag
     */
    class DragOverlay extends Pointer {
        constructor(options: any);
        /** Add an overlay to the interacton
         * @param {Overlay} ov
         */
        addOverlay(ov: Overlay): void;
        /** Remove an overlay from the interacton
         * @param {Overlay} ov
         */
        removeOverlay(ov: Overlay): void;
    }
    /** Interaction to draw holes in a polygon.
     * It fires a drawstart, drawend event when drawing the hole
     * and a modifystart, modifyend event before and after inserting the hole in the feature geometry.
     * @constructor
     * @extends {Interaction}
     * @fires drawstart
     * @fires drawend
     * @fires modifystart
     * @fires modifyend
     * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
     * 	@param {Array<layer.Vector> | function | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
     * 	@param { Style | Array<Style> | StyleFunction | undefined }	Style for the selected features, default: default edit style
     */
    class DrawHole extends Interaction {
        constructor(options: {
            layers: Vector[] | ((...params: any[]) => any) | undefined;
        }, Style: StyleLike);
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Activate/deactivate the interaction
         * @param {boolean}
         * @api stable
         */
        setActive(b: boolean): void;
        /**
         * Remove last point of the feature currently being drawn
         * (test if points to remove before).
         */
        removeLastPoint(): void;
        /**
         * Get the current polygon to hole
         * @return {Feature}
         */
        getPolygon(): Feature;
    }
    /** Interaction rotate
     * @constructor
     * @extends {Interaction}
     * @fires drawstart, drawing, drawend, drawcancel
     * @param {olx.interaction.TransformOptions} options
     *  @param {Array<Layer>} source Destination source for the drawn features
     *  @param {Collection<Feature>} features Destination collection for the drawn features
     *  @param {Style | Array.<Style> | StyleFunction | undefined} style style for the sketch
     *  @param {number} sides number of sides, default 0 = circle
     *  @param { events.ConditionType | undefined } squareCondition A function that takes an MapBrowserEvent and returns a boolean to draw square features.
     *  @param { events.ConditionType | undefined } centerCondition A function that takes an MapBrowserEvent and returns a boolean to draw centered features.
     *  @param { bool } canRotate Allow rotation when centered + square, default: true
     *  @param { number } clickTolerance click tolerance on touch devices, default: 6
     *  @param { number } maxCircleCoordinates Maximum number of point on a circle, default: 100
     */
    class DrawRegular extends Interaction {
        constructor(options: {
            source: Layer[], features: Collection<Feature>, style: StyleLike, sides: number, squareCondition: EventsConditionType | undefined, centerCondition: EventsConditionType | undefined, canRotate: boolean, clickTolerance: number, maxCircleCoordinates: number
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Activate/deactivate the interaction
         * @param {boolean}
         * @api stable
         */
        setActive(b: boolean): void;
        /**
         * Reset the interaction
         * @api stable
         */
        reset(): void;
        /**
         * Set the number of sides.
         * @param {number} number of sides.
         * @api stable
         */
        setSides(number: number): void;
        /**
         * Allow rotation when centered + square
         * @param {bool}
         * @api stable
         */
        canRotate(b: boolean): void;
        /**
         * Get the number of sides.
         * @return {number} number of sides.
         * @api stable
         */
        getSides(): number;
        /** Default start angle array for each sides
         */
        startAngle: any;
        /** Get geom of the current drawing
        * @return {Polygon | Point}
         */
        getGeom_(): Polygon | Point;
        /** Draw sketch
        * @return {Feature} The feature being drawn.
         */
        drawSketch_(): Feature;
        /** Draw sketch (Point)
         */
        drawPoint_(): void;
        /**
         * @param {MapBrowserEvent} evt Map browser event.
         */
        handleEvent_(evt: MapBrowserEvent): void;
        /** Stop drawing.
         */
        finishDrawing(): void;
        /**
         * @param {MapBrowserEvent} evt Event.
         */
        handleMoveEvent_(evt: MapBrowserEvent): void;
        /** Start an new draw
         * @param {MapBrowserEvent} evt Map browser event.
         * @return {boolean} `false` to stop the drag sequence.
         */
        start_(evt: MapBrowserEvent): boolean;
        /** End drawing
         * @param {MapBrowserEvent} evt Map browser event.
         * @return {boolean} `false` to stop the drag sequence.
         */
        end_(evt: MapBrowserEvent): boolean;
    }
    /** Interaction DrawTouch :
     * @constructor
     * @extends {interaction.CenterTouch}
     * @param {olx.interaction.DrawOptions} options
     *	- source {VectorSource | undefined} Destination source for the drawn features.
     *	- type {GeometryType} Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
     *	- tap {boolean} enable on tap, default true
     *	Inherited params
     *  - targetStyle {Style|Array<Style>} a style to draw the target point, default cross style
     *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
     */
    class DrawTouch extends interaction.CenterTouch {
        constructor(options: {
            source: VectorSource | undefined
            type: GeometryType,
            tap: boolean,
            targetStyle: Style | Style[],
            composite: string
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Start drawing and add the sketch feature to the target layer.
        * The interaction.Draw.EventType.DRAWSTART event is dispatched before inserting the feature.
         */
        startDrawing(): void;
        /** Get geometry type
        * @return {GeometryType}
         */
        getGeometryType(): GeometryType;
        /** Start drawing and add the sketch feature to the target layer.
        * The interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
         */
        finishDrawing(): void;
        /** Add a new Point to the drawing
         */
        addPoint(): void;
        /** Remove last point of the feature currently being drawn.
         */
        removeLastPoint(): void;
        /**
         * Activate or deactivate the interaction.
         * @param {boolean} active Active.
         * @observable
         * @api
         */
        setActive(active: boolean): void;
        /** Get the position of the target
         * @return {Coordinate}
         */
        getPosition(): Coordinate;
    }
    /** Extend DragAndDrop choose drop zone + fires loadstart, loadend
     * @constructor
     * @extends {interaction.DragAndDrop}
     *	@fires loadstart, loadend, addfeatures
     *	@param {dropfile.options} flashlight options param
     *		- zone {string} selector for the drop zone, default document
     *		- projection {projection} default projection of the map
     *		- formatConstructors {Array<function(new:format.Feature)>|undefined} Format constructors, default [ format.GPX, format.GeoJSON, format.IGC, format.KML, format.TopoJSON ]
     *		- accept {Array<string>|undefined} list of eccepted format, default ["gpx","json","geojson","igc","kml","topojson"]
     */
    class DropFile extends DragAndDrop {
        constructor(options: {
            zone: string,
            projection: Projection,
            formatConstructors: FeatureFormat[]
            accept: Array<string> | undefined
        });
        /** Set the map
         */
        setMap(): void;
        /** Do somthing when over
         */
        onstop(): void;
        /** Do something when over
         */
        ondrop(): void;
    }
    /** A Select interaction to fill feature's properties on click.
     * @constructor
     * @extends {Interaction}
     * @fires setattributestart
     * @fires setattributeend
     * @param {*} options Extentinteraction.Select options
     *  @param {boolean} options.active activate the interaction on start, default true
     *  @param {boolean} options.cursor use a paint bucket cursor, default true
     * @param {*} properties The properties as key/value
     */
    class FillAttribute extends Interaction {
        constructor(options: {
            active: boolean;
            cursor: boolean;
        }, properties: any);
        /** Activate the interaction
         * @param {boolean} active
         */
        setActive(active: boolean): void;
        /** Set attributes
         * @param {*} properties The properties as key/value
         */
        setAttributes(properties: any): void;
        /** Set an attribute
         * @param {string} key
         * @param {*} val
         */
        setAttribute(key: string, val: any): void;
        /** get attributes
         * @return {*} The properties as key/value
         */
        getAttributes(): any;
        /** Get an attribute
         * @param {string} key
         * @return {*} val
         */
        getAttribute(key: string): any;
        /** Fill feature attributes
         * @param {Array<Feature>} features The features to modify
         * @param {*} properties The properties as key/value
         */
        fill(features: Feature[], properties: any): void;
    }
    /**
     * @constructor
     * @extends {interaction.Pointer}
     *	@param {flashlight.options} flashlight options param
     *		- color {Color} light color, default transparent
     *		- fill {Color} fill color, default rgba(0,0,0,0.8)
     *		- radius {number} radius of the flash
     */
    class Flashlight extends Pointer {
        constructor(options: {
            color: Color,
            fill: Color,
            radius: number
        });
        /** Set the map > start postcompose
         */
        setMap(): void;
        /** Set flashlight radius
         *	@param {number} radius
         */
        setRadius(radius: number): void;
        /** Set flashlight color
         *	@param {flashlight.options} flashlight options param
         *		- color {Color} light color, default transparent
         *		- fill {Color} fill color, default rgba(0,0,0,0.8)
         */
        setColor(options: {
            color: Color,
            fill: Color
        }): void;
        /** Set position of the flashlight
        *	@param {Pixel|MapBrowserEvent}
         */
        setPosition(e: Pixel | MapBrowserEvent): void;
        /** Postcompose function
         */
        postcompose_(): void;
    }
    /** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
     * @constructor
     * @fires focus
     * @extends {Interaction}
     */
    class FocusMap extends Interaction {
        /** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
         */
        setMap(): void;
    }
    /** Interaction to draw on the current geolocation
     *	It combines a draw with a Geolocation
     * @constructor
     * @extends {Interaction}
     * @fires drawstart, drawend, drawing, tracking, follow
     * @param {any} options
     *	@param { Collection.<Feature> | undefined } option.features Destination collection for the drawn features.
     *	@param { VectorSource | undefined } options.source Destination source for the drawn features.
     *	@param {GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon'), default LineString.
     *	@param {Number | undefined} options.minAccuracy minimum accuracy underneath a new point will be register (if no condition), default 20
     *	@param {function | undefined} options.condition a function that take a Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuraty < minAccuraty
     *	@param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
     *	@param {Number} options.tolerance tolerance to add a new point (in projection unit), use LineString.simplify() method, default 5
     *	@param {Number} options.zoom zoom for tracking, default 16
     *	@param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
     *	@param { Style | Array.<Style> | StyleFunction | undefined } options.style Style for sketch features.
     */
    class GeolocationDraw extends Interaction {
        constructor(options: {
            source: VectorSource | undefined;
            type: GeometryType;
            minAccuracy: number | undefined;
            condition: ((...params: any[]) => any) | undefined;
            attributes: any;
            tolerance: number;
            zoom: number;
            followTrack: boolean | 'auto' | 'position' | 'visible';
            style: StyleLike | undefined;
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Activate or deactivate the interaction.
        * @param {boolean} active
         */
        setActive(active: boolean): void;
        /** Reset drawing
         */
        reset(): void;
        /** Start tracking = setActive(true)
         */
        start(): void;
        /** Stop tracking = setActive(false)
         */
        stop(): void;
        /** Pause drawing
        * @param {boolean} b
         */
        pause(b: boolean): void;
        /** Is paused
        * @return {boolean} b
         */
        isPaused(): boolean;
        /** Enable following the track on the map
        * @param {boolean|auto|position|visible} follow,
        *	false: don't follow,
        *	true: follow (position+zoom),
        *	'position': follow only position,
        *	'auto': start following until user move the map,
        *	'visible': center when position gets out of the visible Extent
         */
        setFollowTrack(follow: boolean | 'auto' | 'position' | 'visible'): void;
    }
    /** Interaction hover do to something when hovering a feature
     * @constructor
     * @extends {Interaction}
     * @fires hover, enter, leave
     * @param {olx.interaction.HoverOptions}
     *	@param { string | undefined } options.cursor css cursor propertie or a function that gets a feature, default: none
     *	@param {function | undefined} optionsfeatureFilter filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
     *	@param {function | undefined} options.layerFilter filter a function with one argument, the layer to test. Return true to test the layer
     *	@param {number | undefined} options.hitTolerance Hit-detection tolerance in pixels.
     *	@param { function | undefined } options.handleEvent Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
     */
    class Hover extends Interaction {
        constructor(options: {
            cursor: string | undefined;
            layerFilter: ((...params: any[]) => any) | undefined;
            hitTolerance: number | undefined;
            handleEvent: ((...params: any[]) => any) | undefined;
        }, optionsfeatureFilter: ((...params: any[]) => any) | undefined);
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Set cursor on hover
         * @param { string } cursor css cursor propertie or a function that gets a feature, default: none
         * @api stable
         */
        setCursor(cursor: string): void;
        /** Feature filter to get only one feature
        * @param {function} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
         */
        setFeatureFilter(filter: (...params: any[]) => any): void;
        /** Feature filter to get only one feature
        * @param {function} filter a function with one argument, the layer to test. Return true to test the layer
         */
        setLayerFilter(filter: (...params: any[]) => any): void;
        /** Get features whenmove
        * @param {event} e "move" event
         */
        handleMove_(e: Event): void;
    }
    /** Interaction to handle longtouch events
     * @constructor
     * @extends {Interaction}
     * @param {olx.interaction.LongTouchOptions}
     * 	@param {function | undefined} options.handleLongTouchEvent Function handling "longtouch" events, it will receive a mapBrowserEvent.
     *	@param {interger | undefined} options.delay The delay for a long touch in ms, default is 1000
     */
    class LongTouch extends Interaction {
        constructor(options: {
            handleLongTouchEvent: ((...params: any[]) => any) | undefined;
            delay: number | undefined;
        });
    }
    /** Interaction for modifying feature geometries. Similar to the core ol/interaction/Modify.
     * The interaction is more suitable to use to handle feature modification: only features concerned
     * by the modification are passed to the events (instead of all feature with ol/interaction/Modify)
     * - the modifystart event is fired before the feature is modified (no points still inserted)
     * - the modifyend event is fired after the modification
     * - it fires a modifying event
     * @constructor
     * @extends {interaction.Pointer}
     * @fires modifystart
     * @fires modifying
     * @fires modifyend
     * @param {*} options
     *	@param {VectorSource|Array{VectorSource}} options.source a list of source to modify (configured with useSpatialIndex set to true)
     *  @param {Collection.<Feature>} options.features collection of feature to modify
     *  @param {number} options.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for editing. Default is 10.
     *  @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
     *  @param {Style | Array<Style> | undefined} options.style Style for the sketch features.
     *  @param {EventsConditionType | undefined} options.condition A function that takes an MapBrowserEvent and returns a boolean to indicate whether that event will be considered to add or move a vertex to the sketch. Default is events.condition.primaryAction.
     *  @param {EventsConditionType | undefined} options.deleteCondition A function that takes an MapBrowserEvent and returns a boolean to indicate whether that event should be handled. By default, events.condition.singleClick with events.condition.altKeyOnly results in a vertex deletion.
     *  @param {EventsConditionType | undefined} options.insertVertexCondition A function that takes an MapBrowserEvent and returns a boolean to indicate whether a new vertex can be added to the sketch features. Default is events.condition.always
     */
    class ModifyFeature extends Pointer {
        constructor(options: {
            features: Collection<Feature>;
            pixelTolerance: number;
            filter: ((...params: any[]) => any) | undefined;
            style: Style | Style[] | undefined;
            condition: EventsConditionType | undefined;
            deleteCondition: EventsConditionType | undefined;
            insertVertexCondition: EventsConditionType | undefined;
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Activate or deactivate the interaction + remove the sketch.
         * @param {boolean} active.
         * @api stable
         */
        setActive(): void;
        /** Get nearest coordinate in a list
        * @param {Coordinate} pt the point to find nearest
        * @param {geom} coords list of coordinates
        * @return {*} the nearest point with a coord (projected point), dist (distance to the geom), ring (if Polygon)
         */
        getNearestCoord(pt: Coordinate, coords: GeometryType): any;
        /** Get arcs concerned by a modification
         * @param {geom} geom the geometry concerned
         * @param {Coordinate} coord pointed coordinates
         */
        getArcs(geom: GeometryType, coord: Coordinate): void;
        /**
         * @param {MapBrowserEvent} evt Map browser event.
         * @return {boolean} `true` to start the drag sequence.
         */
        handleDownEvent(evt: MapBrowserEvent): boolean;
        /** Get modified features
         * @return {Array<Feature>} list of modified features
         */
        getModifiedFeatures(): Feature[];
        /** Removes the vertex currently being pointed.
         */
        removePoint(): void;
    }
    /** Modify interaction with a popup to delet a point on touch device
     * @constructor
     * @fires showpopup
     * @fires hidepopup
     * @extends {interaction.Modify}
     * @param {olx.interaction.ModifyOptions} options
     *  @param {String|undefined} options.title title to display, default "remove point"
     *  @param {Boolean|undefined} options.usePopup use a popup, default true
     */
    class ModifyTouch extends Modify {
        constructor(options: {
            title: string | undefined;
            usePopup: boolean | undefined;
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Activate the interaction and remove popup
         * @param {Boolean} b
         */
        setActive(b: boolean): void;
        /**
         * Remove the current point
         */
        removePoint(): boolean;
        /**
         * Show the delete button (menu)
         * @param {Event} e
         * @api stable
         */
        showDeleteBt(e: Event): void;
        /**
         * Change the popup content
         * @param {DOMElement} html
         */
        setPopupContent(html: Element): void;
        /**
         * Get the popup content
         * @return {DOMElement}
         */
        getPopupContent(): Element;
    }
    /** Offset interaction for offseting feature geometry
     * @constructor
     * @extends {interaction.Pointer}
     * @fires offsetstart
     * @fires offsetting
     * @fires offsetend
     * @param {any} options
     *	@param {layer.Vector | Array<layer.Vector>} options.layers list of feature to transform
     *	@param {Collection.<Feature>} options.features collection of feature to transform
     *	@param {VectorSource | undefined} options.source source to duplicate feature when ctrl key is down
     *	@param {boolean} options.duplicate force feature to duplicate (source must be set)
     */
    class Offset extends Pointer {
        constructor(options: {
            layers: Vector | Vector[];
            features: Collection<Feature>;
            source: VectorSource | undefined;
            duplicate: boolean;
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
    }
    /**
     * @constructor
     * @extends {interaction.Pointer}
     *	@param {flashlight.options} flashlight options param
     *		- color {Color} light color, default transparent
     *		- fill {Color} fill color, default rgba(0,0,0,0.8)
     *		- radius {number} radius of the flash
     */
    class Ripple extends Pointer {
        constructor(options: {
            color: Color
        });
        /** Set the map > start postcompose
         */
        setMap(): void;
        /** Generate random rain drop
        *	@param {number} interval
         */
        rains(interval: number): void;
        /** Disturb water at specified point
        *	@param {Pixel|MapBrowserEvent}
         */
        rainDrop(e: Pixel | MapBrowserEvent): void;
        /** Postcompose function
         */
        postcompose_(): void;
    }
    /**
     * @classdesc
     * Interaction for selecting vector features in a cluster.
     * It can be used as an interaction.Select.
     * When clicking on a cluster, it springs apart to reveal the features in the cluster.
     * Revealed features are selectable and you can pick the one you meant.
     * Revealed features are themselves a cluster with an attribute features that contain the original feature.
     *
     * @constructor
     * @extends {interaction.Select}
     * @param {olx.interaction.SelectOptions=} options SelectOptions.
     *  @param {style} options.featureStyle used to style the revealed features as options.style is used by the Select interaction.
     * 	@param {boolean} options.selectCluster false if you don't want to get cluster selected
     * 	@param {Number} options.PointRadius to calculate distance between the features
     * 	@param {bool} options.spiral means you want the feature to be placed on a spiral (or a circle)
     * 	@param {Number} options.circleMaxObject number of object that can be place on a circle
     * 	@param {Number} options.maxObjects number of object that can be drawn, other are hidden
     * 	@param {bool} options.animation if the cluster will animate when features spread out, default is false
     * 	@param {Number} options.animationDuration animation duration in ms, default is 500ms
     * @fires interaction.SelectEvent
     * @api stable
     */
    class SelectCluster extends Select {
        constructor(options?: {
            featureStyle: Style;
            selectCluster: boolean;
            PointRadius: number;
            spiral: boolean;
            circleMaxObject: number;
            maxObjects: number;
            animation: boolean;
            animationDuration: number;
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Clear the selection, close the cluster and remove revealed features
         * @api stable
         */
        clear(): void;
        /**
         * Get the layer for the revealed features
         * @api stable
         */
        getLayer(feature: FeatureLike): Vector;
        /**
         * Select a cluster
         * @param {Feature} a cluster feature ie. a feature with a 'features' attribute.
         * @api stable
         */
        selectCluster(a: Feature): void;
        /**
         * Animate the cluster and spread out the features
         * @param {Coordinates} the center of the cluster
         */
        animateCluster_(the: Coordinates): void;
    }
    /** Interaction to snap to guidelines
     * @constructor
     * @extends {Interaction}
     * @param {olx.interaction.SnapGuidesOptions}
     *	- pixelTolerance {number | undefined} distance (in px) to snap to a guideline, default 10 px
     *  - enableInitialGuides {bool | undefined} whether to draw initial guidelines based on the maps orientation, default false.
     *	- style {Style | Array<Style> | undefined} Style for the sektch features.
     */
    class SnapGuides extends Interaction {
        constructor(options: {
            pixelTolerance: number,
            enableInitialGuides: boolean,
            style: Style | Style[] | undefined
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Activate or deactivate the interaction.
        * @param {boolean} active
         */
        setActive(active: boolean): void;
        /** Clear previous added guidelines
        * @param {Array<Feature> | undefined} features a list of feature to remove, default remove all feature
         */
        clearGuides(features: Feature[] | undefined): void;
        /** Get guidelines
        * @return {Collection} guidelines features
         */
        getGuides(): Collection<Feature>;
        /** Add a new guide to snap to
        * @param {Array<Coordinate>} v the direction vector
        * @return {Feature} feature guide
         */
        addGuide(v: Coordinate[]): Feature;
        /** Add a new orthogonal guide to snap to
        * @param {Array<Coordinate>} v the direction vector
        * @return {Feature} feature guide
         */
        addOrthoGuide(v: Coordinate[]): Feature;
        /** Listen to draw event to add orthogonal guidelines on the first and last point.
        * @param {_ol_interaction_Draw_} drawi a draw interaction to listen to
        * @api
         */
        setDrawInteraction(drawi: Draw): void;
        /** Listen to modify event to add orthogonal guidelines relative to the currently dragged point
        * @param {_ol_interaction_Modify_} modifyi a modify interaction to listen to
        * @api
         */
        setModifyInteraction(modifyi: Modify): void;
    }
    /** Interaction split interaction for splitting feature geometry
     * @constructor
     * @extends {Interaction}
     * @fires  beforesplit, aftersplit, pointermove
     * @param {*}
     *  @param {VectorSource|Array{VectorSource}} options.source a list of source to split (configured with useSpatialIndex set to true)
     *  @param {Collection.<Feature>} options.features collection of feature to split
     *  @param {number} options.snapDistance distance (in px) to snap to an object, default 25px
     *	@param {string|undefined} options.cursor cursor name to display when hovering an objet
     *  @param {function|undefined} opttion.filter a filter that takes a feature and return true if it can be clipped, default always split.
     *  @param Style | Array<Style> | false | undefined} options.featureStyle Style for the selected features, choose false if you don't want feature selection. By default the default edit style is used.
     *  @param {Style | Array<Style> | undefined} options.sketchStyle Style for the sektch features.
     *  @param {function|undefined} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split.  Default is 1e-10.
     */
    class Split extends Interaction {
        constructor(options: {
            features: Collection<Feature>;
            snapDistance: number;
            cursor: string | undefined;
            sketchStyle: Style | Style[] | undefined;
            tolerance: ((...params: any[]) => any) | undefined;
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Get nearest coordinate in a list
        * @param {Coordinate} pt the point to find nearest
        * @param {Array<Coordinate>} coords list of coordinates
        * @return {Coordinate} the nearest coordinate in the list
         */
        getNearestCoord(pt: Coordinate, coords: Coordinate[]): Coordinate;
        /**
         * @param {MapBrowserEvent} evt Map browser event.
         * @return {boolean} `true` to start the drag sequence.
         */
        handleDownEvent(evt: MapBrowserEvent): boolean;
        /**
         * @param {MapBrowserEvent} evt Event.
         */
        handleMoveEvent(evt: MapBrowserEvent): void;
    }
    /** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
     * @constructor
     * @extends {Interaction}
     * @fires  beforesplit, aftersplit
     * @param {olx.interaction.SplitOptions}
     *	- source {VectorSource|Array{VectorSource}} The target source (or array of source) with features to be split (configured with useSpatialIndex set to true)
     *	- triggerSource {VectorSource} Any newly created or modified features from this source will be used to split features on the target source. If none is provided the target source is used instead.
     *	- features {Collection.<Feature>} A collection of feature to be split (replace source target).
     *	- triggerFeatures {Collection.<Feature>} Any newly created or modified features from this collection will be used to split features on the target source (replace triggerSource).
     *	- filter {function|undefined} a filter that takes a feature and return true if the feature is eligible for splitting, default always split.
     *	- tolerance {function|undefined} Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split. Default is 1e-10.
     * @todo verify auto intersection on features that split.
     */
    class Splitter extends Interaction {
        constructor(options: {
            source: VectorSource | VectorSource[];
            triggerSource: VectorSource;
            features: Collection<Feature>;
            filter: (f: Feature) => boolean | undefined;
            tolerance: ((...params: any[]) => any) | undefined;
        });
        /** Calculate intersection on 2 segs
        * @param {Array<Coordinate>} s1 first seg to intersect (2 points)
        * @param {Array<Coordinate>} s2 second seg to intersect (2 points)
        * @return { boolean | Coordinate } intersection point or false no intersection
         */
        intersectSegs(s1: Coordinate[], s2: Coordinate[]): boolean | Coordinate;
        /** Split the source using a feature
        * @param {Feature} feature The feature to use to split.
         */
        splitSource(feature: Feature): void;
        /** New feature source is added
         */
        onAddFeature(): void;
        /** Feature source is removed > count features added/removed
         */
        onRemoveFeature(): void;
        /** Feature source is changing
         */
        onChangeFeature(): void;
    }
    /** Interaction synchronize
     * @constructor
     * @extends {Interaction}
     * @param {olx.interaction.SynchronizeOptions}
     *  - maps {Array<Map>} An array of maps to synchronize with the map of the interaction
     */
    class Synchronize extends Interaction {
        constructor(options: {
            map: _ol_Map_[]
        });
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** Synchronize the maps
         */
        syncMaps(): void;
        /** Cursor move > tells other maps to show the cursor
        * @param {event} e "move" event
         */
        handleMove_(e: Event): void;
        /** Cursor out of map > tells other maps to hide the cursor
        * @param {event} e "mouseOut" event
         */
        handleMouseOut_(e: Event): void;
    }
    /**
     * @constructor
     * @extends {interaction.Pointer}
     *	@param {interaction.TinkerBell.options}  options flashlight param
     *		- color {color} color of the sparkles
     */
    class TinkerBell extends Pointer {
        constructor(options: {
            color: Color
        });
        /** Set the map > start postcompose
         */
        setMap(): void;
        /** Postcompose function
         */
        postcompose_(): void;
    }
    /** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
     * @constructor
     * @extends {interaction.Pointer}
     * @param {olx.interaction.TouchCompass}
     *	- onDrag {function|undefined} Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
     *	- Size {Number} Size of the compass in px, default 80
     *	- alpha {Number} opacity of the compass, default 0.5
     */
    class TouchCompass extends Pointer {
        constructor(options: {
            onDrag: undefined,
            Size: number,
            alpha: number
        });
        /** Compass Image as a JS Image object
        * @api
         */
        compass: any;
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {_ol_Map_} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Activate or deactivate the interaction.
         * @param {boolean} active Active.
         * @observable
         * @api
         */
        setActive(active: boolean): void;
    }
    /** Interaction rotate
     * @constructor
     * @extends {interaction.Pointer}
     * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
     * @param {any} options
     *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
     *  @param {Array<Layer>} options.layers array of layers to transform,
     *  @param {Collection<Feature>} options.features collection of feature to transform,
     *	@param {EventsConditionType|undefined} options.addCondition A function that takes an MapBrowserEvent and returns a boolean to indicate whether that event should be handled. default: events.condition.never.
     *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
     *	@param {bool} options.translateFeature Translate when click on feature
     *	@param {bool} options.translate Can translate the feature
     *	@param {bool} options.stretch can stretch the feature
     *	@param {bool} options.scale can scale the feature
     *	@param {bool} options.rotate can rotate the feature
     *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
     *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
     *	@param {events.ConditionType | undefined} options.keepAspectRatio A function that takes an MapBrowserEvent and returns a boolean to keep aspect ratio, default events.condition.shiftKeyOnly.
     *	@param {events.ConditionType | undefined} options.modifyCenter A function that takes an MapBrowserEvent and returns a boolean to apply scale & strech from the center, default events.condition.metaKey or events.condition.ctrlKey.
     *	@param {} options.style list of style for handles
     *
     */
    class Transform extends Pointer {
        constructor(options: {
            filter: (f: Feature, l: Layer) => boolean;
            layers: Layer[];
            features: Collection<Feature>;
            addCondition: EventsConditionType | undefined;
            hitTolerance: number | undefined;
            translateFeature: boolean;
            translate: boolean;
            stretch: boolean;
            scale: boolean;
            rotate: boolean;
            noFlip: boolean;
            selection: boolean;
            keepAspectRatio: EventsConditionType | undefined;
            modifyCenter: EventsConditionType | undefined;
            style: any;
        });
        /** Cursors for transform
         */
        Cursors: any;
        /**
         * Remove the interaction from its current map, if any,  and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /**
         * Activate/deactivate interaction
         * @param {bool}
         * @api stable
         */
        setActive(b: boolean): void;
        /** Set efault sketch style
         */
        setDefaultStyle(): void;
        /** Style for handles
         */
        style: any;
        /**
         * Set sketch style.
         * @param {style} style Style name: 'default','translate','rotate','rotate0','scale','scale1','scale2','scale3','scalev','scaleh1','scalev2','scaleh3'
         * @param {Style|Array<Style>} olstyle
         * @api stable
         */
        setStyle(style: Style, olstyle: Style | Style[]): void;
        /** Draw transform sketch
        * @param {boolean} draw only the center
         */
        drawSketch_(draw: boolean): void;
        /** Select a feature to transform
        * @param {Feature} feature the feature to transform
        * @param {boolean} add true to add the feature to the selection, default false
         */
        select(feature: Feature, add: boolean): void;
        /**
         * @param {MapBrowserEvent} evt Map browser event.
         * @return {boolean} `true` to start the drag sequence.
         */
        handleDownEvent_(evt: MapBrowserEvent): boolean;
        /**
         * Get features to transform
         * @return {Collection<Feature>}
         */
        getFeatures(): Collection<Feature>;
        /**
         * Get the rotation center
         * @return {Coordinates|undefined}
         */
        getCenter(): Coordinates | undefined;
        /**
         * Set the rotation center
         * @param {Coordinates|undefined} c the center point, default center on the objet
         */
        setCenter(c: Coordinates | undefined): void;
        /**
         * @param {MapBrowserEvent} evt Map browser event.
         */
        handleDragEvent_(evt: MapBrowserEvent): void;
        /**
         * @param {MapBrowserEvent} evt Event.
         */
        handleMoveEvent_(evt: MapBrowserEvent): void;
        /**
         * @param {MapBrowserEvent} evt Map browser event.
         * @return {boolean} `false` to stop the drag sequence.
         */
        handleUpEvent_(evt: MapBrowserEvent): boolean;
    }
    /** Undo/redo interaction
     * @constructor
     * @extends {Interaction}
     * @fires undo
     * @fires redo
     * @param {*} options
     */
    class UndoRedo extends Interaction {
        constructor(options: any);
        /** Add a custom undo/redo
         * @param {string} action the action key name
         * @param {function} undoFn function called when undoing
         * @param {function} redoFn function called when redoing
         * @api
         */
        define(action: string, undoFn: (...params: any[]) => any, redoFn: (...params: any[]) => any): void;
        /** Set a custom undo/redo
         * @param {string} action the action key name
         * @param {any} prop an object that will be passed in the undo/redo fucntions of the action
         * @return {boolean} true if the action is defined
         */
        push(action: string, prop: any): boolean;
        /** Activate or deactivate the interaction, ie. records or not events on the map.
         * @param {boolean} active
         * @api stable
         */
        setActive(active: boolean): void;
        /**
         * Remove the interaction from its current map, if any, and attach it to a new
         * map, if any. Pass `null` to just remove the interaction from the current map.
         * @param {Map} map Map.
         * @api stable
         */
        setMap(map: _ol_Map_): void;
        /** A feature is added / removed
         */
        _onAddRemove(): void;
        /** Start an undo block
         * @api
         */
        blockStart(): void;
        /** End an undo block
         * @api
         */
        blockEnd(): void;
        /** Undo last operation
         * @api
         */
        undo(): void;
        /** Redo last operation
         * @api
         */
        redo(): void;
        /** Clear undo stack
         * @api
         */
        clear(): void;
        /** Check if undo is avaliable
         * @return {number} the number of undo
         * @api
         */
        hasUndo(): number;
        /** Check if redo is avaliable
         * @return {number} the number of redo
         * @api
         */
        hasRedo(): number;
    }
}
/** Filters are effects that render over a map or a layer.
 * Use the map methods to add or remove filter on a map
 * ({@link Map#addFilter}, {@link Map#removeFilter}, {@link Map#getFilters}).
 * Use the layer methods to add or remove filter on a layer
 * ({@link layer.Base#addFilter}, {@link layer.Base#removeFilter}, {@link layer.Base#getFilters}).
 * @namespace filter
 */
declare namespace filter {
    /**
     * @classdesc
     * Abstract base class; normally only used for creating subclasses and not instantiated in apps.
     * Used to create filters
     * Use {@link _ol_Map_#addFilter}, {@link _ol_Map_#removeFilter} or {@link _ol_Map_#getFilters} to handle filters on a map.
     * Use {@link layer.Base#addFilter}, {@link layer.Base#removeFilter} or {@link layer.Base#getFilters}
     * to handle filters on layers.
     *
     * @constructor
     * @extends {Object}
     * @param {Object} options Extend {@link _ol_control_Control_} options.
     *  @param {boolean} [options.active]
     */
    class Base extends Object {
        constructor(options: {
            active?: boolean;
        });
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Mask drawing using an Feature
     * @constructor
     * @requires filter
     * @extends {filter.Base}
     * @param {Object} [options]
     *  @param {Feature} [options.feature] feature to mask with
     *  @param {Fill} [options.fill] style to fill with
     *  @param {boolean} [options.inner] mask inner, default false
     */
    class Mask extends filter.Base {
        constructor(options?: {
            feature?: Feature;
            fill?: Fill;
            inner?: boolean;
        });
        /** Draw the feature into canvas
         */
        drawFeaturePath_(): void;
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Clip layer or map
    *  @constructor
    * @requires filter
    * @extends {filter.Base}
    * @param {Object} [options]
    *  @param {Array<Coordinate>} [options.coords]
    *  @param {Extent} [options.Extent]
    *  @param {string} [options.units] coords units percent (%) or pixel (px)
    *  @param {boolean} [options.keepAspectRatio] keep aspect ratio
    *  @param {string} [options.color] backgroundcolor
     */
    class Clip extends filter.Base {
        constructor(options?: {
            coords?: Coordinate[];
            Extent?: Extent;
            units?: string;
            keepAspectRatio?: boolean;
            color?: string;
        });
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Colorize map or layer
     * @constructor
     * @requires filter
     * @extends {filter.Base}
     * @author Thomas Tilak https://github.com/thhomas
     * @author Jean-Marc Viglino https://github.com/viglino
     * @param {FilterColorizeOptions} options
     */
    class Colorize extends filter.Base {
        constructor(options: FilterColorizeOptions);
        /** Set options to the filter
         * @param {FilterColorizeOptions} [options]
         */
        setFilter(options?: FilterColorizeOptions): void;
        /** Set the filter value
         *  @param {Color} options.color style to fill with
         */
        setValue(): void;
        /** Set the color value
         *  @param {number} options.value a [0-1] value to modify the effect value
         */
        setColor(): void;
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Colorize map or layer
    * @constructor
    * @requires filter
    * @extends {filter.Base}
    * @param {Object} options
    *   @param {string} options.operation composite operation
     */
    class Composite extends filter.Base {
        constructor(options: {
            operation: string;
        });
        /** Change the current operation
        *	@param {string} operation composite function
         */
        setOperation(operation: string): void;
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Crop drawing using an Feature
    * @constructor
    * @requires filter
    * @requires filter.Mask
    * @extends {filter.Mask}
    * @param {Object} [options]
    *  @param {Feature} [options.feature] feature to crop with
    *  @param {boolean} [options.inner=false] mask inner, default false
     */
    class Crop extends filter.Mask {
        constructor(options?: {
            feature?: Feature;
            inner?: boolean;
        });
        /** Draw the feature into canvas
         */
        drawFeaturePath_(): void;
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Fold filer map
    * @constructor
    * @requires filter
    * @extends {filter.Base}
    * @param {Object} [options]
    *  @param {[number, number]} [options.fold] number of fold (horizontal and vertical)
    *  @param {number} [options.margin] margin in px, default 8
    *  @param {number} [options.padding] padding in px, default 8
    *  @param {number|number[]} [options.fSize] fold Size in px, default 8,10
     */
    class Fold extends filter.Base {
        constructor(options?: {
            margin?: number;
            padding?: number;
            fSize?: number | number[];
        });
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Make a map or layer look like made of a set of Lego bricks.
     *  @constructor
     * @requires filter
     * @extends {filter.Base}
     * @param {Object} [options]
     *  @param {string} [options.img]
     *  @param {number} [options.brickSize] Size of te brick, default 30
     *  @param {null | string | undefined} [options.crossOrigin] crossOrigin attribute for loaded images.
     */
    class Lego extends filter.Base {
        constructor(options?: {
            img?: string;
            brickSize?: number;
            crossOrigin?: null | string | undefined;
        });
        /** Image definition
         */
        img: any;
        /** Overwrite to handle brickSize
        * @param {string} key
        * @param {any} val
         */
        set(key: string, val: any): void;
        /** Set the current brick
        *	@param {number} width the pattern width, default 30
        *	@param {'brick'|'ol3'|'lego'|undefined} img the pattern, default ol3
        *	@param {string} crossOrigin
         */
        setBrick(width: number, img: 'brick' | 'ol3' | 'lego' | undefined, crossOrigin: string): void;
        /** Get translated pattern
        *	@param {number} offsetX x offset
        *	@param {number} offsetY y offset
         */
        getPattern(offsetX: number, offsetY: number): void;
        /** Postcompose operation
         */
        postcompose(): void;
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
    /** Add texture effects on maps or layers
     * @constructor
     * @requires filter
     * @extends {filter.Base}
     * @param {FilterTextureOptions} options
     */
     class Texture extends filter.Base {
        constructor(options: FilterTextureOptions);
        /** Set texture
         * @param {FilterTextureOptions} [options]
         */
        setFilter(options?: FilterTextureOptions): void;
        /** Get translated pattern
         *	@param {number} offsetX x offset
         *	@param {number} offsetY y offset
         */
        getPattern(offsetX: number, offsetY: number): void;
        /** Draw pattern over the map on postcompose
         */
        postcompose(): void;
        /** Activate / deactivate filter
        *	@param {boolean} b
         */
        setActive(b: boolean): void;
        /** Get filter active
        *	@return {boolean}
         */
        getActive(): boolean;
    }
}
/** Algorithms to on a graph (shortest path).
 * @namespace graph
 */
declare namespace graph {
    /**
     * @classdesc
     * Compute the shortest paths between nodes in a graph source
     * The source must only contains LinesString.
     *
     * It uses a A* optimisation.
     * You can overwrite methods to customize the result.
     * @see https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
     * @constructor
     * @fires calculating
     * @fires start
     * @fires finish
     * @fires pause
     * @param {any} options
     *  @param {Vector} options.source the source for the edges
     *  @param {number} [options.maxIteration=20000] maximum iterations before a pause event is fired, default 20000
     *  @param {number} [options.stepIteration=2000] number of iterations before a calculating event is fired, default 2000
     *  @param {number} [options.epsilon=1E-6] geometric precision (min distance beetween 2 points), default 1E-6
     */
    class Dijskra {
        constructor(options: {
            source: Vector;
            maxIteration?: number;
            stepIteration?: number;
            epsilon?: number;
        });
        /** Get the weighting of the edge, for example a speed factor
         * The function returns a value beetween ]0,1]
         * - 1   = no weighting
         * - 0.5 = goes twice more faster on this road
         *
         * If no feature is provided you must return the lower weighting you're using
         * @param {Feature} feature
         * @return {number} a number beetween 0-1
         * @api
         */
        weight(feature: Feature): number;
        /** Get the edge direction
         * -  0 : the road is blocked
         * -  1 : direct way
         * - -1 : revers way
         * -  2 : both way
         * @param {Feature} feature
         * @return {Number} 0: blocked, 1: direct way, -1: revers way, 2:both way
         * @api
         */
        direction(feature: Feature): number;
        /** Calculate the length of an edge
         * @param {Feature|LineString} geom
         * @return {number}
         * @api
         */
        getLength(geom: Feature | LineString): number;
        /** Get the nodes source concerned in the calculation
         * @return {VectorSource}
         */
        getNodeSource(): VectorSource;
        /** Get all features at a coordinate
         * @param {Coordinate} coord
         * @return {Array<Feature>}
         */
        getEdges(coord: Coordinate): Feature[];
        /** Get a node at a coordinate
         * @param {Coordinate} coord
         * @return {Feature} the node
         */
        getNode(coord: Coordinate): Feature;
        /** Calculate a path beetween 2 points
         * @param {Coordinate} start
         * @param {Coordinate} end
         * @return {boolean|Array<Coordinate>} false if don't start (still running) or start and end nodes
         */
        path(start: Coordinate, end: Coordinate): boolean | Coordinate[];
        /** Restart after pause
         */
        resume(): void;
        /** Pause
         */
        pause(): void;
        /** Get the current 'best way'.
         * This may be used to animate while calculating.
         * @return {Array<Feature>}
         */
        getBestWay(): Feature[];
    }
}
/** Vector feature rendering styles.
 * @namespace style
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_style.html}
 */
declare namespace style {
    /** Reset the cache (when fonts are loaded)
     */
    function clearDBPediaStyleCache(): void;
    /** Get a default style function for dbpedia
    * @param {} options
    * @param {string|function|undefined} options.glyph a glyph name or a function that takes a feature and return a glyph
    * @param {number} options.radius radius of the symbol, default 8
    * @param {Fill} options.fill style for fill, default navy
    * @param {style.stroke} options.stroke style for stroke, default 2px white
    * @param {string} options.prefix a prefix if many style used for the same type
    *
    * @require style.FontSymbol and FontAwesome defs are required for dbPediaStyleFunction()
     */
    function dbPediaStyleFunction(options: {
        glyph: string | ((...params: any[]) => any) | undefined;
        radius: number;
        fill: Fill;
        stroke: Stroke;
        prefix: string;
    }): void;

    /**
     * @classdesc
     * Set chart style for vector features.
     *
     * @constructor
     * @param {} options
     *	@param {String} options.type Chart type: pie,pie3D, donut or bar
     *	@param {number} options.radius Chart radius/Size, default 20
     *	@param {number} options.rotation Rotation in radians (positive rotation clockwise). Default is 0.
     *	@param {bool} options.snapToPixel use integral numbers of pixels, default true
     *	@param {Stroke} options.stroke stroke style
     *	@param {String|Array<color>} options.colors predefined color set "classic","dark","pale","pastel","neon" / array of color string, default classic
     *	@param {number} options.offsetX X offset in px
     *	@param {number} options.offsetY Y offset in px
     *	@param {number} options.animation step in an animation sequence [0,1]
     *	@param {number} options.max maximum value for bar chart
     * @see [Statistic charts example](../../examples/map.style.chart.html)
     * @extends {style.RegularShape}
     * @implements {structs.IHasChecksum}
     * @api
     */
    class Chart extends RegularShape {
        constructor(options: {
            type: string;
            radius: number;
            rotation: number;
            snapToPixel: boolean;
            stroke: Stroke;
            colors: string | Color[];
            offsetX: number;
            offsetY: number;
            animation: number;
            max: number;
        });
        /** Default color set: classic, dark, pale, pastel, neon
         */
        static colors: any;
        /**
         * Clones the style.
         * @return {style.Chart}
         */
        clone(): style.Chart;
        /** Get data associatied with the chart
         */
        getData(): void;
        /** Set data associatied with the chart
        *	@param {Array<number>}
         */
        setData(data: number[]): void;
        /** Get symbol radius
         */
        getRadius(): number;
        /** Set symbol radius
        *	@param {number} symbol radius
        *	@param {number} donut ratio
         */
        setRadius(symbol: number, donut: number): void;
        /** Set animation step
        *	@param {false|number} false to stop animation or the step of the animation [0,1]
         */
        setAnimation(step: false | number): void;
        /**
         * @inheritDoc
         */
        getChecksum(): string;
    }


    interface FillPatternOptions {
        size: number;
        width: number;
        height: number;
        circles: number[][];
        lines: number[][];
        stroke: number;
        fill: boolean;
        char: string;
        font: string;
    }

    /**
     * @classdesc
     * Fill style with named pattern
     *
     * @constructor
     * @param {olx.style.FillPatternOption=}  options
     *	@param {style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
     *	@param {number|undefined} options.opacity opacity with image pattern, default:1
     *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
     *	@param {color} options.color pattern color
     *	@param {Fill} options.fill fill color (background)
     *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
     *	@param {number} options.Size line Size for hash/dot/circle/cross pattern
     *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
     *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
     *	@param {number} options.scale pattern scale
     * @extends {Fill}
     * @implements {structs.IHasChecksum}
     * @api
     */
    class FillPattern extends Fill {
        constructor(options?: {
            image: Image | undefined;
            opacity: number | undefined;
            pattern: FillPattern;
            color: Color;
            fill: Color;
            offset: number;
            Size: number;
            spacing: number;
            angle: number | boolean;
            scale: number;
        });
        /**
         * Clones the style.
         * @return {style.FillPattern}
         */
        clone(): style.FillPattern;
        /** Get canvas used as pattern
        *	@return {canvas}
         */
        getImage(): HTMLCanvasElement;
        /** Get pattern
        *	@param {olx.style.FillPatternOption}
         */
        getPattern_(options: FillPatternOptions): void;
        /** Static fuction to add char patterns
        *	@param {title}
        *	@param {olx.fillpattern.Option}
        *		- Size {number} default 10
        *		- width {number} default 10
        *		- height {number} default 10
        *		- circles {Array<circles>}
        *		- lines: {Array<pointlist>}
        *		- stroke {number}
        *		- fill {bool}
        *		- char {char}
        *		- font {string} default "10px Arial"
         */
        static addPattern(title: string, options: FillPatternOptions): void
        /** Patterns definitions
            Examples : http://seig.ensg.ign.fr/fichchap.php?NOFICHE=FP31&NOCHEM=CHEMS009&NOLISTE=1&N=8
         */
        patterns: any;
    }
    /** Flow line style
     * Draw LineString with a variable color / width
     *
     * @extends {Style}
     * @constructor
     * @param {Object} options
     *  @param {boolean} options.visible draw only the visible part of the line, default true
     *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
     *  @param {number} options.width2 Final stroke width
     *  @param {colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
     *  @param {colorLike} options.color2 Final sroke color
     */
    class FlowLine extends Style {
        constructor(options: {
            visible: boolean;
            width: number | ((...params: any[]) => number);
            width2: number;
            color: ColorLike | ((...params: any[]) => ColorLike);
            color2: ColorLike;
        });
        /** Set the initial width
         * @param {number} width width, default 0
         */
        setWidth(width: number): void;
        /** Set the final width
         * @param {number} width width, default 0
         */
        setWidth2(width: number): void;
        /** Set the LineCap
         * @param {steing} cap LineCap (round or mitter), default mitter
         */
        setLineCap(cap: string): void;
        /** Get the current width at step
         * @param {feature} feature
         * @param {number} step current drawing step beetween [0,1]
         * @return {number}
         */
        getWidth(feature: Feature, step: number): number;
        /** Set the initial color
         * @param {colorLike} color
         */
        setColor(color: ColorLike): void;
        /** Set the final color
         * @param {colorLike} color
         */
        setColor2(color: ColorLike): void;
        /** Get the current color at step
         * @param {feature} feature
         * @param {number} step current drawing step beetween [0,1]
         * @return {string}
         */
        getColor(feature: Feature, step: number): string;
        /** Renderer function
         * @param {Array<Coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
         * @param {render.State} e The olx.render.State of the layer renderer
         */
    }

    /**
     * @classdesc
     * A marker style to use with font symbols.
     *
     * @constructor
     * @param {} options Options.
     *  @param {number} options.glyph the glyph name or a char to display as symb
     * 		The name must be added using the {@link style.FontSymbaddDefs} function.
     *  @param {string} options.form
     * 		none|circle|poi|bubble|marker|coma|shield|blazon|bookmark|hexagon|diamond|triangle|sign|ban|lozenge|square
     * 		a form that will enclose the glyph, default none
     *  @param {number} options.radius
     *  @param {number} options.rotation
     *  @param {number} options.rotateWithView
     *  @param {number} options.opacity
     *  @param {number} options.fontSize, default 1
     *  @param {string} options.fontStyle the font style (bold, italic, bold italic, etc), default none
     *  @param {boolean} options.gradient true to display a gradient on the symbol
     *  @param {_ol_style_Fill_} options.fill
     *  @param {Stroke} options.stroke
     * @extends {style.RegularShape}
     * @implements {structs.IHasChecksum}
     * @api
     */
    class FontSymbol extends RegularShape {
        constructor(options: {
            glyph: number;
            form: string;
            radius: number;
            rotation: number;
            rotateWithView: number;
            opacity: number;
            fontSize: number;
            fontStyle: string;
            gradient: boolean;
            fill: Fill;
            stroke: Stroke;
        });
        /**
         *	Font defs
         */
        defs: any;
        /** Static function : add new font defs
         * @param {String|Object} font the font desciption
         * @param {} glyphs a key / value list of glyph definitions.
         * 		Each key is the name of the glyph,
         * 		the value is an object that code the font, the caracter code,
         * 		the name and a search string for the glyph.
         */
        static addDefs(font: string | any, glyphs: any): void;
        /**
         * Clones the style.
         * @return {style.FontSymbol}
         */
        clone(): style.FontSymbol;
        /**
         * Get the fill style for the symb
         * @return {Fill} Fill style.
         * @api
         */
        getFill(): Fill;
        /**
         * Get the stroke style for the symb
         * @return {Stroke} Stroke style.
         * @api
         */
        getStroke(): Stroke;
        /**
         * Get the glyph definition for the symb
         * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
         * @return {Stroke} Stroke style.
         * @api
         */
        getGlyph(name: string | undefined): Stroke;
        /**
         * Get the glyph name.
         * @return {string} the name
         * @api
         */
        getGlyphName(): string;
        /**
         * Get the stroke style for the symb
         * @return {Stroke} Stroke style.
         * @api
         */
        getFontInfo(): Stroke;
        /**
         * @inheritDoc
         */
        getChecksum(): string;
    }

    /**
     * @classdesc
     * Set Photo style for vector features.
     *
     * @constructor
     * @param {} options
     *  @param { default | square | round | anchored | folio } options.kind
     *  @param {boolean} options.crop crop within square, default is false
     *  @param {Number} options.radius symbol Size
     *  @param {boolean} options.shadow drop a shadow
     *  @param {style.Stroke} options.stroke
     *  @param {String} options.src image src
     *  @param {String} options.crossOrigin The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you want to access pixel data with the Canvas renderer.
     *  @param {Number} options.offsetX Horizontal offset in pixels. Default is 0.
     *  @param {Number} options.offsetY Vertical offset in pixels. Default is 0.
     *  @param {function} options.onload callback when image is loaded (to redraw the layer)
     * @extends {style.RegularShape}
     * @implements {structs.IHasChecksum}
     * @api
     */
    class Photo extends RegularShape {
        constructor(options: {
            kind: 'default' | 'square' | 'round' | 'anchored' | 'folio';
            crop: boolean;
            radius: number;
            shadow: boolean;
            stroke: Stroke;
            src: string;
            crossOrigin: string;
            offsetX: number;
            offsetY: number;
            onload: (...params: any[]) => any;
        });
        /**
         * Clones the style.
         * @return {style.Photo}
         */
        clone(): style.Photo;
        /**
         * @inheritDoc
         */
        getChecksum(): string;
    }
    /** Add new properties to style.Text
    * to use with layer.Vector.prototype.setTextPathStyle
    * @constructor
    * @param {} options
    *	@param {visible|ellipsis|string} textOverflow
    *	@param {number} minWidth minimum width (px) to draw text, default 0
     */
    class TextPath {
        constructor(options: any, textOverflow: 'visible' | 'ellipsis' | string, minWidth: number);
    }

    /**
     * @classdesc
     * Set Shadow style for point vector features.
     *
     * @constructor
     * @param {} options Options.
     *   @param {Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
     *   @param {number} options.radius point radius
     * 	 @param {number} options.blur lur radius, default radius/3
     * 	 @param {number} options.offsetX x offset, default 0
     * 	 @param {number} options.offsetY y offset, default 0
     * @extends {style.RegularShape}
     * @implements {structs.IHasChecksum}
     * @api
     */
    class Shadow extends RegularShape {
        constructor(options: {
            fill: Fill | undefined;
            radius: number;
            blur: number;
            offsetX: number;
            offsetY: number;
        });
        /**
         * Clones the style.
         * @return {style.Shadow}
         */
        clone(): style.Shadow;
        /**
         * @inheritDoc
         */
        getChecksum(): string;
    }

    interface StrokePatternOptions {
        image: Image | undefined;
        opacity: number | undefined;
        pattern: FillPattern;
        color: ColorLike;
        fill: Fill;
        offset: number;
        Size: number;
        spacing: number;
        angle: number | boolean;
        scale: number;
    }

    /**
     * @classdesc
     * Stroke style with named pattern
     *
     * @constructor
     * @param {any}  options
     *	@param {style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
     *	@param {number|undefined} options.opacity opacity with image pattern, default:1
     *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
     *	@param {colorLike} options.color pattern color
     *	@param {Fill} options.fill fill color (background)
     *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
     *	@param {number} options.Size line Size for hash/dot/circle/cross pattern
     *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
     *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
     *	@param {number} options.scale pattern scale
     * @extends {Fill}
     * @implements {structs.IHasChecksum}
     * @api
     */
    class StrokePattern extends FillPattern {
        constructor(options: FillPatternOptions);
        /**
         * Clones the style.
         * @return {style.StrokePattern}
         */
        clone(): style.StrokePattern;
        /** Get canvas used as pattern
        *	@return {canvas}
         */
        getImage(): HTMLCanvasElement;
        /** Get pattern
        *	@param {olx.style.FillPatternOption}
         */
        getPattern_(options: FillPatternOptions): void;
    }
}
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
    /** Add a filter to an Map
    *	@param {filter}
     */
    function addFilter(filter: filter.Base): void;
    /** Remove a filter to an Map
    *	@param {filter}
     */
    function removeFilter(filter: filter.Base): void;
    /** Get filters associated with an Map
    *	@return {Array<filter>}
     */
    function getFilters(): filter.Base[];
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
/** Openlayers Overlay.
 * An element to be displayed over the map and attached to a single map location.
 * @namespace Overlay
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Overlay.html}
 */
declare namespace overlay {
    /**
     * @classdesc
     * A popup element to be displayed over the map and attached to a single map
     * location. The popup are customized using CSS.
     *
     * @example
    var popup = new Overlay.Popup();
    map.addOverlay(popup);
    popup.show(coordinate, "Hello!");
    popup.hide();
    *
    * @constructor
    * @extends {Overlay}
    * @param {} options Extend Overlay options
    *	@param {String} options.popupClass the a class of the overlay to style the popup.
    *	@param {bool} options.closeBox popup has a close box, default false.
    *	@param {function|undefined} options.onclose: callback function when popup is closed
    *	@param {function|undefined} options.onshow callback function when popup is shown
    *	@param {Number|Array<number>} options.offsetBox an offset box
    *	@param {OverlayPositioning | string | undefined} options.positionning
    *		the 'auto' positioning var the popup choose its positioning to stay on the map.
    * @api stable
     */
    class Popup extends Overlay {
        constructor(options: {
            popupClass: string;
            closeBox: boolean;
            onclose: ((...params: any[]) => any) | undefined;
            onshow: ((...params: any[]) => any) | undefined;
            offsetBox: number | number[];
            positionning: OverlayPositioning | string | undefined;
        });
        /**
         * Set a close box to the popup.
         * @param {bool} b
         * @api stable
         */
        setClosebox(b: boolean): void;
        /**
         * Set the CSS class of the popup.
         * @param {string} c class name.
         * @api stable
         */
        setPopupClass(c: string): void;
        /**
         * Add a CSS class to the popup.
         * @param {string} c class name.
         * @api stable
         */
        addPopupClass(c: string): void;
        /**
         * Remove a CSS class to the popup.
         * @param {string} c class name.
         * @api stable
         */
        removePopupClass(c: string): void;
        /**
         * Set positionning of the popup
         * @param {OverlayPositioning | string | undefined} pos an OverlayPositioning
         * 		or 'auto' to var the popup choose the best position
         * @api stable
         */
        setPositioning(pos: OverlayPositioning | string | undefined): void;
        /** Check if popup is visible
        * @return {boolean}
         */
        getVisible(): boolean;
        /**
         * Set the position and the content of the popup.
         * @param {Coordinate|string} coordinate the coordinate of the popup or the HTML content.
         * @param {string|undefined} html the HTML content (undefined = previous content).
         * @example
        var popup = new Overlay.Popup();
        // Show popup
        popup.show([166000, 5992000], "Hello world!");
        // Move popup at coord with the same info
        popup.show([167000, 5990000]);
        // set new info
        popup.show("New informations");
        * @api stable
         */
        show(coordinate: Coordinate | undefined, features: Feature | Feature[]): void;
        /**
         * Hide the popup
         * @api stable
         */
        hide(): void;
    }
    /**
     * @classdesc
     *	The Magnify overlay add a "magnifying glass" effect to an OL3 map that displays
     *	a portion of the map in a different zoom (and actually display different content).
     *
     * @constructor
     * @extends {Overlay}
     * @param {olx.OverlayOptions} options Overlay options
     * @api stable
     */
    class Magnify extends Overlay {
        constructor(options?: OverlayOptions)
        /**
         * Set the map instance the overlay is associated with.
         * @param {Map} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get the magnifier map
        *	@return {_ol_Map_}
         */
        getMagMap(): _ol_Map_;
        /** Magnify is active
        *	@return {boolean}
         */
        getActive(): boolean;
        /** Activate or deactivate
        *	@param {boolean} active
         */
        setActive(active: boolean): void;
    }
    /**
     * @classdesc
     * A placemark element to be displayed over the map and attached to a single map
     * location. The placemarks are customized using CSS.
     *
     * @example
    var popup = new Overlay.Placemark();
    map.addOverlay(popup);
    popup.show(coordinate);
    popup.hide();
    *
    * @constructor
    * @extends {Overlay}
    * @param {} options Extend ol/Overlay/Popup options
    *	@param {String} options.color placemark color
    *	@param {String} options.backgroundColor placemark color
    *	@param {String} options.contentColor placemark color
    *	@param {Number} options.radius placemark radius in pixel
    *	@param {String} options.popupClass the a class of the overlay to style the popup.
    *	@param {function|undefined} options.onclose: callback function when popup is closed
    *	@param {function|undefined} options.onshow callback function when popup is shown
    * @api stable
     */
    class Placemark extends Overlay {
        constructor(options: {
            color: string;
            backgroundColor: string;
            contentColor: string;
            radius: number;
            popupClass: string;
            onclose: ((...params: any[]) => any) | undefined;
            onshow: ((...params: any[]) => any) | undefined;
        });
        /**
         * Set the position and the content of the placemark (hide it before to enable animation).
         * @param {Coordinate|string} coordinate the coordinate of the popup or the HTML content.
         * @param {string|undefined} html the HTML content (undefined = previous content).
         */
        show(coordinate: Coordinate | string, html: string | undefined): void;
        /**
         * Set the placemark color.
         * @param {string} color
         */
        setColor(color: string): void;
        /**
         * Set the placemark background color.
         * @param {string} color
         */
        setBackgroundColor(color: string): void;
        /**
         * Set the placemark content color.
         * @param {string} color
         */
        setContentColor(color: string): void;
        /**
         * Set the placemark class.
         * @param {string} name
         */
        setClassName(name: string): void;
        /**
         * Set the placemark radius.
         * @param {number} Size Size in pixel
         */
        setRadius(Size: number): void;
    }
    /**
     * A popup element to be displayed on a feature.
     *
     * @constructor
     * @extends {Overlay.Popup}
     * @param {} options Extend Popup options
     *  @param {String} options.popupClass the a class of the overlay to style the popup.
     *  @param {bool} options.closeBox popup has a close box, default false.
     *  @param {function|undefined} options.onclose: callback function when popup is closed
     *  @param {function|undefined} options.onshow callback function when popup is shown
     *  @param {Number|Array<number>} options.offsetBox an offset box
     *  @param {OverlayPositioning | string | undefined} options.positionning
     *    the 'auto' positioning var the popup choose its positioning to stay on the map.
     *  @param {Template} options.template A template with a list of properties to use in the popup
     *  @param {boolean} options.canFix Enable popup to be fixed, default false
     *  @param {boolean} options.showImage display image url as image, default false
     *  @param {boolean} options.maxChar max char to display in a cell, default 200
     *  @api stable
     */
    class PopupFeature extends Popup {
        constructor(options: {
            popupClass: string;
            closeBox: boolean;
            onclose: ((...params: any[]) => any) | undefined;
            onshow: ((...params: any[]) => any) | undefined;
            offsetBox: number | number[];
            positionning: OverlayPositioning | string | undefined;
            template: Template;
            canFix: boolean;
            showImage: boolean;
            maxChar: boolean;
        });
        /** Set the template
         * @param {Template} template A template with a list of properties to use in the popup
         */
        setTemplate(template: Template): void;
        /** Show the popup on the map
         * @param {Coordinate|undefined} coordinate Position of the popup
         * @param {Feature|Array<Feature>} features The features on the popup
         */
        show(coordinate: Coordinate | undefined, features: Feature | Feature[]): void;
        /** Fix the popup
         * @param {boolean} fix
         */
        setFix(fix: boolean): void;
        /** Is a popup fixed
         * @return {boolean}
         */
        getFix(): boolean;
        /** Get a function to use as format to get local string for an attribute
         * if the attribute is a number: Number.toLocaleString()
         * if the attribute is a date: Date.toLocaleString()
         * otherwise the attibute itself
         * @param {string} locales string with a BCP 47 language tag, or an array of such strings
         * @param {*} options Number or Date toLocaleString options
         * @return {function} a function that takes an attribute and return the formated attribute
         */
        static localString(locales: string, options: any): (...params: any[]) => any;
        /**
         * Set a close box to the popup.
         * @param {bool} b
         * @api stable
         */
        setClosebox(b: boolean): void;
        /**
         * Set the CSS class of the popup.
         * @param {string} c class name.
         * @api stable
         */
        setPopupClass(c: string): void;
        /**
         * Add a CSS class to the popup.
         * @param {string} c class name.
         * @api stable
         */
        addPopupClass(c: string): void;
        /**
         * Remove a CSS class to the popup.
         * @param {string} c class name.
         * @api stable
         */
        removePopupClass(c: string): void;
        /**
         * Set positionning of the popup
         * @param {OverlayPositioning | string | undefined} pos an OverlayPositioning
         * 		or 'auto' to var the popup choose the best position
         * @api stable
         */
        setPositioning(pos: OverlayPositioning | string | undefined): void;
        /** Check if popup is visible
        * @return {boolean}
         */
        getVisible(): boolean;
        /**
         * Hide the popup
         * @api stable
         */
        hide(): void;
    }
    /** A tooltip element to be displayed over the map and attached on the cursor position.
     * @constructor
     * @extends {Overlay.Popup}
     * @param {} options Extend Popup options
     *	@param {String} options.popupClass the a class of the overlay to style the popup.
     *  @param {number} options.maximumFractionDigits maximum digits to display on measure, default 2
     *  @param {function} options.formatLength a function that takes a number and returns the formated value, default length in meter
     *  @param {function} options.formatArea a function that takes a number and returns the formated value, default length in square-meter
     *  @param {function} options.getHTML a function that takes a feature and the info string and return a formated info to display in the tooltip, default display feature measure & info
     *	@param {Number|Array<number>} options.offsetBox an offset box
     *	@param {OverlayPositioning | string | undefined} options.positionning
     *		the 'auto' positioning var the popup choose its positioning to stay on the map.
     * @api stable
     */
    class Tooltip extends Popup {
        constructor(options: {
            popupClass: string;
            maximumFractionDigits: number;
            formatLength: (...params: any[]) => any;
            formatArea: (...params: any[]) => any;
            getHTML: (...params: any[]) => any;
            offsetBox: number | number[];
            positionning: OverlayPositioning | string | undefined;
        });
        /**
         * Set the map instance the control is associated with
         * and add its controls associated to this map.
         * @param {_ol_Map_} map The map instance.
         */
        setMap(map: _ol_Map_): void;
        /** Get the information to show in the tooltip
         * The area/length will be added if a feature is attached.
         * @param {Feature|undefined} feature the feature
         * @param {string} info the info string
         * @api
         */
        getHTML(feature: Feature | undefined, info: string): void;
        /** Set the Tooltip info
         * If information is not null it will be set with a delay,
         * thus watever the information is inserted, the significant information will be set.
         * ie. ttip.setInformation('ok'); ttip.setInformation(null); will set 'ok'
         * ttip.set('info','ok'); ttip.set('info', null); will set null
         * @param {string} what The information to display in the tooltip, default remove information
         */
        setInfo(what: string): void;
        /** Remove the current featue attached to the tip
         * Similar to setFeature() with no argument
         */
        removeFeature(): void;
        /** Format area to display in the popup.
         * Can be overwritten to display measure in a different unit (default: square-metter).
         * @param {number} area area in m2
         * @return {string} the formated area
         * @api
         */
        formatArea(area: number): string;
        /** Format area to display in the popup
         * Can be overwritten to display measure in different unit (default: meter).
         * @param {number} length length in m
         * @return {string} the formated length
         * @api
         */
        formatLength(length: number): string;
        /** Set a feature associated with the tooltips, measure info on the feature will be added in the tooltip
         * @param {Feature|Event} feature an Feature or an event (object) with a feature property
         */
        setFeature(feature: Feature | Event): void;
        /**
         * Set a close box to the popup.
         * @param {bool} b
         * @api stable
         */
        setClosebox(b: boolean): void;
        /**
         * Set the CSS class of the popup.
         * @param {string} c class name.
         * @api stable
         */
        setPopupClass(c: string): void;
        /**
         * Add a CSS class to the popup.
         * @param {string} c class name.
         * @api stable
         */
        addPopupClass(c: string): void;
        /**
         * Remove a CSS class to the popup.
         * @param {string} c class name.
         * @api stable
         */
        removePopupClass(c: string): void;
        /**
         * Set positionning of the popup
         * @param {OverlayPositioning | string | undefined} pos an OverlayPositioning
         * 		or 'auto' to var the popup choose the best position
         * @api stable
         */
        setPositioning(pos: OverlayPositioning | string | undefined): void;
        /** Check if popup is visible
        * @return {boolean}
         */
        getVisible(): boolean;
        /**
         * Set the position and the content of the popup.
         * @param {Coordinate|string} coordinate the coordinate of the popup or the HTML content.
         * @param {string|undefined} html the HTML content (undefined = previous content).
         * @example
        var popup = new Overlay.Popup();
        // Show popup
        popup.show([166000, 5992000], "Hello world!");
        // Move popup at coord with the same info
        popup.show([167000, 5990000]);
        // set new info
        popup.show("New informations");
        * @api stable
         */
        show(coordinate: Coordinate | undefined, features: Feature | Feature[]): void;
        /**
         * Hide the popup
         * @api stable
         */
        hide(): void;
    }
}

declare namespace ext {
    /** Ajax request
     * @fires success
     * @fires error
     * @param {*} options
     *  @param {string} options.auth Authorisation as btoa("username:password");
     *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
     */
    function Ajax(options: {
        auth: string;
        dataType: string;
    }): void;
    /** Vanilla JS helper to manipulate DOM without jQuery
     * @see https://github.com/nefe/You-Dont-Need-jQuery
     * @see https://plainjs.com/javascript/
     * @see http://youmightnotneedjquery.com/
     */
    var element: any;
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
declare namespace featureAnimation {


    /** Feature animation base class
     * Use the {@link _ol_Map_#animateFeature} or {@link _ol_layer_Vector_#animateFeature} to animate a feature
     * on postcompose in a map or a layer
    * @constructor
    * @fires animationstart|animationend
    * @param {featureAnimationOptions} options
    *	@param {Number} options.duration duration of the animation in ms, default 1000
    *	@param {bool} options.revers revers the animation direction
    *	@param {Number} options.repeat number of time to repeat the animation, default 0
    *	@param {oo.Style} options.hiddenStyle a style to display the feature when playing the animation
    *		to be used to make the feature selectable when playing animation
    *		(@see {@link ../examples/map.featureanimation.select.html}), default the feature
    *		will be hidden when playing (and niot selectable)
    *	@param {easing.Function} options.fade an easing function used to fade in the feature, default none
    *	@param {easing.Function} options.easing an easing function for the animation, default easing.linear
     */
    export class featureAnimation {
        constructor(options: {
            duration: number;
            revers: boolean;
            repeat: number;
            hiddenStyle: Style;
            fade: ((p0: number) => number);
            easing: ((p0: number) => number);
        });
        /** Function to perform manipulations onpostcompose.
         * This function is called with an featureAnimationEvent argument.
         * The function will be overridden by the child implementation.
         * Return true to keep this function for the next frame, false to remove it.
         * @param {featureAnimationEvent} e
         * @return {bool} true to continue animation.
         * @api
         */
        animate(e: featureAnimationEvent): boolean;
    }

    /** Bounce animation:
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationBounceOptions} options
     *	@param {number} options.bounce number of bounce, default 3
     *	@param {number} options.amplitude bounce amplitude,default 40
     *	@param {easing} options.easing easing used for decaying amplitude, use function(){return 0} for no decay, default easing.linear
     *	@param {number} options.duration duration in ms, default 1000
     */
    class Bounce extends featureAnimation {
        constructor(options: {
            bounce: number;
            amplitude: number;
            easing: ((p0: number) => number);
            duration: number;
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Drop animation: drop a feature on the map
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationDropOptions} options
     *  @param {Number} options.speed speed of the feature if 0 the duration parameter will be used instead, default 0
     *  @param {Number} options.side top or bottom, default top
     */
    class Drop extends featureAnimation {
        constructor(options: {
            speed: number;
            side: number;
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Fade animation: feature fade in
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationOptions} options
     */
    class Fade extends featureAnimation {
        constructor(options: featureAnimationOptions);
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Do nothing for a given duration
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationShowOptions} options
     *
     */
    class None extends featureAnimation {
        constructor(options: featureAnimationShowOptions);
        /** Animate: do nothing during the laps time
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Do nothing
     * @constructor
     * @extends {featureAnimation}
     */
    class Null extends featureAnimation {
        /** Function to perform manipulations onpostcompose.
         * This function is called with an featureAnimationEvent argument.
         * The function will be overridden by the child implementation.
         * Return true to keep this function for the next frame, false to remove it.
         * @param {featureAnimationEvent} e
         * @return {bool} true to continue animation.
         * @api
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Path animation: feature follow a path
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationPathOptions} options extend featureAnimation options
     *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
     *  @param {Number|boolean} options.rotate rotate the symbol when following the path, true or the initial rotation, default false
     *  @param {LineString|Feature} options.path the path to follow
     */
    class Path extends featureAnimation {
        constructor(options: {
            speed: number;
            rotate: number | boolean;
            path: LineString | Feature;
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Shakee animation:
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationShakeOptions} options
     *	@param {number} options.bounce number o bounds, default 6
     *	@param {number} options.amplitude amplitude of the animation, default 40
     *	@param {bool} options.horizontal shake horizontally default false (vertical)
     */
    class Shake extends featureAnimation {
        constructor(options: {
            bounce: number;
            amplitude: number;
            horizontal: boolean;
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Show an object for a given duration
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationOptions} options
     */
    class Show extends featureAnimation {
        constructor(options: featureAnimationOptions);
        /** Animate: just show the object during the laps time
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): boolean;
    }
    /** Slice animation: feature enter from left
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationSlideOptions} options
     *  @param {Number} options.speed speed of the animation, if 0 the duration parameter will be used instead, default 0
     */
    class Slide extends featureAnimation {
        constructor(options: {
            speed: number;
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): void;
    }
    /** Teleport a feature at a given place
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationOptions} options
     */
    class Teleport extends featureAnimation {
        constructor(options: featureAnimationOptions);
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): void;
    }
    /** Slice animation: feature enter from left
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationThrowOptions} options
     *  @param {left|right} options.side side of the animation, default left
     */
    class Throw extends featureAnimation {
        constructor(options: {
            side: 'left' | 'right';
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): void;
    }
    /** Zoom animation: feature zoom in (for points)
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationZoomOptions} options
     *  @param {bool} options.zoomOut to zoom out
     */
    class Zoom extends featureAnimation {
        constructor(options: {
            zoomOut: boolean;
        });
        /** Animate
        * @param {featureAnimationEvent} e
         */
        animate(e: featureAnimationEvent): void;
    }
    /** Zoom animation: feature zoom out (for points)
     * @constructor
     * @extends {featureAnimation}
     * @param {featureAnimationZoomOptions} options
     */
    class ZoomOut extends featureAnimation {
        constructor(options: featureAnimationZoomOptions);
        /** Function to perform manipulations onpostcompose.
         * This function is called with an featureAnimationEvent argument.
         * The function will be overridden by the child implementation.
         * Return true to keep this function for the next frame, false to remove it.
         * @param {featureAnimationEvent} e
         * @return {bool} true to continue animation.
         * @api
         */
        animate(e: featureAnimationEvent): boolean;
    }
}
/**
 * @classdesc
 *render3D 3D vector layer rendering
 * @constructor
 * @param {Object} param
 *  @param {layer.Vector} param.layer the layer to display in 3D
 *  @param {Style} options.styler drawing style
 *  @param {number} param.maxResolution  max resolution to render 3D
 *  @param {number} param.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} param.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 */
export class render3D {
    constructor(param: {
        layer: Vector;
        maxResolution: number;
        defaultHeight: number;
        height: ((...params: any[]) => any) | string | number;
    });
    /**
     * Set style associated with the renderer
     * @param {Style} s
     */
    setStyle(s: Style): void;
    /**
     * Get style associated with the renderer
     * @return {Style}
     */
    getStyle(): Style;
    /** Calculate 3D at potcompose
     */
    onPostcompose_(): void;
    /** Set layer to render 3D
     */
    setLayer(): void;
    /** Create a function that return height of a feature
    *	@param {function|string|number} h a height function or a popertie name or a fixed value
    *	@return {function} function(f) return height of the feature f
     */
    getHfn(h: ((...params: any[]) => any) | string | number): (...params: any[]) => any;
    /** Animate rendering
     * @param {olx.render3D.animateOptions}
     *  @param {string|function|number} param.height an attribute name or a function returning height of a feature or a fixed value
     *  @param {number} param.duration the duration of the animatioin ms, default 1000
     *  @param {easing} param.easing an ol easing function
     *	@api
     */
    animate(options: {
        height: ((...params: any[]) => any) | string | number,
        duration: number
        easing: ((p0: number) => number);

    }): void;
    /** Check if animation is on
    *	@return {bool}
     */
    animating(): boolean;
    /**
     */
    getFeatureHeight(): void;
    /**
     */
    hvector_(): void;
    /**
     */
    getFeature3D_(): void;
    /**
     */
    drawFeature3D_(): void;
}
/**
* Hexagonal grids
* @classdesc HexGrid is a class to compute hexagonal grids
* @see http://www.redblobgames.com/grids/hexagons
*
* @constructor HexGrid
* @extends {Object}
* @param {Object} [options]
*	@param {number} [options.Size] Size of the exagon in map units, default 80000
*	@param {Coordinate} [options.origin] orgin of the grid, default [0,0]
*	@param {HexagonLayout} [options.layout] grid layout, default pointy
 */
export class HexGrid extends Object {
    constructor(options?: {
        Size?: number;
        origin?: Coordinate;
        layout?: HexagonLayout;
    });
    /** Layout
     */
    layout: any;
    /** Set layout
    * @param {HexagonLayout | undefined} layout name, default pointy
     */
    setLayout(layout: HexagonLayout | undefined): void;
    /** Get layout
    * @return {HexagonLayout} layout name
     */
    getLayout(): HexagonLayout;
    /** Set hexagon origin
    * @param {Coordinate} coord origin
     */
    setOrigin(coord: Coordinate): void;
    /** Get hexagon origin
    * @return {Coordinate} coord origin
     */
    getOrigin(): Coordinate;
    /** Set hexagon Size
    * @param {number} hexagon Size
     */
    setSize(hexagon: number): void;
    /** Get hexagon Size
    * @return {number} hexagon Size
     */
    getSize(): number;
    /** Convert cube to axial coords
    * @param {Coordinate} c cube coordinate
    * @return {Coordinate} axial coordinate
     */
    cube2hex(c: Coordinate): Coordinate;
    /** Convert axial to cube coords
    * @param {Coordinate} h axial coordinate
    * @return {Coordinate} cube coordinate
     */
    hex2cube(h: Coordinate): Coordinate;
    /** Convert offset to axial coords
    * @param {Coordinate} h axial coordinate
    * @return {Coordinate} offset coordinate
     */
    hex2offset(h: Coordinate): Coordinate;
    /** Convert axial to offset coords
    * @param {Coordinate} o offset coordinate
    * @return {Coordinate} axial coordinate
     */
    offset2hex(o: Coordinate): Coordinate;
    /** Convert offset to cube coords
    * @param {Coordinate} c cube coordinate
    * @return {Coordinate} offset coordinate
    * /
    HexGrid.prototype.cube2offset = function(c)
    {	return hex2offset(cube2hex(c));
    };
    /** Convert cube to offset coords
    * @param {Coordinate} o offset coordinate
    * @return {Coordinate} cube coordinate
    * /
    HexGrid.prototype.offset2cube = function (o)
    {	return hex2cube(offset2Hex(o));
    };
    /** Round cube coords
    * @param {Coordinate} h cube coordinate
    * @return {Coordinate} rounded cube coordinate
     */
    cube_round(c: Coordinate, o: Coordinate, h: Coordinate): void;
    /** Round axial coords
    * @param {Coordinate} h axial coordinate
    * @return {Coordinate} rounded axial coordinate
     */
    hex_round(h: Coordinate): Coordinate;
    /** Get hexagon corners
     */
    hex_corner(): void;
    /** Get hexagon coordinates at a coordinate
    * @param {Coordinate} coord
    * @return {Arrary<Coordinate>}
     */
    getHexagonAtCoord(coord: Coordinate): Array<Coordinate>;
    /** Get hexagon coordinates at hex
    * @param {Coordinate} hex
    * @return {Arrary<Coordinate>}
     */
    getHexagon(hex: Coordinate): Array<Coordinate>;
    /** Convert hex to coord
    * @param {hex} hex
    * @return {Coordinate}
     */
    hex2coord(hex: hex): Coordinate;
    /** Convert coord to hex
    * @param {Coordinate} coord
    * @return {hex}
     */
    coord2hex(coord: Coordinate): hex;
    /** Calculate distance between to hexagon (number of cube)
    * @param {Coordinate} a first cube coord
    * @param {Coordinate} a second cube coord
    * @return {number} distance
     */
    cube_distance(a: Coordinate, b: Coordinate): number;
    /** Calculate line between to hexagon
    * @param {Coordinate} a first cube coord
    * @param {Coordinate} b second cube coord
    * @return {Array<Coordinate>} array of cube coordinates
     */
    cube_line(a: Coordinate, b: Coordinate): Coordinate[];
    /** Get the neighbors for an hexagon
    * @param {Coordinate} h axial coord
    * @param {number} direction
    * @return { Coordinate | Array<Coordinate> } neighbor || array of neighbors
     */
    hex_neighbors(h: Coordinate, direction: number): Coordinate | Coordinate[];
    /** Get the neighbors for an hexagon
    * @param {Coordinate} c cube coord
    * @param {number} direction
    * @return { Coordinate | Array<Coordinate> } neighbor || array of neighbors
     */
    cube_neighbors(c: Coordinate, direction: number): Coordinate | Coordinate[];
}



