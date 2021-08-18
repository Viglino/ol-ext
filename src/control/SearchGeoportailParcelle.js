/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_SearchGeoportail from "./SearchGeoportail";
import {fromLonLat as ol_proj_fromLonLat} from 'ol/proj'

/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {any} options extend ol.control.SearchJSON options
 *	@param {string} options.className control class name
 *	@param {boolean | undefined} [options.apiKey] the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {Number} options.pageSize item per page for parcelle list paging, use -1 for no paging, default 5
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
var ol_control_SearchGeoportailParcelle = function(options) {
  var self = this;

  options.type = "Commune";
  options.className = (options.className ? options.className:"")+" IGNF-parcelle ol-collapsed-list ol-collapsed-num";
  options.inputLabel = "Commune";
  options.noCollapse = true;
  options.placeholder = options.placeholder || "Choisissez une commune...";
  ol_control_SearchGeoportail.call(this, options);
  this.set('copy', null);

  var element = this.element;

  // Add parcel form
  var div = document.createElement("DIV");
  element.appendChild(div);

  var label = document.createElement("LABEL");
  label.innerText = 'Préfixe'
  div.appendChild(label);
  label = document.createElement("LABEL");
  label.innerText = 'Section'
  div.appendChild(label);
  label = document.createElement("LABEL");
  label.innerText = 'Numéro'
  div.appendChild(label);
  div.appendChild(document.createElement("BR"));
  // Input
  this._inputParcelle = {
    prefix: document.createElement("INPUT"),
    section: document.createElement("INPUT"),
    numero: document.createElement("INPUT")
  };
  this._inputParcelle.prefix.setAttribute('maxlength',3);
  this._inputParcelle.section.setAttribute('maxlength',2);
  this._inputParcelle.numero.setAttribute('maxlength',4);

  // Delay search
  var tout;
  var doSearch = function() {
    if (tout) clearTimeout(tout);
    tout = setTimeout(function() {
        self.autocompleteParcelle();
    }, options.typing || 0);
  }
  
  // Add inputs
  for (var i in this._inputParcelle) {
    div.appendChild(this._inputParcelle[i]);
    this._inputParcelle[i].addEventListener("keyup", doSearch);
    this._inputParcelle[i].addEventListener('blur', function() {
      tout = setTimeout(function(){ element.classList.add('ol-collapsed-num'); }, 200);
    });
    this._inputParcelle[i].addEventListener('focus', function() {
      clearTimeout(tout);
      element.classList.remove('ol-collapsed-num');
    });
  }
  this.activateParcelle(false);

  // Autocomplete list
  var auto = document.createElement('DIV');
  auto.className = 'autocomplete-parcelle';
  element.appendChild(auto);
  var ul = document.createElement('UL');
  ul.classList.add('autocomplete-parcelle');
  auto.appendChild(ul);
  ul = document.createElement('UL');
  ul.classList.add('autocomplete-page');
  auto.appendChild(ul);

  // Show/hide list on fcus/blur	
  this._input.addEventListener('blur', function() {
    setTimeout(function(){ element.classList.add('ol-collapsed-list') }, 200);
  });
  this._input.addEventListener('focus', function() {
    element.classList.remove('ol-collapsed-list');
    self._listParcelle([]);
    if (self._commune) {
      self._commune = null;
      self._input.value = '';
      self.drawList_();
    }
    self.activateParcelle(false);
  });

  this.on('select', this.selectCommune.bind(this));
  this.set('pageSize', options.pageSize || 5);
};
ol_ext_inherits(ol_control_SearchGeoportailParcelle, ol_control_SearchGeoportail);

/** Select a commune => start searching parcelle  
 * @param {any} e 
 * @private
 */
ol_control_SearchGeoportailParcelle.prototype.selectCommune = function(e) {
  this._commune = e.search.insee;
  this._input.value = e.search.insee + ' - ' + e.search.fulltext;
  this.activateParcelle(true);
  this._inputParcelle.numero.focus();
  this.autocompleteParcelle();
};

/** Set the input parcelle
 * @param {*} p parcel
 * 	@param {string} p.Commune
 * 	@param {string} p.CommuneAbsorbee
 * 	@param {string} p.Section
 * 	@param {string} p.Numero
 * @param {boolean} search start a search
 */
ol_control_SearchGeoportailParcelle.prototype.setParcelle = function(p, search) {
  this._inputParcelle.prefix.value = (p.Commune||'') + (p.CommuneAbsorbee||'');
  this._inputParcelle.section.value = p.Section||'';
  this._inputParcelle.numero.value = p.Numero||'';
  if (search) this._triggerCustomEvent("keyup", this._inputParcelle.prefix);
};

/** Activate parcelle inputs
 * @param {bolean} b
 */
ol_control_SearchGeoportailParcelle.prototype.activateParcelle = function(b) {
  for (var i in this._inputParcelle) {
    this._inputParcelle[i].readOnly = !b;
  }
  if (b) {
    this._inputParcelle.section.parentElement.classList.add('ol-active');
  } else {
    this._inputParcelle.section.parentElement.classList.remove('ol-active');		
  }
};

/** Send search request for the parcelle  
 * @private
 */
