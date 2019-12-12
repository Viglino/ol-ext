/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_layer_Tile from 'ol/layer/Tile'
import {ol_ext_inherits} from '../util/ext'
import ol_ext_Ajax from '../util/Ajax'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj'
// import {intersects as ol_extent_intersects} from 'ol/extent'

import ol_source_Geoportail from '../source/Geoportail'

/** IGN's Geoportail WMTS layer definition
 * @constructor 
 * @extends {ol.layer.Tile}
 * @param {string} layer Layer name
 * @param {olx.layer.WMTSOptions=} options WMTS options if not defined default are used
 *  @param {string} options.gppKey Geoportail API key
 * @param {olx.source.WMTSOptions=} tileoptions WMTS options if not defined default are used
 */
var ol_layer_Geoportail = function(layer, options, tileoptions) {
  options = options || {};
	tileoptions = tileoptions || {};

	var capabilities = window.geoportailConfig ? window.geoportailConfig.capabilities[options.gppKey || options.key] || window.geoportailConfig.capabilities["default"] || ol_layer_Geoportail.capabilities : ol_layer_Geoportail.capabilities;
  capabilities = capabilities[layer];
	if (!capabilities) {
    capabilities = { title: layer, originators: [] };
    console.error("ol.layer.Geoportail: no layer definition for \""+layer+"\"\nTry to use ol/layer/Geoportail~loadCapabilities() to get it.");
    // throw new Error("ol.layer.Geoportail: no layer definition for \""+layer+"\"");
  }

	// tile options & default params
	for (var i in capabilities) if (typeof	tileoptions[i]== "undefined") tileoptions[i] = capabilities[i];

	this._originators = capabilities.originators;

	if (!tileoptions.gppKey) tileoptions.gppKey = options.gppKey || options.key;
	options.source = new ol_source_Geoportail(layer, tileoptions);
	if (!options.title) options.title = capabilities.title;
	if (!options.name) options.name = layer;
	options.layer = layer;
	if (!options.queryable) options.queryable = capabilities.queryable;
	if (!options.desc) options.desc = capabilities.desc;
	if (!options.extent && capabilities.bbox) {
    if (capabilities.bbox[0]>-170 && capabilities.bbox[2]<170) {
      options.extent = ol_proj_transformExtent(capabilities.bbox, 'EPSG:4326', 'EPSG:3857');
    }
	}

	// calculate layer max resolution
	if (!options.maxResolution && tileoptions.minZoom) {
    options.source.getTileGrid().minZoom -= (tileoptions.minZoom>1 ? 2 : 1);
		options.maxResolution = options.source.getTileGrid().getResolution(options.source.getTileGrid().minZoom)
		options.source.getTileGrid().minZoom = tileoptions.minZoom;
  }

  ol_layer_Tile.call (this, options);

  // BUG GPP: Attributions constraints are not set properly :(
/** /

  // Set attribution according to the originators
  var counter = 0;
  // Get default attribution
  var getAttrib = function(title, o) {
    if (this.get('attributionMode')==='logo') {
      if (!title) return ol_source_Geoportail.prototype.attribution;
      else return '<a href="'+o.href+'"><img src="'+o.logo+'" title="&copy; '+o.attribution+'" /></a>';
    } else {
      if (!title) return ol_source_Geoportail.prototype.attribution;
      else return '&copy; <a href="'+o.href+'" title="&copy; '+(o.attribution||title)+'" >'+title+'</a>'
    }
  }.bind(this);

  var currentZ, currentCenter = [];
  var setAttribution = function(e) {
    var a, o, i;
    counter--;
    if (!counter) {
      var z = e.frameState.viewState.zoom;
      console.log(e)
      if (z===currentZ 
        && e.frameState.viewState.center[0]===currentCenter[0]
        && e.frameState.viewState.center[1]===currentCenter[1]){
          return;
      }
      currentZ = z;
      currentCenter = e.frameState.viewState.center;
      var ex = e.frameState.extent;
      ex = ol_proj_transformExtent (ex, e.frameState.viewState.projection, 'EPSG:4326');
      if (this._originators) {
        var attrib = this.getSource().getAttributions();
        // ol v5
        if (typeof(attrib)==='function') attrib = attrib();
        attrib.splice(0, attrib.length);
        var maxZoom = 0;
        for (a in this._originators) {
          o = this._originators[a];
          for (i=0; i<o.constraint.length; i++) {
            if (o.constraint[i].maxZoom > maxZoom
              && ol_extent_intersects(ex, o.constraint[i].bbox)) {
                maxZoom = o.constraint[i].maxZoom;
            }
          }	
        }
        if (maxZoom < z) z = maxZoom;
        if (this.getSource().getTileGrid() && z < this.getSource().getTileGrid().getMinZoom()) {
          z = this.getSource().getTileGrid().getMinZoom();
        }
        for (a in this._originators) {
          o = this._originators[a];
          if (!o.constraint.length) {
            attrib.push (getAttrib(a, o));
          } else {
            for (i=0; i<o.constraint.length; i++) {
              if ( z <= o.constraint[i].maxZoom 
                && z >= o.constraint[i].minZoom 
                && ol_extent_intersects(ex, o.constraint[i].bbox)) {
                  attrib.push (getAttrib(a, o));
                  break;
              }
            }
          }
        }
        if (!attrib.length) attrib.push ( getAttrib() );
        this.getSource().setAttributions(attrib);
      }
    }
  }.bind(this);

  this.on('precompose', function(e) {
    counter++;
    setTimeout(function () { setAttribution(e) }, 500);
  });
/**/
};
ol_ext_inherits (ol_layer_Geoportail, ol_layer_Tile);

