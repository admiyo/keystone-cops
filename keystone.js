

var project_data = null
var token_data = null
var token_id = null 
var project_scoped_section = 
    {
	"scope": {
            "project": {
		"domain": {
                    "name": "Default"
		},
		"name": "demo"
            }
	}
    };


var unscoped_token_request_body = 
    {
	"auth": {
	    "identity": {
		"methods": [
		    "password"
		],
		"password": {
		    "user": {
			"domain": {
			    "name": "Default"
			},
			"name": "",
			"password": ""
		    }
		}
	    },
	}
    };




function submit_token_request(){
      username = $("#username").val()
      password = $("#password").val()

      unscoped_token_request_body.auth.identity.password.user.name = username
      unscoped_token_request_body.auth.identity.password.user.password = password

      $.ajax( {
      url:"https://ayoungf20packstack.cloudlab.freeipa.org/keystone/main/v3/auth/tokens", 
      data: JSON.stringify(unscoped_token_request_body),
      dataType: "json",
      method:"post",
      headers:{ "Content-Type": "application/json"},
      success: function(data, textStatus, request){
        token_id = request.getResponseHeader('X-Subject-Token');
        token_data = data.token
        $( "#current_username" ).text(data.token.user.name )
        $( "#current_userid" ).text(data.token.user.id )
      }
      });
};


function get_project_roles(event) {
    alert('project_id')
}


function add_project(element, index, array) {

     $( "#project_list").append(
	 $('<li>').append(
        $('<a>').
		 attr('href','#').
		 attr('class','projects').
		 attr('id',element.name).
		 append(
            $('<span>').attr('class', 'tab').append(element.name)
	)));    

     $( "#project_select").append($('<option>').append(element.name));    
}

function list_projects(){
    request_url = "https://ayoungf20packstack.cloudlab.freeipa.org/keystone/main/v3/users/" +  token_data.user.id +"/projects"

      $.ajax( {
      url: request_url, 
      dataType: "json",
      method:"get",
      headers:{ "Content-Type": "application/json",
		"X-Auth-Token": token_id
	      },
      success: function(data, textStatus, request){
	  project_data = data
	  project_data.projects.forEach(add_project)
	  $("a.projects").click(get_project_roles)
      }

      });

}

