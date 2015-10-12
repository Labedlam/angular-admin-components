angular.module( 'orderCloud' )
	.factory( 'Courses', CoursesService )
;


function CoursesService($q, Underscore, $resource, devapiurl) {
	var service = {
		List: _list,
		Get: _get
	};

	function _list(headers) {
		var d = $q.defer();
		$resource(devapiurl + '/courses', {}, {dcList: {method: 'GET', headers: headers, isArray: true}}).dcList().$promise
			.then(function(data) {
				d.resolve(data);
			}, function(err) {
				d.reject(err);
			});
		return d.promise;
	}

	function _get(courseID, headers) {
		var d= $q.defer();
		$resource(devapiurl + '/courses/:courseid', {courseid: courseID}, {dcGet: {method: 'GET', headers: headers}}).dcGet().$promise
			.then(function(data) {
				d.resolve(data);
			}, function(err) {
				d.reject(err);
			});
		return d.promise;
	}

	var courses = [
		{
			ID: 'intro',
			Name: 'Introduction',
			Description: 'Familiarize yourself with the OrderCloud RESTful API and the toolsets available for developing against it.',
			Difficulty: 'Beginner',
			Classes: ['api','ordercloud','tools','sdk'],
			ImgUrl: 'assets/intro.png'
		},
		{
			ID: 'basics',
			Name: 'The Basics',
			Description: 'A real-world, interactive introduction to help you get started using OrderCloud',
			Difficulty: 'Beginner',
			Classes: ['buyer-crud', 'user-crud', 'group-crud', 'group-assignment', 'prod-crud', 'price-sched-crud', 'prod-assignments', 'category-crud', 'category-prod-assignment', 'category-assignment'],
			ImgUrl: 'assets/basics.png'
		}
	];

	var archive = [
		{
			ID: 'misc',
			Name: 'Get Authenticated',
			Description: 'Take the steps towards getting an authenticated user',
			Difficulty: 'Intermediate',
			Classes: [ 'api-access'],
			ImgUrl: 'assets/productAsBuyer.png'
		}
	];

	return service;
}