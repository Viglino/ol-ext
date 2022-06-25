export default ol_control_PrintDialog;
/** Print control to get an image of the map
 * @constructor
 * @fire show
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {string} options.className class of the control
 *	@param {String} options.title button title
 *  @param {string} [options.lang=en] control language, default en
 *	@param {string} options.imageType A string indicating the image format, default image/jpeg
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
 *	@param {boolean} options.immediate force print even if render is not complete,  default false
 *	@param {boolean} [options.openWindow=false] open the file in a new window on print
 *	@param {boolean} [options.copy=true] add a copy select option
 *	@param {boolean} [options.print=true] add a print select option
 *	@param {boolean} [options.pdf=true] add a pdf select option
 *	@param {function} [options.saveAs] a function to save the image as blob
 *	@param {*} [options.jsPDF] jsPDF object to save map as pdf
 */
declare class ol_control_PrintDialog {
    /** Add a new language
     * @param {string} lang lang id
     * @param {Objetct} labels
     */
    static addLang(lang: string, labels: Objetct): void;
    constructor(options: any);
    _lang: any;
    _printCtrl: ol_control_Print;
    _compass: ol_control_Compass;
    _printDialog: ol_control_Dialog;
    _input: {};
    _pages: (HTMLElement | Text)[];
    /** Check if the dialog is oprn
     * @return {boolean}
     */
    isOpen(): boolean;
    /** Translate
     * @param {string} what
     * @returns {string}
     */
    i18n(what: string): string;
    /** Get print orientation
     * @returns {string}
     */
    getOrientation(): string;
    /** Set print orientation
     * @param {string} ori landscape or portrait
     */
    setOrientation(ori: string): void;
    _orientation: string;
    /** Get print margin
     * @returns {number}
     */
    getMargin(): number;
    /** Set print margin
     * @param {number}
     */
    setMargin(margin: any): void;
    _margin: any;
    /** Get print size
     * @returns {ol.size}
     */
    getSize(): ol.size;
    /** Set map print size
     * @param {ol/size|string} size map size as ol/size or A4, etc.
     */
    setSize(size: any): void;
    _size: any;
    /** Get dialog content element
     * @return {Element}
     */
    getContentElement(): Element;
    /** Get dialog user element
     * @return {Element}
     */
    getUserElement(): Element;
    /** Get page element
     * @return {Element}
     */
    getPage(): Element;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /** Set the current scale (will change the scale of the map)
     * @param {number|string} value the scale factor or a scale string as 1/xxx
     */
    setScale(value: number | string): void;
    /** Get the current map scale factor
     * @return {number}
     */
    getScale(): number;
    /** Show print dialog
     * @param {*}
     *  @param {ol/size|string} options.size map size as ol/size or A4, etc.
     *  @param {number|string} options.value the scale factor or a scale string as 1/xxx
     *  @param {string} options.orientation landscape or portrait
     *  @param {number} options.margin
     */
    print(options: any): void;
    /** Get print control
     * @returns {ol_control_Print}
     */
    getrintControl(): ol_control_Print;
    /** Print dialog labels (for customisation) */
    _labels: {
        en: {
            title: string;
            orientation: string;
            portrait: string;
            landscape: string;
            size: string;
            custom: string;
            margin: string;
            scale: string;
            legend: string;
            north: string;
            mapTitle: string;
            saveas: string;
            saveLegend: string;
            copied: string;
            errorMsg: string;
            printBt: string;
            clipboardFormat: string;
            jpegFormat: string;
            pngFormat: string;
            pdfFormat: string;
            none: string;
            small: string;
            large: string;
            cancel: string;
        };
        fr: {
            title: string;
            orientation: string;
            portrait: string;
            landscape: string;
            size: string;
            custom: string;
            margin: string;
            scale: string;
            legend: string;
            north: string;
            mapTitle: string;
            saveas: string;
            saveLegend: string;
            copied: string;
            errorMsg: string;
            printBt: string;
            clipboardFormat: string;
            jpegFormat: string;
            pngFormat: string;
            pdfFormat: string;
            none: string;
            small: string;
            large: string;
            cancel: string;
        };
        de: {
            title: string;
            orientation: string;
            portrait: string;
            landscape: string;
            size: string;
            custom: string;
            margin: string;
            scale: string;
            legend: string;
            north: string;
            mapTitle: string;
            saveas: string;
            saveLegend: string;
            copied: string;
            errorMsg: string;
            printBt: string;
            clipboardFormat: string;
            jpegFormat: string;
            pngFormat: string;
            pdfFormat: string;
            none: string;
            small: string;
            large: string;
            cancel: string;
        };
        zh: {
            title: string;
            orientation: string;
            portrait: string;
            landscape: string;
            size: string;
            custom: string;
            margin: string;
            scale: string;
            legend: string;
            north: string;
            mapTitle: string;
            saveas: string;
            saveLegend: string;
            copied: string;
            errorMsg: string;
            printBt: string;
            cancel: string;
        };
    };
    /** List of paper size */
    paperSize: {
        '': any;
        A0: number[];
        A1: number[];
        A2: number[];
        A3: number[];
        A4: number[];
        'US Letter': number[];
        A5: number[];
        B4: number[];
        B5: number[];
    };
    /** List of margin size */
    marginSize: {
        none: number;
        small: number;
        large: number;
    };
    /** List of legeng options * /
    ol_control_PrintDialog.prototype.legendOptions = {
      off: 'Hide legend',
      on: 'Show legend'
    };
    
    /** List of print image file formats */
    formats: ({
        title: string;
        imageType: string;
        clipboard: boolean;
        quality?: undefined;
        pdf?: undefined;
    } | {
        title: string;
        imageType: string;
        quality: number;
        clipboard?: undefined;
        pdf?: undefined;
    } | {
        title: string;
        imageType: string;
        pdf: boolean;
        clipboard?: undefined;
        quality?: undefined;
    })[];
    /** List of print scale */
    scales: {
        ' 5000': string;
        ' 10000': string;
        ' 25000': string;
        ' 50000': string;
        ' 100000': string;
        ' 250000': string;
        ' 1000000': string;
    };
}
import ol_control_Print from "./Print";
import ol_control_Compass from "./Compass";
import ol_control_Dialog from "./Dialog";
