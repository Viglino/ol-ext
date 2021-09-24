import {asString as ol_color_asString} from 'ol/color'
import ol_ext_inherits from '../util/ext'
import ol_control_CanvasBase from './CanvasBase'
// eslint-disable-next-line no-unused-vars
import ol_legend_Legend from '../legend/Legend'

/** Create a legend for styles
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @fires select
 * @param {*} options
 *  @param {String} options.className class of the control
 *  @param {ol_legend_Legend} options.legend
 *  @param {boolean | undefined} options.collapsed Specify if legend should be collapsed at startup. Default is true.
 *  @param {boolean | undefined} options.collapsible Specify if legend can be collapsed, default true.
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 */
var ol_control_Legend = function(options) {
  options = options || {};

  var element = document.createElement('div');
  if (options.target) {
    element.className = options.className || 'ol-legend';
  } else {
    element.className = (options.className || 'ol-legend')
      +' ol-unselectable ol-control'
      +(options.collapsible===false ? ' ol-uncollapsible': ' ol-collapsed');
    // Show on click
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.addEventListener('click', function() {
      this.toggle();
    }.bind(this));
    element.appendChild(button);
    // Hide on click
    button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.className = 'ol-closebox';
    button.addEventListener('click', function() {
      this.toggle();
    }.bind(this));
    element.appendChild(button);
  }

  ol_control_CanvasBase.call(this, {
    element: element,
		target: options.target
	});

  // The legend
  this._legend = options.legend;
  this._legend.getCanvas().className = 'ol-legendImg';
  element.appendChild(this._legend.getCanvas());
  element.appendChild(this._legend.getListElement());

  if (options.collapsible!==false && options.collapsed===false) this.show();

  this._legend.on('select', function(e) {
    this.dispatchEvent(e);
  }.bind(this));
  this._legend.on('refresh', function() {
    if (this._onCanvas && this.getMap()) {
      try { this.getMap().renderSync(); } catch(e) { /* ok */ }
    }
  }.bind(this));
};
ol_ext_inherits(ol_control_Legend, ol_control_CanvasBase);

/** Get the legend associated with the control
 * @returns {ol_legend_Legend}
 */
ol_control_Legend.prototype.getLegend = function () {
  return this._legend;
};

/** Draw control on canvas
 * @param {boolean} b draw on canvas.
 */
ol_control_Legend.prototype.setCanvas = function (b) {
  this._onCanvas = b;
  this.element.style.visibility = b ? "hidden":"visible";
  if (this.getMap()) {
    try { this.getMap().renderSync(); } catch(e) { /* ok */ }
  }
};

/** Is control on canvas
 * @returns {boolean}
 */
ol_control_Legend.prototype.onCanvas = function () {
  return !!this._onCanvas;
};

/** Draw legend on canvas
 * @private
 */
ol_control_Legend.prototype._draw = function (e) {
  if (this._onCanvas && !this.element.classList.contains('ol-collapsed')) {
    var canvas = this._legend.getCanvas();
    var ctx = this.getContext(e);
    var h = ctx.canvas.height - canvas.height;
    ctx.save();
      ctx.rect(0, h, canvas.width, canvas.height);
      var col = '#fff';
      if (this._legend.getTextStyle().getBackgroundFill()) {
        col = ol_color_asString(this._legend.getTextStyle().getBackgroundFill().getColor());
      }
      ctx.fillStyle = ctx.strokeStyle = col;
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.clearRect(0, h, canvas.width, canvas.height);
      ctx.fill();
      ctx.drawImage(canvas, 0, h);
      ctx.restore();
  }
};

/** Show control
 */
ol_control_Legend.prototype.show = function() {
  if (this.element.classList.contains('ol-collapsed')) {
    this.element.classList.remove('ol-collapsed');
    this.dispatchEvent({ type:'change:collapse', collapsed: false });
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch(e) { /* ok */ }
    }
  }
};

/** Hide control
 */
ol_control_Legend.prototype.hide = function() {
  if (!this.element.classList.contains('ol-collapsed')) {
    this.element.classList.add('ol-collapsed');
    this.dispatchEvent({ type:'change:collapse', collapsed: true });
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch(e) { /* ok */ }
    }
  }
};

/** Show/hide control
 * @returns {boolean}
 */
ol_control_Legend.prototype.collapse = function(b) {
  if (b===false) this.show();
  else this.hide();
};

/** Is control collapsed
 * @returns {boolean}
 */
ol_control_Legend.prototype.isCollapsed = function() {
  return (this.element.classList.contains('ol-collapsed'));
};

/** Toggle control
 */
ol_control_Legend.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
  this.dispatchEvent({ type:'change:collapse', collapsed: this.element.classList.contains('ol-collapsed') });
  if (this.getMap()) {
    try { this.getMap().renderSync(); } catch(e) { /* ok */ }
  }
};

export default ol_control_Legend
