angular.module('orderCloud')
	.factory('DevCenter', DevCenterFactory)
	.factory('DevAuth', DevAuthFactory)
;

function DevCenterFactory($resource, apiurl, authurl, ocscope, devcenterClientID, DevAuth) {
	var service = {
		Login: _login,
		GetDevCenterAccess: _getdevcenteraccess,
		GetAccessToken: _getaccesstoken,
		CreateAdminCompany: _createadmincompany
	};

	function _login(credentials) {
		var data = $.param({
			grant_type: 'password',
			scope: ocscope,
			client_id: devcenterClientID,
			username: credentials.Username,
			password: credentials.Password
		});
		return $resource(authurl, {}, { login: { method: 'POST'}}).login(data).$promise;
	}

	function _getdevcenteraccess(page, pageSize) {
		return $resource(apiurl + '/v1/devcenter/access', {}, {DevGet: {method: 'GET', params: {'page': page, 'pageSize': pageSize}, headers:{Authorization: 'Bearer ' + DevAuth.GetToken()}}}).DevGet().$promise;
	}

	function _getaccesstoken(clientID, userID) {
		return $resource(apiurl + '/v1/devcenter/accesstoken', {}, {DevGet: {method: 'GET', params: { 'clientID': clientID, 'userID': userID }, headers:{Authorization: 'Bearer ' + DevAuth.GetToken()}}}).DevGet().$promise;
	}

	function _createadmincompany(registration, assignedGroupID) {
		return $resource(apiurl + '/v1/devcenter/admincompany', {}, {DevSave: {method: 'POST', params: {'assignedGroupID': assignedGroupID}, headers:{Authorization: 'Bearer ' + DevAuth.GetToken()}}}).DevSave(registration).$promise;
	}

	return service;
}

function DevAuthFactory($cookieStore, $q) {
	var service = {
		GetToken: _get,
		SetToken: _set,
		RemoveToken: _remove,
		IsAuthenticated: _isAuthenticated
	};
	return service;

	///////////////

	function _get() {
		//TODO: setup auth token storage
		return $cookieStore.get('DevCenterToken');
	}

	function _set(token) {
		$cookieStore.put('DevCenterToken', token);
	}

	function _remove() {
		$cookieStore.remove('DevCenterToken');
	}

	function _isAuthenticated() {
		var deferred = $q.defer();

		if ($cookieStore.get('DevCenterToken')) {
			deferred.resolve($cookieStore.get('DevCenterToken'));
		} else {
			deferred.reject();
		}
		return deferred.promise;
	}
}