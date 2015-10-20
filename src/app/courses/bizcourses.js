angular.module( 'orderCloud' )

    .config(BizCoursesConfig)
    .controller( 'BizCourseEditCtrl', BizCourseEditController)
    .controller( 'BizCoursesCtrl', BizCoursesController)
    .controller( 'BizCourseCtrl', BizCourseController)

;

function BizCoursesConfig( $stateProvider ) {

    $stateProvider

        .state( 'base.bizcourses', {
            url: '/courses/business',
            templateUrl:'courses/templates/bizcourses.tpl.html',
            controller:'BizCoursesCtrl',
            controllerAs: 'courses',
            data: {limitAccess:true},
            resolve: {
                CoursesList: function(Courses) {
                    return Courses.List('business');
                }
            }
        })
        .state( 'base.bizcourses.course', {
            url: '/:courseid',
            templateUrl:'courses/templates/bizcourse.tpl.html',
            controller:'BizCourseCtrl',
            controllerAs: 'course',
            data: {limitAccess:true},
            resolve: {
                SelectedCourse: function($stateParams, Courses) {
                    return Courses.Get($stateParams.courseid, 'business');
                },
                ClassList: function($stateParams, Classes) {
                    return Classes.List($stateParams.courseid);
                }
            }
        })
        .state( 'base.bizcourses.edit', {
            url: '/:courseid/edit',
            templateUrl:'courses/templates/bizcourse.edit.tpl.html',
            controller: 'BizCourseEditCtrl',
            controllerAs: 'course',
            data: {limitAccess:true},
            resolve: {
                SelectedCourse: function($stateParams, Courses) {
                    return Courses.Get($stateParams.courseid, 'business');
                },
                ClassList: function($stateParams, Classes) {
                    return Classes.List($stateParams.courseid);
                }
            }
        })
}


function BizCoursesController(CoursesList) {
    var vm = this;
    vm.list = CoursesList;
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

function BizCourseEditController($scope, SelectedCourse, ClassList, Underscore) {
    var vm = this;
    vm.classList = ClassList;
    vm.course = SelectedCourse;
    vm.selectClass = selectClass;

    vm.selectedClass = vm.classList[0];
    vm.pickClass = vm.selectedClass.Name;

    $scope.$watch(function() {
        return vm.pickClass;
    }, function(newVal, oldVal) {
        console.log(newVal);
    });

    function indexSelected () {
        vm.indexSelected = Underscore.findIndex(vm.classList, {Name: vm.selectedClass.Name});
    }
    indexSelected();

    function selectClass(_class) {
        vm.selectedClass = _class;
        indexSelected();
    }
}