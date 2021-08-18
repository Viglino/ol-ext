/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import {transform as ol_proj_transform} from 'ol/proj'
import ol_control_Search from './Search'
import ol_control_SearchJSON from './SearchJSON'

/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {any} options extend ol.control.SearchJSON options
 *	@param {string} options.className control class name
 *	@param {string | undefined} [options.apiKey] the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {boolean | undefined} options.reverse enable reverse geocoding, default false
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {StreetAddress|PositionOfInterest|CadastralParcel|Commune} options.type type of search. Using Commune will return the INSEE code, default StreetAddress,PositionOfInterest
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
var ol_control_SearchGeoportail = function(options) {
  options = options || {};
  options.className = options.className || 'IGNF';
  options.typing = options.typing || 500;
  options.url = 'https://wxs.ign.fr/' + (options.apiKey || 'essentiels') + '/ols/apis/completion';
  options.copy = '<a href="https://www.geoportail.gouv.fr/" target="new">&copy; IGN-Géoportail</a>';
  ol_control_SearchJSON.call(this, options);
  this.set('type', options.type || 'StreetAddress,PositionOfInterest');
  this.set('timeout', options.timeout || 2000);
  // Authentication
  // this._auth = options.authentication;
};
ol_ext_inherits(ol_control_SearchGeoportail, ol_control_SearchJSON);

/** Reverse geocode
 * @param {ol.coordinate} coord
 * @param {function|*} options callback function called when revers located or options passed to the select event
 * @api
 */
ol_control_SearchGeoportail.prototype.reverseGeocode = function (coord, options) {
  var lonlat = ol_proj_transform(coord, this.getMap().getView().getProjection(), 'EPSG:4326');
  this._handleSelect({ 
    x: lonlat[0], 
    y: lonlat[1], 
    fulltext: lonlat[0].toFixed(6) + ',' + lonlat[1].toFixed(6) 
  }, true, options);

  // Search type
  var type = this.get('type')==='Commune' ? 'PositionOfInterest' : this.get('type') || 'StreetAddress';
  if (/,/.test(type)) type = 'StreetAddress';
  // request
  var request = '<?xml version="1.0" encoding="UTF-8"?>'
    +'<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
    +' <Request requestID="1" version="1.2" methodName="ReverseGeocodeRequest" maximumResponses="1" >'
    +'  <ReverseGeocodeRequest>'
    +'   <ReverseGeocodePreference>'+type+'</ReverseGeocodePreference>'
    +'   <Position>'
    +'    <gml:Point><gml:pos>'+lonlat[1]+' '+lonlat[0]+'</gml:pos></gml:Point>'
    +'   </Position>'
    +'  </ReverseGeocodeRequest>'
    +' </Request>'
    +'</XLS>';
    
  this.ajax (this.get('url').replace('ols/apis/completion','geoportail/ols'), 
    { xls: request },
    function(xml) {
      var f = {};
      if (!xml) {
        f = { x: lonlat[0], y: lonlat[1], fulltext: lonlat[0].toFixed(6) + ',' + lonlat[1].toFixed(6) }
      } else {
        xml = xml.replace(/\n|\r/g,'');
        var p = (xml.replace(/.*<gml:pos>(.*)<\/gml:pos>.*/, "$1")).split(' ');
        if (!Number(p[1]) && !Number(p[0])) {
          f = { x: lonlat[0], y: lonlat[1], fulltext: lonlat[0].toFixed(6) + ',' + lonlat[1].toFixed(6) }
        } else {
          f.x = lonlat[0];
          f.y = lonlat[1];
          f.city = (xml.replace(/.*<Place type="Municipality">([^<]*)<\/Place>.*/, "$1"));
          f.insee = (xml.replace(/.*<Place type="INSEE">([^<]*)<\/Place>.*/, "$1"));
          f.zipcode = (xml.replace(/.*<PostalCode>([^<]*)<\/PostalCode>.*/, "$1"));
          if (/<Street>/.test(xml)) {
            f.kind = '';
            f.country = 'StreetAddress';
            f.street = (xml.replace(/.*<Street>([^<]*)<\/Street>.*/, "$1"));
            var number = (xml.replace(/.*<Building number="([^"]*).*/, "$1"));
            f.fulltext = number+' '+f.street+', '+f.zipcode+' '+f.city;
          } else {
            f.kind = (xml.replace(/.*<Place type="Nature">([^<]*)<\/Place>.*/, "$1"));
            f.country = 'PositionOfInterest';
            f.street = '';
            f.fulltext = f.zipcode+' '+f.city;
          }
        }
      }
      if (typeof(options)==='function') {
        options.call(this, [f]);
      } else {
        this.getHistory().shift();
        this._handleSelect(f, true, options);
        // this.setInput('', true);
        // this.drawList_();
      }
    }.bind(this), {
      timeout: this.get('timeout'),
      dataType: 'XML'
    }
  );
};

