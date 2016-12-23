(function () {
    'use strict';

    angular.module('<%= moduleName %>', []);
    angular.module('<%= parentModuleName %>').requires.push('<%= moduleName %>');
}());
