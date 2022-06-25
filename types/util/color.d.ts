/** Converts an RGB color value to HSL.
 * returns hsl as array h:[0,360], s:[0,100], l:[0,100]
 * @param {ol/color~Color|string} rgb
 * @param {number} [round=100]
 * @returns {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 */
declare function ol_color_toHSL(rgb: any, round?: number): Array<number>;
/** Converts an HSL color value to RGB.
 * @param {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 * @param {number} [round=1000]
 * @returns {Array<number>} rgb
 */
declare function ol_color_fromHSL(hsl: Array<number>, round?: number): Array<number>;
/** Converts an HSL color value to RGB.
 * @param {ol/color~Color|string} rgb
 * @param {number} [round=100]
 * @returns {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 */
declare function ol_color_toHSV(rgb: any, round?: number): Array<number>;
/** Converts an HSV color value to RGB.
 * @param {Array<number>} hsl as h:[0,360], s:[0,100], l:[0,100]
 * @param {number} [round=1000]
 * @returns {Array<number>} rgb
 */
declare function ol_color_fromHSV(hsv: any, round?: number): Array<number>;
/** Converts an HSL color value to RGB.
 * @param {ol/color~Color|string} rgb
 * @returns {string}
 */
declare function ol_color_toHexa(rgb: any): string;
export { ol_color_toHSL as toHSL, ol_color_fromHSL as fromHSL, ol_color_toHSV as toHSV, ol_color_fromHSV as fromHSV, ol_color_toHexa as toHexa };
