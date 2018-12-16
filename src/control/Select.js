/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'

/**
 * Select Control.
 * A control to select features by attributes
 *
 * @constructor
 * @extends {ol_control_Control}
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
var ol_control_Select = function(options) {
  var self = this;
  if (!options) options = {};

  var element;
  if (options.target) {
    element = document.createElement("div");
    element.className = options.className || "ol-select";
  } else {
    element = document.createElement("div");
    element.className = ((options.className || 'ol-select') +' ol-unselectable ol-control ol-collapsed').trim();
    var button = document.createElement("button")
        button.setAttribute('type','button');
        var click_touchstart_function = function(e) {
          element.classList.toggle('ol-collapsed');
          e.preventDefault();
        }
        button.addEventListener("click", click_touchstart_function);
        button.addEventListener("touchstart", click_touchstart_function);
    element.appendChild(button);
  }
  // Containre
  var div = document.createElement("div");
      element.appendChild(div);
  // List of selection
  this._ul = document.createElement('ul');
      div.appendChild(this._ul);
  // All conditions
  this._all = document.createElement('input');
    this._all.setAttribute('type', 'checkbox')
    this._all.value = 'all';
    this._all.checked = true;
  var label_match_all = document.createElement('label');
    label_match_all.textContent = options.allLabel || 'match all'
    div.appendChild(label_match_all);
  label_match_all.insertBefore(this._all, label_match_all.firstChild);
  div.appendChild(label_match_all);
  // Use case
  this._useCase = document.createElement('input');
  this._useCase.setAttribute('type', 'checkbox');
  var label_case_sensitive = document.createElement('label');
  label_case_sensitive.textContent = options.caseLabel || 'case sensitive';
  div.appendChild(label_case_sensitive);
  label_case_sensitive.insertBefore(this._useCase, label_case_sensitive.firstChild);
  div.appendChild(label_case_sensitive);
  // Select button
  var select_button = document.createElement('button');
      select_button.setAttribute('type','button');
      select_button.classList.add('ol-submit')
      select_button.textContent = options.selectLabel || 'Select';
      select_button.addEventListener("click", function() {
        self.doSelect();
      });
    div.appendChild(select_button);
  // Add button
  var create_button = document.createElement('button');
    create_button.classList.add('ol-append');
    create_button.textContent = options.addLabel	|| 'add rule';
    create_button.addEventListener("click", function(){
      self.addCondition();
    });
    div.appendChild(create_button);

  this._conditions = [];
  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });
  this.set('source', (options.source instanceof Array) ? options.source : [options.source]);
  this.set('attrPlaceHolder', options.attrPlaceHolder || 'attribute');
  this.set('valuePlaceHolder', options.valuePlaceHolder || 'value');
  this.addCondition();
};
ol_inherits(ol_control_Select, ol_control_Control);

/** Add a new condition
 * @param {*} options
 * 	@param {string} options.attr attribute name
 * 	@param {string} options.op	operator
 * 	@param {string} options.val attribute value
 */
ol_control_Select.prototype.addCondition = function (options) {
  options = options || {};
  this._conditions.push({
    attr: options.attr || '',
    op: options.op || '=',
    val: options.val || ''
  });
  this._drawlist();
};

/** Get the condition list
 */
ol_control_Select.prototype.getConditions = function () {
  return {
    usecase: this._useCase.checked,
    all: this._all.checked,
    conditions: this._conditions
  }
};

/** Set the condition list
 */
ol_control_Select.prototype.setConditions = function (cond) {
  this._useCase.checked = cond.usecase;
  this._all.checked = cond.all;
  this._conditions = cond.conditions;
  this._drawlist();
};

/** Get the conditions as string
 */
ol_control_Select.prototype.getConditionsString = function (cond) {
  var st = '';
  for (var i=0,c; c=cond.conditions[i]; i++) {
    if (c.attr) {
      st += (st ? (cond.all ? ' AND ' : ' OR ') : '')
        + c.attr
        + ol_control_Select.operationsList[c.op]
        + c.val;
    }
  }
  return st
};

/** List of operations / for translation
 * @api
 */
ol_control_Select.operationsList = {
  '=': '=',
  '!=': '≠',
  '<': '<',
  '<=': '≤',
  '>=': '≥',
  '>': '>',
  'contain': '⊂', // ∈
  '!contain': '⊄',	// ∉
  'regexp': '≈'
};

/** Draw the liste
 * @private
 */
ol_control_Select.prototype._drawlist = function () {
  this._ul.innerHTML = '';
  for (var i=0; i < this._conditions.length; i++) {
    this._ul.appendChild(this._getLiCondition(i));
  }
};

/** Get a line
 * @return {*}
 * @private
 */
ol_control_Select.prototype._autocomplete = function (val, ul) {
  ul.classList.remove('ol-hidden');
  ul.innerHTML = '';
  var attributes = {};
  var sources = this.get('source');
  for (var i=0, s; s=sources[i]; i++) {
    var features = s.getFeatures();
    for (var j=0, f; f=features[j]; j++) {
      Object.assign(attributes, f.getProperties());
      if (j>100) break;
    }
  }
  var rex = new RegExp(val, 'i');
  for (var a in attributes) {
    if (a==='geometry') continue;
    if (rex.test(a)) {
      var li = document.createElement('li');
    li.textContent = a;
    li.addEventListener("click", function() {
          ul.previousElementSibling.value = this.textContent;
      var event = document.createEvent('HTMLEvents');
      event.initEvent('change', true, false);
      ul.previousElementSibling.dispatchEvent(event);
          ul.classList.add('ol-hidden');
        });
        ul.appendChild(li);
    }
  }
};

