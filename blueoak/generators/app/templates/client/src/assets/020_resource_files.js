#!/usr/local/bin/node

// This hook copies various resource files from
// our version control system directories into
// the appropriate platform specific location
//

// make sure we get the right app name from the params
var appName = '<%=appName%>';
process.stdout.write('----> App Name: ' + appName + '\n');

// Configure all the files to copy.  Key of object is the source file, value is the destination location.
// It's fine to put all platforms' icons and splash screen files here, even if we don't build for all
// platforms on each developer's box.
var filestocopy = [{
  '../image_assets/icons/drawable-icon.png': 'platforms/android/res/drawable/icon.png'
}, {
  '../image_assets/icons/drawable-hdpi-icon.png': 'platforms/android/res/drawable-hdpi/icon.png'
}, {
  '../image_assets/icons/drawable-ldpi-icon.png': 'platforms/android/res/drawable-ldpi/icon.png'
}, {
  '../image_assets/icons/drawable-mdpi-icon.png': 'platforms/android/res/drawable-mdpi/icon.png'
}, {
  '../image_assets/icons/drawable-xhdpi-icon.png': 'platforms/android/res/drawable-xhdpi/icon.png'
}, {
  '../image_assets/icons/drawable-xxhdpi-icon.png': 'platforms/android/res/drawable-xxhdpi/icon.png'
}, {
  '../image_assets/icons/drawable-xxxhdpi-icon.png': 'platforms/android/res/drawable-xxxhdpi/icon.png'
}, {
  '../image_assets/splash/drawable-port-hdpi-splash.png': 'platforms/android/res/drawable-port-hdpi/screen.png'
}, {
  '../image_assets/splash/drawable-port-ldpi-splash.png': 'platforms/android/res/drawable-port-ldpi/screen.png'
}, {
  '../image_assets/splash/drawable-port-mdpi-splash.png': 'platforms/android/res/drawable-port-mdpi/screen.png'
}, {
  '../image_assets/splash/drawable-port-xhdpi-splash.png': 'platforms/android/res/drawable-port-xhdpi/screen.png'
}, {
  '../image_assets/splash/drawable-port-xxhdpi-splash.png': 'platforms/android/res/drawable-port-xxhdpi/screen.png'
}, {
  '../image_assets/splash/drawable-port-xxxhdpi-splash.png': 'platforms/android/res/drawable-port-xxxhdpi/screen.png'
}, {
  '../image_assets/splash/drawable-land-hdpi-splash.png': 'platforms/android/res/drawable-land-hdpi/screen.png'
}, {
  '../image_assets/splash/drawable-land-ldpi-splash.png': 'platforms/android/res/drawable-land-ldpi/screen.png'
}, {
  '../image_assets/splash/drawable-land-mdpi-splash.png': 'platforms/android/res/drawable-land-mdpi/screen.png'
}, {
  '../image_assets/splash/drawable-land-xhdpi-splash.png': 'platforms/android/res/drawable-land-xhdpi/screen.png'
}, {
  '../image_assets/splash/drawable-land-xxhdpi-splash.png': 'platforms/android/res/drawable-land-xxhdpi/screen.png'
}, {
  '../image_assets/splash/drawable-land-xxxhdpi-splash.png': 'platforms/android/res/drawable-land-xxxhdpi/screen.png'
}, {
  '../image_assets/icons/icon-60.png': 'platforms/ios/' + appName + '/Resources/icons/icon-60.png'
}, {
  '../image_assets/icons/icon-60@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-60@2x.png'
}, {
  '../image_assets/icons/icon-60@3x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-60@3x.png'
}, {
  '../image_assets/icons/icon-76.png': 'platforms/ios/' + appName + '/Resources/icons/icon-76.png'
}, {
  '../image_assets/icons/icon-76@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-76@2x.png'
}, {
  '../image_assets/icons/icon-40.png': 'platforms/ios/' + appName + '/Resources/icons/icon-40.png'
}, {
  '../image_assets/icons/icon-40@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-40@2x.png'
}, {
  '../image_assets/icons/icon.png': 'platforms/ios/' + appName + '/Resources/icons/icon.png'
}, {
  '../image_assets/icons/icon@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon@2x.png'
}, {
  '../image_assets/icons/icon-72.png': 'platforms/ios/' + appName + '/Resources/icons/icon-72.png'
}, {
  '../image_assets/icons/icon-72@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-72@2x.png'
}, {
  '../image_assets/icons/icon-29.png': 'platforms/ios/' + appName + '/Resources/icons/icon-29.png'
}, {
  '../image_assets/icons/icon-29@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-29@2x.png'
}, {
  '../image_assets/icons/icon-50.png': 'platforms/ios/' + appName + '/Resources/icons/icon-50.png'
}, {
  '../image_assets/icons/icon-50@2x.png': 'platforms/ios/' + appName + '/Resources/icons/icon-50@2x.png'
}, {
  '../image_assets/splash/Default~iphone.png': 'platforms/ios/' + appName + '/Resources/splash/Default~iphone.png'
}, {
  '../image_assets/splash/Default@2x~iphone.png': 'platforms/ios/' + appName + '/Resources/splash/Default@2x~iphone.png'
}, {
  '../image_assets/splash/Default-Portrait~ipad.png': 'platforms/ios/' + appName + '/Resources/splash/Default-Portrait~ipad.png'
}, {
  '../image_assets/splash/Default-Portrait@2x~ipad.png': 'platforms/ios/' + appName + '/Resources/splash/Default-Portrait@2x~ipad.png'
}, {
  '../image_assets/splash/Default-Landscape~ipad.png': 'platforms/ios/' + appName + '/Resources/splash/Default-Landscape~ipad.png'
}, {
  '../image_assets/splash/Default-Landscape@2x~ipad.png': 'platforms/ios/' + appName + '/Resources/splash/Default-Landscape@2x~ipad.png'
}, {
  '../image_assets/splash/Default-568h@2x~iphone.png': 'platforms/ios/' + appName + '/Resources/splash/Default-568h@2x~iphone.png'
}, {
  '../image_assets/splash/Default-667h.png': 'platforms/ios/' + appName + '/Resources/splash/Default-667h.png'
}, {
  '../image_assets/splash/Default-736h.png': 'platforms/ios/' + appName + '/Resources/splash/Default-736h.png'
}, {
  '../image_assets/splash/Default-Landscape-736h.png': 'platforms/ios/' + appName + '/Resources/splash/Default-Landscape-736h.png'
}, ];

var fs = require('fs');
var path = require('path');

// no need to configure below
var rootdir = process.argv[2];

var targetPlatform = {'a': 'android', 'i': 'ios'};
var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

filestocopy.forEach(function (obj) {
  Object.keys(obj)
    .forEach(function (key) {
      var val = obj[key];
      var srcfile = path.join(rootdir, key);
      var destfile = path.join(rootdir, val);

      // console.log('copying ' + srcfile + ' to ' + destfile + '\n');
      process.stdout.write('copying ' + srcfile + ' to ' + destfile + '\n');

      var destdir = path.dirname(destfile);
      var targetPlatformKey = destdir[destdir.indexOf('platforms') + 10];

      var targeted = false;
      platforms.forEach(function(value) {
        if (value === targetPlatform[targetPlatformKey]) {
            targeted = true;
        }
      });

      if (!fs.existsSync(destdir) && targeted) {
        fs.mkdirSync(destdir, 0775);
      }

      if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
        fs.createReadStream(srcfile)
          .pipe(fs.createWriteStream(destfile));
      }
    });
});
