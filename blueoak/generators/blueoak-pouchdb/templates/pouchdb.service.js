/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

var self = this;

var REPLICATION_STATUS_LABEL = {
  ON_ACTIVE: 'Synchronizing...',
  ON_CHANGE: 'Found data changes',
  ON_PAUSE: 'Idle',
  ON_COMPLETE_LIVE: 'Stopped',
  ON_COMPLETE_ONCE: 'Completed',
  ON_DENIED: 'Remote access denied',
  ON_ERROR: 'Error'
};

var _moduleConfig;
if (appConfig && appConfig.blueoak_pouchdb){
  _moduleConfig = appConfig.blueoak_pouchdb;
};

// PRIVATE variables

var _initComplete = false;
// in-memory copy of "Data Synchronization settings" values
var _pullReplicationEnabled;
var _pushReplicationEnabled;
var _syncOverWifiOnly;

// handler to Stop/Start replication.
var _replicationHandler;
var _defaultReplicationOptions = {live: true, retry: true};
// options provided via app config file.
var _appReplicationOptions = {};

// Current replication options
var _effectiveReplicationOptions = {};

// PUBLIC variables / Methods
self.localDb;
self.remoteDb;

if (_moduleConfig && _moduleConfig.replicationOptions){
  _appReplicationOptions = _moduleConfig.replicationOptions;
};

var getCurrentReplicationOptions = function(){
  return(_effectiveReplicationOptions);
};
self.getCurrentReplicationOptions = getCurrentReplicationOptions;

//================================================================
var _isPullReplicationEnabled = function(){
  return (_pullReplicationEnabled);
};
self.isPullReplicationEnabled = _isPullReplicationEnabled;

//================================================================
var _isPushReplicationEnabled = function(){
  return (_pushReplicationEnabled);
};
self.isPushReplicationEnabled = _isPushReplicationEnabled;

//================================================================
var _isSyncOverWifiOnly = function(){
  return (_syncOverWifiOnly);
};
self.isSyncOverWifiOnly = _isSyncOverWifiOnly;


var _getReplicationHandler = function(){
  return(_replicationHandler);
};
self.getReplicationHandler = _getReplicationHandler;

//=================================================================
// Generate a new random Id
// Format: Current timestamp in millisec-random 6 chars.
// For ex.: 1468595909959-900647
self.generateId = function(len) {
   var id = new Date().getTime() + '-';
   var random;

   len = len || 6;

   for(var i=0; i < len; i++){
      random = Math.floor(Math.random() * 10);
      if (random == 0 && i == 0){
      random = Math.floor(Math.random() * 10);
   };

   id = id + random;
  }
  return(id);
};


/*
*   Purpose: Save latest pull/push events document (produced by replication emitters) as a local document.
*/
var logReplicationEvent = function(data){
  var defer = $q.defer();
  var localDb = self.localDb;

  /*
  * Custom attributes to store additional info about replication event.
  */
  var syncTimestamp = new Date().toISOString(); // custom attribute to track timestamp of the sync event.
  var docsSynced = 0;     // custom attribute to store # of docs replicated during last sync event.

  if (data && data.change){
    docsSynced = data.change.docs_written;
  };

  self.getLastSyncDocument()
  .then(function(lastSyncDoc){

    lastSyncDoc.errors = [];

    if (!data){           // ON.PAUSE listener doesn't emit data
      // if replication started successfully then erase general errors (lastSyncDoc.errors)
    } else if (data.error){  // on.ERROR listener result
      lastSyncDoc.errors.push({'error': data.error, 'message': data.message});
    } else if (data.direction){
      // Live one-way replication output. Has "direction" attribute
      if (data.direction === 'push'){
        lastSyncDoc.push = data.change;
        lastSyncDoc.push.syncTimestamp = syncTimestamp;
        lastSyncDoc.push.docsSynced = docsSynced;
      } else if (data.direction === 'pull'){
        lastSyncDoc.pull = data.change;
        lastSyncDoc.pull.syncTimestamp = syncTimestamp;
        lastSyncDoc.pull.docsSynced = docsSynced;
      };
    } else {
      if (data.pull || data.push){
        if (data.pull) {
          // two-way replication output (manual). Has "pull" and "push" attributes
          lastSyncDoc.pull = data.pull;
          lastSyncDoc.pull.syncTimestamp = syncTimestamp;
          // lastSyncDoc.pull.docsSynced = data.pull.docs.length;
          lastSyncDoc.pull.docsSynced = data.pull.docs_written;
        };

        if (data.push) {
          // two-way replication output (manual). Has "pull" and "push" attributes
          lastSyncDoc.push = data.push;
          lastSyncDoc.push.syncTimestamp = syncTimestamp;
          // lastSyncDoc.push.docsSynced = data.push.docs.length;
          lastSyncDoc.push.docsSynced = data.push.docs_written;
        };
      } else {
        //  ONE-WAY replication. Doesn't have any "Direction" attribute.
        if (_pushReplicationEnabled){
          lastSyncDoc.push = data;
          lastSyncDoc.push.syncTimestamp = syncTimestamp;
          lastSyncDoc.push.docsSynced = data.docs_written;
          // lastSyncDoc.pull.docsSynced = data.docs.length;
        } else if (_pullReplicationEnabled){
          lastSyncDoc.pull = data;
          lastSyncDoc.pull.syncTimestamp = syncTimestamp;
          // lastSyncDoc.pull.docsSynced = data.docs.length;
          lastSyncDoc.push.docsSynced = data.docs_written;
        }
      }
    };


    localDb.put(lastSyncDoc)
    .then(defer.resolve())
    .catch(function(err){
      $log.error(err);
      defer.reject(err);
    });
  })
  .catch(function(err){
    $log.error('logReplicationEvent ERROR', err);
    defer.reject(err);
  });
  return (defer.promise);
};