/** Get a line
 * @return {*}
 * @private
 */
ol_control_Select.prototype._getLiCondition = function (i) {
  var self = this;
  var li = document.createElement('li');
  // Attribut
  var autocomplete = document.createElement('div');
      autocomplete.classList.add('ol-autocomplete');
      autocomplete.addEventListener("mouseleave", function() {
        this.querySelector('ul'). classList.add('ol-hidden');
      });
      li.appendChild(autocomplete);
  var input_attr = document.createElement('input');
      input_attr.classList.add('ol-attr');
      input_attr.setAttribute('type', 'text');
      input_attr.setAttribute('placeholder', this.get('attrPlaceHolder'));
      input_attr.addEventListener('keyup', function () {
        self._autocomplete( this.value, this.nextElementSibling );
      })
      input_attr.addEventListener('click', function(){
        self._autocomplete( this.value, this.nextElementSibling );
        this.nextElementSibling.classList.remove('ol-hidden')
      })
      input_attr.addEventListener('change', function() {
        self._conditions[i].attr = this.value;
      })
      input_attr.value = self._conditions[i].attr;
      autocomplete.appendChild(input_attr);
  // Autocomplete list
  var ul_autocomplete = document.createElement('ul');
      ul_autocomplete.classList.add('ol-hidden')
      autocomplete.appendChild(ul_autocomplete);

  // Operation
  var select = document.createElement('select');
  li.appendChild(select);
  for (var k in ol_control_Select.operationsList) {
    var option = document.createElement('option');
        option.value = k;
        option.textContent = ol_control_Select.operationsList[k];
        select.appendChild(option);
  }
  select.value = self._conditions[i].op;
  select.addEventListener('change', function() {
    self._conditions[i].op = this.value;
  });

  // Value
  var input_value = document.createElement('input');
  input_value.setAttribute('type', 'text');
      input_value.setAttribute('placeholder', this.get('valuePlaceHolder'));
    input_value.addEventListener('change', function() {
      self._conditions[i].val = this.value;
    })
    input_value.value = self._conditions[i].val;
    li.appendChild(input_value);
  if (this._conditions.length > 1) {
    var div_delete = document.createElement('div');
    div_delete.classList.add('ol-delete');
      div_delete.addEventListener("click", function(){ self.removeCondition(i); })
      li.appendChild(div_delete);
  }

  //
  return li;
};

/** Remove the ith condition
 * @param {int} i condition index
 */
ol_control_Select.prototype.removeCondition = function (i) {
  this._conditions.splice(i,1);
  this._drawlist();
};

/** Escape string for regexp
 * @param {string} search
 * @return {string}
 */
ol_control_Select.prototype._escape = function (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
/**
 *
 * @param {*} f
 * @private
 */
ol_control_Select.prototype._checkCondition = function (f, c, usecase) {
  if (!c.attr) return true;
  var val = f.get(c.attr);
  var rex;
  switch (c.op) {
    case '=':
      rex = new RegExp('^'+this._escape(c.val)+'$', usecase ? '' : 'i');
      return rex.test(val);
    case '!=':
      rex = new RegExp('^'+this._escape(c.val)+'$', usecase ? '' : 'i');
      return !rex.test(val);
    case '<':
      return val < c.val;
    case '<=':
      return val <= c.val;
    case '>':
      return val > c.val;
      case '>=':
      return val >= c.val;
    case 'contain':
      rex = new RegExp(this._escape(c.val), usecase ? '' : 'i');
      return rex.test(val);
    case '!contain':
      rex = new RegExp(this._escape(c.val), usecase ? '' : 'i');
      return !rex.test(val);
    case 'regexp':
      rex = new RegExp(c.val, usecase ? '' : 'i');
      return rex.test(val);
    default:
      return false;
  }
}
/** Select features by attributes
 * @param {*} options
 *  @param {Array<ol/source/Vector|undefined} options.sources source to apply rules, default the select sources
 *  @param {bool} options.useCase case sensitive, default checkbox state
 *  @param {bool} options.matchAll match all conditions, , default checkbox state
 *  @param {Array<conditions>} options.conditions array of conditions
 * @fires select
 */
ol_control_Select.prototype.doSelect = function (options) {
  options = options || {};
  var sources = options.sources || this.get('source');
  var features = [];
  var usecase = options.useCase || this._useCase.checked;
  var all = options.matchAll || this._all.checked;
  var conditions = options.conditions || this._conditions
  for (var i=0,s; s=sources[i]; i++) {
    var sfeatures = s.getFeatures();
    for (var j=0,f; f=sfeatures[j]; j++) {
      var isok = all;
      for (var k=0, c; c=conditions[k]; k++) {
        if (c.attr) {
          if (all) {
            isok = isok && this._checkCondition(f,c,usecase);
          }
          else {
            isok = isok || this._checkCondition(f,c,usecase);
          }
        }
      }
      if (isok) {
        features.push(f);
      }
    }
  }
  this.dispatchEvent({ type:"select", features: features });
  return features;
};

export default ol_control_Select
