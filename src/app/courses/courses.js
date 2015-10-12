angular.module( 'orderCloud' )

	.config( CoursesConfig )
	.controller( 'CoursesCtrl', CoursesController )
	.controller( 'CourseCtrl', CourseController )
	.controller( 'ClassCtrl', ClassController )
	.controller( 'ClassEditCtrl', ClassEditController)
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
				ClassesList: function($q, $stateParams, Classes) {
					return Classes.List($stateParams.courseid);
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
				SelectedClass: function(Classes, $stateParams) {
					return Classes.Get($stateParams.courseid, $stateParams.classid);
				}
			}
		})
		.state( 'base.course.edit', {
			url: '/:classid/edit',
			templateUrl:'courses/templates/class.edit.tpl.html',
			controller: 'ClassEditCtrl',
			controllerAs: 'class',
			data: {limitAccess:true},
			resolve: {
				EditClass: function(Classes, $stateParams) {
					return Classes.Get($stateParams.courseid, $stateParams.classid, {Administrator: true});
				}
			}
		}
	)
}
function ClassEditController (EditClass, ClassSvc, Classes, $stateParams, Underscore) {
	var vm = this;
	vm.current = EditClass;
	vm.docs = {};

	vm.updateClass = updateClass;
	vm.setMaxLines = setMaxLines;
	vm.selectScript = activeScriptFn;
	vm.removeAssertion = removeAssertion;
	vm.removeDependency = removeDependency;
	vm.removeMethod = removeMethod;
	vm.removeScript = removeScript;
	vm.addAssertion = addAssertion;
	vm.addDependency = addDependency;
	vm.addMethod = addMethod;
	vm.addScript = addScript;
	function setMaxLines(editor) {
		editor.setOptions({
			maxLines:100
		});
	}


	function updateClass() {
		Classes.Update($stateParams.courseid, $stateParams.classid, vm.current)
			.then(function(data) {
				vm.confirmSave = false;
				vm.classUpdated = true;
			}, function(error) {
				console.log(error);
			})
	}

	function activeScriptFn(scriptName) {
		vm.ActiveScript = Underscore.where(vm.current.ScriptModels.Scripts, {Name: scriptName})[0].Name;
		vm.ActiveScriptName = Underscore.where(vm.current.ScriptModels.Scripts, {Name: scriptName})[0].Name;

		vm.scriptIndex = Underscore.findIndex(vm.current.ScriptModels.Scripts, {Name: scriptName});
	}

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
			})
	});

	function removeAssertion(assertion) {
		var assIndex = Underscore.indexOf(vm.current.Assert, {Method: assertion.Method});
		vm.current.Assert.splice(assIndex, 1);
	}
	function removeDependency(dep) {
		vm.current.Dependencies.splice(vm.current.Dependencies.indexOf(dep), 1);
	}
	function removeMethod(method) {
		vm.current.ClassMethods.splice(vm.current.ClassMethods.indexOf(method), 1);
	}
	function removeScript(script) {
		var scriptIndex = Underscore.indexOf(vm.current.ScriptModels.Scripts, {Name: script.Name});
		vm.current.ScriptModels.Scripts.splice(scriptIndex, 1);
	}
	function addAssertion() {
		vm.current.Assert.push(
			{
				Method: "Method_" + Math.floor(10000 * Math.random()),
				Amount: 0
			}
		)
	}
	function addDependency() {
		vm.current.Dependencies.push("Dependency_" + Math.floor(10000 * Math.random()))
	}
	function addMethod() {
		vm.current.ClassMethods.push("Method_" + Math.floor(10000 * Math.random()));
	}
	function addScript() {
		vm.current.ScriptModels.Scripts.push(
			{
				"Name": "Name_" + Math.floor(10000 * Math.random()),
				"Description": "Description",
				"Model": "\n//create new script",
				"Disable": false,
				"ListOrder": vm.current.ScriptModels.Scripts.length + 1,
				"ExecuteOrder": null,
				"NextOnSuccess": true
			}
		);
	}

}

function CoursesController( CoursesList ) {
	var vm = this;
	vm.list = CoursesList;
}

function CourseController( SelectedCourse, ClassesList, $location, $anchorScroll, $scope) {
	var vm = this;
	vm.current = SelectedCourse;
	vm.classes = ClassesList;
}

