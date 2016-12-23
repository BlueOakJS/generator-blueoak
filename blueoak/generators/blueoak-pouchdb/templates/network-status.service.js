/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

// Get Network type
var self = this;

self.getNetworkInfo = function(){
  var netStates = {};

  var result = {
    networkType: 'UNKNOWN',
    networkTypeDescription: 'UNKNOWN',
    networkStatus: 'UNKNOWN',
    isOnline: false,
    platformType: ''
  };


  if ($window.cordova && $cordovaNetwork){
    netStates.unknown  = 'Unknown connection';
    netStates.ethernet = 'Ethernet connection';
    netStates.wifi = 'WiFi connection';
    netStates['2g']  = 'Cell 2G connection';
    netStates['3g']  = 'Cell 3G connection';
    netStates['4g']  = 'Cell 4G connection';
    netStates.cellular = 'Cell generic connection';
    netStates.none = 'No network connection';

    result.networkType = $cordovaNetwork.getNetwork();
    result.networkTypeDescription = netStates[$cordovaNetwork.getNetwork()];
    result.platformType = 'cordova';

    if ($cordovaNetwork.isOnline()){
      result.networkStatus = 'Online';
      result.isOnline = true;
    } else if ($cordovaNetwork.isOffline()) {
      result.networkStatus = 'Offline';
    } else {
      result.networkStatus = 'UNKNOWN';
    }
  } else {
    // if SPA application
    result.platformType = 'spa';
    if (navigator.onLine){
      result.networkStatus = 'Online';
      result.isOnline = true;
    } else {
      result.networkStatus = 'Offline';
    };
  }
  return(result);
};