/* =======================================================
*   Retrieves last replication document.
*/
var getLastSyncDocument = function(){
  var defer = $q.defer();
  if (self.localDb){
    self.localDb.get('_local/lastSyncDoc')
      .then(function(doc){
          defer.resolve(doc);
      })
      .catch(function(err){
        if (err.status == 404){ // Document doesn't exist yet.
          var lastSyncTemplate = {
            _id: '_local/lastSyncDoc',
            pull: {},
            push: {}
          };
          defer.resolve(lastSyncTemplate);
        } else {
          defer.reject(err);
        };
      });
  } else {
    defer.reject('ERROR: Local database is not available.');
  }
  return defer.promise;
};
self.getLastSyncDocument = getLastSyncDocument;



//===============================================================
// Starts the replication with passed options.
// All validations and configs should be done before this method.
// var startReplication = function(){
var _startReplication = function(replicationOptions){
  var localDb = self.localDb;
  var remoteDb = self.remoteDb;

  if(remoteDb){
    if ((true === _pullReplicationEnabled) && (false === _pushReplicationEnabled)){
      // PULL Only replication
      _replicationHandler = localDb.replicate.from(remoteDb, replicationOptions);
    } else if ((false === _pullReplicationEnabled) && (true === _pushReplicationEnabled)){
      // PUSH Only replication
      _replicationHandler = localDb.replicate.to(remoteDb, replicationOptions);
    } else if ((true === _pullReplicationEnabled) && (true === _pushReplicationEnabled)){
      // BOTH directions
      _replicationHandler = localDb.sync(remoteDb, replicationOptions);
    } else {
      // REPLICATION DISABLED
      _replicationHandler = null;
    };

    _addReplicationListeners(_replicationHandler);
  };
};


// Add listeners/emitters to replication handler
var _addReplicationListeners = function(replHandler){
  if (replHandler){
    replHandler.on('active', function (info) {
      $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'active', 'UI_Label': REPLICATION_STATUS_LABEL.ON_ACTIVE, 'data': info});
    })
    .on('change', function (change) {
        var changeDoc = change;
        logReplicationEvent(changeDoc)
        .then(function(){
          $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'change', 'UI_Label': REPLICATION_STATUS_LABEL.ON_CHANGE, 'data': changeDoc});
        })
        .catch(function(err){
          $log.error(err);
        });
    })
    .on('paused', function (info) {
      // This event fires when the replication is paused, either because a live replication is waiting for changes,
      // or replication has temporarily failed, with err, and is attempting to resume.

      // Erase general replication errors from lastSyncDoc if there is none in current.
      logReplicationEvent(info)
      .then(function(){
        $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'paused', 'UI_Label': REPLICATION_STATUS_LABEL.ON_PAUSE, 'data': info});
      })
      .catch(function(err){
        $log.error(err);
      });

    })
    .on('complete', function(info){
      // Replication cancelled.
      // Complete info for live replication is useless from logReplicationEvent prospective.
      if (true === _effectiveReplicationOptions.live){
        $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'complete', 'UI_Label': REPLICATION_STATUS_LABEL.ON_COMPLETE_LIVE, 'data': info});
      } else {
        logReplicationEvent(info)
        .then(function(){
          $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'complete', 'UI_Label': REPLICATION_STATUS_LABEL.ON_COMPLETE_ONCE, 'data': info});
        })
        .catch(function(err){
          $log.error(err);
        });
      }
    })
    .on('denied', function (err) {
      // a document failed to replicate (e.g. due to permissions)
      logReplicationEvent(err)
      .then(function(){
        $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'denied', 'UI_Label': REPLICATION_STATUS_LABEL.ON_DENIED, 'data': err});
      })
      .catch(function(getErr){
        $log.error(getErr);
      });

    })
    .on('error', function (err) { // on sync Error
      $log.error('startReplication ERROR:', err);
      logReplicationEvent(err)
      .then(function(){
        $rootScope.$emit('PouchdbService.sync.statusChange', {'event': 'error', 'UI_Label': REPLICATION_STATUS_LABEL.ON_ERROR, 'data': err});
      })
      .catch(function(getErr){
        $log.error(getErr);
      });
    });
  };
};


