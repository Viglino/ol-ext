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
 *	@param {string} options.className control class name
 *	@param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *	@param {string} [options.selectLabel=select] select button label
 *	@param {string} [options.addLabel=add] add button label
 *	@param {string} [options.caseLabel=case sensitive] case checkbox label
 *	@param {string} [options.allLabel=match all] match all checkbox label
 *	@param {string} [options.attrPlaceHolder=attribute]
 *	@param {string} [options.valuePlaceHolder=value]
 */
var ol_control_Select = function(options) {
  var self = this;
  if (!options) options = {};

  var element;
  if (options.target) {
    element = $("<div>").addClass(options.className || "ol-select");
  } else {
    element = $("<div>").addClass((options.className || 'ol-select') +' ol-unselectable ol-control ol-collapsed');
    $("<button>")
      .attr('type','button')
      .on("click touchstart", function(e) {
        element.toggleClass('ol-collapsed');
        e.preventDefault();
      })
      .appendTo(element);
  }
  // Containre
  var div = $('<div>').appendTo(element);
  // List of selection
  this._ul = $('<ul>').appendTo(div);
  // All conditions
  this._all = $('<input>').attr('type', 'checkbox').val('all')
    .prop('checked', true)
    .prependTo($('<label>').text(options.allLabel || 'match all').appendTo(div));
  // Use case 
  this._useCase = $('<input>').attr('type', 'checkbox')
    .prependTo($('<label>').text(options.caseLabel || 'case sensitive').appendTo(div));
  // Select button
  $('<button>')
    .attr('type','button')
    .addClass('ol-submit')
    .text(options.selectLabel || 'Select')
    .click(function() { 
      self.doSelect(); 
    })
    .appendTo(div);
  // Add button
  $('<button>').addClass('ol-append')
    .text(options.addLabel  || 'add rule')
    .click(function(){ 
      self.addCondition(); 
    })
    .appendTo(div);

  this._conditions = [];
  ol_control_Control.call(this, {
    element: element.get(0),
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
 * 	@param {string} options.op  operator
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
ol.control.Select.prototype.getConditions = function () {
	return {
		usecase: this._useCase.prop('checked'),
		all: this._all.prop('checked'),
 		conditions: this._conditions
	}
};

/** Set the condition list
 */
ol.control.Select.prototype.setConditions = function (cond) {
  this._useCase.prop('checked', cond.usecase);
  this._all.prop('checked', cond.all);
 	this._conditions = cond.conditions;
	this._drawlist();
};
	
/** Get the conditions as string
 */
ol.control.Select.prototype.getConditionsString = function (cond) {
  var st = '';
  for (var i=0,c; c=cond.conditions[i]; i++) {
    if (c.attr) {
      st += (st ? (cond.all ? ' AND ' : ' OR ') : '') 
        + c.attr 
        + ol.control.Select.operationsList[c.op]
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
	this._ul.html('');
	for (var i=0, c; c=this._conditions[i]; i++) {
		this._getLiCondition(i).appendTo(this._ul);
	}
};

/** Get a line
 * @return {*}
 * @private
 */
ol_control_Select.prototype._autocomplete = function (val, ul) {
	ul.removeClass('ol-hidden').html('');
	var attributes = {};
	var sources = this.get('source');
	for (var i=0, s; s=sources[i]; i++) {
		var features = s.getFeatures();
		for (var j=0, f; f=features[j]; j++) {
			$.extend(attributes, f.getProperties());
			if (j>100) break;
		}
	}
	var rex = new RegExp(val, 'i');
	for (var a in attributes) {
		if (a==='geometry') continue;
		if (rex.test(a)) {
			$('<li>').text(a)
				.click(function() {
					ul.prev().val($(this).text()).change();
					ul.addClass('ol-hidden')
				})
				.appendTo(ul);
		}
	}
};

/** Get a line
 * @return {*}
 * @private
 */
ol_control_Select.prototype._getLiCondition = function (i) {
	var self = this;
  var li = $('<li>');
  // Attribut
	var autocomplete = $('<div>').addClass('ol-autocomplete')
		.mouseleave(function() { 
			$('ul', this).addClass('ol-hidden'); 
		})
		.appendTo(li);
  $('<input>').addClass('ol-attr')
    .attr({ 
      type: 'text',
      placeholder: this.get('attrPlaceHolder')
    })
    .on('keyup', function () {
      self._autocomplete( $(this).val(), $(this).next() );
		})
		.click(function(){
			self._autocomplete( $(this).val(), $(this).next() );
			$(this).next().removeClass('ol-hidden')
		})
		.on('change', function() {
			self._conditions[i].attr = $(this).val();
		})
		.val(self._conditions[i].attr)
		.appendTo(autocomplete);
	// Autocomplete list
	$('<ul>').addClass('ol-hidden').appendTo(autocomplete);
  
  // Operation
	var select = $('<select>').appendTo(li);
	for (var k in ol_control_Select.operationsList) {
		$('<option>').val(k)
			.text(ol_control_Select.operationsList[k])
			.appendTo(select)
	}
  select.val(self._conditions[i].op)
    .on('change', function() {
			self._conditions[i].op = $(this).val();
		});
    
  // Value
	$('<input>').attr({ 
      type: 'text',
      placeholder: this.get('valuePlaceHolder')
    })
		.on('change', function() {
			self._conditions[i].val = $(this).val();
		})
		.val(self._conditions[i].val)
		.appendTo(li);
	if (this._conditions.length > 1) {
		$('<div>').addClass('ol-delete')
			.click(function(){ self.removeCondition(i); })
			.appendTo(li);
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
	switch (c.op) {
		case '=': 
			var rex = new RegExp('^'+this._escape(c.val)+'$', usecase ? '' : 'i');
			return rex.test(val);
		case '!=':
			var rex = new RegExp('^'+this._escape(c.val)+'$', usecase ? '' : 'i');
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
			var rex = new RegExp(this._escape(c.val), usecase ? '' : 'i');
			return rex.test(val);
		case '!contain': 
			var rex = new RegExp(this._escape(c.val), usecase ? '' : 'i');
			return !rex.test(val);
		case 'regexp': 
			var rex = new RegExp(c.val, usecase ? '' : 'i');
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
	var usecase = options.useCase || this._useCase.prop('checked');
	var all = options.matchAll || this._all.prop('checked');
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