/** Default capabilities for main layers
 */
ol_layer_Geoportail.capabilities = {
  "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD","title":"Carte IGN","format":"image/jpeg","style":"normal","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-179.62723,-84.5047,179.74588,85.47958],"desc":"Cartographie topographique multi-échelles du territoire français issue des bases de données vecteur de l’IGN - emprise nationale, visible du 1/200 au 1/130000000","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":13,"bbox":[-63.37252,13.428586,11.429714,51.44377]},{"minZoom":11,"maxZoom":12,"bbox":[-63.37252,13.428586,11.496459,51.444122]},{"minZoom":9,"maxZoom":9,"bbox":[-64.81273,13.428586,11.496459,51.444016]},{"minZoom":10,"maxZoom":10,"bbox":[-63.37252,13.428586,11.496459,51.444016]},{"minZoom":0,"maxZoom":2,"bbox":[-175.99709,-84.42859,175.99709,84.2865]},{"minZoom":4,"maxZoom":4,"bbox":[-179.62723,-84.0159,-179.21112,85.47958]},{"minZoom":18,"maxZoom":18,"bbox":[-63.189068,-21.428364,55.846638,51.175068]},{"minZoom":15,"maxZoom":17,"bbox":[-63.189117,-21.428364,55.84698,51.175068]},{"minZoom":14,"maxZoom":14,"bbox":[-63.283817,-21.7006,56.039127,51.44377]},{"minZoom":6,"maxZoom":8,"bbox":[-179.49689,-84.02368,179.74588,85.30035]},{"minZoom":3,"maxZoom":3,"bbox":[-176.23093,-84.5047,179.08267,84.89126]},{"minZoom":5,"maxZoom":5,"bbox":[-179.57285,-83.84196,178.4975,85.36646]}]}}},
  "ELEVATION.SLOPES": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"ELEVATION.SLOPES","title":"Altitude","format":"image/jpeg","style":"normal","queryable":true,"tilematrix":"PM","minZoom":6,"maxZoom":14,"bbox":[-178.20589,-22.595179,167.43176,50.93085],"desc":"La couche altitude se compose d'un MNT (Modèle Numérique de Terrain) affiché en teintes hypsométriques et issu de la BD ALTI®.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":6,"maxZoom":14,"constraint":[{"minZoom":6,"maxZoom":14,"bbox":[55.205746,-21.392344,55.846554,-20.86271]}]}}},
  "GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1","title":"Plan IGN j+1","format":"image/png","style":"normal","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-179.5,-75,179.5,75],"desc":"Plan IGN j+1","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":0,"maxZoom":18,"bbox":[-179,-80,179,80]}]}}},
  "CADASTRALPARCELS.PARCELS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"CADASTRALPARCELS.PARCELS","title":"Parcelles cadastrales","format":"image/png","style":"bdparcellaire","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":20,"bbox":[-63.160706,-21.39223,55.84643,51.090965],"desc":"Limites des parcelles cadastrales issues de plans scannés et de plans numériques.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":20,"constraint":[{"minZoom":0,"maxZoom":20,"bbox":[-63.160706,-21.39223,55.84643,51.090965]}]}}},
  "ORTHOIMAGERY.ORTHOPHOTOS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"ORTHOIMAGERY.ORTHOPHOTOS","title":"Photographies aériennes","format":"image/jpeg","style":"normal","queryable":true,"tilematrix":"PM","minZoom":0,"bbox":[-180,-86,180,84],"desc":"Photographies aériennes","originators":{"PLANETOBSERVER":{"href":"http://www.planetobserver.com/","attribution":"PlanetObserver (images satellites)","logo":"https://wxs.ign.fr/static/logos/PLANETOBSERVER/PLANETOBSERVER.gif","minZoom":0,"maxZoom":12,"constraint":[{"minZoom":0,"maxZoom":12,"bbox":[-180,-86,180,84]}]},"MPM":{"href":"http://www.marseille-provence.com/","attribution":"Marseille Provence Métropole","logo":"https://wxs.ign.fr/static/logos/MPM/MPM.gif","minZoom":20,"maxZoom":20,"constraint":[{"minZoom":20,"maxZoom":20,"bbox":[5.076959,43.153347,5.7168245,43.454994]}]},"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":13,"maxZoom":20,"constraint":[{"bbox":[0.035491213,43.221077,6.0235267,49.696926]},{"minZoom":20,"maxZoom":20,"bbox":[0.035491213,43.221077,6.0235267,49.696926]},{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CRAIG":{"href":"http://www.craig.fr","attribution":"Centre Régional Auvergnat de l'Information Géographique (CRAIG)","logo":"https://wxs.ign.fr/static/logos/CRAIG/CRAIG.gif","minZoom":13,"maxZoom":20,"constraint":[{"minZoom":20,"maxZoom":20,"bbox":[2.2243388,44.76621,2.7314367,45.11295]},{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CNES":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES/CNES.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CG06":{"href":"http://www.cg06.fr","attribution":"Département Alpes Maritimes (06) en partenariat avec : Groupement Orthophoto 06 (NCA, Ville de Cannes, CARF, CASA,CG06, CA de Grasse) ","logo":"https://wxs.ign.fr/static/logos/CG06/CG06.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CG45":{"href":"http://www.loiret.com","attribution":"Le conseil général du Loiret","logo":"https://wxs.ign.fr/static/logos/CG45/CG45.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"RGD_SAVOIE":{"href":"http://www.rgd.fr","attribution":"Régie de Gestion de Données des Pays de Savoie (RGD 73-74)","logo":"https://wxs.ign.fr/static/logos/RGD_SAVOIE/RGD_SAVOIE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"e-Megalis":{"href":"http://www.e-megalisbretagne.org//","attribution":"Syndicat mixte de coopération territoriale (e-Megalis)","logo":"https://wxs.ign.fr/static/logos/e-Megalis/e-Megalis.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"SIGLR":{"href":"http://www.siglr.org//","attribution":"SIGLR","logo":"https://wxs.ign.fr/static/logos/SIGLR/SIGLR.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"PPIGE":{"href":"http://www.ppige-npdc.fr/","attribution":"PPIGE","logo":"https://wxs.ign.fr/static/logos/PPIGE/PPIGE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER2":{"href":"http://www.europe-en-france.gouv.fr/","attribution":"Fonds européen de développement économique et régional","logo":"https://wxs.ign.fr/static/logos/FEDER2/FEDER2.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER":{"href":"http://www.europe-en-france.gouv.fr/","attribution":"Fonds européen de développement économique et régional","logo":"https://wxs.ign.fr/static/logos/FEDER/FEDER.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CRCORSE":{"href":"http://www.corse.fr//","attribution":"CRCORSE","logo":"https://wxs.ign.fr/static/logos/CRCORSE/CRCORSE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"CNES_AUVERGNE":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_AUVERGNE/CNES_AUVERGNE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER_PAYSDELALOIRE":{"href":"http://www.europe-en-paysdelaloire.eu/","attribution":"Pays-de-la-Loire","logo":"https://wxs.ign.fr/static/logos/FEDER_PAYSDELALOIRE/FEDER_PAYSDELALOIRE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"FEDER_AUVERGNE":{"href":"http://www.europe-en-auvergne.eu/","attribution":"Auvergne","logo":"https://wxs.ign.fr/static/logos/FEDER_AUVERGNE/FEDER_AUVERGNE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"PREFECTURE_GUADELOUPE":{"href":"www.guadeloupe.pref.gouv.fr/","attribution":"guadeloupe","logo":"https://wxs.ign.fr/static/logos/PREFECTURE_GUADELOUPE/PREFECTURE_GUADELOUPE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"BOURGOGNE-FRANCHE-COMTE":{"href":"https://www.bourgognefranchecomte.fr/","attribution":"Auvergne","logo":"https://wxs.ign.fr/static/logos/BOURGOGNE-FRANCHE-COMTE/BOURGOGNE-FRANCHE-COMTE.gif","minZoom":13,"maxZoom":19,"constraint":[{"minZoom":13,"maxZoom":19,"bbox":[-179.5,-75,179.5,75]}]},"ASTRIUM":{"href":"http://www.geo-airbusds.com/","attribution":"Airbus Defence and Space","logo":"https://wxs.ign.fr/static/logos/ASTRIUM/ASTRIUM.gif","minZoom":13,"maxZoom":16,"constraint":[{"minZoom":13,"maxZoom":16,"bbox":[-55.01953,1.845384,-50.88867,6.053161]}]},"DITTT":{"href":"http://www.dittt.gouv.nc/portal/page/portal/dittt/","attribution":"Direction des Infrastructures, de la Topographie et des Transports Terrestres","logo":"https://wxs.ign.fr/static/logos/DITTT/DITTT.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[163.47784,-22.767689,167.94624,-19.434975]}]},"CNES_ALSACE":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_ALSACE/CNES_ALSACE.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_971":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_971/CNES_971.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_972":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_972/CNES_972.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_974":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_974/CNES_974.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_975":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_975/CNES_975.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_976":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_976/CNES_976.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_977":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_977/CNES_977.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]},"CNES_978":{"href":"http://www.cnes.fr/","attribution":"Centre national d'études spatiales (CNES)","logo":"https://wxs.ign.fr/static/logos/CNES_978/CNES_978.gif","minZoom":13,"maxZoom":18,"constraint":[{"minZoom":13,"maxZoom":18,"bbox":[-179.5,-75,179.5,75]}]}}},
  "GEOGRAPHICALGRIDSYSTEMS.PLANIGN": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.PLANIGN","title":"Plan IGN","format":"image/jpeg","style":"normal","queryable":false,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-179.5,-75,179.5,75],"desc":"Représentation graphique des bases de données IGN.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":10,"maxZoom":18,"bbox":[-63.37252,-21.475586,55.925865,51.31212]},{"minZoom":0,"maxZoom":9,"bbox":[-179.5,-75,179.5,75]}]}}},
  "GEOGRAPHICALGRIDSYSTEMS.MAPS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"GEOGRAPHICALGRIDSYSTEMS.MAPS","title":"Cartes IGN","format":"image/jpeg","style":"normal","queryable":true,"tilematrix":"PM","minZoom":0,"maxZoom":18,"bbox":[-180,-68.138855,180,80],"desc":"Cartes IGN","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":0,"maxZoom":18,"constraint":[{"minZoom":17,"maxZoom":17,"bbox":[-63.189117,-21.428364,55.84698,51.175068]},{"minZoom":18,"maxZoom":18,"bbox":[-63.189068,-21.428364,55.846638,51.175068]},{"minZoom":7,"maxZoom":8,"bbox":[-178.20573,-68.138855,144.84375,51.909786]},{"minZoom":13,"maxZoom":14,"bbox":[-178.20573,-67.101425,142.03836,51.44377]},{"minZoom":11,"maxZoom":12,"bbox":[-178.20573,-67.101425,142.03836,51.444122]},{"minZoom":9,"maxZoom":10,"bbox":[-178.20573,-68.138855,144.84375,51.444016]},{"minZoom":15,"maxZoom":16,"bbox":[-178.20573,-46.502903,77.60037,51.175068]},{"minZoom":0,"maxZoom":6,"bbox":[-180,-60,180,80]}]},"NCL-DITTT":{"href":"http://www.dittt.gouv.nc/portal/page/portal/dittt","attribution":"Direction des Infrastructures, de la Topographie et des Transports Terrestres du gouvernement de la Nouvelle-Calédonie","logo":"https://wxs.ign.fr/static/logos/NCL-DITTT/NCL-DITTT.gif","minZoom":8,"maxZoom":16,"constraint":[{"minZoom":8,"maxZoom":10,"bbox":[163.47784,-22.854631,168.24048,-19.402704]},{"minZoom":11,"maxZoom":13,"bbox":[163.47784,-22.972307,168.24327,-19.494438]},{"minZoom":14,"maxZoom":15,"bbox":[164.53125,-22.75592,168.22266,-20.303417]},{"minZoom":16,"maxZoom":16,"bbox":[163.47784,-22.79525,168.19109,-19.494438]}]}}},
  "TRANSPORTNETWORKS.ROADS": {"server":"https://wxs.ign.fr/geoportail/wmts","layer":"TRANSPORTNETWORKS.ROADS","title":"Routes","format":"image/png","style":"normal","queryable":false,"tilematrix":"PM","minZoom":6,"maxZoom":18,"bbox":[-63.969162,-21.49687,55.964417,71.584076],"desc":"Affichage du réseau routier français et européen.","originators":{"IGN":{"href":"http://www.ign.fr","attribution":"Institut national de l'information géographique et forestière","logo":"https://wxs.ign.fr/static/logos/IGN/IGN.gif","minZoom":6,"maxZoom":18,"constraint":[{"minZoom":15,"maxZoom":18,"bbox":[-63.37252,-21.475586,55.925865,51.31212]},{"minZoom":6,"maxZoom":14,"bbox":[-63.969162,-21.49687,55.964417,71.584076]}]}}},
};

