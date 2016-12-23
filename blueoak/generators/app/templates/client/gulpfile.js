/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are split into several files in the gulp directory
 *  for modularity.
 */

'use strict';

var gulp = require('gulp');

require('@pointsource/blueoak-build');

/**
 *  Default task is to clean, build, and serve the SPA.
 */
gulp.task('default', ['serve-spa']);
