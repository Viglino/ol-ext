/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Ordering function for ol.layer.Vector renderOrder parameter
*	ol.ordering.fn (options)
*	@param {object} 
*	@return ordering function (f0,f1)
*/
ol.ordering = {}

/** y-Ordering
*	@return ordering function (f0,f1)
*/
ol.ordering.yOrdering = function(options)
{	return function(f0,f1)
	{	return f0.getGeometry().getExtent()[1] < f1.getGeometry().getExtent()[1] ;
	};
}

/** Order with a feature attribute
*	@param option
*		attribute: ordering attribute, default zIndex
*		equalFn: ordering function for equal values
*	@return ordering function (f0,f1)
*/
ol.ordering.zIndex = function(options)
{	if (!options) options = {};
	var attr = options.attribute || 'zIndex';
	if (option.equalFn)
	{	return function(f0,f1)
		{	if (f0.get(attr) == f1.get(attr)) return option.equalFn(f0,f1);
			return f0.get(attr) < f1.get(attr);
		};
	}
	else
	{	return function(f0,f1)
		{	return f0.get(attr) < f1.get(attr);
		};
	}
}