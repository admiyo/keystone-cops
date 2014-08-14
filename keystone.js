var main_auth_url = "/keystone/main/v3";
var kerberos_auth_url = "/keystone/krb/v3";
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


function add_project(project, index, array) {
     $( "#project_select").append($('<option>').append(project.name));
     $( "#assign_project_select").append($('<option>',{value: project.id}).append(project.name));

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
            $("#assign_project_select > option").remove()


            project_data = data
            project_data.projects.forEach(add_project)
            $('input:checkbox#scoped').prop('checked', true);
        }

    });
}


function display_token_data(){
    $("#current_username").text(token_data.user.name )
    $("#current_userid").text(token_data.user.id )

    $("#current_user_domain_name").text(token_data.user.domain.name )
    $("#current_user_domain_id").text(token_data.user.domain.id )


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
            inner = $("<ol>")
            service.endpoints.forEach(function (endpoint, index, array){
                dd = $("<dl>")
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
                inner.append($("<li>").append(dd))
            })
            $("ol#service_list").
                append($("<li>").
                       append(service.name).
                       append(inner))
        })
    }
}

function submit_token_request(){

    var token_request  = jQuery.extend(true, {}, unscoped_token_request_body);

    auth_method = $('input[name=auth_method]:checked').val()


    use_kerberos = $('input:checkbox#kerberos').is(':checked')
    if (use_kerberos){
        auth_url=kerberos_auth_url;
        token_request.auth.identity.methods.push("kerberos")
        token_request.auth.identity['kerberos'] = {}
    }else{
        auth_url=main_auth_url
        if (auth_method == "password"){
            token_request.auth.identity.methods.push("password")
            token_request.auth.identity['password'] =
                jQuery.extend(true, {}, password_method_data)
            username = $("input#username").val()
            password = $("input#password").val()
            user_domain_name = $("input#user_domain_name").val()
            token_request.auth.identity.password.user.domain.name = user_domain_name
            token_request.auth.identity.password.user.name = username
            token_request.auth.identity.password.user.password = password
        }
    }
    if (auth_method == "token"){
        token_request.auth.identity.methods.push("token")
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


function assign_role() {
    user_id=$("input#assign_user_id").val()
    role_id=$("select#role_select").val()
    project_id=$("select#assign_project_select").val()
    
    request_url = keystone_endpoint + "/projects/" +
        project_id+
        "/users/"+
        user_id+
        "/roles/"+
        role_id

    alert(request_url)

    $.ajax( {
      url: request_url,
      dataType: "json",
      method:"put",
      headers:{ "Content-Type": "application/json",
                "X-Auth-Token": token_id
              },
      success: function(data, textStatus, request){
          alert("roles assignment succeeded")
      },

      error: function(data, textStatus, request){
          alert("roles assignment  failed")
      }


      });



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
          $("ol#global_role_list > li").remove()
          $("select#role_select > option").remove()

          data.roles.forEach(function (role, index, array){
               $("ol#global_role_list").
                  append($("<li>").
                         append(role.id + ":" +role.name ))

              $("select#role_select").
                  append($("<option>",{value: role.id}).
                          append(role.name))

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


function list_domains(){
    request_url = auth_url + "/domains/"
    $.ajax( {
	url: request_url,
        dataType: "json",
        method:"get",
	headers:{ "Content-Type": "application/json",
                  "X-Auth-Token": token_id
                },
        success: function(data, textStatus, request){
            $("ol#domain_list > li").remove()
            data.domains.forEach(function (domain, index, array){
               $("ol#domain_list").
                  append($("<li>").
                         append(domain.id + ":" +
                                domain.name + ":" +
                                domain.description ))
          })

        }

    });
}


function create_domain(){

    create_domain_request = {
	"domain": {
            "name": "",
            "description":""
        }
    }
    request_url = keystone_endpoint + "/domains"

    domain_name = $("input#new_domain_name").val()
    domain_description = $("input#new_domain_description").val()

    create_domain_request.domain.name =  domain_name
    create_domain_request.domain.description =  domain_description

    $.ajax( {
        url: request_url,
        dataType: "json",
	data: JSON.stringify(create_domain_request),
	method:"post",
        headers:{ "Content-Type": "application/json",
                  "X-Auth-Token": token_id
                },
	success: function(data, textStatus, request){
            list_domains()
	},

	error: function(data, textStatus, request){
            alert("create domain failed")
        }
    });
}