ol_control_SearchGeoportailParcelle.prototype.autocompleteParcelle = function() {
  // Add 0 to fit the format
  function complete (s, n, c) {
    if (!s) return s;
    c = c || "0";
    while (s.length < n) s = c+s;
    return s.replace(/\*/g,'_');
  }

  // The selected commune
  var commune = this._commune;
  var prefix = complete (this._inputParcelle.prefix.value, 3);
  if (prefix === '000') {
    prefix = '___';
  }
  // Get parcelle number
  var section = complete (this._inputParcelle.section.value, 2);
  var numero = complete (this._inputParcelle.numero.value, 4, "0");
  var search = commune + (prefix||'___') + (section||"__") + (numero ?  numero : section ? "____":"0001");
  this.searchParcelle(search, 
    function(jsonResp) {
      this._listParcelle(jsonResp);
    }.bind(this),
    function() {
      console.log('oops')
    })
};

/** Send search request for a parcelle number
 * @param {string} search search parcelle number
 * @param {function} success callback function called on success
 * @param {function} error callback function called on error
 */
ol_control_SearchGeoportailParcelle.prototype.searchParcelle = function(search, success /*, error */) {
  // Request
  var request = '<?xml version="1.0" encoding="UTF-8"?>'
  +'<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
    +'<RequestHeader/>'
    +'<Request requestID="1" version="1.2" methodName="LocationUtilityService">'
      +'<GeocodeRequest returnFreeForm="false">'
        +'<Address countryCode="CadastralParcel">'
        +'<freeFormAddress>'+search+'+</freeFormAddress>'
        +'</Address>'
      +'</GeocodeRequest>'
    +'</Request>'
  +'</XLS>'
  // Geocode
  this.ajax(
    this.get('url').replace('ols/apis/completion','geoportail/ols'), 
    { xls: request },
    function(xml) {
      // XML to JSON
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(xml,"text/xml");
      var parcelles = xmlDoc.getElementsByTagName('GeocodedAddress');
      var jsonResp = []
      for (var i=0, parc; parc= parcelles[i]; i++) {
        var node = parc.getElementsByTagName('gml:pos')[0] || parc.getElementsByTagName('pos')[0];
        var p = node.childNodes[0].nodeValue.split(' ');
        var att = parc.getElementsByTagName('Place');
        var json = { 
          lon: Number(p[1]), 
          lat: Number(p[0])
        };
        for (var k=0, a; a=att[k]; k++) {
          json[a.attributes.type.value] = a.childNodes[0].nodeValue;
        }
        jsonResp.push(json);
      }
      success(jsonResp);
    }, 
    { dataType: 'XML' }
  );
};

/**
 * Draw the autocomplete list
 * @param {*} resp 
 * @private
 */
ol_control_SearchGeoportailParcelle.prototype._listParcelle = function(resp) {
  var self = this;
  var ul = this.element.querySelector("ul.autocomplete-parcelle");
  ul.innerHTML='';
  var page = this.element.querySelector("ul.autocomplete-page");
  page.innerHTML='';
  this._listParc = [];

  // Show page i
  function showPage(i) {
    var l = ul.children;
    var visible = "ol-list-"+i;
    var k;
    for (k=0; k<l.length; k++) {
      l[k].style.display = (l[k].className===visible) ? '' : 'none';
    }
    l = page.children;
    for (k=0; k<l.length; k++) {
      l[k].className = (l[k].innerText==i) ? 'selected' : '';
    }
    page.style.display = l.length>1 ? '' : 'none';
  }

  // Sort table
  resp.sort(function(a,b) {
    var na = a.INSEE+a.CommuneAbsorbee+a.Section+a.Numero;
    var nb = b.INSEE+b.CommuneAbsorbee+b.Section+b.Numero;
    return na===nb ? 0 : na<nb ? -1 : 1;
  });
  // Show list
  var n = this.get('pageSize');
  for (var i=0, r; r = resp[i]; i++) {
    var li = document.createElement("LI");
    li.setAttribute("data-search", i);
    if (n>0) li.classList.add("ol-list-"+Math.floor(i/n));
    this._listParc.push(r);
    li.addEventListener("click", function(e) {
      self._handleParcelle(self._listParc[e.currentTarget.getAttribute("data-search")]);
    });
    li.innerHTML = r.INSEE+r.CommuneAbsorbee+r.Section+r.Numero;
    ul.appendChild(li);
    //
    if (n>0 && !(i%n)) {
      li = document.createElement("LI");
      li.innerText = Math.floor(i/n);
      li.addEventListener("click", function(e) {
        showPage(e.currentTarget.innerText);
      });
      page.appendChild(li);
    }
  }
  if (n>0) showPage(0);
};

/**
 * Handle parcelle section
 * @param {*} parc 
 * @private
 */
ol_control_SearchGeoportailParcelle.prototype._handleParcelle = function(parc) {
  this.dispatchEvent({ 
    type:"parcelle", 
    search: parc, 
    coordinate: ol_proj_fromLonLat([parc.lon, parc.lat], this.getMap().getView().getProjection())
  });
};

export default ol_control_SearchGeoportailParcelle
