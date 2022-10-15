var signInData = {
}



function signIn() {
   signInData.email = document.getElementById("signInEmail").value;
   signInData.password = document.getElementById("signInPassword").value;
   if(signInData.email == ""){
      document.getElementById("signInEmail").focus();
   }
   else if(signInData.password == ""){
      document.getElementById("signInPassword").focus();
   }


   fetch("/api/user/login", {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(signInData)
   })
   .then(res => res.json())
   .then(res => {
      console.log(res);
      if(res!=null){
         if(res.firstName != null){
            localStorage.setItem("user", JSON.stringify(res));
            window.location.href = "/home";
         }
         else {
            document.getElementById("signInmessage").style.color = "red";
            document.getElementById("signInmessage").style.padding = "0.5vh 0.5vw";
            document.getElementById("signInmessage").style.border = "0.2vw solid #008037";
            document.getElementById("signInmessage").innerHTML = res.message;
            setTimeout(() => {document.getElementById("signInmessage").innerHTML = "";
                             document.getElementById("signInmessage").style.border = "none";
                      }, 12000);
         }
      }
   })
}
