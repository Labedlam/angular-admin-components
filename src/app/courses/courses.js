angular.module( 'orderCloud' )

	.config( CoursesConfig )
	.controller( 'CoursesCtrl', CoursesController )
	.controller( 'CourseCtrl', CourseController )
	.controller( 'ClassCtrl', ClassController )
	.factory( 'ClassSvc', ClassService )

;

function CoursesConfig( $stateProvider, $httpProvider ) {
	$httpProvider.interceptors.push(function($q, $rootScope) {
		return {
			'request': function(config) {
				$rootScope.$broadcast('event:requestSuccess', config);
				return config;
			},
			'requestError': function(rejection) {
				$rootScope.$broadcast('event:requestError', rejection);
				return $q.reject(rejection);
			},
			'response': function(response) {
				$rootScope.$broadcast('event:responseSuccess', response);
				return response;
			},
			'responseError': function(rejection) {
				$rootScope.$broadcast('event:responseError', rejection);
				return $q.reject(rejection);
			}
		};
	});
	$stateProvider
		.state( 'base.courses', {
			url: '/courses',
			templateUrl:'courses/templates/courses.tpl.html',
			controller:'CoursesCtrl',
			controllerAs: 'courses',
			data: {limitAccess:true},
			resolve: {
				CoursesList: function(Courses) {
					return Courses.List();
				}
			}
		})
		.state( 'base.course', {
			url: '/courses/:courseid',
			templateUrl:'courses/templates/course.tpl.html',
			controller:'CourseCtrl',
			controllerAs: 'course',
			data: {limitAccess:true},
			resolve: {
				SelectedCourse: function($stateParams, Courses) {
					return Courses.Get($stateParams.courseid);
				},
				ClassesList: function($q, Classes, SelectedCourse) {
					return Classes.Get(SelectedCourse.Classes);
				}
			}
		})
		.state( 'base.course.class', {
			url: '/:classid',
			templateUrl:'courses/templates/class.tpl.html',
			controller:'ClassCtrl',
			controllerAs: 'class',
			data: {limitAccess:true},
			resolve: {
				SelectedClass: function($stateParams, Underscore, ClassesList) {
					return Underscore.where(ClassesList, {ID:$stateParams.classid})[0];
				}
			}
		})
}

function CoursesController( CoursesList ) {
	var vm = this;
	vm.list = CoursesList;
}

function CourseController( SelectedCourse, ClassesList ) {
	var vm = this;
	vm.current = SelectedCourse;
	vm.classes = ClassesList;
}

