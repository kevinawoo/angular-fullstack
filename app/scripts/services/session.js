'use strict';

angular.module('loopfirstApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
