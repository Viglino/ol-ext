/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_filter_Base from './Base.js'

/** Fold filer map
 * @constructor
 * @requires ol_filter
 * @extends {ol_filter_Base}
 * @param {Object} [options]
 *  @param {Array<number>} [options.fold[8,4]] number of fold (horizontal and vertical)
 *  @param {number} [options.margin=8] margin in px, default 8
 *  @param {number} [options.padding=8] padding in px, default 8
 *  @param {number|number[]} [options.fsize=[8,10]] fold size in px, default 8,10
 *  @param {boolean} [options.fill=false] true to fill the background, default false
 *  @param {boolean} [options.shadow=true] true to display shadow
 *  @param {boolean} [options.opacity=.2] effect opacity
 */
var ol_filter_Fold = class olfilterFold extends ol_filter_Base {
  constructor(options) {
    options = options || {};
    super(options);

    this.set('fold', options.fold || [8, 4]);
    this.set('margin', options.margin || 8);
    this.set('padding', options.padding || 8);
    if (typeof options.fsize == 'number')
      options.fsize = [options.fsize, options.fsize];
    this.set('fsize', options.fsize || [8, 10]);
    this.set('fill', options.fill);
    this.set('shadow', options.shadow !== false);
    this.set('opacity', (options.hasOwnProperty('opacity') ? options.opacity : .2));
  }
  drawLine_(ctx, d, m) {
    var canvas = ctx.canvas;
    var fold = this.get("fold");
    var w = canvas.width;
    var h = canvas.height;
    var x, y, i;

    ctx.beginPath();
    ctx.moveTo(m, m);
    for (i = 1; i <= fold[0]; i++) {
      x = i * w / fold[0] - (i == fold[0] ? m : 0);
      y = d[1] * (i % 2) + m;
      ctx.lineTo(x, y);
    }
    for (i = 1; i <= fold[1]; i++) {
      x = w - d[0] * (i % 2) - m;
      y = i * h / fold[1] - (i == fold[1] ? d[0] * (fold[0] % 2) + m : 0);
      ctx.lineTo(x, y);
    }
    for (i = fold[0]; i > 0; i--) {
      x = i * w / fold[0] - (i == fold[0] ? d[0] * (fold[1] % 2) + m : 0);
      y = h - d[1] * (i % 2) - m;
      ctx.lineTo(x, y);
    }
    for (i = fold[1]; i > 0; i--) {
      x = d[0] * (i % 2) + m;
      y = i * h / fold[1] - (i == fold[1] ? m : 0);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  precompose(e) {
    var ctx = e.context;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    this.drawLine_(ctx, this.get("fsize"), this.get("margin"));
    ctx.fillStyle = "#fff";
    if (this.get('fill'))
      ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    this.drawLine_(ctx, this.get("fsize"), this.get("margin") + this.get("padding"));
    ctx.clip();
  }
  postcompose(e) {
    var ctx = e.context;
    var canvas = ctx.canvas;

    ctx.restore();
    ctx.save();
    this.drawLine_(ctx, this.get("fsize"), this.get("margin"));
    ctx.clip();

    if (this.get('shadow')) {
      var fold = this.get("fold");
      var w = canvas.width / fold[0];
      var h = canvas.height / fold[1];

      var grd = ctx.createRadialGradient(5 * w / 8, 5 * w / 8, w / 4, w / 2, w / 2, w);
      grd.addColorStop(0, "transparent");
      grd.addColorStop(1, "rgba(0,0,0," + this.get('opacity') + ")");
      ctx.fillStyle = grd;
      ctx.scale(1, h / w);
      for (var i = 0; i < fold[0]; i++)
        for (var j = 0; j < fold[1]; j++) {
          ctx.save();
          ctx.translate(i * w, j * w);
          ctx.fillRect(0, 0, w, w);
          ctx.restore();
        }
    }
    ctx.restore();
  }
}

export default ol_filter_Fold
