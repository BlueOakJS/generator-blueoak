
    .state('<%= stateName %>', {
        parent: 'app',
        url: '<%= uri %>',
        views: {
            'primary-view@app': {
                templateUrl: 'app/<%= moduleNameProperties.moduleDirectoryName %>/<%= viewFileName %>',
                controller: '<%= controllerName %>',
                controllerAs: 'vm'
            }
        }
    })
