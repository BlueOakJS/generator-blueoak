/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var _ = require('lodash');

module.exports = function(BlueOakGenerator) {
  /**
   * Prepare Bower overrides property to fix external bower.json with missing
   * or incomplete main property (needed by wiredep)
   */
  BlueOakGenerator.prototype.prepareBowerOverrides = function() {
    var bowerOverrides = {
      'font-awesome': {
        main: [
          './fonts/*'
        ]
      }
    };

    if (_.isEmpty(bowerOverrides)) {
      this.bowerOverrides = null;
    } else {
      this.bowerOverrides = JSON.stringify(bowerOverrides, null, 2)
        .replace(/\n/g, '\n  ');
    }
  };
};
