


window.onload = function(){
  let welcome = document.getElementById("welcomeview");
  let profileview = document.getElementById("profileview");
  // accessToken skapas när vi har loggat in
  if (window.localStorage.accessToken == null) {
    displayView(welcomeview);
  }
 if(window.localStorage.accessToken != null)
   {
    let last_active_tab = window.localStorage.last_active_tab;
    displayView(profileview);
    openTab(event, last_active_tab);
    WriteInfo();
    ShowMessages();
        console.log("1asdasdasd4")
  }
  else{

      displayView(welcomeview);
  }
};

socket_connection = function(){
    socket = new WebSocket("ws://127.0.0.1:5000/api");

    socket.onmessage = function(event){
	   //  serv_message = JSON.parse(event.data);
          console.log("onMessage")
	        window.localStorage.removeItem("accessToken");
	        window.localStorage.removeItem("last_active_tab");
          displayView(welcomeview);
          console.log("onClose");
          socket.close();
          window.onload();

    }

    socket.onopen = function(event){
	     console.log("onOpen");
	     let data = {
	        token: window.localStorage.accessToken
	     }
	     socket.send(JSON.stringify(data));
           console.log("1rror2")
     }

     socket.onclose = function(event){
       window.localStorage.removeItem("accessToken");
       window.localStorage.removeItem("last_active_tab");
       displayView(welcomeview);
       console.log("onClose");

     }

};

displayView = function(view){
let showView = document.getElementById("view");
  showView.innerHTML = view.innerHTML;
};


function openTab(Eevent, tab){
  tabActive = document.getElementsByClassName("tabActive");
  for (i = 0; i < tabActive.length; i++) {
    tabActive[i].style.display = "none";
  }

  document.getElementById(tab).style.display = "block";
  window.localStorage.last_active_tab = tab;

};


WriteInfo = function(){
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
  if(this.readyState == 4 && this.status == 200) {
      let userObject = JSON.parse(this.responseText);
    document.getElementById("HomEmail").innerHTML = userObject.data.email;
    document.getElementById("HomName").innerHTML = userObject.data.firstname;
    document.getElementById("HomFamily").innerHTML = userObject.data.lastname;
    document.getElementById("HomGender").innerHTML = userObject.data.gender;
    document.getElementById("HomCity").innerHTML = userObject.data.city;
    document.getElementById("HomCountry").innerHTML = userObject.data.country;
    return true;
  }
};
  xhttp.open('GET', '/getuserdatabytoken', true);
  xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhttp.setRequestHeader('token', window.localStorage.accessToken);
  xhttp.send();
};


ShowMessages = function(){
  let resultMessage = " ";
  xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
	if(this.readyState == 4 && this.status == 200) {
	    let Recieve_data = JSON.parse(this.responseText);
	    for(i=Recieve_data.data.length-1; i>0; --i){
		resultMessage += Recieve_data.data[i].writer + ': ' + Recieve_data.data[i].content + '<br>';
    }
    document.getElementById("writingWall").innerHTML = resultMessage;
    console.log("rresult ---");
    return true;
  }
  };
  xhttp.open('GET', '/getusermessagesbytoken', true);
  xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhttp.setRequestHeader('token', window.localStorage.accessToken);
  xhttp.send();
  };


signup = function(){
  let SigninForm = {
    email: document.getElementById("SigninEmail").value,
    password: document.getElementById("SigninPassword1").value,
    repeatPSW: document.getElementById("SigninPassword2").value,
    firstname: document.getElementById("SigninName").value,
    lastname: document.getElementById("SigninFamilyname").value,
    gender: document.getElementById("SigninGender").value,
    city: document.getElementById("city").value,
    country: document.getElementById("country").value
  }

    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      res = JSON.parse(this.responseText);
      document.getElementById("ErrorId2").innerHTML = res.message;
  }
    };
    xhttp.open('POST', '/signup', true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(JSON.stringify(SigninForm));
    return false;
};




confirmPSW = function(){
  let SigninPassword1 = document.getElementById("SigninPassword1").value;
  let SigninPassword2 = document.getElementById("SigninPassword2").value;
  if(SigninPassword1 == SigninPassword2){
    document.getElementById("ErrorId2").innerHTML = "pass the same!";
    return true;
  }
  else{
    document.getElementById("ErrorId2").innerHTML = "pass not the same!";
    return false;
  }
};


// Login knapp
LogIn = function(){
  let userform = {
   email: document.getElementById("LoginEmail").value,
   password: document.getElementById("LoginPassword").value
   }

   xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
      console.log("efterreadystate")
	    res = JSON.parse(this.responseText);
	    if (res.success == true) {
		window.localStorage.accessToken = res.data;
    socket_connection();
    displayView(profileview);
    openTab(event, 'Home');
    WriteInfo();
    console.log("eftershowmesss1")
    ShowMessages();
        console.log("eftershowmesss1")
    }
    else
     {
       console.log("elsesatsen")
        let errorDiv = document.getElementById("ErrorId1");
        errorDiv.innerHTML = res.message;
    }
}
};

    xhttp.open('POST', '/signin', true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(JSON.stringify(userform));

    return false;
};


