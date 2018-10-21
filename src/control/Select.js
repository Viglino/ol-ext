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
	// Add button
	$('<button>').text('+')
		.click(function(){ 
			self.addCondition(); 
		})
		.appendTo(div);
	// Select button
	$('<button>')
		.attr('type','button')
		.text('Select')
		.click(function() { 
			self.doSelect(); 
		})
		.appendTo(div);
	// All conditions
	this._all = $('<input>').attr('type', 'checkbox').val('all')
		.prop('checked', true)
		.prependTo($('<label>').text('match all').appendTo(div));
	// Use case 
	this._useCase = $('<input>').attr('type', 'checkbox')
		.prependTo($('<label>').text('case sensitive').appendTo(div));

	this._conditions = [];
	this.addCondition();

	ol_control_Control.call(this, {
    element: element.get(0),
    target: options.target
	});
	
	this.set('source', (options.source instanceof Array) ? options.source : [options.source]);

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
ol_control_Select.prototype._getLiCondition = function (i) {
	var self = this;
	var li = $('<li>');
	$('<input>').attr({ type: 'text' })
		.on('change', function() {
			self._conditions[i].attr = $(this).val();
		})
		.val(self._conditions[i].attr)
		.appendTo(li);
		
	var select = $('<select>').appendTo(li);
	for (var k in ol_control_Select.operationsList) {
		$('<option>').val(k)
			.text(ol_control_Select.operationsList[k])
			.appendTo(select)
	}
	select.on('change', function() {
			self._conditions[i].op = $(this).val();
		})
		.val(self._conditions[i].op);

	$('<input>').attr({ type: 'text' })
		.on('change', function() {
			self._conditions[i].val = $(this).val();
		})
		.val(self._conditions[i].val)
		.appendTo(li);
	if (this._conditions.length > 1) {
		$('<button>').addClass('ol-delete').text('-')
			.click(function(){ self.removeCondition(i); })
			.appendTo(li);
	}
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
 * @fires select
 */
ol_control_Select.prototype.doSelect = function () {
	var sources = this.get('source');
	var features = [];
	var usecase = this._useCase.prop('checked');
	var all = this._all.prop('checked');
	for (var i=0,s; s=sources[i]; i++) {
		var sfeatures = s.getFeatures();
		for (var j=0,f; f=sfeatures[j]; j++) {
			var isok = all;
			for (var k=0, c; c=this._conditions[k]; k++) {
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
};

export default ol_control_Select
