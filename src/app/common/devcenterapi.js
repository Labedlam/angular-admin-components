angular.module( 'orderCloud' )
    .factory( 'Classes', ClassesService )
    .factory( 'Courses', CoursesService )
    .factory( 'Users', UsersService )
    .factory( 'DC-Admin', AdminService)
;
function CoursesService($q, Underscore, $resource, devapiurl, $cookies) {
    var service = {
        List: _list,
        Get: _get
    };

    function _list(courseType) {
        var d = $q.defer();
       // $cookies.put('dc-token', "eyJhbGciOiJIUzI1NiJ9.YjlmN2Y5ZDMwMTRjYzM4NjU3NWU3MmIwNmFlZTg5OTA4ZmU4YTIxZGUzOGJkMzUwMGRkNmU2ZjI4MjY3YzQ1ZjM4YTc5N2EyNTY3OTQ1NTdhZWFkZWVjMGVhZmZlZmY3ZWI5M2I3MzEyMzI1MmIzMzRmZWE0YjA4NzdjZDkxNTA0YmYwOTM3OWM2NGQ0YmYxNzQ3YjIyYWU.-kgniqgo-ZQRKASbaXdUDQIqcA31H0DcgsaYQHneq4E");
        $resource(devapiurl + '/courses', {courseType: courseType}, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }

    function _get(courseID, courseType) {
        var d= $q.defer();
        $resource(devapiurl + '/courses/:courseid', {courseid: courseID, courseType: courseType}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }


    return service;
}

function ClassesService($q, Underscore, $resource, devapiurl, $cookies) {
    var service = {
        List: _list,
        Get: _get,
        Update: _update,
        Create: _create
    };

    function _list(courseID, showFields) {
        var d = $q.defer();
        var allParams = showFields || {};
        allParams.courseid = courseID;
        $resource(devapiurl + '/courses/:courseid/classes', allParams, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(err) {
                d.reject(err);
            });
        return d.promise;
    }

    function _get(courseID, classID) {

        var d = $q.defer();
        $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
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
        $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token')}}}).call(currentClass).$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _create(courseID, newClass) {
        var d= $q.defer();
        $resource(devapiurl + '/courses/:courseid/class/create', {coursid: courseID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token')}}}).call(newClass).$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    return service;
}

function UsersService ($q, $resource, devapiurl, $cookies) {
    var service = {
        Get: _get,
        SaveOcVar: _saveOcVar,
        GetOcVars: _getOcVars,
        PatchOcVar: _patchOcVar,
        DeleteOcVar: _deleteOcVar,
        GetCourseProgress: _getCourseProgress,
        SaveClassProgress: _saveClassProgress,
        GetClassProgress: _getClassProgress
    };

    function _get() {
        var d = $q.defer();
        $resource(devapiurl + '/users', {}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _saveOcVar(object) {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars', {}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token')}}}).call(object).$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _getOcVars() {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars', {}, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _deleteOcVar(params) {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars/:hash', params, {call: {method: 'DELETE', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _patchOcVar(params, update) {
        var d = $q.defer();
        $resource(devapiurl + '/users/oc-vars/:hash', params, {call: {method: 'PATCH', headers: {'dc-token': $cookies.get('dc-token')}}}).call(update).$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }


    function _getCourseProgress(courseid) {
        var d = $q.defer();
        $resource(devapiurl + '/users/progress/courses/:courseid', {courseid: courseid}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function(data) {
                d.resolve(data);
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _saveClassProgress(classid) {
        var d = $q.defer();
        $resource(devapiurl + '/users/progress/:classid', {classid: classid}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
            .then(function() {
                d.resolve();
            }, function(error) {
                d.reject(error);
            });
        return d.promise;
    }

    function _getClassProgress(classid) {
        $resource(devapiurl + '/users/progress/:classid', {classid: classid}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token')}}}).call().$promise
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