signout = function(){
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200) {
	    res = JSON.parse(this.responseText);
	    if (res.success == true)  {
		window.localStorage.removeItem("accessToken");
		displayView(welcomeview);
		document.getElementById("ErrorId2").innerHTML = res.message;
	    }
	}
    };
    xhttp.open('POST', '/signout', true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.setRequestHeader('token', window.localStorage.accessToken);
    xhttp.send();
    return false;
};


displaySearchData = function(){
    let searchEmail = document.getElementById("emailSearch").value;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
	    let userObject = JSON.parse(this.responseText)
	    if(userObject.success){
    document.getElementById("browseEmail").innerHTML = userObject.data.email;
    document.getElementById("browseName").innerHTML = userObject.data.firstname;
    document.getElementById("browseName2").innerHTML = userObject.data.firstname + "'s Twidder wall:";
    document.getElementById("browseFamily").innerHTML = userObject.data.lastname;
    document.getElementById("browseGender").innerHTML = userObject.data.gender;
    document.getElementById("browseCity").innerHTML = userObject.data.city;
    document.getElementById("browseCountry").innerHTML = userObject.data.country;
    browseClass = document.getElementsByClassName("browseClass");
 		for (i = 0; i < browseClass.length; i++) {
 		    browseClass[i].style.display = "block";
 		}
    document.getElementById("ErrorId5").innerHTML = " ";

 		return true;
 	    } else{
        for (i = 0; i < browseClass.length; i++) {
     		    browseClass[i].style.display = "None";
     		}
          document.getElementById("ErrorId5").innerHTML = "User doesn't exist";

 		return false;
 	    }
 	}
     };
     xhttp.open('GET', '/getuserdatabyemail/' + searchEmail, true);
     xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
     xhttp.setRequestHeader('token', window.localStorage.accessToken);
     xhttp.send();
     ShowSearchMessages();
 };


ShowSearchMessages = function(){
    let ResultMess = " ";
    let searchEmail = document.getElementById("emailSearch").value;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
	    let Recieve_data = JSON.parse(this.responseText);
	    for(i=Recieve_data.data.length-1; i>0; --i){
		ResultMess += Recieve_data.data[i].writer + ': ' + Recieve_data.data[i].content + '<br>';
	    }
	    document.getElementById("S_writingWall").innerHTML = ResultMess;
	    return true;
	}
    };
    xhttp.open('GET', '/getusermessagesbyemail/' + searchEmail, true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.setRequestHeader('token', window.localStorage.accessToken);
    xhttp.send();
};

post_message_my = function(){
  xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
	    let Recieve_data = JSON.parse(this.responseText);
	    if(Recieve_data.success){
        let token = window.localStorage.accessToken;
        let searchEmail = document.getElementById("emailSearch").value;
        ShowMessages(token)
        WriteInfo();
		return true;
	    } else {
		return false;
	    }
	}
    };
    let mess = {
	content: document.getElementById("usermessage").value,
	toEmail: null
    }
    xhttp.open('POST', '/postmessage', true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.setRequestHeader('token', window.localStorage.accessToken);
    xhttp.send(JSON.stringify(mess));
};




refreshWall = function(){
  let token = window.localStorage.accessToken;
  let searchEmail = document.getElementById("emailSearch").value;
  ShowMessages(token);
  WriteInfo();
  };


post_message_searched = function(){
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
	    let res = JSON.parse(this.responseText);
	    if(res.success){
        let token = window.localStorage.accessToken;
        let searchEmail = document.getElementById("emailSearch").value;
        ShowSearchMessages();

		return true;
	    } else{
		return false;
	    }
	}
    };
    let emailRep = document.getElementById("emailSearch").value;
    let mess = {
	content: document.getElementById("message").value,
	toEmail: emailRep
    }
    xhttp.open('POST', '/postmessage', true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.setRequestHeader('token', window.localStorage.accessToken);
    xhttp.send(JSON.stringify(mess));
};



refresh_search_Wall = function(){
      let token = window.localStorage.accessToken;
      let searchEmail = document.getElementById("emailSearch").value;
      ShowSearchMessages();
  };



changepassword = function(){
    let data = {
	oldPassword: document.getElementById("accountPassword").value,
	newPassword: document.getElementById("newPSW").value,
	confPassword: document.getElementById("confPSW").value
    }
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
	    var res = JSON.parse(this.responseText);
	    if(res.success){
		document.getElementById("changePass").innerHTML = res.message;
		return true;
	    } else{
		document.getElementById("changePass").innerHTML = res.message;
		return false;
	    }
	}
    };
    xhttp.open('Put', '/changepassword', true);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.setRequestHeader('token', window.localStorage.accessToken);
    xhttp.send(JSON.stringify(data));
};
