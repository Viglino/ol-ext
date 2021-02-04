/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_SelectBase from './SelectBase'
import ol_ext_element from '../util/element'

/**
 * Select Control.
 * A control to select features by attributes
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.source the source to search in
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

  // Container
  var div = options.content = document.createElement("div");
  
  // Autocompletion list
  this._ul = ol_ext_element.create('UL', {
    parent: div
  });

  // All conditions
  this._all = ol_ext_element.create('INPUT', {
    type: 'checkbox',
    checked: true
  });
  var label_match_all = ol_ext_element.create('LABEL',{
    html: this._all,
    parent: div
  });
  ol_ext_element.appendText(label_match_all, options.allLabel || 'match all');
  
  // Use case
  this._useCase = ol_ext_element.create('INPUT', {
    type: 'checkbox'
  });
  var label_case_sensitive = ol_ext_element.create('LABEL',{
    html: this._useCase,
    parent: div
  });
  ol_ext_element.appendText(label_case_sensitive, options.caseLabel || 'case sensitive');

  ol_control_SelectBase.call(this, options);

  // Add button
  ol_ext_element.create('BUTTON', {
    className: 'ol-append',
    html: options.addLabel	|| 'add rule',
    click: function(){
      self.addCondition();
    },
    parent: div
  });

  this._conditions = [];
  this.set('attrPlaceHolder', options.attrPlaceHolder || 'attribute');
  this.set('valuePlaceHolder', options.valuePlaceHolder || 'value');
  this.addCondition();
};
ol_ext_inherits(ol_control_Select, ol_control_SelectBase);

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
        + this.operationsList[c.op]
        + c.val;
    }
  }
  return st
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
      input_attr.setAttribute('type', 'search');
      input_attr.setAttribute('placeholder', this.get('attrPlaceHolder'));
      input_attr.addEventListener('keyup', function () {
        self._autocomplete( this.value, this.nextElementSibling );
      })
      input_attr.addEventListener('focusout', function() {
        setTimeout(function() {
          autocomplete.querySelector('ul'). classList.add('ol-hidden');
        }, 300);
      });
      input_attr.addEventListener('click', function(){
        setTimeout(function() {
          self._autocomplete( this.value, this.nextElementSibling );
          this.nextElementSibling.classList.remove('ol-hidden');
        }.bind(this));
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
  for (var k in this.operationsList) {
    var option = document.createElement('option');
        option.value = k;
        option.textContent = this.operationsList[k];
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

/** Select features by attributes
 * @param {*} options
 *  @param {Array<ol.source.Vector>|undefined} options.sources source to apply rules, default the select sources
 *  @param {bool} options.useCase case sensitive, default checkbox state
 *  @param {bool} options.matchAll match all conditions, , default checkbox state
 *  @param {Array<conditions>} options.conditions array of conditions
 * @fires select
 */
ol_control_Select.prototype.doSelect = function (options) {
  options = options || {};
  options.useCase = options.useCase || this._useCase.checked;
  options.matchAll = options.matchAll || this._all.checked;
  options.conditions = options.conditions || this._conditions
  return ol_control_SelectBase.prototype.doSelect.call(this, options);
};

export default ol_control_Select
