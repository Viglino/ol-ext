/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Ordering function for ol.layer.Vector renderOrder parameter
*	ol.ordering.fn (options)
*	It will return an ordering function (f0,f1)
*	@namespace
*/
var ol_ordering = {};

/** y-Ordering
*	@return ordering function (f0,f1)
*/
ol_ordering.yOrdering = function()
{	return function(f0,f1)
	{	return f1.getGeometry().getExtent()[1] - f0.getGeometry().getExtent()[1] ;
	};
};

/** Order with a feature attribute
 * @param options
 *  @param {string} options.attribute ordering attribute, default zIndex
 *  @param {function} options.equalFn ordering function for equal values
 * @return ordering function (f0,f1)
 */
ol_ordering.zIndex = function(options)
{	if (!options) options = {};
	var attr = options.attribute || 'zIndex';
	if (options.equalFn)
	{	return function(f0,f1)
		{	if (f0.get(attr) == f1.get(attr)) return options.equalFn(f0,f1);
			else return f0.get(attr) < f1.get(attr) ? 1:-1;
		};
	}
	else
	{	return function(f0,f1)
		{	if (f0.get(attr) == f1.get(attr)) return 0;
			else return f0.get(attr) < f1.get(attr) ? 1:-1;
		};
	}
};

export default ol_ordering