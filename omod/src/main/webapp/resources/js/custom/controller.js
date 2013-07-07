function CreateConsultationCtrl($scope, $location, $person, $notification) {
    // initialize the page
    $scope.mode = "compose";

    $person.getAllPerson().
        then(function (response) {
            $scope.persons = response.data;
        });
    $person.getAuthenticatedPerson().
        then(function (response) {
            $scope.sender = response.data.name;
        });

    // actions
    $scope.send = function (compose) {
        // send action
        var recipient = compose.recipient.uuid;
        $notification.sendNotification(recipient, compose.subject, compose.payload).
            then(function () {
                $location.path('/consults/true');
            });
    }

    $scope.cancel = function () {
        $location.path('/consults/true');
    };
}

function EditConsultationCtrl($scope, $location, $routeParams, $person, $notification) {
    // initialize the page
    $scope.mode = "view";

    // page parameter
    $scope.uuid = $routeParams.uuid;
    // get the current notification
    $notification.getNotificationByUuid($scope.uuid).
        then(function (response) {
            $scope.notification = response.data;
        });

    // actions
    $scope.reply = function () {
        $scope.mode = "reply";
        // pull sender and recipient information from the notification
        var notification = $scope.notification;
        // we're replying an incoming notification
        $scope.recipient = notification.sender.name;
        $scope.sender = notification.recipient.name;
        if ($scope.outgoing) {
            // we're replying an outgoing notification
            $scope.sender = notification.sender.name;
            $scope.recipient = notification.recipient.name;
        }
        $scope.subject = "Re: " + notification.subject;

    };

    $scope.send = function (subject, payload) {
        // save action
        var recipient = $scope.notification.recipient.uuid;
        if ($scope.outgoing) {
            recipient = $scope.notification.sender.uuid;
        }

        $notification.sendNotification(recipient, subject, payload).
            then(function () {
                $location.path('/consults/true');
            });
    };

    $scope.cancel = function () {
        $location.path('/consults/true');
    };
}

function ListConsultationsCtrl($scope, $routeParams, $person, $notifications) {
    $scope.maxSize = 5;
    $scope.pageSize = 5;
    $scope.currentPage = 1;
    $scope.outgoing = $routeParams.outgoing;
    $person.getAuthenticatedPerson().
        then(function (response) {
            $scope.person = response.data;
            return $scope.person;
        }).
        then(function (person) {
            $notifications.getNotifications(person.uuid, $scope.outgoing,
                    $scope.search, $scope.currentPage, $scope.pageSize).
                then(function (response) {
                    var serverData = response.data;
                    $scope.notifications = serverData.objects;
                    $scope.noOfPages = serverData.pages;
                });
        });

    $scope.$watch('currentPage', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $notifications.getNotifications($scope.person.uuid, $scope.outgoing,
                    $scope.search, $scope.currentPage, $scope.pageSize).
                then(function (response) {
                    var serverData = response.data;
                    $scope.notifications = serverData.objects;
                    $scope.noOfPages = serverData.pages;
                });
        }
    }, true);

    $scope.$watch('search', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.currentPage = 1;
            $notifications.getNotifications($scope.person.uuid, $scope.outgoing,
                    $scope.search, $scope.currentPage, $scope.pageSize).
                then(function (response) {
                    var serverData = response.data;
                    $scope.notifications = serverData.objects;
                    $scope.noOfPages = serverData.pages;
                });
        }
    }, true);
}