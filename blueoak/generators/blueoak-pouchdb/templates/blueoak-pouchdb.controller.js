/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

vm.config = {
    syncOverWifiOnly: PouchdbService.isSyncOverWifiOnly(),
    pull: PouchdbService.isPullReplicationEnabled(),
    push: PouchdbService.isPushReplicationEnabled(),
};


vm.networkStatus = {
    networkType: 'UNKNOWN',
    networkStatus: 'UNKNOWN'
};


vm.replication = {
    lastSync: {
        pull:{
            eventTimestamp: null,
            docs: null,
            status: null,
            errors: null
        },
        push: {
            eventTimestamp: null,
            docs: null,
            status: null,
            errors: null
        },
        errors:[]
    },
    currentStatus: ''
};


if (!PouchdbService.remoteDb){
    vm.replication.currentStatus = 'Disabled';
} else if (!PouchdbService.getReplicationHandler()) {
    vm.replication.currentStatus = 'Stopped';
}



vm.updateDataSyncStatus = function(){
    PouchdbService.getLastSyncDocument()
    .then(function(lastSyncDoc){
        if (lastSyncDoc.pull.start_time){
            vm.replication.lastSync.pull.eventTimestamp = lastSyncDoc.pull.syncTimestamp;
            vm.replication.lastSync.pull.docs = lastSyncDoc.pull.docsSynced;
            vm.replication.lastSync.pull.status = (lastSyncDoc.pull.ok) ? 'Success' : 'Error';
            vm.replication.lastSync.pull.errors = lastSyncDoc.pull.errors;
        };

        if (lastSyncDoc.push.start_time){
            vm.replication.lastSync.push.eventTimestamp = lastSyncDoc.push.syncTimestamp;
            vm.replication.lastSync.push.docs = lastSyncDoc.push.docsSynced;
            vm.replication.lastSync.push.status = (lastSyncDoc.push.ok) ? 'Success' : 'Error';
            vm.replication.lastSync.push.errors = lastSyncDoc.push.errors;
        };

        vm.replication.lastSync.errors = lastSyncDoc.errors;
    })
    .catch(function(err){
        $log.error(err);
    });
};


/*======================================================================
*   Function updates vm.config model and saves dataSyncSettings document.
*   Calling without parameter just saves the current settings.
*/
vm.changeDataSyncSettings = function(attr){
    if ('pull' == attr){
        vm.config.pull = !vm.config.pull;
    } else if ('push' == attr){
        vm.config.push = !vm.config.push;
    } else if ('wifi' == attr){
        vm.config.syncOverWifiOnly = !vm.config.syncOverWifiOnly;
    };

    PouchdbService.updateDataSyncSettings(vm.config);
};


// Listen for Replication Status changes from PouchdbService
$rootScope.$on('$destroy', $rootScope.$on('PouchdbService.sync.statusChange', function(event, data){
    vm.updateDataSyncStatus();

    if (('complete' == data.event) && ('Offline' == vm.networkStatus.networkStatus)){
        vm.replication.currentStatus = 'No connection';
    } else {
        vm.replication.currentStatus = data.UI_Label;
    };
}));


/* =======================================================
*   Updates model when network status is changed.
*/
vm.updateNetworkInfo = function(){
    var ninfo = NetworkStatusService.getNetworkInfo();
    if (ninfo){
        vm.networkStatus.networkType = ninfo.networkTypeDescription;
        vm.networkStatus.networkStatus = ninfo.networkStatus;
    };
};


// listen for Online event
var cordovaOnOnline = $rootScope.$on('$cordovaNetwork:online', function(){
    vm.updateNetworkInfo();
});
$rootScope.$on('$destroy', cordovaOnOnline);

// listen for Offline event
var cordovaOnOffline = $rootScope.$on('$cordovaNetwork:offline', function(){
    vm.updateNetworkInfo();
});
$rootScope.$on('$destroy', cordovaOnOffline);

// set status on START.
vm.updateNetworkInfo();
vm.updateDataSyncStatus();
