/*	Copyright (c) 2018 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element';

/**
 * Geoportail routing Control.
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *	@param {string} options.className control class name
*	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
*	@param {string | undefined} options.label Text label to use for the search button, default "search"
*	@param {string | undefined} options.placeholder placeholder, default "Search..."
*	@param {string | undefined} options.inputLabel label for the input, default none
*	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
*	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
*	@param {integer | undefined} options.minLength minimum length to start searching, default 1
*	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
*	@param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
*	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
*	@param {function} options.autocomplete a function that take a search string and callback function to send an array
*/
var ol_control_RoutingGeoportail = function(options) {
  var self = this;
  if (!options) options = {};
  if (options.typing == undefined) options.typing = 300;

  // Class name for history
  this._classname = options.className || 'search';

  var element = document.createElement("DIV");
  var classNames = (options.className||"")+ " ol-routing";
  if (!options.target) {
    classNames += " ol-unselectable ol-control";
  }
  element.setAttribute('class', classNames);
	if (!options.target) {
    var bt = ol_ext_element.create('BUTTON', { parent: element })
    bt.addEventListener('click', function(){
      element.classList.toggle('ol-collapsed');
    });
  }

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });
  
  this.set('url', 'https://wxs.ign.fr/'+options.apiKey+'/itineraire/rest/route.json');

  this._search = [];

  var content = ol_ext_element.create('DIV', { className: 'content', parent: element } )

  var listElt = document.createElement("DIV");
  this.addSearch(content, options);
  this.addSearch(content, options);
  content.appendChild(listElt);

  ol_ext_element.create('I', { className: 'ol-car', title: options.carlabel||'by car', parent: content })
    .addEventListener("click", function() {
      self.setMode('car');
    });
  ol_ext_element.create('I', { className: 'ol-pedestrian', title: options.pedlabel||'pedestrian', parent: content })
    .addEventListener("click", function() {
      self.setMode('pedestrian');
    });
  ol_ext_element.create('I', { className: 'ol-ok', title: options.runlabel||'search', html:'OK', parent: content })
    .addEventListener("click", function() {
      self.calculate();
    });

  this.resultElement = document.createElement("DIV");
  this.resultElement.setAttribute('class', 'ol-result');
  element.appendChild(this.resultElement);

  this.setMode(options.mode || 'car');
};
ol_inherits(ol_control_RoutingGeoportail, ol_control_Control);

ol_control_RoutingGeoportail.prototype.setMode = function (mode) {
  this.set('mode', mode);
  this.element.querySelector(".ol-car").classList.remove("selected");
  this.element.querySelector(".ol-pedestrian").classList.remove("selected");
  this.element.querySelector(".ol-"+mode).classList.add("selected");
  this.calculate();
};

ol_control_RoutingGeoportail.prototype.addButton = function (className, title, info) {
  var bt = document.createElement("I");
  bt.setAttribute("class", className);
  bt.setAttribute("type", "button");
  bt.setAttribute("title", title);
  bt.innerHTML = info||'';
  this.element.appendChild(bt);
  return bt;
};

/** Add a new search input
 * @private
 */
ol_control_RoutingGeoportail.prototype.addSearch = function (element, options) {
  var self = this;
  var div = ol_ext_element.create("DIV", { parent:element });

  ol_ext_element.create ('BUTTON', { title: options.startlabel||"search", parent: div})
    .addEventListener('click', function() {
      self.resultElement.innerHTML = '';
    });

  var search = new ol_control_SearchGeoportail({
    apiKey: options.apiKey,
    target: div
  });
  this._search.push(search);
  search.on('select', function(e){
    search.setInput(e.search.fulltext);
    search.set('selection', e.search);
  });
  var self = this;
  search.element.querySelector('input').addEventListener('change', function(){
    search.set('selection', null);
    self.resultElement.innerHTML = '';
  });
};

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_RoutingGeoportail.prototype.setMap = function (map) {

  ol_control_Control.prototype.setMap.call(this, map);

  for (var i=0; i<this._search.length; i++) {
    var c = this._search[i];
    c.setMap(map);
  }
};

/** Get request data
 * @private
 */
ol_control_RoutingGeoportail.prototype.requestData = function (start, end) {
  return {
    'gp-access-lib': '1.1.0',
    origin: start.x+','+start.y,
    destination: end.x+','+end.y,
    method: 'time', // 'distance'
    graphName: this.get('mode')==='pedestrian' ? 'Pieton' : 'Voiture',
    waypoints:'',
    format: 'STANDARDEXT'
  };
};

/** Show routing as a list
 * @private
 */
