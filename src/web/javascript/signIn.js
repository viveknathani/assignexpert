var signInData = {
}

let showPasssword = true;

function togglePassword(){
   const eyeIcon = document.getElementById("eyeIcon");
   const password = document.getElementById("signInPassword");
   if(showPasssword){
      console.log("showPasswordtrue");
      password.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
      showPasssword = false;
   }
   else {
      console.log("showPasswordtrue");
      password.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
      showPasssword = true;
   }
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

   document.body.style.cursor = "wait";
   const inputs = document.getElementsByTagName("INPUT");
   for(let i=0; i<inputs.length; i++) {
      inputs[i].style.cursor = "wait";
   }

   const buttons = document.getElementsByTagName("BUTTON");
   for(let i=0; i<buttons.length; i++) {
      buttons[i].style.cursor = "wait";
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
      if(res!=null){
         document.body.style.cursor = "default";
         for(let i=0; i<inputs.length; i++) {
            inputs[i].style.cursor = "default";
         }
         for(let i=0; i<buttons.length; i++) {
            buttons[i].style.cursor = "default";
         }
         
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