function ClassController( $scope, $state, $injector, Underscore, ClassSvc, Courses, SelectedCourse, SelectedClass, Context, Me, $filter, $sce ) {
	var vm = this;
	vm.current = SelectedClass;
	vm.alert = {};
	vm.context = {};
	vm.Responses = [];
	vm.classComplete = false;

	vm.setMaxLines = setMaxLines;
	vm.activeScriptFn = activeScriptFn;
	vm.SelectResponse = SelectResponse;
	vm.nextClass = nextClass;
	vm.Execute = Execute;
	vm.context.setContext = setContext;
	vm.context.clearContext = clearContext;
	vm.renderHtml = renderHtml;


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

	if (SelectedClass.Interactive) {
		$scope.$on('event:requestSuccess', function() {
			if (vm.turnOnLog) {
				vm.openRequestCount += 1;
			}
		});

		$scope.$on('event:responseSuccess', function(event, c) {
			if (vm.turnOnLog) {
				if (c.config.url.indexOf('docs/') == -1) {
					var response = angular.copy(c);
					response.data = $filter('json')(response.data);
					vm.Responses.push(response);
					vm.SelectedResponse = response;
					addMethodCount(response);
				}
				vm.openRequestCount -= 1;

			}
		});
		$scope.$on('event:responseError', function(event, c) {
			if (vm.turnOnLog) {
				if (c.config.url.indexOf('docs/') == -1) {
					var response = angular.copy(c);
					response.data = $filter('json')(response.data);
					vm.Responses.push(response);
					vm.SelectedResponse = response;
				}
				vm.openRequestCount -= 1;
			}
		});
	}

	if (vm.current.Interactive) {
		if (vm.current.ScriptModels.Scripts.length > 1) {
			vm.activeScriptFn(Underscore.where(vm.current.ScriptModels.Scripts, {ListOrder: 1})[0].Title);
			vm.ActiveScriptName = Underscore.where(vm.current.ScriptModels.Scripts, {ListOrder: 1})[0].Name;
		} else {
			vm.activeScriptFn(vm.current.ScriptModels.Scripts[0].Title);
			vm.ActiveScriptName = vm.current.ScriptModels.Scripts[0].Name;
		}
	}

	/*$scope.$watch(function() {
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
	});*/

	function renderHtml(html) {
		return $sce.trustAsHtml(html);
	}

	function setMaxLines(editor) {
		editor.setOptions({
			maxLines:100
		});
	}
	function SelectResponse(response) {
		vm.SelectedResponse = response;
	}

	function activeScriptFn(scriptTitle) {
		vm.current.ActiveScript = Underscore.where(vm.current.ScriptModels.Scripts, {Title: scriptTitle})[0].Title;
		vm.showScriptSelector = false;
		vm.current.ActiveScriptName = Underscore.where(vm.current.ScriptModels.Scripts, {Title: scriptTitle})[0].Name;
	}

	function nextClass() {
		if (nextClassID) {
			console.log(nextClassID);
			$state.go('.', {classid: nextClassID})
		} else if(nextCourseID) {
			console.log(nextCourseID);
			$state.go('^', {courseid: nextCourseID})
		} else {
			$state.go('base.courses');
		}
	}

	function Execute() {
		vm.turnOnLog = true;
		vm.goalsCollapse = false;
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

	}

	function setContext() {
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
	}

	function clearContext() {
		Context.clearContext();
		vm.contextSet = false;
		vm.context.User = null;
	}

	function findNextCourseID() {
		Courses.List().then(function(data) {
			var currentCourseIndex = data.indexOf(Underscore.where(data, {ID:SelectedCourse.ID})[0]);
			if (currentCourseIndex < data.length) {
				nextCourseID = data[currentCourseIndex + 1].ID;
			}
		})
	}

	function checkAssertions() {
		var pass = true;
		angular.forEach(vm.current.Assert, function(assertion) {
			if (!assertion.Successes || assertion.Successes < assertion.AmountNeeded) {
				pass = false;
			}
		});
		vm.classComplete = pass;
	}

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
						if (Underscore.difference(docEpSplit, newEpSplit).length == 0 && Underscore.difference(newEpSplit, docEpSplit).length == 0) {
							console.log('hello');
							angular.forEach(vm.current.Assert, function(assertion) {
								if (svcKey + '.' + mtdKey == assertion.Method) {
									if (assertion.Successes) {
										assertion.Successes += 1;
									}
									else {
										assertion.Successes = 1;
									}
									checkAssertions();
								}
							})
						}
					}


				}
			})
		})

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


