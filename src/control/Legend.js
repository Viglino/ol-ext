import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

/** Create a legend for styles
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @param {*} options
 *  @param {String} options.className class of the control
 *  @param {import('../legend/Legend')} options.legend
 *  @param {boolean | undefined} options.collapsed Specify if attributions should be collapsed at startup. Default is true.
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

  ol_control_Control.call(this, {
    element: element,
		target: options.target
	});

  // The legend
  this._legend = options.legend;
  this._legend.getCanvas().className = 'ol-legendImg';
  element.appendChild(this._legend.getCanvas());
  element.appendChild(this._legend.getListElement());

  if (options.collapsible!==false || options.collapsed===false) this.show();

  this._legend.on('select', function(e) {
    this.dispatchEvent(e);
  }.bind(this));
};
ol_ext_inherits(ol_control_Legend, ol_control_Control);


/** Show control
 */
ol_control_Legend.prototype.show = function() {
  if (this.element.classList.contains('ol-collapsed')) {
    this.element.classList.remove('ol-collapsed');
    this.dispatchEvent({ type:'change:collapse', collapsed: false });
  }
};

/** Hide control
 */
ol_control_Legend.prototype.hide = function() {
  if (!this.element.classList.contains('ol-collapsed')) {
    this.element.classList.add('ol-collapsed');
    this.dispatchEvent({ type:'change:collapse', collapsed: true });
  }
};
/** Toggle control
 */
ol_control_Legend.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
  this.dispatchEvent({ type:'change:collapse', collapsed: this.element.classList.contains('ol-collapsed') });
};

export default ol_control_Legend
