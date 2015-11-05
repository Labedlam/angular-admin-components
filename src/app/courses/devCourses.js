angular.module( 'orderCloud' )

	.config( CoursesConfig )
	.controller( 'DevCoursesCtrl', DevCoursesController )
	.controller( 'DevCourseCtrl', DevCourseController )
	.controller( 'DevCoursesAdminCtrl', DevCoursesAdminController )
	.controller( 'DevClassCtrl', DevClassController )
	.controller( 'DevClassEditCtrl', DevClassEditController)
	.controller( 'LearningCtrl', LearningController)
	.factory( 'ClassSvc', ClassService )
	.factory( 'CourseSvc', CourseService )
	.factory( 'DcUserSvc', DcUserService )

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
		.state( 'base.learning', {
			url: '/learning',
			templateUrl:'courses/templates/learning.tpl.html',
			controller:'LearningCtrl',
			controllerAs: 'learning'
		})
		.state( 'base.devcourses', {
			url: '/courses/developer',
			templateUrl:'courses/templates/devcourses.tpl.html',
			controller:'DevCoursesCtrl',
			controllerAs: 'courses',
			resolve: {
				CoursesList: function(CourseSvc) {
					return CourseSvc.listCourses('developer');
				}
			}
		})
		.state( 'base.devcourses.admin', {
			url: '/admin',
			templateUrl:'courses/templates/devcourses.admin.tpl.html',
			controller:'DevCoursesAdminCtrl',
			controllerAs: 'admin',
			resolve: {
				AdminCoursesList: function(CourseSvc) {
					return CourseSvc.listCourses('developer', true);
				}
			}
		})
		.state( 'base.devcourses.course', {
			url: '/course/:courseid',
			templateUrl:'courses/templates/devcourse.tpl.html',
			controller:'DevCourseCtrl',
			controllerAs: 'course',
			//data: {limitAccess:true},
			resolve: {
				SelectedCourse: function($stateParams, CourseSvc) {
					return CourseSvc.getCourse($stateParams.courseid, 'developer');
				},
				ClassesList: function($q, $stateParams, ClassSvc) {
					return ClassSvc.listClasses($stateParams.courseid, {Name: 1, Description: 1, ID: 1, Active: 1});
				}
			}
		})
		.state( 'base.devcourses.course.class', {
			url: '/:classid',
			templateUrl:'courses/templates/devclass.tpl.html',
			controller:'DevClassCtrl',
			controllerAs: 'class',
			//data: {limitAccess:true},
			resolve: {
				SelectedClass: function(ClassSvc, $stateParams) {
					console.log($stateParams);
					return ClassSvc.getClass($stateParams.courseid, $stateParams.classid);
				},
				OcVars: function (DcUserSvc) {
					return DcUserSvc.getOcVars();
				},
				ContextOptions: function(DevCenter, Underscore) {
					return DevCenter.Me.GetAccess(1, 100)
						.then(function(data) {
							return Underscore.filter(data.Items, {Accepted: true});
						});
				}
			}
		})
		.state( 'base.devcourses.course.edit', {
			url: '/:classid/edit',
			templateUrl:'courses/templates/devclass.edit.tpl.html',
			controller: 'DevClassEditCtrl',
			controllerAs: 'class',
			data: {limitAccess:true},
			resolve: {
				EditClass: function(ClassSvc, $stateParams) {
					return ClassSvc.getClass($stateParams.courseid, $stateParams.classid, {Administrator: true});
				}
			}
		})

}

function LearningController () {

}

