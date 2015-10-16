angular.module( 'orderCloud' )
    .factory( 'Classes', ClassesService )
    .factory( 'Courses', CoursesService )
    .factory( 'Users', UsersService )
    .factory( 'DC-Admin', AdminService)
;
function CoursesService($q, Underscore, $resource, devapiurl, $cookieStore) {
    var service = {
        List: _list,
        Get: _get
    };

    function _list() {
        var d = $q.defer();
        $resource(devapiurl + '/courses', {}, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }

    function _get(courseID) {
        var d= $q.defer();
        $resource(devapiurl + '/courses/:courseid', {courseid: courseID}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }


    return service;
}

function ClassesService($q, Underscore, $resource, devapiurl, $cookieStore) {
    var service = {
        List: _list,
        Get: _get,
        Update: _update,
        Create: _create
    };

    function _list(courseID) {
        var d = $q.defer();
        $resource(devapiurl + '/courses/:courseid/classes', {courseid: courseID}, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }

    function _get(courseID, classID) {
        var d = $q.defer();
        $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            })
            .catch(function(error) {
                d.reject(error);
            });
        return d.promise;

    }

    function _update(courseID, classID, currentClass) {
        var d = $q.defer();
        $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'POST', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(currentClass).$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _create(courseID, newClass) {
        var d= $q.defer();
        $resource(devapiurl + '/courses/:courseid/class/create', {coursid: courseID}, {call: {method: 'POST', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(newClass).$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    return service;
}

function UsersService ($q, $resource, devapiurl) {
    var service = {
        Get: _get,
        SaveOcVar: _saveOcVar,
        GetOcVar: _getOcVar,
        DeleteOcVar: _deleteOcVar,
        SaveContext: _saveContext,
        GetContext: _getContext,
        DeleteContext: _deleteContext,
        VerifyContext: _verifyContext,
        SaveCourseProgress: _saveCourseProgress,
        GetCourseProgress: _getCourseProgress
    };

    function _get() {
        var d = $q.defer();
        $resource(devapiurl + '/users', {}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _saveOcVar(object) {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars', {}, {call: {method: 'POST', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(object).$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _getOcVar() {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars', {}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _deleteOcVar(params) {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars', params, {call: {method: 'DELETE', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _saveContext(context) {
        var d = $q.defer();
        $resource(devapiurl + '/users/context', {}, {call: {method: 'POST', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(context).$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _getContext() {
        var d = $q.defer();
        $resource(devapiurl + '/users/context', {}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _verifyContext() {
        var d = $q.defer();
        $resource(devapiurl + '/users/context/verify/:clientid', {}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _deleteContext(clientid) {
        var d = $q.defer();
        $resource(devapiurl + '/users/courses/progress/:clientid', {clientid: clientid}, {call: {method: 'DELETE', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(object).$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _saveCourseProgress(object) {
        var d = $q.defer();
        $resource(devapiurl + '/users/progress/courses/:courseid', {courseid: courseid}, {call: {method: 'POST', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(object).$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _getCourseProgress() {
        var d = $q.defer();
        $resource(devapiurl + '/users/progress/courses/:courseid', {courseid: courseid}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _deleteCourseProgress() {
        var d = $q.defer();
        $resource(devapiurl + '/users/courses/progress/:courseid', {courseid: courseid}, {call: {method: 'DELETE', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _saveClassProgress(courseid) {
        var d = $q.defer();
        $resource(devapiurl + '/users/progress/classes/:courseid', {courseid: courseid}, {call: {method: 'POST', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call(object).$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _getClassProgress(courseid) {
        $resource(devapiurl + '/users/progress/classes/:courseid', {courseid: courseid}, {call: {method: 'GET', headers: {'dc-token': $cookieStore.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }



    return service;
}

function AdminService() {

}