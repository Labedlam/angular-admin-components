angular.module('orderCloud')
	.factory('DevCenter', DevCenterFactory)
	.factory('DevAuth', DevAuthFactory)
;

function DevCenterFactory($resource, $state, apiurl, authurl, ocscope, devcenterClientID, DevAuth, Auth) {
	var service = {
		Register: _register,
		Login: _login,
		Logout: _logout,
		AccessToken: _getAccessToken,
		Users: {
			List: _devUsersList
		},
		Me: {
			Get: _meGet,
			//Update: _meUpdate,
			Access: _meAccess,
			DevGroups: _meDevGroups
		},
		UserGroups: {
			Create: _userGroupCreate,
			SaveMemberAssignment: _userGroupSaveMemberAssignment
			//ListMemeberAssignments: _userGroupListMemberAssignments,
			//DeleteMemberAssignment: _userGroupDeleteMemberAssignment
		},
		Company: {
			Create: _createAdminCompany
			//Update: _updateAdminCompany
		}
	};

	//GENERAL
	function _register(registration) {
		return $resource(apiurl + '/v1/registration').save(registration).$promise;
	}

	function _login(credentials) {
		var data = $.param({
			grant_type: 'password',
			scope: ocscope,
			client_id: devcenterClientID,
			username: credentials.Username || credentials.Email,
			password: credentials.Password
		});
		return $resource(authurl, {}, { login: { method: 'POST'}}).login(data).$promise;
	}

	function _logout() {
		DevAuth.RemoveToken();
		Auth.RemoveToken();
		$state.go('base.home');
	}

	function _getAccessToken(clientID, userID) {
		return $resource(apiurl + '/v1/devcenter/imersonateaccesstoken', {}, {DevTokenGet: {method: 'GET', params: { 'clientID': clientID, 'userID': userID }, headers:{Authorization: DevAuth.GetToken()}}}).DevTokenGet().$promise;
	}

	//USERS
	function _devUsersList(search, page, pageSize) {
		return $resource(apiurl + '/v1/devcenter/users', {}, {DevUserSearch: {method: 'GET', params: { 'search': search, 'page': page, 'pageSize': pageSize }, headers:{Authorization: DevAuth.GetToken()}}}).DevUserSearch.$promise;
	}

	//ME
	function _meGet() {
		return $resource(apiurl + '/v1/devcenter/me', {}, {MeGet: {method: 'GET', headers:{Authorization: DevAuth.GetToken()}}}).MeGet().$promise;
	}

	function _meDevGroups(page, pageSize, accepted) {
		return $resource(apiurl + '/v1/devcenter/Me/DevGroups', {}, {DevGroupGet: {method: 'GET', params: { 'page': page, 'pageSize': pageSize, 'accepted': accepted }, headers:{Authorization: DevAuth.GetToken()}}}).DevGroupGet().$promise;
	}

	function _meAccess(page, pageSize) {
		return $resource(apiurl + '/v1/devcenter/me/access', {}, {DevAccessGet: {method: 'GET', params: {'page': page, 'pageSize': pageSize}, headers:{Authorization: DevAuth.GetToken()}}}).DevAccessGet().$promise;
	}

	//USER GROUPS
	function _userGroupCreate(group) {
		return $resource(apiurl + '/v1/devcenter/devgroups', {}, {DevGroupSave: {method: 'POST', params:{}, headers:{Authorization: DevAuth.GetToken()}}}).DevGroupSave(group).$promise;
	}

	function _userGroupSaveMemberAssignment(groupID, userID, accepted, groupAdmin) {
		return $resource(apiurl + '/v1/devcenter/devgroups/:groupID/memberusers', { 'groupID': groupID }, {DevGroupSave: {method: 'POST', params: {}, headers:{Authorization: DevAuth.GetToken()}}}).DevGroupSave({ 'userID': userID, 'accepted': accepted, 'groupAdmin': groupAdmin }).$promise;
	}

	//COMPANY
	function _createAdminCompany(registration, assignedGroupID) {
		return $resource(apiurl + '/v1/devcenter/admincompany', {}, {DevCompanySave: {method: 'POST', params: {'assignedGroupID': assignedGroupID}, headers:{Authorization: DevAuth.GetToken()}}}).DevCompanySave(registration).$promise;
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
		$cookieStore.put('DevCenterToken', 'Bearer ' + token);
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