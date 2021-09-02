/*	Copyright (c) 2018 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Geoportail routing Control.
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *	@param {string} options.className control class name
 *	@param {string | undefined} options.apiKey the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
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
 *	@param {number} options.timeout default 10s
 */
ol.control.RoutingDSR = function(options) {

  ol.control.RoutingGeoportail.call(this, options);

  this.set('url', 'https://api-dscr.ign.fr/api/v1/route');
/*
  https://api-dscr.ign.fr/api/v1/route??gp-access-lib=1.1.0&origin=-1.1645594062499982,47.48751276204655&destination=1.9555577812500002,48.77791251471987&method=time&graphName=Voiture&waypoints=&format=STANDARDEXT
  https://wxs.ign.fr/h1osiyvfm7c4wu976jv6gpum/itineraire/rest/route.json?gp-access-lib=1.1.0&
  origin=-1.1466776392462616,47.73963314471081&destination=-0.2856532767853664,47.517200591317135&method=time&
  graphName=Voiture&waypoints=&format=STANDARDEXT
  https://api-dscr.ign.fr/api/v1/route?origin=2.423725%2C48.845765&destination=2.428789%2C48.845406&method=time&tolerance=50
  */
};
ol.ext.inherits(ol.control.RoutingDSR, ol.control.RoutingGeoportail);


ol.control.RoutingDSR.prototype.handleResponse = function (data /*, start, end*/) {
  if (data.status === 'ERROR') {
    this.dispatchEvent({
      type: 'errror',
      status: '200',
      statusText: data.message
    })
    return;
  }
  var format = new ol.format.GeoJSON();
  var routing  = format.readFeature(data.features[0], {
    featureProjection: this.getMap().getView().getProjection()
  })
  console.log(data, routing);
  this.dispatchEvent({ type: 'routing', feature: routing });
  this.path = routing;
  return routing;
};

ol.control.RoutingDSR.prototype.listRouting = function (routing) {
  this.resultElement.innerHTML = '';
  ol.ext.element.create('I', {
    html: routing.get('distance') + ' ('+routing.get('duration')+')',
    parent: this.resultElement
  });
  var ul = document.createElement('ul');
  this.resultElement.appendChild(ul);

  var routes = routing.get('routes')
  routes.forEach(function(r) {
    var d = this.getDistanceString(r.longueur);
    ol.ext.element.create('LI', {
      html: r.numero + ' ' + r.nom_gestionnaire +' ' + '<i>' + d +'</i>',
      parent: ul
    })
  }.bind(this));
};
