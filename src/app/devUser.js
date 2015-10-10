angular.module('orderCloud')
    .factory('DevCenter', DevCenterFactory);

function DevCenterFactory($resource, $injector, apiurl, Auth) {
    var service = {
        GetDevCenterAccess: _getdevcenteraccess,
        GetAccessToken: _getaccesstoken,
        CreateAdminCompany: _createadmincompany,
        As: _as
    };

    var _extendCustom, _extendLocal;
    try {
        _extendCustom = $injector.get('Extend');
        _extendLocal = $injector.get('DevCenterExtend');
    }
    catch(ex) { }

    function devcentersExtend(data) {
        if (_extendLocal) {
            if (_extendCustom && _extendCustom['DevCenter']) {
                return _extendCustom['DevCenter'](_extendLocal.extend(data));
            }
            return _extendLocal.extend(data);
        }
        else if (_extendCustom && _extendCustom['DevCenter']) {
            return _extendCustom['DevCenter'](data);
        }
        return data;
    }

    function _getdevcenteraccess(page, pageSize) {
        return $resource(apiurl + '/v1/devcenter/access').get({ 'page': page, 'pageSize': pageSize }).$promise;
    }

    function _getaccesstoken(clientID, userID) {
        return $resource(apiurl + '/v1/devcenter/accesstoken').get({ 'clientID': clientID, 'userID': userID }).$promise;
    }

    function _createadmincompany(registration, assignedGroupID) {
        return $resource(apiurl + '/v1/devcenter/admincompany').save(registration, {'assignedGroupID': assignedGroupID}).$promise;
    }

    function _as(token) {
        Auth.Impersonate(token);

        return this;
    }

    return service;
}