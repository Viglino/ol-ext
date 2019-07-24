import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element'

/** 
 * @classdesc
 * Application dialog
 * @extends {ol_control_Control}
 * @constructor
 * @param {*} options
 *  @param {string} options.className
 *  @param {ol.Map} options.map the map to place the dialog inside
 *  @param {Element} options.target target to place the dialog
 *  @param {boolean} options.zoom add a zoom effect
 *  @param {boolean} options.closeBox add a close button
 *  @param {boolean} options.hideOnClick close dialog when click the background
 */
var ol_control_Dialog = function(options) {
  options = options || {};
  // Constructor
  var element = ol_ext_element.create('DIV', {
    className: ((options.className || '') + (options.zoom ? ' ol-zoom':'') + ' ol-ext-dialog').trim(),
    click: function() {
      if (this.get('hideOnClick')) this.close();
    }.bind(this)
  });
  // form
  var form = ol_ext_element.create('FORM', {
    on: {
      submit: this._onButton('submit')
    },
    parent: element
  });
  // Title
  ol_ext_element.create('H2', {
    parent: form
  });
  // Close box
  ol_ext_element.create('DIV', {
    className: 'ol-closebox',
    click: this._onButton('cancel'),
    parent: form
  });
  // Content
  ol_ext_element.create('DIV', {
    className: 'ol-content',
    parent: form
  });
  // Buttons
  ol_ext_element.create('DIV', {
    className: 'ol-buttons',
    parent: form
  });

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('closeBox', options.closeBox);
  this.set('zoom', options.zoom);
  this.set('hideOnClick', options.hideOnClick);
  this.set('className', options.className);
};
ol_ext_inherits(ol_control_Dialog, ol_control_Control);

/** Show a new dialog 
 * @param { * | Element | string } options options or a content to show
 *  @param {Element | string} options.content dialog content
 *  @param {string} options.title title of the dialog
 *  @param {Object} options.buttons a key/value list of button to show 
 */
ol_control_Dialog.prototype.show = function(options) {
  if (options instanceof Element || typeof(options) === 'string') {
    options = { content: options };
  }
  this.setContent(options);
  this.element.classList.add('ol-visible');
  this.dispatchEvent ({ type: 'show' });
};

/** Open the dialog
 */
ol_control_Dialog.prototype.open = function() {
  this.show();
};

/** Set the dialog content
 * @param {*} options
 *  @param {Element | String} options.content dialog content
 *  @param {string} options.title title of the dialog
 *  @param {string} options.className dialog class name
 *  @param {Object} options.buttons a key/value list of button to show 
 */
ol_control_Dialog.prototype.setContent = function(options) {
  if (!options) return;
  this.element.className = 'ol-ext-dialog' + (this.get('zoom') ? ' ol-zoom' : '');
  if (options.className) {
    this.element.classList.add(options.className);
  } else if (this.get('className')) {
    this.element.classList.add(this.get('className'));
  }
  var form = this.element.querySelector('form');
  ol_ext_element.setHTML(form.querySelector('.ol-content'), options.content || '');
  // Title
  form.querySelector('h2').innerText = options.title || '';
  if (options.title) {
    form.classList.add('ol-title');
  } else {
    form.classList.remove('ol-title');
  }
  // Closebox
  if (options.closeBox || (this.get('closeBox') && options.closeBox !== false)) {
    form.classList.add('ol-closebox');
  } else {
    form.classList.remove('ol-closebox');
  }
  // Buttons
  var buttons = this.element.querySelector('.ol-buttons');
  buttons.innerHTML = '';
  if (options.buttons) {
    form.classList.add('ol-button');
    for (var i in options.buttons) {
      ol_ext_element.create ('INPUT', {
        type: (i==='submit' ? 'submit':'button'),
        value: options.buttons[i],
        click: this._onButton(i),
        parent: buttons
      });
    }
  } else {
    form.classList.remove('ol-button');
  }
};

/** Do something on button click
 * @private
 */
ol_control_Dialog.prototype._onButton = function(button) {
  var fn = function(e) {
    e.preventDefault();
    this.hide();
    var inputs = {};
    this.element.querySelectorAll('form input').forEach (function(input) {
      if (input.className) inputs[input.className] = input;
    });
    this.dispatchEvent ({ type: 'button', button: button, inputs: inputs });
  }.bind(this);
  return fn;
};

/** Close the dialog 
 */
ol_control_Dialog.prototype.hide = function() {
  this.element.classList.remove('ol-visible');
  this.dispatchEvent ({ type: 'hide' });
};

/** Close the dialog 
 * @method Dialog.close
 * @return {bool} true if a dialog is closed
 */
ol_control_Dialog.prototype.close = ol_control_Dialog.prototype.hide;

/** The dialog is shown
 * @return {bool} true if a dialog is open
 */
ol_control_Dialog.prototype.isOpen = function() {
  return (this.element.classList.contains('ol-visible'));
};

export default ol_control_Dialog