//=================================================================
// Starts automatic continues replication when the app starts.
// For live replication we don't need to check for NET status, it is done automatically by PouchDB with fall-back algorithm.
// Replication starts when application is launched, after all initial config validations.
// var restartReplication = function(){
self.restartReplication = function(customReplicationOptions){
  var netInfo;
  var replOptions = {};

  angular.merge(replOptions, _defaultReplicationOptions, _appReplicationOptions, customReplicationOptions);
  _effectiveReplicationOptions = replOptions;

  netInfo = NetworkStatusService.getNetworkInfo();

  if ((netInfo.platformType == 'cordova') && (true === _syncOverWifiOnly) && ('wifi' != netInfo.networkType)){
    // STOP Current replication if any.
      self.stopReplication()
      .catch(function(err){
        $log.error('module.restartReplication ERROR', err);
      });

  } else {
    // RESTART current replication
    self.stopReplication()
    .then(function(){
      return (_startReplication(_effectiveReplicationOptions));
    })
    .catch(function(err){
      $log.error('module.restartReplication ERROR', err);
    });
  };
};


//==========================================================
self.stopReplication = function(){
  var defer = $q.defer();
  if (_replicationHandler){
    defer.resolve(_replicationHandler.cancel());
  } else {
    defer.resolve();
  };
  return defer.promise;
};


//=========================================================
self.getLocalDbInfo = function(){
  var info = self.localDb.info();
  return(info);
};


//=======================================================================
// Parse CONFIG.JSON file to make sure we have all required data
var parseAppConfigLocalDb = function(){
  var localDbName;
  var pouchDbOptions = {};

  var defer = $q.defer();

  if (_moduleConfig && _moduleConfig.localDb){
      pouchDbOptions = _moduleConfig.pouchDbOptions;

      localDbName = _moduleConfig.localDb.dbname;
      if (localDbName && localDbName.length > 0){
        self.localDb = PouchDB(localDbName, pouchDbOptions); //eslint-disable-line
        defer.resolve();
      } else {
        defer.reject('ERR_PDB1001: Name of the local PouchDB database is not set in the application config file (app.config.json file, blueoak_pouchdb.localDb.dbname node');
      };
  } else {
    defer.reject('ERR_PDB1000: LocalDb configuration is not set in the application config file (app.config.json file, blueoak_pouchdb.localDb node)');
  };

  return (defer.promise);
};



//=================================================================================
var parseAppConfigRemoteDb = function(){
  var remoteDbUrl;
  var remoteCfg;  // Remote DB setup: appConfig.blueoak_pouchdb.remote
  var pouchDbOptions = {};

  var defer = $q.defer();

  // Parse and validate REMOTE db config
  if (_moduleConfig && _moduleConfig.remoteDb){
    remoteCfg = _moduleConfig.remoteDb;

    /*  VALIDATE Remote db name
    *   if blueoak_pouchdb.remote node exists in config but dbname is not set then treat it as an error.
    */
    if (remoteCfg.dbname && remoteCfg.dbname.trim().length > 0){
      /*  VALIDATE Remote db URL
      *   Not an ERROR if remote URL is not set. Can be a localDb.
      */
      // Pass initialization options from config file
      if (remoteCfg.pouchDbOptions){
        pouchDbOptions = remoteCfg.pouchDbOptions;
      };

      // SET Remote DB as Remote or Local instance.
      if (remoteCfg.url && remoteCfg.url.length > 0){
        remoteDbUrl = remoteCfg.url + '/' + remoteCfg.dbname;
        self.remoteDb = PouchDB(remoteDbUrl, pouchDbOptions); //eslint-disable-line

        // Per PouchDB advice use .info() to make sure the remoteDB really exists.
        self.remoteDb.info()
          .then(function(){
            defer.resolve();
          })
          .catch(function(err){
            self.remoteDb = null;
            $log.error('parseAppConfigRemoteDb', err);
            defer.reject(err);
          });
      } else {
        // init as a LOCAL db. Can be used in DEV local environments.
        self.remoteDb = PouchDB(remoteCfg.dbname); //eslint-disable-line
        defer.resolve();
      }
    } else {
      defer.reject('ERR_PDB1003: Remote database name is not set in the application config file (app.config.json file, blueoak_pouchdb.remoteDb.dbname node). Replication is disabled.');
    };
  } else {
    defer.reject('ERR_PDB1002: Remote database URL is not set in the application config file (app.config.json file, blueoak_pouchdb.remoteDb node)');
  };

  return (defer.promise);
};


