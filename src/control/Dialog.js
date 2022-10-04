import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js'

/** 
 * @classdesc
 * Application dialog
 * @extends {ol_control_Control}
 * @constructor
 * @param {*} options
 *  @param {string} options.className
 *  @param {ol.Map} options.map the map to place the dialog inside
 *  @param {Element} options.target target to place the dialog
 *  @param {boolean} options.fullscreen view dialog fullscreen (same as options.target = document.body)
 *  @param {boolean} options.zoom add a zoom effect
 *  @param {boolean} options.closeBox add a close button
 *  @param {number} options.max if not null add a progress bar to the dialog, default null
 *  @param {boolean} options.hideOnClick close dialog when click
 *  @param {boolean} options.hideOnBack close dialog when click the background
 *  @param {boolean} options.closeOnSubmit Prevent closing the dialog on submit
 */
var ol_control_Dialog = class olcontrolDialog extends ol_control_Control {
  constructor(options) {
    options = options || {};
    if (options.fullscreen) options.target = document.body;

    var element = ol_ext_element.create('DIV', {
      className: ((options.className || '') + (options.zoom ? ' ol-zoom' : '') + ' ol-ext-dialog').trim()
    })
    super({
      element: element,
      target: options.target
    });

    // Constructor
    element.addEventListener('click', function (e) {
      if (this.get('hideOnBack') && e.target === element) this.close();
      if (this.get('hideOnClick')) this.close();
    }.bind(this));
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
    // Progress
    this._progress = ol_ext_element.create('DIV', {
      style: { display: 'none' },
      parent: form
    });
    var bar = ol_ext_element.create('DIV', {
      className: 'ol-progress-bar',
      parent: this._progress
    });
    this._progressbar = ol_ext_element.create('DIV', {
      parent: bar
    });
    this._progressMessage = ol_ext_element.create('DIV', {
      className: 'ol-progress-message',
      parent: this._progress
    });
    // Buttons
    ol_ext_element.create('DIV', {
      className: 'ol-buttons',
      parent: form
    });

    this.set('closeBox', options.closeBox !== false);
    this.set('zoom', !!options.zoom);
    this.set('hideOnClick', !!options.hideOnClick);
    this.set('hideOnBack', !!options.hideOnBack);
    this.set('className', element.className);
    this.set('closeOnSubmit', options.closeOnSubmit);
    this.set('buttons', options.buttons);
    this.setContent(options);
  }
  /** Show a new dialog
   * @param { * | Element | string } options options or a content to show
   *  @param {Element | String} options.content dialog content
   *  @param {string} options.title title of the dialog
   *  @param {string} options.className dialog class name
   *  @param {number} options.autoclose a delay in ms before auto close
   *  @param {boolean} options.hideOnBack close dialog when click the background
   *  @param {number} options.max if not null add a progress bar to the dialog
   *  @param {number} options.progress set the progress bar value
   *  @param {Object} options.buttons a key/value list of button to show
   *  @param {function} [options.onButton] a function that takes the button id and a list of input by className
   */
  show(options) {
    if (options) {
      if (options instanceof Element || typeof (options) === 'string') {
        options = { content: options };
      }
      this.setContent(options);
    }
    this.element.classList.add('ol-visible');
    var input = this.element.querySelector('input[type="text"],input[type="search"],input[type="number"]');
    if (input)
      input.focus();
    this.dispatchEvent({ type: 'show' });
    if (options) {
      // Auto close
      if (options.autoclose) {
        var listener = setTimeout(function () { this.hide(); }.bind(this), options.autoclose);
        this.once('hide', function () {
          clearTimeout(listener);
        });
      }
      // hideOnBack
      if (options.hideOnBack) {
        // save value
        var value = this.get('hideOnBack');
        this.set('hideOnBack', true);
        this.once('hide', function () {
          this.set('hideOnBack', value);
        }.bind(this));
      }
    }
  }
  /** Open the dialog
   */
  open() {
    this.show();
  }
  /** Set the dialog content
   * @param {Element | String} content dialog content
   */
  setContentMessage(content) {
    if (content !== undefined) {
      var elt = this.getContentElement();
      if (content instanceof Element)
        ol_ext_element.setHTML(elt, '');
      ol_ext_element.setHTML(elt, content || '');
    }
  }
  /** Set the dialog title
   * @param {Element | String} content dialog content
   */
  setTitle(title) {
    var form = this.element.querySelector('form');
    form.querySelector('h2').innerText = title || '';
    if (title) {
      form.classList.add('ol-title');
    } else {
      form.classList.remove('ol-title');
    }
  }
  /** Set the dialog content
   * @param {*} options
   *  @param {Element | String} options.content dialog content
   *  @param {string} options.title title of the dialog
   *  @param {string} options.className dialog class name
   *  @param {number} options.max if not null add a progress bar to the dialog
   *  @param {number} options.progress set the progress bar value
   *  @param {Object} options.buttons a key/value list of button to show
   *  @param {function} [options.onButton] a function that takes the button id and a list of input by className
   */
  setContent(options) {
    if (!options)
      return;
    this.element.className = this.get('className');
    if (typeof (options) === 'string')
      options = { content: options };
    options = options || {};
    this.setProgress(false);
    if (options.max)
      this.setProgress(0, options.max);
    if (options.progress !== undefined)
      this.setProgress(options.progress);
    //this.element.className = 'ol-ext-dialog' + (this.get('zoom') ? ' ol-zoom' : '');
    if (this.get('zoom'))
      this.element.classList.add('ol-zoom');
    else
      this.element.classList.remove('ol-zoom');
    if (options.className) {
      options.className.split(' ').forEach(function (c) {
        this.element.classList.add(c);
      }.bind(this));
    }
    var form = this.element.querySelector('form');
    // Content
    if (options.content !== undefined) {
      if (options.content instanceof Element)
        ol_ext_element.setHTML(form.querySelector('.ol-content'), '');
      ol_ext_element.setHTML(form.querySelector('.ol-content'), options.content || '');
    }
    // Title
    this.setTitle(options.title);
    // Closebox
    if (options.closeBox || (this.get('closeBox') && options.closeBox !== false)) {
      form.classList.add('ol-closebox');
    } else {
      form.classList.remove('ol-closebox');
    }
    // Buttons
    var buttons = this.element.querySelector('.ol-buttons');
    buttons.innerHTML = '';
    var btn = options.buttons || this.get('buttons');
    if (btn) {
      form.classList.add('ol-button');
      for (var i in btn) {
        ol_ext_element.create('INPUT', {
          type: (i === 'submit' ? 'submit' : 'button'),
          value: btn[i],
          click: this._onButton(i, options.onButton),
          parent: buttons
        });
      }
    } else {
      form.classList.remove('ol-button');
    }
  }
  /** Get dialog content element
   * @returns {Element}
   */
  getContentElement() {
    return this.element.querySelector('form .ol-content');
  }
  /** Set progress
   * @param {number|boolean} val the progress value or false to hide the progressBar
   * @param {number} max
   * @param {string|element} message
   */
  setProgress(val, max, message) {
    if (val === false) {
      ol_ext_element.setStyle(this._progress, { display: 'none' });
      return;
    }
    if (max > 0) {
      this.set('max', Number(max));
    } else {
      max = this.get('max');
    }
    if (!max) {
      ol_ext_element.setStyle(this._progress, { display: 'none' });
    } else {
      var p = Math.round(val / max * 100);
      ol_ext_element.setStyle(this._progress, { display: '' });
      this._progressbar.className = p ? '' : 'notransition';
      ol_ext_element.setStyle(this._progressbar, { width: p + '%' });
    }
    this._progressMessage.innerHTML = '';
    ol_ext_element.setHTML(this._progressMessage, message || '');
  }
  /** Returns a function to do something on button click
   * @param {strnig} button button id
   * @param {function} callback
   * @returns {function}
   * @private
   */
  _onButton(button, callback) {
    // Dispatch a button event
    var fn = function (e) {
      e.preventDefault();
      if (button !== 'submit' || this.get('closeOnSubmit') !== false) this.hide();
      var inputs = this.getInputs();
      this.dispatchEvent({ type: 'button', button: button, inputs: inputs });
      if (typeof (callback) === 'function') callback(button, inputs);
    }.bind(this);
    return fn;
  }
  /** Get inputs, textarea an select of the dialog by classname
   * @return {Object} a {key:value} list of Elements by classname
   */
  getInputs() {
    var inputs = {};
    ['input', 'textarea', 'select'].forEach(function (type) {
      this.element.querySelectorAll('form ' + type).forEach(function (input) {
        if (input.className) {
          input.className.split(' ').forEach(function (n) {
            inputs[n] = input;
          });
        }
      });
    }.bind(this));
    return inputs;
  }
  /** Close the dialog
   */
  hide() {
    this.element.classList.remove('ol-visible');
    this.dispatchEvent({ type: 'hide' });
  }
  /** Close the dialog 
   */
  close() {
    this.hide();
  }
  /** The dialog is shown
   * @return {bool} true if a dialog is open
   */
  isOpen() {
    return (this.element.classList.contains('ol-visible'));
  }
}

export default ol_control_Dialog