/** Returns the text to be displayed in the menu
 *	@param {ol.Feature} f the feature
 *	@return {string} the text to be displayed in the index
 *	@api
 */
ol_control_SearchGeoportail.prototype.getTitle = function (f) {
  return (f.fulltext);
};

/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol_control_SearchGeoportail.prototype.requestData = function (s) {
	return { 
    text: s, 
    type: this.get('type')==='Commune' ? 'PositionOfInterest' : this.get('type') || 'StreetAddress,PositionOfInterest', 
    maximumResponses: this.get('maxItems')
  };
};

/**
 * Handle server response to pass the features array to the display list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 * @api
 */
ol_control_SearchGeoportail.prototype.handleResponse = function (response) {
  var features = response.results;
  if (this.get('type') === 'Commune') {
    for (var i=features.length-1; i>=0; i--) {
      if ( features[i].kind 
        && (features[i].classification>5 || features[i].kind=="Département") ) {
          features.splice(i,1);
      }
    }
	}
	return features;
};

/** A ligne has been clicked in the menu > dispatch event
 * @param {any} f the feature, as passed in the autocomplete
 * @param {boolean} reverse true if reverse geocode
 * @param {ol.coordinate} coord
 * @param {*} options options passed to the event
 *	@api
 */
ol_control_SearchGeoportail.prototype.select = function (f, reverse, coord, options){
  if (f.x || f.y) {
    var c = [Number(f.x), Number(f.y)];
    // Add coordinate to the event
    try {
        c = ol_proj_transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
    } catch(e) { /* ok */}
    // Get insee commune ?
    if (this.get('type')==='Commune') {
      this.searchCommune(f, function () {
        ol_control_Search.prototype.select.call(this, f, reverse, c, options);
        //this.dispatchEvent({ type:"select", search:f, coordinate: c, revers: reverse, options: options });
      });
    } else {
        ol_control_Search.prototype.select.call(this, f, reverse, c, options);
        //this.dispatchEvent({ type:"select", search:f, coordinate: c, revers: reverse, options: options });
    }
  } else {
    this.searchCommune(f);
  }
};

/** Search if no position and get the INSEE code
 * @param {string} s le nom de la commune
 */
ol_control_SearchGeoportail.prototype.searchCommune = function (f, cback) {
  var request = '<?xml version="1.0" encoding="UTF-8"?>'
	+'<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
		+'<RequestHeader/>'
		+'<Request requestID="1" version="1.2" methodName="LocationUtilityService">'
			+'<GeocodeRequest returnFreeForm="false">'
				+'<Address countryCode="PositionOfInterest">'
				+'<freeFormAddress>'+f.zipcode+' '+f.city+'+</freeFormAddress>'
				+'</Address>'
			+'</GeocodeRequest>'
		+'</Request>'
	+'</XLS>'

  // Search 
  this.ajax (this.get('url').replace('ols/apis/completion','geoportail/ols'),
    { 'xls': request }, 
    function(xml) {
      if (xml) {
        // XML to JSON
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xml,"text/xml");
        var com = xmlDoc.getElementsByTagName('GeocodedAddress')[0];
        var coord = com.getElementsByTagName('gml:Point')[0].textContent.trim().split(' ');
        f.x = Number(coord[1]);
        f.y = Number(coord[0]);
        var place = com.getElementsByTagName('Place');
        for (var i=0; i<place.length; i++) {
          switch (place[i].attributes.type.value) {
            case 'Nature': 
              f.kind = place[i].textContent;
              break;
            case 'INSEE': 
              f.insee = place[i].textContent;
              break;
          }
        }
        if (f.x || f.y) {
          if (cback) cback.call(this, [f]);
          else this._handleSelect(f);
        }
      }
    }.bind(this),
    { dataType: 'XML' }
  );
  
};

export default ol_control_SearchGeoportail
