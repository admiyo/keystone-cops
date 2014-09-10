BASE_URL="/keystone/main/v3"
KERBEROS_URL="/keystone/krb/v3"


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



    angular.module("angular_keystone", ['ui.bootstrap'])
        .controller("TokenController", function($scope, $http) {


            $scope.alerts = [];

            $scope.addAlert = function() {
                $scope.alerts.push({msg: 'Another alert!'});
            };

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };



            $scope.online = (! (/^file/).test(document.URL))

            //If the url starts with file, we do not have a live server
            //to test against, so we use sample data instead.

            $scope.auth_method = "kerberos";
            $scope.user_domain_name = "Default";
            $scope.projects = [];
            $scope.project = null;
            $scope.trusts = [];
            $scope.trust = null;


            $scope.myData = {};
            $scope.myData.get_token = function(item, event) {
                var response_promise;
                var token_request  = angular.copy(unscoped_token_request_body)
                var base_url = BASE_URL

                switch($scope.auth_method){
                    case "kerberos":
                    token_request.auth.identity.methods.push("kerberos")
                    token_request.auth.identity['kerberos'] = {}
                    base_url = KERBEROS_URL

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

                if ($scope.trust){
                    token_request.auth['scope'] = {
                        "OS-TRUST:trust": {
                            "id": $scope.trust.id
                        }
                    }
                } else if ($scope.project){
                    token_request.auth['scope'] =
                        angular.copy(project_scoped_section);
                    token_request.auth.scope.project.name =
                        $scope.project.name;
                }


                if ($scope.online){
                    response_promise = $http.post(base_url + "/auth/tokens", token_request);
                }else{
                    response_promise = $http.get("sampledata/token.json");
                }

                response_promise.success(function(data, status, headers, config) {
                    $scope.token_id = headers('X-Subject-Token');
                    $scope.user = data.token.user;
                    $scope.token = data.token;
                });
                response_promise.error(function(data, status, headers, config) {
                    $scope.alerts.push(
                        {type: 'danger',
                         msg: 'Token Fetch Failed with status ' + status + '.'});

                });
            }

            $scope.myData.clear_token = function(item, event) {
                    $scope.user = {};
                    $scope.token_id = null;
            }



            $scope.myData.create_self_trust = function (item, event){
                var create_trust_request_body = {
                    "trust": {
                        //        "expires_at": ,
                        "impersonation": false,
                        "project_id": $scope.token.project.id,
                        "roles": [],
                        "trustee_user_id": $scope.token.user.id,
                        "trustor_user_id": $scope.token.user.id
                    }
                }


                //this is a hack.  But anything not required is ignored.
                create_trust_request_body.trust.roles =  $scope.token.roles;

                var base_url = BASE_URL

                request_url = base_url + "/OS-TRUST/trusts"

                var config = {
                    headers:  {
                        'X-Auth-Token': $scope.token_id,
                        "Content-Type": "application/json"
                    }
                };

                if ($scope.online){
                    response_promise = $http.post(request_url, create_trust_request_body, config);
                }else{
                    response_promise = $http.get("sampledata/create_trust.json");
                }

                response_promise.success(function(data, status, headers, config) {
                    $scope.alerts.push(
                        {type: 'info',
                         msg: 'Create Trust Succeeded.'});

                });
                response_promise.error(function(data, status, headers, config) {
                    $scope.alerts.push(
                        {type: 'danger',
                         msg: 'Create Trust Failed with status ' + status + '.'});

                });
            }

            $scope.myData.list_trusts = function(item, event) {

                var response_promise;
                var base_url = BASE_URL

                request_url = base_url + "/OS-TRUST/trusts"

                if ($scope.online){
                    response_promise = $http({
                        method: "GET",
                        url:request_url,
                        headers:  {
                            'X-Auth-Token': $scope.token_id,
                            "Content-Type": "application/json"
                        },
                        params: {
                            trustor_user_id: $scope.user.id
                        }
                    });
                }else{
                    response_promise = $http.get("sampledata/list_trusts.json");
                }

                response_promise.success(function(data, status, headers, config) {
                    $scope.trusts = data.trusts;
                });
                response_promise.error(function(data, status, headers, config) {
                    $scope.alerts.push(
                        {type: 'danger',
                         msg: 'List Trusts Failed with status ' + status + '.'});

                });


            }



            $scope.myData.list_projects = function(item, event) {

                var response_promise;
                var base_url = BASE_URL
                switch($scope.auth_method){
                case "kerberos":
                    base_url = KERBEROS_URL
                }

                request_url = base_url + "/users/" +  $scope.token.user.id +"/projects"

                var config = {
                    headers:  {
                        'X-Auth-Token': $scope.token_id,
                        "Content-Type": "application/json"
                    }
                };

                if ($scope.online){
                    response_promise = $http.get(request_url, config);
                }else{
                    response_promise = $http.get("sampledata/list_projects.json");
                }

                response_promise.success(function(data, status, headers, config) {
                    project_data = data.projects;
                    $scope.projects = project_data;
                });
                response_promise.error(function(data, status, headers, config) {
                    $scope.alerts.push(
                        {type: 'danger',
                         msg: 'List Projects Failed with status ' + status + '.'});

                });


            }

        } );
