(function(){
    'use strict';

    /* global WL, wlInitOptions */

    angular
        .module('app.mfpConnect')
        .service('MfpConnectService', MfpConnectService);

    MfpConnectService.$inject = ['$q'];

    /**
     * @ngdoc service
     * @name MfpConnectService
     * @description
     * #
     */
    function MfpConnectService($q) {
        this.connectToMFP = function() {
            function onConnectFailure(failure) {
                this.connectPromise.reject('Unable to connect to server: ' + failure.errorMsg);
            }

            function onConnectSuccess() {
                this.connectPromise.resolve();
            }

            // Augment the wlInitOptions hash for server connection.
            wlInitOptions.showCloseOnRemoteDisableDenial = false;

            /*eslint-disable no-unused-vars*/
            wlInitOptions.onErrorRemoteDisableDenial = function(message, downloadLink) {
            /*eslint-enable no-unused-vars*/
                this.connectPromise.reject(message);
            }.bind(this);

            this.connectPromise = $q.defer();
            if ('WL' in window) {
                WL.Client.connect({
                    onFailure: onConnectFailure.bind(this),
                    onSuccess: onConnectSuccess.bind(this)
                });
            } else {
                this.connectPromise.resolve();
            }

            return this.connectPromise.promise;
        };
    }
})();
