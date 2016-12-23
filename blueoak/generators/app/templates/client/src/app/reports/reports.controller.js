(function(){
    'use strict';

    angular
        .module('app.reports')
        .controller('ReportsController', ReportsController);

    ReportsController.$inject = ['$stateParams', 'NavigationService'];

    /**
     * @ngdoc function
     * @name ReportsController
     * @description
     * #
     */
    function ReportsController($stateParams, NavigationService) {
        var vm = this;

        vm.reports = [{
            id: 0,
            title: 'Performance Benchmarks',
            date: '03/17/2016'
        }, {
            id: 1,
            title: 'Performance Benchmarks',
            date: '03/18/2016'
        }, {
            id: 2,
            title: 'Performance Benchmarks',
            date: '03/19/2016'
        }, {
            id: 3,
            title: 'Performance Benchmarks',
            date: '03/20/2016'
        }];

        // in a production app, this would more likely be done in a ReportDetailsController, but for expediency...
        if (angular.isDefined($stateParams.id)) {
            // if you click on the back button in the header, always go up a level
            NavigationService.setBackState('reports');

            vm.currentReport = vm.reports.find(function (report) {
                return String(report.id) === $stateParams.id;
            });
        }
    }
})();