ol_control_RoutingGeoportail.prototype.listRouting = function (routing) {
  var time = routing.duration/60;
  this.resultElement.innerHTML = '';
  var t = '';
  if (time<60) {
    t += time.toFixed(0)+' min';
  } else {
    t+= (time/60).toFixed(0)+' h '+(time%60).toFixed(0)+' min';
  }
  var dist = routing.distance;
  if (dist<1000) {
    t += ' ('+dist.toFixed(0)+' m)';
  } else {
    t += ' ('+(dist/1000).toFixed(2)+' km)';
  }
  var iElement = document.createElement('i');
      iElement.textContent = t;
  this.resultElement.appendChild(iElement)

  var ul = document.createElement('ul');
  this.resultElement.appendChild(ul);

  var info = {
    'none': 'Prendre sur ',
    'R': 'Tourner à droite sur ',
    'FR': 'Tourner légèrement à droite sur ',
    'L': 'Tourner à gauche sur ',
    'FL': 'Tourner légèrement à gauche sur ',
    'F': 'Continuer tout droit sur ',
  }

  for (var i=0, f; f=routing.features[i]; i++) {
    var d = f.get('distance');
    d = (d<1000) ? d.toFixed(0)+' m' : (d/1000).toFixed(2)+' km';
    var t = f.get('durationT')/60;
    console.log(f.get('duration'),t)
    t = (f.get('duration')<40) ? '' : (t<60) ? t.toFixed(0)+' min' : (t/60).toFixed(0)+' h '+(t%60).toFixed(0)+' min';
    var li = document.createElement('li');
        li.classList.add(f.get('instruction'));
        li.innerHTML = (info[f.get('instruction')||'none']||'#')
      + ' ' + f.get('name')
      + '<i>' + d + (t ? ' - ' + t : '') +'</i>'
    ul.appendChild(li);
  }
};

/** Handle routing response
 * @private
 */
ol_control_RoutingGeoportail.prototype.handleResponse = function (data) {
  var routing = { type:'routing' };
/*
  var format = new ol_format_WKT();
  routing.features = [ format.readFeature(data.geometryWkt, {
    dataProjection: 'EPSG:4326',
    featureProjection: this.getMap().getView().getProjection()
  }) ];
*/
  routing.features = [];
  var distance = 0;
  var duration = 0;
  for (var i=0, l; l=data.legs[i]; i++) {
    for (var j=0, s; s=l.steps[j]; j++) {
      var geom = [];
      for (var k=0, p; p=s.points[k]; k++){
        p = p.split(',');
        geom.push([parseFloat(p[0]),parseFloat(p[1])]);
      }
      geom = new ol.geom.LineString(geom);
      options = {
        geometry: geom.transform('EPSG:4326',this.getMap().getView().getProjection()),
        name: s.name,
        instruction: s.navInstruction,
        distance: parseFloat(s.distanceMeters),
        duration: parseFloat(s.durationSeconds)
      }
      console.log(duration, options.duration, s)
      distance += options.distance;
      duration += options.duration;
      options.distanceT = distance;
      options.durationT = duration;
      var f = new ol.Feature(options);
      routing.features.push(f);
    }
  }
  routing.distance = parseFloat(data.distanceMeters);
  routing.duration = parseFloat(data.durationSeconds);

  console.log(data, routing);
  this.dispatchEvent(routing);
  this.path = routing;
  return routing;
};

/** Calculate route
 * 
 */
ol_control_RoutingGeoportail.prototype.calculate = function () {
  this.resultElement.innerHTML = '';
  for (var i=0; i<this._search.length; i++) {
    if (!this._search[i].get('selection')) return;
  }

  var start = this._search[0].get('selection');
  var end = this._search[1].get('selection');

  var data = this.requestData(start,end);

  var url = encodeURI(this.get('url'));

  var parameters = '';
  for (var index in data) {
    parameters += (parameters) ? '&' : '?';
    if (data.hasOwnProperty(index)) parameters += index + '=' + data[index];
  }

  var self = this;

  this.ajax(url + parameters, 
    function (resp) {
      if (resp.status >= 200 && resp.status < 400) {
        self.listRouting(self.handleResponse (JSON.parse(resp.response)));
      } else {
        console.log(url + parameters, arguments);
      }
    }, function(){
      console.log(url + parameters, arguments);
    });
};	

/** Send an ajax request (GET)
 * @param {string} url
 * @param {function} onsuccess callback
 * @param {function} onerror callback
 */
ol_control_RoutingGeoportail.prototype.ajax = function (url, onsuccess, onerror){
  var self = this;

  // Abort previous request
  if (this._request) {
    this._request.abort();
  }

  // New request
  var ajax = this._request = new XMLHttpRequest();
  ajax.open('GET', url, true);
  if (this._auth) {
    ajax.setRequestHeader("Authorization", "Basic " + this._auth);
  }
  this.element.classList.add('ol-searching');

  // Load complete
  ajax.onload = function() {
    self._request = null;
    self.element.classList.remove('ol-searching');
    onsuccess.call(self, this);
  };

  // Oops, TODO do something ?
  ajax.onerror = function() {
    self._request = null;
    self.element.classList.remove('ol-searching');
    if (onerror) onerror.call(self);
  };

  // GO!
  ajax.send();
};

export default ol_control_RoutingGeoportail
