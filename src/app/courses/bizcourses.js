angular.module( 'orderCloud' )

    .config(BizCoursesConfig)
    .controller( 'BizCourseEditCtrl', BizCourseEditController)
    .controller( 'BizCoursesCtrl', BizCoursesController)
    .controller( 'BizCourseCtrl', BizCourseController)
    .controller( 'BizCourseAdminCtrl', BizCourseAdminController )

;

function BizCoursesConfig( $stateProvider ) {

    $stateProvider

        .state( 'base.bizcourses', {
            url: '/courses/business',
            templateUrl:'courses/templates/bizcourses.tpl.html',
            controller:'BizCoursesCtrl',
            controllerAs: 'courses',
            //data: {limitAccess:true},
            resolve: {
                CoursesList: function(CourseSvc) {
                    return CourseSvc.listCourses('business');
                }
            }
        })
        .state( 'base.bizcourses.admin', {
            url: '/admin',
            templateUrl:'courses/templates/bizcourse.admin.tpl.html',
            controller:'BizCourseAdminCtrl',
            controllerAs: 'course'
            //data: {limitAccess:true},
        })
        .state( 'base.bizcourses.course', {
            url: '/course/:courseid',
            templateUrl:'courses/templates/bizcourse.tpl.html',
            controller:'BizCourseCtrl',
            controllerAs: 'course',
            //data: {limitAccess:true},
            resolve: {
                SelectedCourse: function($stateParams, CourseSvc) {
                    return CourseSvc.getCourse($stateParams.courseid, 'business');
                },
                ClassList: function($stateParams, ClassSvc) {
                    return ClassSvc.listClasses($stateParams.courseid);
                }
            }
        })
        .state( 'base.bizcourses.edit', {
            url: '/:courseid/edit',
            templateUrl:'courses/templates/bizcourse.edit.tpl.html',
            controller: 'BizCourseEditCtrl',
            controllerAs: 'course',
            //data: {limitAccess:true},
            resolve: {
                SelectedCourse: function($stateParams, CourseSvc) {
                    return CourseSvc.getCourse($stateParams.courseid, 'business');
                },
                ClassList: function($stateParams, ClassSvc) {
                    return ClassSvc.listClasses($stateParams.courseid);
                }
            }
        })
}


function BizCoursesController(CoursesList) {
    var vm = this;
    vm.list = CoursesList;
}

function BizCourseAdminController(CoursesList) {
    var vm = this;
    vm.coursesList = CoursesList;

    vm.filterCourseList = function(obj) {
        if (vm.courseFilter == 'all') {
            return true;
        } else if (vm.courseFilter == 'hidden') {
            return obj.Hide == true;
        } else {
            return obj.Hide == false;
        }

    }
}


function BizCourseController(SelectedCourse, ClassList) {
    var vm = this;
    vm.classList = ClassList;
    vm.course = SelectedCourse;
    vm.selectClass = selectClass;

    vm.selectedClass = vm.classList[0];

    function selectClass(_class) {
        vm.selectedClass = _class;
    }
}

function BizCourseEditController($scope, $stateParams, SelectedCourse, ClassList, Classes, Courses, ClassSvc, CourseSvc, Underscore) {
    var vm = this;
    vm.classList = ClassList;
    vm.course = SelectedCourse;

    vm.changeClassOrder = changeClassOrder;
    vm.addNewClass = addNewClass;
    vm.saveCourse = saveCourse;
    vm.saveAllClasses = saveAllClasses;
    vm.saveClass = saveClass;

    vm.selectedClass = vm.classList[0];
    vm.pickClass = vm.selectedClass.Name;
    vm.newClass = {};

    $scope.$watch(function() {
        return vm.pickClass;
    }, function(newVal, oldVal) {
        vm.selectedClass = Underscore.where(vm.classList, {Name: newVal})[0];
        indexSelected();
    });

    function indexSelected () {
        vm.indexSelected = Underscore.findIndex(vm.classList, {Name: vm.selectedClass.Name});
    }
    indexSelected();

    function _changeArrayOrder(array, index, move) {
        if (move == 'up') {
            var val = array[index];
            var otherVal = array[index - 1];
            var left = array.slice(0, index-1);
            var right = array.slice(index+1, array.length - 1);
            return left.concat(val).concat(otherVal).concat(right);
        } else {
            var val = array[index];
            var otherVal = array[index + 1];
            var left = array.slice(0, index);
            var right = array.slice(index+2, array.length);
            return left.concat(otherVal).concat(val).concat(right);
        }
    }

    function changeClassOrder(_class, move) {
        var curListOrder = _class.CourseOrder;
        var otherClassIndex = -1;
        if (move == 'down') {
            otherClassIndex = Underscore.findIndex(vm.classList, {CourseOrder: curListOrder + 1});
            vm.classList[otherClassIndex].CourseOrder -= 1;
            _class.CourseOrder += 1;
            vm.course.Classes = _changeArrayOrder(vm.course.Classes, _class.CourseOrder-2, 'down');
        } else if (move == 'up') {
            otherClassIndex = Underscore.findIndex(vm.classList, {CourseOrder: curListOrder - 1});
            vm.classList[otherClassIndex].CourseOrder += 1;
            _class.CourseOrder -= 1;
            vm.course.Classes = _changeArrayOrder(vm.course.Classes, _class.CourseOrder, 'up');
        }
        Courses.Patch($stateParams.courseid, {Classes: vm.course.Classes});
    }

    function addNewClass() {
        Classes.Create($stateParams.courseid, vm.newClass)
            .then(function() {
                CourseSvc.getCourse($stateParams.courseid, 'business')
                    .then(function(data) {
                        vm.course = data;
                        ClassSvc.getClass($stateParams.courseid, vm.course.Classes[vm.course.Classes.length -1])
                            .then(function(data) {
                                vm.classList.push(data);
                            });
                    });
                vm.showAddClass = false;
            })
    }

    function saveClass() {
        Classes.Update($stateParams.courseid, vm.classList[vm.indexSelected].ID, vm.classList[vm.indexSelected]);
    }

    function saveAllClasses() {
        vm.classList.forEach(function(each) {
            Classes.Update($stateParams.courseid, each.ID, each);
        })
    }

    function saveCourse() {
        Courses.Update($stateParams.courseid, vm.course)
    }

}