function ClassController( $scope, $state, $injector, Underscore, ClassSvc, Courses, SelectedCourse, SelectedClass, Context, Me, $filter ) {
	var vm = this;
	vm.current = SelectedClass;
	vm.alert = {};
	vm.context = {};
	vm.Responses = [];
	vm.openRequestCount = 0;
	vm.docs = {};
	vm.classIndex = SelectedCourse.Classes.indexOf(vm.current.ID);
	vm.totalClasses = SelectedCourse.Classes.length;
	var nextClassID = (vm.classIndex + 1 < vm.totalClasses) ? SelectedCourse.Classes[vm.classIndex + 1] : null;
	var nextCourseID;
	if (!nextClassID) findNextCourseID();
	Me.Get()
		.then(function(data) {
			vm.context.User = data;
		}, function() {
			vm.context.User = null;
		});

	$scope.$watch(function() {
		return vm.openRequestCount;
	}, function (n, o) {
		if (vm.current.ScriptModels) {
			vm.allowNextOnSuccess = Underscore.where(vm.current.ScriptModels.Scripts, {Title: vm.current.ActiveScript})[0].NextOnSuccess;
		}
		if (n == 0 && vm.turnOnLog) {
			vm.responseFailure = false;
			angular.forEach(vm.allResponses, function(data) {
				if (data.status > 399) {
					vm.responseFailure = true;
				}
			});
			if (!vm.responseFailure) {
				vm.responseSuccess = true;
			}
		}
		else {
			if (vm.turnOnLog) {
				console.log('not yet');
			}
		}
	});

	vm.setMaxLines = function(editor) {
		editor.setOptions({
			maxLines:100
		});
	};
	vm.SelectResponse = function(response) {
		vm.SelectedResponse = response;
	};

	/*function checkAssertions() {
		angular.forEach(vm.current.Assert, function(assertion) {
			var split = assertion.method.split('.');
			var doc = vm.docs[split[0]][split[1]];
			console.log(vm.current.Assert);

			console.log(doc);
			var assertUrl = doc.UriTemplate;
			console.log(assertUrl);
			angular.forEach(vm.responses, function(response) {
				/!*if (response.method == doc.HttpVerb) {
					console.log('hello');
				}*!/

			});
		})
	}*/

	function findNextCourseID() {
		Courses.List().then(function(data) {
			var currentCourseIndex = data.indexOf(Underscore.where(data, {ID:SelectedCourse.ID})[0]);
			if (currentCourseIndex < data.length) {
				nextCourseID = data[currentCourseIndex + 1].ID;
			}
		})
	}

	vm.activeScriptFn = function(scriptTitle) {
		vm.current.ActiveScript = Underscore.where(vm.current.ScriptModels.Scripts, {Title: scriptTitle})[0].Title;
	};

	function setActiveScript() {
		var activeScriptTitle = '';
		if (vm.current.Interactive) {
			if (vm.current.ScriptModels.Scripts.length > 1) {
				activeScriptTitle = Underscore.where(vm.current.ScriptModels.Scripts, {ListOrder: 1})[0].Title;
			} else {
				activeScriptTitle = vm.current.ScriptModels.Scripts[0].Title;
			}
			vm.activeScriptFn(activeScriptTitle);
		}

	}
	setActiveScript();

	angular.forEach(vm.current.ClassMethods, function(method) { //sets docs and replaces model string constant with request example
		ClassSvc.getDocs(method)
			.then(function(data) {

				var svc = data[0];
				var mtd = data[1];
				var doc = data[2];
				if (!vm.docs[svc]) {
					vm.docs[svc] = {};
					vm.docs[svc][mtd] = doc;
				} else {
					vm.docs[svc][mtd] = doc;
				}
				angular.forEach(vm.current.ScriptModels.Scripts, function(script) {
					angular.forEach(vm.current.ClassMethods, function(method) {
						var split = method.split('.');
						var svc = split[0];
						var mtd = split[1];
						if (vm.docs[svc][mtd] && vm.docs[svc][mtd].RequestBody) {
							var stringReplace = vm.docs[svc][mtd].RequestBody.Sample;
							var newString = "";
							var on = true;
							for (var i = 0; i < stringReplace.length; i++) {
								var e = stringReplace[i];
								if (on) {
									if (e != '"') {
										newString += e;
									}
								} else {
									newString += e;
								}
								if (e == ':') {
									on = false;
								}
								if (e == ",") {
									on = true;
								}
								if (e == "[") {
									on = true;
								}
							}
							script.Model = script.Model.replace('{' + method + '}', newString)
						}
					});
				});
			})
	});

	vm.nextClass = function() {
		if (nextClassID) {
			console.log(nextClassID);
			$state.go('.', {classid: nextClassID})
		} else if(nextCourseID) {
			console.log(nextCourseID);
			$state.go('^', {courseid: nextCourseID})
		} else {
			$state.go('base.courses');
		}
	};

	vm.setMaxLines = function(editor) {
		editor.setOptions({
			maxLines:100
		});
	};


	function addMethodCount(response) {
		var endpoint = response.config.url.slice(response.config.url.indexOf('.io')+4);
		var method = response.config.method;
		var epSplit = endpoint.split('/');
		angular.forEach(vm.docs, function(svc, svcKey) {
			angular.forEach(svc, function(mtd, mtdKey) {
				var newEpSplit = [];
				angular.copy(epSplit, newEpSplit);
				if (mtd.HttpVerb == method) {
					var docEndpoint = mtd.UriTemplate;
					var docEpSplit = docEndpoint.split('/');
					console.log(docEpSplit);
					var count = -1;
					if (docEpSplit.length == newEpSplit.length) {
						angular.forEach(docEpSplit, function(piece) {
							piece = piece.split("");
							count += 1;
							if (piece[0] == '{' && piece[piece.length - 1] == '}') {
								docEpSplit.splice(count, 1);
								newEpSplit.splice(count, 1);
							}

						});
						console.log(Underscore.difference(docEpSplit, newEpSplit), Underscore.difference(newEpSplit, docEpSplit));
						if (Underscore.difference(docEpSplit, newEpSplit).length == 0 && Underscore.difference(newEpSplit, docEpSplit).length == 0) {
							console.log('hello');
							angular.forEach(vm.current.Assert, function(assertion) {
								console.log(assertion);
								console.log(svcKey + '.' + mtdKey, assertion.Method);
								if (svcKey + '.' + mtdKey == assertion.Method) {
									if (assertion.Successes) {
										assertion.Successes += 1;
										console.log('again');
									}
									else {
										assertion.Successes = 1;
										console.log('first');
									}
								}
							})
						}
					}


				}
			})
		})

	}

	if (SelectedClass.Interactive) {
		$scope.$on('event:requestSuccess', function() {
			if (vm.turnOnLog) {
				vm.openRequestCount += 1;
			}
		});

		$scope.$on('event:responseSuccess', function(event, c) {
			if (vm.turnOnLog) {
				if (c.config.url.indexOf('docs/') == -1) {
					c.data = $filter('json')(c.data);
					vm.Responses.push(c);
					console.log(c);
					vm.SelectedResponse = c;
					addMethodCount(c);
				}
				vm.openRequestCount -= 1;

			}
		});
		$scope.$on('event:responseError', function(event, c) {
			if (vm.turnOnLog) {
				if (c.config.url.indexOf('docs/') == -1) {
					c.data = $filter('json')(c.data);
					vm.Responses.push(c);
					vm.SelectedResponse = c;
				}
				vm.openRequestCount -= 1;
			}
		});
	}



	vm.Execute = function() {
		vm.turnOnLog = true;
		var fullScript = '';
		if (vm.current.ScriptModels.Meta.ExecuteAll) {
			fullScript = '';
			var orderedScripts = Underscore.chain(vm.current.ScriptModels.Scripts)
				.filter(function(script){return !script.Disable;})
				.sortBy(function(script){return script.ExecuteOrder;})
				.value();
			angular.forEach(orderedScripts, function(script) {
				fullScript += script.Model;
			})
		} else {
			var currentScript = Underscore.where(vm.current.ScriptModels.Scripts, {Title: vm.current.ActiveScript})[0];
			if (!currentScript.Disable) {
				fullScript = currentScript.Model;
			} else {
				fullScript = null;
			}
		}


		if (fullScript) {
			var injectString = "";
			angular.forEach(vm.current.Dependencies, function(d) {
				injectString += 'var ' + d + ' = injector.get("' + d + '");'
			});

			var ex = new Function("injector", injectString + fullScript);
			ex($injector);
		} else {
			vm.consoleMessage = 'script is not executable';
		}

	};


	vm.context.setContext = function() {
		Context.setContext(vm.context.clientID, vm.context.username, vm.context.password)
			.then(function() {
				vm.contextSet = true;
				vm.context.username = '';
				vm.context.password = '';
				Me.Get()
					.then(function(data) {
						if (vm.context.User) {
							vm.context.User = data;
						}
					}, function(reason) {
						console.log(reason);
					})
			}, function(reason) {
				vm.context.SetError = true;
				vm.context.SetErrorMsg = reason;
			});
	};

	vm.context.clearContext = function() {
		Context.clearContext();
		vm.contextSet = false;
		vm.context.User = null;
	}

}

function ClassService($resource, apiurl, $q) {
	var service = {
		getDocs: _getDocs
	};
	function _getDocs(target) {
		var dfd = $q.defer();
		var targetSplit = target.split('.');
		var serviceName = targetSplit[0];
		var methodName = targetSplit[1];
		$resource( apiurl + '/v1/docs/' + serviceName ).get().$promise
			.then(function(data) {
				angular.forEach(data.Endpoints, function(ep) {
					if (ep.ID == methodName) {
						dfd.resolve([serviceName, methodName, ep]);
					}
				});
			});
		return dfd.promise;
	}



	return service;
}
