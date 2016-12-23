/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var Base = module.exports = function () {};
Base.extend = extend;

function extend(classToExtend, protoProps, staticProps) {
	var extendedClass = classToExtend.extend({
		constructor: function() {
			extendedClass.__super__.constructor.apply(this, arguments);
			if (this._initialize)
				this._initialize.apply(this, arguments);
		}
	});

	return extendedClass.extend(protoProps, staticProps);
}