/** Load capabilities from the service
 * @param {string} gppKey the API key to get capabilities for
 * @return {*} Promise-like response
 */
ol_layer_Geoportail.loadCapabilities = function(gppKey, all) {
  var onSuccess = function() {}
  var onError = function() {}
  var onFinally = function() {};

  this.getCapabilities(gppKey,all).then(function(c) {
    ol_layer_Geoportail.capabilities = c;
    onSuccess(c);
  }).catch(function(e) { 
    onError(e);
  }).finally(function(c) {
    onFinally(c);
  });

  var response = {
    then: function (callback) {
      if (typeof(callback)==='function') onSuccess = callback;
      return response;
    },
    catch: function (callback) {
      if (typeof(callback)==='function') onError = callback;
      return response;
    },
    finally: function (callback) {
      if (typeof(callback)==='function') onFinally = callback;
      return response;
    }
  }
  return response;
};

/** Get Key capabilities
 * @param {string} gppKey the API key to get capabilities for
 * @return {*} Promise-like response
 */
ol_layer_Geoportail.getCapabilities = function(gppKey) {
  var capabilities = {};
  var onSuccess = function() {}
  var onError = function() {}
  var onFinally = function() {}

  var geopresolutions = [156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135,0.29858214169740677,0.14929107084870338];
  // Transform resolution to zoom
	function getZoom(res) {
    res = Number(res) * 0.000281;
		for (var r=0; r<geopresolutions.length; r++) 
			if (res>geopresolutions[r]) return r;
  }
  // Merge constraints 
  function mergeConstraints(ori) {
    for (var i=ori.constraint.length-1; i>0; i--) {
      for (var j=0; j<i; j++) {
        var bok = true;
        for (var k=0; k<4; k++) {
          if (ori.constraint[i].bbox[k] != ori.constraint[j].bbox[k]) {
            bok = false;
            break;
          }
        }
        if (!bok) continue;
        if (ori.constraint[i].maxZoom == ori.constraint[j].minZoom 
         || ori.constraint[j].maxZoom == ori.constraint[i].minZoom 
         || ori.constraint[i].maxZoom+1 == ori.constraint[j].minZoom 
         || ori.constraint[j].maxZoom+1 == ori.constraint[i].minZoom
         || ori.constraint[i].minZoom-1 == ori.constraint[j].maxZoom
         || ori.constraint[j].minZoom-1 == ori.constraint[i].maxZoom) {
          ori.constraint[j].maxZoom = Math.max(ori.constraint[i].maxZoom, ori.constraint[j].maxZoom);
          ori.constraint[j].minZoom = Math.min(ori.constraint[i].minZoom, ori.constraint[j].minZoom);
          ori.constraint.splice(i,1);
          break;
        }
      }
    }
  }
  
  // Get capabilities
  ol_ext_Ajax.get({
    url: 'https://wxs.ign.fr/'+gppKey+'/autoconf/',
    dataType: 'TEXT',
    error: function (e) {
      onError(e);
      onFinally({});
    },
    success: function(resp) {
      var parser = new DOMParser();
      var config = parser.parseFromString(resp,"text/xml");
      var layers = config.getElementsByTagName('Layer');
      for (var i=0, l; l=layers[i]; i++) {
        // WMTS ?
        if (!/WMTS/.test(l.getElementsByTagName('Server')[0].attributes['service'].value)) continue;
//        if (!all && !/geoportail\/wmts/.test(l.find("OnlineResource").attr("href"))) continue;
        var service = {
          server: l.getElementsByTagName('gpp:Key')[0].innerHTML.replace(gppKey+"/",""), 
          layer: l.getElementsByTagName('Name')[0].innerHTML,
          title: l.getElementsByTagName('Title')[0].innerHTML,
          format: l.getElementsByTagName('Format')[0].innerHTML,
          style: l.getElementsByTagName('Style')[0].getElementsByTagName('Name')[0].innerHTML,
          queryable: (l.attributes.queryable.value==='1'),
          tilematrix: 'PM',
          minZoom: getZoom(l.getElementsByTagName('sld:MaxScaleDenominator')[0].innerHTML),
          maxZoom: getZoom(l.getElementsByTagName('sld:MinScaleDenominator')[0].innerHTML),
          bbox: JSON.parse('['+l.getElementsByTagName('gpp:BoundingBox')[0].innerHTML+']'),
          desc: l.getElementsByTagName('Abstract')[0].innerHTML.replace(/^<!\[CDATA\[(.*)\]\]>$/, '$1')
        };
        service.originators = {};
        var origin = l.getElementsByTagName('gpp:Originator');
        for (var k=0, o; o=origin[k]; k++) {
          var ori = service.originators[o.attributes['name'].value] = {
            href: o.getElementsByTagName('gpp:URL')[0].innerHTML,
						attribution: o.getElementsByTagName('gpp:Attribution')[0].innerHTML,
						logo: o.getElementsByTagName('gpp:Logo')[0].innerHTML,
						minZoom: 20,
						maxZoom: 0,
						constraint: []
          };
          // Scale contraints
          var constraint = o.getElementsByTagName('gpp:Constraint');
					for (var j=0, c; c=constraint[j]; j++) {
            var zmax = getZoom(c.getElementsByTagName('sld:MinScaleDenominator')[0].innerHTML);
						var zmin = getZoom(c.getElementsByTagName('sld:MaxScaleDenominator')[0].innerHTML);
						if (zmin > ori.maxZoom) ori.maxZoom = zmin;
						if (zmin < ori.minZoom) ori.minZoom = zmin;
						if (zmax>ori.maxZoom) ori.maxZoom = zmax;
						if (zmax<ori.minZoom) ori.minZoom = zmax;

						ori.constraint.push({
              minZoom: zmin,
							maxZoom: zmax,
							bbox: JSON.parse('['+c.getElementsByTagName('gpp:BoundingBox')[0].innerHTML+']')
						});
          }
          // Merge constraints
          mergeConstraints(ori)
        }
        capabilities[service.layer] = service;
      }
      onSuccess(capabilities);
      onFinally(capabilities);
    }
  });

  // Promise like response
  var response = {
    then: function (callback) {
      if (typeof(callback)==='function') onSuccess = callback;
      return response;
    },
    catch: function (callback) {
      if (typeof(callback)==='function') onError = callback;
      return response;
    },
    finally: function (callback) {
      if (typeof(callback)==='function') onFinally = callback;
      return response;
    },
  }
  return response;
};

export default ol_layer_Geoportail
