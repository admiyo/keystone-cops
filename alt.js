//Alternative to JQuery


OFFLINE=false;
BASE_URL="https://ayoungf20packstack.cloudlab.freeipa.org/keystone/krb/v3"

var unscoped_token_request_body =
    {
        "auth": {
            "identity": {
                "methods": [],
            },
        }
    };
var password_method_data =
    {
        "user": {
            "domain": {
                "name": ""
            },
            "name": "",
            "password": ""
        }
    };
var token_method_data =
    {
        "id": ""
    };
var project_scoped_section =
    {
        "project": {
            "domain": {
                "name": "Default"
            },
            "name": ""
        }
    };

    angular.module("angular_keystone", [])
        .controller("TokenController", function($scope, $http) {
            $scope.online = true;
            $scope.auth_method = "kerberos";
            $scope.user_domain_name = "Default";

            $scope.myData = {};
            $scope.myData.get_token = function(item, event) {
                var response_promise;
                var token_request  = angular.copy(unscoped_token_request_body)


                switch($scope.auth_method){
                    case "kerberos":
                    token_request.auth.identity.methods.push("kerberos")
                    token_request.auth.identity['kerberos'] = {}
                    break;
                    case "token":
                    token_request.auth.identity.methods.push("token")
                    token_request.auth.identity['token'] =
                        angular.copy(token_method_data)
                    token_request.auth.identity.token.id = $scope.token_id
                    break;
                    case  "password":
                    token_request.auth.identity.methods.push("password")
                    token_request.auth.identity['password'] =
                        angular.copy(password_method_data)

                    token_request.auth.identity.password.user.domain.name = 
                        $scope.user_domain_name
                    token_request.auth.identity.password.user.name = $scope.user_name
                    token_request.auth.identity.password.user.password = $scope.password
                    break;
                }

                if ($scope.online){
                    response_promise = $http.post(BASE_URL + "/auth/tokens", token_request);
                }else{
                    response_promise = $http.get("sampledata/token.json");
                }

                response_promise.success(function(data, status, headers, config) {
                    $scope.token_id = headers('X-Subject-Token');
                    $scope.user = data.token.user;
                });
                response_promise.error(function(data, status, headers, config) {
                    alert("AJAX failed!");
                });
            }

            $scope.myData.clear_token = function(item, event) {
                    $scope.user = {};
                    $scope.token_id = null;
            }



        } );
