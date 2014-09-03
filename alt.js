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




    angular.module("myapp", [])
        .controller("MyController", function($scope, $http) {
            $scope.myData = {};
            $scope.myData.doClick = function(item, event) {
                var responsePromise;

                var token_request  = angular.copy(unscoped_token_request_body)
                //jQuery.extend(true, {}, unscoped_token_request_body);

                token_request.auth.identity.methods.push("kerberos")
                token_request.auth.identity['kerberos'] = {}

                if (OFFLINE){
                    responsePromise = $http.get("sampledata/token.json");
                }else{
                    responsePromise = $http.post(BASE_URL + "/auth/tokens", token_request);
                }

                responsePromise.success(function(data, status, headers, config) {
                    $scope.myData.fromServer = data.token.user.name;
                });
                responsePromise.error(function(data, status, headers, config) {
                    alert("AJAX failed!");
                });
            }


        } );