/*
*   Retrives user-modifiable settings from Local Db
*   User config is stored as a local document and as a result is DEVICE-Specific.
*   Can be changed in the future.
*/
var getDataSyncSettings = function(){
  var defer = $q.defer();
  var localDb = self.localDb;
  var defaultDataSyncSettings;

  if (localDb){
    localDb.get('_local/dataSyncSettings')
    .then(function(doc){
      _pullReplicationEnabled = doc.pull;
      _pushReplicationEnabled = doc.push;
      _syncOverWifiOnly = doc.syncOverWifiOnly;

      defer.resolve(doc);
    })
    .catch(function(err){
      // If DataSyncSettings document doesn't exist then create it.
      if (err.status == 404){

        // default values, in case section was removed from config.
        _syncOverWifiOnly = false;
        _pullReplicationEnabled = true;
        _pushReplicationEnabled = true;

        if (_moduleConfig.defaultDataSyncSettings){
          defaultDataSyncSettings = _moduleConfig.defaultDataSyncSettings;
          _syncOverWifiOnly = defaultDataSyncSettings.syncOverWifiOnly;
          _pullReplicationEnabled = defaultDataSyncSettings.pull;
          _pushReplicationEnabled = defaultDataSyncSettings.push;
        };


        var doc = {
          _id: '_local/dataSyncSettings',
          syncOverWifiOnly: _syncOverWifiOnly,
          pull: _pullReplicationEnabled,
          push: _pushReplicationEnabled
        };

        localDb.put(doc)
        .then(function(){
          defer.resolve(doc);
        })
        .catch(function(error){
          $log.error(error);
          defer.reject(error);
        });
      } else {
        $log.error('user config error', err);
        defer.reject(err);
      };
    });
  } else {
    defer.reject('LocalDb is not available.');
  }

  return (defer.promise);
};
self.getDataSyncSettings = getDataSyncSettings;


/*=====================================================================
*   Save dataSyncDoc as local document in the local database.
*/
var updateDataSyncSettings = function(cfg){

  self.localDb.get('_local/dataSyncSettings')
  .then(function(dataSyncDoc){
    angular.merge(dataSyncDoc, cfg);

    self.localDb.put(dataSyncDoc)
    .then(function(){
      _pullReplicationEnabled = dataSyncDoc.pull;
      _pushReplicationEnabled = dataSyncDoc.push;
      _syncOverWifiOnly = dataSyncDoc.syncOverWifiOnly;

      // restart replication
        self.restartReplication();
    })
    .catch(function(putError){
      $log.error(putError);
    });
  })
  .catch(function(err){
    $log.error(err);
  });
};
self.updateDataSyncSettings = updateDataSyncSettings;


// listen for Online event
var pouchServiceCordovaOnOnline = $rootScope.$on('$cordovaNetwork:online', function(){
    self.restartReplication();
});
$rootScope.$on('$destroy', pouchServiceCordovaOnOnline);

// listen for Offline event
var pouchServiceCordovaOnOffline = $rootScope.$on('$cordovaNetwork:offline', function(){
    self.restartReplication();
});
$rootScope.$on('$destroy', pouchServiceCordovaOnOffline);


//=======================================================================
self.init = function(){
  var defer = $q.defer();

  if (_initComplete){
    defer.resolve(self);
  } else {
    parseAppConfigLocalDb()
    .then(function(){
      return(parseAppConfigRemoteDb());
    })
    .then(function(){
      return(self.getDataSyncSettings());
    })
    .then(function() {
      return(self.restartReplication());
    })
    .then(function(){
      _initComplete = true;
      defer.resolve(self);
    })
    .catch(function(err){
      $log.error(err);
      defer.reject(err);
    });
  }
  return (defer.promise);
};
