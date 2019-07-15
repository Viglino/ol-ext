import { Fill, Stroke, Image } from 'ol/style';
import { ColorLike } from 'ol/colorlike';
import { FillPattern } from './FillPattern';
/** Vector feature rendering styles.
 * @namespace style
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_style.html}
 */
    /** Reset the cache (when fonts are loaded)
     */
    export  function clearDBPediaStyleCache(): void;
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
  export  function dbPediaStyleFunction(options: {
        glyph: string | ((...params: any[]) => any) | undefined;
        radius: number;
        fill: Fill;
        stroke: Stroke;
        prefix: string;
    }): void;
   

