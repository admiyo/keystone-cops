var auth_url = "/keystone/main/v3"
var keystone_endpoint = null
var project_data = null
var token_data = null
var token_id = null

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
                "name": "Default"
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



function add_project(element, index, array) {
     $( "#project_select").append($('<option>').append(element.name));
}

function list_projects(){
    request_url = auth_url + "/users/" +  token_data.user.id +"/projects"

    $.ajax( {
        url: request_url,
        dataType: "json",
        method:"get",
        headers:{ "Content-Type": "application/json",
                  "X-Auth-Token": token_id
                },
        success: function(data, textStatus, request){
            $("#project_select > option").remove()
            project_data = data
            project_data.projects.forEach(add_project)
            $('input:checkbox#scoped').prop('checked', true);
        }

    });
}


function display_token_data(){
    $("#current_username").text(token_data.user.name )
    $("#current_userid").text(token_data.user.id )

    if(token_data.hasOwnProperty('project')){
        $("div#token_scope").text("project name = " + token_data.project.name)
    }else{
        $("div#token_scope").text("Unscoped")
    }

    $("ol#token_role_list > li").remove()
    if(token_data.hasOwnProperty('roles')){
        token_data.roles.forEach(function (element, index, array){
            $("ol#token_role_list").append($("<li>").append(element.name))
        })
    }

    $("ol#service_list > li").remove()
    if(token_data.hasOwnProperty('catalog')){
        token_data.catalog.forEach(function (service, index, array){
            li = $("ol#service_list").append($("<li>").append(service.name))
            service.endpoints.forEach(function (endpoint, index, array){
                dd = li.append($("<dl>"))
                dd.append($("<dt>")).append("id")
                dd.append($("<dd>")).append(endpoint.id)
                dd.append($("<dt>")).append("url")
                dd.append($("<dd>")).append(endpoint.url)
                dd.append($("<dt>")).append("region")
                dd.append($("<dd>")).append(endpoint.region)
                dd.append($("<dt>")).append("interface")
                dd.append($("<dd>")).append(endpoint.interface)
                if ((service.name == "keystone") &&
                    (endpoint.interface == "admin")){
                    keystone_endpoint = endpoint.url + "/v3"
                    $("div#keystone_url").text(keystone_endpoint)
                }
            })
        })
    }
}

function submit_token_request(){

    var token_request  = jQuery.extend(true, {}, unscoped_token_request_body);

    auth_method = $('input[name=auth_method]:checked').val()


    token_request.auth.identity.methods.push(auth_method)

    if (auth_method == "password"){
        token_request.auth.identity['password'] =
            jQuery.extend(true, {}, password_method_data)
        username = $("input#username").val()
        password = $("input#password").val()
        token_request.auth.identity.password.user.name = username
        token_request.auth.identity.password.user.password = password
    }

    if (auth_method == "token"){
        token_request.auth.identity['token'] =
            jQuery.extend(true, {}, token_method_data)
        token_request.auth.identity.token.id = token_id
    }

    scoped = $('input:checkbox#scoped').is(':checked')

    if (scoped){
        token_request.auth['scope'] =
            jQuery.extend(true, {}, project_scoped_section)
        token_request.auth.scope.project.name =
            $( "#project_select  option:selected").val()
    }

    $.ajax( {
        url: auth_url + "/auth/tokens",
        data: JSON.stringify(token_request),
        dataType: "json",
        method:"post",
        headers:{ "Content-Type": "application/json"},
        success: function(data, textStatus, request){
            token_id = request.getResponseHeader('X-Subject-Token');
            token_data = data.token
            display_token_data()
        },
        error: function(data, textStatus, request){
            alert("request token  failed")
        }

    });
};

function add_role(element, index, array) {
    $("ol#global_role_list").append($('<li>').append(element.name));
}

function list_roles(){
    request_url = keystone_endpoint + "/roles"

      $.ajax( {
      url: request_url,
      dataType: "json",
      method:"get",
      headers:{ "Content-Type": "application/json",
                "X-Auth-Token": token_id
              },
      success: function(data, textStatus, request){
          $("ol#global_role_list > ls").remove()
          data.roles.forEach(function (role, index, array){
               $("ol#global_role_list").
                  append($("<li>").
                         append(role.id + ":" +role.name ))
          })
      },

      error: function(data, textStatus, request){
          alert("list roles failed")
      }


      });
}

function add_role(){

    create_role_request = {
        "role": {
            "name": ""
        }
    }
    request_url = keystone_endpoint + "/roles"

    role_name = $("input#role_name").val()

    create_role_request.role.name = role_name

    $.ajax( {
        url: request_url,
        dataType: "json",
        data: JSON.stringify(create_role_request),
        method:"post",
        headers:{ "Content-Type": "application/json",
                  "X-Auth-Token": token_id
                },
        success: function(data, textStatus, request){
            list_roles()
        },

        error: function(data, textStatus, request){
            alert("create role failed")
        }


    });

}
