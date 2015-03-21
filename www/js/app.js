angular.module('noble', ['ionic', 'noble.controllers', 'noble.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  // remove back button text completely
  $ionicConfigProvider.backButton.previousTitleText(false).text(' ');

  $stateProvider
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'MenuCtrl'
  })

  .state('app.noble', {
    url: "/noble",
    views: {
      '@app': {
        templateUrl: "templates/noble.html",
        controller: 'NobleCtrl'
      }
    }
  })
  .state('app.noble.module', {
    url: "/:module",
    views: {
      '@app': {
        templateUrl: "templates/module.html",
        controller: 'ModuleCtrl'
      }
    }
  })

  .state('app.noble.quest', {
    url: "/:module/:version",
    views: {
      '@app': {
        templateUrl: "templates/quest.html",
        controller: 'QuestCtrl'
      }
    }
  })
  .state('app.noble.quest.module', {
    url: "/:module",
    views: {
      '@app': {
        templateUrl: "templates/module.html",
        controller: 'ModuleCtrl'
      }
    }
  })

  .state('app.history', {
    url: "/history",
    views: {
      '@app': {
        templateUrl: "templates/history.html",
        controller: 'HistoryCtrl'
      }
    }
  })
  .state('app.history.module', {
    url: "/:module",
    views: {
      '@app': {
        templateUrl: "templates/module.html",
        controller: 'ModuleCtrl'
      }
    }
  })

  .state('app.reports', {
    url: "/reports",
    views: {
      '@app': {
        templateUrl: "templates/reports.html",
        controller: 'ReportsCtrl'
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      '@app': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  });





  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/noble');
});
