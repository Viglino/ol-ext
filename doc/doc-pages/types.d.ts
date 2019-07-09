import Point from "ol/geom/Point";
import Projection from 'ol/proj';

/** @namespace ol
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol.html}
 */
declare namespace ol {
    /** @namespace ol.coordinate
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html}
     */
    namespace coordinate {
        /** Compute a convex hull using Andrew's Monotone Chain Algorithm
         * @param {Array<ol.geom.Point>} points an array of 2D points
         * @return {Array<ol.geom.Point>} the convex hull vertices
         */
        function convexHull(points: ol.geom.Point[]): ol.geom.Point[];
        /** Convert coordinate to French DFCI grid
         * @param {ol/coordinate} coord
         * @param {number} level [0-3]
         * @param {ol/proj/Projection} projection of the coord, default EPSG:27572
         * @return {String} the DFCI index
         */
        function toDFCI(coord: ol/coordinate, level: number, projection: ol/proj/Projection): string;
        /** Get coordinate from French DFCI index
         * @param {String} index the DFCI index
         * @param {ol/proj/Projection} projection result projection, default EPSG:27572
         * @return {ol/coordinate} coord
         */
        function fromDFCI(index: string, projection: ol/proj/Projection): ol/coordinate;
        /** The string is a valid DFCI index
         * @param {string} index DFCI index
         * @return {boolean}
         */
        function validDFCI(index: string): boolean;
        /** Coordinate is valid for DFCI
         * @param {ol/coordinate} coord
         * @param {ol/proj/Projection} projection result projection, default EPSG:27572
         * @return {boolean}
         */
        function validDFCICoord(coord: ol/coordinate, projection: ol/proj/Projection): boolean;
        /** Distance beetween 2 points
        *	Usefull geometric functions
        * @param {ol.Coordinate} p1 first point
        * @param {ol.Coordinate} p2 second point
        * @return {number} distance
         */
        function dist2d(p1: ol.Coordinate, p2: ol.Coordinate): number;
        /** 2 points are equal
        *	Usefull geometric functions
        * @param {ol.Coordinate} p1 first point
        * @param {ol.Coordinate} p2 second point
        * @return {boolean}
         */
        function equal(p1: ol.Coordinate, p2: ol.Coordinate): boolean;
        /** Get center coordinate of a feature
        * @param {ol.Feature} f
        * @return {ol.coordinate} the center
         */
        function getFeatureCenter(f: ol.Feature): ol.coordinate;
        /** Get center coordinate of a geometry
        * @param {ol.Feature} geom
        * @return {ol.Coordinate} the center
         */
        function getGeomCenter(geom: ol.Feature): ol.Coordinate;
        /** Offset a polyline
         * @param {Array<ol.Coordinate>} coords
         * @param {number} offset
         * @return {Array<ol.Coordinate>} resulting coord
         * @see http://stackoverflow.com/a/11970006/796832
         * @see https://drive.google.com/viewerng/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxqa2dhZGdldHN0b3JlfGd4OjQ4MzI5M2Y0MjNmNzI2MjY
         */
        function offsetCoords(coords: ol.Coordinate[], offset: number): ol.Coordinate[];
        /** Find the segment a point belongs to
         * @param {ol.Coordinate} pt
         * @param {Array<ol.Coordinate>} coords
         * @return {} the index (-1 if not found) and the segment
         */
        function findSegment(pt: ol.Coordinate, coords: ol.Coordinate[]): any;
        /**
         * Split a Polygon geom with horizontal lines
         * @param {Array<ol.Coordinate>} geom
         * @param {number} y the y to split
         * @param {number} n contour index
         * @return {Array<Array<ol.Coordinate>>}
         */
        function splitH(geom: ol.Coordinate[], y: number, n: number): ol.Coordinate[][];
    }
    /** @namespace ol.source
     * @see {@link https://openlayers.org/en/master/apidoc/module-ol_source.html}
     */
    namespace source {
        /** Abstract base class; normally only used for creating subclasses. Bin collector for data
         * @constructor
         * @extends {ol.source.Vector}
         * @param {Object} options ol.source.VectorOptions + grid option
         *  @param {ol.source.Vector} options.source Source
         *  @param {boolean} options.listenChange listen changes (move) on source features to recalculate the bin, default true
         *  @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
         *  @param {(bin: ol.Feature, features: Array<ol.Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
         */
        class BinBase extends ol.source.Vector {
            constructor(options: {
                source: ol.source.Vector;
                listenChange: boolean;
            });
            /**
             * Get the bin that contains a feature
             * @param {ol.Feature} f the feature
             * @return {ol.Feature} the bin or null it doesn't exit
             */
            getBin(f: ol.Feature): ol.Feature;
            /** Get the grid geometry at the coord
             * @param {ol.Coordinate} coord
             * @param {Object} attributes add key/value to this object to add properties to the grid feature
             * @returns {ol.geom.Polygon}
             * @api
             */
            getGridGeomAt(coord: ol.Coordinate, attributes: any): ol.geom.Polygon;
            /** Get the bean at a coord
             * @param {ol.Coordinate} coord
             * @param {boolean} create true to create if doesn't exit
             * @return {ol.Feature} the bin or null it doesn't exit
             */
            getBinAt(coord: ol.Coordinate, create: boolean): ol.Feature;
            /** Clear all bins and generate a new one.
             */
            reset(): void;
            /**
             * Get features without circular dependencies (vs. getFeatures)
             * @return {Array<ol.Feature>}
             */
            getGridFeatures(): ol.Feature[];
            /** Create bin attributes using the features it contains when exporting
             * @param {ol.Feature} bin the bin to export
             * @param {Array<ol.Features>} features the features it contains
             */
            _flatAttributes(bin: ol.Feature, features: ol.Features[]): void;
            /**
             * Get the orginal source
             * @return {ol.source.Vector}
             */
            getSource(): ol.source.Vector;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /**
        * @constructor ol.source.DBPedia
        * @extends {ol.source.Vector}
        * @param {olx.source.DBPedia=} opt_options
         */
        class DBPedia extends ol.source.Vector {
            constructor(opt_options?: olx.source.DBPedia);
            /** Url for DBPedia SPARQL
             */
            _url: any;
            /** Max resolution to load features
             */
            _maxResolution: any;
            /** Result language
             */
            _lang: any;
            /** Query limit
             */
            _limit: any;
            /** Decode RDF attributes and choose to add feature to the layer
            * @param {feature} the feature
            * @param {attributes} RDF attributes
            * @param {lastfeature} last feature added (null if none)
            * @return {boolean} true: add the feature to the layer
            * @API stable
             */
            readFeature(the: feature, RDF: attributes, last: lastfeature): boolean;
            /** Set RDF query subject, default: select label, thumbnail, abstract and type
            * @API stable
             */
            querySubject(): void;
            /** Set RDF query filter, default: select language
            * @API stable
             */
            queryFilter(): void;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /** DFCI source: a source to display the French DFCI grid on a map
         * @see http://ccffpeynier.free.fr/Files/dfci.pdf
         * @constructor ol.source.DFCI
         * @extends {ol/source/Vector}
         * @param {any} options Vector source options
         *  @param {Array<Number>} resolutions a list of resolution to change the drawing level, default [1000,100,20]
         */
        class DFCI extends ol/source/Vector {
            constructor(options: any, resolutions: Number[]);
            /** Cacluate grid according extent/resolution
             */
            _calcGrid(): void;
            /** Get features
             *
             */
            _getFeatures(): void;
        }
        /** Delaunay source
         * Calculate a delaunay triangulation from points in a source
         * @param {*} options extend ol/source/Vector options
         *  @param {ol/source/Vector} options.source the source that contains the points
         */
        function Delaunay(options: {
            source: ol/source/Vector;
        }): void;
        /** A source for INSEE grid
         * @constructor
         * @extends {ol.source.Vector}
         * @param {Object} options ol.source.VectorOptions + grid option
         *  @param {ol.source.Vector} options.source Source
         *  @param {number} [options.size] size of the grid in meter, default 200m
         *  @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
         *  @param {(bin: ol.Feature, features: Array<ol.Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
         */
        class FeatureBin extends ol.source.Vector {
            constructor(options: {
                source: ol.source.Vector;
                size?: number;
            });
            /** Set grid size
             * @param {ol.Feature} features
             */
            setFeatures(features: ol.Feature): void;
            /** Get the grid geometry at the coord
             * @param {ol.Coordinate} coord
             * @returns {ol.geom.Polygon}
             * @api
             */
            getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /** Layer source with georeferencement to place it on a map
        * @constructor
        * @extends {ol.source.ImageCanvas}
        * @param {olx.source.GeoImageOptions=} options
         */
        class GeoImage extends ol.source.ImageCanvas {
            constructor(options?: olx.source.GeoImageOptions);
            /**
             * Get coordinate of the image center.
             * @return {ol.Coordinate} coordinate of the image center.
             * @api stable
             */
            getCenter(): ol.Coordinate;
            /**
             * Set coordinate of the image center.
             * @param {ol.Coordinate} coordinate of the image center.
             * @api stable
             */
            setCenter(coordinate: ol.Coordinate): void;
            /**
             * Get image scale.
             * @return {ol.size} image scale (along x and y axis).
             * @api stable
             */
            getScale(): ol.size;
            /**
             * Set image scale.
             * @param {ol.size|Number} image scale (along x and y axis or both).
             * @api stable
             */
            setScale(image: ol.size | number): void;
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
             * Get image crop extent.
             * @return {ol.extent} image crop extent.
             * @api stable
             */
            getCrop(): ol.extent;
            /**
             * Set image mask.
             * @param {ol.geom.LineString} coords of the mask
             * @api stable
             */
            setMask(coords: ol.geom.LineString): void;
            /**
             * Get image mask.
             * @return {ol.geom.LineString} coords of the mask
             * @api stable
             */
            getMask(): ol.geom.LineString;
            /**
             * Set image crop extent.
             * @param {ol.extent|Number} image crop extent or a number to crop from original size.
             * @api stable
             */
            setCrop(image: ol.extent | number): void;
        }
        /** IGN's Geoportail WMTS source
         * @constructor
         * @extends {ol.source.WMTS}
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
        class Geoportail extends ol.source.WMTS {
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
             * @param {ol.Coordinate} coord
             * @param {Number} resolution
             * @param {ol.proj.Projection} projection default the source projection
             * @param {Object} options
             *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
             * @return {String|undefined} GetFeatureInfo URL.
             */
            getFeatureInfoUrl(coord: ol.Coordinate, resolution: number, projection: ol.proj.Projection, options: {
                INFO_FORMAT: string;
            }): string | undefined;
            /** Get feature info
             * @param {ol.Coordinate} coord
             * @param {Number} resolution
             * @param {ol.proj.Projection} projection default the source projection
             * @param {Object} options
             *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
             *  @param {function} options.callback a function that take the response as parameter
             *  @param {function} options.error function called when an error occurred
             */
            getFeatureInfo(coord: ol.Coordinate, resolution: number, projection: ol.proj.Projection, options: {
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
         * @extends {ol.source.Vector}
         * @param {Object} options ol.source.VectorOptions + grid option
         *  @param {ol.source.Vector} options.source Source
         *  @param {number} [options.size] size of the grid in meter, default 200m
         *  @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
         *  @param {(bin: ol.Feature, features: Array<ol.Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
         */
        class GridBin extends ol.source.Vector {
            constructor(options: {
                source: ol.source.Vector;
                size?: number;
            });
            /** Set grid projection
             * @param {ol.ProjectionLike} proj
             */
            setGridProjection(proj: ol.ProjectionLike): void;
            /** Set grid size
             * @param {number} size
             */
            setSize(size: number): void;
            /** Get the grid geometry at the coord
             * @param {ol.Coordinate} coord
             * @returns {ol.geom.Polygon}
             * @api
             */
            getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /** A source for hexagonal binning
         * @constructor
         * @extends {ol.source.Vector}
         * @param {Object} options ol.source.VectorOptions + ol.HexGridOptions
         *  @param {ol.source.Vector} options.source Source
         *  @param {number} [options.size] size of the hexagon in map units, default 80000
         *  @param {ol.coordinate} [options.origin] origin of the grid, default [0,0]
         *  @param {import('../render/HexGrid').HexagonLayout} [options.layout] grid layout, default pointy
         *  @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
         *  @param {(bin: ol.Feature, features: Array<ol.Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
         */
        class HexBin extends ol.source.Vector {
            constructor(options: {
                source: ol.source.Vector;
                size?: number;
                origin?: ol.coordinate;
            });
            /** The HexGrid
             * 	@type {ol.HexGrid}
             */
            _hexgrid: ol.HexGrid;
            /** Get the hexagon geometry at the coord
             * @param {ol.Coordinate} coord
             * @returns {ol.geom.Polygon}
             * @api
             */
            getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
            /**	Set the inner HexGrid size.
             * 	@param {number} newSize
             * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
             */
            setSize(newSize: number, noreset: boolean): void;
            /**	Get the inner HexGrid size.
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
             * 	@param {ol.Coordinate} newLayout
             * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
             */
            setOrigin(newLayout: ol.Coordinate, noreset: boolean): void;
            /**	Get the inner HexGrid origin.
             * 	@return {ol.Coordinate}
             */
            getOrigin(): ol.Coordinate;
            /**
             * Get hexagons without circular dependencies (vs. getFeatures)
             * @return {Array<ol.Feature>}
             */
            getHexFeatures(): ol.Feature[];
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /** A source for INSEE grid
         * @constructor
         * @extends {ol.source.Vector}
         * @param {Object} options ol.source.VectorOptions + grid option
         *  @param {ol.source.Vector} options.source Source
         *  @param {number} [options.size] size of the grid in meter, default 200m
         *  @param {(f: ol.Feature) => ol.geom.Point} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
         *  @param {(bin: ol.Feature, features: Array<ol.Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
         */
        class InseeBin extends ol.source.Vector {
            constructor(options: {
                source: ol.source.Vector;
                size?: number;
            });
            /** Set grid size
             * @param {number} size
             */
            setSize(size: number): void;
            /** Get grid size
             * @return {number} size
             */
            getSize(): number;
            /** Get the grid geometry at the coord
             * @param {ol.Coordinate} coord
             * @returns {ol.geom.Polygon}
             * @api
             */
            getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
            /** Get grid extent
             * @param {ol.ProjectionLike} proj
             * @return {ol.Extent}
             */
            getGridExtent(proj: ol.ProjectionLike): ol.Extent;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /**
        * @constructor ol.source.Mapillary
        * @extends {ol.source.Vector}
        * @param {olx.source.Mapillary=} options
         */
        class Mapillary extends ol.source.Vector {
            constructor(options?: olx.source.Mapillary);
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
            readFeature(the: feature, wiki: attributes): boolean;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /**
         * OSM layer using the Ovepass API
         * @constructor ol.source.Overpass
         * @extends {ol.source.Vector}
         * @param {any} options
         *  @param {string} options.url service url, default: https://overpass-api.de/api/interpreter
         *  @param {Array<string>} options.filter an array of tag filters, ie. ["key", "key=value", "key~value", ...]
         *  @param {boolean} options.node get nodes, default: true
         *  @param {boolean} options.way get ways, default: true
         *  @param {boolean} options.rel get relations, default: false
         *  @param {number} options.maxResolution maximum resolution to load features
         *  @param {string|ol.Attribution|Array<string>} options.attributions source attribution, default OSM attribution
         *  @param {ol.loadingstrategy} options.strategy loading strategy, default ol.loadingstrategy.bbox
         */
        class Overpass extends ol.source.Vector {
            constructor(options: {
                url: string;
                filter: string[];
                node: boolean;
                way: boolean;
                rel: boolean;
                maxResolution: number;
                attributions: string | ol.Attribution | string[];
                strategy: ol.loadingstrategy;
            });
            /** Ovepass API Url
             */
            _url: any;
            /** Max resolution to load features
             */
            _maxResolution: any;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
        /**
        * @constructor ol.source.WikiCommons
        * @extends {ol.source.Vector}
        * @param {olx.source.WikiCommons=} options
         */
        class WikiCommons extends ol.source.Vector {
            constructor(options?: olx.source.WikiCommons);
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
            readFeature(the: feature, wiki: attributes): boolean;
            /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
             */
            clear(): void;
        }
    }
    /** A control is a visible widget with a DOM element in a fixed position on the screen.
     * They can involve user input (buttons), or be informational only;
     * the position is determined using CSS. B
     * y default these are placed in the container with CSS class name ol-overlaycontainer-stopevent,
     * but can use any outside DOM element.
     * @namespace ol.control
     * @see {@link https://openlayers.org/en/master/apidoc/module-ol_control.html}
     */
    namespace control {
        /** Openlayers base class for controls.
         * A control is a visible widget with a DOM element in a fixed position on the screen.
         * They can involve user input (buttons), or be informational only; the position is determined using CSS.
         * @namespace ol.control.Control
         * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_control_Control.html}
         */
        namespace Control { }
        /**
         * @classdesc
         *   Attribution Control integrated in the canvas (for jpeg/png
         * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options extend the ol.control options.
         *  @param {ol.style.Style} options.style style used to draw the title.
         */
        class CanvasBase extends ol.control.Control {
            constructor(options?: {
                style: ol.style.Style;
            });
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * This is the base class for Select controls on attributes values.
         * Abstract base class;
         * normally only used for creating subclasses and not instantiated in apps.
         *
         * @constructor
         * @extends {ol.control.Control}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol.Collection<ol.Feature>} options.features a collection of feature to search in, the collection will be kept in date while selection
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in if no features set
         */
        class SelectBase extends ol.control.Control {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                features: ol.Collection<ol.Feature>;
                source: ol/source/Vector | ol/source/Vector[];
            });
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
            /** Select features by attributes
             * @param {*} options
             *  @param {Array<ol/source/Vector|undefined} options.sources source to apply rules, default the select sources
             *  @param {bool} options.useCase case sensitive, default false
             *  @param {bool} options.matchAll match all conditions, default false
             *  @param {Array<conditions>} options.conditions array of conditions
             * @return {Array<ol.Feature>}
             * @fires select
             */
            doSelect(options: {
                useCase: boolean;
                matchAll: boolean;
                conditions: conditions[];
            }): ol.Feature[];
        }
        /**
         * Search Control.
         * This is the base class for search controls. You can use it for simple custom search or as base to new class.
         * @see ol.control.SearchFeature
         * @see ol.control.SearchPhoton
         *
         * @constructor
         * @extends {ol.control.Control}
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
         *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
         *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *  @param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
         *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index.
         *  @param {function} options.autocomplete a function that take a search string and callback function to send an array
         */
        class Search extends ol.control.Control {
            constructor(options?: {
                className: string;
                target: Element | string | undefined;
                label: string | undefined;
                placeholder: string | undefined;
                inputLabel: string | undefined;
                noCollapse: string | undefined;
                typing: number | undefined;
                minLength: integer | undefined;
                maxItems: integer | undefined;
                maxHistory: integer | undefined;
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
            autocomplete(s: string, cback: (...params: any[]) => any): Array | false;
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
         * @extends {ol.control.Search}
         * @fires select
         * @param {any} options extend ol.control.Search options
         *	@param {string} options.className control class name
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
         *
         *	@param {string|undefined} options.url Url of the search api
         *	@param {string | undefined} options.authentication: basic authentication for the search API as btoa("login:pwd")
         */
        class SearchJSON extends ol.control.Search {
            constructor(options: {
                className: string;
                target: Element | string | undefined;
                label: string | undefined;
                placeholder: string | undefined;
                typing: number | undefined;
                minLength: integer | undefined;
                maxItems: integer | undefined;
                handleResponse: ((...params: any[]) => any) | undefined;
                url: string | undefined;
                authentication:: string | undefined;
            });
            /** Autocomplete function (ajax request to the server)
            * @param {string} s search string
            * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
             */
            autocomplete(s: string, cback: (...params: any[]) => any): void;
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
         * @extends {ol.control.SearchJSON}
         * @fires select
         * @param {Object=} Control options.
         *	@param {string} options.className control class name
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
         *
         *	@param {string|undefined} options.url Url to photon api, default "http://photon.komoot.de/api/"
         *	@param {string|undefined} options.lang Force preferred language, default none
         *	@param {boolean} options.position Search, with priority to geo position, default false
         *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return street + name + contry
         */
        class SearchPhoton extends ol.control.SearchJSON {
            constructor(Control?: any);
            /** Returns the text to be displayed in the menu
            *	@param {ol.Feature} f the feature
            *	@return {string} the text to be displayed in the index
            *	@api
             */
            getTitle(f: ol.Feature): string;
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
            autocomplete(s: string, cback: (...params: any[]) => any): void;
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
        /**
         * Search places using the French National Base Address (BAN) API.
         *
         * @constructor
         * @extends {ol.control.SearchJSON}
         * @fires select
         * @param {any} options extend ol.control.SearchJSON options
         *	@param {string} options.className control class name
         *	@param {boolean | undefined} options.apiKey the service api key.
         *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *
         *	@param {StreetAddress|PositionOfInterest|CadastralParcel|Commune} options.type type of search. Using Commune will return the INSEE code, default StreetAddress,PositionOfInterest
         * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
         */
        class SearchGeoportail extends ol.control.SearchJSON {
            constructor(options: {
                className: string;
                apiKey: boolean | undefined;
                authentication:: string | undefined;
                target: Element | string | undefined;
                label: string | undefined;
                placeholder: string | undefined;
                typing: number | undefined;
                minLength: integer | undefined;
                maxItems: integer | undefined;
                type: StreetAddress | PositionOfInterest | CadastralParcel | Commune;
            });
            /** Returns the text to be displayed in the menu
             *	@param {ol.Feature} f the feature
             *	@return {string} the text to be displayed in the index
             *	@api
             */
            getTitle(f: ol.Feature): string;
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
            autocomplete(s: string, cback: (...params: any[]) => any): void;
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
         * @classdesc OpenLayers 3 Layer Switcher Control.
         * @fires drawlist
         * @fires toggle
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options
         *  @param {function} options.displayInLayerSwitcher function that takes a layer and return a boolean if the layer is displayed in the switcher, default test the displayInLayerSwitcher layer attribute
         *  @param {boolean} options.show_progress show a progress bar on tile layers, default false
         *  @param {boolean} options.mouseover show the panel on mouseover, default false
         *  @param {boolean} options.reordering allow layer reordering, default true
         *  @param {boolean} options.trash add a trash button to delete the layer, default false
         *  @param {function} options.oninfo callback on click on info button, if none no info button is shown DEPRECATED: use on(info) instead
         *  @param {boolean} options.extent add an extent button to zoom to the extent of the layer
         *  @param {function} options.onextent callback when click on extent, default fits view to extent
         *  @param {number} options.drawDelay delay in ms to redraw the layer (usefull to prevent flickering when manipulating the layers)
         *  @param {boolean} options.collapsed collapse the layerswitcher at beginning, default true
         *
         * Layers attributes that control the switcher
         *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
         *	- displayInLayerSwitcher {boolean} display in switcher, default true
         *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
         */
        class LayerSwitcher extends ol.control.Control {
            constructor(options?: {
                displayInLayerSwitcher: (...params: any[]) => any;
                show_progress: boolean;
                mouseover: boolean;
                reordering: boolean;
                trash: boolean;
                oninfo: (...params: any[]) => any;
                extent: boolean;
                onextent: (...params: any[]) => any;
                drawDelay: number;
                collapsed: boolean;
            });
            /** List of tips for internationalization purposes
             */
            tip: any;
            /** Test if a layer should be displayed in the switcher
             * @param {ol.layer} layer
             * @return {boolean} true if the layer is displayed
             */
            displayInLayerSwitcher(layer: ol.layer): boolean;
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
             * @param {ol.layer} layer
             */
            _setLayerForLI(li: Element, layer: ol.layer): void;
            /** Get the layer associated with a li
             * @param {Element} li
             * @return {ol.layer}
             */
            _getLayerForLI(li: Element): ol.layer;
            /**
             *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
             */
            drawPanel(): void;
            /** Change layer visibility according to the baselayer option
             * @param {ol.layer}
             * @param {Array<ol.layer>} related layers
             */
            switchLayerVisibility(l: ol.layer, related: ol.layer[]): void;
            /** Check if layer is on the map (depending on zoom and extent)
             * @param {ol.layer}
             * @return {boolean}
             */
            testLayerVisibility(layer: ol.layer): boolean;
            /** Render a list of layer
             * @param {Elemen} element to render
             * @layers {Array{ol.layer}} list of layer to show
             * @api stable
             */
            drawList(element: Elemen): void;
        }
        /** Control bar for OL3
         * The control bar is a container for other controls. It can be used to create toolbars.
         * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {bool} options.group is a group, default false
         *	@param {bool} options.toggleOne only one toggle control is active at a time, default false
         *	@param {bool} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
         *	@param {Array<_ol_control_>} options.controls a list of control to add to the bar
         */
        class Bar extends ol.control.Control {
            constructor(options?: {
                className: string;
                group: boolean;
                toggleOne: boolean;
                autoDeactivate: boolean;
                controls: _ol_control_[];
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
            setPosition(pos: top | left | bottom | right): void;
            /** Add a control to the bar
            *	@param {_ol_control_} c control to add
             */
            addControl(c: _ol_control_): void;
            /** Deativate all controls in a bar
            * @param {_ol_control_} except a control
             */
            deactivateControls(except: _ol_control_): void;
            /** Auto activate/deactivate controls in the bar
            * @param {boolean} b activate/deactivate
             */
            setActive(b: boolean): void;
            /** Post-process an activated/deactivated control
            *	@param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
             */
            onActivateControl_(e: ol.event): void;
            /**
             * @param {string} name of the control to search
             * @return {ol.control.Control}
             */
            getControlsByName(name: string): ol.control.Control;
        }
        /** A simple push button control
        * @constructor
        * @extends {ol.control.Control}
        * @param {Object=} options Control options.
        *	@param {String} options.className class of the control
        *	@param {String} options.title title of the control
        *	@param {String} options.name an optional name, default none
        *	@param {String} options.html html to insert in the control
        *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
         */
        class Button extends ol.control.Control {
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
         * @extends {ol.control.Attribution}
         * @param {Object=} options extend the ol.control.Attribution options.
         * 	@param {ol.style.Style} options.style  option is usesd to draw the text.
         */
        class CanvasAttribution extends ol.control.Attribution {
            constructor(options?: {
                style: ol.style.Style;
            });
            /**
             * Draw attribution on canvas
             * @param {boolean} b draw the attribution on canvas.
             */
            setCanvas(b: boolean): void;
            /**
             * Change the control style
             * @param {ol.style.Style} style
             */
            setStyle(style: ol.style.Style): void;
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
        }
        /**
         * @classdesc
         *    OpenLayers 3 Scale Line Control integrated in the canvas (for jpeg/png
         * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
         *
         * @constructor
         * @extends {ol.control.ScaleLine}
         * @param {Object=} options extend the ol.control.ScaleLine options.
         * 	@param {ol.style.Style} options.style used to draw the scale line (default is black/white, 10px Arial).
         */
        class CanvasScaleLine extends ol.control.ScaleLine {
            constructor(options?: {
                style: ol.style.Style;
            });
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {_ol_Map_} map Map.
             * @api stable
             */
            setMap(map: _ol_Map_): void;
            /**
             * Change the control style
             * @param {_ol_style_Style_} style
             */
            setStyle(style: _ol_style_Style_): void;
        }
        /**
         * A title Control integrated in the canvas (for jpeg/png
         *
         * @constructor
         * @extends {ol.control.CanvasBase}
         * @param {Object=} options extend the ol.control options.
         *  @param {string} options.title the title, default 'Title'
         *  @param {ol.style.Style} options.style style used to draw the title.
         */
        class CanvasTitle extends ol.control.CanvasBase {
            constructor(options?: {
                title: string;
                style: ol.style.Style;
            });
            /**
             * Change the control style
             * @param {ol.style.Style} style
             */
            setStyle(style: ol.style.Style): void;
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
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * @extends {ol.control.CanvasBase}
         * @param {Object=} options extend the ol.control options.
         *  @param {string} options.className CSS class name
         *  @param {ol.style.Style} options.style style used to draw in the canvas
         *  @param {ol.proj.ProjectionLike} options.projection	Projection. Default is the view projection.
         *  @param {ol.coordinate.CoordinateFormat} options.coordinateFormat A function that takes a ol.Coordinate and transforms it into a string.
         *  @param {boolean} options.canvas true to draw in the canvas
         */
        class CenterPosition extends ol.control.CanvasBase {
            constructor(options?: {
                className: string;
                style: ol.style.Style;
                projection: ol.proj.ProjectionLike;
                coordinateFormat: ol.coordinate.CoordinateFormat;
                canvas: boolean;
            });
            /**
             * Change the control style
             * @param {ol.style.Style} style
             */
            setStyle(style: ol.style.Style): void;
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
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * Draw a compass on the map. The position/size of the control is defined in the css.
         *
         * @constructor
         * @extends {ol.control.CanvasBase}
         * @param {Object=} options Control options. The style {_ol_style_Stroke_} option is usesd to draw the text.
         *  @param {string} options.className class name for the control
         *  @param {Image} options.image an image, default use the src option or a default image
         *  @param {string} options.src image src, default use the image option or a default image
         *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
         *  @param {ol.style.Stroke} options.style style to draw the lines, default draw no lines
         */
        class Compass extends ol.control.CanvasBase {
            constructor(options?: {
                className: string;
                image: Image;
                src: string;
                rotateVithView: boolean;
                style: ol.style.Stroke;
            });
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         *		@param {String} options.class class of the control
         *		@param {String} options.html html code to insert in the control
         *		@param {bool} options.on the control is on
         *		@param {function} options.toggleFn callback when control is clicked
         */
        class Disable extends ol.control.Control {
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
            disableMap(b,: boolean): void;
        }
        /** Control bar for editing in a layer
         * @constructor
         * @extends {ol.control.Bar}
         * @fires info
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {String} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {boolean} options.edition false to remove the edition tools, default true
         *	@param {Object} options.interactions List of interactions to add to the bar
         *    ie. Select, Delete, Info, DrawPoint, DrawLine, DrawPolygon
         *    Each interaction can be an interaction or true (to get the default one) or false to remove it from bar
         *	@param {ol.source.Vector} options.source Source for the drawn features.
         */
        class EditBar extends ol.control.Bar {
            constructor(options?: {
                className: string;
                target: string;
                edition: boolean;
                interactions: any;
                source: ol.source.Vector;
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
            setPosition(pos: top | left | bottom | right): void;
            /** Add a control to the bar
            *	@param {_ol_control_} c control to add
             */
            addControl(c: _ol_control_): void;
            /** Deativate all controls in a bar
            * @param {_ol_control_} except a control
             */
            deactivateControls(except: _ol_control_): void;
            /** Auto activate/deactivate controls in the bar
            * @param {boolean} b activate/deactivate
             */
            setActive(b: boolean): void;
            /** Post-process an activated/deactivated control
            *	@param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
             */
            onActivateControl_(e: ol.event): void;
            /**
             * @param {string} name of the control to search
             * @return {ol.control.Control}
             */
            getControlsByName(name: string): ol.control.Control;
        }
        /** A simple gauge control to display level information on the map.
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         *		@param {String} options.className class of the control
         *		@param {String} options.title title of the control
         *		@param {number} options.max maximum value, default 100;
         *		@param {number} options.val the value, default 0
         */
        class Gauge extends ol.control.Control {
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
         * @extends {ol.control.Control}
         * @fires add
         * @fires remove
         * @param {} options Geobookmark's options
         *  @param {string} options.className default ol-bookmark
         *  @param {string} options.placeholder input placeholder, default Add a new geomark...
         *  @param {bool} options.editable enable modification, default true
         *  @param {string} options.namespace a namespace to save the boolmark (if more than one on a page), default ol
         *  @param {Array<any>} options.marks a list of default bookmarks:
         * @see [Geobookmark example](../../examples/map.control.geobookmark.html)
         * @example
        var bm = new GeoBookmark ({
          marks: {
            "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
            "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
          }
        });
         */
        class GeoBookmark extends ol.control.Control {
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
            * @return {any} a list of bookmarks : { BM1:{pos:ol.coordinates, zoom: integer}, BM2:{pos:ol.coordinates, zoom: integer} }
             */
            getBookmarks(): any;
            /** Remove a Geo bookmark
            * @param {string} name
             */
            removeBookmark(name: string): void;
            /** Add a new Geo bookmark (replace existing one if any)
            * @param {string} name name of the bookmark (display in the menu)
            * @param {_ol_coordinate_} position default current position
            * @param {number} zoom default current map zoom
            * @param {bool} permanent prevent from deletion, default false
             */
            addBookmark(name: string, position: _ol_coordinate_, zoom: number, permanent: boolean): void;
        }
        /** Control bar for OL3
         * The control bar is a container for other controls. It can be used to create toolbars.
         * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
         *
         * @constructor
         * @extends {ol.control.Bar}
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {String} options.centerLabel label for center button, default center
         */
        class GeolocationBar extends ol.control.Bar {
            constructor(options?: {
                className: string;
                centerLabel: string;
            });
            /** Get the ol.interaction.GeolocationDraw associatedwith the bar
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
            setPosition(pos: top | left | bottom | right): void;
            /** Add a control to the bar
            *	@param {_ol_control_} c control to add
             */
            addControl(c: _ol_control_): void;
            /** Deativate all controls in a bar
            * @param {_ol_control_} except a control
             */
            deactivateControls(except: _ol_control_): void;
            /** Auto activate/deactivate controls in the bar
            * @param {boolean} b activate/deactivate
             */
            setActive(b: boolean): void;
            /** Post-process an activated/deactivated control
            *	@param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
             */
            onActivateControl_(e: ol.event): void;
            /**
             * @param {string} name of the control to search
             * @return {ol.control.Control}
             */
            getControlsByName(name: string): ol.control.Control;
        }
        /**
         * OpenLayers 3 lobe Overview Control.
         * The globe can rotate with map (follow.)
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         * 	@param {boolean} follow follow the map when center change, default false
         * 	@param {top|bottom-left|right} align position as top-left, etc.
         * 	@param {Array<ol.layer>} layers list of layers to display on the globe
         * 	@param {ol.style.Style | Array.<ol.style.Style> | undefined} style style to draw the position on the map , default a marker
         */
        class Globe extends ol.control.Control {
            constructor(options?: any, follow: boolean, align: top | bottom-left | right, layers: ol.layer[], style: ol.style.Style | ol.style.Style[] | undefined);
            /**
             * Set the map instance the control associated with.
             * @param {ol.Map} map The map instance.
             */
            setMap(map: ol.Map): void;
            /** Set the globe center with the map center
             */
            setView(): void;
            /** Get globe map
            *	@return {ol.Map}
             */
            getGlobe(): ol.Map;
            /** Show/hide the globe
             */
            show(): void;
            /** Set position on the map
            *	@param {top|bottom-left|right}  align
             */
            setPosition(align: top | bottom-left | right): void;
            /** Set the globe center
            * @param {_ol_coordinate_} center the point to center to
            * @param {boolean} show show a pointer on the map, defaylt true
             */
            setCenter(center: _ol_coordinate_, show: boolean): void;
        }
        /**
         * Draw a graticule on the map.
         *
         * @constructor
         * @extends {ol.control.CanvasBase}
         * @param {Object=} _ol_control_ options.
         *  @param {ol.projectionLike} options.projection projection to use for the graticule, default EPSG:4326
         *  @param {number} options.maxResolution max resolution to display the graticule
         *  @param {ol.style.Style} options.style Style to use for drawing the graticule, default black.
         *  @param {number} options.step step beetween lines (in proj units), default 1
         *  @param {number} options.stepCoord show a coord every stepCoord, default 1
         *  @param {number} options.spacing spacing beetween lines (in px), default 40px
         *  @param {number} options.borderWidthwidth of the border (in px), default 5px
         *  @param {number} options.marginmargin of the border (in px), default 0px
         */
        class Graticule extends ol.control.CanvasBase {
            constructor(_ol_control_?: any);
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * @extends {ol.control.CanvasBase}
         * @fires select
         * @param {Object=} Control options.
         *  @param {ol.style.Style} options.style Style to use for drawing the grid (stroke and text), default black.
         *  @param {number} options.maxResolution max resolution to display the graticule
         *  @param {ol.extent} options.extent extent of the grid, required
         *  @param {ol.size} options.size number of lines and cols, required
         *  @param {number} options.margin margin to display text (in px), default 0px
         *  @param {ol.source.Vector} options.source source to use for the index, default none (use setIndex to reset the index)
         *  @param {string | function} options.property a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
         *  @param {function|undefined} options.sortFeatures sort function to sort 2 features in the index, default sort on property option
         *  @param {function|undefined} options.indexTitle a function that takes a feature and return the title to display in the index, default the first letter of property option
         *  @param {string} options.filterLabel label to display in the search bar, default 'filter'
         */
        class GridReference extends ol.control.CanvasBase {
            constructor(Control?: any);
            /** Returns the text to be displayed in the index
             * @param {ol.Feature} f the feature
             * @return {string} the text to be displayed in the index
             * @api
             */
            getFeatureName(f: ol.Feature): string;
            /** Sort function
             * @param {ol.Feature} a first feature
             * @param {ol.Feature} b second feature
             * @return {Number} 0 if a==b, -1 if a<b, 1 if a>b
             * @api
             */
            sortFeatures(a: ol.Feature, b: ol.Feature): number;
            /** Get the feature title
             * @param {ol.Feature} f
             * @return the first letter of the eature name (getFeatureName)
             * @api
             */
            indexTitle(f: ol.Feature): any;
            /** Display features in the index
             * @param { Array<ol.Feature> | ol.Collection<ol.Feature> } features
             */
            setIndex(features: ol.Feature[] | ol.Collection<ol.Feature>): void;
            /** Get reference for a coord
            *	@param {ol.coordinate} coords
            *	@return {string} the reference
             */
            getReference(coords: ol.coordinate): string;
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * @extends {ol.control.Control}
         * @fires select
         * @fires collapse
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {ol.source.Vector} options.source a vector source that contains the images
         *	@param {function} options.getImage a function that gets a feature and return the image url, default return the img propertie
         *	@param {function} options.getTitle a function that gets a feature and return the title, default return an empty string
         *	@param {boolean} options.collapsed the line is collapse, default false
         *	@param {boolean} options.collapsible the line is collapsible, default false
         *	@param {number} options.maxFeatures the maximum image element in the line, default 100
         *	@param {boolean} options.hover select image on hover, default false
         *	@param {string|boolean} options.linkColor link color or false if no link, default false
         */
        class Imageline extends ol.control.Control {
            constructor(options?: {
                className: string;
                source: ol.source.Vector;
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
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
             * @return {Array<ol.Feature>}
             */
            getFeatures(): ol.Feature[];
            /**
             * Refresh the imageline with new data
             */
            refresh(): void;
            /** Center image line on a feature
             * @param {ol.feature} feature
             * @param {boolean} scroll scroll the line to center on the image, default true
             * @api
             */
            select(feature: ol.feature, scroll: boolean): void;
        }
        /**
         * Geoportail isochrone Control.
         * @see https://geoservices.ign.fr/documentation/geoservices/isochrones.html
         * @constructor
         * @extends {ol.control.Control}
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
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *	@param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
         *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
         *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
         *
         *  @param {string} options.exclusions Exclusion list separate with a comma 'Toll,Tunnel,Bridge'
         */
        class IsochroneGeoportail extends ol.control.Control {
            constructor(options?: {
                className: string;
                target: Element | string | undefined;
                label: string | undefined;
                placeholder: string | undefined;
                inputLabel: string | undefined;
                noCollapse: string | undefined;
                typing: number | undefined;
                minLength: integer | undefined;
                maxItems: integer | undefined;
                maxHistory: integer | undefined;
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
             * @param {ol.coordinate} coord
             * @param {number|string} option A number as time (in second) or distance (in meter), depend on method propertie
             * or a string with a unit (s, mn, h for time or km, m)
             */
            search(coord: ol.coordinate, option: number | string): void;
        }
        /**
         * OpenLayers Layer Switcher Control.
         *
         * @constructor
         * @extends {ol.control.LayerSwitcher}
         * @param {Object=} options Control options.
         */
        class LayerPopup extends ol.control.LayerSwitcher {
            constructor(options?: any);
            /** Disable overflow
             */
            overflow(): void;
            /** Render a list of layer
             * @param {elt} element to render
             * @layers {Array{ol.layer}} list of layer to show
             * @api stable
             */
            drawList(element: elt): void;
            /** List of tips for internationalization purposes
             */
            tip: any;
            /** Test if a layer should be displayed in the switcher
             * @param {ol.layer} layer
             * @return {boolean} true if the layer is displayed
             */
            displayInLayerSwitcher(layer: ol.layer): boolean;
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
             * @param {ol.layer} layer
             */
            _setLayerForLI(li: Element, layer: ol.layer): void;
            /** Get the layer associated with a li
             * @param {Element} li
             * @return {ol.layer}
             */
            _getLayerForLI(li: Element): ol.layer;
            /**
             *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
             */
            drawPanel(): void;
            /** Change layer visibility according to the baselayer option
             * @param {ol.layer}
             * @param {Array<ol.layer>} related layers
             */
            switchLayerVisibility(l: ol.layer, related: ol.layer[]): void;
            /** Check if layer is on the map (depending on zoom and extent)
             * @param {ol.layer}
             * @return {boolean}
             */
            testLayerVisibility(layer: ol.layer): boolean;
        }
        /**
         * @classdesc OpenLayers Layer Switcher Control.
         * @require layer.getPreview
         *
         * @constructor
         * @extends {ol.control.LayerSwitcher}
         * @param {Object=} options Control options.
         */
        class LayerSwitcherImage extends ol.control.LayerSwitcher {
            constructor(options?: any);
            /** Render a list of layer
             * @param {elt} element to render
             * @layers {Array{ol.layer}} list of layer to show
             * @api stable
             */
            drawList(element: elt): void;
            /** Disable overflow
             */
            overflow(): void;
            /** List of tips for internationalization purposes
             */
            tip: any;
            /** Test if a layer should be displayed in the switcher
             * @param {ol.layer} layer
             * @return {boolean} true if the layer is displayed
             */
            displayInLayerSwitcher(layer: ol.layer): boolean;
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
             * @param {ol.layer} layer
             */
            _setLayerForLI(li: Element, layer: ol.layer): void;
            /** Get the layer associated with a li
             * @param {Element} li
             * @return {ol.layer}
             */
            _getLayerForLI(li: Element): ol.layer;
            /**
             *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
             */
            drawPanel(): void;
            /** Change layer visibility according to the baselayer option
             * @param {ol.layer}
             * @param {Array<ol.layer>} related layers
             */
            switchLayerVisibility(l: ol.layer, related: ol.layer[]): void;
            /** Check if layer is on the map (depending on zoom and extent)
             * @param {ol.layer}
             * @return {boolean}
             */
            testLayerVisibility(layer: ol.layer): boolean;
        }
        /** Create a legend for styles
         * @constructor
         * @fires select
         * @param {*} options
         *  @param {String} options.className class of the control
         *  @param {String} options.title Legend title
         *  @param {ol.size | undefined} options.size Size of the symboles in the legend, default [40, 25]
         *  @param {int | undefined} options.margin Size of the symbole's margin, default 10
         *  @param {boolean | undefined} options.collapsed Specify if attributions should be collapsed at startup. Default is true.
         *  @param {boolean | undefined} options.collapsible Specify if attributions can be collapsed, default true.
         *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} options.style a style or a style function to use with features
         * @extends {ol.control.Control}
         */
        class Legend extends ol.control.Control {
            constructor(options: {
                className: string;
                title: string;
                size: ol.size | undefined;
                margin: int | undefined;
                collapsed: boolean | undefined;
                collapsible: boolean | undefined;
                target: Element | string | undefined;
                style: ol.style.Style | ol.style.Style[] | ol.StyleFunction | undefined;
            });
            /** Set the style
             * @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} style a style or a style function to use with features
             */
            setStyle(style: ol.style.Style | ol.style.Style[] | ol.StyleFunction | undefined): void;
            /** Add a new row to the legend
             * * You can provide in options:
             * - a feature width a style
             * - or a feature that will use the legend style function
             * - or properties ans a geometry type that will use the legend style function
             * - or a style and a geometry type
             * @param {*} options a list of parameters
             *  @param {ol.Feature} options.feature a feature to draw
             *  @param {ol.style.Style} options.style the style to use if no feature is provided
             *  @param {*} options.properties properties to use with a style function
             *  @param {string} options.typeGeom type geom to draw with the style or the properties
             */
            addRow(options: {
                feature: ol.Feature;
                style: ol.style.Style;
                properties: any;
                typeGeom: string;
            }): void;
            /** Add a new row to the legend
             * @param {*} options a list of parameters
             *  @param {} options.
             */
            removeRow(options: {
                : any;
            }): void;
            /** Get a legend row
             * @param {int} index
             * @return {*}
             */
            getRow(index: int): any;
            /** Get a legend row
             * @return {int}
             */
            getLength(): int;
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
             *  @param {ol.Feature} options.feature a feature to draw
             *  @param {ol.style.Style} options.style the style to use if no feature is provided
             *  @param {*} options.properties properties to use with a style function
             *  @param {string} options.typeGeom type geom to draw with the style or the properties
             * @param {Canvas|undefined} canvas a canvas to draw in
             * @param {int|undefined} row row number to draw in canvas
             * @return {CanvasElement}
             */
            getStyleImage(options: {
                feature: ol.Feature;
                style: ol.style.Style;
                properties: any;
                typeGeom: string;
            }, canvas: Canvas | undefined, row: int | undefined): CanvasElement;
        }
        /** A control to jump from one zone to another.
         *
         * @constructor
         * @fires select
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         *	@param {string} options.className class name
         *	@param {ol.layer.Layer} options.layer layer to display in the control
         *	@param {ol.ProjectionLike} options.projection projection of the control, Default is EPSG:3857 (Spherical Mercator).
         *  @param {Array<any>} options.zone an array of zone: { name, extent (in EPSG:4326) }
         *  @param {bolean} options.centerOnClick center on click when click on zones, default true
         */
        class MapZone extends ol.control.Control {
            constructor(options?: {
                className: string;
                layer: ol.layer.Layer;
                projection: ol.ProjectionLike;
                zone: any[];
                centerOnClick: bolean;
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
         * @extends {ol.control.Control}
         * @fire change:visible
         * @param {Object=} options Control options.
         *  @param {string} className class of the control
         *  @param {boolean} hideOnClick hide the control on click, default false
         *  @param {boolean} closeBox add a closeBox to the control, default false
         */
        class Notification extends ol.control.Control {
            constructor(options?: any, className: string, hideOnClick: boolean, closeBox: boolean);
            /**
             * Display a notification on the map
             * @param {string|node|undefined} what the notification to show, default get the last one
             * @param {number} [duration=3000] duration in ms, if -1 never hide
             */
            show(what: string | node | undefined, duration?: number): void;
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
         * @extends {ol.control.Control}
         * @fire change:visible
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {String|Element} options.content
         *	@param {bool} options.hideOnClick hide the control on click, default false
         *	@param {bool} options.closeBox add a closeBox to the control, default false
         */
        class Overlay extends ol.control.Control {
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
            * @param {ol.coordinate} coord coordinate of the top left corner of the control to start from
             */
            show(html: string | Element, coord: ol.coordinate): void;
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
         * OpenLayers 3 Layer Overview Control.
         * The overview can rotate with map.
         * Zoom levels are configurable.
         * Click on the overview will center the map.
         * Change width/height of the overview trough css.
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         *  @param {ol.ProjectionLike} options.projection The projection. Default is EPSG:3857 (Spherical Mercator).
         *  @param {Number} options.minZoom default 0
         *  @param {Number} options.maxZoom default 18
         *  @param {boolean} options.rotation enable rotation, default false
         *  @param {top|bottom-left|right} options.align position
         *  @param {Array<ol.layer>} options.layers list of layers
         *  @param {ol.style.Style | Array.<ol.style.Style> | undefined} options.style style to draw the map extent on the overveiw
         *  @param {bool|elastic} options.panAnimation use animation to center map on click, default true
         */
        class Overview extends ol.control.Control {
            constructor(options?: {
                projection: ol.ProjectionLike;
                minZoom: number;
                maxZoom: number;
                rotation: boolean;
                align: top | bottom-left | right;
                layers: ol.layer[];
                style: ol.style.Style | ol.style.Style[] | undefined;
                panAnimation: boolean | elastic;
            });
            /** Elastic bounce
             *	@param {Int} bounce number of bounce
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
             *	@param {Int} bounce number of bounce
             *	@param {Number} amplitude amplitude of the bounce [0,1]
             *	@return {Number}
             */
            elasticFn(bounce: Int, amplitude: number, bounce: Int, amplitude: number): void;
            /** Get overview map
            *	@return {ol.Map}
             */
            getOverviewMap(): ol.Map;
            /** Toggle overview map
             */
            toggleMap(): void;
            /** Set overview map position
            *	@param {top|bottom-left|right}
             */
            setPosition(align: top | bottom-left | right): void;
            /**
             * Set the map instance the control associated with.
             * @param {ol.Map} map The map instance.
             */
            setMap(map: ol.Map): void;
            /** Calculate the extent of the map and draw it on the overview
             */
            calcExtent_(): void;
        }
        /**
         * Permalink Control.
         *
         *	Add a `permalink`property to layers to be handled by the control (and added in the url).
         *  The layer's permalink property is used to name the layer in the url.
         *	The control must be added after all layer are inserted in the map to take them into acount.
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} options
         *	@param {bool} options.urlReplace replace url or not, default true
         *	@param {integer} options.fixed number of digit in coords, default 6
         *	@param {bool} options.anchor use "#" instead of "?" in href
         *	@param {bool} options.hidden hide the button on the map, default false
         *	@param {function} options.onclick a function called when control is clicked
         */
        class Permalink extends ol.control.Control {
            constructor(options?: {
                urlReplace: boolean;
                fixed: integer;
                anchor: boolean;
                hidden: boolean;
                onclick: (...params: any[]) => any;
            });
            /**
             * Set the map instance the control associated with.
             * @param {ol.Map} map The map instance.
             */
            setMap(map: ol.Map): void;
            /** Get layer given a permalink name (permalink propertie in the layer)
            *	@param {string} the permalink to search for
            *	@param {Array<ol.layer>|undefined} an array of layer to search in
            *	@return {ol.layer|false}
             */
            getLayerByLink(the: string, an: ol.layer[] | undefined): ol.layer | false;
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
            getLink(): permalink;
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
         * @extends {ol.control.Control}
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {string} options.imageType A string indicating the image format, default image/jpeg
         *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
         *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
         */
        class Print extends ol.control.Control {
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
         * @classdesc OpenLayers 3 Profil Control.
         *	Draw a profil of a feature (with a 3D geometry)
         *
         * @constructor
         * @extends {ol.control.Control}
         * @fires  over, out, show
         * @param {Object=} _ol_control_ opt_options.
         *
         */
        class Profil extends ol.control.Control {
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
             * @param {ol.Feature|ol.geom} f the feature.
             * @param {Object=} options
             *		- projection {ol.ProjectionLike} feature projection, default projection of the map
             *		- zunit {m|km} default m
             *		- unit {m|km} default km
             *		- zmin {Number|undefined} default 0
             *		- zmax {Number|undefined} default max Z of the feature
             *		- graduation {Number|undefined} z graduation default 100
             *		- amplitude {integer|undefined} amplitude of the altitude, default zmax-zmin
             * @api stable
             */
            setGeometry(f: ol.Feature | ol.geom, options?: any): void;
            /** Get profil image
            * @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
            * @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
            * @return {string} requested data uri
            * @api stable
             */
            getImage(type: string | undefined, encoderOptions: number | undefined): string;
        }
        /**
         * Geoportail routing Control.
         * @constructor
         * @extends {ol.control.Control}
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
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *	@param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
         *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
         *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
         */
        class RoutingGeoportail extends ol.control.Control {
            constructor(options?: {
                className: string;
                target: Element | string | undefined;
                label: string | undefined;
                placeholder: string | undefined;
                inputLabel: string | undefined;
                noCollapse: string | undefined;
                typing: number | undefined;
                minLength: integer | undefined;
                maxItems: integer | undefined;
                maxHistory: integer | undefined;
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
         * Scale Control.
         * A control to display the scale of the center on the map
         *
         * @constructor
         * @extends {ol.control.Control}
         * @fires select
         * @fires change:input
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {string} options.ppi screen ppi, default 96
         * 	@param {string} options.editable make the control editable, default true
         */
        class Scale extends ol.control.Control {
            constructor(options?: {
                className: string;
                ppi: string;
                editable: string;
            });
            /**
             * Remove the control from its current map and attach it to the new map.
             * Subclasses may set up event handlers to get notified about changes to
             * the map here.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
         * @extends {ol.control.Search}
         * @fires select
         * @param {Object=} Control options.
         *	@param {string} options.className control class name
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *
         *	@param {string|undefined} options.url Url to BAN api, default "https://api-adresse.data.gouv.fr/search/"
         *	@param {boolean} options.position Search, with priority to geo position, default false
         *	@param {function} options.getTitle a function that takes a feature and return the text to display in the menu, default return label attribute
         * @see {@link https://adresse.data.gouv.fr/api/}
         */
        class SearchBAN extends ol.control.Search {
            constructor(Control?: any);
            /** Returns the text to be displayed in the menu
             *	@param {ol.Feature} f the feature
             *	@return {string} the text to be displayed in the index
             *	@api
             */
            getTitle(f: ol.Feature): string;
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
            autocomplete(s: string, cback: (...params: any[]) => any): Array | false;
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
         * @extends {ol.control.Search}
         * @fires select
         * @param {Object=} Control options.
         *	@param {string} options.className control class name
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *
         *	@param {string | undefined} options.property a property to display in the index, default 'name'.
         *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property
         *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
         */
        class SearchDFCI extends ol.control.Search {
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
         * @extends {ol.control.Search}
         * @fires select
         * @param {Object=} Control options.
         *	@param {string} options.className control class name
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *
         *	@param {string | undefined} options.property a property to display in the index, default 'name'.
         *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property
         *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
         */
        class SearchFeature extends ol.control.Search {
            constructor(Control?: any);
            /** No history avaliable on features
             */
            restoreHistory(): void;
            /** No history avaliable on features
             */
            saveHistory(): void;
            /** Returns the text to be displayed in the menu
            *	@param {ol.Feature} f the feature
            *	@return {string} the text to be displayed in the index
            *	@api
             */
            getTitle(f: ol.Feature): string;
            /** Return the string to search in
            *	@param {ol.Feature} f the feature
            *	@return {string} the text to be used as search string
            *	@api
             */
            getSearchString(f: ol.Feature): string;
            /** Get the source
            *	@return {ol.source.Vector}
            *	@api
             */
            getSource(): ol.source.Vector;
            /** Get the source
            *	@param {ol.source.Vector} source
            *	@api
             */
            setSource(source: ol.source.Vector): void;
            /** Autocomplete function
            * @param {string} s search string
            * @param {int} max max
            * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
            * @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
            * @api
             */
            autocomplete(s: string, max: int, cback: (...params: any[]) => any): any[] | false;
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
         * @extends {ol.control.Search}
         * @fires select
         * @param {Object=} Control options.
         *  @param {string} options.className control class name
         *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {string | undefined} options.label Text label to use for the search button, default "search"
         *  @param {string | undefined} options.placeholder placeholder, default "Search..."
         *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
         *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
         *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         */
        class SearchGPS extends ol.control.Search {
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
         * @extends {ol.control.SearchJSON}
         * @fires select
         * @param {any} options extend ol.control.SearchJSON options
         *	@param {string} options.className control class name
         *	@param {boolean | undefined} options.apiKey the service api key.
         *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *
         *	@param {Number} options.pageSize item per page for parcelle list paging, use -1 for no paging, default 5
         * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
         */
        class SearchGeoportailParcelle extends ol.control.SearchJSON {
            constructor(options: {
                className: string;
                apiKey: boolean | undefined;
                authentication:: string | undefined;
                target: Element | string | undefined;
                label: string | undefined;
                placeholder: string | undefined;
                typing: number | undefined;
                minLength: integer | undefined;
                maxItems: integer | undefined;
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
            activateParcelle(b: bolean): void;
            /** Autocomplete function (ajax request to the server)
            * @param {string} s search string
            * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
             */
            autocomplete(s: string, cback: (...params: any[]) => any): void;
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
         * @extends {ol.control.Search}
         * @fires select
         * @param {Object=} Control options.
         *	@param {string} options.className control class name
         *	@param {boolean | undefined} options.polygon To get output geometry of results (in geojson format), default false.
         *	@param {viewbox | undefined} options.viewbox The preferred area to find search results. Any two corner points of the box are accepted in any order as long as they span a real box, default none.
         *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *	@param {string | undefined} options.label Text label to use for the search button, default "search"
         *	@param {string | undefined} options.placeholder placeholder, default "Search..."
         *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
         *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
         *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *
         *	@param {string|undefined} options.url URL to Nominatim API, default "https://nominatim.openstreetmap.org/search"
         * @see {@link https://wiki.openstreetmap.org/wiki/Nominatim}
         */
        class SearchNominatim extends ol.control.Search {
            constructor(Control?: any);
            /** Returns the text to be displayed in the menu
             *	@param {ol.Feature} f the feature
             *	@return {string} the text to be displayed in the index
             *	@api
             */
            getTitle(f: ol.Feature): string;
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
            autocomplete(s: string, cback: (...params: any[]) => any): Array | false;
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
         * @extends {ol.control.SearchJSON}
         * @fires select
         * @param {Object=} Control options.
         *  @param {string} options.className control class name
         *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {string | undefined} options.label Text label to use for the search button, default "search"
         *  @param {string | undefined} options.placeholder placeholder, default "Search..."
         *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
         *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
         *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
         *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
         *
         *  @param {string|undefined} options.lang API language, default none
         */
        class SearchWikipedia extends ol.control.SearchJSON {
            constructor(Control?: any);
            /** Returns the text to be displayed in the menu
            *	@param {ol.Feature} f the feature
            *	@return {string} the text to be displayed in the index
            *	@api
             */
            getTitle(f: ol.Feature): string;
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
            autocomplete(s: string, cback: (...params: any[]) => any): void;
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
         * Select Control.
         * A control to select features by attributes
         *
         * @constructor
         * @extends {ol.control.SelectBase}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
         *  @param {string} [options.selectLabel=select] select button label
         *  @param {string} [options.addLabel=add] add button label
         *  @param {string} [options.caseLabel=case sensitive] case checkbox label
         *  @param {string} [options.allLabel=match all] match all checkbox label
         *  @param {string} [options.attrPlaceHolder=attribute]
         *  @param {string} [options.valuePlaceHolder=value]
         */
        class Select extends ol.control.SelectBase {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                source: ol/source/Vector | ol/source/Vector[];
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
             * @param {int} i condition index
             */
            removeCondition(i: int): void;
            /** Select features by attributes
             * @param {*} options
             *  @param {Array<ol/source/Vector|undefined} options.sources source to apply rules, default the select sources
             *  @param {bool} options.useCase case sensitive, default checkbox state
             *  @param {bool} options.matchAll match all conditions, , default checkbox state
             *  @param {Array<conditions>} options.conditions array of conditions
             * @fires select
             */
            doSelect(options: {
                useCase: boolean;
                matchAll: boolean;
                conditions: conditions[];
            }): void;
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
        }
        /**
         * Select features by property using a popup
         *
         * @constructor
         * @extends {ol.control.SelectBase}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
         *  @param {string} options.property property to select on
         *  @param {string} options.label control label
         *  @param {number} options.max max feature to test to get the values, default 10000
         *  @param {number} options.selectAll select all features if no option selected
         *  @param {string} options.type check type: checkbox or radio, default checkbox
         *  @param {number} options.defaultLabel label for the default radio button
         *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
         */
        class SelectCheck extends ol.control.SelectBase {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                source: ol/source/Vector | ol/source/Vector[];
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
            * @param {o.Map} map The map instance.
             */
            setMap(map: o.Map): void;
            /** Select features by attributes
             */
            doSelect(): void;
            /** Set the popup values
             * @param {Object} options
             *  @param {Object} options.values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
             *  @param {boolean} options.sort sort values
             */
            setValues(options: {
                values: any;
                sort: boolean;
            }): void;
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
        }
        /**
         * Select features by property using a condition
         *
         * @constructor
         * @extends {ol.control.SelectBase}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
         *  @param {string} options.label control label, default 'condition'
         *  @param {number} options.selectAll select all features if no option selected
         *  @param {condition|Array<condition>} options.condition conditions
         *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
         */
        class SelectCondition extends ol.control.SelectBase {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                source: ol/source/Vector | ol/source/Vector[];
                label: string;
                selectAll: number;
                condition: condition | condition[];
                onchoice: ((...params: any[]) => any) | undefined;
            });
            /** Set condition to select on
             * @param {condition, Arrat<condition>} condition
             *  @param {string} attr property to select on
             *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
             *  @param {*} val value to select on
             */
            setCondition(condition: any, attr: string, op: string, val: any): void;
            /** Add a condition to select on
             * @param {condition} condition
             *  @param {string} attr property to select on
             *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
             *  @param {*} val value to select on
             */
            addCondition(condition: condition, attr: string, op: string, val: any): void;
            /** Select features by condition
             */
            doSelect(): void;
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
        }
        /**
         * Select features by property using a simple text input
         *
         * @constructor
         * @extends {ol.control.SelectBase}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
         *  @param {string} options.property property to select on
         *  @param {function|undefined} options.onchoice function triggered the text change, default nothing
         */
        class SelectFulltext extends ol.control.SelectBase {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                source: ol/source/Vector | ol/source/Vector[];
                property: string;
                onchoice: ((...params: any[]) => any) | undefined;
            });
            /** Select features by condition
             */
            doSelect(): void;
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
        }
        /**
         * A multiselect control.
         * A container that manage other control Select
         *
         * @constructor
         * @extends {ol.control.SelectBase}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
         *  @param {Array<ol.control.SelectBase>} options.controls an array of controls
         */
        class SelectMulti extends ol.control.SelectBase {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                source: ol/source/Vector | ol/source/Vector[];
                controls: ol.control.SelectBase[];
            });
            /**
            * Set the map instance the control associated with.
            * @param {o.Map} map The map instance.
             */
            setMap(map: o.Map): void;
            /** Add a new control
             * @param {ol.control.SelectBase} c
             */
            addControl(c: ol.control.SelectBase): void;
            /** Get select controls
             * @return {Aray<ol.control.SelectBase>}
             */
            getControls(): Aray<ol.control.SelectBase>;
            /** Select features by condition
             */
            doSelect(): void;
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
        }
        /**
         * Select features by property using a popup
         *
         * @constructor
         * @extends {ol.control.SelectBase}
         * @fires select
         * @param {Object=} options
         *  @param {string} options.className control class name
         *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
         *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
         *  @param {string} options.property property to select on
         *  @param {number} options.max max feature to test to get the values, default 10000
         *  @param {number} options.selectAll select all features if no option selected
         *  @param {string} options.defaultLabel label for the default selection
         *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
         */
        class SelectPopup extends ol.control.SelectBase {
            constructor(options?: {
                className: string;
                target: Element | undefined;
                source: ol/source/Vector | ol/source/Vector[];
                property: string;
                max: number;
                selectAll: number;
                defaultLabel: string;
                onchoice: ((...params: any[]) => any) | undefined;
            });
            /**
            * Set the map instance the control associated with.
            * @param {o.Map} map The map instance.
             */
            setMap(map: o.Map): void;
            /** Select features by attributes
             */
            doSelect(): void;
            /** Set the popup values
             * @param {Object} values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
             */
            setValues(values: any): void;
            /** Set the current sources
             * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
             */
            setSources(source: ol.source.Vector | ol.source.Vector[] | undefined): void;
            /** Set feature collection to search in
             * @param {ol.Collection<ol.Feature>} features
             */
            setFeatures(features: ol.Collection<ol.Feature>): void;
            /** Get feature collection to search in
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
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
             * @param {Array<ol.Feature>} result the current list of features
             * @param {Array<ol.Feature>} features to test in
             * @param {Object} condition
             *  @param {string} condition.attr attribute name
             *  @param {string} condition.op operator
             *  @param {any} condition.val value to test
             * @param {boolean} all all conditions must be valid
             * @param {boolean} usecase use case or not when testing strings
             */
            _selectFeatures(result: ol.Feature[], features: ol.Feature[], condition: {
                attr: string;
                op: string;
                val: any;
            }, all: boolean, usecase: boolean): void;
            /** Get vector source
             * @return {Array<ol.source.Vector>}
             */
            getSources(): ol.source.Vector[];
        }
        function Status(): void;
        function Storymap(): void;
        /**
         * @classdesc Swipe Control.
         *
         * @constructor
         * @extends {ol.control.Control}
         * @param {Object=} Control options.
         *	@param {ol.layer} options.layers layer to swipe
         *	@param {ol.layer} options.rightLayer layer to swipe on right side
         *	@param {string} options.className control class name
         *	@param {number} options.position position propertie of the swipe [0,1], default 0.5
         *	@param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
         */
        class Swipe extends ol.control.Control {
            constructor(Control?: any);
            /**
             * Set the map instance the control associated with.
             * @param {_ol_Map_} map The map instance.
             */
            setMap(map: _ol_Map_): void;
            /** Add a layer to clip
             *	@param {ol.layer|Array<ol.layer>} layer to clip
            *	@param {bool} add layer in the right part of the map, default left.
             */
            addLayer(layer: ol.layer | ol.layer[], add: boolean): void;
            /** Remove a layer to clip
             *	@param {ol.layer|Array<ol.layer>} layer to clip
             */
            removeLayer(layer: ol.layer | ol.layer[]): void;
        }
        /** ol.control.Target draw a target at the center of the map.
         * @constructor
         * @extends {ol.control.CanvasBase}
         * @param {Object} options
         *  @param {ol.style.Style|Array<ol.style.Style>} options.style
         *  @param {string} options.composite composite operation = difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
         */
        class Target extends ol.control.CanvasBase {
            constructor(options: {
                style: ol.style.Style | ol.style.Style[];
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
             * @param {o.Map} map Map.
             * @api stable
             */
            setMap(map: o.Map): void;
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
         * @extends {ol.control.Button}
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {String} options.title title of the control
         *	@param {String} options.html html to insert in the control
         *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
         */
        class TextButton extends ol.control.Button {
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
         * @extends {ol.control.Control}
         * @fires select
         * @fires scroll
         * @fires collapse
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {Array<ol.Feature>} options.features Features to show in the timeline
         *	@param {ol.SourceImageOptions.vector} options.source class of the control
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
        class Timeline extends ol.control.Control {
            constructor(options?: {
                className: string;
                features: ol.Feature[];
                source: ol.SourceImageOptions.vector;
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
                className: title;
                className: title;
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
             * @param {Array<ol.Features>|ol.source.Vector} features An array of features or a vector source
             * @param {number} zoom zoom to draw the line default 1
             */
            setFeatures(features: ol.Features[] | ol.source.Vector, zoom: number): void;
            /**
             * Get features
             * @return {Array<ol.Feature>}
             */
            getFeatures(): ol.Feature[];
            /**
             * Refresh the timeline with new data
             * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
             */
            refresh(zoom: number): void;
            /** Center timeline on a date
             * @param {Date|String|ol.feature} feature a date or a feature with a date
             * @param {Object} options
             *  @param {boolean} options.anim animate scroll
             *  @param {string} options.position start, end or middle, default middle
             */
            setDate(feature: Date | string | ol.feature, options: {
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
         * @extends {ol.control.Control}
         * @fires change:active, change:disable
         * @param {Object=} options Control options.
         *	@param {String} options.className class of the control
         *	@param {String} options.title title of the control
         *	@param {String} options.html html to insert in the control
         *	@param {ol.interaction} options.interaction interaction associated with the control
         *	@param {bool} options.active the control is created active, default false
         *	@param {bool} options.disable the control is created disabled, default false
         *	@param {ol.control.Bar} options.bar a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
         *	@param {bool} options.autoActive the control will activate when shown in an ol.control.Bar, default false
         *	@param {function} options.onToggle callback when control is clicked (or use change:active event)
         */
        class Toggle extends ol.control.Control {
            constructor(options?: {
                className: string;
                title: string;
                html: string;
                interaction: ol.interaction;
                active: boolean;
                disable: boolean;
                bar: ol.control.Bar;
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
            * @return {ol.control.Bar}
             */
            getSubBar(): ol.control.Bar;
            /**
             * Test if the control is disabled.
             * @return {bool}.
             * @api stable
             */
            getDisable(): boolean;
            /** Disable the control. If disable, the control will be deactivated too.
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
            setInteraction(i: _ol_interaction_): void;
            /** Get the control interaction
            * @return {_ol_interaction_} interaction associated with the control
             */
            getInteraction(): _ol_interaction_;
        }
    }
    /** User actions that change the state of the map. Some are similar to controls,
     * but are not associated with a DOM element.
     * @namespace ol.interaction
     * @see {@link https://openlayers.org/en/master/apidoc/module-ol_interaction.html}
     */
    namespace interaction {
        /** Handles coordinates on the center of the viewport.
         * It can be used as abstract base class used for creating subclasses.
         * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
         * Only pointermove pointerup are concerned with it.
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @param {olx.interaction.InteractionOptions} options Options
         *  - targetStyle {ol.style.Style|Array<ol.style.Style>} a style to draw the target point, default cross style
         *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
         */
        class CenterTouch extends ol.interaction.Interaction {
            constructor(options: olx.interaction.InteractionOptions);
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
             * @return {ol.coordinate}
             */
            getPosition(): ol.coordinate;
        }
        /** Clip interaction to clip layers in a circle
         * @constructor
         * @extends {ol.interaction.Pointer}
         * @param {ol.interaction.Clip.options} options flashlight  param
         *  @param {number} options.radius radius of the clip, default 100
         *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
         */
        class Clip extends ol.interaction.Pointer {
            constructor(options: {
                radius: number;
                layers: ol.layer | ol.layer[];
            });
            /** Set the map > start postcompose
             */
            setMap(): void;
            /** Set clip radius
             *	@param {integer} radius
             */
            setRadius(radius: integer): void;
            /** Add a layer to clip
             *	@param {ol.layer|Array<ol.layer>} layer to clip
             */
            addLayer(layer: ol.layer | ol.layer[]): void;
            /** Remove a layer to clip
             *	@param {ol.layer|Array<ol.layer>} layer to clip
             */
            removeLayer(layer: ol.layer | ol.layer[]): void;
            /** Set position of the clip
            *	@param {ol.Pixel|ol.MapBrowserEvent}
             */
            setPosition(e: ol.Pixel | ol.MapBrowserEvent): void;
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
         * @extends {ol.interaction.Interaction}
         * @param {Object} options Options
         *  @param {function} options.condition a function that take a mapBrowserEvent and return the actio nto perform: 'copy', 'cut' or 'paste', default Ctrl+C / Ctrl+V
         *  @param {ol.Collection<ol.Feature>} options.features list of features to copy
         *  @param {ol.source.Vector | Array<ol.source.Vector>} options.sources the source to copy from (used for cut), if not defined, it will use the destination
         *  @param {ol.source.Vector} options.destination the source to copy to
         */
        class CopyPaste extends ol.interaction.Interaction {
            constructor(options: {
                condition: (...params: any[]) => any;
                features: ol.Collection<ol.Feature>;
                sources: ol.source.Vector | ol.source.Vector[];
                destination: ol.source.Vector;
            });
            /** Sources to cut feature from
             * @param { ol.source.Vector | Array<ol.source.Vector> } sources
             */
            setSources(sources: ol.source.Vector | ol.source.Vector[]): void;
            /** Get sources to cut feature from
             * @return { Array<ol.source.Vector> }
             */
            getSources(): ol.source.Vector[];
            /** Source to paste features
             * @param { ol.source.Vector } source
             */
            setDestination(source: ol.source.Vector): void;
            /** Get source to paste features
             * @param { ol.source.Vector }
             */
            getDestination(): void;
            /** Get current feature to copy
             * @return {Array<ol.Feature>}
             */
            getFeatures(): ol.Feature[];
            /** Set current feature to copy
             * @param {Object} options
             *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} options.features feature to copy, default get in the provided collection
             *  @param {boolean} options.cut try to cut feature from the sources, default false
             *  @param {boolean} options.silent true to send an event, default true
             */
            copy(options: {
                features: ol.Feature[] | ol.Collection<ol.Feature>;
                cut: boolean;
                silent: boolean;
            }): void;
            /** Paste features
             * @param {Object} options
             *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} features feature to copy, default get current features
             *  @param {ol.source.Vector} options.destination Source to paste to, default the current source
             *  @param {boolean} options.silent true to send an event, default true
             */
            paste(options: {
                destination: ol.source.Vector;
                silent: boolean;
            }, features: ol.Feature[] | ol.Collection<ol.Feature>): void;
        }
        /** A Select interaction to delete features on click.
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires deletestart
         * @fires deleteend
         * @param {*} options ol.interaction.Select options
         */
        class Delete extends ol.interaction.Interaction {
            constructor(options: any);
            /** Get vector source of the map
             * @return {Array<ol.source.Vector}
             */
            _getSources(): any;
            /** Delete features: remove the features from the map (from all layers in the map)
             * @param {ol.Collection<ol.Feature>|Array<ol.Feature>} features The features to delete
             * @api
             */
            delete(features: ol.Collection<ol.Feature> | ol.Feature[]): void;
        }
        /** Drag an overlay on the map
         * @constructor
         * @extends {ol.interaction.Pointer}
         * @fires dragstart
         * @fires dragging
         * @fires dragend
         * @param {any} options
         *  @param {ol.Overlay|Array<ol.Overlay} options.overlays the overlays to drag
         */
        class DragOverlay extends ol.interaction.Pointer {
            constructor(options: any);
            /** Add an overlay to the interacton
             * @param {ol.Overlay} ov
             */
            addOverlay(ov: ol.Overlay): void;
            /** Remove an overlay from the interacton
             * @param {ol.Overlay} ov
             */
            removeOverlay(ov: ol.Overlay): void;
        }
        /** Interaction to draw holes in a polygon.
         * It fires a drawstart, drawend event when drawing the hole
         * and a modifystart, modifyend event before and after inserting the hole in the feature geometry.
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires drawstart
         * @fires drawend
         * @fires modifystart
         * @fires modifyend
         * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
         * 	@param {Array<ol.layer.Vector> | function | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
         * 	@param { ol.style.Style | Array<ol.style.Style> | StyleFunction | undefined }	Style for the selected features, default: default edit style
         */
        class DrawHole extends ol.interaction.Interaction {
            constructor(options: {
                layers: ol.layer.Vector[] | ((...params: any[]) => any) | undefined;
            }, Style: ol.style.Style | ol.style.Style[] | StyleFunction | undefined);
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
             * @return {ol.Feature}
             */
            getPolygon(): ol.Feature;
        }
        /** Interaction rotate
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires drawstart, drawing, drawend, drawcancel
         * @param {olx.interaction.TransformOptions} options
         *  @param {Array<ol.Layer>} source Destination source for the drawn features
         *  @param {ol.Collection<ol.Feature>} features Destination collection for the drawn features
         *  @param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style style for the sketch
         *  @param {integer} sides number of sides, default 0 = circle
         *  @param { ol.events.ConditionType | undefined } squareCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features.
         *  @param { ol.events.ConditionType | undefined } centerCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features.
         *  @param { bool } canRotate Allow rotation when centered + square, default: true
         *  @param { number } clickTolerance click tolerance on touch devices, default: 6
         *  @param { number } maxCircleCoordinates Maximum number of point on a circle, default: 100
         */
        class DrawRegular extends ol.interaction.Interaction {
            constructor(options: olx.interaction.TransformOptions, source: ol.Layer[], features: ol.Collection<ol.Feature>, style: ol.style.Style | ol.style.Style[] | ol.style.StyleFunction | undefined, sides: integer, squareCondition: ol.events.ConditionType | undefined, centerCondition: ol.events.ConditionType | undefined, canRotate: boolean, clickTolerance: number, maxCircleCoordinates: number);
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
             * @param {int} number of sides.
             * @api stable
             */
            setSides(number: int): void;
            /**
             * Allow rotation when centered + square
             * @param {bool}
             * @api stable
             */
            canRotate(b: boolean): void;
            /**
             * Get the number of sides.
             * @return {int} number of sides.
             * @api stable
             */
            getSides(): int;
            /** Default start angle array for each sides
             */
            startAngle: any;
            /** Get geom of the current drawing
            * @return {ol.geom.Polygon | ol.geom.Point}
             */
            getGeom_(): ol.geom.Polygon | ol.geom.Point;
            /** Draw sketch
            * @return {ol.Feature} The feature being drawn.
             */
            drawSketch_(): ol.Feature;
            /** Draw sketch (Point)
             */
            drawPoint_(): void;
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             */
            handleEvent_(evt: ol.MapBrowserEvent): void;
            /** Stop drawing.
             */
            finishDrawing(): void;
            /**
             * @param {ol.MapBrowserEvent} evt Event.
             */
            handleMoveEvent_(evt: ol.MapBrowserEvent): void;
            /** Start an new draw
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `false` to stop the drag sequence.
             */
            start_(evt: ol.MapBrowserEvent): boolean;
            /** End drawing
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `false` to stop the drag sequence.
             */
            end_(evt: ol.MapBrowserEvent): boolean;
        }
        /** Interaction DrawTouch :
         * @constructor
         * @extends {ol.interaction.CenterTouch}
         * @param {olx.interaction.DrawOptions} options
         *	- source {ol.source.Vector | undefined} Destination source for the drawn features.
         *	- type {ol.geom.GeometryType} Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
         *	- tap {boolean} enable on tap, default true
         *	Inherited params
         *  - targetStyle {ol.style.Style|Array<ol.style.Style>} a style to draw the target point, default cross style
         *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
         */
        class DrawTouch extends ol.interaction.CenterTouch {
            constructor(options: olx.interaction.DrawOptions);
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /** Start drawing and add the sketch feature to the target layer.
            * The ol.interaction.Draw.EventType.DRAWSTART event is dispatched before inserting the feature.
             */
            startDrawing(): void;
            /** Get geometry type
            * @return {ol.geom.GeometryType}
             */
            getGeometryType(): ol.geom.GeometryType;
            /** Start drawing and add the sketch feature to the target layer.
            * The ol.interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
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
             * @return {ol.coordinate}
             */
            getPosition(): ol.coordinate;
        }
        /** Extend DragAndDrop choose drop zone + fires loadstart, loadend
         * @constructor
         * @extends {ol.interaction.DragAndDrop}
         *	@fires loadstart, loadend, addfeatures
         *	@param {ol.dropfile.options} flashlight options param
         *		- zone {string} selector for the drop zone, default document
         *		- projection {ol.projection} default projection of the map
         *		- formatConstructors {Array<function(new:ol.format.Feature)>|undefined} Format constructors, default [ ol.format.GPX, ol.format.GeoJSON, ol.format.IGC, ol.format.KML, ol.format.TopoJSON ]
         *		- accept {Array<string>|undefined} list of eccepted format, default ["gpx","json","geojson","igc","kml","topojson"]
         */
        class DropFile extends ol.interaction.DragAndDrop {
            constructor(flashlight: ol.dropfile.options);
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
         * @extends {ol.interaction.Interaction}
         * @fires setattributestart
         * @fires setattributeend
         * @param {*} options extentol.interaction.Select options
         *  @param {boolean} options.active activate the interaction on start, default true
         *  @param {boolean} options.cursor use a paint bucket cursor, default true
         * @param {*} properties The properties as key/value
         */
        class FillAttribute extends ol.interaction.Interaction {
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
             * @param {Array<ol.Feature>} features The features to modify
             * @param {*} properties The properties as key/value
             */
            fill(features: ol.Feature[], properties: any): void;
        }
        /**
         * @constructor
         * @extends {ol.interaction.Pointer}
         *	@param {ol.flashlight.options} flashlight options param
         *		- color {ol.Color} light color, default transparent
         *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
         *		- radius {number} radius of the flash
         */
        class Flashlight extends ol.interaction.Pointer {
            constructor(flashlight: ol.flashlight.options);
            /** Set the map > start postcompose
             */
            setMap(): void;
            /** Set flashlight radius
             *	@param {integer} radius
             */
            setRadius(radius: integer): void;
            /** Set flashlight color
             *	@param {ol.flashlight.options} flashlight options param
             *		- color {ol.Color} light color, default transparent
             *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
             */
            setColor(flashlight: ol.flashlight.options): void;
            /** Set position of the flashlight
            *	@param {ol.Pixel|ol.MapBrowserEvent}
             */
            setPosition(e: ol.Pixel | ol.MapBrowserEvent): void;
            /** Postcompose function
             */
            postcompose_(): void;
        }
        /** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
         * @constructor
         * @fires focus
         * @extends {ol.interaction.Interaction}
         */
        class FocusMap extends ol.interaction.Interaction {
            /** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
             */
            setMap(): void;
        }
        /** Interaction to draw on the current geolocation
         *	It combines a draw with a ol.Geolocation
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires drawstart, drawend, drawing, tracking, follow
         * @param {any} options
         *	@param { ol.Collection.<ol.Feature> | undefined } option.features Destination collection for the drawn features.
         *	@param { ol.source.Vector | undefined } options.source Destination source for the drawn features.
         *	@param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon'), default LineString.
         *	@param {Number | undefined} options.minAccuracy minimum accuracy underneath a new point will be register (if no condition), default 20
         *	@param {function | undefined} options.condition a function that take a ol.Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuraty < minAccuraty
         *	@param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
         *	@param {Number} options.tolerance tolerance to add a new point (in projection unit), use ol.geom.LineString.simplify() method, default 5
         *	@param {Number} options.zoom zoom for tracking, default 16
         *	@param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
         *	@param { ol.style.Style | Array.<ol.style.Style> | ol.StyleFunction | undefined } options.style Style for sketch features.
         */
        class GeolocationDraw extends ol.interaction.Interaction {
            constructor(options: {
                source: ol.source.Vector | undefined;
                type: ol.geom.GeometryType;
                minAccuracy: number | undefined;
                condition: ((...params: any[]) => any) | undefined;
                attributes: any;
                tolerance: number;
                zoom: number;
                followTrack: boolean | auto | position | visible;
                style: ol.style.Style | ol.style.Style[] | ol.StyleFunction | undefined;
            });
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
            *	'visible': center when position gets out of the visible extent
             */
            setFollowTrack(follow,: boolean | auto | position | visible): void;
        }
        /** Interaction hover do to something when hovering a feature
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires hover, enter, leave
         * @param {olx.interaction.HoverOptions}
         *	@param { string | undefined } options.cursor css cursor propertie or a function that gets a feature, default: none
         *	@param {function | undefined} optionsfeatureFilter filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
         *	@param {function | undefined} options.layerFilter filter a function with one argument, the layer to test. Return true to test the layer
         *	@param {number | undefined} options.hitTolerance Hit-detection tolerance in pixels.
         *	@param { function | undefined } options.handleEvent Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
         */
        class Hover extends ol.interaction.Interaction {
            constructor(options: {
                cursor: string | undefined;
                layerFilter: ((...params: any[]) => any) | undefined;
                hitTolerance: number | undefined;
                handleEvent: ((...params: any[]) => any) | undefined;
            }, optionsfeatureFilter: ((...params: any[]) => any) | undefined);
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
            * @param {ol.event} e "move" event
             */
            handleMove_(e: ol.event): void;
        }
        /** Interaction to handle longtouch events
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @param {olx.interaction.LongTouchOptions}
         * 	@param {function | undefined} options.handleLongTouchEvent Function handling "longtouch" events, it will receive a mapBrowserEvent.
         *	@param {interger | undefined} options.delay The delay for a long touch in ms, default is 1000
         */
        class LongTouch extends ol.interaction.Interaction {
            constructor(options: {
                handleLongTouchEvent: ((...params: any[]) => any) | undefined;
                delay: interger | undefined;
            });
        }
        /** Interaction for modifying feature geometries. Similar to the core ol/interaction/Modify.
         * The interaction is more suitable to use to handle feature modification: only features concerned
         * by the modification are passed to the events (instead of all feature with ol/interaction/Modify)
         * - the modifystart event is fired before the feature is modified (no points still inserted)
         * - the modifyend event is fired after the modification
         * - it fires a modifying event
         * @constructor
         * @extends {ol.interaction.Pointer}
         * @fires modifystart
         * @fires modifying
         * @fires modifyend
         * @param {*} options
         *	@param {ol.source.Vector|Array{ol.source.Vector}} options.source a list of source to modify (configured with useSpatialIndex set to true)
         *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to modify
         *  @param {integer} options.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for editing. Default is 10.
         *  @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
         *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.style Style for the sketch features.
         *  @param {ol.EventsConditionType | undefined} options.condition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event will be considered to add or move a vertex to the sketch. Default is ol.events.condition.primaryAction.
         *  @param {ol.EventsConditionType | undefined} options.deleteCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled. By default, ol.events.condition.singleClick with ol.events.condition.altKeyOnly results in a vertex deletion.
         *  @param {ol.EventsConditionType | undefined} options.insertVertexCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether a new vertex can be added to the sketch features. Default is ol.events.condition.always
         */
        class ModifyFeature extends ol.interaction.Pointer {
            constructor(options: {
                features: ol.Collection<ol.Feature>;
                pixelTolerance: integer;
                filter: ((...params: any[]) => any) | undefined;
                style: ol.style.Style | ol.style.Style[] | undefined;
                condition: ol.EventsConditionType | undefined;
                deleteCondition: ol.EventsConditionType | undefined;
                insertVertexCondition: ol.EventsConditionType | undefined;
            });
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /**
             * Activate or deactivate the interaction + remove the sketch.
             * @param {boolean} active.
             * @api stable
             */
            setActive(): void;
            /** Get nearest coordinate in a list
            * @param {ol.coordinate} pt the point to find nearest
            * @param {ol.geom} coords list of coordinates
            * @return {*} the nearest point with a coord (projected point), dist (distance to the geom), ring (if Polygon)
             */
            getNearestCoord(pt: ol.coordinate, coords: ol.geom): any;
            /** Get arcs concerned by a modification
             * @param {ol.geom} geom the geometry concerned
             * @param {ol.coordinate} coord pointed coordinates
             */
            getArcs(geom: ol.geom, coord: ol.coordinate): void;
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `true` to start the drag sequence.
             */
            handleDownEvent(evt: ol.MapBrowserEvent): boolean;
            /** Get modified features
             * @return {Array<ol.Feature>} list of modified features
             */
            getModifiedFeatures(): ol.Feature[];
            /** Removes the vertex currently being pointed.
             */
            removePoint(): void;
        }
        /** Modify interaction with a popup to delet a point on touch device
         * @constructor
         * @fires showpopup
         * @fires hidepopup
         * @extends {ol.interaction.Modify}
         * @param {olx.interaction.ModifyOptions} options
         *  @param {String|undefined} options.title title to display, default "remove point"
         *  @param {Boolean|undefined} options.usePopup use a popup, default true
         */
        class ModifyTouch extends ol.interaction.Modify {
            constructor(options: {
                title: string | undefined;
                usePopup: boolean | undefined;
            });
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /** Activate the interaction and remove popup
             * @param {Boolean} b
             */
            setActive(b: boolean): void;
            /**
             * Remove the current point
             */
            removePoint(): void;
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
            setPopupContent(html: DOMElement): void;
            /**
             * Get the popup content
             * @return {DOMElement}
             */
            getPopupContent(): DOMElement;
        }
        /** Offset interaction for offseting feature geometry
         * @constructor
         * @extends {ol.interaction.Pointer}
         * @fires offsetstart
         * @fires offsetting
         * @fires offsetend
         * @param {any} options
         *	@param {ol.layer.Vector | Array<ol.layer.Vector>} options.layers list of feature to transform
         *	@param {ol.Collection.<ol.Feature>} options.features collection of feature to transform
         *	@param {ol.source.Vector | undefined} options.source source to duplicate feature when ctrl key is down
         *	@param {boolean} options.duplicate force feature to duplicate (source must be set)
         */
        class Offset extends ol.interaction.Pointer {
            constructor(options: {
                layers: ol.layer.Vector | ol.layer.Vector[];
                features: ol.Collection<ol.Feature>;
                source: ol.source.Vector | undefined;
                duplicate: boolean;
            });
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
        }
        /**
         * @constructor
         * @extends {ol.interaction.Pointer}
         *	@param {ol.flashlight.options} flashlight options param
         *		- color {ol.Color} light color, default transparent
         *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
         *		- radius {number} radius of the flash
         */
        class Ripple extends ol.interaction.Pointer {
            constructor(flashlight: ol.flashlight.options);
            /** Set the map > start postcompose
             */
            setMap(): void;
            /** Generate random rain drop
            *	@param {integer} interval
             */
            rains(interval: integer): void;
            /** Disturb water at specified point
            *	@param {ol.Pixel|ol.MapBrowserEvent}
             */
            rainDrop(e: ol.Pixel | ol.MapBrowserEvent): void;
            /** Postcompose function
             */
            postcompose_(): void;
        }
        /**
         * @classdesc
         * Interaction for selecting vector features in a cluster.
         * It can be used as an ol.interaction.Select.
         * When clicking on a cluster, it springs apart to reveal the features in the cluster.
         * Revealed features are selectable and you can pick the one you meant.
         * Revealed features are themselves a cluster with an attribute features that contain the original feature.
         *
         * @constructor
         * @extends {ol.interaction.Select}
         * @param {olx.interaction.SelectOptions=} options SelectOptions.
         *  @param {ol.style} options.featureStyle used to style the revealed features as options.style is used by the Select interaction.
         * 	@param {boolean} options.selectCluster false if you don't want to get cluster selected
         * 	@param {Number} options.PointRadius to calculate distance between the features
         * 	@param {bool} options.spiral means you want the feature to be placed on a spiral (or a circle)
         * 	@param {Number} options.circleMaxObject number of object that can be place on a circle
         * 	@param {Number} options.maxObjects number of object that can be drawn, other are hidden
         * 	@param {bool} options.animation if the cluster will animate when features spread out, default is false
         * 	@param {Number} options.animationDuration animation duration in ms, default is 500ms
         * @fires ol.interaction.SelectEvent
         * @api stable
         */
        class SelectCluster extends ol.interaction.Select {
            constructor(options?: {
                featureStyle: ol.style;
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
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /**
             * Clear the selection, close the cluster and remove revealed features
             * @api stable
             */
            clear(): void;
            /**
             * Get the layer for the revealed features
             * @api stable
             */
            getLayer(): void;
            /**
             * Select a cluster
             * @param {ol.Feature} a cluster feature ie. a feature with a 'features' attribute.
             * @api stable
             */
            selectCluster(a: ol.Feature): void;
            /**
             * Animate the cluster and spread out the features
             * @param {ol.Coordinates} the center of the cluster
             */
            animateCluster_(the: ol.Coordinates): void;
        }
        /** Interaction to snap to guidelines
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @param {olx.interaction.SnapGuidesOptions}
         *	- pixelTolerance {number | undefined} distance (in px) to snap to a guideline, default 10 px
         *  - enableInitialGuides {bool | undefined} whether to draw initial guidelines based on the maps orientation, default false.
         *	- style {ol.style.Style | Array<ol.style.Style> | undefined} Style for the sektch features.
         */
        class SnapGuides extends ol.interaction.Interaction {
            constructor(options: olx.interaction.SnapGuidesOptions);
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /** Activate or deactivate the interaction.
            * @param {boolean} active
             */
            setActive(active: boolean): void;
            /** Clear previous added guidelines
            * @param {Array<ol.Feature> | undefined} features a list of feature to remove, default remove all feature
             */
            clearGuides(features: ol.Feature[] | undefined): void;
            /** Get guidelines
            * @return {ol.Collection} guidelines features
             */
            getGuides(): ol.Collection;
            /** Add a new guide to snap to
            * @param {Array<ol.coordinate>} v the direction vector
            * @return {ol.Feature} feature guide
             */
            addGuide(v: ol.coordinate[]): ol.Feature;
            /** Add a new orthogonal guide to snap to
            * @param {Array<ol.coordinate>} v the direction vector
            * @return {ol.Feature} feature guide
             */
            addOrthoGuide(v: ol.coordinate[]): ol.Feature;
            /** Listen to draw event to add orthogonal guidelines on the first and last point.
            * @param {_ol_interaction_Draw_} drawi a draw interaction to listen to
            * @api
             */
            setDrawInteraction(drawi: _ol_interaction_Draw_): void;
            /** Listen to modify event to add orthogonal guidelines relative to the currently dragged point
            * @param {_ol_interaction_Modify_} modifyi a modify interaction to listen to
            * @api
             */
            setModifyInteraction(modifyi: _ol_interaction_Modify_): void;
        }
        /** Interaction split interaction for splitting feature geometry
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires  beforesplit, aftersplit, pointermove
         * @param {*}
         *  @param {ol.source.Vector|Array{ol.source.Vector}} options.source a list of source to split (configured with useSpatialIndex set to true)
         *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to split
         *  @param {integer} options.snapDistance distance (in px) to snap to an object, default 25px
         *	@param {string|undefined} options.cursor cursor name to display when hovering an objet
         *  @param {function|undefined} opttion.filter a filter that takes a feature and return true if it can be clipped, default always split.
         *  @param ol.style.Style | Array<ol.style.Style> | false | undefined} options.featureStyle Style for the selected features, choose false if you don't want feature selection. By default the default edit style is used.
         *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.sketchStyle Style for the sektch features.
         *  @param {function|undefined} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split.  Default is 1e-10.
         */
        class Split extends ol.interaction.Interaction {
            constructor(options: {
                features: ol.Collection<ol.Feature>;
                snapDistance: integer;
                cursor: string | undefined;
                sketchStyle: ol.style.Style | ol.style.Style[] | undefined;
                tolerance: ((...params: any[]) => any) | undefined;
            });
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /** Get nearest coordinate in a list
            * @param {ol.coordinate} pt the point to find nearest
            * @param {Array<ol.coordinate>} coords list of coordinates
            * @return {ol.coordinate} the nearest coordinate in the list
             */
            getNearestCoord(pt: ol.coordinate, coords: ol.coordinate[]): ol.coordinate;
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `true` to start the drag sequence.
             */
            handleDownEvent(evt: ol.MapBrowserEvent): boolean;
            /**
             * @param {ol.MapBrowserEvent} evt Event.
             */
            handleMoveEvent(evt: ol.MapBrowserEvent): void;
        }
        /** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires  beforesplit, aftersplit
         * @param {olx.interaction.SplitOptions}
         *	- source {ol.source.Vector|Array{ol.source.Vector}} The target source (or array of source) with features to be split (configured with useSpatialIndex set to true)
         *	- triggerSource {ol.source.Vector} Any newly created or modified features from this source will be used to split features on the target source. If none is provided the target source is used instead.
         *	- features {ol.Collection.<ol.Feature>} A collection of feature to be split (replace source target).
         *	- triggerFeatures {ol.Collection.<ol.Feature>} Any newly created or modified features from this collection will be used to split features on the target source (replace triggerSource).
         *	- filter {function|undefined} a filter that takes a feature and return true if the feature is eligible for splitting, default always split.
         *	- tolerance {function|undefined} Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split. Default is 1e-10.
         * @todo verify auto intersection on features that split.
         */
        class Splitter extends ol.interaction.Interaction {
            constructor(options: olx.interaction.SplitOptions);
            /** Calculate intersection on 2 segs
            * @param {Array<_ol_coordinate_>} s1 first seg to intersect (2 points)
            * @param {Array<_ol_coordinate_>} s2 second seg to intersect (2 points)
            * @return { boolean | _ol_coordinate_ } intersection point or false no intersection
             */
            intersectSegs(s1: _ol_coordinate_[], s2: _ol_coordinate_[]): boolean | _ol_coordinate_;
            /** Split the source using a feature
            * @param {ol.Feature} feature The feature to use to split.
             */
            splitSource(feature: ol.Feature): void;
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
         * @extends {ol.interaction.Interaction}
         * @param {olx.interaction.SynchronizeOptions}
         *  - maps {Array<ol.Map>} An array of maps to synchronize with the map of the interaction
         */
        class Synchronize extends ol.interaction.Interaction {
            constructor(options: olx.interaction.SynchronizeOptions);
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
            /** Synchronize the maps
             */
            syncMaps(): void;
            /** Cursor move > tells other maps to show the cursor
            * @param {ol.event} e "move" event
             */
            handleMove_(e: ol.event): void;
            /** Cursor out of map > tells other maps to hide the cursor
            * @param {event} e "mouseOut" event
             */
            handleMouseOut_(e: event): void;
        }
        /**
         * @constructor
         * @extends {ol.interaction.Pointer}
         *	@param {ol.interaction.TinkerBell.options}  options flashlight param
         *		- color {ol.color} color of the sparkles
         */
        class TinkerBell extends ol.interaction.Pointer {
            constructor(options: ol.interaction.TinkerBell.options);
            /** Set the map > start postcompose
             */
            setMap(): void;
            /** Postcompose function
             */
            postcompose_(): void;
        }
        /** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
         * @constructor
         * @extends {ol.interaction.Pointer}
         * @param {olx.interaction.TouchCompass}
         *	- onDrag {function|undefined} Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
         *	- size {Number} size of the compass in px, default 80
         *	- alpha {Number} opacity of the compass, default 0.5
         */
        class TouchCompass extends ol.interaction.Pointer {
            constructor(options: olx.interaction.TouchCompass);
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
         * @extends {ol.interaction.Pointer}
         * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
         * @param {any} options
         *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
         *  @param {Array<ol.Layer>} options.layers array of layers to transform,
         *  @param {ol.Collection<ol.Feature>} options.features collection of feature to transform,
         *	@param {ol.EventsConditionType|undefined} options.addCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled. default: ol.events.condition.never.
         *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
         *	@param {bool} options.translateFeature Translate when click on feature
         *	@param {bool} options.translate Can translate the feature
         *	@param {bool} options.stretch can stretch the feature
         *	@param {bool} options.scale can scale the feature
         *	@param {bool} options.rotate can rotate the feature
         *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
         *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
         *	@param {ol.events.ConditionType | undefined} options.keepAspectRatio A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
         *	@param {ol.events.ConditionType | undefined} options.modifyCenter A function that takes an ol.MapBrowserEvent and returns a boolean to apply scale & strech from the center, default ol.events.condition.metaKey or ol.events.condition.ctrlKey.
         *	@param {} options.style list of ol.style for handles
         *
         */
        class Transform extends ol.interaction.Pointer {
            constructor(options: {
                filter: (...params: any[]) => any;
                layers: ol.Layer[];
                features: ol.Collection<ol.Feature>;
                addCondition: ol.EventsConditionType | undefined;
                hitTolerance: number | undefined;
                translateFeature: boolean;
                translate: boolean;
                stretch: boolean;
                scale: boolean;
                rotate: boolean;
                noFlip: boolean;
                selection: boolean;
                keepAspectRatio: ol.events.ConditionType | undefined;
                modifyCenter: ol.events.ConditionType | undefined;
                style: any;
            });
            /** Cursors for transform
             */
            Cursors: any;
            /**
             * Remove the interaction from its current map, if any,  and attach it to a new
             * map, if any. Pass `null` to just remove the interaction from the current map.
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
             * @param {ol.style.Style|Array<ol.style.Style>} olstyle
             * @api stable
             */
            setStyle(style: style, olstyle: ol.style.Style | ol.style.Style[]): void;
            /** Draw transform sketch
            * @param {boolean} draw only the center
             */
            drawSketch_(draw: boolean): void;
            /** Select a feature to transform
            * @param {ol.Feature} feature the feature to transform
            * @param {boolean} add true to add the feature to the selection, default false
             */
            select(feature: ol.Feature, add: boolean): void;
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `true` to start the drag sequence.
             */
            handleDownEvent_(evt: ol.MapBrowserEvent): boolean;
            /**
             * Get features to transform
             * @return {ol.Collection<ol.Feature>}
             */
            getFeatures(): ol.Collection<ol.Feature>;
            /**
             * Get the rotation center
             * @return {ol.coordinates|undefined}
             */
            getCenter(): ol.coordinates | undefined;
            /**
             * Set the rotation center
             * @param {ol.coordinates|undefined} c the center point, default center on the objet
             */
            setCenter(c: ol.coordinates | undefined): void;
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             */
            handleDragEvent_(evt: ol.MapBrowserEvent): void;
            /**
             * @param {ol.MapBrowserEvent} evt Event.
             */
            handleMoveEvent_(evt: ol.MapBrowserEvent): void;
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `false` to stop the drag sequence.
             */
            handleUpEvent_(evt: ol.MapBrowserEvent): boolean;
        }
        /** Undo/redo interaction
         * @constructor
         * @extends {ol.interaction.Interaction}
         * @fires undo
         * @fires redo
         * @param {*} options
         */
        class UndoRedo extends ol.interaction.Interaction {
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
             * @param {ol.Map} map Map.
             * @api stable
             */
            setMap(map: ol.Map): void;
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
     * ({@link ol.Map#addFilter}, {@link ol.Map#removeFilter}, {@link ol.Map#getFilters}).
     * Use the layer methods to add or remove filter on a layer
     * ({@link ol.layer.Base#addFilter}, {@link ol.layer.Base#removeFilter}, {@link ol.layer.Base#getFilters}).
     * @namespace ol.filter
     */
    namespace filter {
        /**
         * @classdesc
         * Abstract base class; normally only used for creating subclasses and not instantiated in apps.
         * Used to create filters
         * Use {@link _ol_Map_#addFilter}, {@link _ol_Map_#removeFilter} or {@link _ol_Map_#getFilters} to handle filters on a map.
         * Use {@link ol.layer.Base#addFilter}, {@link ol.layer.Base#removeFilter} or {@link ol.layer.Base#getFilters}
         * to handle filters on layers.
         *
         * @constructor
         * @extends {ol.Object}
         * @param {Object} options Extend {@link _ol_control_Control_} options.
         *  @param {boolean} [options.active]
         */
        class Base extends ol.Object {
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
        /** Mask drawing using an ol.Feature
         * @constructor
         * @requires ol.filter
         * @extends {ol.filter.Base}
         * @param {Object} [options]
         *  @param {ol.Feature} [options.feature] feature to mask with
         *  @param {ol.style.Fill} [options.fill] style to fill with
         *  @param {boolean} [options.inner] mask inner, default false
         */
        class Mask extends ol.filter.Base {
            constructor(options?: {
                feature?: ol.Feature;
                fill?: ol.style.Fill;
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
        * @requires ol.filter
        * @extends {ol.filter.Base}
        * @param {Object} [options]
        *  @param {Array<ol.Coordinate>} [options.coords]
        *  @param {ol.Extent} [options.extent]
        *  @param {string} [options.units] coords units percent (%) or pixel (px)
        *  @param {boolean} [options.keepAspectRatio] keep aspect ratio
        *  @param {string} [options.color] backgroundcolor
         */
        class Clip extends ol.filter.Base {
            constructor(options?: {
                coords?: ol.Coordinate[];
                extent?: ol.Extent;
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
         * @requires ol.filter
         * @extends {ol.filter.Base}
         * @author Thomas Tilak https://github.com/thhomas
         * @author Jean-Marc Viglino https://github.com/viglino
         * @param {FilterColorizeOptions} options
         */
        class Colorize extends ol.filter.Base {
            constructor(options: FilterColorizeOptions);
            /** Set options to the filter
             * @param {FilterColorizeOptions} [options]
             */
            setFilter(options?: FilterColorizeOptions): void;
            /** Set the filter value
             *  @param {ol.Color} options.color style to fill with
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
        * @requires ol.filter
        * @extends {ol.filter.Base}
        * @param {Object} options
        *   @param {string} options.operation composite operation
         */
        class Composite extends ol.filter.Base {
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
        /** Crop drawing using an ol.Feature
        * @constructor
        * @requires ol.filter
        * @requires ol.filter.Mask
        * @extends {ol.filter.Mask}
        * @param {Object} [options]
        *  @param {ol.Feature} [options.feature] feature to crop with
        *  @param {boolean} [options.inner=false] mask inner, default false
         */
        class Crop extends ol.filter.Mask {
            constructor(options?: {
                feature?: ol.Feature;
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
        * @requires ol.filter
        * @extends {ol.filter.Base}
        * @param {Object} [options]
        *  @param {[number, number]} [options.fold] number of fold (horizontal and vertical)
        *  @param {number} [options.margin] margin in px, default 8
        *  @param {number} [options.padding] padding in px, default 8
        *  @param {number|number[]} [options.fsize] fold size in px, default 8,10
         */
        class Fold extends ol.filter.Base {
            constructor(options?: {
                margin?: number;
                padding?: number;
                fsize?: number | number[];
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
         * @requires ol.filter
         * @extends {ol.filter.Base}
         * @param {Object} [options]
         *  @param {string} [options.img]
         *  @param {number} [options.brickSize] size of te brick, default 30
         *  @param {null | string | undefined} [options.crossOrigin] crossOrigin attribute for loaded images.
         */
        class Lego extends ol.filter.Base {
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
         * @requires ol.filter
         * @extends {ol.filter.Base}
         * @param {FilterTextureOptions} options
         */
        class Texture extends ol.filter.Base {
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
     * @namespace ol.graph
     */
    namespace graph {
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
         *  @param {ol/source/Vector} options.source the source for the edges
         *  @param {integer} [options.maxIteration=20000] maximum iterations before a pause event is fired, default 20000
         *  @param {integer} [options.stepIteration=2000] number of iterations before a calculating event is fired, default 2000
         *  @param {number} [options.epsilon=1E-6] geometric precision (min distance beetween 2 points), default 1E-6
         */
        class Dijskra {
            constructor(options: {
                source: ol/source/Vector;
                maxIteration?: integer;
                stepIteration?: integer;
                epsilon?: number;
            });
            /** Get the weighting of the edge, for example a speed factor
             * The function returns a value beetween ]0,1]
             * - 1   = no weighting
             * - 0.5 = goes twice more faster on this road
             *
             * If no feature is provided you must return the lower weighting you're using
             * @param {ol/Feature} feature
             * @return {number} a number beetween 0-1
             * @api
             */
            weight(feature: ol/Feature): number;
            /** Get the edge direction
             * -  0 : the road is blocked
             * -  1 : direct way
             * - -1 : revers way
             * -  2 : both way
             * @param {ol/Feature} feature
             * @return {Number} 0: blocked, 1: direct way, -1: revers way, 2:both way
             * @api
             */
            direction(feature: ol/Feature): number;
            /** Calculate the length of an edge
             * @param {ol/Feature|ol/geom/LineString} geom
             * @return {number}
             * @api
             */
            getLength(geom: ol/Feature | ol/geom/LineString): number;
            /** Get the nodes source concerned in the calculation
             * @return {ol/source/Vector}
             */
            getNodeSource(): ol/source/Vector;
            /** Get all features at a coordinate
             * @param {ol/coordinate} coord
             * @return {Array<ol/Feature>}
             */
            getEdges(coord: ol/coordinate): ol/Feature[];
            /** Get a node at a coordinate
             * @param {ol/coordinate} coord
             * @return {ol/Feature} the node
             */
            getNode(coord: ol/coordinate): ol/Feature;
            /** Calculate a path beetween 2 points
             * @param {ol/coordinate} start
             * @param {ol/coordinate} end
             * @return {boolean|Array<ol/coordinate>} false if don't start (still running) or start and end nodes
             */
            path(start: ol/coordinate, end: ol/coordinate): boolean | ol/coordinate[];
            /** Restart after pause
             */
            resume(): void;
            /** Pause
             */
            pause(): void;
            /** Get the current 'best way'.
             * This may be used to animate while calculating.
             * @return {Array<ol/Feature>}
             */
            getBestWay(): ol/Feature[];
        }
    }
    /** Vector feature rendering styles.
     * @namespace ol.style
     * @see {@link https://openlayers.org/en/master/apidoc/module-ol_style.html}
     */
    namespace style {
        /** Reset the cache (when fonts are loaded)
         */
        function clearDBPediaStyleCache(): void;
        /** Get a default style function for dbpedia
        * @param {} options
        * @param {string|function|undefined} options.glyph a glyph name or a function that takes a feature and return a glyph
        * @param {number} options.radius radius of the symbol, default 8
        * @param {ol.style.Fill} options.fill style for fill, default navy
        * @param {ol.style.stroke} options.stroke style for stroke, default 2px white
        * @param {string} options.prefix a prefix if many style used for the same type
        *
        * @require ol.style.FontSymbol and FontAwesome defs are required for dbPediaStyleFunction()
         */
        function dbPediaStyleFunction(options: {
            glyph: string | ((...params: any[]) => any) | undefined;
            radius: number;
            fill: ol.style.Fill;
            stroke: ol.style.stroke;
            prefix: string;
        }): void;
        interface Chart extends ol.structs.IHasChecksum {
        }
        /**
         * @classdesc
         * Set chart style for vector features.
         *
         * @constructor
         * @param {} options
         *	@param {String} options.type Chart type: pie,pie3D, donut or bar
         *	@param {number} options.radius Chart radius/size, default 20
         *	@param {number} options.rotation Rotation in radians (positive rotation clockwise). Default is 0.
         *	@param {bool} options.snapToPixel use integral numbers of pixels, default true
         *	@param {_ol_style_Stroke_} options.stroke stroke style
         *	@param {String|Array<ol.color>} options.colors predefined color set "classic","dark","pale","pastel","neon" / array of color string, default classic
         *	@param {number} options.offsetX X offset in px
         *	@param {number} options.offsetY Y offset in px
         *	@param {number} options.animation step in an animation sequence [0,1]
         *	@param {number} options.max maximum value for bar chart
         * @see [Statistic charts example](../../examples/map.style.chart.html)
         * @extends {ol.style.RegularShape}
         * @implements {ol.structs.IHasChecksum}
         * @api
         */
        class Chart extends ol.style.RegularShape implements ol.structs.IHasChecksum {
            constructor(options: {
                type: string;
                radius: number;
                rotation: number;
                snapToPixel: boolean;
                stroke: _ol_style_Stroke_;
                colors: string | ol.color[];
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
             * @return {ol.style.Chart}
             */
            clone(): ol.style.Chart;
            /** Get data associatied with the chart
             */
            getData(): void;
            /** Set data associatied with the chart
            *	@param {Array<number>}
             */
            setData(data: number[]): void;
            /** Get symbol radius
             */
            getRadius(): void;
            /** Set symbol radius
            *	@param {number} symbol radius
            *	@param {number} donut ratio
             */
            setRadius(symbol: number, donut: number): void;
            /** Set animation step
            *	@param {false|number} false to stop animation or the step of the animation [0,1]
             */
            setAnimation(false: false | number): void;
            /**
             * @inheritDoc
             */
            getChecksum(): void;
        }
        interface FillPattern extends ol.structs.IHasChecksum {
        }
        /**
         * @classdesc
         * Fill style with named pattern
         *
         * @constructor
         * @param {olx.style.FillPatternOption=}  options
         *	@param {ol.style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
         *	@param {number|undefined} options.opacity opacity with image pattern, default:1
         *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
         *	@param {ol.color} options.color pattern color
         *	@param {ol.style.Fill} options.fill fill color (background)
         *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
         *	@param {number} options.size line size for hash/dot/circle/cross pattern
         *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
         *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
         *	@param {number} options.scale pattern scale
         * @extends {ol.style.Fill}
         * @implements {ol.structs.IHasChecksum}
         * @api
         */
        class FillPattern extends ol.style.Fill implements ol.structs.IHasChecksum {
            constructor(options?: {
                image: ol.style.Image | undefined;
                opacity: number | undefined;
                pattern: olx.style.fillPattern;
                color: ol.color;
                fill: ol.style.Fill;
                offset: number;
                size: number;
                spacing: number;
                angle: number | boolean;
                scale: number;
            });
            /**
             * Clones the style.
             * @return {ol.style.FillPattern}
             */
            clone(): ol.style.FillPattern;
            /** Get canvas used as pattern
            *	@return {canvas}
             */
            getImage(): canvas;
            /** Get pattern
            *	@param {olx.style.FillPatternOption}
             */
            getPattern_(options: olx.style.FillPatternOption): void;
            /** Static fuction to add char patterns
            *	@param {title}
            *	@param {olx.fillpattern.Option}
            *		- size {integer} default 10
            *		- width {integer} default 10
            *		- height {integer} default 10
            *		- circles {Array<circles>}
            *		- lines: {Array<pointlist>}
            *		- stroke {integer}
            *		- fill {bool}
            *		- char {char}
            *		- font {string} default "10px Arial"
             */
            static addPattern(title: title, options: olx.fillpattern.Option): void;
            /** Patterns definitions
                Examples : http://seig.ensg.ign.fr/fichchap.php?NOFICHE=FP31&NOCHEM=CHEMS009&NOLISTE=1&N=8
             */
            patterns: any;
        }
        /** Flow line style
         * Draw LineString with a variable color / width
         *
         * @extends {ol.style.Style}
         * @constructor
         * @param {Object} options
         *  @param {boolean} options.visible draw only the visible part of the line, default true
         *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
         *  @param {number} options.width2 Final stroke width
         *  @param {ol.colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
         *  @param {ol.colorLike} options.color2 Final sroke color
         */
        class FlowLine extends ol.style.Style {
            constructor(options: {
                visible: boolean;
                width: number | ((...params: any[]) => any);
                width2: number;
                color: ol.colorLike | ((...params: any[]) => any);
                color2: ol.colorLike;
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
            setLineCap(cap: steing): void;
            /** Get the current width at step
             * @param {ol.feature} feature
             * @param {number} step current drawing step beetween [0,1]
             * @return {number}
             */
            getWidth(feature: ol.feature, step: number): number;
            /** Set the initial color
             * @param {ol.colorLike} color
             */
            setColor(color: ol.colorLike): void;
            /** Set the final color
             * @param {ol.colorLike} color
             */
            setColor2(color: ol.colorLike): void;
            /** Get the current color at step
             * @param {ol.feature} feature
             * @param {number} step current drawing step beetween [0,1]
             * @return {string}
             */
            getColor(feature: ol.feature, step: number): string;
            /** Renderer function
             * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
             * @param {ol.render.State} e The olx.render.State of the layer renderer
             */
            _render(geom: ol.coordinate[], e: ol.render.State): void;
            /** Split line geometry into equal length geometries
             * @param {Array<ol.coordinate>} geom
             * @param {number} nb number of resulting geometries, default 255
             * @param {number} nim minimum length of the resulting geometries, default 1
             */
            _splitInto(geom: ol.coordinate[], nb: number, nim: number): void;
        }
        interface FontSymbol extends ol.structs.IHasChecksum {
        }
        /**
         * @classdesc
         * A marker style to use with font symbols.
         *
         * @constructor
         * @param {} options Options.
         *  @param {number} options.glyph the glyph name or a char to display as symbol.
         * 		The name must be added using the {@link ol.style.FontSymbol.addDefs} function.
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
         *  @param {_ol_style_Stroke_} options.stroke
         * @extends {ol.style.RegularShape}
         * @implements {ol.structs.IHasChecksum}
         * @api
         */
        class FontSymbol extends ol.style.RegularShape implements ol.structs.IHasChecksum {
            constructor(options: {
                glyph: number;
                form: string;
                radius: number;
                rotation: number;
                rotateWithView: number;
                opacity: number;
                fontSize,: number;
                fontStyle: string;
                gradient: boolean;
                fill: _ol_style_Fill_;
                stroke: _ol_style_Stroke_;
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
             * @return {ol.style.FontSymbol}
             */
            clone(): ol.style.FontSymbol;
            /**
             * Get the fill style for the symbol.
             * @return {ol.style.Fill} Fill style.
             * @api
             */
            getFill(): ol.style.Fill;
            /**
             * Get the stroke style for the symbol.
             * @return {_ol_style_Stroke_} Stroke style.
             * @api
             */
            getStroke(): _ol_style_Stroke_;
            /**
             * Get the glyph definition for the symbol.
             * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
             * @return {_ol_style_Stroke_} Stroke style.
             * @api
             */
            getGlyph(name: string | undefined): _ol_style_Stroke_;
            /**
             * Get the glyph name.
             * @return {string} the name
             * @api
             */
            getGlyphName(): string;
            /**
             * Get the stroke style for the symbol.
             * @return {_ol_style_Stroke_} Stroke style.
             * @api
             */
            getFontInfo(): _ol_style_Stroke_;
            /**
             * @inheritDoc
             */
            getChecksum(): void;
        }
        interface Photo extends ol.structs.IHasChecksum {
        }
        /**
         * @classdesc
         * Set Photo style for vector features.
         *
         * @constructor
         * @param {} options
         *  @param { default | square | round | anchored | folio } options.kind
         *  @param {boolean} options.crop crop within square, default is false
         *  @param {Number} options.radius symbol size
         *  @param {boolean} options.shadow drop a shadow
         *  @param {ol.style.Stroke} options.stroke
         *  @param {String} options.src image src
         *  @param {String} options.crossOrigin The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you want to access pixel data with the Canvas renderer.
         *  @param {Number} options.offsetX Horizontal offset in pixels. Default is 0.
         *  @param {Number} options.offsetY Vertical offset in pixels. Default is 0.
         *  @param {function} options.onload callback when image is loaded (to redraw the layer)
         * @extends {ol.style.RegularShape}
         * @implements {ol.structs.IHasChecksum}
         * @api
         */
        class Photo extends ol.style.RegularShape implements ol.structs.IHasChecksum {
            constructor(options: {
                kind: default | square | round | anchored | folio;
                crop: boolean;
                radius: number;
                shadow: boolean;
                stroke: ol.style.Stroke;
                src: string;
                crossOrigin: string;
                offsetX: number;
                offsetY: number;
                onload: (...params: any[]) => any;
            });
            /**
             * Clones the style.
             * @return {ol.style.Photo}
             */
            clone(): ol.style.Photo;
            /**
             * @inheritDoc
             */
            getChecksum(): void;
        }
        /** Add new properties to ol.style.Text
        * to use with ol.layer.Vector.prototype.setTextPathStyle
        * @constructor
        * @param {} options
        *	@param {visible|ellipsis|string} textOverflow
        *	@param {number} minWidth minimum width (px) to draw text, default 0
         */
        class TextPath {
            constructor(options: any, textOverflow: visible | ellipsis | string, minWidth: number);
        }
        interface Shadow extends ol.structs.IHasChecksum {
        }
        /**
         * @classdesc
         * Set Shadow style for point vector features.
         *
         * @constructor
         * @param {} options Options.
         *   @param {ol.style.Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
         *   @param {number} options.radius point radius
         * 	 @param {number} options.blur lur radius, default radius/3
         * 	 @param {number} options.offsetX x offset, default 0
         * 	 @param {number} options.offsetY y offset, default 0
         * @extends {ol.style.RegularShape}
         * @implements {ol.structs.IHasChecksum}
         * @api
         */
        class Shadow extends ol.style.RegularShape implements ol.structs.IHasChecksum {
            constructor(options: {
                fill: ol.style.Fill | undefined;
                radius: number;
                blur: number;
                offsetX: number;
                offsetY: number;
            });
            /**
             * Clones the style.
             * @return {ol.style.Shadow}
             */
            clone(): ol.style.Shadow;
            /**
             * @inheritDoc
             */
            getChecksum(): void;
        }
        interface StrokePattern extends ol.structs.IHasChecksum {
        }
        /**
         * @classdesc
         * Stroke style with named pattern
         *
         * @constructor
         * @param {any}  options
         *	@param {ol.style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
         *	@param {number|undefined} options.opacity opacity with image pattern, default:1
         *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
         *	@param {ol.colorLike} options.color pattern color
         *	@param {ol.style.Fill} options.fill fill color (background)
         *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
         *	@param {number} options.size line size for hash/dot/circle/cross pattern
         *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
         *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
         *	@param {number} options.scale pattern scale
         * @extends {ol.style.Fill}
         * @implements {ol.structs.IHasChecksum}
         * @api
         */
        class StrokePattern extends ol.style.Fill implements ol.structs.IHasChecksum {
            constructor(options: {
                image: ol.style.Image | undefined;
                opacity: number | undefined;
                pattern: olx.style.fillPattern;
                color: ol.colorLike;
                fill: ol.style.Fill;
                offset: number;
                size: number;
                spacing: number;
                angle: number | boolean;
                scale: number;
            });
            /**
             * Clones the style.
             * @return {ol.style.StrokePattern}
             */
            clone(): ol.style.StrokePattern;
            /** Get canvas used as pattern
            *	@return {canvas}
             */
            getImage(): canvas;
            /** Get pattern
            *	@param {olx.style.FillPatternOption}
             */
            getPattern_(options: olx.style.FillPatternOption): void;
        }
    }
    /** The map is the core component of OpenLayers.
     * For a map to render, a view, one or more layers, and a target container are needed:
     * @namespace ol.Map
     * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Map.html}
     */
    namespace Map {
        /** Animate feature on a map
         * @function
         * @fires animationstart, animationend
         * @param {ol.Feature} feature Feature to animate
         * @param {ol.featureAnimation|Array<ol.featureAnimation>} fanim the animation to play
         * @return {olx.animationControler} an object to control animation with start, stop and isPlaying function
         */
        function animateFeature(feature: ol.Feature, fanim: ol.featureAnimation | ol.featureAnimation[]): olx.animationControler;
        /** Add a filter to an ol.Map
        *	@param {ol.filter}
         */
        function addFilter(filter: ol.filter): void;
        /** Remove a filter to an ol.Map
        *	@param {ol.filter}
         */
        function removeFilter(filter: ol.filter): void;
        /** Get filters associated with an ol.Map
        *	@return {Array<ol.filter>}
         */
        function getFilters(): ol.filter[];
        /** Show a target overlay at coord
        * @param {ol.coordinate} coord
         */
        function showTarget(coord: ol.coordinate): void;
        /** Hide the target overlay
         */
        function hideTarget(): void;
        /** Pulse an extent on postcompose
        *	@param {ol.coordinates} point to pulse
        *	@param {ol.pulse.options} options pulse options param
        *	  @param {ol.projectionLike|undefined} options.projection projection of coords, default no transform
        *	  @param {Number} options.duration animation duration in ms, default 2000
        *	  @param {ol.easing} options.easing easing function, default ol.easing.upAndDown
        *	  @param {ol.style.Stroke} options.style stroke style, default 2px red
         */
        function animExtent(point: ol.coordinates, options: {
            projection: ol.projectionLike | undefined;
            duration: number;
            easing: ol.easing;
            style: ol.style.Stroke;
        }): void;
        /** Show a markup a point on postcompose
        *	@deprecated use map.animateFeature instead
        *	@param {ol.coordinates} point to pulse
        *	@param {ol.markup.options} pulse options param
        *		- projection {ol.projection|String|undefined} projection of coords, default none
        *		- delay {Number} delay before mark fadeout
        *		- maxZoom {Number} zoom when mark fadeout
        *		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
        *	@return Unique key for the listener with a stop function to stop animation
         */
        function markup(point: ol.coordinates, pulse: ol.markup.options): any;
        /** Pulse a point on postcompose
        *	@deprecated use map.animateFeature instead
        *	@param {ol.coordinates} point to pulse
        *	@param {ol.pulse.options} pulse options param
        *		- projection {ol.projection||String} projection of coords
        *		- duration {Number} animation duration in ms, default 3000
        *		- amplitude {Number} movement amplitude 0: none - 0.5: start at 0.5*radius of the image - 1: max, default 1
        *		- easing {ol.easing} easing function, default ol.easing.easeOut
        *		- style {ol.style.Image|ol.style.Style|Array<ol.style.Style>} Image to draw as markup, default red circle
         */
        function pulse(point: ol.coordinates, pulse: ol.pulse.options): void;
    }
    /** Openlayers Overlay.
     * An element to be displayed over the map and attached to a single map location.
     * @namespace ol.Overlay
     * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_Overlay.html}
     */
    namespace Overlay {
        /**
         * @classdesc
         * A popup element to be displayed over the map and attached to a single map
         * location. The popup are customized using CSS.
         *
         * @example
        var popup = new ol.Overlay.Popup();
        map.addOverlay(popup);
        popup.show(coordinate, "Hello!");
        popup.hide();
        *
        * @constructor
        * @extends {ol.Overlay}
        * @param {} options Extend Overlay options
        *	@param {String} options.popupClass the a class of the overlay to style the popup.
        *	@param {bool} options.closeBox popup has a close box, default false.
        *	@param {function|undefined} options.onclose: callback function when popup is closed
        *	@param {function|undefined} options.onshow callback function when popup is shown
        *	@param {Number|Array<number>} options.offsetBox an offset box
        *	@param {ol.OverlayPositioning | string | undefined} options.positionning
        *		the 'auto' positioning var the popup choose its positioning to stay on the map.
        * @api stable
         */
        class Popup extends ol.Overlay {
            constructor(options: {
                popupClass: string;
                closeBox: boolean;
                onclose:: ((...params: any[]) => any) | undefined;
                onshow: ((...params: any[]) => any) | undefined;
                offsetBox: number | number[];
                positionning: ol.OverlayPositioning | string | undefined;
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
             * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning
             * 		or 'auto' to var the popup choose the best position
             * @api stable
             */
            setPositioning(pos: ol.OverlayPositioning | string | undefined): void;
            /** Check if popup is visible
            * @return {boolean}
             */
            getVisible(): boolean;
            /**
             * Set the position and the content of the popup.
             * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
             * @param {string|undefined} html the HTML content (undefined = previous content).
             * @example
            var popup = new ol.Overlay.Popup();
            // Show popup
            popup.show([166000, 5992000], "Hello world!");
            // Move popup at coord with the same info
            popup.show([167000, 5990000]);
            // set new info
            popup.show("New informations");
            * @api stable
             */
            show(coordinate: ol.Coordinate | string, html: string | undefined): void;
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
         * @extends {ol.Overlay}
         * @param {olx.OverlayOptions} options Overlay options
         * @api stable
         */
        class Magnify extends ol.Overlay {
            constructor(options: olx.OverlayOptions);
            /**
             * Set the map instance the overlay is associated with.
             * @param {ol.Map} map The map instance.
             */
            setMap(map: ol.Map): void;
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
        var popup = new ol.Overlay.Placemark();
        map.addOverlay(popup);
        popup.show(coordinate);
        popup.hide();
        *
        * @constructor
        * @extends {ol.Overlay}
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
        class Placemark extends ol.Overlay {
            constructor(options: {
                color: string;
                backgroundColor: string;
                contentColor: string;
                radius: number;
                popupClass: string;
                onclose:: ((...params: any[]) => any) | undefined;
                onshow: ((...params: any[]) => any) | undefined;
            });
            /**
             * Set the position and the content of the placemark (hide it before to enable animation).
             * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
             * @param {string|undefined} html the HTML content (undefined = previous content).
             */
            show(coordinate: ol.Coordinate | string, html: string | undefined): void;
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
             * @param {number} size size in pixel
             */
            setRadius(size: number): void;
        }
        /**
         * A popup element to be displayed on a feature.
         *
         * @constructor
         * @extends {ol.Overlay.Popup}
         * @param {} options Extend Popup options
         *  @param {String} options.popupClass the a class of the overlay to style the popup.
         *  @param {bool} options.closeBox popup has a close box, default false.
         *  @param {function|undefined} options.onclose: callback function when popup is closed
         *  @param {function|undefined} options.onshow callback function when popup is shown
         *  @param {Number|Array<number>} options.offsetBox an offset box
         *  @param {ol.OverlayPositioning | string | undefined} options.positionning
         *    the 'auto' positioning var the popup choose its positioning to stay on the map.
         *  @param {Template} options.template A template with a list of properties to use in the popup
         *  @param {boolean} options.canFix Enable popup to be fixed, default false
         *  @param {boolean} options.showImage display image url as image, default false
         *  @param {boolean} options.maxChar max char to display in a cell, default 200
         *  @api stable
         */
        class PopupFeature extends ol.Overlay.Popup {
            constructor(options: {
                popupClass: string;
                closeBox: boolean;
                onclose:: ((...params: any[]) => any) | undefined;
                onshow: ((...params: any[]) => any) | undefined;
                offsetBox: number | number[];
                positionning: ol.OverlayPositioning | string | undefined;
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
             * @param {ol.coordinate|undefined} coordinate Position of the popup
             * @param {ol.Feature|Array<ol.Feature>} features The features on the popup
             */
            show(coordinate: ol.coordinate | undefined, features: ol.Feature | ol.Feature[]): void;
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
             * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning
             * 		or 'auto' to var the popup choose the best position
             * @api stable
             */
            setPositioning(pos: ol.OverlayPositioning | string | undefined): void;
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
         * @extends {ol.Overlay.Popup}
         * @param {} options Extend Popup options
         *	@param {String} options.popupClass the a class of the overlay to style the popup.
         *  @param {number} options.maximumFractionDigits maximum digits to display on measure, default 2
         *  @param {function} options.formatLength a function that takes a number and returns the formated value, default length in meter
         *  @param {function} options.formatArea a function that takes a number and returns the formated value, default length in square-meter
         *  @param {function} options.getHTML a function that takes a feature and the info string and return a formated info to display in the tooltip, default display feature measure & info
         *	@param {Number|Array<number>} options.offsetBox an offset box
         *	@param {ol.OverlayPositioning | string | undefined} options.positionning
         *		the 'auto' positioning var the popup choose its positioning to stay on the map.
         * @api stable
         */
        class Tooltip extends ol.Overlay.Popup {
            constructor(options: {
                popupClass: string;
                maximumFractionDigits: number;
                formatLength: (...params: any[]) => any;
                formatArea: (...params: any[]) => any;
                getHTML: (...params: any[]) => any;
                offsetBox: number | number[];
                positionning: ol.OverlayPositioning | string | undefined;
            });
            /**
             * Set the map instance the control is associated with
             * and add its controls associated to this map.
             * @param {_ol_Map_} map The map instance.
             */
            setMap(map: _ol_Map_): void;
            /** Get the information to show in the tooltip
             * The area/length will be added if a feature is attached.
             * @param {ol.Feature|undefined} feature the feature
             * @param {string} info the info string
             * @api
             */
            getHTML(feature: ol.Feature | undefined, info: string): void;
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
             * @param {ol.Feature|ol.Event} feature an ol.Feature or an event (object) with a feature property
             */
            setFeature(feature: ol.Feature | ol.Event): void;
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
             * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning
             * 		or 'auto' to var the popup choose the best position
             * @api stable
             */
            setPositioning(pos: ol.OverlayPositioning | string | undefined): void;
            /** Check if popup is visible
            * @return {boolean}
             */
            getVisible(): boolean;
            /**
             * Set the position and the content of the popup.
             * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
             * @param {string|undefined} html the HTML content (undefined = previous content).
             * @example
            var popup = new ol.Overlay.Popup();
            // Show popup
            popup.show([166000, 5992000], "Hello world!");
            // Move popup at coord with the same info
            popup.show([167000, 5990000]);
            // set new info
            popup.show("New informations");
            * @api stable
             */
            show(coordinate: ol.Coordinate | string, html: string | undefined): void;
            /**
             * Hide the popup
             * @api stable
             */
            hide(): void;
        }
    }
    /**
     * Easing functions.
     * @namespace ol.easing
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_easing.html}
     */
    namespace easing { }
    /** @namespace  ol.ext
     */
    namespace ext {
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
    /** Feature animation base class
     * Use the {@link _ol_Map_#animateFeature} or {@link _ol_layer_Vector_#animateFeature} to animate a feature
     * on postcompose in a map or a layer
    * @constructor
    * @fires animationstart|animationend
    * @param {ol.featureAnimationOptions} options
    *	@param {Number} options.duration duration of the animation in ms, default 1000
    *	@param {bool} options.revers revers the animation direction
    *	@param {Number} options.repeat number of time to repeat the animation, default 0
    *	@param {oo.style.Style} options.hiddenStyle a style to display the feature when playing the animation
    *		to be used to make the feature selectable when playing animation
    *		(@see {@link ../examples/map.featureanimation.select.html}), default the feature
    *		will be hidden when playing (and niot selectable)
    *	@param {ol.easing.Function} options.fade an easing function used to fade in the feature, default none
    *	@param {ol.easing.Function} options.easing an easing function for the animation, default ol.easing.linear
     */
    class featureAnimation {
        constructor(options: {
            duration: number;
            revers: boolean;
            repeat: number;
            hiddenStyle: oo.style.Style;
            fade: ol.easing.Function;
            easing: ol.easing.Function;
        });
        /** Function to perform manipulations onpostcompose.
         * This function is called with an ol.featureAnimationEvent argument.
         * The function will be overridden by the child implementation.
         * Return true to keep this function for the next frame, false to remove it.
         * @param {ol.featureAnimationEvent} e
         * @return {bool} true to continue animation.
         * @api
         */
        animate(e: ol.featureAnimationEvent): boolean;
    }
    /** An animation controler object an object to control animation with start, stop and isPlaying function.
     * To be used with {@link olx.Map#animateFeature} or {@link ol.layer.Vector#animateFeature}
     * @typedef {Object} ol.animationControler
     * @property {function} start - start animation.
     * @property {function} stop - stop animation option arguments can be passed in animationend event.
     * @property {function} isPlaying - return true if animation is playing.
     */
    type animationControler = {
        start: (...params: any[]) => any;
        stop: (...params: any[]) => any;
        isPlaying: (...params: any[]) => any;
    };
    namespace featureAnimation {
        /** Bounce animation:
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationBounceOptions} options
         *	@param {Integer} options.bounce number of bounce, default 3
         *	@param {Integer} options.amplitude bounce amplitude,default 40
         *	@param {ol.easing} options.easing easing used for decaying amplitude, use function(){return 0} for no decay, default ol.easing.linear
         *	@param {Integer} options.duration duration in ms, default 1000
         */
        class Bounce extends ol.featureAnimation {
            constructor(options: {
                bounce: Integer;
                amplitude: Integer;
                easing: ol.easing;
                duration: Integer;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Drop animation: drop a feature on the map
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationDropOptions} options
         *  @param {Number} options.speed speed of the feature if 0 the duration parameter will be used instead, default 0
         *  @param {Number} options.side top or bottom, default top
         */
        class Drop extends ol.featureAnimation {
            constructor(options: {
                speed: number;
                side: number;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Fade animation: feature fade in
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationOptions} options
         */
        class Fade extends ol.featureAnimation {
            constructor(options: ol.featureAnimationOptions);
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Do nothing for a given duration
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationShowOptions} options
         *
         */
        class None extends ol.featureAnimation {
            constructor(options: ol.featureAnimationShowOptions);
            /** Animate: do nothing during the laps time
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Do nothing
         * @constructor
         * @extends {ol.featureAnimation}
         */
        class Null extends ol.featureAnimation {
            /** Function to perform manipulations onpostcompose.
             * This function is called with an ol.featureAnimationEvent argument.
             * The function will be overridden by the child implementation.
             * Return true to keep this function for the next frame, false to remove it.
             * @param {ol.featureAnimationEvent} e
             * @return {bool} true to continue animation.
             * @api
             */
            animate(e: ol.featureAnimationEvent): boolean;
        }
        /** Path animation: feature follow a path
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationPathOptions} options extend ol.featureAnimation options
         *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
         *  @param {Number|boolean} options.rotate rotate the symbol when following the path, true or the initial rotation, default false
         *  @param {ol.geom.LineString|ol.Feature} options.path the path to follow
         */
        class Path extends ol.featureAnimation {
            constructor(options: {
                speed: number;
                rotate: number | boolean;
                path: ol.geom.LineString | ol.Feature;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Shakee animation:
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationShakeOptions} options
         *	@param {Integer} options.bounce number o bounds, default 6
         *	@param {Integer} options.amplitude amplitude of the animation, default 40
         *	@param {bool} options.horizontal shake horizontally default false (vertical)
         */
        class Shake extends ol.featureAnimation {
            constructor(options: {
                bounce: Integer;
                amplitude: Integer;
                horizontal: boolean;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Show an object for a given duration
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationOptions} options
         */
        class Show extends ol.featureAnimation {
            constructor(options: ol.featureAnimationOptions);
            /** Animate: just show the object during the laps time
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Slice animation: feature enter from left
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationSlideOptions} options
         *  @param {Number} options.speed speed of the animation, if 0 the duration parameter will be used instead, default 0
         */
        class Slide extends ol.featureAnimation {
            constructor(options: {
                speed: number;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Teleport a feature at a given place
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationOptions} options
         */
        class Teleport extends ol.featureAnimation {
            constructor(options: ol.featureAnimationOptions);
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Slice animation: feature enter from left
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationThrowOptions} options
         *  @param {left|right} options.side side of the animation, default left
         */
        class Throw extends ol.featureAnimation {
            constructor(options: {
                side: left | right;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Zoom animation: feature zoom in (for points)
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationZoomOptions} options
         *  @param {bool} options.zoomOut to zoom out
         */
        class Zoom extends ol.featureAnimation {
            constructor(options: {
                zoomOut: boolean;
            });
            /** Animate
            * @param {ol.featureAnimationEvent} e
             */
            animate(e: ol.featureAnimationEvent): void;
        }
        /** Zoom animation: feature zoom out (for points)
         * @constructor
         * @extends {ol.featureAnimation}
         * @param {ol.featureAnimationZoomOptions} options
         */
        class ZoomOut extends ol.featureAnimation {
            constructor(options: ol.featureAnimationZoomOptions);
            /** Function to perform manipulations onpostcompose.
             * This function is called with an ol.featureAnimationEvent argument.
             * The function will be overridden by the child implementation.
             * Return true to keep this function for the next frame, false to remove it.
             * @param {ol.featureAnimationEvent} e
             * @return {bool} true to continue animation.
             * @api
             */
            animate(e: ol.featureAnimationEvent): boolean;
        }
    }
    /**
     * @classdesc
     *ol.render3D 3D vector layer rendering
     * @constructor
     * @param {Object} param
     *  @param {ol.layer.Vector} param.layer the layer to display in 3D
     *  @param {ol.style.Style} options.styler drawing style
     *  @param {number} param.maxResolution  max resolution to render 3D
     *  @param {number} param.defaultHeight default height if none is return by a propertie
     *  @param {function|string|Number} param.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
     */
    class render3D {
        constructor(param: {
            layer: ol.layer.Vector;
            maxResolution: number;
            defaultHeight: number;
            height: ((...params: any[]) => any) | string | number;
        });
        /**
         * Set style associated with the renderer
         * @param {ol.style.Style} s
         */
        setStyle(s: ol.style.Style): void;
        /**
         * Get style associated with the renderer
         * @return {ol.style.Style}
         */
        getStyle(): ol.style.Style;
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
         *  @param {ol.easing} param.easing an ol easing function
         *	@api
         */
        animate(options: olx.render3D.animateOptions): void;
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
    * @classdesc ol.HexGrid is a class to compute hexagonal grids
    * @see http://www.redblobgames.com/grids/hexagons
    *
    * @constructor ol.HexGrid
    * @extends {ol.Object}
    * @param {Object} [options]
    *	@param {number} [options.size] size of the exagon in map units, default 80000
    *	@param {ol.Coordinate} [options.origin] orgin of the grid, default [0,0]
    *	@param {HexagonLayout} [options.layout] grid layout, default pointy
     */
    class HexGrid extends ol.Object {
        constructor(options?: {
            size?: number;
            origin?: ol.Coordinate;
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
        * @param {ol.Coordinate} coord origin
         */
        setOrigin(coord: ol.Coordinate): void;
        /** Get hexagon origin
        * @return {ol.Coordinate} coord origin
         */
        getOrigin(): ol.Coordinate;
        /** Set hexagon size
        * @param {number} hexagon size
         */
        setSize(hexagon: number): void;
        /** Get hexagon size
        * @return {number} hexagon size
         */
        getSize(): number;
        /** Convert cube to axial coords
        * @param {ol.Coordinate} c cube coordinate
        * @return {ol.Coordinate} axial coordinate
         */
        cube2hex(c: ol.Coordinate): ol.Coordinate;
        /** Convert axial to cube coords
        * @param {ol.Coordinate} h axial coordinate
        * @return {ol.Coordinate} cube coordinate
         */
        hex2cube(h: ol.Coordinate): ol.Coordinate;
        /** Convert offset to axial coords
        * @param {ol.Coordinate} h axial coordinate
        * @return {ol.Coordinate} offset coordinate
         */
        hex2offset(h: ol.Coordinate): ol.Coordinate;
        /** Convert axial to offset coords
        * @param {ol.Coordinate} o offset coordinate
        * @return {ol.Coordinate} axial coordinate
         */
        offset2hex(o: ol.Coordinate): ol.Coordinate;
        /** Convert offset to cube coords
        * @param {ol.Coordinate} c cube coordinate
        * @return {ol.Coordinate} offset coordinate
        * /
        ol.HexGrid.prototype.cube2offset = function(c)
        {	return hex2offset(cube2hex(c));
        };
        /** Convert cube to offset coords
        * @param {ol.Coordinate} o offset coordinate
        * @return {ol.Coordinate} cube coordinate
        * /
        ol.HexGrid.prototype.offset2cube = function (o)
        {	return hex2cube(offset2Hex(o));
        };
        /** Round cube coords
        * @param {ol.Coordinate} h cube coordinate
        * @return {ol.Coordinate} rounded cube coordinate
         */
        cube_round(c: ol.Coordinate, o: ol.Coordinate, h: ol.Coordinate): void;
        /** Round axial coords
        * @param {ol.Coordinate} h axial coordinate
        * @return {ol.Coordinate} rounded axial coordinate
         */
        hex_round(h: ol.Coordinate): ol.Coordinate;
        /** Get hexagon corners
         */
        hex_corner(): void;
        /** Get hexagon coordinates at a coordinate
        * @param {ol.Coordinate} coord
        * @return {Arrary<ol.Coordinate>}
         */
        getHexagonAtCoord(coord: ol.Coordinate): Arrary<ol.Coordinate>;
        /** Get hexagon coordinates at hex
        * @param {ol.Coordinate} hex
        * @return {Arrary<ol.Coordinate>}
         */
        getHexagon(hex: ol.Coordinate): Arrary<ol.Coordinate>;
        /** Convert hex to coord
        * @param {ol.hex} hex
        * @return {ol.Coordinate}
         */
        hex2coord(hex: ol.hex): ol.Coordinate;
        /** Convert coord to hex
        * @param {ol.Coordinate} coord
        * @return {ol.hex}
         */
        coord2hex(coord: ol.Coordinate): ol.hex;
        /** Calculate distance between to hexagon (number of cube)
        * @param {ol.Coordinate} a first cube coord
        * @param {ol.Coordinate} a second cube coord
        * @return {number} distance
         */
        cube_distance(a: ol.Coordinate, a: ol.Coordinate): number;
        /** Calculate line between to hexagon
        * @param {ol.Coordinate} a first cube coord
        * @param {ol.Coordinate} b second cube coord
        * @return {Array<ol.Coordinate>} array of cube coordinates
         */
        cube_line(a: ol.Coordinate, b: ol.Coordinate): ol.Coordinate[];
        /** Get the neighbors for an hexagon
        * @param {ol.Coordinate} h axial coord
        * @param {number} direction
        * @return { ol.Coordinate | Array<ol.Coordinate> } neighbor || array of neighbors
         */
        hex_neighbors(h: ol.Coordinate, direction: number): ol.Coordinate | ol.Coordinate[];
        /** Get the neighbors for an hexagon
        * @param {ol.Coordinate} c cube coord
        * @param {number} direction
        * @return { ol.Coordinate | Array<ol.Coordinate> } neighbor || array of neighbors
         */
        cube_neighbors(c: ol.Coordinate, direction: number): ol.Coordinate | ol.Coordinate[];
    }
    /**
     * French INSEE grids
     * @classdesc a class to compute French INSEE grids, ie. fix area (200x200m) square grid,
     * based appon EPSG:3035
     *
     * @requires proj4
     * @constructor
     * @extends {ol.Object}
     * @param {Object} [options]
     *  @param {number} [options.size] size grid size in meter, default 200 (200x200m)
     */
    class InseeGrid extends ol.Object {
        constructor(options?: {
            size?: number;
        });
        /** Grid extent (in EPSG:3035)
         */
        static extent: any;
        /** Get the grid extent
         * @param {ol.proj.ProjLike} [proj='EPSG:3857']
         */
        getExtent(proj?: ol.proj.ProjLike): void;
        /** Get grid geom at coord
         * @param {ol.Coordinate} coord
         * @param {ol.proj.ProjLike} [proj='EPSG:3857']
         */
        getGridAtCoordinate(coord: ol.Coordinate, proj?: ol.proj.ProjLike): void;
    }
    /** Ordering function for ol.layer.Vector renderOrder parameter
    *	ol.ordering.fn (options)
    *	It will return an ordering function (f0,f1)
    *	@namespace
     */
    namespace ordering {
        /** y-Ordering
        *	@return ordering function (f0,f1)
         */
        function yOrdering(): any;
        /** Order with a feature attribute
         * @param options
         *  @param {string} options.attribute ordering attribute, default zIndex
         *  @param {function} options.equalFn ordering function for equal values
         * @return ordering function (f0,f1)
         */
        function zIndex(options: {
            attribute: string;
            equalFn: (...params: any[]) => any;
        }): any;
    }
}

/** @typedef {Object} FilterColorizeOptions
 *  @property {ol.Color} color style to fill with
 *  @property {string} operation 'enhance' or a CanvasRenderingContext2D.globalCompositeOperation
 *  @property {number} value a [0-1] value to modify the effect value
 *  @property {boolean} inner mask inner, default false
 */
declare type FilterColorizeOptions = {
    color: ol.Color;
    operation: string;
    value: number;
    inner: boolean;
};

/** @typedef {Object} FilterTextureOptions
 *  @property {Image | undefined} img Image object for the texture
 *  @property {string} src Image source URI
 *  @property {number} scale scale to draw the image. Default 1.
 *  @property {number} [opacity]
 *  @property {boolean} rotate Whether to rotate the texture with the view (may cause animation lags on mobile or slow devices). Default is true.
 *  @property {null | string | undefined} crossOrigin The crossOrigin attribute for loaded images.
 */
declare type FilterTextureOptions = {
    img: Image | undefined;
    src: string;
    scale: number;
    opacity?: number;
    rotate: boolean;
    crossOrigin: null | string | undefined;
};

/** Template attributes for popup
 * @typedef {Object} TemplateAttributes
 * @property {string} title
 * @property {function} format a function that takes an attribute and a feature and returns the formated attribute
 * @property {string} before string to instert before the attribute (prefix)
 * @property {string} after string to instert after the attribute (sudfix)
 * @property {boolean|function} visible boolean or a function (feature, value) that decides the visibility of a attribute entry
 */
declare type TemplateAttributes = {
    title: string;
    format: (...params: any[]) => any;
    before: string;
    after: string;
    visible: boolean | ((...params: any[]) => any);
};

/** Template
 * @typedef {Object} Template
 * @property {string|function} title title of the popup, attribute name or a function that takes a feature and returns the title
 * @property {Object.<TemplateAttributes>} attributes a list of template attributes
 */
declare type Template = {
    title: string | ((...params: any[]) => any);
    attributes: {
        [key: string]: any;
    };
};

/** @typedef {'pointy' | 'flat'} HexagonLayout
 *  Layout of a Hexagon. Flat means the bottom part of the hexagon is flat.
 */
declare type HexagonLayout = 'pointy' | 'flat';

