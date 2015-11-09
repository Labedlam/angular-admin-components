angular.module( 'orderCloud' )
    .factory( 'Classes', Classes )
    .factory( 'Courses', Courses )
    .factory( 'DcUsers', DcUsers )
    .factory( 'DcAdmin', DcAdmin )
;
function Courses($resource, devapiurl, $cookies, environment) {
    var service = {
        List: _list,
        Get: _get,
        Update: _update,
        Patch: _patch,
        Create: _create
    };

    function _list(courseType, adminPage) {
        return $resource(devapiurl + '/courses', {courseType: courseType, adminPage: adminPage}, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _get(courseID, courseType) {
        return $resource(devapiurl + '/courses/:courseid', {courseid: courseID, courseType: courseType}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _update(courseID, course) {
        return $resource(devapiurl + '/courses/course/:courseid/update', {courseid: courseID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(course).$promise
    }

    function _patch(courseID, update) {
        return $resource(devapiurl + '/courses/course/:courseid', {courseid: courseID}, {call: {method: 'PATCH', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(update).$promise
    }

    function _create(course) {
        return $resource(devapiurl + '/courses/course/create', {}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(course).$promise
    }


    return service;
}

function Classes($resource, devapiurl, $cookies, environment) {
    var service = {
        List: _list,
        Get: _get,
        Update: _update,
        Patch: _patch,
        Create: _create,
        Delete: _delete,
        CopyToStaging: _copyToStaging,
        UpdateStaged: _updateStaged,
        GetStaged: _getStaged,
        OverrideLiveClass: _overrideLiveClass,
        CancelStaged: _cancelStaged
    };

    function _list(courseID, showFields) {
        var allParams = showFields || {};
        allParams.courseid = courseID;
        return $resource(devapiurl + '/courses/:courseid/classes', allParams, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _get(courseID, classID) {
        return $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise

    }

    function _update(courseID, classID, currentClass) {
        return $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(currentClass).$promise
    }

    function _patch(courseID, classID, classUpdate) {
        return $resource(devapiurl + '/courses/:courseid/classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'PATCH', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(classUpdate).$promise
    }

    function _create(courseID, newClass) {
        return $resource(devapiurl + '/courses/:courseid/create-class', {courseid: courseID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(newClass).$promise
    }

    function _delete(classID) {
        return $resource(devapiurl + '/courses/class/:classid/delete', {classid: classID}, {call: {method: 'DELETE', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _copyToStaging(courseID, classID) {
        return $resource(devapiurl + '/courses/:courseid/classes/:classid/copy', {courseid: courseID, classid: classID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _updateStaged(courseID, classID, classUpdate) {
        return $resource(devapiurl + '/courses/:courseid/staged-classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(classUpdate).$promise
    }

    function _getStaged(courseID, classID) {
        return $resource(devapiurl + '/courses/:courseid/staged-classes/:classid', {courseid: courseID, classid: classID}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _overrideLiveClass(courseID, classID) {
        return $resource(devapiurl + '/courses/:courseid/staged-classes/:classid/replace', {courseid: courseID, classid: classID}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _cancelStaged(courseID, classID) {
        return $resource(devapiurl + '/courses/:courseid/classes/:classid/cancel', {courseid: courseID, classid: classID}, {call: {method: 'DELETE', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    return service;
}

function DcUsers ($q, $resource, devapiurl, $cookies, environment) {
    var service = {
        Get: _get,
        SaveOcVar: _saveOcVar,
        GetOcVars: _getOcVars,
        PatchOcVar: _patchOcVar,
        DeleteOcVar: _deleteOcVar,
        GetCourseProgress: _getCourseProgress,
        SaveClassProgress: _saveClassProgress,
        GetClassProgress: _getClassProgress,
        SetUserContext: _setUserContext,
        GetUserContext: _getUserContext
    };

    function _get() {
        return $resource(devapiurl + '/users', {}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _saveOcVar(object) {
        return $resource(devapiurl + '/users/oc-vars', {}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(object).$promise
    }

    function _getOcVars() {
        return $resource(devapiurl + '/users/oc-vars', {}, {call: {method: 'GET', isArray: true, headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _deleteOcVar(params) {
        return $resource(devapiurl + '/users/oc-vars/:hash', params, {call: {method: 'DELETE', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _patchOcVar(params, update) {
        return $resource(devapiurl + '/users/oc-vars/:hash', params, {call: {method: 'PATCH', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(update).$promise
    }

    function _getCourseProgress(courseid) {
        return $resource(devapiurl + '/users/progress/courses/:courseid', {courseid: courseid}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _saveClassProgress(classid) {
        return $resource(devapiurl + '/users/progress/:classid', {classid: classid}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _getClassProgress(classid) {
        return $resource(devapiurl + '/users/progress/:classid', {classid: classid}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    function _setUserContext(context) {
        return $resource(devapiurl + '/users/saved-states/context/:contextid', {}, {call: {method: 'POST', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call(context).$promise
    }

    function _getUserContext() {
        return $resource(devapiurl + '/users/saved-states/context', {}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    return service;
}

function DcAdmin($resource, environment, devapiurl, $cookies) {
    var service = {
        Register: _register,
        Authenticate: _authenticate,
        IsAdmin: _isAdmin
    };

    function _register(newUser) {
        return $resource(devapiurl + '/admin/registeruser', {}, {call: {method: 'POST', headers: {'environment': environment}}}).call(newUser).$promise
    }

    function _authenticate(userHash) {
        return $resource(devapiurl + '/authenticate', {UserHash:userHash}, {call: {method: 'POST', headers: {'environment': environment}}}).call().$promise
    }

    function _isAdmin() {
        return $resource(devapiurl + '/admin/isadmin', {}, {call: {method: 'GET', headers: {'dc-token': $cookies.get('dc-token'), 'environment': environment}}}).call().$promise
    }

    return service
}