function DevClassEditController (EditClass, ClassSvc, Classes, $stateParams, Underscore, BuyerID) {
	var vm = this;
	vm.current = EditClass;
	checkEditMode();
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
	vm.moveScript = moveScript;
	vm.overrideLiveClass = overrideLiveClass;
	vm.enterEditMode = enterEditMode;
	vm.cancelStaging = cancelStaging;
	function setMaxLines(editor) {
		editor.setOptions({
			maxLines:100
		});
	}

	if (!BuyerID.Get()) {
		BuyerID.Set('__NONE_SET__');
	} else {
		vm.buyerID = BuyerID.Get();
		vm.BuyerSet = true;
	}


	function checkEditMode() {
		if (vm.current.EditMode) {
			vm.InStaging = true;
			Classes.GetStaged($stateParams.courseid, $stateParams.classid)
				.then(function(data) {
					vm.current = data;
				})
		}
	}

	function enterEditMode() {
		if (!vm.InStaging) {
			Classes.CopyToStaging($stateParams.courseid, $stateParams.classid)
				.then(function() {
					vm.InStaging = true;

				})
		}
	}

	function cancelStaging() {
		if (vm.InStaging) {
			Classes.CancelStaged($stateParams.courseid, $stateParams.classid)
				.then(function() {
					vm.InStaging = false;

				})
		}
	}

	function overrideLiveClass() {
		if (vm.InStaging) {
			Classes.OverrideLiveClass($stateParams.courseid, $stateParams.classid)
				.then(function() {
					vm.InStaging = false;
					vm.areYouSure = false;
				})
		}
	}


	function updateClass() {
		if (vm.InStaging) {
			Classes.UpdateStaged($stateParams.courseid, $stateParams.classid, vm.current)
				.then(function() {
					vm.confirmSave = false;
					vm.classUpdated = true;
				}, function(error) {
					console.log(error);
				})
		} else {
			Classes.Update($stateParams.courseid, $stateParams.classid, vm.current)
				.then(function() {
					vm.confirmSave = false;
					vm.classUpdated = true;
				}, function(error) {
					console.log(error);
				})
		}

	}

	function moveScript(direction, listOrder) {
		console.log(listOrder);
		var curScriptIndex = Underscore.findIndex(vm.current.ScriptModels.Scripts, {ListOrder: listOrder});
		var upScriptIndex = Underscore.findIndex(vm.current.ScriptModels.Scripts, {ListOrder: listOrder - 1});
		var downScriptIndex = Underscore.findIndex(vm.current.ScriptModels.Scripts, {ListOrder: listOrder + 1});

		console.log(curScriptIndex);

		if (direction == 'up') {
			vm.current.ScriptModels.Scripts[curScriptIndex].ListOrder -= 1;
			vm.current.ScriptModels.Scripts[upScriptIndex].ListOrder += 1;
		} else {
			vm.current.ScriptModels.Scripts[curScriptIndex].ListOrder += 1;
			vm.current.ScriptModels.Scripts[downScriptIndex].ListOrder -= 1;
		}
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

function DevCoursesController( CoursesList, DcUsers ) {
	var vm = this;
	vm.list = CoursesList;

	vm.list.forEach(function(each) {
		DcUsers.GetCourseProgress(each.ID)
			.then(function(data) {
				each.CourseProgress = data.toJSON();
			})
	})
}

function DevCourseController( SelectedCourse, ClassesList, DcUsers) {
	var vm = this;
	vm.current = SelectedCourse;
	vm.classes = ClassesList;

	DcUsers.GetCourseProgress(vm.current.ID)
		.then(function(data) {
			vm.CompletedClasses = data.CompletedClasses;
		})
}

function DevClassController( $scope, $state, $injector, Auth, Underscore,
							 ClassSvc, Courses, SelectedCourse, SelectedClass, OcVars,
							 ContextOptions, DcUsers, DevCenter, Me, BuyerID, $filter,
							 $sce, $localForage, $cookies, $timeout ){
	var vm = this;
	vm.current = SelectedClass;
	vm.contextOptions = ContextOptions;
	vm.user = {};
	vm.user.savedVars = OcVars;
	vm.alert = {};
	vm.Responses = [];
	vm.classComplete = false;

	vm.setMaxLines = setMaxLines;
	vm.activeScriptFn = activeScriptFn;
	vm.SelectResponse = SelectResponse;
	vm.nextClass = nextClass;
	vm.Execute = Execute;
	vm.setContext = setContext;
	vm.clearContext = clearContext;
	vm.renderHtml = renderHtml;
	vm.removeExistingVar = removeExistingVar;
	vm.editExistingVar = editExistingVar;
	vm.saveNewVar = saveNewVar;

	if (!BuyerID.Get()) {
		BuyerID.Set('__NONE_SET__');
	} else {
		vm.buyerID = BuyerID.Get();
		vm.BuyerSet = true;
	}

	$localForage.getItem('context-user')
		.then(function(data) {
			if (data) {
				vm.context = data;
				vm.ContextName = data.CompanyName;
			}
		});


	vm.openRequestCount = 0;
	vm.docs = {};
	vm.classIndex = SelectedCourse.Classes.indexOf(vm.current.ID);
	vm.totalClasses = SelectedCourse.Classes.length;
	var nextClassID = (vm.classIndex + 1 < vm.totalClasses) ? SelectedCourse.Classes[vm.classIndex + 1] : null;
	var nextCourseID;
	if (!nextClassID) findNextCourseID();
	Me.Get()
		.then(function(data) {
			vm.contextUser = data;
		}, function() {
			vm.contextUser = null;
		});

	function stringReplace() {
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
			angular.forEach(vm.user.savedVars, function(ocVar) {
				script.Model = script.Model.replace('{' + ocVar.key + '}', ocVar.val)
			})
		});
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
				stringReplace();
			})
	});

	if (SelectedClass.Interactive) {
		$scope.$on('event:requestSuccess', function(event, c) {
			if (vm.turnOnLog) {
				vm.openRequestCount += 1;
			}
		});

		$scope.$on('event:responseSuccess', function(event, c) {
			if (vm.turnOnLog) {
				if (c.config.url.indexOf('docs/') == -1 && c.config.url.indexOf('heroku') == -1) {
					var response = angular.copy(c);
					response.data = $filter('json')(response.data);
					vm.Responses.push(response);
					vm.SelectedResponse = response;
					addMethodCount(response);
					checkIfObjectCreated();
				}
				vm.openRequestCount -= 1;

			}
		});
		$scope.$on('event:responseError', function(event, c) {
			if (vm.turnOnLog) {
				if (c.config.url.indexOf('docs/') == -1 && c.config.url.indexOf('heroku') == -1) {
					var response = angular.copy(c);
					console.log(c);
					if (c.config.url.indexOf('__NONE_SET__') > -1) {
						vm.BuyerSet = false;
					}
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

	$scope.$watch(function() {
		return vm.ContextName;
	}, function(newVal) {
		if (!newVal) {
			return
		} else {
			vm.context = Underscore.where(vm.contextOptions, {CompanyName: newVal})[0];
		}
	});

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
		DcUsers.SaveClassProgress(vm.current.ID);
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
			vm.stringExecute = fullScript;
			var ex = new Function("injector", injectString + fullScript);
			ex($injector);
			console.log('hit');
		} else {
			vm.consoleMessage = 'script is not executable';
		}

	}

	function checkIfObjectCreated() {
		if (vm.stringExecute.indexOf('.Create') > -1) {
			console.log('hit internal check');
			var name = parseDependency(vm.stringExecute) + 'ID';
			var val = parseIdValue(vm.stringExecute);
			DcUsers.SaveOcVar({
				key: name,
				val: val
			}).then(function() {
				DcUsers.GetOcVars()
					.then(function(data) {
						vm.user.savedVars = data;
					})
			})
		}
		console.log('hit check');
	}

	function parseDependency(string) {
		var end = string.indexOf('.Create');
		var newString = string.slice(0, end);
		var splitUp  = newString.split("\n");
		console.log(splitUp);
		console.log(splitUp.length);
		return splitUp[splitUp.length - 1].slice(splitUp[splitUp.length -1] -1, -1);
	}
	function parseIdValue(string) {
		var start = string.indexOf("ID:") + 2;
		var newString = string.slice(start);
		var splitUp = newString.split("\n");
		var splitFinal = splitUp[0].split('"');
		return splitFinal[1];

	}

	function setContext() {
		DevCenter.AccessToken(vm.context.ID)
			.then(function(data) {
				$localForage.setItem('context-user', vm.context);
				Auth.SetToken(data['access_token']);
				vm.contextSet = true;
				Me.Get()
					.then(function(data) {
						vm.contextUser = data;
					}, function(reason) {
						console.log(reason);
					});
				if (vm.buyerID) {
					BuyerID.Set(vm.buyerID);
					vm.BuyerSet = true;
				}
				vm.confirmContextSet = true;
				$timeout(function() {
					vm.confirmContextSet = false;
				}, 2000)
			}, function(reason) {
				vm.contextError = true;
				vm.contextErrorMsg = reason;
			});


	}
	function clearContext() {
		vm.contextSet = false;
		Auth.RemoveToken();
		$localForage.removeItem('context-user');
		vm.contextUser = null;
		vm.context = null;
		vm.ContextName = "";
		$cookies.remove('DevCenter.buyerID');
		vm.buyerID = "";
	}
	function findNextCourseID() {
		Courses.List('developer').then(function(data) {
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
		if (pass) {
			DcUsers.SaveClassProgress(vm.current.ID);
		}
		vm.classComplete = pass;
	}
	function addMethodCount(response) { //Saves count of method calls based on endpoint
		var endpoint = response.config.url.slice(response.config.url.indexOf('.io')+4);
		//var endpoint = response.config.url.slice(response.config.url.indexOf('9002')+5);
		var method = response.config.method;
		var epSplit = endpoint.split('/');
		console.log(response);
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
						console.log(docEpSplit, newEpSplit);
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
	function saveNewVar(newVar) {
		DcUsers.SaveOcVar(newVar)
			.then(function(data) {
				DcUsers.GetOcVars()
					.then(function(vars) {
						vm.user.savedVars = vars;
						vm.user.newVar = {};
						vm.viewVarAdd = false;
						stringReplace();
					}, function(err) {
						console.log(err);
					})
			}, function(err) {
				console.log(err);
			})
	}
	function removeExistingVar(varHash) {
		DcUsers.DeleteOcVar({hash: varHash})
			.then(function() {
				DcUsers.GetOcVars()
					.then(function(vars) {
						vm.user.savedVars = vars;
						stringReplace();
					}, function(err) {
						console.log(err);
					})
			}, function(err) {
				console.log(err);
			})
	}
	function editExistingVar(varHash, existingVar) {
		DcUsers.PatchOcVar({hash: varHash}, existingVar)
			.then(function() {
				DcUsers.GetOcVars()
					.then(function(vars) {
						vm.user.savedVars = vars;
						stringReplace();
					}, function(err) {
						console.log(err);
					})
			}, function(err) {
				console.log(err);
			})
	}

	vm.contextPopoverTemplate = 'courses/templates/context.popover.tpl.html';
	vm.contextDropupOpen = false;
	vm.contextDropupToggle = function(open) {
		vm.contextDropupOpen = open;
	};

}

function DevCoursesAdminController(AdminCoursesList, Underscore, $scope, $cookies, Courses, Classes) {
	var vm = this;
	vm.coursesList = AdminCoursesList;
	for (var i = 0; i < vm.coursesList.length; i++) {
		vm.coursesList[i] = vm.coursesList[i].toJSON();
		delete vm.coursesList[i]["CourseProgress"];
		console.log(vm.coursesList[i]);
	}
	vm.changeCourseOrder = changeCourseOrder;
	vm.filterCourseList = filterCourseList;
	vm.changeClassOrder = changeClassOrder;
	vm.deleteClass = deleteClass;
	vm.saveCourse = saveCourse;
	vm.createClass=  createClass;
	vm.createCourse = createCourse;

	vm.editSelected = $cookies.get('course_focus') || null;

	$scope.$watch(function() {
		return vm.editSelected;
	}, function(newVal, oldVal) {
		if (!newVal) {
			return
		} else {
			$cookies.put('course_focus', newVal);
			vm.selectedCourseIndex = Underscore.findIndex(vm.coursesList, {Name: newVal});
		}
	});

	function filterCourseList(obj) {
		if (vm.courseFilter == 'all') {
			return true;
		} else if (vm.courseFilter == 'hidden') {
			return obj.AdminHide == true;
		} else {
			return obj.AdminHide == false;
		}

	}

	function changeCourseOrder(direction, listOrder) {
		var curScriptIndex = Underscore.findIndex(vm.coursesList, {ListOrder: listOrder});
		var upScriptIndex = Underscore.findIndex(vm.coursesList, {ListOrder: listOrder - 1});
		var downScriptIndex = Underscore.findIndex(vm.coursesList, {ListOrder: listOrder + 1});


		if (direction == 'up') {
			vm.coursesList[curScriptIndex].ListOrder -= 1;
			vm.coursesList[upScriptIndex].ListOrder += 1;
			Courses.Patch(vm.coursesList[curScriptIndex].ID, {ListOrder: vm.coursesList[curScriptIndex].ListOrder});
			Courses.Patch(vm.coursesList[upScriptIndex].ID, {ListOrder: vm.coursesList[upScriptIndex].ListOrder});
		} else {
			vm.coursesList[curScriptIndex].ListOrder += 1;
			vm.coursesList[downScriptIndex].ListOrder -= 1;
			Courses.Patch(vm.coursesList[curScriptIndex].ID, {ListOrder: vm.coursesList[curScriptIndex].ListOrder});
			Courses.Patch(vm.coursesList[downScriptIndex].ID, {ListOrder: vm.coursesList[downScriptIndex].ListOrder});
		}
	}

	function _changeArrayOrder(array, index, move) {
		if (move == 'up') {
			var val = array[index];
			var otherVal = array[index - 1];
			var left = array.slice(0, index-1);
			var right = array.slice(index+1, array.length);
			return left.concat(val).concat(otherVal).concat(right);
		} else {
			var val = array[index];
			var otherVal = array[index + 1];
			var left = array.slice(0, index);
			var right = array.slice(index+2, array.length);
			return left.concat(otherVal).concat(val).concat(right);
		}
	}

	function changeClassOrder(classid, move) {
		var curListIndex = Underscore.indexOf(vm.coursesList[vm.selectedCourseIndex].Classes, classid);
		if (move == 'down') {
			vm.coursesList[vm.selectedCourseIndex].Classes = _changeArrayOrder(vm.coursesList[vm.selectedCourseIndex].Classes, curListIndex, 'down');
		} else if (move == 'up') {
			vm.coursesList[vm.selectedCourseIndex].Classes = _changeArrayOrder(vm.coursesList[vm.selectedCourseIndex].Classes, curListIndex, 'up');
		}
		Courses.Patch(vm.coursesList[vm.selectedCourseIndex].ID, {Classes: vm.coursesList[vm.selectedCourseIndex].Classes});
	}

	function deleteClass(classid) {
		Classes.Delete(classid)
			.then(function(data) {
				Courses.List('developer', true)
					.then(function(data) {
						vm.coursesList = data;
					})
			})
	}

	function saveCourse(course) {
		//save course
		if (course) {
			Courses.Update(course.ID, course);
		}

	}

	function createClass(classObj) {
		Classes.Create(vm.coursesList[vm.selectedCourseIndex].ID, classObj)
			.then(function() {
				Courses.List('developer', true)
					.then(function(data) {
						vm.coursesList = data;
					})
			})
	}

	function createCourse(classObj) {
		classObj.CourseType = 'developer';
		Courses.Create(classObj)
			.then(function() {
				Courses.List('developer', true)
					.then(function(data) {
						vm.coursesList = data;
					})
			});
	}

}


function ClassService($resource, apiurl, $q, Classes) {
	var service = {
		getDocs: _getDocs,
		getClass: _getClass,
		listClasses: _listClasses
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

	function _getClass(courseid, classid) {
		var d = $q.defer();
		Classes.Get(courseid, classid)
			.then(function(data) {
				d.resolve(data);
			})
			.catch(function(error) {
				d.reject(error);
			});
		return d.promise;
	}

	function _listClasses(courseid, showFields) {
		var d = $q.defer();
		Classes.List(courseid, showFields)
			.then(function(data) {
				d.resolve(data);
			}, function(err) {
				d.reject(err);
			});
		return d.promise;
	}



	return service;
}

function CourseService(Courses, $q) {
	var service = {
		getCourse: _getCourse,
		listCourses: _listCourses
	};
	function _getCourse(courseID, courseType) {
		var d= $q.defer();
		Courses.Get(courseID, courseType)
			.then(function(data) {
				d.resolve(data);
			}, function(err) {
				d.reject(err);
			});
		return d.promise;
	}

	function _listCourses(courseType, adminPage) {
		var d = $q.defer();
		//
		Courses.List(courseType, adminPage)
			.then(function(data) {
				d.resolve(data);
			}, function(err) {
				d.reject(err);
			});
		return d.promise;
	}


	return service;
}

function DcUserService(DcUsers, $q) {
	var service = {
		getOcVars: _getOcVars
	};

	function _getOcVars() {
		var d = $q.defer();
		DcUsers.GetOcVars()
			.then(function(data) {
				d.resolve(data);
			}, function(error) {
				d.reject(error);
			});
		return d.promise;
	}



	return service
}


